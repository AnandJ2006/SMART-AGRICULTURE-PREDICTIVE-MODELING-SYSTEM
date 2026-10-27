import React, { useState, useEffect } from 'react';
import { Leaf, Menu, UserCircle } from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar({ toggleSidebar }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealth();
        setStatus('online');
      } catch (error) {
        setStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar">
      <div className="flex items-center gap-4">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <Leaf color="#16a34a" size={24} />
          <span className="font-bold text-lg hidden md:block">Smart Agriculture System</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">API Status:</span>
          {status === 'online' && <span className="badge badge-success">Online</span>}
          {status === 'offline' && <span className="badge badge-error">Offline</span>}
          {status === 'checking' && <span className="badge badge-warning">Checking...</span>}
        </div>
        
        <div className="flex items-center gap-2 text-muted cursor-pointer hover:text-main">
          <UserCircle size={24} />
          <span className="text-sm font-semibold hidden md:block">Admin</span>
        </div>
      </div>
    </div>
  );
}
