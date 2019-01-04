import { loginByUsername, logout, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/authToken'

const user = {
  state: {
    name: '',
    token: getToken(),
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    permission: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state = Object.assign(state, user)
    },
    SET_USER_PERMISSION: (state, permission) => {
      state.permission = permission
    }
  },

  actions: {
    setUserPermission({ commit }, permission) {
      return new Promise(resolve => {
        commit('SET_USER_PERMISSION', permission.filter((item) => { return !!item && parseInt(item.per_type) !== 1 }))
        resolve()
      })
    },

    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => {
          const data = response.data
          if (data.code === '200') {
            data.payload.expired = Math.ceil(new Date().getTime() / 1000) + data.payload.expires_in
            commit('SET_TOKEN', data.payload)
            setToken(data.payload)
            resolve(response)
          } else {
            reject(data.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (!response.data) {
            reject('error')
          }
          const data = response.data.payload

          commit('SET_USER', data)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_NAME', data.name)
          resolve()
        })
      })
    }
  }
}

export default user
