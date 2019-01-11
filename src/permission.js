import router from './router'
import store from '@/store'
import { getToken } from '@/utils/authToken'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 路由访问权限
import { hasPermission, initializePermission } from '@/utils/permission'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单
const whiteList = ['/login', '/authredirect', '/401', '/404']

// 路由权限控制
router.beforeEach(async(to, from, next) => {
  NProgress.start()

  // 白名单路由放行
  if (whiteList.indexOf(to.path) !== -1) {
    next()
    NProgress.done()
    return
  }

  // 检测登陆状态&刷新token
  const token = getToken()
  if (!token) {
    next(`/login?redirect=${to.path}`)
    NProgress.done()
    return
  } else if (token.expired < Math.ceil(new Date().getTime() / 1000)) {
    // 刷新token,token刷新成功后对当前路由做重试处理
    // 刷新失败后清空token,跳转登录页
    try {
      await store.dispatch('refreshToken')
      next({ ...to, replace: true })
    } catch (e) {
      await store.dispatch('clearToken')
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
    return
  }

  // 用户信息
  let user = store.getters.user
  if (!user.id) {
    user = await store.dispatch('GetUserInfo')
  }

  // 初始化用户权限
  if (store.getters.permission.length < 1 ||
       store.getters.addRouters.length < 1) {
    // 根据登录信息拉取权限信息
    const addRouters = await initializePermission(user.id)

    // 动态添加可访问路由表
    router.addRoutes(addRouters)
    next({ ...to, replace: true })
    NProgress.done()

    return
  }

  if (to.path === '/login') {
    next({ path: '/' })
    NProgress.done()
    return
  }

  // 判断用户权限
  let toPath = to.path
  if (to.matched && to.matched.length > 0) {
    toPath = to.matched[to.matched.length - 1].path
  }
  if (hasPermission(toPath)) {
    next()
  } else {
    next({ path: '/401', replace: true, query: { noGoBack: true }})
  }
})

router.afterEach(() => {
  NProgress.done()
})
