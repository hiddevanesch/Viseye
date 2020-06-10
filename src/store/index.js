import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    files: [],
    filesAOI: []
  },
  mutations: {
    addFiles(state, data) {
      state.files = data;
    },
    addFilesAOI(state, data) {
      state.filesAOI = data;
    }
  },
  actions: {
  },
  modules: {
  }
})
