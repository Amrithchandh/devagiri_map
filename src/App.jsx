import React, { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import BottomSheet from './components/BottomSheet';
import MapRenderer from './components/MapRenderer';
import { findShortestPath, findNearestNode } from './utils/pathfinding';

function App() {
  const [courseType, setCourseType] = useState('Aided'); // 'Aided' or 'Self Financing'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [startNode, setStartNode] = useState('G1'); // Gate by default
  const [pathNodes, setPathNodes] = useState([]);
  
  // Live location tracking
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [heading, setHeading] = useState(0);
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
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Only update heading if the API provides it (user is moving)
            if (currentHeading !== null && !isNaN(currentHeading)) {
              setHeading(currentHeading);
            }
            
            setTrackingError(null);
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
      setUserLocation(null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  // Auto-dismiss tracking error after 4 seconds
  useEffect(() => {
    if (trackingError) {
      const t = setTimeout(() => setTrackingError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [trackingError]);

  // Update path when course is selected or when location changes
  useEffect(() => {
    if (selectedCourse) {
      const destination = selectedCourse.block; // 'A', 'B', or 'C'
      
      let computedStartNode = startNode;
      // If tracking, use nearest node to current location instead of selected gate
      if (isTracking && userLocation) {
        const nearest = findNearestNode(userLocation.lat, userLocation.lng);
        if (nearest) {
          computedStartNode = nearest;
        }
      }
      
      if (computedStartNode) {
        const path = findShortestPath(computedStartNode, destination);
        
        // If tracking, prepend current live location to path
        if (isTracking && userLocation && path.length > 0) {
          path.unshift({ lat: userLocation.lat, lng: userLocation.lng });
        }
        
        setPathNodes(path);
        
        // Zoom to destination block if not currently centering on user movement
        if (transformRef.current && path.length > 0 && !isTracking) {
          transformRef.current.zoomToElement(destination);
        }
      }
    } else {
      setPathNodes([]);
    }
  }, [selectedCourse, startNode, isTracking, userLocation]);

  const handleRecenter = () => {
    if (transformRef.current) {
      if (isTracking && userLocation) {
        transformRef.current.flyToUser(userLocation.lat, userLocation.lng);
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

  // ---- Location Permission Dialog ----
  const [showPermDialog, setShowPermDialog] = useState(true);
  const [permState, setPermState] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'skipped'

  const handleAllowLocation = () => {
    setPermState('requesting');
    if (!('geolocation' in navigator)) {
      setPermState('denied');
      setTrackingError('Geolocation is not supported by your browser.');
      setShowPermDialog(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermState('granted');
        setIsTracking(true);
        setStartNode('');
        setShowPermDialog(false);
      },
      (err) => {
        console.error(err);
        setPermState('denied');
        setTrackingError('Location access denied. Using manual gate selection.');
        setShowPermDialog(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSkipLocation = () => {
    setPermState('skipped');
    setShowPermDialog(false);
  };

  return (
    <div className="app-container">
      <TopBar startNode={startNode} setStartNode={setStartNode} onShortcut={handleShortcut} />
      
      <div className="map-area">
        <MapRenderer 
          pathNodes={pathNodes} 
          destinationBlock={selectedCourse?.block} 
          setTransformRef={transformRef}
          svgLocation={userLocation}
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
          if (!isTracking) {
            handleAllowLocation();
          } else {
            setIsTracking(false);
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

      {/* Location Permission Dialog */}
      {showPermDialog && (
        <div className="perm-overlay">
          <div className="perm-dialog">
            <div className="perm-icon-ring">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
                <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12"></path>
              </svg>
            </div>
            <h2 className="perm-title">Enable Live Location</h2>
            <p className="perm-desc">
              Allow <strong>Devagiri Navigator</strong> to access your live location to get real-time directions to any academic block on campus.
            </p>
            <div className="perm-features">
              <div className="perm-feature">
                <span className="perm-feature-icon">📍</span>
                <span>See your real-time position on the map</span>
              </div>
              <div className="perm-feature">
                <span className="perm-feature-icon">🧭</span>
                <span>Get turn-by-turn campus directions</span>
              </div>
              <div className="perm-feature">
                <span className="perm-feature-icon">🔒</span>
                <span>Location is never stored or shared</span>
              </div>
            </div>
            <div className="perm-actions">
              <button 
                className="perm-allow-btn" 
                onClick={handleAllowLocation}
                disabled={permState === 'requesting'}
              >
                {permState === 'requesting' ? (
                  <span className="perm-loading">
                    <span className="spinner"></span> Getting location...
                  </span>
                ) : (
                  '📍 Allow Location Access'
                )}
              </button>
              <button className="perm-skip-btn" onClick={handleSkipLocation}>
                Skip, select gate manually
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
