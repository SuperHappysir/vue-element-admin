/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/layout/Layout'
import { PERMISSION_TYPE } from '@/constant/permission'

const roleRouter = {
  path: '/role',
  component: Layout,
  redirect: '/role/list',
  name: 'role',
  meta: {
    title: 'role',
    icon: 'list',
    permission_type: PERMISSION_TYPE.MENU
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/role/list'),
      name: 'roleList',
      meta: { title: 'roleList', icon: 'list', permission_type: PERMISSION_TYPE.MENU }
    },
    {
      path: 'add-button',
      name: 'add-button',
      meta: { title: 'add-button', icon: 'list', permission_type: PERMISSION_TYPE.BUTTON }
    }
  ]
}
export default roleRouter
