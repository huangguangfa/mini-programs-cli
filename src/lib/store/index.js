import Store from './store.js'

export default new Store({
  bindStorageMode: true,
  state: {
    cartCount: {
      persistence: true,
      default: 0
    },
    mark: {
      persistence: true,
      default: ''
    }
  },
  action: {
    setmark({commit}, payload) {
      setTimeout(() => {
        commit('mark', payload)
      }, 2000) 
    }
  }
})