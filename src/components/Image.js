'use strict';

import React, { PropTypes } from 'react';
import THREE from 'three';
import { Mesh } from 'react-three';
import Layer from './Layer';
import Color from 'color';

export default class Image extends Layer {
  
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      image: null
    };
  }
  
  componentWillMount() {
    const loader = new THREE.ImageLoader();
    loader.load(this.props.source, (image) => {
      this.setState({ image });
    });
  }
  
  getGeometry() {
    const { css } = this.props;
    return new THREE.PlaneGeometry(css.layout.width, css.layout.height);
  }
  
  getMaterial() {
    const { style } = this.props;
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true
    });
    if (this.state.image) {
      let texture = new THREE.Texture(this.state.image);
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      material.map = texture;
    }
    return material;
  }
}
