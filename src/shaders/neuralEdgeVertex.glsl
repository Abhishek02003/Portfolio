uniform float uTime;

attribute float aEdgeProgress;
attribute float aEdgeSpeed;

varying float vProgress;
varying float vEdgePulse;

void main() {
  vProgress = aEdgeProgress;

  float pulse = fract(uTime * aEdgeSpeed * 0.3 + aEdgeProgress);
  vEdgePulse = pulse;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
