# Development Guide

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Chrome browser (for development and testing)
- Git (optional, for version control)

### Installation

1. Clone or download the project:
```bash
cd chrome_ex_mp
```

2. Install dependencies:
```bash
npm install
```

3. Generate icons:
   - Open `icon-generator.html` in your browser
   - Click "Generate Icons"
   - Save each icon as `icon16.png`, `icon48.png`, `icon128.png`
   - Place them in `src/icons/` directory

4. Build the extension:
```bash
npm run build
```

5. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder

## Development Workflow

### Development Mode

For development with hot-reloading:
```bash
npm run dev
```

This will:
- Build the extension in development mode
- Watch for file changes
- Rebuild automatically when files change

After each build, reload the extension in `chrome://extensions/` to see changes.

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Linting

Check code quality:
```bash
npm run lint
```

Fix linting issues automatically:
```bash
npm run lint:fix
```

## Project Structure

```
chrome_ex_mp/
├── manifest.json              # Chrome extension manifest (Manifest V3)
├── package.json               # Project dependencies and scripts
├── webpack.config.js          # Webpack build configuration
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest test configuration
├── icon-generator.html        # Tool to generate PNG icons
├── README.md                  # Main documentation
├── DEVELOPMENT.md             # This file
├── src/
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── services/              # Core business logic
│   │   ├── CryptoService.ts   # Encryption/decryption
│   │   ├── StorageService.ts  # Chrome Storage API wrapper
│   │   ├── DomainService.ts   # Domain parsing utilities
│   │   └── PasswordGeneratorService.ts
│   ├── background/            # Background service worker
│   │   └── index.ts
│   ├── content/               # Content scripts (injected into web pages)
│   │   └── index.ts
│   ├── popup/                 # Popup UI (extension icon click)
│   │   ├── popup.html
│   │   └── index.tsx
│   ├── options/               # Options page (full settings UI)
│   │   ├── options.html
│   │   └── index.tsx
│   ├── utils/                 # Utility functions
│   │   ├── PerformanceUtils.ts
│   │   └── ErrorHandler.ts
│   ├── __tests__/             # Test files
│   │   ├── CryptoService.test.ts
│   │   ├── DomainService.test.ts
│   │   ├── PasswordGeneratorService.test.ts
│   │   └── Validator.test.ts
│   └── icons/                 # Extension icons
│       ├── icon.svg
│       ├── icon16.png         # (generated)
│       ├── icon48.png         # (generated)
│       ├── icon128.png        # (generated)
│       ├── generate-icons.js
│       └── README.md
└── dist/                      # Build output (generated)
```

## Architecture Overview

### Components

#### Background Service Worker
- Runs in the background
- Handles extension-wide events
- Manages message passing between components
- Coordinates password save/fill operations

#### Content Script
- Injected into web pages
- Detects password fields
- Auto-fills credentials
- Shows UI prompts for saving passwords

#### Popup
- Quick access interface
- Shows passwords for current site
- Master password unlock
- Quick actions (fill, copy, delete)

#### Options Page
- Full password management interface
- Settings configuration
- Password generator
- Import/export functionality

### Services

#### CryptoService
- AES-256-GCM encryption
- PBKDF2 key derivation
- Password hashing
- UUID generation

#### StorageService
- Chrome Storage API wrapper
- Encrypted data persistence
- Settings management
- Import/export

#### DomainService
- Domain parsing and normalization
- Subdomain extraction
- Domain validation
- Unique key generation

#### PasswordGeneratorService
- Strong password generation
- Password strength checking
- Customizable options

## Adding New Features

### Example: Adding a New Message Type

1. Define the message type in `src/types/index.ts`:
```typescript
export interface MyNewMessage {
  type: 'MY_NEW_MESSAGE';
  payload: MyPayload;
}
```

2. Add handler in `src/background/index.ts`:
```typescript
case 'MY_NEW_MESSAGE':
  return await handleMyNewMessage(message.payload);
```

3. Implement the handler function:
```typescript
async function handleMyNewMessage(payload: MyPayload): Promise<any> {
  // Your logic here
}
```

4. Call from content script or UI:
```typescript
chrome.runtime.sendMessage({
  type: 'MY_NEW_MESSAGE',
  payload: myData,
});
```

### Example: Adding a New UI Component

1. Create component file in `src/popup/` or `src/options/`
2. Import Material-UI components as needed
3. Add state management with React hooks
4. Test the component

## Debugging

### Chrome DevTools

#### Background Script
1. Go to `chrome://extensions/`
2. Find "Multi-Domain Password Manager"
3. Click "Service worker" link
4. DevTools will open for the background script

#### Content Script
1. Open any web page
2. Right-click and select "Inspect"
3. In DevTools, go to "Sources" tab
4. Find the content script under "Content scripts"

#### Popup/Options
1. Right-click on the popup or open options page
2. Select "Inspect"
3. DevTools will open for that page

### Console Logging

The extension uses `console.log`, `console.error`, etc. for debugging. Check the appropriate DevTools console based on which component you're debugging.

### Performance Monitoring

Use the built-in `PerformanceMonitor` class:
```typescript
import { PerformanceMonitor } from './utils/PerformanceUtils';

PerformanceMonitor.startMeasure('operation-name');
// ... do work ...
const duration = PerformanceMonitor.endMeasure('operation-name');
console.log(`Operation took ${duration}ms`);
```

## Testing

### Writing Tests

Tests are located in `src/__tests__/`. Use Jest for unit testing:

```typescript
describe('MyService', () => {
  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = myService.doSomething(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Common Issues

### Extension Not Loading

- Check `chrome://extensions/` for errors
- Ensure all required files are in `dist/`
- Verify `manifest.json` is valid JSON
- Check that icons exist in correct sizes

### Content Script Not Injecting

- Verify URL patterns in manifest.json
- Check browser console for errors
- Ensure content script is built and in `dist/`

### Storage Issues

- Check Chrome storage quota
- Verify encryption/decryption is working
- Check for storage errors in background script console

### Build Errors

- Clear `dist/` folder: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Best Practices

### Security
- Never log plaintext passwords
- Always use CryptoService for encryption
- Validate all user input
- Keep dependencies updated

### Performance
- Use caching where appropriate
- Debounce/throttle expensive operations
- Minimize DOM manipulation
- Use Web Workers for heavy computations

### Code Quality
- Write tests for new features
- Follow TypeScript best practices
- Use ESLint to catch issues
- Write clear, descriptive comments

### User Experience
- Provide clear error messages
- Show loading states for async operations
- Make UI responsive and accessible
- Test on different screen sizes

## Release Checklist

Before releasing a new version:

1. [ ] Update version in `manifest.json`
2. [ ] Update version in `package.json`
3. [ ] Run all tests: `npm test`
4. [ ] Run linter: `npm run lint`
5. [ ] Build production version: `npm run build`
6. [ ] Test the built extension thoroughly
7. [ ] Update CHANGELOG.md
8. [ ] Create release notes
9. [ ] Tag the release in git
10. [ ] Upload to Chrome Web Store

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Material-UI Documentation](https://mui.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues, questions, or contributions, please refer to the main README.md or open an issue on the project repository.