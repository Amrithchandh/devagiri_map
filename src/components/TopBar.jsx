import React from 'react';
import { MapPin, Coffee, GraduationCap, BookOpen, User } from 'lucide-react';
import { nodes } from '../data/mapGraph';

export default function TopBar({ startNode, setStartNode, onShortcut }) {
  const gates = Object.values(nodes).filter(n => n.type === 'gate');

  return (
    <div className="top-bar">
      <div className="header">
        <div className="logo-placeholder"></div>
        <h1>SFI DEVAGIRI NAVIGATOR</h1>
      </div>
      
      <div className="controls">
        <div className="start-selection">
          <MapPin size={20} className="icon" />
          <span className="label">Starting From</span>
          <select 
            value={startNode} 
            onChange={(e) => setStartNode(e.target.value)}
            className="dropdown"
          >
            {gates.map(gate => (
              <option key={gate.id} value={gate.id}>{gate.label}</option>
            ))}
          </select>
        </div>
        
        <div className="quick-actions">
          <button className="icon-btn" title="Academics" onClick={() => onShortcut('A')}><GraduationCap size={18}/></button>
          <button className="icon-btn" title="Library" onClick={() => onShortcut('LIBRARY')}><BookOpen size={18}/></button>
          <button className="icon-btn" title="Canteen" onClick={() => onShortcut('CANTEEN')}><Coffee size={18}/></button>
          <button className="icon-btn" title="Principal Office" onClick={() => onShortcut('PRINCIPAL')}><User size={18}/></button>
        </div>
      </div>
    </div>
  );
}
