"use client";

import React, { useEffect, useRef } from "react";

export interface MeshGradientColor {
  value: string; // hex color
  position?: { x: number; y: number }; // normalized 0-1
}

export interface MeshGradientProps {
  width?: number;
  height?: number;
  colors?: MeshGradientColor[];
  animate?: boolean;
  noiseRatio?: number;
  warpRatio?: number;
  warpSize?: number;
  className?: string;
  pixelDensity?: number;
}

const defaultColors: MeshGradientColor[] = [
  { value: "#FF6B6B", position: { x: 0.1, y: 0.1 } },
  { value: "#4ECDC4", position: { x: 0.9, y: 0.1 } },
  { value: "#45B7D1", position: { x: 0.5, y: 0.5 } },
  { value: "#FFA07A", position: { x: 0.1, y: 0.9 } },
  { value: "#98D8C8", position: { x: 0.9, y: 0.9 } },
];

export function MeshGradient({
  width = 800,
  height = 600,
  colors = defaultColors,
  animate = true,
  noiseRatio = 0.05,
  warpRatio = 0.15,
  warpSize = 2.0,
  className = "",
  pixelDensity = 1,
}: MeshGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentContainer = containerRef.current;

    // Dynamically import p5 only on client-side
    import("p5").then((p5Module) => {
      const p5 = p5Module.default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sketch = (p: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let theShader: any;
        let positions: number[] = [];
        let rgbColors: number[] = [];

        // Helper function to convert hex to RGB (normalized 0-1)
        const hexToRgb = (hex: string): number[] => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? [
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
              ]
            : [0, 0, 0];
        };

        // Generate positions and colors
        const setupColorsAndPositions = () => {
          positions = [];
          rgbColors = [];

          colors.forEach((colorObj, index) => {
            // Use provided position or generate grid position
            if (colorObj.position) {
              positions.push(colorObj.position.x, colorObj.position.y);
            } else {
              const gridSize = Math.ceil(Math.sqrt(colors.length));
              const row = Math.floor(index / gridSize);
              const col = index % gridSize;
              positions.push((col + 0.5) / gridSize, (row + 0.5) / gridSize);
            }

            const rgb = hexToRgb(colorObj.value);
            rgbColors.push(...rgb);
          });

          // Pad arrays to size 9 (shader expects max 9 points)
          while (positions.length < 18) positions.push(0, 0);
          while (rgbColors.length < 27) rgbColors.push(0, 0, 0);
        };

        // Fragment shader
        const fragShader = `
precision highp float;

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_colors[27]; // 9 colors * 3 (RGB) = 27
uniform float u_positions[18]; // 9 positions * 2 (XY) = 18
uniform int u_numberPoints;
uniform float u_noiseRatio;
uniform float u_warpRatio;
uniform float u_warpSize;

// Helper to get color by index
vec3 getColor(int i) {
  int idx = i * 3;
  return vec3(u_colors[idx], u_colors[idx + 1], u_colors[idx + 2]);
}

// Helper to get position by index
vec2 getPosition(int i) {
  int idx = i * 2;
  return vec2(u_positions[idx], u_positions[idx + 1]);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 2.0;
  for(int i = 0; i < 4; i++) {
    value += amplitude * noise(st * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 st = vTexCoord;
  vec2 pos = st;
  
  if(u_warpRatio > 0.0) {
    float warp = fbm(pos * u_warpSize + u_time * 0.1) * u_warpRatio;
    pos.x += warp * 0.1;
    pos.y += warp * 0.1;
  }
  
  vec3 finalColor = vec3(0.0);
  float totalWeight = 0.0;
  
  // Manually unroll loop for WebGL compatibility (requires constant indices)
  if(u_numberPoints > 0) {
    vec2 p0 = getPosition(0);
    float d0 = distance(pos, p0);
    float w0 = 1.0 / (1.0 + d0 * d0 * 4.0);
    finalColor += getColor(0) * w0;
    totalWeight += w0;
  }
  if(u_numberPoints > 1) {
    vec2 p1 = getPosition(1);
    float d1 = distance(pos, p1);
    float w1 = 1.0 / (1.0 + d1 * d1 * 4.0);
    finalColor += getColor(1) * w1;
    totalWeight += w1;
  }
  if(u_numberPoints > 2) {
    vec2 p2 = getPosition(2);
    float d2 = distance(pos, p2);
    float w2 = 1.0 / (1.0 + d2 * d2 * 4.0);
    finalColor += getColor(2) * w2;
    totalWeight += w2;
  }
  if(u_numberPoints > 3) {
    vec2 p3 = getPosition(3);
    float d3 = distance(pos, p3);
    float w3 = 1.0 / (1.0 + d3 * d3 * 4.0);
    finalColor += getColor(3) * w3;
    totalWeight += w3;
  }
  if(u_numberPoints > 4) {
    vec2 p4 = getPosition(4);
    float d4 = distance(pos, p4);
    float w4 = 1.0 / (1.0 + d4 * d4 * 4.0);
    finalColor += getColor(4) * w4;
    totalWeight += w4;
  }
  if(u_numberPoints > 5) {
    vec2 p5 = getPosition(5);
    float d5 = distance(pos, p5);
    float w5 = 1.0 / (1.0 + d5 * d5 * 4.0);
    finalColor += getColor(5) * w5;
    totalWeight += w5;
  }
  if(u_numberPoints > 6) {
    vec2 p6 = getPosition(6);
    float d6 = distance(pos, p6);
    float w6 = 1.0 / (1.0 + d6 * d6 * 4.0);
    finalColor += getColor(6) * w6;
    totalWeight += w6;
  }
  if(u_numberPoints > 7) {
    vec2 p7 = getPosition(7);
    float d7 = distance(pos, p7);
    float w7 = 1.0 / (1.0 + d7 * d7 * 4.0);
    finalColor += getColor(7) * w7;
    totalWeight += w7;
  }
  if(u_numberPoints > 8) {
    vec2 p8 = getPosition(8);
    float d8 = distance(pos, p8);
    float w8 = 1.0 / (1.0 + d8 * d8 * 4.0);
    finalColor += getColor(8) * w8;
    totalWeight += w8;
  }
  
  if(totalWeight > 0.0) {
    finalColor /= totalWeight;
  }
  
  if(u_noiseRatio > 0.0) {
    float noiseValue = fbm(st * 5.0 + u_time * 0.05) * u_noiseRatio;
    finalColor += vec3(noiseValue * 0.03);
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

        // Vertex shader
        const vertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}
`;

        p.setup = () => {
          p.createCanvas(width, height, p.WEBGL);
          p.pixelDensity(pixelDensity);
          p.noStroke();

          theShader = p.createShader(vertShader, fragShader);
          setupColorsAndPositions();

          console.log("Shader created, colors:", colors.length);
          console.log("Positions:", positions.slice(0, 10));
          console.log("RGB Colors:", rgbColors.slice(0, 9));
        };

        p.draw = () => {
          if (!theShader) {
            return;
          }

          p.shader(theShader);

          theShader.setUniform("u_resolution", [width, height]);
          theShader.setUniform("u_time", animate ? p.millis() / 1000.0 : 0);
          theShader.setUniform("u_numberPoints", colors.length);
          theShader.setUniform("u_noiseRatio", noiseRatio);
          theShader.setUniform("u_warpRatio", warpRatio);
          theShader.setUniform("u_warpSize", warpSize);

          // Set flattened color and position arrays
          theShader.setUniform("u_colors", rgbColors);
          theShader.setUniform("u_positions", positions);

          // Draw a quad that covers the canvas with proper texture coordinates
          p.beginShape();
          p.vertex(-width / 2, -height / 2, 0, 0, 0);
          p.vertex(width / 2, -height / 2, 0, 1, 0);
          p.vertex(width / 2, height / 2, 0, 1, 1);
          p.vertex(-width / 2, height / 2, 0, 0, 1);
          p.endShape(p.CLOSE);
        };
      };

      p5InstanceRef.current = new p5(sketch, currentContainer);
    });

    return () => {
      p5InstanceRef.current?.remove();
      p5InstanceRef.current = null;
    };
  }, [
    width,
    height,
    colors,
    animate,
    noiseRatio,
    warpRatio,
    warpSize,
    pixelDensity,
  ]);

  return (
    <div className={className} ref={containerRef} style={{ lineHeight: 0 }} />
  );
}
