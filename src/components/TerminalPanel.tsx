import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useConnectionStore } from '../store/connectionStore';

const TerminalPanel = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { currentConnection } = useConnectionStore();
  const terminalIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !currentConnection) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1d23',
        foreground: '#d4d4d4',
        cursor: '#3b82f6',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Spawn terminal in main process
    (window as any).sshApi.spawnTerminal(currentConnection.id, term.cols, term.rows)
      .then((id: string) => {
        terminalIdRef.current = id;
        
        term.onData(data => {
          (window as any).sshApi.writeTerminal(currentConnection.id, id, data);
        });

        (window as any).sshApi.onTerminalData((connId: string, data: string) => {
          if (connId === currentConnection.id) {
            term.write(data);
          }
        });
      });

    const handleResize = () => {
      fitAddon.fit();
      if (terminalIdRef.current) {
        (window as any).sshApi.resizeTerminal(currentConnection.id, terminalIdRef.current, term.cols, term.rows);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [currentConnection]);

  return (
    <div className="w-full h-full bg-[#1a1d23] p-2 overflow-hidden">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
};

export default TerminalPanel;
