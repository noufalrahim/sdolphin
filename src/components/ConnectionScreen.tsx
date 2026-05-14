import React, { useState } from 'react';
import { Server, Shield, Key, ChevronRight, Trash2, Github, FileUp } from 'lucide-react';
import { useConnectionStore } from '../store/connectionStore';
import { useExplorerStore } from '../store/explorerStore';
import { clsx } from 'clsx';
import logo from '../assets/logo.png';

const ConnectionScreen = () => {
  const { connections, setCurrentConnection, addConnection, removeConnection } = useConnectionStore();
  const { setCurrentPath, setHomePath, pushHistory } = useExplorerStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    password: '',
    authMethod: 'password' as 'password' | 'key',
    privateKey: '',
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await (window as any).sshApi.connect({
        ...formData,
        port: parseInt(formData.port),
      });

      if (result.success) {
        const connection = {
          id: result.id,
          name: formData.name || formData.host,
          host: formData.host,
          port: parseInt(formData.port),
          username: formData.username,
        };
        addConnection(connection);
        setCurrentConnection(connection);
        if (result.homePath) {
          setHomePath(result.homePath);
          setCurrentPath(result.homePath);
          pushHistory(result.homePath);
        }
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await (window as any).sshApi.selectFile();
      if (result) {
        setFormData({ ...formData, privateKey: result.content });
      }
    } catch (err) {
      console.error('Failed to select file:', err);
    }
  };

  const connectToExisting = async (conn: any) => {
    // For simplicity, we assume we need to re-enter password for existing if not saved
    // In a real app, we'd use a secure vault
    setFormData({
      ...formData,
      name: conn.name || '',
      host: conn.host,
      port: conn.port.toString(),
      username: conn.username,
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="mb-12 flex flex-col items-center">
        <img src={logo} alt="SDolphin" className="w-24 h-24 mb-4 object-contain" />
        <h1 className="text-4xl font-bold tracking-tight text-white">SDolphin</h1>
        <p className="text-secondary mt-2">Modern SSH File Manager</p>
      </div>
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Recent Connections */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            Recent Connections
          </h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {connections.length === 0 && (
              <div className="p-4 border border-dashed border-border rounded-lg text-secondary text-sm text-center">
                No recent connections
              </div>
            )}
            {connections.map((conn) => (
              <div 
                key={conn.id}
                onClick={() => connectToExisting(conn)}
                className="group p-3 bg-surface border border-border rounded-lg hover:border-primary transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center">
                    <Server className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{conn.name || conn.host}</div>
                    <div className="text-xs text-secondary">{conn.username}@{conn.host}</div>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeConnection(conn.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Form */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6">New Connection</h2>
            
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-secondary uppercase tracking-wider">Host / IP</label>
                  <input 
                    required
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 192.168.1.1"
                    value={formData.host}
                    onChange={e => setFormData({...formData, host: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-secondary uppercase tracking-wider">Port</label>
                  <input 
                    required
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="22"
                    value={formData.port}
                    onChange={e => setFormData({...formData, port: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-secondary uppercase tracking-wider">Username</label>
                <input 
                  required
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="root"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>

              <div className="flex gap-4 mb-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, authMethod: 'password'})}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-all",
                    formData.authMethod === 'password' ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-secondary hover:border-secondary"
                  )}
                >
                  <Shield className="w-3 h-3" /> Password
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, authMethod: 'key'})}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border transition-all",
                    formData.authMethod === 'key' ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-secondary hover:border-secondary"
                  )}
                >
                  <Key className="w-3 h-3" /> SSH Key
                </button>
              </div>

              {formData.authMethod === 'password' ? (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                  <label className="text-xs font-medium text-secondary uppercase tracking-wider">Password</label>
                  <input 
                    type="password"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wider">Private Key (PEM)</label>
                    <button 
                      type="button"
                      onClick={handleSelectFile}
                      className="text-[10px] flex items-center gap-1.5 px-2 py-1 bg-surface border border-border hover:border-primary text-secondary hover:text-primary rounded transition-all"
                    >
                      <FileUp className="w-3 h-3" /> Select PEM File
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="-----BEGIN RSA PRIVATE KEY-----"
                    value={formData.privateKey}
                    onChange={e => setFormData({...formData, privateKey: e.target.value})}
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-xs">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-600 disabled:bg-primary/50 text-white font-semibold py-2 rounded-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Connect <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionScreen;
