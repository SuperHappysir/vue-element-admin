import { loginByUsername, logout, getUserInfo, refreshToken } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/authToken'
// import { PERMISSION_TYPE } from '@/constant/permission'

const user = {
  state: {
    attr: {},
    name: '',
    token: getToken(),
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    permission: [],
    permissionPath: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.attr = user
      state.name = user.nickname
    },
    SET_USER_PERMISSION: (state, permission) => {
      state.permission = permission
      state.permissionPath = permission.map((item) => item.path)
    }
  },

  actions: {
    setUserPermission({ commit }, permission) {
      return new Promise(resolve => {
        commit('SET_USER_PERMISSION', permission)
        resolve(permission)
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

    // 刷新登陆token
    refreshToken({ commit }) {
      return new Promise((resolve, reject) => {
        refreshToken()
          .then(resp => {
            const data = resp.data
            data.payload.expired = Math.ceil(new Date().getTime() / 1000) + data.payload.expires_in
            commit('SET_TOKEN', data.payload)
            setToken(data.payload)
            resolve(data)
          })
          .then(() => {
            return this.$store.dispatch('GetUserInfo')
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 用户名登录
    clearToken({ commit }) {
      return new Promise((resolve) => {
        commit('SET_TOKEN', {})
        setToken({})
        resolve()
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
          resolve(data)
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
