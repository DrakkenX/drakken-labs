import * as THREE from 'three';

/**
 * Atmospheric particle field — dust motes in a cathedral.
 * 800 points, cyan + violet mix, additive blending.
 * Down to 300 on reduced-motion via CSS data attribute.
 */
export function createParticleField(): THREE.Points {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = reducedMotion ? 200 : 800;

  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const sizes     = new Float32Array(count);

  const cyanColor   = new THREE.Color(0x00d4ff);
  const violetColor = new THREE.Color(0xa78bfa);

  for (let i = 0; i < count; i++) {
    // Sphere distribution
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const r     = 8 + Math.random() * 7; // radius 8–15

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Mix cyan (60%) and violet (40%)
    const t = Math.random();
    const col = t > 0.4
      ? cyanColor.clone().lerp(violetColor, Math.random() * 0.3)
      : violetColor.clone().lerp(cyanColor, Math.random() * 0.2);

    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = 0.5 + Math.random() * 1.2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geo, mat);
}
