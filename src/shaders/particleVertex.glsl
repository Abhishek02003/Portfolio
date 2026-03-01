uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aScale;
attribute float aSpeed;
attribute vec3 aOffset;

varying float vAlpha;

void main() {
  vec3 pos = position;
  pos.x += sin(uTime * aSpeed * 0.3 + aOffset.x) * 0.8;
  pos.y += cos(uTime * aSpeed * 0.2 + aOffset.y) * 0.6;
  pos.z += sin(uTime * aSpeed * 0.15 + aOffset.z) * 0.5;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  float distanceAttenuation = 1.0 / (-viewPosition.z);
  gl_PointSize = uSize * aScale * uPixelRatio * distanceAttenuation * 150.0;
  gl_PointSize = max(gl_PointSize, 1.5);

  vAlpha = smoothstep(0.0, 0.3, aScale) * (0.5 + 0.5 * sin(uTime * aSpeed * 0.5 + aOffset.x));
}
