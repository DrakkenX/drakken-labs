import * as THREE from 'three';

/**
 * Obsidian Crystal — hero centerpiece anchor.
 * OctahedronGeometry, glass-like PBR material, cyan wireframe overlay.
 * Scroll-driven: rotates 180° and recedes as user leaves Hero.
 */
export function createCrystal(): {
  crystal: THREE.Group;
  updateCrystal: (t: number, scrollProgress: number, dt: number) => void;
} {
  const group = new THREE.Group();

  // Position: offset from sentinel (right side, slight depth)
  group.position.set(2.8, -0.4, -1.2);

  // ── Glass core ─────────────────────────────────────────
  const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color:             new THREE.Color(0x14171f),
    metalness:         0.4,
    roughness:         0.05,
    transmission:      0.6,
    thickness:         1.5,
    ior:               2.4,
    clearcoat:         1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity:   1.8,
    transparent:       true,
    opacity:           0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // ── Cyan wireframe overlay ──────────────────────────────
  const edgesGeo = new THREE.EdgesGeometry(coreGeo);
  const edgesMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x00d4ff),
    transparent: true,
    opacity: 0.32,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  group.add(edges);

  // ── Point light inside ───────────────────────────────────
  const crystalLight = new THREE.PointLight(0x00d4ff, 2.5, 6);
  group.add(crystalLight);

  // ── State ─────────────────────────────────────────────────
  const startTime = performance.now();
  let prevScrollProg = 0;

  function updateCrystal(t: number, scrollProgress: number, dt: number) {
    const et = (performance.now() - startTime) / 1000;
    const _ = t;
    const __ = dt;

    // Continuous rotation
    core.rotation.x += 0.001;
    core.rotation.y += 0.002;
    edges.rotation.x = core.rotation.x;
    edges.rotation.y = core.rotation.y;

    // Float animation
    group.position.y = -0.4 + Math.sin(et * 0.55) * 0.12;

    // Scroll-driven: as user scrolls past Hero (0 → 0.15),
    // crystal rotates 180° on Y and moves further away.
    const heroProgress = Math.min(scrollProgress / 0.15, 1);
    group.rotation.y = heroProgress * Math.PI;

    // Smooth recede on scroll
    const targetZ = -1.2 - heroProgress * 4;
    group.position.z += (targetZ - group.position.z) * 0.04;

    // Opacity fade as it recedes
    const targetOpacity = Math.max(1 - heroProgress * 1.4, 0);
    coreMat.opacity = 0.15 + targetOpacity * 0.75;
    edgesMat.opacity = 0.32 * targetOpacity;
    crystalLight.intensity = 2.5 * targetOpacity;

    prevScrollProg = scrollProgress;
  }

  return { crystal: group, updateCrystal };
}
