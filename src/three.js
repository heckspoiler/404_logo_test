import React, { useEffect, useRef } from 'react';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  //   Group,
  //   MeshBasicMaterial,
  //   Mesh,
  //   ShapeGeometry,
  //   DoubleSide,
  //   Box3,
  //   Vector3,
  ImageLoader,
} from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import imageURL from './logo.png';

const ThreeCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(new Color(0xffffff), 0.1);
    canvasRef.current.appendChild(renderer.domElement);

    // instantiate a loader
    const loader = new ImageLoader();

    // load a image resource
    loader.load(
      imageURL,

      function (image) {
        // use the image, e.g. draw part of it on a canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(image, 100, 100);
      },
      undefined,

      function () {
        console.error('An error happened.');
      }
    );
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();
  }, []);

  return <div ref={canvasRef} />;
};

export default ThreeCanvas;
