import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Explorer from './Explorer';
import TerminalPanel from './TerminalPanel';
import Toolbar from './Toolbar';
import { useConnectionStore } from '../store/connectionStore';
import { useExplorerStore } from '../store/explorerStore';

const MainLayout = () => {
  const { currentConnection } = useConnectionStore();
  const { currentPath, setFiles } = useExplorerStore();
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(300);

  const fetchFiles = async () => {
    if (!currentConnection) return;
    try {
      const files = await (window as any).sshApi.listDir(currentConnection.id, currentPath);
      setFiles(files);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath, currentConnection]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">
      <Toolbar onRefresh={fetchFiles} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <Explorer />
          </div>

          {terminalVisible && (
            <div 
              style={{ height: terminalHeight }}
              className="border-t border-border bg-surface flex flex-col overflow-hidden"
            >
              <div className="h-8 flex items-center justify-between px-4 bg-background/50 border-bottom border-border cursor-ns-resize select-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Terminal</span>
                <button onClick={() => setTerminalVisible(false)} className="text-secondary hover:text-white">
                  <span className="text-xs">×</span>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TerminalPanel />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-6 bg-primary px-3 flex items-center justify-between text-[10px] text-white">
        <div className="flex items-center gap-4">
          <span>SFTP: Connected</span>
          <span>SSH: Connected</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{currentConnection?.username}@{currentConnection?.host}</span>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
