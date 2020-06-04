import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    files: [],
    loading: ''
  },
  mutations: {
    addFiles(state, data) {
      state.files = data;
    },
    updateLoader(state, string) {
      state.loading = string;
    }
  },
  actions: {
  },
  modules: {
  }
})
