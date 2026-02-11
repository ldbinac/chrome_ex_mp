import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider, CssBaseline, Container, Typography, Tabs, Tab, Box, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Chip, Divider, Switch, FormControlLabel, AppBar, Toolbar, Fab, InputAdornment } from '@mui/material';
import { Lock, LockOpen, Visibility, VisibilityOff, Delete, Edit, Add, Search, ContentCopy, Key, Settings, Security, Backup, Save } from '@mui/icons-material';
import { PasswordEntry, ExtensionSettings } from '../types';
import { PasswordGeneratorService } from '../services/PasswordGeneratorService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4285f4',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface AppState {
  tabValue: number;
  passwords: PasswordEntry[];
  filteredPasswords: PasswordEntry[];
  settings: ExtensionSettings;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  showPasswordDialog: boolean;
  editingPassword: PasswordEntry | null;
  newPassword: Partial<PasswordEntry>;
  showPassword: { [key: string]: boolean };
  showSettingsDialog: boolean;
  showExportDialog: boolean;
  exportData: string;
  showImportDialog: boolean;
  importData: string;
  generatedPassword: string;
  showGeneratorDialog: boolean;
  generatorOptions: {
    length: number;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
  };
}

function App() {
  const [state, setState] = useState<AppState>({
    tabValue: 0,
    passwords: [],
    filteredPasswords: [],
    settings: {
      masterPasswordHash: '',
      autoFillEnabled: true,
      autoLockTimeout: 300,
      biometricEnabled: false,
      theme: 'light',
    },
    loading: false,
    error: null,
    searchQuery: '',
    showPasswordDialog: false,
    editingPassword: null,
    newPassword: {
      username: '',
      password: '',
      domain: '',
      fullUrl: '',
      notes: '',
      tags: [],
    },
    showPassword: {},
    showSettingsDialog: false,
    showExportDialog: false,
    exportData: '',
    showImportDialog: false,
    importData: '',
    generatedPassword: '',
    showGeneratorDialog: false,
    generatorOptions: {
      length: 16,
      lowercase: true,
      uppercase: true,
      numbers: true,
      symbols: true,
    },
  });

  useEffect(() => {
    loadPasswords();
    loadSettings();
  }, []);

  useEffect(() => {
    filterPasswords();
  }, [state.passwords, state.searchQuery]);

  const loadPasswords = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const passwords = await chrome.runtime.sendMessage({ type: 'GET_PASSWORDS' });
      setState(prev => ({ ...prev, passwords, filteredPasswords: passwords, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load passwords' }));
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      setState(prev => ({ ...prev, settings }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const filterPasswords = () => {
    const query = state.searchQuery.toLowerCase();
    const filtered = state.passwords.filter(p =>
      p.domain.toLowerCase().includes(query) ||
      p.username.toLowerCase().includes(query) ||
      p.notes.toLowerCase().includes(query) ||
      p.tags.some(tag => tag.toLowerCase().includes(query))
    );
    setState(prev => ({ ...prev, filteredPasswords: filtered }));
  };

  const handleAddPassword = () => {
    setState(prev => ({
      ...prev,
      showPasswordDialog: true,
      editingPassword: null,
      newPassword: {
        username: '',
        password: '',
        domain: '',
        fullUrl: '',
        notes: '',
        tags: [],
      },
    }));
  };

  const handleEditPassword = (password: PasswordEntry) => {
    setState(prev => ({
      ...prev,
      showPasswordDialog: true,
      editingPassword: password,
      newPassword: { ...password },
    }));
  };

  const handleSavePassword = async () => {
    const { editingPassword, newPassword } = state;

    if (!newPassword.username || !newPassword.password || !newPassword.domain) {
      setState(prev => ({ ...prev, error: 'Please fill in all required fields' }));
      return;
    }

    try {
      if (editingPassword) {
        const updatedPassword: PasswordEntry = {
          ...editingPassword,
          ...newPassword,
        } as PasswordEntry;
        await chrome.runtime.sendMessage({
          type: 'UPDATE_PASSWORD',
          payload: updatedPassword,
        });
      } else {
        const { CryptoService } = await import('../services/CryptoService');
        const newEntry: PasswordEntry = {
          id: CryptoService.generateUUID(),
          username: newPassword.username!,
          password: newPassword.password!,
          domain: newPassword.domain!,
          fullUrl: newPassword.fullUrl || newPassword.domain!,
          notes: newPassword.notes || '',
          tags: newPassword.tags || [],
          createdAt: Date.now(),
          lastUsed: Date.now(),
          useCount: 0,
        };
        await chrome.runtime.sendMessage({
          type: 'ADD_PASSWORD',
          payload: newEntry,
        });
      }

      setState(prev => ({
        ...prev,
        showPasswordDialog: false,
        editingPassword: null,
        newPassword: {
          username: '',
          password: '',
          domain: '',
          fullUrl: '',
          notes: '',
          tags: [],
        },
      }));
      await loadPasswords();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to save password' }));
    }
  };

  const handleDeletePassword = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) return;

    try {
      await chrome.runtime.sendMessage({
        type: 'DELETE_PASSWORD',
        payload: id,
      });
      await loadPasswords();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to delete password' }));
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

  const handleSaveSettings = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        payload: state.settings,
      });
      setState(prev => ({ ...prev, showSettingsDialog: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to save settings' }));
    }
  };

  const handleExportData = async () => {
    try {
      const data = await chrome.runtime.sendMessage({ type: 'EXPORT_DATA' });
      setState(prev => ({ ...prev, exportData: JSON.stringify(data, null, 2), showExportDialog: true }));
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to export data' }));
    }
  };

  const handleImportData = async () => {
    try {
      await chrome.runtime.sendMessage({
        type: 'IMPORT_DATA',
        payload: state.importData,
      });
      setState(prev => ({ ...prev, showImportDialog: false, importData: '' }));
      await loadPasswords();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to import data' }));
    }
  };

  const handleGeneratePassword = () => {
    const password = PasswordGeneratorService.generate(
      state.generatorOptions.length,
      state.generatorOptions
    );
    setState(prev => ({ ...prev, generatedPassword: password }));
  };

  const handleUseGeneratedPassword = () => {
    setState(prev => ({
      ...prev,
      newPassword: {
        ...prev.newPassword,
        password: state.generatedPassword,
      },
      showGeneratorDialog: false,
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Key sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            多级域名密码管理器(Multi-Domain Password Manager)
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={state.tabValue} onChange={(e, v) => setState(prev => ({ ...prev, tabValue: v }))}>
            <Tab label="Passwords" />
            <Tab label="Settings" />
            <Tab label="Generator" />
            <Tab label="Backup" />
          </Tabs>
        </Box>

        <TabPanel value={state.tabValue} index={0}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search passwords..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddPassword}
            >
              Add Password
            </Button>
          </Box>

          {state.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : state.filteredPasswords.length === 0 ? (
            <Alert severity="info">
              {state.searchQuery ? 'No passwords match your search.' : 'No passwords saved yet.'}
            </Alert>
          ) : (
            <List>
              {state.filteredPasswords.map((password) => (
                <React.Fragment key={password.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleCopyPassword(password.password)}>
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => togglePasswordVisibility(password.id)}>
                          {state.showPassword[password.id] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditPassword(password)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeletePassword(password.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {password.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @ {password.domain}
                          </Typography>
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
                            Created: {new Date(password.createdAt).toLocaleDateString()} | 
                            Used: {password.useCount} times
                          </Typography>
                          {password.notes && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {password.notes}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>

        <TabPanel value={state.tabValue} index={1}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={state.settings.autoFillEnabled}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, autoFillEnabled: e.target.checked }
                  }))}
                />
              }
              label="Auto-fill passwords"
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Auto-lock timeout (seconds)
              </Typography>
              <TextField
                type="number"
                value={state.settings.autoLockTimeout}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  settings: { ...prev.settings, autoLockTimeout: parseInt(e.target.value) || 300 }
                }))}
                fullWidth
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={state.settings.biometricEnabled}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, biometricEnabled: e.target.checked }
                  }))}
                />
              }
              label="Enable biometric authentication"
              sx={{ mt: 2 }}
            />
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={state.tabValue} index={2}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Password Generator
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Password length: {state.generatorOptions.length}
              </Typography>
              <input
                type="range"
                min="8"
                max="32"
                value={state.generatorOptions.length}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  generatorOptions: { ...prev.generatorOptions, length: parseInt(e.target.value) }
                }))}
                style={{ width: '100%' }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.generatorOptions.lowercase}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      generatorOptions: { ...prev.generatorOptions, lowercase: e.target.checked }
                    }))}
                  />
                }
                label="Lowercase (a-z)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.generatorOptions.uppercase}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      generatorOptions: { ...prev.generatorOptions, uppercase: e.target.checked }
                    }))}
                  />
                }
                label="Uppercase (A-Z)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.generatorOptions.numbers}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      generatorOptions: { ...prev.generatorOptions, numbers: e.target.checked }
                    }))}
                  />
                }
                label="Numbers (0-9)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={state.generatorOptions.symbols}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      generatorOptions: { ...prev.generatorOptions, symbols: e.target.checked }
                    }))}
                  />
                }
                label="Symbols (!@#$%)"
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleGeneratePassword}
              sx={{ mb: 2 }}
            >
              Generate Password
            </Button>
            {state.generatedPassword && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  value={state.generatedPassword}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleCopyPassword(state.generatedPassword)}>
                          <ContentCopy />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ fontFamily: 'monospace', fontSize: 18 }}
                />
                <Box sx={{ mt: 1 }}>
                  {(() => {
                    const strength = PasswordGeneratorService.checkStrength(state.generatedPassword);
                    return (
                      <Alert severity={strength.level === 'strong' ? 'success' : strength.level === 'good' ? 'info' : strength.level === 'fair' ? 'warning' : 'error'}>
                        Password strength: {strength.level}
                      </Alert>
                    );
                  })()}
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={state.tabValue} index={3}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Backup & Restore
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<Backup />}
                onClick={handleExportData}
                sx={{ mr: 2 }}
              >
                Export Data
              </Button>
              <Button
                variant="outlined"
                startIcon={<Backup />}
                onClick={() => setState(prev => ({ ...prev, showImportDialog: true }))}
              >
                Import Data
              </Button>
            </Box>
            <Alert severity="warning">
              Warning: Importing data will overwrite existing passwords. Make sure to backup your data first.
            </Alert>
          </Box>
        </TabPanel>

        {state.error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setState(prev => ({ ...prev, error: null }))}>
            {state.error}
          </Alert>
        )}
      </Container>

      <Dialog open={state.showPasswordDialog} onClose={() => setState(prev => ({ ...prev, showPasswordDialog: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>{state.editingPassword ? 'Edit Password' : 'Add Password'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Domain"
            fullWidth
            value={state.newPassword.domain}
            onChange={(e) => setState(prev => ({
              ...prev,
              newPassword: { ...prev.newPassword, domain: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={state.newPassword.username}
            onChange={(e) => setState(prev => ({
              ...prev,
              newPassword: { ...prev.newPassword, username: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Password"
            fullWidth
            type={state.showPassword['new'] ? 'text' : 'password'}
            value={state.newPassword.password}
            onChange={(e) => setState(prev => ({
              ...prev,
              newPassword: { ...prev.newPassword, password: e.target.value }
            }))}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setState(prev => ({ ...prev, showGeneratorDialog: true }))}>
                    <Key />
                  </IconButton>
                  <IconButton onClick={() => togglePasswordVisibility('new')}>
                    {state.showPassword['new'] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Full URL (optional)"
            fullWidth
            value={state.newPassword.fullUrl}
            onChange={(e) => setState(prev => ({
              ...prev,
              newPassword: { ...prev.newPassword, fullUrl: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Notes (optional)"
            fullWidth
            multiline
            rows={3}
            value={state.newPassword.notes}
            onChange={(e) => setState(prev => ({
              ...prev,
              newPassword: { ...prev.newPassword, notes: e.target.value }
            }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, showPasswordDialog: false }))}>
            Cancel
          </Button>
          <Button onClick={handleSavePassword} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.showGeneratorDialog} onClose={() => setState(prev => ({ ...prev, showGeneratorDialog: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Password</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Password length: {state.generatorOptions.length}
            </Typography>
            <input
              type="range"
              min="8"
              max="32"
              value={state.generatorOptions.length}
              onChange={(e) => setState(prev => ({
                ...prev,
                generatorOptions: { ...prev.generatorOptions, length: parseInt(e.target.value) }
              }))}
              style={{ width: '100%' }}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={state.generatorOptions.lowercase}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  generatorOptions: { ...prev.generatorOptions, lowercase: e.target.checked }
                }))}
              />
            }
            label="Lowercase"
          />
          <FormControlLabel
            control={
              <Switch
                checked={state.generatorOptions.uppercase}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  generatorOptions: { ...prev.generatorOptions, uppercase: e.target.checked }
                }))}
              />
            }
            label="Uppercase"
          />
          <FormControlLabel
            control={
              <Switch
                checked={state.generatorOptions.numbers}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  generatorOptions: { ...prev.generatorOptions, numbers: e.target.checked }
                }))}
              />
            }
            label="Numbers"
          />
          <FormControlLabel
            control={
              <Switch
                checked={state.generatorOptions.symbols}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  generatorOptions: { ...prev.generatorOptions, symbols: e.target.checked }
                }))}
              />
            }
            label="Symbols"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleGeneratePassword}
              fullWidth
            >
              Generate
            </Button>
          </Box>
          {state.generatedPassword && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                value={state.generatedPassword}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ fontFamily: 'monospace', fontSize: 16 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, showGeneratorDialog: false }))}>
            Cancel
          </Button>
          <Button onClick={handleUseGeneratedPassword} variant="contained" disabled={!state.generatedPassword}>
            Use Password
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.showExportDialog} onClose={() => setState(prev => ({ ...prev, showExportDialog: false }))} maxWidth="md" fullWidth>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This data contains sensitive information. Keep it secure and do not share it with others.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={state.exportData}
            InputProps={{
              readOnly: true,
            }}
            sx={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, showExportDialog: false }))}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const blob = new Blob([state.exportData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `password-backup-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={state.showImportDialog} onClose={() => setState(prev => ({ ...prev, showImportDialog: false }))} maxWidth="md" fullWidth>
        <DialogTitle>Import Data</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Importing will overwrite existing passwords. Make sure to backup first.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder="Paste your exported JSON data here..."
            value={state.importData}
            onChange={(e) => setState(prev => ({ ...prev, importData: e.target.value }))}
            sx={{ fontFamily: 'monospace', fontSize: 12 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setState(prev => ({ ...prev, showImportDialog: false }))}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleImportData}
            disabled={!state.importData}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);