import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/api/admin/auth/login',
    method: 'post',
    data
  })
}

export function refreshToken() {
  return request({
    url: '/api/admin/auth/refresh',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/api/admin/auth/user',
    method: 'get',
    params: { token }
  })
}

