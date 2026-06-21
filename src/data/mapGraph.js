// mapGraph.js defines the nodes and edges for our custom SVG map and pathfinding.
// Using a 1000x700 viewBox to roughly match the blueprint aspect ratio.

export const nodes = {
  // Gates
  G1: { id: 'G1', label: 'Gate 1', x: 320, y: 550, type: 'gate' },
  G2: { id: 'G2', label: 'Gate 2', x: 370, y: 400, type: 'gate' },
  G3: { id: 'G3', label: 'Gate 3', x: 500, y: 560, type: 'gate' },
  G4: { id: 'G4', label: 'Gate 4', x: 720, y: 560, type: 'gate' },
  G5: { id: 'G5', label: 'Gate 5', x: 750, y: 530, type: 'gate' },
  G6: { id: 'G6', label: 'Gate 6', x: 670, y: 480, type: 'gate' },
  G7: { id: 'G7', label: 'Gate 7', x: 970, y: 580, type: 'gate' },
  G8: { id: 'G8', label: 'Gate 8', x: 800, y: 460, type: 'gate' },
  G9: { id: 'G9', label: 'Gate 9', x: 610, y: 350, type: 'gate' },
  G10: { id: 'G10', label: 'Gate 10', x: 570, y: 300, type: 'gate' },
  
  // Waypoints for main walkways
  W_MAIN: { id: 'W_MAIN', x: 340, y: 470, type: 'waypoint' },
  W_FRONT: { id: 'W_FRONT', x: 500, y: 520, type: 'waypoint' },
  W_RIGHT: { id: 'W_RIGHT', x: 720, y: 500, type: 'waypoint' },
  W_BACK: { id: 'W_BACK', x: 640, y: 380, type: 'waypoint' },
  W_FAR_RIGHT: { id: 'W_FAR_RIGHT', x: 880, y: 480, type: 'waypoint' },
  
  // Blocks (A, B, C match courses.js block field)
  A: { id: 'A', label: 'Academic Block A', x: 520, y: 490, type: 'block' },
  B: { id: 'B', label: 'Academic Block B', x: 820, y: 440, type: 'block' },
  C: { id: 'C', label: 'Academic Block C', x: 930, y: 420, type: 'block' },
  PRINCIPAL: { id: 'PRINCIPAL', label: "Principal's Office", x: 640, y: 460, type: 'block' },
  LIBRARY: { id: 'LIBRARY', label: 'Library', x: 520, y: 350, type: 'block' },
  CANTEEN: { id: 'CANTEEN', label: 'Canteen', x: 260, y: 360, type: 'block' }
};

export const edges = [
  // Canteen Connections
  { from: 'CANTEEN', to: 'G2', distance: 100 },
  { from: 'CANTEEN', to: 'W_MAIN', distance: 120 },

  // G1 to Main Road
  { from: 'G1', to: 'W_MAIN', distance: 80 },
  
  // Main Road Walkways
  { from: 'W_MAIN', to: 'W_FRONT', distance: 150 },
  { from: 'W_FRONT', to: 'G3', distance: 40 },
  { from: 'W_FRONT', to: 'W_RIGHT', distance: 200 },
  
  // Block A & Principal Office
  { from: 'W_FRONT', to: 'A', distance: 50 },
  { from: 'W_RIGHT', to: 'PRINCIPAL', distance: 80 },
  { from: 'A', to: 'PRINCIPAL', distance: 100 },
  
  // Right side Gates
  { from: 'W_RIGHT', to: 'G4', distance: 60 },
  { from: 'W_RIGHT', to: 'G5', distance: 50 },
  { from: 'W_RIGHT', to: 'G6', distance: 60 },
  
  // Connect to Block B & Block C
  { from: 'W_RIGHT', to: 'W_FAR_RIGHT', distance: 150 },
  { from: 'W_FAR_RIGHT', to: 'B', distance: 50 },
  { from: 'W_FAR_RIGHT', to: 'C', distance: 60 },
  { from: 'B', to: 'C', distance: 100 },
  
  // Far right gates
  { from: 'W_FAR_RIGHT', to: 'G7', distance: 120 },
  { from: 'W_FAR_RIGHT', to: 'G8', distance: 80 },
  
  // Back side (Library & G9, G10)
  { from: 'A', to: 'LIBRARY', distance: 120 },
  { from: 'PRINCIPAL', to: 'W_BACK', distance: 80 },
  { from: 'W_BACK', to: 'LIBRARY', distance: 100 },
  { from: 'W_BACK', to: 'G9', distance: 40 },
  { from: 'W_BACK', to: 'G10', distance: 100 }
];

// Mock GPS Bounds for Devagiri College (Kozhikode). 
// You must replace these with the actual GPS coordinates of the top-left and bottom-right corners of the blueprint image.
export const campusBounds = {
  topLeft: { lat: 11.268000, lng: 75.833000 },
  bottomRight: { lat: 11.264000, lng: 75.838000 }
};

// Converts real-world GPS coordinates to the SVG coordinate system (1000x700)
export function latLngToSVG(lat, lng) {
  const { topLeft, bottomRight } = campusBounds;
  
  // Calculate percentage along longitude (X-axis) and latitude (Y-axis)
  const xPercent = (lng - topLeft.lng) / (bottomRight.lng - topLeft.lng);
  const yPercent = (topLeft.lat - lat) / (topLeft.lat - bottomRight.lat); // Note: lat decreases as you go south (down Y)
  
  // Clamp to bounds (allow slightly outside)
  const x = Math.max(-100, Math.min(1100, xPercent * 1000));
  const y = Math.max(-100, Math.min(800, yPercent * 700));
  
  return { x, y };
}
