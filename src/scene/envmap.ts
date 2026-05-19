import * as THREE from 'three';

/**
 * Canvas-based equirectangular environment map.
 * Required for MeshPhysicalMaterial iridescence to render correctly.
 */
export function createEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark void base
  ctx.fillStyle = '#060a14';
  ctx.fillRect(0, 0, 512, 256);

  // Cyan point source — top-left
  const g1 = ctx.createRadialGradient(60, 40, 4, 60, 40, 140);
  g1.addColorStop(0, 'rgba(0,212,255,0.55)');
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 512, 256);

  // Violet point source — right
  const g2 = ctx.createRadialGradient(420, 140, 4, 420, 140, 110);
  g2.addColorStop(0, 'rgba(167,139,250,0.35)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 512, 256);

  // Mint accent — bottom center
  const g3 = ctx.createRadialGradient(256, 220, 2, 256, 220, 80);
  g3.addColorStop(0, 'rgba(74,222,128,0.2)');
  g3.addColorStop(1, 'transparent');
  ctx.fillStyle = g3;
  ctx.fillRect(0, 0, 512, 256);

  // Subtle warm fill — lower right
  const g4 = ctx.createRadialGradient(460, 200, 2, 460, 200, 70);
  g4.addColorStop(0, 'rgba(251,191,36,0.12)');
  g4.addColorStop(1, 'transparent');
  ctx.fillStyle = g4;
  ctx.fillRect(0, 0, 512, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const envTexture = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();

  return envTexture.texture;
}
