import { create } from 'zustand'

const useStore = create((set) => ({
  audioEnabled: false,
  isLoaded: false,
  isMobile: false,
  currentView: 'home',
  interacted: false,
  selectedProject: null,
  selectedNeural: false,
  selectedTimeline: null,
  transitioning: false,
  transitionType: null,
  performanceMode: 'auto',

  enableAudio: () => set({ audioEnabled: true }),
  disableAudio: () => set({ audioEnabled: false }),
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
  setLoaded: () => set({ isLoaded: true }),
  setMobile: (val) => set({ isMobile: val }),
  setCurrentView: (view) => set({ currentView: view }),
  setInteracted: () => set({ interacted: true }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),

  triggerTransition: (type, callback) => {
    set({ transitioning: true, transitionType: type })
    setTimeout(() => {
      if (callback) callback()
      setTimeout(() => set({ transitioning: false, transitionType: null }), 400)
    }, 300)
  },

  setSelectedProject: (id) => {
    const state = useStore.getState()
    state.triggerTransition('glitch', () => {
      set({ selectedProject: id, selectedNeural: false, selectedTimeline: null })
    })
  },
  clearSelectedProject: () => {
    const state = useStore.getState()
    state.triggerTransition('sweep', () => {
      set({ selectedProject: null })
    })
  },
  setSelectedNeural: () => {
    const state = useStore.getState()
    state.triggerTransition('glitch', () => {
      set({ selectedNeural: true, selectedProject: null, selectedTimeline: null })
    })
  },
  clearSelectedNeural: () => {
    const state = useStore.getState()
    state.triggerTransition('sweep', () => {
      set({ selectedNeural: false })
    })
  },
  setSelectedTimeline: (id) => {
    const state = useStore.getState()
    state.triggerTransition('glitch', () => {
      set({ selectedTimeline: id, selectedProject: null, selectedNeural: false })
    })
  },
  clearSelectedTimeline: () => {
    const state = useStore.getState()
    state.triggerTransition('sweep', () => {
      set({ selectedTimeline: null })
    })
  },
}))

export default useStore
