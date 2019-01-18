/* Router Modules */

/* Layout */
import Layout from '@/views/layout/Layout'
import role from './modules/role'
import { PERMISSION_TYPE } from '@/constant/permission'

export default [
  {
    path: '/permission2',
    component: Layout,
    redirect: '/permission2/list',
    name: 'Permission',
    meta: {
      title: 'example',
      icon: 'example',
      permission_type: PERMISSION_TYPE.MENU
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/permission/list'),
        name: 'PermissionList',
        meta: { title: 'PermissionList', icon: 'list', permission_type: PERMISSION_TYPE.MENU }
      }
    ]
  },
  role,
  {
    path: '/upload',
    component: Layout,
    redirect: '/upload/demo',
    name: 'upload',
    meta: {
      title: 'upload',
      icon: 'example'
    },
    children: [
      {
        path: 'demo',
        component: () => import('@/views/uploader/avatarUpload'),
        name: 'uploadDemo',
        meta: { title: 'uploadDemo', icon: 'list', permission_type: PERMISSION_TYPE.MENU }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
