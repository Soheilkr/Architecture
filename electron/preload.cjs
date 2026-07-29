const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  selectFolder: () => ipcRenderer.invoke('select-screenshot-folder'),
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  saveScreenshot: (dataUrl, folderPath, filename) => ipcRenderer.invoke('save-screenshot', { dataUrl, folderPath, filename })
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('Electron preload script loaded successfully.');
});
