import React from 'react';
import './MyTarget.scss';

import { SOURCE } from '../constants/constants'

const MyTarget = ({ targetType, ...props }) => {
  return (
    <div draggable onDragStart={props.onDragStart}>
      {targetType === SOURCE ? (
        <i className="fa fa-heart-o fa-lg" aria-hidden="true"></i>
      ) : (
        <i className="fa fa-heart fa-lg" aria-hidden="true"></i>
      )}
    </div>
  )
}

export default MyTarget;