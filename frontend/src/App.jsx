import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CropPrediction from './pages/CropPrediction';
import YieldPrediction from './pages/YieldPrediction';
import ModelPerformance from './pages/ModelPerformance';
import Dataset from './pages/Dataset';
import EDA from './pages/EDA';
import WebThreads from './components/WebThreads';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -1 }}>
        <WebThreads
          color1="#5227FF"
          color2="#FF9FFC"
          color3="#FFFFFF"
          speed={0.2}
          threadCount={6}
          frequency={5.0}
          spread={0.18}
          taper={1.0}
          position={0.5}
          fanMode="center"
          glow={0.02}
          falloff={0.6}
          thickness={1.1}
          brightness={0.6}
          opacity={1.0}
          mirror={true}
          shimmer={false}
          grain={true}
          grainIntensity={0.05}
          mouseInteraction={true}
          mouseStrength={0.3}
        />
      </div>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predict/crop" element={<CropPrediction />} />
            <Route path="/predict/yield" element={<YieldPrediction />} />
            <Route path="/performance" element={<ModelPerformance />} />
            <Route path="/dataset" element={<Dataset />} />
            <Route path="/eda" element={<EDA />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
