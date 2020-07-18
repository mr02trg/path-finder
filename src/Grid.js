import React, { useState, useRef, useEffect } from 'react';
import { clone } from 'lodash';
import './Grid.scss';

import { 
  create2DArray,
  bfs
} from './utils/utils';
import {EMPTY, SOURCE, DEST, WALL} from './constants/constants';
import MyTarget from './components/MyTarget';

const Grid = () => {
  const CELL_SIZE = 35;
  const cellStyle = {width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`};

  const ref = useRef(null);
  const getCells = elSize => ((elSize - elSize%CELL_SIZE)/CELL_SIZE);
  const getDimension = () => {
    const divElSize = {
      width: ref && ref.current ? ref.current.clientWidth : 0,
      height: ref && ref.current ? ref.current.clientHeight : 0
    }
    return {
      width: getCells(divElSize.width),
      height: getCells(divElSize.height)
    }
  }

  const [loading, setLoading] = useState(false);

  const [myGraph, setGraph] = useState(null);
  const [, setDimension] = useState(getDimension());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragType, setDragType] = useState('');

  const [srcPos, setSrcPos] = useState();
  const [destPos, setDestPos] = useState();

  // on window resize
  useEffect(() => {
    const handleResize = () => {
      const d = getDimension();
      setDimension(d);
      setGraph(create2DArray(d, EMPTY));
      setSrcPos(null);
      setDestPos(null);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createWall = (x, y) => {
    let cell = myGraph[y][x];
    if (cell === EMPTY) {
      myGraph[y][x] = WALL;
    }
    else if (cell === WALL) {
      myGraph[y][x] = EMPTY;
    }
    setGraph(clone(myGraph));
  }

  const handleCellMouseDown = (x, y) => {
    if (myGraph[y][x] === SOURCE || myGraph[y][x] === DEST)
      return;
    setIsMouseDown(true);
    createWall(x,y);
  }

  const handleCellMouseOver = (x, y) => {
    if(isMouseDown) {
      createWall(x,y);
    }
  }

  const handleCellMouseUp = () => {
    setIsMouseDown(false);
  }

  const handleDrop = (x, y) => {
    switch (dragType) {
      case SOURCE:
        if (srcPos) {
          myGraph[srcPos.y][srcPos.x] = EMPTY
        }
        myGraph[y][x] = SOURCE
        setSrcPos({x ,y})
        break;
      case DEST:
        if (destPos) {
          myGraph[destPos.y][destPos.x] = EMPTY
        }
        myGraph[y][x] = DEST
        setDestPos({x ,y})
        break;
      default:
    }

    setDragType('');
  }

  const resetVisualise = () => {
    setGraph(create2DArray(getDimension(), EMPTY));
    setSrcPos(null);
    setDestPos(null);
    for(let i = 0; i < myGraph.length; i++) {
      for(let j = 0; j < myGraph[i].length; j++) {
        document.getElementById(`node-${j}-${i}`).className = null;
      }
    }
  }
  
  const visualisePath = () => {
    const {visited, shortestPath} = bfs(srcPos, destPos, myGraph, getDimension());
    setLoading(true);
    // render visited path
    for(let i = 0; i < visited.length; i++) {
      setTimeout(() => {
        const currVisited = visited[i];
        const node = document.getElementById(`node-${currVisited.x}-${currVisited.y}`);
        if (node) {
          node.className = 'node visited';
        }
      }, i * 20);

      // render shortest path
      if (i === visited.length - 1) {
        setTimeout(() => {
          renderShortestPath(shortestPath);
        }, i * 20 + 1500);    // add 2s for animation duration
      }
    }
  }

  const renderShortestPath = path => {
    for(let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const currPos = path[i];
        const node = document.getElementById(`node-${currPos.x}-${currPos.y}`);
        if (node) {
          node.className = 'node shortest-path';
        }
      }, i * 100);

      if (i === path.length - 1) {
        setTimeout(() => {
          setLoading(false);
        }, i * 100 + 1000);
      }
    }
  }


  const showTarget = type => {
    return (
      <div className="d-flex px-3 align-items-center">
        <div 
          style={cellStyle} 
          className="drag-component" 
          draggable
          onDragStart={() => setDragType(type)}
        >
          <MyTarget targetType={type}></MyTarget>
        </div>
        <div>{type === SOURCE ? 'Source' : 'Destination'}</div>
      </div>
    );
  }

  return (
    <div 
      className="grid-container" 
      ref={ref} 
    >
      <div className="menu-bar">
        {!srcPos && showTarget(SOURCE)}
        {!destPos && showTarget(DEST)}
        <div className="ml-auto">
          <button 
            className="btn btn-primary mr-3" 
            onClick={visualisePath} 
            disabled={!srcPos || !destPos || loading}>
            {
              loading ?
              (
                <>
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span> Visualising...</span>
                </>
              ) : (
                <span>Visualise</span>
              )
            }
            
          </button>
          <button className="btn btn-light" onClick={() => resetVisualise()} disabled={!srcPos || !destPos || loading}>Reset</button>
        </div>
      </div>

      <table className="grid">
        <tbody>
          {myGraph && myGraph.map((r,y) => {
            return (
              <tr key={y}>
              {r.map((cell,x) => {
                return (
                  <td key={x}>
                    <div 
                      id={`node-${x}-${y}`}
                      className={` node ${cell === WALL ? 'wall' : null} `}
                      style={cellStyle}
                      onMouseDown={() => handleCellMouseDown(x, y)}
                      onMouseOver={() => handleCellMouseOver(x, y)}
                      onMouseUp={handleCellMouseUp}
                      onDragOver={event => event.preventDefault()}
                      onDrop={() => handleDrop(x, y)}
                    >
                      {cell === SOURCE && <MyTarget targetType={SOURCE} onDragStart={() => setDragType(SOURCE)}></MyTarget>}
                      {cell === DEST && <MyTarget targetType={DEST} onDragStart={() => setDragType(DEST)}></MyTarget>}
                    </div>
                  </td>
                )
              })}
            </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Grid;