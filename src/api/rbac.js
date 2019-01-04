import request from '@/utils/request'

export function SyncMenuPermissionData(params) {
  return request.post('/api/permission', params)
}

export function getMenuPermissionData() {
  return request.get('/api/permission')
}

export function deletePermission(id) {
  return request.delete(`/api/permission/${id}`)
}

export function assignRolePermissions(roleid, permissionList) {
  return request.post(`/api/roles/${roleid}/permission`, { 'permissionList': permissionList })
}

export function getUserPermissions(userid) {
  return request.get(`/api/admin/${userid}/permission`)
}

export function getRolePermissions(roleid) {
  return request.get(`/api/roles/${roleid}/permission`)
}

export function getRoleButtons(roleid) {
  return request.get(`/api/roles/${roleid}/button`)
}

export function getButtons() {
  return request.get(`/api/button`)
}

export function getRoles(param) {
  return request.get('/api/roles', { params: param })
}

export function createRole(param) {
  return request.post(`/api/roles`, param)
}

export function updateRole(id, param) {
  return request.put(`/api/roles/${id}`, param)
}

export function batchDestoryRole(ids) {
  return request.post(`/api/roles/_bulk/batchDisabled`, { params: { ids }})
}

export function batchEnableRole(ids) {
  return request.post(`/api/roles/_bulk/batchEnable`, { params: { ids }})
}

export function getRole(id) {
  return request.get(`/api/roles/${id}`)
}
