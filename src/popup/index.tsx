import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline, Box, Container, Typography, Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Alert, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Lock, LockOpen, Visibility, VisibilityOff, Delete, Add, Settings, Key, ContentCopy, Warning } from '@mui/icons-material';
import { PasswordEntry } from '../types';
import { DomainService } from '../services/DomainService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4285f4',
    },
  },
  typography: {
    fontSize: 14,
  },
});

interface AppState {
  masterPasswordVerified: boolean;
  masterPasswordSet: boolean;
  currentUrl: string;
  currentDomain: string;
  passwords: PasswordEntry[];
  loading: boolean;
  error: string | null;
  masterPassword: string;
  showPassword: { [key: string]: boolean };
  showErrorDialog: boolean;
  errorMessage: string;
}

function App() {
  const [state, setState] = useState<AppState>({
    masterPasswordVerified: false,
    masterPasswordSet: false,
    currentUrl: '',
    currentDomain: '',
    passwords: [],
    loading: false,
    error: null,
    masterPassword: '',
    showPassword: {},
    showErrorDialog: false,
    errorMessage: '',
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab && tab.url) {
        const currentUrl = tab.url;
        const currentDomain = DomainService.extractDomain(currentUrl);
        setState(prev => ({ ...prev, currentUrl, currentDomain }));
      }

      const isSet = await chrome.runtime.sendMessage({ type: 'IS_MASTER_PASSWORD_SET' });
      const isVerified = await chrome.runtime.sendMessage({ type: 'IS_MASTER_PASSWORD_VERIFIED' });
      
      setState(prev => ({
        ...prev,
        masterPasswordSet: isSet,
        masterPasswordVerified: isVerified,
      }));

      if (isVerified) {
        await loadPasswords();
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to initialize app' }));
    }
  };

  const loadPasswords = async () => {
    if (!state.currentDomain) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PASSWORDS_BY_DOMAIN',
        payload: { domain: state.currentDomain },
      });
      
      if (response && response.error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          showErrorDialog: true,
          errorMessage: response.error 
        }));
      } else {
        setState(prev => ({ ...prev, passwords: response || [], loading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load passwords' }));
    }
  };

  const handleMasterPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.masterPassword) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'VERIFY_MASTER_PASSWORD',
        payload: state.masterPassword,
      });
      
      if (response && response.error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          showErrorDialog: true,
          errorMessage: response.error 
        }));
      } else if (response && response.isValid) {
        setState(prev => ({ ...prev, masterPasswordVerified: true, loading: false }));
        await loadPasswords();
      } else {
        setState(prev => ({ ...prev, loading: false, error: 'Invalid master password' }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to verify master password' }));
    }
  };

  const handleSetMasterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.masterPassword) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SET_MASTER_PASSWORD',
        payload: state.masterPassword,
      });
      
      if (response && response.error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          showErrorDialog: true,
          errorMessage: response.error 
        }));
      } else {
        setState(prev => ({ ...prev, masterPasswordSet: true, masterPasswordVerified: true, loading: false }));
        await loadPasswords();
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to set master password' }));
    }
  };

  const handleFillPassword = async (password: PasswordEntry) => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'FILL_PASSWORD',
          payload: password,
        });
        window.close();
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to fill password' }));
    }
  };

  const handleDeletePassword = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'DELETE_PASSWORD',
        payload: id,
      });
      
      if (response && response.error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          showErrorDialog: true,
          errorMessage: response.error 
        }));
      } else {
        await loadPasswords();
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to delete password' }));
    }
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
  };

  const togglePasswordVisibility = (id: string) => {
    setState(prev => ({
      ...prev,
      showPassword: {
        ...prev.showPassword,
        [id]: !prev.showPassword[id],
      },
    }));
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const closeErrorDialog = () => {
    setState(prev => ({ ...prev, showErrorDialog: false, errorMessage: '' }));
  };

  if (!state.masterPasswordSet) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Key sx={{ mr: 1 }} />
            <Typography variant="h6">Setup Master Password</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Create a master password to secure your stored passwords.
          </Typography>
          <form onSubmit={handleSetMasterPassword}>
            <TextField
              fullWidth
              type="password"
              label="Master Password"
              value={state.masterPassword}
              onChange={(e) => setState(prev => ({ ...prev, masterPassword: e.target.value }))}
              sx={{ mb: 2 }}
              autoFocus
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={state.loading || !state.masterPassword}
              startIcon={state.loading ? <CircularProgress size={20} /> : <Lock />}
            >
              Set Master Password
            </Button>
          </form>
          {state.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {state.error}
            </Alert>
          )}
        </Container>
      </ThemeProvider>
    );
  }

  if (!state.masterPasswordVerified) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Lock sx={{ mr: 1 }} />
            <Typography variant="h6">Unlock</Typography>
          </Box>
          <form onSubmit={handleMasterPasswordSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Master Password"
              value={state.masterPassword}
              onChange={(e) => setState(prev => ({ ...prev, masterPassword: e.target.value }))}
              sx={{ mb: 2 }}
              autoFocus
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={state.loading || !state.masterPassword}
              startIcon={state.loading ? <CircularProgress size={20} /> : <LockOpen />}
            >
              Unlock
            </Button>
          </form>
          {state.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {state.error}
            </Alert>
          )}
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 2, minWidth: 350 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Key sx={{ mr: 1 }} />
            <Typography variant="h6">Passwords</Typography>
          </Box>
          <IconButton onClick={openOptions} size="small">
            <Settings />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={state.currentDomain || 'No domain detected'}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {state.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : state.passwords.length === 0 ? (
          <Alert severity="info">
            暂无此域名的密码记录。请登录该网站以保存密码。
            No passwords saved for this domain. Log in to a site to save your password.
          </Alert>
        ) : (
          <List>
            {state.passwords.map((password) => (
              <React.Fragment key={password.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyPassword(password.password)}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => togglePasswordVisibility(password.id)}
                      >
                        {state.showPassword[password.id] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePassword(password.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2">{password.username}</Typography>
                        {password.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {state.showPassword[password.id] ? password.password : '••••••••'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last used: {new Date(password.lastUsed).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Add Password
          </Button>
        </Box>

        {state.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {state.error}
          </Alert>
        )}
      </Container>

      <Dialog open={state.showErrorDialog} onClose={closeErrorDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            <Typography>Notice</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>{state.errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorDialog} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);