/**
 * Physics Simulation Main Thread Controller
 * Handles Canvas rendering via RequestAnimationFrame and consumes zero-copy TypedArrays from Web Worker.
 */

export function initPhysicsSimulation() {
  document.querySelectorAll('.carbon-physics-container').forEach(container => {
    const canvas = container.querySelector('.carbon-physics-container__canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const fpsDisplay = container.querySelector('.carbon-physics-container__fps');
    const countDisplay = container.querySelector('.carbon-physics-container__count');
    const particlesSlider = container.querySelector('.carbon-physics-container__particles-slider');
    const gravityToggle = container.querySelector('.carbon-physics-container__gravity-toggle');

    let worker = null;
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;
    let particleArray = null;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = 400 * (window.devicePixelRatio || 1);
      if (worker) {
        worker.postMessage({
          type: 'RESIZE',
          width: canvas.width,
          height: canvas.height
        });
      }
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (particleArray) {
        const count = particleArray.length / 5;
        for (let i = 0; i < count; i++) {
          const idx = i * 5;
          const x = particleArray[idx];
          const y = particleArray[idx + 1];
          const r = particleArray[idx + 4];

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#0f62fe';
          ctx.fill();
        }
      }

      // Calculate FPS
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        if (fpsDisplay) fpsDisplay.textContent = `${fps} FPS`;
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(render);
    }

    try {
      const workerUrl = container.getAttribute('data-worker-url') || '/js/workers/physics.js';
      worker = new Worker(workerUrl);

      worker.onmessage = function(e) {
        if (e.data.type === 'TICK') {
          particleArray = new Float32Array(e.data.buffer);
          if (countDisplay) countDisplay.textContent = `${e.data.count} Particles`;
        }
      };

      resize();
      window.addEventListener('resize', resize);

      const initialCount = particlesSlider ? parseInt(particlesSlider.value, 10) : 300;
      worker.postMessage({
        type: 'INIT',
        width: canvas.width,
        height: canvas.height,
        particles: initialCount,
        gravity: 0.25
      });

      // Canvas click impulse
      canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        worker.postMessage({
          type: 'IMPULSE',
          x,
          y,
          force: 15
        });
      });

      if (particlesSlider) {
        particlesSlider.addEventListener('input', (e) => {
          const val = parseInt(e.target.value, 10);
          worker.postMessage({ type: 'CONFIG', particles: val });
        });
      }

      if (gravityToggle) {
        gravityToggle.addEventListener('change', (e) => {
          worker.postMessage({ type: 'CONFIG', gravity: e.target.checked ? 0.25 : 0 });
        });
      }

      requestAnimationFrame(render);
    } catch (err) {
      console.warn('Physics Web Worker initialization failed:', err);
    }
  });
}
