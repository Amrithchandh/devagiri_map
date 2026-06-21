// mapGraph.js defines the nodes and edges for our campus map and pathfinding.
// All coordinates are real GPS (lat, lng) for use with Leaflet.

// Campus bounding box used to convert old SVG coords (1000x700) to GPS.
// topLeft corresponds to SVG (0,0), bottomRight to SVG (1000,700).
const campusBounds = {
  topLeft: { lat: 11.268000, lng: 75.833000 },
  bottomRight: { lat: 11.264000, lng: 75.838000 }
};

// Helper: convert old SVG (x, y) in 1000x700 space to lat/lng
function svgToLatLng(x, y) {
  const { topLeft, bottomRight } = campusBounds;
  const lng = topLeft.lng + (x / 1000) * (bottomRight.lng - topLeft.lng);
  const lat = topLeft.lat - (y / 700) * (topLeft.lat - bottomRight.lat);
  return { lat, lng };
}

export const nodes = {
  // Gates
  G1:  { id: 'G1',  label: 'Gate 1',  ...svgToLatLng(320, 550), type: 'gate' },
  G2:  { id: 'G2',  label: 'Gate 2',  ...svgToLatLng(370, 400), type: 'gate' },
  G3:  { id: 'G3',  label: 'Gate 3',  ...svgToLatLng(500, 560), type: 'gate' },
  G4:  { id: 'G4',  label: 'Gate 4',  ...svgToLatLng(720, 560), type: 'gate' },
  G5:  { id: 'G5',  label: 'Gate 5',  ...svgToLatLng(750, 530), type: 'gate' },
  G6:  { id: 'G6',  label: 'Gate 6',  ...svgToLatLng(670, 480), type: 'gate' },
  G7:  { id: 'G7',  label: 'Gate 7',  ...svgToLatLng(970, 580), type: 'gate' },
  G8:  { id: 'G8',  label: 'Gate 8',  ...svgToLatLng(800, 460), type: 'gate' },
  G9:  { id: 'G9',  label: 'Gate 9',  ...svgToLatLng(610, 350), type: 'gate' },
  G10: { id: 'G10', label: 'Gate 10', ...svgToLatLng(570, 300), type: 'gate' },

  // Waypoints for main walkways
  W_MAIN:      { id: 'W_MAIN',      ...svgToLatLng(340, 470), type: 'waypoint' },
  W_FRONT:     { id: 'W_FRONT',     ...svgToLatLng(500, 520), type: 'waypoint' },
  W_RIGHT:     { id: 'W_RIGHT',     ...svgToLatLng(720, 500), type: 'waypoint' },
  W_BACK:      { id: 'W_BACK',      ...svgToLatLng(640, 380), type: 'waypoint' },
  W_FAR_RIGHT: { id: 'W_FAR_RIGHT', ...svgToLatLng(880, 480), type: 'waypoint' },

  // Blocks (A, B, C match courses.js block field)
  A:         { id: 'A',         label: 'Academic Block A',    ...svgToLatLng(520, 490), type: 'block' },
  B:         { id: 'B',         label: 'Academic Block B',    ...svgToLatLng(820, 440), type: 'block' },
  C:         { id: 'C',         label: 'Academic Block C',    ...svgToLatLng(930, 420), type: 'block' },
  PRINCIPAL: { id: 'PRINCIPAL', label: "Principal's Office",  ...svgToLatLng(640, 460), type: 'block' },
  LIBRARY:   { id: 'LIBRARY',   label: 'Library',            ...svgToLatLng(520, 350), type: 'block' },
  CANTEEN:   { id: 'CANTEEN',   label: 'Canteen',            ...svgToLatLng(260, 360), type: 'block' }
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

// Center of the campus for initial map view
export const campusCenter = svgToLatLng(500, 350);
