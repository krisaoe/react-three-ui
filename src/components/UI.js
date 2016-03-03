'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import TWEEN from 'tween.js';
import { Object3D } from 'react-three';
import computeLayout from 'css-layout';
import Immutable from 'immutable';

function buildStyleTree(node) {
  if (typeof node !== 'object' || !node.type) return null;
  if (!node.type.isThreeUIComponent) {
    // Naive implementation where if a child of a Layer is not a ThreeUIComponent
    // we'll try to use a child that is a ThreeUIComponent
    child = React.Children.toArray(node.props.children).find(c => c.type.isThreeUIComponent);
  }
  return {
    style: {
      ...node.props.style
    },
    children: React.Children.map(node.props.children, buildStyleTree)
  };
}

export default class UI extends ThreeUIComponent {
  
  static propTypes = {
    ppu: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    position: PropTypes.instanceOf(THREE.Vector3),
    rotation: PropTypes.instanceOf(THREE.Euler),
    scale: PropTypes.instanceOf(THREE.Vector3)
  };
  
  static defaultProps = {
    position: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1)
  };
  
  static childContextTypes = {
    ppu: PropTypes.number.isRequired,
    computeLayout: PropTypes.func.isRequired
  };
  
  constructor(props) {
    super(props);
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
  
  animate(time) {
    TWEEN.update(time);
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
    const children = React.Children.map(this.props.children, (child, i) => {
        return React.cloneElement(child, {
          parentLayout: Immutable.Map(layout),
          layout: Immutable.Map(layoutChildren[i].layout),
          layoutChildren: layoutChildren[i].children
        });
    });
    
    let material = new THREE.MeshBasicMaterial({
      transparent: true
    });
    let geometry = new THREE.PlaneGeometry(layout.width, layout.height);
    
    return (
      <Object3D
        name={this.props.name}
        geometry={geometry}
        material={material}
        scale={this.props.scale}
        position={this.props.position}
        rotation={this.props.rotation}>
        {children}
      </Object3D>
    );
  }
}