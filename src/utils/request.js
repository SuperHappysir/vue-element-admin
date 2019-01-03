import axios from 'axios'
import store from '@/store'
import { getToken } from '@/utils/authToken'
import { Message, MessageBox } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 5000
})

// request interceptor
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      const tokenObject = getToken()
      if (tokenObject && tokenObject.expired > Math.ceil(new Date().getTime() / 1000)) {
        config.headers['Authorization'] = `Bearer ${tokenObject.access_token}`
      }
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// respone interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === '200') {
      return response.data
    }
    if (res.code === '401') {
      MessageBox.confirm('你的请求未授权，您可以取消继续留在该页面，或者重新登录', '确定登出', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('FedLogOut').then(() => {
          location.reload()
        })
      })
    } else {
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject('error')
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
