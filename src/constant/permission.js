// 权限类型
export const PERMISSION_TYPE = {
  API: 1,
  MENU: 2,
  BUTTON: 3,
  isApi: (type) => {
    return parseInt(type) === PERMISSION_TYPE.API
  },
  isMenu: (type) => {
    return parseInt(type) === PERMISSION_TYPE.MENU
  },
  isButton: (type) => {
    return parseInt(type) === PERMISSION_TYPE.BUTTON
  }
}

export const PermissionMixin = {
  methods: {
    isApi: PERMISSION_TYPE.isApi,
    isMenu: PERMISSION_TYPE.isMenu,
    isButton: PERMISSION_TYPE.isButton
  }
}
