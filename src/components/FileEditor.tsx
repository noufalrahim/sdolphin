import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Save, X } from 'lucide-react';

interface FileEditorProps {
  connectionId: string;
  path: string;
  onClose: () => void;
}

const FileEditor: React.FC<FileEditorProps> = ({ connectionId, path, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      try {
        const data = await (window as any).sshApi.readFile(connectionId, path);
        setContent(data);
      } catch (err) {
        console.error('Failed to read file:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFile();
  }, [connectionId, path]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await (window as any).sshApi.writeFile(connectionId, path, content);
      setModified(false);
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setSaving(false);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      json: 'json',
      md: 'markdown',
      html: 'html',
      css: 'css',
      sh: 'shell',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return map[ext!] || 'plaintext';
  };

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      <div className="h-10 border-b border-border bg-surface px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary truncate max-w-md">{path}</span>
          {modified && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving || !modified}
            className="flex items-center gap-1.5 px-2 py-1 bg-primary hover:bg-blue-600 disabled:bg-primary/50 text-white rounded text-[10px] font-medium transition-all"
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <Editor
            height="100%"
            theme="vs-dark"
            language={getLanguage(path)}
            value={content}
            onChange={(value) => {
              setContent(value || '');
              setModified(true);
            }}
            options={{
              minimap: { enabled: true },
              fontSize: 13,
              fontFamily: 'JetBrains Mono',
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FileEditor;
