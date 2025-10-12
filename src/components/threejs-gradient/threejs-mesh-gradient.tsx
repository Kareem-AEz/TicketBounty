"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ThreeJSGradientColor {
  value: string; // hex color
  position: { x: number; y: number }; // normalized 0-1
}

export interface ThreeJSMeshGradientProps {
  width?: number;
  height?: number;
  colors?: ThreeJSGradientColor[];
  animate?: boolean;
  noiseIntensity?: number;
  noiseSpeed?: number;
  className?: string;
}

const defaultColors: ThreeJSGradientColor[] = [
  { value: "#FF6B6B", position: { x: 0.1, y: 0.8 } },
  { value: "#FFB8D1", position: { x: 0.3, y: 0.2 } },
  { value: "#C3AED6", position: { x: 0.5, y: 0.1 } },
  { value: "#8EC5FC", position: { x: 0.7, y: 0.15 } },
  { value: "#4A90E2", position: { x: 0.9, y: 0.4 } },
];

export function ThreeJSMeshGradient({
  width = 800,
  height = 600,
  colors = defaultColors,
  animate = true,
  noiseIntensity = 0.3,
  noiseSpeed = 0.5,
  className = "",
}: ThreeJSMeshGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentContainer = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentContainer.appendChild(renderer.domElement);

    // Convert colors to Three.js format
    const colorData: number[] = [];
    const positionData: number[] = [];

    colors.forEach((color) => {
      const threeColor = new THREE.Color(color.value);
      colorData.push(threeColor.r, threeColor.g, threeColor.b);
      positionData.push(color.position.x, color.position.y);
    });

    // Pad arrays to 5 colors (15 floats) and 5 positions (10 floats)
    while (colorData.length < 15) colorData.push(0, 0, 0);
    while (positionData.length < 10) positionData.push(0, 0);

    // Shader Material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColors: { value: colorData },
        uPositions: { value: positionData },
        uNumPoints: { value: colors.length },
        uNoiseIntensity: { value: noiseIntensity },
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uColors[15];  // 5 colors * 3 (RGB)
        uniform float uPositions[10]; // 5 positions * 2 (XY)
        uniform int uNumPoints;
        uniform float uNoiseIntensity;
        
        varying vec2 vUv;
        
        // 3D Simplex Noise (much smoother than 2D Perlin!)
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) { 
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        // Smootherstep - ultra smooth interpolation
        float smootherstep(float edge0, float edge1, float x) {
          x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
          return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
        }
        
        // Random function for grain
        float rand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }
        
        // Get color from flat array
        vec3 getColor(int i) {
          int idx = i * 3;
          return vec3(uColors[idx], uColors[idx + 1], uColors[idx + 2]);
        }
        
        // Get position from flat array  
        vec2 getPosition(int i) {
          int idx = i * 2;
          return vec2(uPositions[idx], uPositions[idx + 1]);
        }
        
        void main() {
          vec2 st = vUv;
          
          // Apply 3D simplex noise distortion (much smoother!)
          float warpSize = 3.0;
          vec2 warp = vec2(snoise(vec3(st * warpSize, uTime * 0.2))) * uNoiseIntensity * 0.08;
          vec2 distortedSt = st + warp;
          
          // Enhanced Bezier gradient with Gaussian distribution
          vec3 color = vec3(0.0);
          float totalWeight = 0.0;
          float sigma = 0.20;  // Gaussian spread
          float twoSigmaSquare = 2.0 * sigma * sigma;
          
          for(int i = 0; i < 5; i++) {
            if(i >= uNumPoints) break;
            
            vec2 pointPos = getPosition(i);
            float dist = distance(distortedSt, pointPos);
            
            // Gaussian weight (exponential falloff)
            float weight = exp(-dist * dist / twoSigmaSquare);
            
            // Apply smootherstep for even smoother transitions
            weight = smootherstep(0.0, 1.0, weight);
            
            color += getColor(i) * weight;
            totalWeight += weight;
          }
          
          // Normalize
          if(totalWeight > 0.0) {
            color /= totalWeight;
            
            // Subtle vibrancy boost
            color = mix(color, pow(color, vec3(0.95)), 0.25);
          }
          
          // Add visible noise/grain texture (like Daniel D's implementation)
          vec3 noise = vec3(rand(vec2(st.x * 5.0 + uTime * 0.5, st.y * 5.0 - uTime * 0.5)));
          vec3 finalColor = mix(color, noise, uNoiseIntensity);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });

    // Create plane geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate_loop = () => {
      if (animate) {
        material.uniforms.uTime.value = clock.getElapsedTime() * noiseSpeed;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate_loop);
    };

    animate_loop();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (
        currentContainer &&
        renderer.domElement.parentNode === currentContainer
      ) {
        currentContainer.removeChild(renderer.domElement);
      }
    };
  }, [width, height, colors, animate, noiseIntensity, noiseSpeed]);

  return (
    <div ref={containerRef} className={className} style={{ lineHeight: 0 }} />
  );
}
