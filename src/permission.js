import router from './router'
import store from '@/store'
import { getToken } from '@/utils/authToken'
// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 路由访问权限
import { hasPermission, initializePermission } from '@/utils/permission'

// 进度条配置
NProgress.configure({ showSpinner: false })

// 白名单
const whiteList = ['/login', '/authredirect', '/401', '/404']

// 路由权限控制
router.beforeEach((to, from, next) => {
  NProgress.start()

  // 白名单路由直接放行
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
    store.dispatch('refreshToken')
      .then(() => {
        next({ ...to, replace: true })
      })
      .catch(() => {
        store.dispatch('clearToken').then(() => {
          next({ ...to, replace: true })
          NProgress.done()
        })
      })
    return
  }

  // 初始化用户权限
  if (store.getters.permission.length < 1 ||
       store.getters.addRouters.length < 1) {
    // 根据登录信息拉取权限信息
    initializePermission(1).then((addRouters) => {
      // 动态添加可访问路由表
      router.addRoutes(addRouters)
      next({ ...to, replace: true })
      NProgress.done()
    })
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
  NProgress.done() // finish progress bar
})
