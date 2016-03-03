'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import TWEEN from 'tween.js';
import { Mesh } from 'react-three';
import Color from 'color';
import Immutable from 'immutable';

const animatableProperties = {
  height: true,
  width: true,
  minWidth: true,
  maxWidth: true,
  left: true,
  right: true,
  top: true,
  bottom: true,
  margin: true,
  marginLeft: true,
  marginRight: true,
  marginTop: true,
  marginBottom: true,
  padding: true,
  paddingLeft: true,
  paddingRight: true,
  paddingTop: true,
  paddingBottom: true,
  borderWidth: true,
  borderLeftWidth: true,
  borderRightWidth: true,
  borderTopWidth: true,
  borderBottomWidth: true
};

export default class Layer extends ThreeUIComponent {
  
  static isThreeUIDisplayComponent = true;
  
  static contextTypes = {
    computeLayout: PropTypes.func.isRequired
  };
  
  static propTypes = {
    animation: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object
    ]),
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
    animation: null,
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
      geometry: new THREE.PlaneGeometry(0, 0),
      material: new THREE.MeshBasicMaterial()
    };
    this.position = new THREE.Vector3(0, 0, 0);
  }
  
  componentWillMount() {
    this.updateLayout(this.props);
  }
  
  componentWillReceiveProps(nextProps) {
    const currentStyle = Immutable.Map(this.props.style);
    const nextStyle = Immutable.Map(nextProps.style);
    const currentLayout = this.props.layout;
    const nextLayout = nextProps.layout;
    const hasStyleChanged = !currentStyle.equals(nextStyle);
    const hasLayoutChanged = !currentLayout.equals(nextLayout);
    
    // Tween from old layout to new layout
    if (hasLayoutChanged) {
      const animation = nextProps.animation && nextProps.animation !== true ? nextProps.animation : {};
      
      // Ensure layout update happens
      if (!animation) {
        // Pass props because this.props will still be old props
        this.updateLayout(nextProps);
      }
      else {
        const currentLayoutObject = currentLayout.toObject();
        const nextLayoutObject = nextLayout.toObject();
        const that = this;
        const tween = new TWEEN.Tween(currentLayoutObject)
          .to(nextLayoutObject, animation.duration || 1000)
          .delay(animation.delay || 0)
          .easing(animation.easing || TWEEN.Easing.Linear.None)
          .interpolation(animation.interpolation || TWEEN.Interpolation.Linear)
          .onUpdate(function() {
            that.setState({ layoutChanges: this });
            that.updateLayout(nextProps);
          })
          .start();
      }
    }
    // If we have new styles we need to let the root node know so it can compute a new
    // layout. Once a new layout has been computed, we can animate it, etc.
    // If/elseif because they can't both happen at the same time.
    else if (hasStyleChanged) {
      this.context.computeLayout();
    }
  }
  
  updateLayout(props) {
    props = {
      ...props,
      layout: props.layout.merge(this.state.layoutChanges)
    };
    this.setGeometry(props);
    this.setPosition(props);
    this.setMaterial(props);
  }
  
  setGeometry(props) {
    const layout = props.layout.toObject();
    
    this.setState({
      geometry: new THREE.PlaneGeometry(layout.width, layout.height)
    });
  }
  
  setMaterial(props) {
    const style = {
      ...Layer.defaultProps.style,
      ...props.style
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
    this.setState({ material });
  }
  
  setPosition(props) {
    const layout = props.layout.toObject();
    const parentLayout = props.parentLayout.toObject();
    
    const leftBound = (layout.width - parentLayout.width) / 2;
    const topBound = (parentLayout.height - layout.height) / 2;
    this.position.set(leftBound + layout.left, topBound - layout.top, props.elevation);
  }
  
  getChildren() {
    const { children, layout, layoutChildren, animation } = this.props;
    return React.Children.map(children, (child, i) => React.cloneElement(child, {
      parentLayout: layout,
      animation,
      layout: Immutable.Map(layoutChildren[i].layout),
      layoutChildren: layoutChildren[i].children
    }));
  }
  
  render() {    
    return (
      <Mesh
        name={this.props.name}
        geometry={this.state.geometry}
        material={this.state.material}
        position={this.position}>
        {this.getChildren()}
      </Mesh>
    );
  }
}
