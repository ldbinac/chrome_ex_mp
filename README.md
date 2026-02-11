# Multi-Domain Password Manager - Chrome Extension

[查看中文版本](./README_CN.md)

A Chrome browser extension designed to solve password management conflicts across multiple subdomains in enterprise testing environments.

## Problem Statement

In enterprise environments with multiple testing systems deployed under different subdomains (e.g., a.abc.com, b.abc.com, c.abc.com), users often use the same username (like "admin") but different passwords across these systems. The browser's default password manager, which uses domain + username as the unique identifier, causes password overwrites and fails to correctly remember independent passwords for each system.

## Solution

This Chrome extension implements a multi-dimensional password storage system that uses the complete domain (including subdomain) + username as the unique identifier, ensuring that passwords for different subdomains are stored separately even when usernames are identical.

## Features

### Core Features
- **Multi-Domain Password Storage**: Stores passwords with full domain awareness (including subdomains)
- **Auto-Fill**: Automatically detects and fills login forms
- **Multi-Account Support**: Handle multiple accounts per domain
- **Search & Filter**: Quickly find passwords by domain, username, or tags
- **Password Generator**: Generate strong, secure passwords

### Security Features
- **AES-256-GCM Encryption**: All passwords are encrypted using Web Crypto API
- **Master Password Protection**: Secure your vault with a master password
- **Zero-Knowledge Architecture**: Extension cannot access plaintext passwords
- **Auto-Lock**: Automatically locks after inactivity
- **Biometric Authentication**: Optional fingerprint/face recognition support

### Management Features
- **Import/Export**: Backup and restore your password vault
- **Cross-Device Sync**: Sync passwords across devices via Chrome Storage
- **Tags & Notes**: Organize passwords with custom tags and notes
- **Usage Tracking**: Track when and how often passwords are used

## Installation

### Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chrome_ex_mp
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Chrome Extension Documentation
For more information on Chrome extension development, visit the [Chrome Extensions Developer Guide](https://developer.chrome.com/docs/extensions/).

### Production Build

```bash
npm run build
```

The built extension will be in the `dist` folder.

## Usage

### First Time Setup

1. Click the extension icon in the browser toolbar
2. Set up a master password to secure your vault
3. Start using the extension

### Saving Passwords

- **Automatic**: When you log in to a site, the extension will prompt to save your password
- **Manual**: Open the Options page and click "Add Password"

### Filling Passwords

- **Automatic**: The extension detects login forms and suggests saved passwords
- **Manual**: Right-click on a password field and select "Fill Password"
- **Popup**: Click the extension icon to see passwords for the current site

### Managing Passwords

- Open the Options page by clicking the extension icon and selecting "Settings"
- Use the search bar to find passwords
- Edit, delete, or copy passwords as needed
- Generate strong passwords with the built-in generator

## Architecture

### Project Structure

```
chrome_ex_mp/
├── manifest.json              # Chrome extension manifest
├── package.json               # Node.js dependencies
├── webpack.config.js          # Webpack build configuration
├── tsconfig.json              # TypeScript configuration
├── src/
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── services/              # Core services
│   │   ├── CryptoService.ts   # Encryption/decryption
│   │   ├── StorageService.ts  # Chrome Storage API wrapper
│   │   ├── DomainService.ts   # Domain parsing utilities
│   │   └── PasswordGeneratorService.ts  # Password generation
│   ├── background/            # Background service worker
│   │   └── index.ts
│   ├── content/               # Content scripts
│   │   └── index.ts
│   ├── popup/                 # Popup UI
│   │   ├── popup.html
│   │   └── index.tsx
│   ├── options/               # Options page UI
│   │   ├── options.html
│   │   └── index.tsx
│   └── icons/                 # Extension icons
└── dist/                      # Build output (generated)
```

### Key Components

#### CryptoService
Handles all encryption and decryption operations using the Web Crypto API:
- AES-256-GCM encryption algorithm
- PBKDF2 key derivation with 100,000 iterations
- Random IV generation for each encryption
- SHA-256 password hashing

#### StorageService
Manages data persistence using Chrome Storage API:
- Encrypted password storage in chrome.storage.local
- Settings management
- Cross-device sync via chrome.storage.sync
- Import/export functionality

For more information on the Chrome Storage API, visit the [Chrome Storage API Documentation](https://developer.chrome.com/docs/extensions/reference/storage/).

#### DomainService
Provides domain parsing and normalization:
- Extracts full domain including subdomain
- Normalizes domain names
- Validates domain format
- Generates unique keys for domain+username combinations

#### Background Service Worker
Handles extension-wide logic:
- Message routing between components
- Context menu management
- Tab navigation monitoring
- Password fill/save coordination

#### Content Script
Injects into web pages to:
- Detect password fields
- Auto-fill credentials
- Show password selector UI
- Prompt to save new passwords

## Security Considerations

### Encryption
- All passwords are encrypted with AES-256-GCM
- Each password entry uses a unique IV
- Master password is never stored, only its hash
- Encryption keys are derived using PBKDF2

### Web Crypto API
For more information on the Web Crypto API used for encryption, visit the [MDN Web Docs - Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

### Data Storage
- Encrypted data stored locally in chrome.storage.local
- No plaintext passwords ever stored
- Master password hash stored separately
- Auto-lock after configurable timeout

### Browser Security
- Follows Chrome Extension security best practices
- Uses Manifest V3
- Content scripts isolated from extension pages
- No remote code execution

## Development

### Available Scripts

```bash
npm run dev      # Development build with watch mode
npm run build    # Production build
npm run test     # Run tests
npm run lint     # Run ESLint
```

### TypeScript Documentation
For more information on TypeScript, visit the [TypeScript Documentation](https://www.typescriptlang.org/docs/).

### Adding New Features

1. Create TypeScript interfaces in `src/types/index.ts`
2. Implement service logic in `src/services/`
3. Add message handlers in `src/background/index.ts`
4. Update UI components in `src/popup/` or `src/options/`
5. Test thoroughly before committing

## Browser Compatibility

- Chrome 90+
- Edge 90+ (Chromium-based)
- Firefox 88+ (with Manifest V3 support)
- Safari 14+ (requires adaptation)

## Limitations

- Chrome Storage Sync has a 100KB limit (use local storage for large vaults)
- Cannot access system-level biometric authentication
- Limited by browser security sandbox
- Content scripts cannot access cross-origin iframes

## Future Enhancements

- [ ] Team sharing capabilities
- [ ] Two-factor authentication integration
- [ ] Password breach monitoring
- [ ] Cloud backup options
- [ ] Mobile app companion
- [ ] Browser autofill API integration

## License

MIT License - See LICENSE file for details

For more information about the MIT License, visit the [MIT License Documentation](https://opensource.org/licenses/MIT).

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Credits

Developed to solve enterprise password management challenges in multi-subdomain testing environments.