import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  const token = Cookies.get(TokenKey)
  if (!token) {
    return {}
  }
  return JSON.parse(token)
}

export function setToken(token) {
  token = JSON.stringify(token)
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
