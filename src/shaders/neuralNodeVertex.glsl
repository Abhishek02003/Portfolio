uniform float uTime;
uniform float uWaveOrigin;
uniform float uWaveProgress;

attribute float aNodeIndex;
attribute float aLayer;
attribute float aActivation;

varying float vActivation;
varying float vLayer;
varying float vPulse;

void main() {
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);

  float distFromWave = abs(aLayer - uWaveProgress * 5.0);
  float wave = exp(-distFromWave * distFromWave * 2.0);

  float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + aNodeIndex * 0.5);
  float activation = aActivation * (0.6 + wave * 0.4);

  float scale = 0.8 + activation * 0.4 + wave * 0.3;
  mvPosition.xyz *= scale;

  vActivation = activation;
  vLayer = aLayer;
  vPulse = pulse;

  gl_Position = projectionMatrix * mvPosition;
}
