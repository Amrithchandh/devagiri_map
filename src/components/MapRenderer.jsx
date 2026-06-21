import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { nodes, edges } from '../data/mapGraph';

export default function MapRenderer({ pathNodes, destinationBlock, setTransformRef, svgLocation, heading }) {
  return (
    <div className="map-wrapper">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit
        ref={setTransformRef}
      >
        <TransformComponent wrapperClass="transform-wrapper" contentClass="transform-content">
          <svg viewBox="0 0 1000 700" className="campus-map">
            {/* Blueprint Background */}
            <image href="/blueprint.jpg" width="1000" height="700" preserveAspectRatio="none" opacity="1" />

            {/* Render all walkway paths (faint dashed lines) */}
            {edges.map((edge, idx) => {
              const n1 = nodes[edge.from];
              const n2 = nodes[edge.to];
              if (!n1 || !n2) return null;
              return (
                <line 
                  key={`edge-${idx}`}
                  x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y}
                  stroke="rgba(255,255,255,0.3)" strokeWidth="4"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Render Blocks */}
            {Object.values(nodes).filter(n => n.type === 'block').map(block => {
              const isSelected = block.id === destinationBlock;
              
              return (
                <g key={block.id} id={`block-${block.id}`} className={`block-group ${isSelected ? 'selected-block' : ''}`}>
                  <rect 
                    x={block.x - 70} y={block.y - 25} 
                    width="140" height="50" 
                    fill={isSelected ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}
                    rx="6"
                    stroke={isSelected ? '#ef4444' : 'rgba(255,255,255,0.8)'}
                    strokeWidth={isSelected ? '4' : '2'}
                  />
                  <text x={block.x} y={block.y + 5} fill="white" fontSize="12" textAnchor="middle" fontWeight="bold">
                    {block.label}
                  </text>
                  {isSelected && (
                    <circle cx={block.x} cy={block.y - 45} r="8" fill="#ef4444" className="pulse-marker" />
                  )}
                </g>
              );
            })}

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
              </marker>
            </defs>

            {/* Render highlighted route path */}
            {pathNodes && pathNodes.length > 1 && (
              <polyline
                points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="6"
                strokeDasharray="10 6"
                className="animated-path"
                markerMid="url(#arrow)"
                markerEnd="url(#arrow)"
              />
            )}

            {/* Render Gates */}
            {Object.values(nodes).filter(n => n.type === 'gate').map(gate => (
              <g key={gate.id}>
                <circle cx={gate.x} cy={gate.y} r="14" fill="rgba(24,65,121,0.8)" stroke="white" strokeWidth="2" />
                <text x={gate.x} y={gate.y + 4} fill="white" fontSize="9" textAnchor="middle" fontWeight="bold">
                  {gate.id}
                </text>
              </g>
            ))}

            {/* Render User's Live Location */}
            {svgLocation && (
              <g className="live-location" transform={`translate(${svgLocation.x}, ${svgLocation.y})`}>
                {/* Accuracy Radius */}
                <circle cx="0" cy="0" r="16" fill="rgba(59, 130, 246, 0.3)" className="pulse-marker" />
                
                {/* Heading Arrow & Center Dot */}
                <g transform={`rotate(${heading || 0})`}>
                  {/* The white arrow pointing in the direction of the heading */}
                  <polygon points="-5,2 0,-8 5,2 0,-1" fill="#ffffff" stroke="#3b82f6" strokeWidth="1" />
                </g>
                <circle cx="0" cy="0" r="4" fill="#3b82f6" />
              </g>
            )}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
