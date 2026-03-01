uniform float uTime;

varying float vProgress;
varying float vEdgePulse;

void main() {
  vec3 matrixGreen = vec3(0.0, 1.0, 0.53);
  vec3 dimGreen = vec3(0.0, 0.15, 0.08);

  float pulse = sin(vEdgePulse * 3.14159) * 0.8;

  float dataPulse = exp(-pow((fract(vProgress - uTime * 0.5) - 0.5) * 6.0, 2.0));

  float glow = max(pulse * 0.3, dataPulse);

  vec3 color = mix(dimGreen, matrixGreen, glow);

  float alpha = 0.08 + glow * 0.5;

  gl_FragColor = vec4(color, alpha);
}
