'use strict';

import React, { PropTypes } from 'react';

export default class MotionWrapper extends ThreeUIComponent {
  
  render() {
    return (
      <Mesh
        name={this.props.name}
        geometry={this.getGeometry()}
        material={this.getMaterial()}
        position={this.getPosition()}>
        {this.getChildren()}
      </Mesh>
    );
  }
}