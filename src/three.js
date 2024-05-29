import React, { useEffect, useRef } from 'react';
import Logo from './adfsadfs.svg';

import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  TextureLoader,
  WebGLRenderer,
  LinearFilter,
  LinearMipMapLinearFilter,
  Vector2,
} from 'three';

export const ThreeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let renderer;
    let animationId;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const initializeThree = () => {
      const scene = new Scene();
      const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
      renderer = new WebGLRenderer({ antialias: true });
      renderer.setClearColor(0xffffff, 0);
      renderer.setSize(width, height);
      canvasRef.current.appendChild(renderer.domElement);

      // Load texture
      const texture = new TextureLoader().load(Logo);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.minFilter = LinearMipMapLinearFilter;
      texture.magFilter = LinearFilter;

      let shaderUniforms = {
        u_mouse: { type: 'v2', value: new Vector2() },
        u_prevMouse: { type: 'v2', value: new Vector2() },
        u_aberrationIntensity: { type: 'f', value: 0.0 },
        u_texture: { type: 't', value: texture },
      };

      const material = new ShaderMaterial({
        uniforms: {
          shaderUniforms,
        },
        vertexShader: `
           varying vec2 vUv;
           void main() {
             vUv = uv;
             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
           }
        `,
        fragmentShader: `
           uniform sampler2D texture1;
           varying vec2 vUv;
           void main() {
             gl_FragColor = texture2D(texture1, vUv);
           }
        `,
      });

      const geometry = new PlaneGeometry(2, 2);
      const plane = new Mesh(geometry, material);
      scene.add(plane);
      camera.position.z = 1.2;

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    };

    initializeThree();

    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      // Cleanup the canvas
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div ref={canvasRef} style={{ width: '100vw', height: '100vh' }}></div>
  );
};

export default ThreeCanvas;
