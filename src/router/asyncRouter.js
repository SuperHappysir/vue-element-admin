/* Router Modules */

/* Layout */
import Layout from '@/views/layout/Layout'

export default [
  {
    path: '/permission2',
    component: Layout,
    redirect: '/permission2/list',
    name: 'Permission',
    meta: {
      title: 'example',
      icon: 'example'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/permission/list'),
        name: 'PermissionList',
        meta: { title: 'PermissionList', icon: 'edit' }
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    redirect: '/role/list',
    name: 'Example',
    meta: {
      title: 'role',
      icon: 'example'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/role/list'),
        name: 'roleList',
        meta: { title: 'roleList', icon: 'list' }
      }
    ]
  },
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
        meta: { title: 'uploadDemo', icon: 'list' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]
