'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import TWEEN from 'tween.js';
import { Object3D } from 'react-three';
import computeLayout from 'css-layout';
import Immutable from 'immutable';

function buildStyleTree(node) {
  if (!node || !node.type || node.type.isThreeUIPointerComponent) return null;
  return {
    style: {
      ...node.props.style
    },
    children: React.Children.map(node.props.children, buildStyleTree)
  };
}

export default class UI extends ThreeUIComponent {
  
  static propTypes = {
    children: PropTypes.element.isRequired,
    ppu: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    position: PropTypes.instanceOf(THREE.Vector3),
    rotation: PropTypes.instanceOf(THREE.Euler),
    scale: PropTypes.instanceOf(THREE.Vector3),
    pointers: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      quaternion: PropTypes.instanceOf(THREE.Quaternion),
      position: PropTypes.instanceOf(THREE.Vector3)
    })),
    onPointerIntersect: PropTypes.func
  };
  
  static defaultProps = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1),
    pointers: [],
    onPointerIntersect: () => {}
  };
  
  static childContextTypes = {
    ppu: PropTypes.number.isRequired,
    computeLayout: PropTypes.func.isRequired
  };
  
  constructor(props) {
    super(props);
    this.raycasters = {};
    this.state = {
      styleTree: buildStyleTree({
        type: {
          isThreeUIComponent: true
        },
        props: {
          style: {
            height: props.height,
            width: props.width
          },
          children: props.children
        }
      })
    };
    computeLayout(this.state.styleTree);
  }
  
  componentWillReceiveProps(nextProps) {
    nextProps.pointers.forEach(pointer => {
      if (!this.raycasters[pointer.name]) {
        this.raycasters[pointer.name] = new THREE.Raycaster();
      }
    });
    Object.keys(this.raycasters).forEach(key => {
      if (!nextProps.pointers.find(p => p.name === key)) {
        delete this.raycasters[key];
      }
    });
  }
  
  animate(time) {
    TWEEN.update(time);
    const that = this;
    if (this.refs.ui) {
      this.props.pointers.forEach(pointer => {
        const raycaster = that.raycasters[pointer.name];
        if (!raycaster) return; // Raycaster has not been instantiated yet
        raycaster.set(pointer.position, pointer.quaternion);
        const intersects = raycaster.intersectObject(that.refs.ui, true);
        if (intersects.length > 0) {
          that.props.onPointerIntersect(intersects[0]);
        }
      });
    }
  }
  
  computeLayout() {
    const styleTree = buildStyleTree({
      type: {
        isThreeUIComponent: true
      },
      props: {
        style: {
          height: this.props.height,
          width: this.props.width
        },
        children: this.props.children
      }
    });
    computeLayout(styleTree);
    this.setState({ styleTree });
  }
  
  getChildContext() {
    return {
      ppu: this.props.ppu,
      computeLayout: this.computeLayout.bind(this)
    };
  }
  
  render() {
    const { layout, children: layoutChildren } = this.state.styleTree;
    
    let material = new THREE.MeshBasicMaterial({
      transparent: true
    });
    let geometry = new THREE.PlaneGeometry(layout.width, layout.height);
    let child = React.cloneElement(this.props.children, {
      parentLayout: Immutable.Map(layout),
      layout: Immutable.Map(layoutChildren[0].layout),
      layoutChildren: layoutChildren[0].children
    });
    
    return (
      <Object3D
        ref="ui"
        name={this.props.name}
        geometry={geometry}
        material={material}
        scale={this.props.scale}
        position={this.props.position}
        rotation={this.props.rotation}>
        {child}
      </Object3D>
    );
  }
}