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

  if (whiteList.indexOf(to.path) !== -1) {
    next()
    NProgress.done()
    return
  }

  if (!getToken()) {
    next(`/login?redirect=${to.path}`)
    NProgress.done()
    return
  }

  if (!store.getters.permission ||
       store.getters.permission.length < 1 ||
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
