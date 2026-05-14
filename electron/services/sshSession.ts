import { Client } from 'ssh2';
// @ts-ignore
import SftpClient from 'ssh2-sftp-client';
import { EventEmitter } from 'events';

export interface SshConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
}

export class SshSession extends EventEmitter {
  public client: Client;
  public sftp: SftpClient;
  public id: string;
  public config: SshConfig;
  private terminals: Map<string, any> = new Map();

  constructor(id: string, config: SshConfig) {
    super();
    this.id = id;
    this.config = config;
    this.client = new Client();
    this.sftp = new SftpClient();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      let resolved = false;

      const onReady = async () => {
        this.client.removeListener('error', onError);
        try {
          await this.sftp.connect({
            host: this.config.host,
            port: this.config.port,
            username: this.config.username,
            password: this.config.password,
            privateKey: this.config.privateKey,
            passphrase: this.config.passphrase,
            readyTimeout: 40000,
          });
          resolved = true;
          this.emit('connected');
          resolve();
        } catch (err) {
          if (!resolved) reject(err);
        }
      };

      const onError = (err: Error) => {
        this.client.removeListener('ready', onReady);
        this.emit('error', err);
        if (!resolved) reject(err);
      };

      this.client
        .once('ready', onReady)
        .once('error', onError)
        .on('close', () => {
          this.emit('disconnected');
        })
        .connect({
          host: this.config.host,
          port: this.config.port,
          username: this.config.username,
          password: this.config.password,
          privateKey: this.config.privateKey,
          passphrase: this.config.passphrase,
          readyTimeout: 40000,
          keepaliveInterval: 10000,
          keepaliveCountMax: 3,
        });
    });
  }

  async disconnect() {
    await this.sftp.end();
    this.client.end();
    this.terminals.clear();
  }

  // SFTP Methods
  async list(path: string) {
    return this.sftp.list(path);
  }

  async download(remotePath: string, localPath: string) {
    return this.sftp.fastGet(remotePath, localPath);
  }

  async upload(localPath: string, remotePath: string) {
    return this.sftp.fastPut(localPath, remotePath);
  }

  async delete(path: string, isDir: boolean) {
    if (isDir) {
      return this.sftp.rmdir(path, true);
    }
    return this.sftp.delete(path);
  }

  async mkdir(path: string) {
    return this.sftp.mkdir(path, true);
  }

  async rename(oldPath: string, newPath: string) {
    return this.sftp.rename(oldPath, newPath);
  }

  async read(path: string) {
    const buffer = await this.sftp.get(path);
    return buffer.toString('utf8');
  }

  async write(path: string, content: string) {
    return this.sftp.put(Buffer.from(content, 'utf8'), path);
  }

  // Terminal Methods
  spawnShell(options: { cols: number; rows: number }, onData: (data: string) => void) {
    return new Promise((resolve, reject) => {
      this.client.shell(options, (err, stream) => {
        if (err) return reject(err);
        
        const terminalId = Math.random().toString(36).substring(7);
        this.terminals.set(terminalId, stream);

        stream.on('data', (data: Buffer) => {
          onData(data.toString());
        });

        stream.on('close', () => {
          this.terminals.delete(terminalId);
          this.emit('terminal-closed', terminalId);
        });

        resolve(terminalId);
      });
    });
  }

  writeToTerminal(terminalId: string, data: string) {
    const stream = this.terminals.get(terminalId);
    if (stream) {
      stream.write(data);
    }
  }

  resizeTerminal(terminalId: string, cols: number, rows: number) {
    const stream = this.terminals.get(terminalId);
    if (stream) {
      stream.setWindow(rows, cols, 0, 0);
    }
  }
}
