varying float vAlpha;

void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float glow = 1.0 - smoothstep(0.0, 0.5, dist);
  glow = pow(glow, 1.5);

  float core = 1.0 - smoothstep(0.0, 0.15, dist);

  vec3 cyanColor = vec3(0.0, 0.82, 1.0);
  vec3 purpleColor = vec3(0.55, 0.1, 0.95);
  vec3 color = mix(purpleColor, cyanColor, glow);

  color += vec3(core * 0.5);

  gl_FragColor = vec4(color, glow * vAlpha * 0.9);
}
