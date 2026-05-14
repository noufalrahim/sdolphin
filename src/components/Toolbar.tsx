import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Grid, List, Search, Plus, Upload, Download, Home } from 'lucide-react';
import { useExplorerStore } from '../store/explorerStore';
import { useConnectionStore } from '../store/connectionStore';

interface ToolbarProps {
  onRefresh: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onRefresh }) => {
  const { currentConnection } = useConnectionStore();
  const { 
    currentPath, 
    homePath,
    selection,
    setCurrentPath, 
    viewMode, 
    setViewMode, 
    navigateBack, 
    navigateForward,
    pushHistory
  } = useExplorerStore();

  const handleDownload = async () => {
    if (!currentConnection || selection.length === 0) return;
    const fileName = selection[0];
    const remotePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
    
    try {
      const localPath = await (window as any).sshApi.saveFileDialog(fileName);
      if (localPath) {
        await (window as any).sshApi.downloadFile(currentConnection.id, remotePath, localPath);
        alert('Download complete!');
      }
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    if (!currentConnection) return;
    
    try {
      const filePaths = await (window as any).sshApi.openUploadDialog();
      if (filePaths && filePaths.length > 0) {
        for (const localPath of filePaths) {
          const fileName = localPath.split('/').pop() || 'uploaded_file';
          const remotePath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`;
          await (window as any).sshApi.uploadFile(currentConnection.id, localPath, remotePath);
        }
        onRefresh();
        alert('Upload complete!');
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  const handlePathChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      pushHistory(e.currentTarget.value);
    }
  };

  return (
    <div className="h-12 bg-surface border-b border-border flex items-center px-4 gap-4 no-drag">
      <div className="flex items-center gap-1">
        <button 
          onClick={navigateBack}
          className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button 
          onClick={navigateForward}
          className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button 
          onClick={onRefresh}
          className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex items-center bg-background border border-border rounded-md px-2 py-1 gap-2 focus-within:border-primary transition-colors">
        <button 
          onClick={() => pushHistory(homePath)}
          className="p-0.5 hover:bg-surface rounded transition-colors"
          title="Go to Home"
        >
          <Home className="w-3.5 h-3.5 text-secondary hover:text-primary" />
        </button>
        <input 
          className="flex-1 bg-transparent border-none text-xs outline-none"
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          onKeyDown={handlePathChange}
        />
      </div>

      <div className="flex items-center gap-2 border-l border-border pl-4">
        <div className="flex bg-background border border-border rounded-md p-1">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-white'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-white'}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors" title="New File">
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={handleUpload}
            className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors" 
            title="Upload"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload}
            disabled={selection.length === 0}
            className="p-1.5 hover:bg-background rounded-md text-secondary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-secondary" />
          <input 
            placeholder="Search..."
            className="w-32 bg-background border border-border rounded-md pl-8 pr-2 py-1 text-xs outline-none focus:border-primary transition-all focus:w-48"
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
