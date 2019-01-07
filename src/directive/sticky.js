const vueSticky = {}
let listenAction
vueSticky.install = Vue => {
  Vue.directive('sticky', {
    unbind() {
      window.removeEventListener('scroll', listenAction)
    }
  })
}

export default vueSticky

