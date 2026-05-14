import { Routes, Route, useNavigate } from 'react-router-dom';
import ConnectionScreen from './components/ConnectionScreen';
import MainLayout from './components/MainLayout';
import { useConnectionStore } from './store/connectionStore';
import { useEffect } from 'react';

function App() {
  const { currentConnection } = useConnectionStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentConnection) {
      navigate('/explorer');
    } else {
      navigate('/');
    }
  }, [currentConnection]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-white overflow-hidden">
      <div className="titlebar select-none">
        <span className="text-xs font-medium text-secondary opacity-80">SDolphin SSH File Manager</span>
      </div>
      <main className="flex-1 overflow-hidden relative">
        <Routes>
          <Route path="/" element={<ConnectionScreen />} />
          <Route path="/explorer" element={<MainLayout />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
