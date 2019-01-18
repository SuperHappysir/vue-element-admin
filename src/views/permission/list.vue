<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="8" :sm="8" :md="8">
        <permission-tree :role-id="roleId"/>
      </el-col>
    </el-row>

    <el-tooltip placement="top" content="去顶部">
      <back-to-top :visibility-height="300" :back-position="50" transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
import BackToTop from '@/components/BackToTop'
import Permission from '@/components/Permission'
import PermissionTree from './components/tree'
import PermissionGroup from './components/permissionGroup'

export default{
  name: 'PermissionList',
  components: { BackToTop, Permission, PermissionTree, PermissionGroup },
  props: {
    roleId: {
      type: Number,
      default: -1
    }
  }
}
</script>

