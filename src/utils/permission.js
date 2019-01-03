import store from '@/store'
import { getRolePermissions } from '@/api/rbac'
import { asyncRouterMap, constantRouterMap } from '@/router'
import path from 'path'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    const roles = store.getters && store.getters.roles
    const permissionRoles = value

    return roles.some(role => {
      return permissionRoles.includes(role)
    })
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}

/**
 * 菜单权限树转换成列表形式
 * @param tree
 */
export function permissionTreeToList(tree) {
  let list = []
  tree.forEach(permission => {
    const temp = Object.assign({}, permission)
    if (permission.children && permission.children instanceof Array && permission.children.length > 0) {
      list = list.concat(permissionTreeToList(permission.children))
    }
    delete temp.children
    delete temp.component
    list.push(temp)
  })
  return list
}

// 初始化权限
export function initializePermission(roleid) {
  return getRolePermissions(roleid).then(response => {
    // 初始化用户权限
    const permissionList = response.data.permission_list || []

    // 公用权限
    const items = permissionTreeToList(constantRouterMap).map((item) => item.path)
    store.dispatch('setUserPermission', permissionList.concat(items))
    return permissionList
  })
    .then((permissionList) => {
      // 初始化路由
      const addRouters = markNoAuthRouter(asyncRouterMap, permissionList)
      store.dispatch('GenerateRoutes', addRouters)
      return addRouters
    })
}

// 判断是否有访问权限
export function hasPermission(toPath) {
  return true
  // return store.getters.permission.indexOf(toPath) >= 0
}

// 递归标记拥有的路由访问权限
function markNoAuthRouter(routers, permissionList, parentRouter) {
  parentRouter = parentRouter || { path: '/' }
  return routers.filter(item => {
    return item.path !== '*' || item.alwaysShow
  }).map(item => {
    const temp = Object.assign({}, item)
    temp.absolute_path = path.join('/', parentRouter.path, temp.path)
    // temp.hasAuth = permissionList.includes(temp.absolute_path)
    temp.hasAuth = true

    if (temp.children && temp.children.length > 0) {
      temp.children = markNoAuthRouter(temp.children, permissionList, temp)

      // 如果当前父节点没有权限，而其子节点拥有权限则我们标记父节点拥有权限
      if (!temp.hasAuth) {
        const childrenHasAuth = temp.children.filter(item => {
          return item.hasAuth === true
        }).length > 0
        if (childrenHasAuth) {
          temp.hasAuth = true
        }
      }
    }

    return temp
  })
}
