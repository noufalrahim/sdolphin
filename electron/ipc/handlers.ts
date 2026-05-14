import { ipcMain, BrowserWindow, dialog } from 'electron';
import { SshSession, SshConfig } from '../services/sshSession';
import fs from 'node:fs/promises';

const sessions: Map<string, SshSession> = new Map();

export function registerIpcHandlers() {
  ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'PEM Keys', extensions: ['pem', 'key'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (canceled) return null;
    
    const content = await fs.readFile(filePaths[0], 'utf8');
    return { path: filePaths[0], content };
  });

  ipcMain.handle('dialog:saveFile', async (_, defaultName: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: defaultName,
    });
    return canceled ? null : filePath;
  });

  ipcMain.handle('dialog:openFileForUpload', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
    });
    return canceled ? null : filePaths;
  });

  ipcMain.handle('ssh:connect', async (event, config: SshConfig) => {
    const id = `${config.host}:${config.port}:${config.username}`;
    const session = new SshSession(id, config);
    
    try {
      await session.connect();
      const homePath = await session.sftp.realPath('.');
      sessions.set(id, session);
      
      session.on('terminal-closed', (terminalId) => {
        event.sender.send('ssh:terminal:closed', terminalId);
      });

      return { success: true, id, homePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('ssh:disconnect', async (_, connectionId: string) => {
    const session = sessions.get(connectionId);
    if (session) {
      await session.disconnect();
      sessions.delete(connectionId);
      return { success: true };
    }
    return { success: false, error: 'Session not found' };
  });

  // SFTP Handlers
  ipcMain.handle('sftp:list', async (_, connectionId: string, path: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.list(path);
  });

  ipcMain.handle('sftp:download', async (_, connectionId: string, remotePath: string, localPath: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.download(remotePath, localPath);
  });

  ipcMain.handle('sftp:upload', async (_, connectionId: string, localPath: string, remotePath: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.upload(localPath, remotePath);
  });

  ipcMain.handle('sftp:delete', async (_, connectionId: string, path: string, isDir: boolean) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.delete(path, isDir);
  });

  ipcMain.handle('sftp:mkdir', async (_, connectionId: string, path: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.mkdir(path);
  });

  ipcMain.handle('sftp:rename', async (_, connectionId: string, oldPath: string, newPath: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.rename(oldPath, newPath);
  });

  ipcMain.handle('sftp:read', async (_, connectionId: string, path: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.read(path);
  });

  ipcMain.handle('sftp:write', async (_, connectionId: string, path: string, content: string) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    return session.write(path, content);
  });

  // Terminal Handlers
  ipcMain.handle('ssh:terminal:spawn', async (event, connectionId: string, options: { cols: number; rows: number }) => {
    const session = sessions.get(connectionId);
    if (!session) throw new Error('Session not found');
    
    return session.spawnShell(options, (data) => {
      event.sender.send('ssh:terminal:data', connectionId, data);
    });
  });

  ipcMain.on('ssh:terminal:write', (_, connectionId: string, terminalId: string, data: string) => {
    const session = sessions.get(connectionId);
    if (session) {
      session.writeToTerminal(terminalId, data);
    }
  });

  ipcMain.on('ssh:terminal:resize', (_, connectionId: string, terminalId: string, options: { cols: number; rows: number }) => {
    const session = sessions.get(connectionId);
    if (session) {
      session.resizeTerminal(terminalId, options.cols, options.rows);
    }
  });
}
