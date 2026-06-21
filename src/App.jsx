import React, { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import BottomSheet from './components/BottomSheet';
import MapRenderer from './components/MapRenderer';
import { findShortestPath, findNearestNode } from './utils/pathfinding';
import { latLngToSVG } from './data/mapGraph';

function App() {
  const [courseType, setCourseType] = useState('Aided'); // 'Aided' or 'Self Financing'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [startNode, setStartNode] = useState('G1'); // Gate by default
  const [pathNodes, setPathNodes] = useState([]);
  
  // Live location tracking
  const [isTracking, setIsTracking] = useState(false);
  const [svgLocation, setSvgLocation] = useState(null);
  const [heading, setHeading] = useState(0); // Add heading state
  const [trackingError, setTrackingError] = useState(null);
  
  const transformRef = useRef(null);

  // Check URL params for starting point
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const origin = params.get('origin');
    if (origin) {
      setStartNode(origin.toUpperCase());
    }
  }, []);

  // Handle live location tracking
  useEffect(() => {
    let watchId;
    if (isTracking) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, heading: currentHeading } = position.coords;
            const newPos = latLngToSVG(latitude, longitude);
            setSvgLocation(newPos);
            
            // Only update heading if the API provides it (user is moving)
            if (currentHeading !== null && !isNaN(currentHeading)) {
              setHeading(currentHeading);
            }
            
            setTrackingError(null);
            
            // Re-center on user
            if (transformRef.current) {
              transformRef.current.setTransform(newPos.x, newPos.y, 2, 500);
            }
          },
          (error) => {
            console.error(error);
            setTrackingError('Location access denied or unavailable.');
            setIsTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 0 }
        );
      } else {
        setTrackingError('Geolocation not supported.');
        setIsTracking(false);
      }
    } else {
      setSvgLocation(null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  // Update path when course is selected or when location changes
  useEffect(() => {
    if (selectedCourse) {
      const destination = selectedCourse.block; // 'A', 'B', or 'C'
      
      let computedStartNode = startNode;
      // If tracking, use nearest node to current location instead of selected gate
      if (isTracking && svgLocation) {
        const nearest = findNearestNode(svgLocation.x, svgLocation.y);
        if (nearest) {
          computedStartNode = nearest;
        }
      }
      
      if (computedStartNode) {
        const path = findShortestPath(computedStartNode, destination);
        
        // If tracking, prepend current live location to path
        if (isTracking && svgLocation && path.length > 0) {
          path.unshift({ ...svgLocation, type: 'live' });
        }
        
        setPathNodes(path);
        
        // Zoom to destination block if not currently centering on user movement
        if (transformRef.current && path.length > 0 && !isTracking) {
          transformRef.current.zoomToElement(`block-${destination}`, 2, 500);
        }
      }
    } else {
      setPathNodes([]);
    }
  }, [selectedCourse, startNode, isTracking, svgLocation]);

  const handleRecenter = () => {
    if (transformRef.current) {
      if (isTracking && svgLocation) {
        transformRef.current.setTransform(svgLocation.x, svgLocation.y, 2, 500);
      } else {
        transformRef.current.resetTransform();
      }
    }
  };

  const handleReset = () => {
    setSelectedCourse(null);
    setSearchQuery('');
    setPathNodes([]);
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  };

  const handleShortcut = (blockId) => {
    let name = blockId;
    let label = null;
    if (blockId === 'A') name = 'Academic Block A';
    else if (blockId === 'LIBRARY') { name = 'Library'; label = 'Library'; }
    else if (blockId === 'CANTEEN') { name = 'Canteen'; label = 'Canteen'; }
    else if (blockId === 'PRINCIPAL') { name = 'Principal Office'; label = "Principal's Office"; }

    setSelectedCourse({ name, block: blockId, label });
    setSearchQuery(name);
  };

  return (
    <div className="app-container">
      <TopBar startNode={startNode} setStartNode={setStartNode} onShortcut={handleShortcut} />
      
      <div className="map-area">
        <MapRenderer 
          pathNodes={pathNodes} 
          destinationBlock={selectedCourse?.block} 
          setTransformRef={transformRef}
          svgLocation={svgLocation}
          heading={heading}
        />
      </div>

      <BottomSheet 
        courseType={courseType}
        setCourseType={setCourseType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        destinationBlock={selectedCourse?.block}
        onRecenter={handleRecenter}
        onReset={handleReset}
      />
      
      {/* Floating Action Button for Location */}
      <button 
        className={`fab-location ${isTracking ? 'tracking' : ''}`}
        onClick={() => {
          setIsTracking(!isTracking);
          if (!isTracking) {
            setStartNode(''); 
          }
        }}
        title={isTracking ? "Stop Tracking" : "Locate Me"}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </button>

      {trackingError && (
        <div className="toast-error">
          {trackingError}
        </div>
      )}
    </div>
  );
}

export default App;
