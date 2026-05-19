import * as THREE from 'three';

/**
 * Scroll-driven cinematic camera.
 * 8 keyframe positions across scroll progress 0 → 1.
 * Lerped smoothly — no jagged jumps.
 */

interface CameraKeyframe {
  progress: number;
  x: number;
  y: number;
  z: number;
}

const KEYFRAMES: CameraKeyframe[] = [
  { progress: 0.00, x:  0,    y:  0,    z: 6   }, // Hero
  { progress: 0.15, x:  0.5,  y: -0.5,  z: 7   }, // Manifesto
  { progress: 0.30, x: -0.8,  y: -1.0,  z: 8   }, // Capabilities
  { progress: 0.45, x:  0,    y: -2.0,  z: 6   }, // Showcase
  { progress: 0.65, x:  1.5,  y: -2.5,  z: 7   }, // Process
  { progress: 0.80, x:  0,    y: -3.0,  z: 9   }, // Investment
  { progress: 0.90, x:  0,    y: -3.5,  z: 6   }, // Contact
  { progress: 1.00, x:  0,    y: -3.8,  z: 5.5 }, // Footer
];

export function createSceneCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.set(0, 0, 6);
  return camera;
}

const _targetPos = new THREE.Vector3();
const _currentPos = new THREE.Vector3();

export function updateCameraOnScroll(
  camera: THREE.PerspectiveCamera,
  scrollProgress: number,
  mouseX: number,
  mouseY: number,
  _dt: number
): void {
  // Find surrounding keyframes
  let fromKf = KEYFRAMES[0]!;
  let toKf   = KEYFRAMES[KEYFRAMES.length - 1]!;

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (
      scrollProgress >= KEYFRAMES[i]!.progress &&
      scrollProgress <= KEYFRAMES[i + 1]!.progress
    ) {
      fromKf = KEYFRAMES[i]!;
      toKf   = KEYFRAMES[i + 1]!;
      break;
    }
  }

  const range = toKf.progress - fromKf.progress;
  const t = range > 0
    ? (scrollProgress - fromKf.progress) / range
    : 0;

  // Smooth step
  const st = t * t * (3 - 2 * t);

  _targetPos.set(
    fromKf.x + (toKf.x - fromKf.x) * st,
    fromKf.y + (toKf.y - fromKf.y) * st,
    fromKf.z + (toKf.z - fromKf.z) * st
  );

  // Mouse parallax on top — subtle
  _targetPos.x += mouseX * 0.08;
  _targetPos.y += mouseY * 0.05;

  // Damp camera toward target
  _currentPos.copy(camera.position);
  _currentPos.lerp(_targetPos, 0.032);
  camera.position.copy(_currentPos);

  // Always look slightly toward origin
  camera.lookAt(0, camera.position.y * 0.3, 0);
}
