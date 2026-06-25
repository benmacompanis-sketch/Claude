// main.js — proceso principal de Electron: crea la ventana del juego.
const { app, BrowserWindow, Menu, globalShortcut } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#05050a",
    title: "Portador de Luz",
    fullscreenable: true,
    autoHideMenuBar: true, // sin barra de menú: se siente como juego, no como app
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Quitar el menú nativo por completo.
  Menu.setApplicationMenu(null);

  win.loadFile(path.join(__dirname, "..", "index.html"));

  // F11 alterna pantalla completa; Escape sale de fullscreen.
  win.webContents.on("before-input-event", (_e, input) => {
    if (input.type === "keyDown" && input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
    }
    if (input.type === "keyDown" && input.key === "Escape" && win.isFullScreen()) {
      win.setFullScreen(false);
    }
  });

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
