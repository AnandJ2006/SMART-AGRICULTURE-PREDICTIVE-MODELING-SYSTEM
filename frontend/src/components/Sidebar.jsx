import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sprout, Tractor, BarChart3, Database, PieChart, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/predict/crop', label: 'Crop Recommendation', icon: <Sprout size={20} /> },
    { path: '/predict/yield', label: 'Yield Prediction', icon: <Tractor size={20} /> },
    { path: '/performance', label: 'Model Performance', icon: <BarChart3 size={20} /> },
    { path: '/dataset', label: 'Dataset', icon: <Database size={20} /> },
    { path: '/eda', label: 'EDA', icon: <PieChart size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={toggleSidebar}
          className="md:hidden"
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header justify-between">
          <div className="flex items-center gap-2">
            <Sprout size={28} />
            <span>AgriPredict</span>
          </div>
          <button className="menu-toggle" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth <= 768) toggleSidebar();
              }}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
}
