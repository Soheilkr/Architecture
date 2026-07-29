const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  selectFolder: () => ipcRenderer.invoke('select-screenshot-folder'),
  takeScreenshot: (monitorIndex = 0) => ipcRenderer.invoke('take-screenshot', monitorIndex),
  saveScreenshot: (dataUrl, folderPath, filename) => ipcRenderer.invoke('save-screenshot', { dataUrl, folderPath, filename })
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded successfully.');
});
