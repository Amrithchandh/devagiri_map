import { nodes, edges } from '../data/mapGraph';

export function findShortestPath(startNodeId, endNodeId) {
  if (!nodes[startNodeId] || !nodes[endNodeId]) return [];

  // Build adjacency list
  const graph = {};
  Object.keys(nodes).forEach(node => {
    graph[node] = {};
  });
  
  edges.forEach(edge => {
    graph[edge.from][edge.to] = edge.distance;
    graph[edge.to][edge.from] = edge.distance; // Assuming undirected
  });

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  Object.keys(nodes).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currNode = null;
    let minDistance = Infinity;

    unvisited.forEach(node => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        currNode = node;
      }
    });

    if (currNode === null) break;
    if (currNode === endNodeId) break;

    unvisited.delete(currNode);

    for (let neighbor in graph[currNode]) {
      if (unvisited.has(neighbor)) {
        let alt = distances[currNode] + graph[currNode][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = currNode;
        }
      }
    }
  }

  // Backtrack to build path
  const path = [];
  let u = endNodeId;
  if (previous[u] !== null || u === startNodeId) {
    while (u !== null) {
      path.unshift(nodes[u]);
      u = previous[u];
    }
  }
  return path;
}

export function findNearestNode(x, y) {
  let nearestId = null;
  let minDistance = Infinity;

  // We consider all gates and waypoints as viable starting locations.
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    if (node.type === 'gate' || node.type === 'waypoint') {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        nearestId = nodeId;
      }
    }
  });

  return nearestId;
}
