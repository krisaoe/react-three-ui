'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import { Mesh } from 'react-three';
import Color from 'color';

export default class Layer extends ThreeUIComponent {
  
  static propTypes = {
    style: PropTypes.shape({
      alignItems: PropTypes.oneOf(['flex-start', 'center', 'flex-end', 'stretch']),
      alignSelf: PropTypes.oneOf(['flex-start', 'center', 'flex-end', 'stretch']),
      justifyContent: PropTypes.oneOf(['flex-start', 'center', 'flex-end', 'space-between', 'space-around']),
      height: PropTypes.number,
      width: PropTypes.number,
      backgroundColor: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Color)
      ]),
      opacity: PropTypes.number
    }),
    elevation: PropTypes.number
  };
  
  static defaultProps = {
    style: {
      flex: 0,
      flexDirection: 'column',
      opacity: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    elevation: 0
  };
  
  getGeometry() {
    const { css } = this.props;
    return new THREE.PlaneGeometry(css.layout.width, css.layout.height);
  }
  
  getMaterial() {
    let { style } = this.props;
    style = {
      ...Layer.defaultProps.style,
      ...style
    };
    const material = new THREE.MeshBasicMaterial();
    if (style.opacity < 1) {
      material.transparent = true;
      material.opacity = style.opacity;
    }
    if (style.backgroundColor) {
      material.color.setHex(Color(style.backgroundColor).rgbNumber());
    }
    // else {
    //   material.transparent = true;
    // }
    material.needsUpdate = true;
    return material;
  }
  
  getPosition() {
    const { parentLayout, css } = this.props;
    const leftBound = (css.layout.width - parentLayout.width) / 2;
    const topBound = (parentLayout.height - css.layout.height) / 2;
    return new THREE.Vector3(leftBound + css.layout.left, topBound - css.layout.top, this.props.elevation);
  }
  
  getChildren() {
    const { children, css } = this.props;
    return React.Children.map(children, (child, i) => React.cloneElement(child, {
      parent: this,
      parentLayout: css.layout,
      css: css.children[i]
    }));
  }
  
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