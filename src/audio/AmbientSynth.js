let instance = null

export default class AmbientSynth {
  constructor() {
    if (instance) return instance
    instance = this

    this.ctx = null
    this.masterGain = null
    this.isPlaying = false
    this.nodes = []
  }

  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 0
    this.masterGain.connect(this.ctx.destination)

    this.compressor = this.ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -24
    this.compressor.ratio.value = 4
    this.compressor.connect(this.masterGain)

    this.createDrone(55, 'sine', 0.08)
    this.createDrone(82.5, 'sine', 0.05)
    this.createDrone(110, 'sine', 0.04)
    this.createDrone(164.81, 'triangle', 0.015)
    this.createDrone(220, 'sine', 0.01)

    this.createLFO(0.05, 55)
    this.createLFO(0.08, 82.5)

    this.createSubBass(27.5, 0.06)

    this.createShimmer()
    this.createMechanicalHum()
  }

  createDrone(freq, type, vol) {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = type
    osc.frequency.value = freq

    const detune = (Math.random() - 0.5) * 6
    osc.detune.value = detune

    filter.type = 'lowpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5

    gain.gain.value = vol

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)

    osc.start()
    this.nodes.push({ osc, gain, filter })
  }

  createSubBass(freq, vol) {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.value = freq

    filter.type = 'lowpass'
    filter.frequency.value = 120
    filter.Q.value = 1

    gain.gain.value = vol

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)
    osc.start()
    this.nodes.push({ osc, gain, filter })
  }

  createLFO(rate, targetFreq) {
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()

    lfo.type = 'sine'
    lfo.frequency.value = rate
    lfoGain.gain.value = 3

    const target = this.nodes.find((n) => n.osc.frequency.value === targetFreq)
    if (target) {
      lfo.connect(lfoGain)
      lfoGain.connect(target.osc.frequency)
      lfo.start()
    }
  }

  createShimmer() {
    const schedule = () => {
      if (!this.isPlaying || !this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      const notes = [220, 329.63, 440, 523.25, 659.25, 880]
      osc.frequency.value = notes[Math.floor(Math.random() * notes.length)]
      osc.type = 'sine'

      filter.type = 'bandpass'
      filter.frequency.value = osc.frequency.value
      filter.Q.value = 8

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.006, now + 1)
      gain.gain.linearRampToValueAtTime(0, now + 3 + Math.random() * 2)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.compressor)

      osc.start(now)
      osc.stop(now + 5)

      this.shimmerTimer = setTimeout(schedule, 2000 + Math.random() * 4000)
    }

    this.shimmerSchedule = schedule
  }

  createMechanicalHum() {
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.value = 60

    filter.type = 'lowpass'
    filter.frequency.value = 200
    filter.Q.value = 2

    gain.gain.value = 0.006

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.compressor)
    osc.start()
    this.nodes.push({ osc, gain, filter })
  }

  fadeIn(duration = 3) {
    this.init()

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    this.isPlaying = true
    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.linearRampToValueAtTime(0.7, now + duration)

    if (this.shimmerSchedule) {
      this.shimmerSchedule()
    }
  }

  fadeOut(duration = 2) {
    if (!this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    this.masterGain.gain.cancelScheduledValues(now)
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now)
    this.masterGain.gain.linearRampToValueAtTime(0, now + duration)

    this.isPlaying = false

    if (this.shimmerTimer) {
      clearTimeout(this.shimmerTimer)
      this.shimmerTimer = null
    }
  }

  playGlitchSFX() {
    if (!this.ctx || !this.isPlaying) return
    const now = this.ctx.currentTime

    const noise = this.ctx.createBufferSource()
    const bufferSize = this.ctx.sampleRate * 0.15
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    noise.buffer = buffer

    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 5

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)
    noise.start(now)
    noise.stop(now + 0.15)
  }

  destroy() {
    this.isPlaying = false
    if (this.shimmerTimer) clearTimeout(this.shimmerTimer)
    this.nodes.forEach(({ osc }) => { try { osc.stop() } catch (e) {} })
    this.nodes = []
    if (this.ctx) { this.ctx.close(); this.ctx = null }
    instance = null
  }
}
