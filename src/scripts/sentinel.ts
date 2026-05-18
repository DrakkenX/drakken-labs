import * as THREE from 'three';

interface SentinelState {
  scrollVelocity: number;
  isScrolling: boolean;
  mouseX: number;
  mouseY: number;
  isIdleLong: boolean;
  sectionColor: THREE.Color;
  clickCount: number;
}

function createEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#060815';
  ctx.fillRect(0, 0, 256, 128);

  const g1 = ctx.createRadialGradient(40, 30, 2, 40, 30, 90);
  g1.addColorStop(0, 'rgba(0,212,255,0.4)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 256, 128);

  const g2 = ctx.createRadialGradient(210, 95, 2, 210, 95, 75);
  g2.addColorStop(0, 'rgba(167,139,250,0.3)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 256, 128);

  const g3 = ctx.createRadialGradient(128, 110, 2, 128, 110, 55);
  g3.addColorStop(0, 'rgba(74,222,128,0.2)');
  g3.addColorStop(1, 'transparent');
  ctx.fillStyle = g3;
  ctx.fillRect(0, 0, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const envTexture = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();

  return envTexture.texture;
}

export function initSentinel(canvas: HTMLCanvasElement): () => void {
  const size = canvas.clientWidth || 80;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size, size, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.z = 3;

  const envMap = createEnvMap(renderer);
  scene.environment = envMap;

  // Main iridescent sphere
  const geometry = new THREE.IcosahedronGeometry(0.75, 4);
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.88, 0.94, 1.0),
    metalness: 0.0,
    roughness: 0.04,
    iridescence: 0.95,
    iridescenceIOR: 2.0,
    iridescenceThicknessRange: [100, 700] as [number, number],
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.4,
  });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Inner eye
  const eyeGeo = new THREE.SphereGeometry(0.22, 20, 20);
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0, 0.83, 1),
    emissive: new THREE.Color(0, 0.4, 0.9),
    emissiveIntensity: 2.5,
    metalness: 0.3,
    roughness: 0.08,
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  scene.add(eye);

  // Orbiting point lights
  const pivots: THREE.Object3D[] = [];
  const lights: THREE.PointLight[] = [];

  const lightDefs = [
    { color: 0x00d4ff, intensity: 5, dist: 1.6 },
    { color: 0xa78bfa, intensity: 3.5, dist: 1.3 },
    { color: 0x4ade80, intensity: 2.5, dist: 1.4 },
  ];
  lightDefs.forEach(({ color, intensity, dist }) => {
    const pivot = new THREE.Object3D();
    const light = new THREE.PointLight(color, intensity, 8);
    light.position.set(dist, 0, 0);
    pivot.add(light);
    scene.add(pivot);
    pivots.push(pivot);
    lights.push(light);
  });

  // Particle ring
  const ringCount = 96;
  const ringPos = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const r = 1.05 + Math.sin(i * 2.3) * 0.035;
    ringPos[i * 3] = Math.cos(angle) * r;
    ringPos[i * 3 + 1] = Math.sin(i * 0.9) * 0.04;
    ringPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({
    color: new THREE.Color(0, 0.83, 1),
    size: 0.028,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const ring = new THREE.Points(ringGeo, ringMat);
  scene.add(ring);

  // State
  const state: SentinelState = {
    scrollVelocity: 0,
    isScrolling: false,
    mouseX: 0,
    mouseY: 0,
    isIdleLong: false,
    sectionColor: new THREE.Color(0, 0.83, 1),
    clickCount: 0,
  };

  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let scrollTimer: ReturnType<typeof setTimeout> | null = null;
  const startTime = performance.now();
  const getElapsedTime = () => (performance.now() - startTime) / 1000;
  let isPageVisible = true;
  let animId: number;
  let prevRotX = 0;
  let prevRotZ = 0;

  function resetIdle() {
    state.isIdleLong = false;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { state.isIdleLong = true; }, 30000);
  }

  function updateSectionTint() {
    const map: Record<string, THREE.Color> = {
      hero:         new THREE.Color(0, 0.83, 1),
      manifesto:    new THREE.Color(0.55, 0.45, 1),
      capabilities: new THREE.Color(0, 0.83, 1),
      showcase:     new THREE.Color(0.65, 0.55, 0.98),
      process:      new THREE.Color(0.29, 0.87, 0.5),
      investment:   new THREE.Color(0.98, 0.75, 0.14),
      contact:      new THREE.Color(0.29, 0.87, 0.5),
    };
    const mid = window.innerHeight / 2;
    for (const [id, color] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) {
        state.sectionColor.copy(color);
        return;
      }
    }
  }

  function triggerRipple() {
    ringMat.opacity = 0.95;
    setTimeout(() => { ringMat.opacity = 0.55; }, 450);
  }

  const onMouseMove = (e: MouseEvent) => {
    state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    resetIdle();
  };

  const onScroll = () => {
    state.scrollVelocity = Math.min(12, state.scrollVelocity + 1.5);
    state.isScrolling = true;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      state.isScrolling = false;
      state.scrollVelocity = 0;
    }, 180);
    updateSectionTint();
    resetIdle();
  };

  const onClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const hit = e.clientX >= rect.left && e.clientX <= rect.right
             && e.clientY >= rect.top  && e.clientY <= rect.bottom;
    if (hit) {
      state.clickCount++;
      if (state.clickCount >= 7) {
        state.clickCount = 0;
        document.dispatchEvent(new CustomEvent('sentinel:oracle'));
      }
    }
    triggerRipple();
    resetIdle();
  };

  const onCtaSuccess = () => {
    ringMat.opacity = 1.0;
    eyeMat.emissiveIntensity = 5;
    setTimeout(() => { ringMat.opacity = 0.55; eyeMat.emissiveIntensity = 2.5; }, 800);
  };

  const onVisibility = () => { isPageVisible = !document.hidden; };

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onClick);
  document.addEventListener('sentinel:success', onCtaSuccess);
  document.addEventListener('visibilitychange', onVisibility);

  resetIdle();

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isPageVisible) return;

    const t = getElapsedTime();
    const speed = state.isScrolling
      ? 0.9 + state.scrollVelocity * 0.12
      : state.isIdleLong ? 0.25 : 0.45;

    // Smooth cursor tilt
    const targetX = state.mouseY * 0.22;
    const targetZ = -state.mouseX * 0.14;
    prevRotX += (targetX - prevRotX) * 0.04;
    prevRotZ += (targetZ - prevRotZ) * 0.04;

    sphere.rotation.y = t * speed * 0.35;
    sphere.rotation.x = prevRotX;
    sphere.rotation.z = prevRotZ;

    // Breathing scale
    const breath = 1.0 + Math.sin(t * 1.4) * 0.018;
    const scrollMult = state.isScrolling ? 1.0 + Math.min(state.scrollVelocity, 10) * 0.004 : 1.0;
    sphere.scale.setScalar(breath * scrollMult);

    // Eye glow
    const eyePulse = state.isIdleLong
      ? 0.7 + Math.sin(t * 0.35) * 0.3
      : 2.2 + Math.sin(t * 2.2) * 0.5;
    eyeMat.emissiveIntensity = eyePulse;

    // Lerp colors toward section tint
    eyeMat.color.lerp(state.sectionColor, 0.012);
    eyeMat.emissive.lerp(state.sectionColor, 0.012);
    lights[0]!.color.lerp(state.sectionColor, 0.018);
    (ringMat.color as THREE.Color).lerp(state.sectionColor, 0.012);

    // Orbit lights
    pivots[0]!.rotation.y = t * 0.85;
    pivots[0]!.rotation.z = Math.sin(t * 0.28) * 0.4;
    pivots[1]!.rotation.y = -t * 0.65;
    pivots[1]!.rotation.x = Math.cos(t * 0.48) * 0.5;
    pivots[2]!.rotation.x = t * 0.5;
    pivots[2]!.rotation.z = Math.sin(t * 0.38) * 0.35;

    ring.rotation.y = t * 0.28 * speed;
    ring.rotation.x = Math.sin(t * 0.18) * 0.08;

    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick);
    document.removeEventListener('sentinel:success', onCtaSuccess);
    document.removeEventListener('visibilitychange', onVisibility);
    if (idleTimer) clearTimeout(idleTimer);
    if (scrollTimer) clearTimeout(scrollTimer);
    renderer.dispose();
    geometry.dispose();
    material.dispose();
    eyeGeo.dispose();
    eyeMat.dispose();
    ringGeo.dispose();
    ringMat.dispose();
    envMap.dispose();
  };
}
