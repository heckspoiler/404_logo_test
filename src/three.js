import React, { useEffect, useRef } from 'react';
import Logo from './logo_background_white.png';

import {
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  WebGLRenderer,
  Vector2,
} from 'three';

export const ThreeCanvas = () => {
  const canvasRef = useRef(null);
  let easeFactor = 0.02;
  let mousePosition = { x: 0.5, y: 0.5 };
  let targetMousePosition = { x: 0.5, y: 0.5 };
  let aberrationIntensity = 0.0;
  let prevPosition = { x: 0.5, y: 0.5 };

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

      // Clear the canvas container
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
        canvasRef.current.appendChild(renderer.domElement);
      }

      // Load texture
      const texture = new TextureLoader().load(Logo);

      const uniforms = {
        u_mouse: { value: new Vector2() },
        u_prevMouse: { value: new Vector2() },
        u_aberrationIntensity: { value: 0.1 },
        u_texture: { value: texture },
      };

      const material = new ShaderMaterial({
        uniforms,
        vertexShader: `
           varying vec2 vUv;
           void main() {
             vUv = uv;
             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
           }
        `,
        fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D u_texture;    
        uniform vec2 u_mouse;
        uniform vec2 u_prevMouse;
        uniform float u_aberrationIntensity;
    
        void main() {
            vec2 gridUV = floor(vUv * vec2(20.0, 400.0)) / vec2(400.0, 400.0);
            vec2 centerOfPixel = gridUV + vec2(1.0/400.0, 1.0/20.0);
            
            vec2 mouseDirection = u_mouse - u_prevMouse;
            
            vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
            float pixelDistanceToMouse = length(pixelToMouseDirection);
            float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);
     
            vec2 uvOffset = strength * - mouseDirection * 0.2;
            vec2 uv = vUv - uvOffset;
    
            vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.9, 0.0));
            vec4 colorG = texture2D(u_texture, uv);
            vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.9, 0.0));
    
            gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
        }
        `,
      });

      const geometry = new PlaneGeometry(2, 2);
      const plane = new Mesh(geometry, material);
      scene.add(plane);
      camera.position.z = 1.2;

      const animateScene = () => {
        animationId = requestAnimationFrame(animateScene);

        mousePosition.x +=
          (targetMousePosition.x - mousePosition.x) * easeFactor;
        mousePosition.y +=
          (targetMousePosition.y - mousePosition.y) * easeFactor;

        plane.material.uniforms.u_mouse.value.set(
          mousePosition.x,
          1.0 - mousePosition.y
        );
        plane.material.uniforms.u_prevMouse.value.set(
          prevPosition.x,
          1.0 - prevPosition.y
        );

        aberrationIntensity = Math.max(0.0, aberrationIntensity - 0.05);
        plane.material.uniforms.u_aberrationIntensity.value =
          aberrationIntensity;

        renderer.render(scene, camera);
      };
      animateScene();

      const handleMouseMove = (event) => {
        easeFactor = 0.02;
        const rect = canvasRef.current.getBoundingClientRect();
        prevPosition = { ...targetMousePosition };

        targetMousePosition.x = (event.clientX - rect.left) / rect.width;
        targetMousePosition.y = (event.clientY - rect.top) / rect.height;

        aberrationIntensity = 1;
      };

      const handleMouseEnter = (event) => {
        easeFactor = 0.02;
        const rect = canvasRef.current.getBoundingClientRect();

        mousePosition.x = targetMousePosition.x =
          (event.clientX - rect.left) / rect.width;
        mousePosition.y = targetMousePosition.y =
          (event.clientY - rect.top) / rect.height;
      };

      const handleMouseLeave = () => {
        easeFactor = 0.05;
        targetMousePosition = { ...prevPosition };
      };

      // Add event listeners to the canvas element
      if (canvasRef.current) {
        canvasRef.current.addEventListener('mousemove', handleMouseMove);
        canvasRef.current.addEventListener('mouseenter', handleMouseEnter);
        canvasRef.current.addEventListener('mouseleave', handleMouseLeave);
      }
    };

    initializeThree();

    return () => {
      if (renderer) {
        renderer.dispose();
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
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
