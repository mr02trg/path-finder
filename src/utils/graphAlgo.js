import { isEmpty, forEach, filter, isEqual } from 'lodash';
import { DEST, WALL } from '../constants/Graph';

import { isMember, create2DArray } from './utils';
import PriorityQueue from './priorityQueue';

const exploreNeighbours = (currPos, gridDimension) => {
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
  while (! isEmpty(q)) {
    const currNode = q.shift();
    if (myGraph[currNode.y][currNode.x] === DEST) {
      break;
    }

    const neighbours = exploreNeighbours(currNode, dimension);

    forEach(neighbours, neighbour => {
      if (myGraph[neighbour.y][neighbour.x] === WALL) {
        visited.push(neighbour);
        return;
      }

      if (! isMember(neighbour, visited)) {
        q.push(neighbour);
        visited.push(neighbour);
        pred[neighbour.y][neighbour.x] = currNode;
      }
    });
  }

  // remove all obstacle visited nodes
  visited = filter(visited, pos => myGraph[pos.y][pos.x] !== WALL);

  // backtrack shortest path
  const shortestPath = constructPath(srcPos, destPos, pred);
  return {visited, shortestPath};
} 

const computeHeuristic = (destPos, dimension) => {
  const heuristic = create2DArray(dimension, 0);
  for(let i = 0; i < heuristic.length; i++) {
    for(let j = 0; j < heuristic[i].length; j++) {
      const dx = Math.abs(destPos.x - j);
      const dy = Math.abs(destPos.y - i);
      heuristic[i][j] = Math.sqrt(dx*dx + dy*dy);
    }
  }
  return heuristic;
}

export const aStar = (srcPos, destPos, myGraph, dimension) => {
  const heuristic = computeHeuristic(destPos, dimension);
  // console.log(heuristic);
  const pq = new PriorityQueue();
  pq.enqueue({currNode: srcPos, cost: heuristic[srcPos.y][srcPos.x]})
  const pred = create2DArray(dimension, null);
  let visited = [srcPos];
  while (! pq.isEmpty()) {
    const {currNode, cost} = pq.dequeue();
    if (myGraph[currNode.y][currNode.x] === DEST) {
      break;
    }

    const neighbours = exploreNeighbours(currNode, dimension);

    forEach(neighbours, neighbour => {
      if (myGraph[neighbour.y][neighbour.x] === WALL) {
        visited.push(neighbour);
        return;
      }

      if (! isMember(neighbour, visited)) {
        pq.enqueue({currNode: neighbour, cost: heuristic[neighbour.y][neighbour.x]})
        visited.push(neighbour);
        pred[neighbour.y][neighbour.x] = currNode;
      }
    });
  }

  // remove all obstacle visited nodes
  visited = filter(visited, pos => myGraph[pos.y][pos.x] !== WALL);

  // backtrack shortest path
  const shortestPath = constructPath(srcPos, destPos, pred);
  return {visited, shortestPath};
}

const constructPath = (srcPos, destPos, arr) => {
  const path = [destPos];
  let currNode = arr[destPos.y][destPos.x];
  while(! isEqual(currNode, srcPos)) {
    path.unshift(currNode);
    currNode = arr[currNode.y][currNode.x];
  }
  path.unshift(srcPos);
  return path;
}