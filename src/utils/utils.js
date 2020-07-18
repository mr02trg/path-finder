import { fill, some, isEqual , isEmpty, forEach, filter } from 'lodash';
import { DEST, WALL } from '../constants/constants';

export const exploreNeighbours = (currPos, gridDimension) => {
  const dx = [-1, 1, 0 , 0]
  const dy = [0 , 0, 1, -1]
  const neighbours = []
  for(let i = 0; i < 4; i++) {
    const nx = currPos.x + dx[i]
    const ny = currPos.y + dy[i]

    if (nx < 0 || ny < 0) continue
    if (nx >= gridDimension.width || ny >= gridDimension.height) continue
    neighbours.push({x: nx, y: ny})
  }
  return neighbours;
}

export const bfs  = (srcPos, destPos, myGraph, dimension) => {
  const q = [srcPos];
  const pred = create2DArray(dimension, null);
  let visited = [srcPos];
  // const visited = create2DArray(dimension, false);
  // visited[srcPos.y][srcPos.x] = true;
  while (! isEmpty(q)) {
    const currNode = q.shift();
    if (myGraph[currNode.y][currNode.x] === DEST) {
      break;
    }

    const neighbours = exploreNeighbours(currNode, dimension);

    forEach(neighbours, neighbour => {
      if (myGraph[neighbour.y][neighbour.x] === WALL) {
        // visited[neighbour.y][neighbour.x] = true;
        visited.push(neighbour);
        return;
      }

      if (! isMember(neighbour, visited)) {
        q.push(neighbour);
        // visited[neighbour.y][neighbour.x] = true;
        visited.push(neighbour);
        pred[neighbour.y][neighbour.x] = currNode;
      }
    });
  }

  // remove all obstacle visited nodes
  visited = filter(visited, pos => myGraph[pos.y][pos.x] !== WALL);

  // backtrack shortest path
  const shortestPath = constructBFSPath(srcPos, destPos, pred);
  return {visited, shortestPath};
} 

const constructBFSPath = (srcPos, destPos, arr) => {
  const path = [destPos];
  let currNode = arr[destPos.y][destPos.x];
  while(! isEqual(currNode, srcPos)) {
    path.unshift(currNode);
    currNode = arr[currNode.y][currNode.x];
  }
  path.unshift(srcPos);
  return path;
}

export const isMember = (currPos, arr) => some(arr, item => isEqual(item, currPos));
export const create2DArray = 
  (dimension, fillValue) => Array.from(Array(dimension.height), () => fill(Array(dimension.width), fillValue));