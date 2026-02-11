# Privacy Policy

## Multi-Domain Password Manager Chrome Extension

Last Updated: February 10, 2024

### 1. Introduction

This Privacy Policy describes how Multi-Domain Password Manager ("the Extension") collects, uses, and protects your data. We are committed to protecting your privacy and ensuring the security of your personal information.

### 2. Data Collection

#### 2.1 What We Collect

The Extension collects and stores the following information on your device:

- **Passwords**: Encrypted passwords you choose to save for websites
- **Usernames**: Associated usernames for saved passwords
- **Domain Information**: Website domains where passwords are used
- **Usage Data**: Timestamps of when passwords were created, last used, and usage counts
- **Notes and Tags**: Optional notes and tags you add to organize your passwords
- **Settings**: Your extension preferences and configuration

#### 2.2 What We Don't Collect

- We do NOT collect your browsing history
- We do NOT collect your master password
- We do NOT collect any personal identification information
- We do NOT send your data to any external servers
- We do NOT use any third-party analytics or tracking services

### 3. Data Storage

#### 3.1 Local Storage

All your password data is stored locally on your device using Chrome's storage API. The data is encrypted using AES-256-GCM encryption before storage.

#### 3.2 Encryption

- Your passwords are encrypted using the Web Crypto API
- Encryption keys are derived from your master password using PBKDF2 with 100,000 iterations
- Each password entry uses a unique initialization vector (IV)
- Your master password is never stored; only its hash is stored for verification

#### 3.3 Cross-Device Sync

If you choose to enable sync, your encrypted data may be synchronized across your devices using Chrome's built-in sync functionality. The data remains encrypted during transmission and storage.

### 4. Data Usage

#### 4.1 How We Use Your Data

We use your data solely to:

- Auto-fill login forms on websites you visit
- Provide password management functionality
- Sync data across your devices (if enabled)
- Generate and check password strength

#### 4.2 No Third-Party Sharing

We do NOT share your data with any third parties for any purpose. Your data remains under your control at all times.

### 5. Data Security

#### 5.1 Security Measures

We implement multiple layers of security:

- **Zero-Knowledge Architecture**: We cannot access your plaintext passwords
- **Client-Side Encryption**: All encryption happens on your device
- **Secure Key Derivation**: PBKDF2 with high iteration count
- **Random IV Generation**: Unique IV for each encryption operation
- **Secure Storage**: Chrome's encrypted storage API

#### 5.2 Your Responsibilities

To maintain security:

- Choose a strong master password
- Don't share your master password with anyone
- Keep your device secure with a password or biometric lock
- Enable auto-lock for additional protection
- Regularly backup your password data

### 6. Data Access and Control

#### 6.1 Your Rights

You have the right to:

- Access all your stored passwords
- Export your password data
- Delete individual passwords or all data
- Disable sync at any time
- Uninstall the extension

#### 6.2 Data Deletion

To delete all your data:

1. Open the Extension Options page
2. Go to the Backup tab
3. Choose to clear all data
4. Alternatively, uninstall the extension to remove all data

### 7. Third-Party Services

#### 7.1 Chrome Storage API

We use Chrome's storage API to store your encrypted data. Google's privacy policy applies to the storage service.

#### 7.2 No Other Third Parties

We do not use any other third-party services, analytics, or tracking tools.

### 8. Children's Privacy

This Extension is not intended for use by children under the age of 13. We do not knowingly collect personal information from children.

### 9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify users of any material changes by:

- Updating the "Last Updated" date
- Providing notice within the Extension
- Posting updates on our website (if applicable)

### 10. Contact Us

If you have questions about this Privacy Policy or our data practices, please contact us through:

- GitHub Issues: [Project Repository]
- Email: [Contact Email]

### 11. Legal Disclaimer

This Extension is provided "as is" without any warranties. We are not responsible for any data loss or security breaches resulting from:

- Weak master passwords
- Compromised devices
- Phishing attacks
- User negligence

### 12. Open Source Transparency

This Extension is open source. You can review our code at:

[GitHub Repository URL]

Transparency allows you to verify our security practices and data handling procedures.

---

**Last Updated**: February 10, 2024
**Effective Date**: February 10, 2024