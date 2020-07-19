import { minBy, pull } from 'lodash';

function PriorityQueue () {
  this.pq = [];
  
  this.enqueue = (data) => {
    this.pq.push(data);
  };

  this.dequeue = () => {
    const node = minBy(this.pq, 'cost');
    pull(this.pq, node);
    return node;
  }

  this.isEmpty = () => {
    return this.pq.length === 0;
  };

  this.print =() => {
    console.log(this.pq);
  }
};

export default PriorityQueue;
