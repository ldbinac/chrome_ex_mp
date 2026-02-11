import { Message, PasswordEntry, PasswordSaveRequest } from '../types';
import { StorageService } from '../services/StorageService';
import { DomainService } from '../services/DomainService';
import { CryptoService } from '../services/CryptoService';

let masterPassword: string | null = 'admin';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Multi-Domain Password Manager installed');
  
  await chrome.contextMenus.create({
    id: 'fill-password',
    title: 'Fill Password',
    contexts: ['editable'],
  });

  await chrome.contextMenus.create({
    id: 'save-password',
    title: 'Save Password',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'fill-password') {
    await handleFillPassword(tab.id);
  } else if (info.menuItemId === 'save-password') {
    await handleSavePassword(tab.id);
  }
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse);
  return true;
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    await checkForPasswords(tab.url);
  }
});

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0 && details.url) {
    await checkForPasswords(details.url);
  }
});

async function handleMessage(message: Message, sender: any): Promise<any> {
  switch (message.type) {
    case 'GET_PASSWORDS':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.getPasswords(masterPassword);

    case 'ADD_PASSWORD':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.addPassword(message.payload, masterPassword);

    case 'UPDATE_PASSWORD':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.updatePassword(message.payload, masterPassword);

    case 'DELETE_PASSWORD':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.deletePassword(message.payload, masterPassword);

    case 'GET_PASSWORDS_BY_DOMAIN':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.getPasswordByDomain(message.payload.domain, masterPassword);

    case 'SET_MASTER_PASSWORD':
      await StorageService.setMasterPassword(message.payload);
      masterPassword = message.payload;
      return { success: true };

    case 'VERIFY_MASTER_PASSWORD':
      const isValid = await StorageService.verifyMasterPassword(message.payload);
      if (isValid) {
        masterPassword = message.payload;
        await StorageService.setMasterPasswordVerified(true);
      }
      return { isValid };

    case 'IS_MASTER_PASSWORD_SET':
      return await StorageService.isMasterPasswordSet();

    case 'IS_MASTER_PASSWORD_VERIFIED':
      return await StorageService.isMasterPasswordVerified();

    case 'GET_SETTINGS':
      return await StorageService.getSettings();

    case 'SAVE_SETTINGS':
      return await StorageService.saveSettings(message.payload);

    case 'GENERATE_PASSWORD':
      const { length, options } = message.payload;
      return await generatePassword(length, options);

    case 'CHECK_PASSWORD_STRENGTH':
      return await checkPasswordStrength(message.payload);

    case 'EXPORT_DATA':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.exportData(masterPassword);

    case 'IMPORT_DATA':
      if (!masterPassword) {
        return { error: 'Please set your master password first' };
      }
      return await StorageService.importData(message.payload, masterPassword);

    case 'CLEAR_ALL_DATA':
      return await StorageService.clearAllData();

    case 'FILL_PASSWORD':
      return await handleFillPasswordRequest(message.payload);

    case 'SAVE_PASSWORD_FROM_PAGE':
      return await handleSavePasswordRequest(message.payload);

    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}

async function handleFillPassword(tabId: number): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  const domain = DomainService.extractDomain(tab.url);
  const passwords = await StorageService.getPasswordByDomain(domain, masterPassword || '');
  
  if (passwords.length === 0) {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_NO_PASSWORD_HINT',
      payload: {
        message: '当前站点没有保存密码，请先输入密码，右键点击保存',
      domain: domain,
      url: tab.url,
      showSaveButton: true,
      showRightClickHint: true,
      autoHide: true,
      autoHideDelay: 5000,
    },
    });
    return;
  }

  if (passwords.length === 1) {
    await chrome.tabs.sendMessage(tabId, {
      type: 'FILL_PASSWORD',
      payload: passwords[0],
    });
  } else {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_PASSWORD_SELECTOR',
      payload: passwords,
    });
  }
}

async function handleSavePassword(tabId: number): Promise<void> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return;

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'REQUEST_PASSWORD_SAVE',
      payload: { url: tab.url },
    });
  } catch (error) {
    console.error('Failed to send save password request:', error);
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_NO_PASSWORD_HINT',
      payload: {
        message: '无法发送保存密码请求。请确保页面已完全加载，并且包含密码输入框。',
        autoHideDelay: 5000,
      },
    }).catch(() => {});
  }
}

async function checkForPasswords(url: string): Promise<void> {
  if (!masterPassword) return;

  const domain = DomainService.extractDomain(url);
  const passwords = await StorageService.getPasswordByDomain(domain, masterPassword);

  if (passwords.length > 0) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id) {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'PASSWORDS_AVAILABLE',
        payload: passwords,
      }).catch(() => {});
    }
  }
}

async function handleFillPasswordRequest(request: { domain: string; username: string }): Promise<PasswordEntry | null> {
  if (!masterPassword) {
    return null;
  }

  const password = await StorageService.getPasswordByDomainAndUsername(
    request.domain,
    request.username,
    masterPassword
  );

  if (password) {
    password.lastUsed = Date.now();
    password.useCount += 1;
    await StorageService.updatePassword(password, masterPassword);
  }

  return password || null;
}

async function handleSavePasswordRequest(request: PasswordSaveRequest): Promise<void> {
  if (!masterPassword) {
    return;
  }

  const existingPassword = await StorageService.getPasswordByDomainAndUsername(
    request.domain,
    request.username,
    masterPassword
  );

  if (existingPassword) {
    existingPassword.password = request.password;
    existingPassword.lastUsed = Date.now();
    await StorageService.updatePassword(existingPassword, masterPassword);
  } else {
    const newPassword: PasswordEntry = {
      id: CryptoService.generateUUID(),
      domain: request.domain,
      fullUrl: request.fullUrl,
      username: request.username,
      password: request.password,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 1,
      notes: '',
      tags: [],
    };
    await StorageService.addPassword(newPassword, masterPassword);
  }
}

async function generatePassword(length: number, options: any): Promise<string> {
  const { PasswordGeneratorService } = await import('../services/PasswordGeneratorService');
  return PasswordGeneratorService.generate(length, options);
}

async function checkPasswordStrength(password: string): Promise<any> {
  const { PasswordGeneratorService } = await import('../services/PasswordGeneratorService');
  return PasswordGeneratorService.checkStrength(password);
}