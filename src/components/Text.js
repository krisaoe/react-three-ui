'use strict';

import React, { PropTypes } from 'react';
import ThreeUIComponent from './ThreeUIComponent';
import THREE from 'three';
import { Mesh } from 'react-three';
import Color from 'color';

const fontHeightCache = {};

function getFontHeight(fontStyle) {
  let result = fontHeightCache[fontStyle];

  if (!result) {
    let body = document.getElementsByTagName('body')[0];
    let dummy = document.createElement('div');

    let dummyText = document.createTextNode('MÉq');
    dummy.appendChild(dummyText);
    dummy.setAttribute('style', 'font:' + fontStyle + ';position:absolute;top:0;left:0');
    body.appendChild(dummy);
    result = dummy.offsetHeight;

    fontHeightCache[fontStyle] = result;
    body.removeChild(dummy);
  }

  return result;
}

export default class Text extends ThreeUIComponent {
  
  constructor(props) {
    super();
  }
  
  static contextTypes = {
    ppu: PropTypes.number.isRequired
  };
  
  static propTypes = {
    antiAlias: PropTypes.bool,
    style: PropTypes.shape({
      color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Color)
      ]),
      fontFamily: PropTypes.string,
      fontSize: PropTypes.number,
      textAlign: PropTypes.oneOf(['left', 'center', 'right', 'justify'])
    })
  };
  
  static defaultProps = {
    antiAlias: true,
    style: {
      color: '#fff',
      fontFamily: 'sans-serif',
      fontSize: 2,
      textAlign: 'left'
    }
  };
  
  componentWillMount() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  drawText(text) {
    const ppu = this.context.ppu;
    let { layout, style } = this.props;
    style = {
      ...Text.defaultProps.style,
      ...style
    };
    const font = `${style.fontSize * ppu}px ${style.fontFamily}`;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // this.textWidth = Math.ceil(this.ctx.measureText(text).width);
    // this.textHeight = getFontHeight(this.ctx.font);

    // this.canvas.width = this.textWidth;
    // this.canvas.height = this.textHeight;
    this.canvas.height = ppu * layout.height;
    this.canvas.width = ppu * layout.width;
    
    this.ctx.textAlign = style.textAlign;
    this.ctx.textBaseline = 'top';

    this.ctx.font = font;
    this.ctx.fillStyle = Color(style.color).rgbString();
    this.ctx.fillText(text, 0, 0);
  }
  
  render() {
    let { antiAlias, style, layout } = this.props;
    style = {
      ...Text.defaultProps.style,
      ...style
    };
    const text = React.Children.toArray(this.props.children).join('');
    
    this.drawText(text);
    let texture = new THREE.Texture(this.canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    
    if (antiAlias) {
      texture.magFilter = THREE.NearestFilter;
    }
    
    const geometry = new THREE.PlaneGeometry(layout.width, layout.height);
    const position = new THREE.Vector3(layout.left, layout.top, 0);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true
    });

    return (
      <Mesh
        name={this.props.name}
        geometry={geometry}
        material={material}
        position={position}/>
    );
  }
}