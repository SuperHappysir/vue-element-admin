<template>
  <div v-loading="loading">
    <el-card class="box-card">
      <div slot="header">
        <div class="title-box">
          <el-tooltip content="同步权限数据到后端" placement="top">
            <el-button type="primary" size="mini" round @click="SyncMenuPermissionData">同步数据</el-button>
          </el-tooltip>
          <el-tooltip content="分配权限" placement="top">
            <el-button type="success" size="mini" round @click="assignPermissions">分配权限</el-button>
          </el-tooltip>
        </div>
      </div>
      <el-input v-model="filterMenuPermText" class="mgb-15" placeholder="筛选菜单"/>
      <el-tree
        ref="menuPermTreeRef"
        :data="menuTree"
        :props="treeProps"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        :default-checked-keys="permission"
        :default-expanded-keys="['/']"
        node-key="absolute_path"
        show-checkbox>
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span class="mgl-10">
            {{ data.title }}
            <el-tooltip content="菜:指代菜单权限,钮:指代按钮权限,接指代API接口权限" placement="top">
              <el-tag v-if="data.permission_type === 2" class="mgl-10" type="success" size="mini">菜</el-tag>
              <el-tag v-else-if="data.permission_type === 3" class="mgl-10" type="success" size="mini">钮</el-tag>
              <el-tag v-else-if="data.permission_type === 1" class="mgl-10" type="success" size="mini">接</el-tag>
            </el-tooltip>
            <el-tooltip content="权限还未同步到后端服务器" placement="top">
              <el-tag v-if="data.permission_type !== 1 && syncMenu.indexOf(data.absolute_path) === -1" class="mgl-10" type="danger" size="mini">!</el-tag>
            </el-tooltip>
          </span>
          <span class="mgl-10">
            <el-button v-if="data.permission_type === 2" type="text" size="mini" icon="el-icon-plus" @click="showdialog('add', node, 'BUTTON')"/>
            <el-button v-if="data.permission_type === 3 && syncMenu.indexOf(data.absolute_path) !== -1" class="delete-btn" type="text" size="mini" icon="el-icon-delete" @click="deletePermission(node)"/>
          </span>
        </span>
      </el-tree>
    </el-card>
    <permission-add v-if="dialog.visible" :current-node="dialog.node" :dialog-visible.sync="dialog.visible" :dialog-type="dialog.type" :business-type="dialog.businessType"/>
  </div>
</template>

<script>
import { generateTitle } from '@/utils/i18n'
import { asyncRouterMap } from '@/router'
import { SyncMenuPermissionData, getMenuPermissionData, assignRolePermissions, deletePermission } from '@/api/rbac'
import { initializePermission, transferBackRoutePermissionToTree } from '@/utils/permission'
import path from 'path'
import debounce from 'lodash/debounce'
import PermissionAdd from './add'
import { getRolePermissions } from '@/api/rbac'
import { transferRoutePermission, permissionTreeToList } from '@/utils/permission'
export default {
  name: 'Permission',
  components: { PermissionAdd },
  props: {
    // 业务类型 1-角色 2-用户
    businessType: {
      type: Number,
      default: 1
    },
    // 业务ID 分配类型为1时为角色ID 类型为2是为用户ID
    businessId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      // 菜单权限树
      menuTree: [],
      //  element树参数
      treeProps: {
        label: 'title',
        children: 'children'
      },
      // 已同步的信息
      syncMenu: [],
      // 按父级分组的按钮字典
      buttonMap: [],
      // path为key 权限ID为value的对象
      permissionPathWithIdMap: {},
      permission: [],
      filterMenuPermText: '',
      dialog: {
        visible: false,
        type: 'add',
        node: {},
        businessType: 'BUTTON'
      },
      loading: true
    }
  },
  watch: {
    'filterMenuPermText': debounce(function(val) {
      // tree筛选
      this.$refs.menuPermTreeRef.filter(val)
    }, 600),
    businessId: function(value) {
      this.loading = true
      getRolePermissions(value).then(response => {
        this.permission = response.data.payload.permission_list.map((item) => item.path)
        this.loading = false
      })
    },
    permission(newValue) {
      this.$refs.menuPermTreeRef.setCheckedKeys(newValue)
    }
  },
  created() {
    this.init()
  },

  methods: {
    async init() {
      this.loading = true

      // 获取所有权限，用于判断权限是否全部同步到后端
      let response = await getMenuPermissionData({ limit: 10000 })
      this.permission = response.data.payload.paginate.items || []
      if (this.permission.length > 0) {
        const filterArr = this.permission.filter((item) => item.permission_type !== 1)
        this.syncMenu = filterArr.map((item) => item.path)

        filterArr.forEach((item) => {
          this.permissionPathWithIdMap[item.path] = item.id
        })
      }

      // 生成权限树形结构
      this.generateMenuTree()

      // 初始化用户权限
      response = await getRolePermissions(this.businessId)
      this.permission = response.data.payload.permission_list.map((item) => item.path)

      this.loading = false
    },
    showdialog(type, node, businessType) {
      this.dialog.visible = true
      this.dialog.type = type
      this.dialog.node = node
      this.dialog.businessType = businessType
    },
    generateTitle,
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1 || data.path.indexOf(value) !== -1 || data.title.indexOf(value) !== -1
    },
    generateMenuTree() {
      this.menuTree = [{
        'path': '/',
        'absolute_path': '/',
        'name': '根对象',
        'title': '根对象',
        'permission_type': 2,
        'children': this.getChildren(asyncRouterMap.concat(transferBackRoutePermissionToTree(this.permission)), { 'path': '/' }).filter(item => {
          return item.path !== '*' || item.alwaysShow
        })
      }]
    },
    getChildren(childrens, parentNode) {
      if (!childrens) {
        return []
      }

      return childrens.map((childenItem) => {
        const title = childenItem.title || (childenItem.meta && childenItem.meta.title ? childenItem.meta.title : '')
        const newChilden = {
          'path': childenItem.path,
          'absolute_path': path.join('/', parentNode.path, childenItem.path),
          'permission_type': childenItem.permission_type || 2,
          'name': typeof childenItem.name !== undefined ? childenItem.name : '',
          'title': title ? this.generateTitle(title) : title
        }

        newChilden.children = newChilden.children || []
        if (childenItem.children && childenItem.children.length > 0) {
          newChilden.children = this.getChildren(childenItem.children, newChilden)
        }

        //  按钮
        if (this.buttonMap[newChilden.absolute_path]) {
          const tempButtonArr = this.buttonMap[newChilden.absolute_path]
          tempButtonArr.map((tempButton) => {
            newChilden.children.push({
              'path': tempButton.path,
              'id': tempButton.id,
              'absolute_path': tempButton.path,
              'permission_type': 3,
              'name': tempButton.name,
              'title': tempButton.name
            })
          })
        }
        return newChilden
      })
    },
    // 同步路由到后端
    async SyncMenuPermissionData() {
      // 将前端权限钻换成后端对应的格式
      const menuTree = transferRoutePermission(
        // 建树型权限转成列表
        permissionTreeToList(this.menuTree)
      )

      await SyncMenuPermissionData({ 'permissions': menuTree })

      const response = await getMenuPermissionData({ limit: 10000 })
      this.permission = response.data.payload.paginate.items || []
      if (this.permission.length > 0) {
        const filterArr = this.permission.filter((item) => item.permission_type !== 1)
        this.syncMenu = filterArr.map((item) => item.path)

        filterArr.forEach((item) => {
          this.permissionPathWithIdMap[item.path] = item.id
        })
      }

      this.$message({
        message: '恭喜你，同步成功',
        type: 'success'
      })
    },
    // 分配权限
    assignPermissions() {
      const checkedMenus = this.$refs.menuPermTreeRef.getCheckedNodes()
      const permissionArr = []
      checkedMenus.forEach((item) => {
        const permissionId = this.permissionPathWithIdMap[item.absolute_path]
        if (permissionId) {
          permissionArr.push(permissionId)
        }
      })
      if (this.businessType === 1) {
        assignRolePermissions(this.businessId, permissionArr).then((result) => {
          return initializePermission(1)
        }).then((response) => {
          this.$message({
            message: '权限分配成功',
            type: 'success'
          })
        })
      } else {
        this.$message({
          message: '暂不支持其他类型',
          type: 'success'
        })
      }
    },
    deletePermission(node) {
      this.$confirm(`确认删除按钮【${node.data.name}】?`)
        .then(() => {
          return deletePermission(node.data.id)
        }).then(() => {
          this.init()
          this.$message({
            message: '删除成功',
            type: 'success'
          })
        })
    }
  }
}
</script>

<style scoped>
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }

    .mgb-15 {
        margin-bottom: 15px;
    }
</style>
