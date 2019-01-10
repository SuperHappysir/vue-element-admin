import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Avue from '@smallwei/avue'
import '@smallwei/avue/lib/theme-chalk/index.css'

import VueParticles from 'vue-particles'

import '@/styles/index.scss'

import App from './App'
import router from './router'
import store from './store'
import i18n from './lang'
import './icons'
import './errorLog'
import * as filters from './filters'
// 权限控制
import './permission'

// 模拟API
// import './mock'

Vue.use(Element, {
  size: 'medium',
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(Avue, {
  size: 'medium'
})

Vue.use(VueParticles)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// 根据环境自动开启vue-devtool
Vue.config.productionTip = process.env.NODE_ENV === 'production'

const app = new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})

export { app, router, store }
