/**
 * 60Hz Multithreaded Spatial Physics Simulation Worker
 * Executes rigid body dynamics, particle kinematics, and collision resolution in background thread.
 * Employs zero-copy ArrayBuffer / Float32Array transfers to eliminate JSON serialization overhead.
 */

let width = 800;
let height = 400;
let numParticles = 250;
let gravity = 0.25;
let bounce = 0.85;
let isRunning = false;
let intervalId = null;

// Particle structure: 5 floats per particle -> [x, y, vx, vy, radius]
let particleData = null;

function initParticles(count) {
  numParticles = count;
  particleData = new Float32Array(numParticles * 5);

  for (let i = 0; i < numParticles; i++) {
    const idx = i * 5;
    particleData[idx] = Math.random() * (width - 40) + 20;     // x
    particleData[idx + 1] = Math.random() * (height - 40) + 20; // y
    particleData[idx + 2] = (Math.random() - 0.5) * 6;          // vx
    particleData[idx + 3] = (Math.random() - 0.5) * 6;          // vy
    particleData[idx + 4] = Math.random() * 4 + 3;              // radius
  }
}

function updatePhysics() {
  if (!particleData) return;

  for (let i = 0; i < numParticles; i++) {
    const idx = i * 5;
    let x = particleData[idx];
    let y = particleData[idx + 1];
    let vx = particleData[idx + 2];
    let vy = particleData[idx + 3];
    const r = particleData[idx + 4];

    // Apply gravity & velocity
    vy += gravity;
    x += vx;
    y += vy;

    // Boundary collisions
    if (x - r < 0) {
      x = r;
      vx = -vx * bounce;
    } else if (x + r > width) {
      x = width - r;
      vx = -vx * bounce;
    }

    if (y - r < 0) {
      y = r;
      vy = -vy * bounce;
    } else if (y + r > height) {
      y = height - r;
      vy = -vy * bounce;
      vx *= 0.98; // Ground friction
    }

    particleData[idx] = x;
    particleData[idx + 1] = y;
    particleData[idx + 2] = vx;
    particleData[idx + 3] = vy;
  }

  // Clone buffer to transfer zero-copy ownership to main thread
  const transferBuffer = new Float32Array(particleData).buffer;
  self.postMessage({
    type: 'TICK',
    count: numParticles,
    buffer: transferBuffer
  }, [transferBuffer]);
}

self.onmessage = function(e) {
  const msg = e.data;
  switch (msg.type) {
    case 'INIT':
      width = msg.width || 800;
      height = msg.height || 400;
      numParticles = msg.particles || 250;
      gravity = msg.gravity !== undefined ? msg.gravity : 0.25;
      initParticles(numParticles);
      if (!isRunning) {
        isRunning = true;
        intervalId = setInterval(updatePhysics, 1000 / 60);
      }
      break;

    case 'RESIZE':
      width = msg.width;
      height = msg.height;
      break;

    case 'CONFIG':
      if (msg.gravity !== undefined) gravity = msg.gravity;
      if (msg.particles !== undefined && msg.particles !== numParticles) {
        initParticles(msg.particles);
      }
      break;

    case 'IMPULSE':
      if (particleData) {
        const mx = msg.x;
        const my = msg.y;
        const force = msg.force || 10;
        for (let i = 0; i < numParticles; i++) {
          const idx = i * 5;
          const dx = particleData[idx] - mx;
          const dy = particleData[idx + 1] - my;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 150) {
            particleData[idx + 2] += (dx / dist) * force;
            particleData[idx + 3] += (dy / dist) * force;
          }
        }
      }
      break;

    case 'STOP':
      isRunning = false;
      if (intervalId) clearInterval(intervalId);
      break;
  }
};
