/**
 * Drakken Labs — Persistent 3D Scene Orchestrator
 * Single WebGL context, fixed canvas at z-index 0
 * DOM content sits at z-index 10+ on top of it.
 */
import * as THREE from 'three';
import { createAmbientMesh } from './mesh';
import { createParticleField } from './particles';
import { createSentinel } from './sentinel';
import { createCrystal } from './crystal';
import { createSceneCamera, updateCameraOnScroll } from './camera';
import { createEnvMap } from './envmap';

export function initScene(canvas: HTMLCanvasElement): () => void {
  // ── Renderer ──────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'default',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // ── Scene & Camera ─────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = createSceneCamera();

  // ── Environment map for PBR materials ─────────────────────
  const envMap = createEnvMap(renderer);
  scene.environment = envMap;

  // ── Objects ───────────────────────────────────────────────
  const mesh = createAmbientMesh();
  scene.add(mesh);

  const particles = createParticleField();
  scene.add(particles);

  const { sentinel, updateSentinel } = createSentinel(renderer);
  scene.add(sentinel);

  const { crystal, updateCrystal } = createCrystal();
  scene.add(crystal);

  // ── State ─────────────────────────────────────────────────
  let raf: number;
  let isVisible = true;
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let mouseX = 0;
  let mouseY = 0;

  // ── Event listeners ───────────────────────────────────────
  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  const onScroll = () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScrollProgress = maxScroll > 0
      ? Math.min(window.scrollY / maxScroll, 1)
      : 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  };

  const onVisibility = () => { isVisible = !document.hidden; };

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  // ── Animation loop ────────────────────────────────────────
  let lastTime = 0;
  function animate(time: number) {
    raf = requestAnimationFrame(animate);
    if (!isVisible) return;

    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    const t = time / 1000;

    // Smooth scroll lerp
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

    // Camera driven by scroll
    updateCameraOnScroll(camera, scrollProgress, mouseX, mouseY, dt);

    // Object updates
    updateSentinel(t, mouseX, mouseY, scrollProgress, dt);
    updateCrystal(t, scrollProgress, dt);

    // Mesh slow rotation
    mesh.rotation.y = t * 0.04;
    mesh.rotation.x = Math.sin(t * 0.08) * 0.05;

    // Particles slow drift
    particles.rotation.y = t * 0.012;
    particles.rotation.x = Math.sin(t * 0.007) * 0.03;

    renderer.render(scene, camera);
  }

  animate(0);

  // ── Cleanup ───────────────────────────────────────────────
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('visibilitychange', onVisibility);
    renderer.dispose();
    envMap.dispose();
  };
}
