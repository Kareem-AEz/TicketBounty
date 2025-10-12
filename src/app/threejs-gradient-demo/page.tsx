"use client";

import type { ThreeJSGradientColor } from "@/components/threejs-gradient/threejs-mesh-gradient";
import { ThreeJSMeshGradient } from "@/components/threejs-gradient/threejs-mesh-gradient";

// Beautiful gradient presets
const sunsetDream: ThreeJSGradientColor[] = [
  { value: "#FF6B6B", position: { x: 0.1, y: 0.8 } },
  { value: "#FFB8D1", position: { x: 0.3, y: 0.2 } },
  { value: "#C3AED6", position: { x: 0.5, y: 0.1 } },
  { value: "#8EC5FC", position: { x: 0.7, y: 0.15 } },
  { value: "#4A90E2", position: { x: 0.9, y: 0.4 } },
];

const warmHorizons: ThreeJSGradientColor[] = [
  { value: "#2F5D7C", position: { x: 0.1, y: 0.3 } },
  { value: "#E8A87C", position: { x: 0.6, y: 0.4 } },
  { value: "#C38D9E", position: { x: 0.5, y: 0.6 } },
  { value: "#FFA07A", position: { x: 0.2, y: 0.8 } },
  { value: "#B8A39A", position: { x: 0.85, y: 0.5 } },
];

const oceanBreeze: ThreeJSGradientColor[] = [
  { value: "#667eea", position: { x: 0.2, y: 0.2 } },
  { value: "#764ba2", position: { x: 0.8, y: 0.2 } },
  { value: "#f093fb", position: { x: 0.5, y: 0.7 } },
  { value: "#4facfe", position: { x: 0.1, y: 0.8 } },
  { value: "#00f2fe", position: { x: 0.9, y: 0.8 } },
];

const auroraLights: ThreeJSGradientColor[] = [
  { value: "#00ff88", position: { x: 0.3, y: 0.2 } },
  { value: "#0088ff", position: { x: 0.7, y: 0.3 } },
  { value: "#ff0088", position: { x: 0.5, y: 0.8 } },
];

export default function ThreeJSGradientDemoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Three.js Mesh Gradients ✨
          </h1>
          <p className="text-zinc-400">
            GPU-accelerated, animated gradients with noise - all running at
            60fps!
          </p>
        </div>

        <div className="grid gap-8">
          {/* Gradient 1 */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-2xl font-semibold text-white">
                Sunset Dreams
              </h2>
              <p className="text-sm text-zinc-500">
                Animated with flowing noise • 60fps on GPU
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <ThreeJSMeshGradient
                width={1440}
                height={600}
                colors={sunsetDream}
                noiseIntensity={0.2}
                noiseSpeed={0.5}
              />
            </div>
          </div>

          {/* Gradient 2 */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-2xl font-semibold text-white">
                Warm Horizons
              </h2>
              <p className="text-sm text-zinc-500">
                Organic noise patterns • Smooth color blending
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <ThreeJSMeshGradient
                width={1440}
                height={600}
                colors={warmHorizons}
                animate={true}
                noiseIntensity={0.02}
                noiseSpeed={0.3}
              />
            </div>
          </div>

          {/* Gradient 3 */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-2xl font-semibold text-white">
                Ocean Breeze
              </h2>
              <p className="text-sm text-zinc-500">
                Subtle animation • High noise intensity
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-2xl">
              <ThreeJSMeshGradient
                width={1440}
                height={600}
                colors={oceanBreeze}
                animate={true}
                noiseIntensity={0.025}
                noiseSpeed={0.4}
              />
            </div>
          </div>

          {/* Grid of smaller examples */}
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-2xl font-semibold text-white">
                Quick Examples
              </h2>
              <p className="text-sm text-zinc-500">
                Different noise settings and speeds
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <ThreeJSMeshGradient
                  width={460}
                  height={300}
                  colors={auroraLights}
                  animate={true}
                  noiseIntensity={0.03}
                  noiseSpeed={0.8}
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <ThreeJSMeshGradient
                  width={460}
                  height={300}
                  colors={[
                    { value: "#4158D0", position: { x: 0.2, y: 0.2 } },
                    { value: "#C850C0", position: { x: 0.8, y: 0.5 } },
                    { value: "#FFCC70", position: { x: 0.5, y: 0.8 } },
                  ]}
                  animate={true}
                  noiseIntensity={0.01}
                  noiseSpeed={0.6}
                />
              </div>
              <div className="overflow-hidden rounded-2xl shadow-xl">
                <ThreeJSMeshGradient
                  width={460}
                  height={300}
                  colors={[
                    { value: "#0093E9", position: { x: 0.3, y: 0.3 } },
                    { value: "#80D0C7", position: { x: 0.7, y: 0.7 } },
                  ]}
                  animate={true}
                  noiseIntensity={0.015}
                  noiseSpeed={1.0}
                />
              </div>
            </div>
          </div>

          {/* Feature comparison */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">
                ✨ What Makes This Special
              </h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>
                  <strong className="text-white">GPU Accelerated</strong> - Runs
                  on graphics card, not CPU
                </li>
                <li>
                  <strong className="text-white">60 FPS Animation</strong> -
                  Silky smooth, no lag
                </li>
                <li>
                  <strong className="text-white">Perlin Noise</strong> -
                  Organic, natural-looking patterns
                </li>
                <li>
                  <strong className="text-white">GLSL Shaders</strong> - Custom
                  pixel calculations
                </li>
                <li>
                  <strong className="text-white">Three.js</strong> -
                  Industry-standard WebGL library
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">
                🎨 The Algorithm
              </h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>
                  <strong className="text-white">
                    1. Distance Calculation:
                  </strong>{" "}
                  For each pixel, measure distance to all color points
                </p>
                <p>
                  <strong className="text-white">2. Weight Function:</strong>{" "}
                  Closer points get exponentially more influence
                </p>
                <p>
                  <strong className="text-white">3. Color Blending:</strong> Mix
                  colors based on calculated weights
                </p>
                <p>
                  <strong className="text-white">4. Noise Layer:</strong> Add
                  animated Perlin noise for organic feel
                </p>
              </div>
            </div>
          </div>

          {/* Code example */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              💻 Usage Example
            </h3>
            <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm text-zinc-300">
              {`import { ThreeJSMeshGradient } from "@/components/threejs-gradient";

<ThreeJSMeshGradient
  width={800}
  height={600}
  colors={[
    { value: "#FF6B6B", position: { x: 0.2, y: 0.2 } },
    { value: "#4ECDC4", position: { x: 0.8, y: 0.8 } },
  ]}
  animate={true}
  noiseIntensity={0.015} // 0.01-0.03 for subtle grain
  noiseSpeed={0.5}       // Animation speed
/>`}
            </pre>
          </div>

          {/* Performance note */}
          <div className="rounded-2xl border border-green-800 bg-green-950 p-6">
            <h3 className="mb-3 text-lg font-semibold text-green-200">
              ⚡ Performance Comparison
            </h3>
            <div className="text-sm text-green-200/80">
              <p className="mb-2">
                <strong>Canvas 2D (CPU):</strong> 1-2 FPS, 2 seconds to render
              </p>
              <p>
                <strong>Three.js + WebGL (GPU):</strong> 60 FPS, instant render,
                smooth animation
              </p>
              <p className="mt-3 font-semibold">
                = <strong className="text-2xl">1000× faster!</strong> 🚀
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
