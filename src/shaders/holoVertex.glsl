uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;

  float displacement = sin(position.y * 8.0 + uTime * 2.0) * 0.015;
  displacement += sin(position.x * 6.0 + uTime * 1.5) * 0.01;
  vDisplacement = displacement;

  vec3 newPos = position + normal * displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
