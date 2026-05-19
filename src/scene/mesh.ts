import * as THREE from 'three';

/**
 * Ambient wireframe mesh — the cathedral floor.
 * A subdivided plane with vertex displacement via simplex-like noise.
 * Barely visible (opacity 0.04) but gives Z-depth to the void.
 */
export function createAmbientMesh(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(40, 40, 80, 80);

  // Organic vertex displacement
  const pos = geo.attributes['position'] as THREE.BufferAttribute;
  const count = pos.count;
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z =
      Math.sin(x * 0.4) * 0.45 +
      Math.cos(y * 0.35) * 0.35 +
      Math.sin((x + y) * 0.25) * 0.3 +
      (Math.random() - 0.5) * 0.12;
    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00d4ff),
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2.5;
  mesh.position.z = -20;
  mesh.position.y = -6;

  return mesh;
}
