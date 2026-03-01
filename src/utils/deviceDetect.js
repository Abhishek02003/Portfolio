let cachedTier = null
let cachedMobile = null

export function detectMobile() {
  if (cachedMobile !== null) return cachedMobile
  if (typeof window === 'undefined') return false
  cachedMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || window.innerWidth < 768
  return cachedMobile
}

export function detectSmallScreen() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 480
}

export function getDevicePixelRatio() {
  if (detectSmallScreen()) return 1
  if (detectMobile()) return Math.min(window.devicePixelRatio, 1.5)
  return Math.min(window.devicePixelRatio, 2)
}

export function estimateGPUTier() {
  if (cachedTier !== null) return cachedTier
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) { cachedTier = 'low'; return 'low' }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase()
      if (renderer.includes('nvidia') || renderer.includes('radeon') || renderer.includes('geforce') || renderer.includes('rtx') || renderer.includes('gtx')) {
        cachedTier = 'high'
      } else if (renderer.includes('intel') || renderer.includes('adreno 6') || renderer.includes('apple gpu') || renderer.includes('apple m')) {
        cachedTier = 'medium'
      } else if (renderer.includes('mali') || renderer.includes('adreno 5') || renderer.includes('powervr')) {
        cachedTier = 'low'
      } else {
        cachedTier = 'medium'
      }
    } else {
      cachedTier = detectMobile() ? 'low' : 'medium'
    }

    canvas.remove()
    return cachedTier
  } catch {
    cachedTier = 'low'
    return 'low'
  }
}

export function getParticleCount() {
  const tier = estimateGPUTier()
  const mobile = detectMobile()
  if (detectSmallScreen()) return 400
  if (mobile || tier === 'low') return 800
  if (tier === 'medium') return 1500
  return 2500
}

export function getLODLevel() {
  const tier = estimateGPUTier()
  const mobile = detectMobile()
  if (detectSmallScreen()) return 0
  if (mobile || tier === 'low') return 1
  if (tier === 'medium') return 2
  return 3
}

export function getGeometryDetail(base) {
  const lod = getLODLevel()
  if (lod === 0) return Math.max(1, Math.floor(base * 0.3))
  if (lod === 1) return Math.max(1, Math.floor(base * 0.5))
  if (lod === 2) return Math.max(1, Math.floor(base * 0.75))
  return base
}

export function getQualitySettings() {
  const tier = estimateGPUTier()
  const mobile = detectMobile()
  const small = detectSmallScreen()

  return {
    particleCount: getParticleCount(),
    bloomIntensity: small ? 0.4 : mobile ? 0.8 : 1.5,
    enableChromatic: !mobile && tier !== 'low',
    enableVignette: !small,
    enableBloom: !small || tier !== 'low',
    shadowMap: !mobile && tier !== 'low',
    dpr: getDevicePixelRatio(),
    lodLevel: getLODLevel(),
    enablePostProcessing: tier !== 'low' || !mobile,
    maxLights: small ? 2 : mobile ? 4 : 8,
    shaderComplexity: small ? 'minimal' : mobile ? 'reduced' : 'full',
    enableTransitions: !small,
  }
}
