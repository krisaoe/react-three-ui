'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import { Mesh } from 'react-three';
import Color from 'color';
import { Motion, spring } from 'react-motion';
import computeLayout from 'css-layout';

const animatableProperties = {
  height: true,
  width: true,
  // minWidth: true,
  // maxWidth: true,
  left: true,
  right: true,
  top: true,
  bottom: true,
  // margin: true,
  // marginLeft: true,
  // marginRight: true,
  // marginTop: true,
  // marginBottom: true,
  // padding: true,
  // paddingLeft: true,
  // paddingRight: true,
  // paddingTop: true,
  // paddingBottom: true,
  // borderWidth: true,
  // borderLeftWidth: true,
  // borderRightWidth: true,
  // borderTopWidth: true,
  // borderBottomWidth: true
};

export default class Layer extends ThreeUIComponent {
  
  static propTypes = {
    animate: PropTypes.object,
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
    animate: null,
    style: {
      flex: 0,
      flexDirection: 'column',
      opacity: 1,
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    elevation: 0
  };
  
  constructor(props) {
    super(props);
    this.state = {
      oldAnimations: props.css.layout,
      newAnimations: props.animate
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      oldAnimations: this.state.newAnimations,
      newAnimations: nextProps.animate
    });
  }
  
  getGeometry(layoutChanges) {
    const layout = {
      ...this.props.css.layout,
      ...layoutChanges
    }
    return new THREE.PlaneGeometry(layout.width, layout.height);
  }
  
  getMaterial(style) {
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
  
  getPosition(layoutChanges) {
    const { parentCSS, css } = this.props;
    const layout = {
      ...css.layout,
      ...layoutChanges
    };
    const leftBound = (layout.width - parentCSS.layout.width) / 2;
    const topBound = (parentCSS.layout.height - layout.height) / 2;
    return new THREE.Vector3(leftBound + layout.left, topBound - layout.top, this.props.elevation);
  }
  
  getChildren() {
    const { children, css } = this.props;
    return React.Children.map(children, (child, i) => React.cloneElement(child, {
      parentCSS: css,
      css: css.children[i]
    }));
  }
  
  renderMesh(layoutChanges) {
    return (
      <Mesh
        name={this.props.name}
        geometry={this.getGeometry(layoutChanges)}
        material={this.getMaterial(this.props.style)}
        position={this.getPosition(layoutChanges)}>
        {this.getChildren()}
      </Mesh>
    );
  }
  
  render() {
    if (this.props.animate) {
      const animatedLayout = Object.keys(this.state.newAnimations)
        .filter(key => animatableProperties[key])
        .reduce((memo, key) => (memo[key] = spring(this.state.newAnimations[key]), memo), {});
        
      return (
        <Motion defaultStyle={this.state.oldAnimations} style={animatedLayout}>
          {this.renderMesh.bind(this)}
        </Motion>
      );
    }
    else {
      return this.renderMesh();
    }
  }
}
