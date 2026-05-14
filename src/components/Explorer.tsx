import React, { useState } from 'react';
import { File, Folder, FileText, ImageIcon, FileCode, FileArchive, MoreVertical } from 'lucide-react';
import { useExplorerStore, FileItem } from '../store/explorerStore';
import { useConnectionStore } from '../store/connectionStore';
import FileEditor from './FileEditor';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const FileIcon = ({ type, name }: { type: string; name: string }) => {
  if (type === 'd') return <Folder className="w-4 h-4 text-primary fill-primary/20" />;
  
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext!)) return <ImageIcon className="w-4 h-4 text-emerald-400" />;
  if (['zip', 'tar', 'gz', 'rar'].includes(ext!)) return <FileArchive className="w-4 h-4 text-amber-400" />;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'go', 'rs', 'c', 'cpp'].includes(ext!)) return <FileCode className="w-4 h-4 text-blue-400" />;
  if (['txt', 'md', 'json', 'yaml', 'xml'].includes(ext!)) return <FileText className="w-4 h-4 text-secondary" />;
  
  return <File className="w-4 h-4 text-secondary" />;
};

const Explorer = () => {
  const { files, viewMode, selection, setSelection, currentPath, pushHistory } = useExplorerStore();
  const { currentConnection } = useConnectionStore();
  const [editingFile, setEditingFile] = useState<string | null>(null);

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'd') {
      const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      pushHistory(newPath);
    } else {
      const fullPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
      setEditingFile(fullPath);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewMode === 'grid') {
    return (
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto h-full">
        {files.map((file) => (
          <div 
            key={file.name}
            onClick={() => setSelection([file.name])}
            onDoubleClick={() => handleFileClick(file)}
            className={clsx(
              "group p-4 rounded-lg border flex flex-col items-center text-center gap-2 transition-all cursor-pointer select-none",
              selection.includes(file.name) ? "bg-primary/10 border-primary" : "bg-surface border-border hover:border-secondary"
            )}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              {file.type === 'd' ? (
                <Folder className="w-10 h-10 text-primary fill-primary/10" />
              ) : (
                <FileIcon type={file.type} name={file.name} />
              )}
            </div>
            <span className="text-xs truncate w-full px-2">{file.name}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {editingFile && currentConnection && (
        <FileEditor 
          connectionId={currentConnection.id} 
          path={editingFile} 
          onClose={() => setEditingFile(null)} 
        />
      )}
      <div className="flex items-center px-4 py-2 border-b border-border bg-background/50 text-[10px] font-bold uppercase tracking-widest text-secondary select-none">
        <div className="w-8"></div>
        <div className="flex-1">Name</div>
        <div className="w-32">Size</div>
        <div className="w-48">Date Modified</div>
        <div className="w-24">Permissions</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div 
            key={file.name}
            onClick={() => setSelection([file.name])}
            onDoubleClick={() => handleFileClick(file)}
            className={clsx(
              "flex items-center px-4 py-1.5 border-b border-border/50 text-xs transition-all cursor-pointer select-none group",
              selection.includes(file.name) ? "bg-primary/10" : "hover:bg-white/5"
            )}
          >
            <div className="w-8 flex items-center justify-center">
              <FileIcon type={file.type} name={file.name} />
            </div>
            <div className="flex-1 truncate pr-4">{file.name}</div>
            <div className="w-32 text-secondary">{file.type === 'd' ? '--' : formatSize(file.size)}</div>
            <div className="w-48 text-secondary">{format(new Date(file.modifyTime), 'MMM dd, yyyy HH:mm')}</div>
            <div className="w-24 font-mono text-[10px] text-secondary">
              {file.type === 'd' ? 'd' : '-'}{file.rights.user}{file.rights.group}{file.rights.other}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explorer;
