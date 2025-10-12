"use client";

import { useEffect, useRef } from "react";

export default function SimpleGradientDemoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Color points
    const points = [
      { x: 0.1, y: 0.8, r: 255, g: 107, b: 107 }, // Coral red
      { x: 0.3, y: 0.2, r: 255, g: 184, b: 209 }, // Pink
      { x: 0.5, y: 0.1, r: 195, g: 174, b: 214 }, // Lavender
      { x: 0.7, y: 0.15, r: 142, g: 197, b: 252 }, // Light blue
      { x: 0.9, y: 0.4, r: 74, g: 144, b: 226 }, // Blue
    ];

    const width = canvas.width;
    const height = canvas.height;

    // Create image data (raw pixel array)
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Calculate color for each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Normalize coordinates to 0-1
        const nx = x / width;
        const ny = y / height;

        let finalR = 0;
        let finalG = 0;
        let finalB = 0;
        let totalWeight = 0;

        // Calculate contribution from each color point
        points.forEach((point) => {
          // Calculate distance
          const dx = nx - point.x;
          const dy = ny - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Weight decreases with distance (inverse square law)
          const weight = 1 / (1 + distance * distance * 4);

          // Add weighted color
          finalR += point.r * weight;
          finalG += point.g * weight;
          finalB += point.b * weight;
          totalWeight += weight;
        });

        // Normalize by total weight
        finalR /= totalWeight;
        finalG /= totalWeight;
        finalB /= totalWeight;

        // Set pixel color in image data
        const index = (y * width + x) * 4;
        data[index] = Math.round(finalR); // R
        data[index + 1] = Math.round(finalG); // G
        data[index + 2] = Math.round(finalB); // B
        data[index + 3] = 255; // A (fully opaque)
      }
    }

    // Put the image data on canvas
    ctx.putImageData(imageData, 0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Simple Mesh Gradient (Canvas 2D)
          </h1>
          <p className="text-zinc-400">
            Pure JavaScript implementation - no WebGL needed! View source to see
            the algorithm.
          </p>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl bg-zinc-900 p-1 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={1440}
              height={600}
              className="w-full rounded-2xl"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">
                🎨 How It Works
              </h3>
              <ol className="space-y-2 text-sm text-zinc-300">
                <li>
                  <strong className="text-white">1. Define color points</strong>{" "}
                  - Each has x, y position and RGB color
                </li>
                <li>
                  <strong className="text-white">2. For each pixel</strong> -
                  Calculate distance to all points
                </li>
                <li>
                  <strong className="text-white">3. Calculate weights</strong> -
                  Closer points = more influence
                </li>
                <li>
                  <strong className="text-white">4. Blend colors</strong> - Mix
                  colors based on weights
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">
                📊 The Math
              </h3>
              <div className="space-y-3 text-sm text-zinc-300">
                <div>
                  <strong className="text-white">Distance:</strong>
                  <code className="mt-1 block rounded bg-zinc-800 p-2 text-xs">
                    d = √((x2-x1)² + (y2-y1)²)
                  </code>
                </div>
                <div>
                  <strong className="text-white">Weight:</strong>
                  <code className="mt-1 block rounded bg-zinc-800 p-2 text-xs">
                    w = 1 / (1 + d² × 4)
                  </code>
                </div>
                <div>
                  <strong className="text-white">Final Color:</strong>
                  <code className="mt-1 block rounded bg-zinc-800 p-2 text-xs">
                    color = Σ(point.color × weight) / Σweights
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              💡 Why This Works
            </h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>
                <strong className="text-white">Inverse Square Law:</strong> The
                weight formula{" "}
                <code className="text-teal-400">1/(1 + d²×4)</code> creates
                natural falloff. Points close to a pixel dominate its color,
                while distant points contribute less.
              </p>
              <p>
                <strong className="text-white">Normalized Blending:</strong>{" "}
                Dividing by total weight ensures colors always add up correctly,
                preventing overexposure or darkness.
              </p>
              <p>
                <strong className="text-white">Canvas 2D vs WebGL:</strong> This
                runs on CPU (slower) but is simpler to understand. WebGL does
                the SAME calculation on GPU (1000× faster) using shaders.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-800 bg-amber-950 p-6">
            <h3 className="mb-3 text-lg font-semibold text-amber-200">
              ⚡ Performance Note
            </h3>
            <p className="text-sm text-amber-200/80">
              This Canvas 2D version calculates <strong>864,000 pixels</strong>{" "}
              on the CPU - it takes a moment to render. The WebGL version does
              the same calculation on the GPU in milliseconds and can animate at
              60fps!
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="mb-3 text-lg font-semibold text-white">
              🚀 Next Steps
            </h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li>✅ You just saw the algorithm work!</li>
              <li>
                📖 Read{" "}
                <code className="text-teal-400">
                  docs/LEARNING_MESH_GRADIENTS.md
                </code>
              </li>
              <li>🎓 Learn GLSL shaders to make it 1000× faster</li>
              <li>✨ Add noise, animation, and interaction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
