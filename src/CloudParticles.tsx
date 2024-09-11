import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import CANNON from 'cannon';
import TextOverlay from './TextOverlay';

const BlueSkyPastelBalloonCluster: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    
    // Create sky gradient with correct blue colors
    const topColor = new THREE.Color(0x4A90E2);    // Bright blue
    const bottomColor = new THREE.Color(0xA0C4E1); // Soft sky blue
    const gradientTexture = createGradientTexture(topColor, bottomColor);
    scene.background = gradientTexture;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Physics world setup
    const world = new CANNON.World();
    world.gravity.set(0, -0.05, 0); // Very low gravity

    const balloonMaterial = new CANNON.Material('balloon');
    const balloonContactMaterial = new CANNON.ContactMaterial(balloonMaterial, balloonMaterial, {
      restitution: 0.4,
      friction: 0.05
    });
    world.addContactMaterial(balloonContactMaterial);

    // Custom shader material for soft pastel gradient effect
    const gradientMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          vec3 pink = vec3(0.55, 0.70, 0.73); // Darker light pink
          vec3 purple = vec3(0.75, 0.53, 0.60); // Darker dark purple
          vec3 blue = vec3(0.85, 0.91, 0.98);
          
          float t = pow(vNormal.y * 0.5 + 0.5, 0.6);
          vec3 color = mix(blue, purple, t);
          color = mix(color, pink, pow(t, 2.0));
          
          gl_FragColor = vec4(color, 1);
        }
      `,
    });

    const balloons: THREE.Mesh[] = [];
    const balloonBodies: CANNON.Body[] = [];

    const centerBody = new CANNON.Body({ mass: 0 });
    centerBody.position.set(0, 0, 0);
    world.addBody(centerBody);

    const createBalloon = (radius: number, position: THREE.Vector3) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const balloon = new THREE.Mesh(geometry, gradientMaterial);
      balloon.position.copy(position);
      scene.add(balloon);
      balloons.push(balloon);

      const body = new CANNON.Body({
        mass: 0.1,
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3(position.x, position.y, position.z),
        material: balloonMaterial,
        linearDamping: 0.5,
        angularDamping: 0.5,
      });
      world.addBody(body);
      balloonBodies.push(body);

      const constraint = new CANNON.DistanceConstraint(centerBody, body, 2);
      world.addConstraint(constraint);
    };

    // Create a cluster of balloons
    const numBalloons = 14;
    const clusterRadius = 1.5;
    for (let i = 0; i < numBalloons; i++) {
      const radius = 0.5 + Math.random() * 0.2; // Larger balloons
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = clusterRadius * Math.pow(Math.random(), 1/3);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      const z = r * Math.cos(phi);

      createBalloon(radius, new THREE.Vector3(x, y, z));
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      world.step(1 / 60);

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(balloons);

      balloonBodies.forEach((body, index) => {
        body.applyForce(new CANNON.Vec3(0, 0.2, 0), body.position);

        if (intersects.length > 0 && intersects[0].object === balloons[index]) {
          const impulse = new CANNON.Vec3(
            (Math.random() - 0.5) * 0.3,
            0.3 + Math.random() * 0.3,
            (Math.random() - 0.5) * 0.3
          );
          body.applyImpulse(impulse, body.position);
        }

        balloons[index].position.copy(body.position as any);
        balloons[index].quaternion.copy(body.quaternion as any);
      });

      renderer.render(scene, camera);
    };

    // Mouse interaction
    const onMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', onMouseMove);

    camera.position.set(0, 4, 4);
    camera.lookAt(0, 0, 0);

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Function to create gradient texture
  function createGradientTexture(topColor: THREE.Color, bottomColor: THREE.Color) {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 2);
      gradient.addColorStop(0, topColor.getStyle());
      gradient.addColorStop(1, bottomColor.getStyle());
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const handleMenuClick = useCallback(() => {
    setIsTransitioning(true);
    createCharcoalTransition();
    setTimeout(() => {
      window.location.href = '/menu.html';
    }, 2000);
  }, []);

  const createCharcoalTransition = () => {
    const transitionContainer = document.createElement('div');
    transitionContainer.style.position = 'fixed';
    transitionContainer.style.top = '0';
    transitionContainer.style.left = '0';
    transitionContainer.style.width = '100vw';
    transitionContainer.style.height = '100vh';
    transitionContainer.style.zIndex = '1000';
    transitionContainer.style.pointerEvents = 'none';

    const numShapes = 50;
    const charcoalColor = '#222222';

    for (let i = 0; i < numShapes; i++) {
      const shape = document.createElement('div');
      const size = Math.random() * 100 + 50;
      const isSquare = Math.random() > 0.5;

      shape.style.position = 'absolute';
      shape.style.width = `${size}px`;
      shape.style.height = isSquare ? `${size}px` : `${size * 1.5}px`;
      shape.style.backgroundColor = charcoalColor;
      shape.style.left = `${Math.random() * 100}vw`;
      shape.style.top = `${Math.random() * 100}vh`;
      shape.style.transform = 'scale(0)';
      shape.style.transition = `transform ${Math.random() * 0.5 + 1.5}s ease-out`;

      transitionContainer.appendChild(shape);

      setTimeout(() => {
        shape.style.transform = 'scale(1)';
      }, Math.random() * 500);
    }

    document.body.appendChild(transitionContainer);

    setTimeout(() => {
      transitionContainer.style.backgroundColor = charcoalColor;
    }, 1500);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      <TextOverlay />
      
      {/* Hamburger Menu Button */}
      <button 
        onClick={handleMenuClick}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0)',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          transition: 'transform 0.3s',
          zIndex: 1001,
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          width: '40px',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          margin: '5px 0',
          borderRadius: '2px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        }} />
        <div style={{
          width: '40px',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          margin: '5px 0',
          borderRadius: '2px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        }} />
      </button>
    </div>
  );
};

export default BlueSkyPastelBalloonCluster;