import store from '@/store'
import { getUserPermissions } from '@/api/rbac'
import { asyncRouterMap, constantRouterMap } from '@/router'
import path from 'path'

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

/**
 * 转换菜单权限路由为后端格式
 * @param {array} menuList 前端路由列表
 * @returns {{path: (*|string), name: *, description: *, permission_type: number}[]}
 */
export function transferRoutePermission(menuList) {
  return menuList.map((item) => {
    return {
      'path': item.absolute_path,
      'name': item.name,
      'description': item.title,
      'permission_type': 2
    }
  })
}

/**
 * 转换菜单权限路由为后端格式
 * @param {array} menuList 前端路由列表
 * @param {int} parent_id 父节点ID
 * @returns {{path: (*|string), name: *, description: *, permission_type: number}[]}
 */
export function transferBackRoutePermissionToTree(menuList, parent_id = 0) {
  return menuList
    .filter(item => parseInt(item.parent_id) === parent_id && parseInt(item.permission_type) === 1)
    .map((item) => {
      return {
        'path': `${item.path}/${item.name}`,
        'name': item.name,
        'title': item.description,
        'permission_type': 1,
        'children': transferBackRoutePermissionToTree(menuList, item.id)
      }
    })
}

// 初始化权限
export function initializePermission(userid) {
  return getUserPermissions(userid)
    .then(response => {
      return response.data.payload.permission_list || []
    })
    // 设置用戶权限
    .then(permissionList => {
      const items = permissionTreeToList(constantRouterMap)
      return store.dispatch('setUserPermission', permissionList.concat(items))
    })
    // 初始化用戶可見的menu
    .then(permissionList => {
      permissionList = permissionList.map((item) => item.path)
      const addRouters = markNoAuthRouter(asyncRouterMap, permissionList)
      return store.dispatch('GenerateRoutes', addRouters)
    })
}

// 判断是否有访问权限
export function hasPermission(toPath) {
  return store.getters.permission_path.indexOf(toPath) >= 0
}

// 递归标记拥有的路由访问权限
function markNoAuthRouter(routers, permissionList, parentRouter) {
  parentRouter = parentRouter || { path: '/' }
  return routers.filter(item => {
    return item.path !== '*' || item.alwaysShow
  }).map(item => {
    const temp = Object.assign({}, item)
    temp.absolute_path = path.join('/', parentRouter.path, temp.path)
    temp.hasAuth = hasPermission(temp.absolute_path)

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
