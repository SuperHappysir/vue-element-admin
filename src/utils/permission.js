import store from '@/store'
import { getUserPermissions } from '@/api/rbac'
import { asyncRouterArr, constantRouterMap } from '@/router'
import path from 'path'
import { PERMISSION_TYPE } from '@/constant/permission'

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
 * 批量转换菜单权限路由数组为后端格式数组
 * @param {array} menuList 前端路由列表
 * @returns {{path: (*|string), name: *, description: *, permission_type: number}[]}
 */
export function transferFrontendRoutePermissionListFormat(menuList) {
  return menuList.map((item) => {
    return transferFrontendRoutePermission(item)
  })
}

/**
 * 转换菜单权限路由对象为后端权限对象
 * @param item
 * @returns {{path: (*|string), permission_type: (rules.permission_type|{trigger, message, required}|number), name: *, description: *}}
 */
export function transferFrontendRoutePermission(item) {
  return {
    'path': item.absolute_path,
    'name': item.name,
    'description': item.title,
    'permission_type': item.permission_type || item.meta.permission_type || PERMISSION_TYPE.MENU,
    'parent_id': item.parent_id,
    'source': item
  }
}

/**
 * 转换后端权限路由对象为前端对象
 * @param item
 * @returns {{path: (*|string), permission_type: (rules.permission_type|{trigger, message, required}|number), name: *, description: *}}
 */
export function transferBackendRoutePermission(item) {
  return {
    'id': item.id,
    'path': `${item.method}:${item.path}`,
    'name': item.name,
    'title': item.description,
    'permission_type': item.permission_type || PERMISSION_TYPE.API,
    'parent_id': item.parent_id,
    'source': item
  }
}

/**
 * 递归转换菜单权限路由为前端树状格式
 * @param {array} menuList 前端路由列表
 * @param {int} parent_id 父节点ID
 * @returns {{path: (*|string), name: *, description: *, permission_type: number}[]}
 */
export function transferBackRoutePermissionListToTree(menuList, parent_id = 0) {
  return menuList
    .filter(item => parseInt(item.parent_id) === parent_id && PERMISSION_TYPE.isApi(item.permission_type))
    .map((item) => {
      const tmp = transferBackendRoutePermission(item)

      return Object.assign({
        children: transferBackRoutePermissionListToTree(menuList, item.id)
      }, tmp)
    })
}

// 初始化权限
export async function initializePermission(userid) {
  // 获取用户权限
  const response = await getUserPermissions(userid)
  let permissionList = response.data.payload.permission_list || []

  // 设置用戶权限
  const items = permissionTreeToList(constantRouterMap)
  await store.dispatch('setUserPermission', permissionList.concat(items))

  // 初始化用戶可見的menu
  permissionList = store.getters.permission_path
  const addRouters = markNoAuthRouter(asyncRouterArr, permissionList)

  return store.dispatch('GenerateRoutes', addRouters)
}

// 判断是否有访问权限
export function hasPermission(toPath) {
  return store.getters.permission_path.indexOf(toPath) >= 0
}

// 递归标记拥有的路由访问权限
function markNoAuthRouter(routers, permissionList, parentRouter) {
  parentRouter = parentRouter || { path: '/' }
  return routers.filter(item => {
    return item.path !== '*' ||
      item.alwaysShow ||
      (item.meta && item.meta.permission_type && PERMISSION_TYPE.isMenu(item.meta.permission_type))
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
