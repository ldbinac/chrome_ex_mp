// TextEncoder polyfill
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Crypto API polyfill
if (typeof crypto === 'undefined') {
  global.crypto = {
    getRandomValues: function(array) {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    },
    subtle: {
      importKey: async function(format, keyData, algorithm, extractable, keyUsages) {
        return { format, keyData, algorithm, extractable, keyUsages };
      },
      deriveKey: async function(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) {
        return { algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages };
      },
      encrypt: async function(algorithm, key, data) {
        return Buffer.from('encrypted-data');
      },
      decrypt: async function(algorithm, key, data) {
        return Buffer.from('decrypted-data');
      },
      digest: async function(algorithm, data) {
        return Buffer.from('digest-data');
      }
    }
  };
}

global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
    onInstalled: {
      addListener: jest.fn(),
    },
    getURL: jest.fn(),
    id: 'test-extension-id',
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    get: jest.fn(),
    sendMessage: jest.fn(),
    onActivated: {
      addListener: jest.fn(),
    },
  },
  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },
  webNavigation: {
    onCompleted: {
      addListener: jest.fn(),
    },
  },
};