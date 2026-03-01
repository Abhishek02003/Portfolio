uniform float uTime;
uniform vec3 uColor;
uniform float uSelected;
uniform float uHover;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);

  float energyLine = sin(vUv.y * 30.0 - uTime * 3.0) * 0.5 + 0.5;
  energyLine = smoothstep(0.85, 1.0, energyLine);

  float energyLine2 = sin(vUv.y * 15.0 + uTime * 2.0 + 1.57) * 0.5 + 0.5;
  energyLine2 = smoothstep(0.9, 1.0, energyLine2) * 0.5;

  float pulse = 0.6 + 0.4 * sin(uTime * 1.5);

  float hoverBoost = uHover * 0.3;
  float selectedBoost = uSelected * 0.4;

  float rimGlow = fresnel * (1.2 + hoverBoost + selectedBoost);

  vec3 baseColor = uColor;
  vec3 energyColor = uColor * 2.0;

  vec3 finalColor = baseColor * 0.15 * pulse;
  finalColor += rimGlow * baseColor * 1.8;
  finalColor += energyLine * energyColor * 0.6;
  finalColor += energyLine2 * energyColor * 0.3;
  finalColor += fresnel * fresnel * baseColor * 0.5;

  float innerBloom = exp(-length(vUv - 0.5) * 3.0) * 0.15 * pulse;
  finalColor += innerBloom * baseColor;

  float alpha = 0.25 + rimGlow * 0.5 + energyLine * 0.3 + hoverBoost + selectedBoost * 0.3;
  alpha = clamp(alpha, 0.0, 0.95);

  gl_FragColor = vec4(finalColor, alpha);
}
