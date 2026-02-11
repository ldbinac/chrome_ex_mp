import { PasswordEntry } from '../types';
import { DomainService } from '../services/DomainService';

let passwordFields: HTMLInputElement[] = [];
let usernameFields: HTMLInputElement[] = [];
let observer: MutationObserver | null = null;
let isPageValid = true;

function detectPasswordFields(): void {
  passwordFields = Array.from(document.querySelectorAll('input[type="password"]')) as HTMLInputElement[];
  // 如果passwordFields为空，则从所有的input元素中筛选出password字段
  if (passwordFields.length === 0) {
    passwordFields = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'))
      .filter((input): input is HTMLInputElement => {
        const elem = input as HTMLInputElement;
        const name = elem.name.toLowerCase();
        const id = elem.id.toLowerCase();
        const placeholder = (elem.placeholder || '').toLowerCase();
        return name.includes('password') || id.includes('password') || placeholder.includes('password') || placeholder.includes('密码');
      });
  } 

  usernameFields = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'))
    .filter((input): input is HTMLInputElement => {
      const elem = input as HTMLInputElement;
      const name = elem.name.toLowerCase();
      const id = elem.id.toLowerCase();
      const placeholder = (elem.placeholder || '').toLowerCase();
      return name.includes('user') || name.includes('email') || name.includes('login') ||
             id.includes('user') || id.includes('email') || id.includes('login') ||
             placeholder.includes('user') || placeholder.includes('email') || placeholder.includes('login') || 
             placeholder.includes('用户名') || placeholder.includes('用户') || placeholder.includes('账号');
    });

  if (passwordFields.length > 0 && isPageValid) {
    notifyBackground();
  }
}

function notifyBackground(): void {
  if (!isPageValid) return;  
  chrome.runtime.sendMessage({
    type: 'PASSWORD_FIELDS_DETECTED',
    payload: {
      url: window.location.href,
      passwordFieldsCount: passwordFields.length,
      usernameFieldsCount: usernameFields.length,
    },
  }).catch(() => {});
}

function fillPassword(passwordEntry: PasswordEntry): void {
  if (!isPageValid) return;

  if (usernameFields.length > 0) {
    usernameFields[0].value = passwordEntry.username;
    usernameFields[0].dispatchEvent(new Event('input', { bubbles: true }));
    usernameFields[0].dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (passwordFields.length > 0) {
    passwordFields[0].value = passwordEntry.password;
    passwordFields[0].dispatchEvent(new Event('input', { bubbles: true }));
    passwordFields[0].dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function showPasswordSelector(passwords: PasswordEntry[]): void {
  if (!isPageValid) return;

  const existingSelector = document.getElementById('password-selector-container');
  if (existingSelector !== null) {
    existingSelector.remove();
  }

  const container = document.createElement('div');
  container.id = 'password-selector-container';
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2147483647;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    padding: 20px;
    max-width: 360px;
    width: 80%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const title = document.createElement('div');
  title.textContent = 'Select Account';
  title.style.cssText = `
    font-weight: bold;
    margin-bottom: 12px;
    font-size: 14px;
  `;
  container.appendChild(title);

  passwords.forEach((password) => {
    const button = document.createElement('button');
    button.textContent = password.username;
    button.style.cssText = `
      display: block;
      width: 100%;
      padding: 8px 12px;
      margin-bottom: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
    `;
    button.onmouseover = () => button.style.background = '#f5f5f5';
    button.onmouseout = () => button.style.background = 'white';
    button.onclick = () => {
      fillPassword(password);
      container.remove();
    };
    container.appendChild(button);
  });

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 16px;
    color: #666;
  `;
  closeButton.onclick = () => container.remove();
  container.appendChild(closeButton);

  document.body.appendChild(container);

  setTimeout(() => {
    if (isPageValid && document.body.contains(container)) {
      container.remove();
    }
  }, 10000);
}

function showSavePrompt(username: string, password: string): void {
  if (!isPageValid) return;

  const existingPrompt = document.getElementById('save-password-prompt');
  if (existingPrompt !== null) {
    existingPrompt.remove();
  }

  const prompt = document.createElement('div');
  prompt.id = 'save-password-prompt';
  prompt.style.cssText = `
    position: fixed;
    bottom: 30%;
    left: 50%;
    z-index: 2147483647;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    padding: 16px;
    max-width: 360px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const message = document.createElement('div');
  message.textContent = `Save password for ${username}@${window.location.hostname}?`;
  message.style.cssText = `
    margin-bottom: 12px;
    font-size: 14px;
  `;
  prompt.appendChild(message);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `;

  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.style.cssText = `
    padding: 8px 16px;
    background: #4285f4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  `;
  saveButton.onclick = async () => {
    if (!isPageValid) return;
    
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_PASSWORD_FROM_PAGE',
        payload: {
          domain: DomainService.extractDomain(window.location.href),
          fullUrl: DomainService.extractFullUrl(window.location.href),
          username,
          password,
        },
      });
      prompt.remove();
      showSaveSuccessNotification();
    } catch (error) {
      console.error('Failed to save password:', error);
      prompt.remove();
    }
  };

  const neverButton = document.createElement('button');
  neverButton.textContent = 'Never for this site';
  neverButton.style.cssText = `
    padding: 8px 16px;
    background: white;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  `;
  neverButton.onclick = () => prompt.remove();

  const notNowButton = document.createElement('button');
  notNowButton.textContent = 'Not now';
  notNowButton.style.cssText = `
    padding: 8px 16px;
    background: white;
    color: #666;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  `;
  notNowButton.onclick = () => prompt.remove();

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(neverButton);
  buttonContainer.appendChild(notNowButton);
  prompt.appendChild(buttonContainer);

  document.body.appendChild(prompt);

  setTimeout(() => {
    if (isPageValid && document.body.contains(prompt)) {
      prompt.remove();
    }
  }, 30000);
}

function showSaveSuccessNotification(): void {
  if (!isPageValid) return;

  const existingNotification = document.getElementById('save-success-notification');
  if (existingNotification !== null) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'save-success-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 16px 24px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideDown 0.3s ease-out;
  `;

  const icon = document.createElement('div');
  icon.textContent = '✓';
  icon.style.cssText = `
    font-size: 20px;
    font-weight: bold;
  `;
  notification.appendChild(icon);

  const message = document.createElement('div');
  message.textContent = '密码保存成功！';
  message.style.cssText = `
    font-size: 14px;
    font-weight: 500;
  `;
  notification.appendChild(message);

  document.body.appendChild(notification);

  setTimeout(() => {
    if (isPageValid && document.body.contains(notification)) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

function showNoPasswordHint(payload: any): void {
  if (!isPageValid) return;

  const existingHint = document.getElementById('no-password-hint');
  if (existingHint !== null) {
    existingHint.remove();
  }

  const hint = document.createElement('div');
  hint.id = 'no-password-hint';
  hint.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background: #fff3e0;
    border: 1px solid #ff9800;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    padding: 16px 20px;
    max-width: 400px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
  `;

  const icon = document.createElement('div');
  icon.textContent = '💡';
  icon.style.cssText = `
    font-size: 24px;
    margin-bottom: 12px;
  `;
  hint.appendChild(icon);

  const message = document.createElement('div');
  message.textContent = payload.message;
  message.style.cssText = `
    font-size: 14px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 16px;
  `;
  hint.appendChild(message);

  const steps = document.createElement('div');
  steps.style.cssText = `
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  `;
  steps.innerHTML = `
    <div style="margin-bottom: 8px;">📝 <strong>步骤 1：</strong> 在登录表单中输入用户名和密码</div>
    <div style="margin-bottom: 8px;">💾 <strong>步骤 2：</strong> 点击登录按钮</div>
    <div style="margin-bottom: 8px;">🖱️ <strong>步骤 3：</strong> 登录成功后，扩展会提示保存密码</div>
    <div style="margin-bottom: 8px;">✅ <strong>步骤 4：</strong> 点击"保存"按钮</div>
    <div>🔄 <strong>步骤 5：</strong> 下次访问时，右键点击密码输入框即可填充</div>
  `;
  hint.appendChild(steps);

  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
  `;
  closeButton.onmouseover = () => closeButton.style.background = '#f5f5f5';
  closeButton.onmouseout = () => closeButton.style.background = 'none';
  closeButton.onclick = () => hint.remove();
  hint.appendChild(closeButton);

  document.body.appendChild(hint);

  const autoHideDelay = payload.autoHideDelay || 5000;
  setTimeout(() => {
    if (isPageValid && document.body.contains(hint)) {
      hint.style.opacity = '0';
      hint.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(hint)) {
          hint.remove();
        }
      }, 300);
    }
  }, autoHideDelay);
}

function observeDOMChanges(): void {
  if (observer !== null) {
    observer.disconnect();
  }

  observer = new MutationObserver(() => {
    if (isPageValid) {
      detectPasswordFields();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isPageValid) {
    sendResponse({ success: false, error: 'Extension context invalidated' });
    return;
  }

  switch (message.type) {
    case 'FILL_PASSWORD':
      fillPassword(message.payload);
      sendResponse({ success: true });
      break;

    case 'SHOW_PASSWORD_SELECTOR':
      showPasswordSelector(message.payload);
      sendResponse({ success: true });
      break;

    case 'REQUEST_PASSWORD_SAVE':
      if (usernameFields.length > 0 && passwordFields.length > 0) {
        showSavePrompt(usernameFields[0].value, passwordFields[0].value);
      } else {
        showNoPasswordHint({
          message: '未检测到密码输入框。请先在页面上输入用户名和密码，然后右键点击"Save Password"。',
          autoHideDelay: 5000,
        });
      }
      sendResponse({ success: true });
      break;

    case 'SHOW_NO_PASSWORD_HINT':
      showNoPasswordHint(message.payload);
      sendResponse({ success: true });
      break;

    case 'PASSWORDS_AVAILABLE':
      console.log('Passwords available for this site:', message.payload.length);
      break;

    default:
      break;
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    detectPasswordFields();
    observeDOMChanges();
  });
} else {
  detectPasswordFields();
  observeDOMChanges();
}

document.addEventListener('submit', (event) => {
  if (!isPageValid) return;

  const form = event.target as HTMLFormElement;
  if (!form) return;

  const formPasswordFields = form.querySelectorAll('input[type="password"]');
  const formUsernameFields = form.querySelectorAll('input[type="text"], input[type="email"]');

  if (formPasswordFields.length > 0 && formUsernameFields.length > 0) {
    const password = (formPasswordFields[0] as HTMLInputElement).value;
    const username = (formUsernameFields[0] as HTMLInputElement).value;

    if (password && username) {
      setTimeout(() => {
        if (isPageValid) {
          showSavePrompt(username, password);
        }
      }, 500);
    }
  }
});

window.addEventListener('unload', () => {
  isPageValid = false;
  if (observer !== null) {
    observer.disconnect();
  }
});

window.addEventListener('beforeunload', () => {
  isPageValid = false;
});