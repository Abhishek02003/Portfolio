uniform float uTime;

varying float vActivation;
varying float vLayer;
varying float vPulse;

void main() {
  vec3 matrixGreen = vec3(0.0, 1.0, 0.53);
  vec3 dimGreen = vec3(0.0, 0.3, 0.16);
  vec3 brightWhite = vec3(0.8, 1.0, 0.9);

  float glow = vActivation * (0.7 + vPulse * 0.3);

  vec3 color = mix(dimGreen, matrixGreen, glow);
  color = mix(color, brightWhite, glow * glow * 0.4);

  float alpha = 0.3 + glow * 0.7;

  gl_FragColor = vec4(color, alpha);
}
