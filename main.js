// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const XLSX = require('xlsx');

// function createWindow() {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'renderer.js'),
//       contextIsolation: false,
//       enableRemoteModule: true,
//       nodeIntegration: true,
//     },
//   });

//   win.loadFile('index.html');
// }

// app.whenReady().then(createWindow);

// ipcMain.handle('load-base-data', (event, baseName) => {
//   const filePath = path.join(__dirname, 'bases', `${baseName}.xlsx`);
//   const workbook = XLSX.readFile(filePath);
//   const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//   return XLSX.utils.sheet_to_json(worksheet);
// });

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });


const { app, ipcMain, shell } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  // Defina a URL para o arquivo HTML
  const url = `file://${path.join(__dirname, 'index.html')}`;
  // Abre o arquivo HTML no navegador padrão
  shell.openExternal(url);
  
  // Opcional: fecha a aplicação quando todas as janelas forem fechadas
  app.quit();
});

ipcMain.handle('load-base-data', (event, baseName) => {
  const filePath = path.join(__dirname, 'bases', `${baseName}.xlsx`);
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
