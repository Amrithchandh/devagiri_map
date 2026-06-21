import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { nodes, edges, campusCenter } from '../data/mapGraph';

// Fix Leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom gate icon (small dark blue circle with white text)
function createGateIcon(label) {
  return L.divIcon({
    className: 'gate-marker',
    html: `<div class="gate-icon">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Custom block icon (larger label)
function createBlockIcon(label, isSelected) {
  return L.divIcon({
    className: 'block-marker',
    html: `<div class="block-icon ${isSelected ? 'block-selected' : ''}">${label}</div>`,
    iconSize: [140, 50],
    iconAnchor: [70, 25],
  });
}

// Custom live location icon (Google Maps style blue dot with heading cone)
function createLiveIcon(heading) {
  return L.divIcon({
    className: 'live-location-marker',
    html: `
      <div class="live-outer-pulse"></div>
      <div class="live-heading-cone" style="transform: rotate(${heading || 0}deg)"></div>
      <div class="live-dot"></div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Component to programmatically control the map (flyTo, setView, etc.)
function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    if (mapRef) {
      mapRef.current = map;
    }
  }, [map, mapRef]);
  return null;
}

// Component to track user location and center on it
function LocationFollower({ userLocation, shouldFollow }) {
  const map = useMap();
  useEffect(() => {
    if (shouldFollow && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 18, { duration: 0.8 });
    }
  }, [userLocation, shouldFollow, map]);
  return null;
}

export default function MapRenderer({ pathNodes, destinationBlock, setTransformRef, svgLocation, heading }) {
  const mapRef = useRef(null);

  // Expose a ref-like API to App.jsx for recenter/zoom
  useEffect(() => {
    if (setTransformRef) {
      setTransformRef.current = {
        resetTransform: () => {
          if (mapRef.current) {
            mapRef.current.flyTo([campusCenter.lat, campusCenter.lng], 17, { duration: 0.8 });
          }
        },
        flyToUser: (lat, lng) => {
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 18, { duration: 0.8 });
          }
        },
        zoomToElement: (blockId) => {
          const node = nodes[blockId];
          if (node && mapRef.current) {
            mapRef.current.flyTo([node.lat, node.lng], 18, { duration: 0.8 });
          }
        }
      };
    }
  }, [setTransformRef]);

  // Walkway edges as faint polylines
  const walkwayLines = edges.map((edge, idx) => {
    const n1 = nodes[edge.from];
    const n2 = nodes[edge.to];
    if (!n1 || !n2) return null;
    return (
      <Polyline
        key={`edge-${idx}`}
        positions={[[n1.lat, n1.lng], [n2.lat, n2.lng]]}
        pathOptions={{ color: 'rgba(100,100,100,0.4)', weight: 2, dashArray: '6 4' }}
      />
    );
  });

  // Route path
  const routeLine = pathNodes && pathNodes.length > 1 ? (
    <Polyline
      positions={pathNodes.map(n => [n.lat, n.lng])}
      pathOptions={{ color: '#ef4444', weight: 5, dashArray: '10 6' }}
      className="animated-route"
    />
  ) : null;

  // Block markers
  const blockMarkers = Object.values(nodes).filter(n => n.type === 'block').map(block => {
    const isSelected = block.id === destinationBlock;
    return (
      <Marker
        key={block.id}
        position={[block.lat, block.lng]}
        icon={createBlockIcon(block.label, isSelected)}
      >
        <Popup>{block.label}</Popup>
      </Marker>
    );
  });

  // Gate markers
  const gateMarkers = Object.values(nodes).filter(n => n.type === 'gate').map(gate => (
    <Marker
      key={gate.id}
      position={[gate.lat, gate.lng]}
      icon={createGateIcon(gate.id)}
    >
      <Popup>{gate.label}</Popup>
    </Marker>
  ));

  // Destination pulse marker
  const destinationNode = destinationBlock ? nodes[destinationBlock] : null;
  const destinationPulse = destinationNode ? (
    <Circle
      center={[destinationNode.lat, destinationNode.lng]}
      radius={15}
      pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, weight: 2 }}
      className="pulse-circle"
    />
  ) : null;

  // Live location marker
  const liveMarker = svgLocation ? (
    <>
      <Circle
        center={[svgLocation.lat, svgLocation.lng]}
        radius={20}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15, weight: 1 }}
        className="accuracy-circle"
      />
      <Marker
        position={[svgLocation.lat, svgLocation.lng]}
        icon={createLiveIcon(heading)}
        zIndexOffset={1000}
      />
    </>
  ) : null;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[campusCenter.lat, campusCenter.lng]}
        zoom={17}
        minZoom={15}
        maxZoom={20}
        zoomControl={false}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapController mapRef={mapRef} />
        <LocationFollower userLocation={svgLocation} shouldFollow={!!svgLocation} />

        {/* Google Maps style tile layer */}
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />

        {/* Walkway edges */}
        {walkwayLines}

        {/* Route path */}
        {routeLine}

        {/* Block markers */}
        {blockMarkers}

        {/* Gate markers */}
        {gateMarkers}

        {/* Destination pulse */}
        {destinationPulse}

        {/* Live location */}
        {liveMarker}
      </MapContainer>
    </div>
  );
}
