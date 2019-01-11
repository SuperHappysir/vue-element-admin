const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  user: state => state.user.attr,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  permission: state => state.user.permission,
  permission_path: state => state.user.permissionPath,
  errorLogs: state => state.errorLog.logs
}
export default getters
