import { app, BrowserWindow } from "electron";
import path from "node:path";

console.log(path.join(import.meta.url.substring(8), "preload.js"));

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.url.substring(8), "preload.js"),
    },
  });

  win.loadFile("./app/index.html");
};

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    console.log("window-all-closed");
    app.quit();
  }
});
