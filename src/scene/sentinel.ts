import * as THREE from 'three';

interface SentinelUniforms {
  sectionColor: THREE.Color;
  clickCount:   number;
  isIdleLong:   boolean;
}

/**
 * The Sentinel — iridescent PBR sphere.
 * Spec material: metalness 0.95, iridescence 0.85, clearcoat 1.0
 * Upgraded: 40% larger, cursor-tracked, click ripple, section tint lerp.
 */
export function createSentinel(renderer: THREE.WebGLRenderer): {
  sentinel: THREE.Group;
  updateSentinel: (
    t: number,
    mouseX: number,
    mouseY: number,
    scrollProgress: number,
    dt: number
  ) => void;
} {
  const group = new THREE.Group();
  group.position.set(1.2, 0.5, 0);

  // ── Main sphere ─────────────────────────────────────────
  const geo = new THREE.IcosahedronGeometry(1.05, 5); // 40% larger than before
  const mat = new THREE.MeshPhysicalMaterial({
    color:                    new THREE.Color(0x0a0e18),
    metalness:                0.95,
    roughness:                0.15,
    iridescence:              0.85,
    iridescenceIOR:           1.3,
    iridescenceThicknessRange: [280, 520] as [number, number],
    clearcoat:                1.0,
    clearcoatRoughness:       0.05,
    envMapIntensity:          1.4,
  });
  const sphere = new THREE.Mesh(geo, mat);
  group.add(sphere);

  // ── Inner eye ────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.3, 20, 20);
  const eyeMat = new THREE.MeshPhysicalMaterial({
    color:             new THREE.Color(0, 0.83, 1),
    emissive:          new THREE.Color(0, 0.35, 0.85),
    emissiveIntensity: 2.8,
    metalness:         0.3,
    roughness:         0.06,
  });
  const eye = new THREE.Mesh(eyeGeo, eyeMat);
  group.add(eye);

  // ── Orbiting lights ──────────────────────────────────────
  const pivots: THREE.Object3D[] = [];
  const lights: THREE.PointLight[] = [];

  [
    { color: 0x00d4ff, intensity: 6,   dist: 2.0 },
    { color: 0xa78bfa, intensity: 4,   dist: 1.8 },
    { color: 0x4ade80, intensity: 2.5, dist: 1.9 },
  ].forEach(({ color, intensity, dist }) => {
    const pivot = new THREE.Object3D();
    const light = new THREE.PointLight(color, intensity, 10);
    light.position.set(dist, 0, 0);
    pivot.add(light);
    group.add(pivot);
    pivots.push(pivot);
    lights.push(light);
  });

  // ── Particle ring ────────────────────────────────────────
  const ringCount = 120;
  const ringPos   = new Float32Array(ringCount * 3);
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    const r     = 1.4 + Math.sin(i * 2.1) * 0.04;
    ringPos[i * 3]     = Math.cos(angle) * r;
    ringPos[i * 3 + 1] = Math.sin(i * 0.85) * 0.05;
    ringPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
  const ringMat = new THREE.PointsMaterial({
    color: new THREE.Color(0, 0.83, 1),
    size: 0.032,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring = new THREE.Points(ringGeo, ringMat);
  group.add(ring);

  // ── State ─────────────────────────────────────────────────
  const state: SentinelUniforms = {
    sectionColor: new THREE.Color(0, 0.83, 1),
    clickCount:   0,
    isIdleLong:   false,
  };

  let prevRotX = 0;
  let prevRotZ = 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  const startTime = performance.now();

  // ── Click tracking ───────────────────────────────────────
  document.addEventListener('click', (e) => {
    ringMat.opacity = 0.95;
    setTimeout(() => { ringMat.opacity = 0.5; }, 420);

    state.clickCount++;
    if (state.clickCount >= 7) {
      state.clickCount = 0;
      document.dispatchEvent(new CustomEvent('sentinel:oracle'));
    }
    resetIdle();
    const _ = e;
  });

  document.addEventListener('sentinel:success', () => {
    ringMat.opacity = 1.0;
    eyeMat.emissiveIntensity = 5.5;
    setTimeout(() => {
      ringMat.opacity = 0.5;
      eyeMat.emissiveIntensity = 2.8;
    }, 900);
  });

  function resetIdle() {
    state.isIdleLong = false;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { state.isIdleLong = true; }, 30000);
  }
  resetIdle();

  // ── Section tint map ─────────────────────────────────────
  const sectionTints: Record<string, THREE.Color> = {
    hero:         new THREE.Color(0, 0.83, 1),
    manifesto:    new THREE.Color(0.55, 0.45, 1),
    capabilities: new THREE.Color(0, 0.83, 1),
    showcase:     new THREE.Color(0.65, 0.55, 0.98),
    process:      new THREE.Color(0.29, 0.87, 0.5),
    investment:   new THREE.Color(0.98, 0.75, 0.14),
    contact:      new THREE.Color(0.29, 0.87, 0.5),
  };

  function updateSectionTint() {
    const mid = window.innerHeight / 2;
    for (const [id, color] of Object.entries(sectionTints)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) {
        state.sectionColor.copy(color);
        return;
      }
    }
  }

  window.addEventListener('scroll', updateSectionTint, { passive: true });

  // ── Update called each frame ─────────────────────────────
  function updateSentinel(
    t: number,
    mouseX: number,
    mouseY: number,
    _scrollProgress: number,
    _dt: number
  ) {
    const et = (performance.now() - startTime) / 1000;

    // Smooth cursor tilt
    const targetX = mouseY * 0.28;
    const targetZ = -mouseX * 0.18;
    prevRotX += (targetX - prevRotX) * 0.045;
    prevRotZ += (targetZ - prevRotZ) * 0.045;

    sphere.rotation.y = et * 0.38;
    sphere.rotation.x = prevRotX;
    sphere.rotation.z = prevRotZ;

    // Breathing scale
    const breathScale = 1.0 + Math.sin(et * 1.4) * 0.02;
    sphere.scale.setScalar(breathScale);

    // Eye pulse
    const eyePulse = state.isIdleLong
      ? 0.7 + Math.sin(et * 0.3) * 0.3
      : 2.4 + Math.sin(et * 2.1) * 0.5;
    eyeMat.emissiveIntensity = eyePulse;

    // Color lerp toward section tint
    eyeMat.color.lerp(state.sectionColor, 0.014);
    eyeMat.emissive.lerp(state.sectionColor, 0.014);
    lights[0]!.color.lerp(state.sectionColor, 0.02);
    (ringMat.color as THREE.Color).lerp(state.sectionColor, 0.014);

    // Orbit lights
    pivots[0]!.rotation.y = t * 0.9;
    pivots[0]!.rotation.z = Math.sin(t * 0.27) * 0.4;
    pivots[1]!.rotation.y = -t * 0.65;
    pivots[1]!.rotation.x = Math.cos(t * 0.46) * 0.5;
    pivots[2]!.rotation.x = t * 0.48;
    pivots[2]!.rotation.z = Math.sin(t * 0.36) * 0.35;

    ring.rotation.y = t * 0.26;
    ring.rotation.x = Math.sin(t * 0.16) * 0.08;

    // Float
    group.position.y = 0.5 + Math.sin(et * 0.7) * 0.08;
  }

  return { sentinel: group, updateSentinel };
}
