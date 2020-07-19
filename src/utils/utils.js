import { fill, some, isEqual } from 'lodash';

export const isMember = (currPos, arr) => some(arr, item => isEqual(item, currPos));
export const create2DArray = 
  (dimension, fillValue) => Array.from(Array(dimension.height), () => fill(Array(dimension.width), fillValue));