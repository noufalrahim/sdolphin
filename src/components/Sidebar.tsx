import React from 'react';
import { Folder, Star, Clock, Settings, HardDrive, Cpu, Activity } from 'lucide-react';
import { useExplorerStore } from '../store/explorerStore';

const Sidebar = () => {
  const { currentPath, homePath, pushHistory } = useExplorerStore();

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col select-none">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3 flex items-center justify-between">
            Favorites
            <button className="hover:text-white transition-colors">+</button>
          </h3>
          <div className="space-y-1">
            <SidebarItem 
              icon={<Folder className="w-4 h-4" />} 
              label="Home" 
              active={currentPath === homePath} 
              onClick={() => pushHistory(homePath)}
            />
            <SidebarItem 
              icon={<Folder className="w-4 h-4" />} 
              label="Projects" 
              onClick={() => pushHistory(`${homePath}/Projects`)}
            />
            <SidebarItem 
              icon={<Folder className="w-4 h-4" />} 
              label="Configurations" 
              onClick={() => pushHistory(`${homePath}/.config`)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">System</h3>
          <div className="space-y-1">
            <SidebarItem 
              icon={<HardDrive className="w-4 h-4" />} 
              label="Root /" 
              active={currentPath === '/'}
              onClick={() => pushHistory('/')}
            />
            <SidebarItem 
              icon={<Clock className="w-4 h-4" />} 
              label="Recents" 
            />
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-3">Stats</h3>
          <div className="space-y-3 px-1">
            <StatItem label="CPU" value="12%" icon={<Cpu className="w-3.5 h-3.5 text-blue-400" />} />
            <StatItem label="RAM" value="2.4 / 8 GB" icon={<Activity className="w-3.5 h-3.5 text-emerald-400" />} />
            <StatItem label="Disk" value="45%" icon={<HardDrive className="w-3.5 h-3.5 text-amber-400" />} />
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-border">
        <SidebarItem 
          icon={<Settings className="w-4 h-4" />} 
          label="Settings" 
          onClick={() => alert('Settings coming soon! Use the toolbar for quick actions.')}
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all cursor-pointer ${active ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const StatItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-[10px] text-secondary">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      <span>{value}</span>
    </div>
    <div className="h-1 bg-background rounded-full overflow-hidden">
      <div className="h-full bg-primary" style={{ width: value.includes('%') ? value : '30%' }}></div>
    </div>
  </div>
);

export default Sidebar;
