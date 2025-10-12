// Fragment Shader
#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTexCoord;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[9];
uniform vec2 u_positions[9];
uniform int u_numberPoints;
uniform float u_noiseRatio;
uniform float u_warpRatio;
uniform float u_warpSize;

// Simple noise function
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

// Fractal Brownian Motion for more organic noise
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
  
  // Apply warp effect
  if(u_warpRatio > 0.0) {
    float warp = fbm(pos * u_warpSize + u_time * 0.1) * u_warpRatio;
    pos.x += warp * 0.1;
    pos.y += warp * 0.1;
  }
  
  // Calculate weighted color based on distance to points
  vec3 finalColor = vec3(0.0);
  float totalWeight = 0.0;
  
  for(int i = 0; i < 9; i++) {
    if(i >= u_numberPoints) break;
    
    vec2 pointPos = u_positions[i];
    float dist = distance(pos, pointPos);
    
    // Smooth falloff function (inverse square with smoothing)
    float weight = 1.0 / (1.0 + dist * dist * 4.0);
    
    finalColor += u_colors[i] * weight;
    totalWeight += weight;
  }
  
  if(totalWeight > 0.0) {
    finalColor /= totalWeight;
  }
  
  // Add subtle noise for organic feel
  if(u_noiseRatio > 0.0) {
    float noiseValue = fbm(st * 5.0 + u_time * 0.05) * u_noiseRatio;
    finalColor += vec3(noiseValue * 0.03);
  }
  
  gl_FragColor = vec4(finalColor, 1.0);
}

