import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other apts you need here.
  // ...
})

// Specific SSH APIs
contextBridge.exposeInMainWorld('sshApi', {
  connect: (config: any) => ipcRenderer.invoke('ssh:connect', config),
  disconnect: (connectionId: string) => ipcRenderer.invoke('ssh:disconnect', connectionId),
  selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultName: string) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  openUploadDialog: () => ipcRenderer.invoke('dialog:openFileForUpload'),
  
  // File operations
  listDir: (connectionId: string, path: string) => ipcRenderer.invoke('sftp:list', connectionId, path),
  downloadFile: (connectionId: string, remotePath: string, localPath: string) => ipcRenderer.invoke('sftp:download', connectionId, remotePath, localPath),
  uploadFile: (connectionId: string, localPath: string, remotePath: string) => ipcRenderer.invoke('sftp:upload', connectionId, localPath, remotePath),
  deleteFile: (connectionId: string, path: string, isDir: boolean) => ipcRenderer.invoke('sftp:delete', connectionId, path, isDir),
  createDir: (connectionId: string, path: string) => ipcRenderer.invoke('sftp:mkdir', connectionId, path),
  rename: (connectionId: string, oldPath: string, newPath: string) => ipcRenderer.invoke('sftp:rename', connectionId, oldPath, newPath),
  readFile: (connectionId: string, path: string) => ipcRenderer.invoke('sftp:read', connectionId, path),
  writeFile: (connectionId: string, path: string, content: string) => ipcRenderer.invoke('sftp:write', connectionId, path, content),
  
  // Terminal
  spawnTerminal: (connectionId: string, cols: number, rows: number) => ipcRenderer.invoke('ssh:terminal:spawn', connectionId, { cols, rows }),
  writeTerminal: (connectionId: string, terminalId: string, data: string) => ipcRenderer.send('ssh:terminal:write', connectionId, terminalId, data),
  resizeTerminal: (connectionId: string, terminalId: string, cols: number, rows: number) => ipcRenderer.send('ssh:terminal:resize', connectionId, terminalId, { cols, rows }),
  onTerminalData: (callback: (terminalId: string, data: string) => void) => {
    ipcRenderer.on('ssh:terminal:data', (_event, terminalId, data) => callback(terminalId, data))
  }
})
