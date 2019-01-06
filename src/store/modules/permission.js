import { constantRouterMap } from '@/router'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, addRouters) {
      return new Promise(resolve => {
        commit('SET_ROUTERS', addRouters)
        resolve(addRouters)
      })
    }
  }
}

export default permission
