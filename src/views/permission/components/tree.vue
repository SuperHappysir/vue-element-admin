<template>
  <div v-loading="loading">
    <el-card class="box-card">
      <div slot="header">
        <div class="title-box">
          <el-tooltip content="同步权限数据到后端" placement="top">
            <el-button type="primary" size="mini" round @click="SyncMenuPermissionData">同步数据</el-button>
          </el-tooltip>
          <!-- 仅执行权限分配的时候才展示此按钮 -->
          <el-tooltip v-if="roleId !== -1" content="分配权限" placement="top">
            <el-button type="success" size="mini" round @click="assignPermissions">分配权限</el-button>
          </el-tooltip>
        </div>
      </div>
      <el-input v-model="filterMenuPermText" class="mgb-15" placeholder="筛选菜单"/>
      <el-tree
        ref="menuPermTreeRef"
        :data="menuTree"
        :props="treeProps"
        :filter-node-method="filterNode"
        :default-checked-keys="ownPermissionIdArr"
        :default-expanded-keys="[-1]"
        :show-checkbox="roleId > -1"
        expand-on-click-node
        node-key="id">
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span class="mgl-10">
            {{ data.title }}
            <el-tooltip content="菜:指代菜单权限,钮:指代按钮权限,接指代API接口权限" placement="top">
              <el-tag
                v-if="data.permission_type === 2"
                class="mgl-10"
                type="success"
                size="mini">菜</el-tag>
              <el-tag
                v-else-if="data.permission_type === 3"
                class="mgl-10"
                type="success"
                size="mini">钮</el-tag>
              <el-tag
                v-else-if="data.permission_type === 1"
                class="mgl-10"
                type="success"
                size="mini">接</el-tag>
            </el-tooltip>
            <el-tooltip content="权限还未同步到后端服务器" placement="top">
              <el-tag
                v-if="data.permission_type !== 1 && syncMenu.indexOf(data.absolute_path) === -1"
                class="mgl-10"
                type="danger"
                size="mini">!</el-tag>
            </el-tooltip>
          </span>
          <span class="mgl-10">
            <el-button
              v-if="data.permission_type === 1"
              class="edit-btn"
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click.stop="showdialog(node)"/>
          </span>
        </span>
      </el-tree>
    </el-card>
    <permission-edit
      v-if="dialog.visible"
      :current-node="dialog.node"
      :dialog-visible.sync="dialog.visible"
      :permssion-tree="menuTree"
      @updateSuccess="init"/>
  </div>
</template>

<script>
import { generateTitle } from '@/utils/i18n'
import { asyncRouterMap } from '@/router'
import {
  assignRolePermissions, deletePermission, getMenuPermissionData, getRolePermissions, SyncMenuPermissionData
} from '@/api/rbac'
import {
  initializePermission, permissionTreeToList, transferBackRoutePermissionToTree, transferRoutePermission
} from '@/utils/permission'
import path from 'path'
import debounce from 'lodash/debounce'
import permissionEdit from './edit'

export default {
  name: 'Tree',
  components: { permissionEdit },
  props: {
    roleId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      allMenuTree: [],
      // 菜单 element tree源数据
      menuTree: [],
      // element树参数
      treeProps: {
        label: 'title',
        children: 'children'
      },
      // path为key 权限ID为value的对象
      permissionPath2ObjectMap: {},
      // 所有权限源数据
      permissionSource: [],
      // 角色拥有的权限源数据
      permission: [],
      // 树形插件筛选
      filterMenuPermText: '',
      // 添加/编辑dialog
      dialog: {
        visible: false,
        type: 'update',
        node: {}
      },
      loading: true
    }
  },
  computed: {
    syncMenu() {
      return this.permissionSource.map((item) => item.path)
    },
    ownPermissionIdArr() {
      return this.permission.map((item) => item.id).filter((item) => !!item)
    }
  },
  watch: {
    'filterMenuPermText': debounce(function(val) {
      // tree筛选
      this.$refs.menuPermTreeRef.filter(val)
    }, 600),
    roleId: function(value) {
      if (value > 0) {
        this.init()
      }
    },
    permission(newValue) {
      this.$refs.menuPermTreeRef.setCheckedKeys(newValue)
    }
  },
  created() {
    this.init()
  },
  methods: {
    async initPermission() {
      const response = await getMenuPermissionData({ limit: 10000 })
      this.permissionSource = response.data.payload.paginate.items || []
      if (this.permissionSource.length > 0) {
        this.permissionSource.forEach((item) => {
          this.permissionPath2ObjectMap[item.path] = item
        })
      }
    },
    async initOwnPermission() {
      const response = await getRolePermissions(this.roleId)
      this.permission = response.data.payload.permission_list
    },
    async init() {
      this.loading = true

      // 获取所有权限
      await this.initPermission()

      // 初始化角色权限
      if (this.roleId > 0) {
        await this.initOwnPermission()
      }

      // 生成权限树形结构
      await this.generateMenuTree()

      this.loading = false
    },
    showdialog(node) {
      this.dialog.visible = !this.dialog.visible
      this.dialog.node = node
    },
    generateTitle,
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1 || data.path.indexOf(value) !== -1 || data.title.indexOf(value) !== -1
    },
    generateMenuTree() {
      this.allMenuTree = [{
        'id': -1,
        'path': '/',
        'absolute_path': '/',
        'name': '根对象',
        'title': '根对象',
        'permission_type': 2,
        'parent_id': 0,
        'children': this.getChildren(
          asyncRouterMap.concat(transferBackRoutePermissionToTree(this.permissionSource)),
          { 'path': '/' }
        )
      }]
      this.menuTree = this.allMenuTree.filter(item => {
        return item.path !== '*' || item.alwaysShow
      })
    },
    getChildren(childrens, parentNode) {
      if (!childrens) {
        return []
      }

      return childrens.map((childenItem) => {
        const absolutePath = childenItem.permission_type !== 1 ? path.join('/', parentNode.path, childenItem.path) : childenItem.path
        const id = childenItem.id ||
          (this.permissionPath2ObjectMap[absolutePath] ? this.permissionPath2ObjectMap[absolutePath].id : 0)
        if (!id) {
          return null
        }
        const parent_id = childenItem.parent_id ||
          (this.permissionPath2ObjectMap[absolutePath] ? this.permissionPath2ObjectMap[absolutePath].parent_id : 0)

        const title = childenItem.title || (childenItem.meta && childenItem.meta.title ? childenItem.meta.title : '')

        const newChilden = {
          'id': id,
          'path': childenItem.path,
          'absolute_path': absolutePath,
          'parent_id': parent_id,
          'permission_type': childenItem.permission_type || 2,
          'name': typeof childenItem.name !== undefined ? childenItem.name : '',
          'title': title ? this.generateTitle(title) : title,
          'source': childenItem.source || {}
        }

        newChilden.children = newChilden.children || []
        if (childenItem.children && childenItem.children.length > 0) {
          newChilden.children = this.getChildren(childenItem.children, newChilden)
        }

        return newChilden
      }).filter(item => !!item)
    },
    // 同步路由到后端
    async SyncMenuPermissionData() {
      // 将前端权限钻换成后端对应的格式
      const menuTree = transferRoutePermission(
        // 将树型权限转成列表
        permissionTreeToList(this.allMenuTree).filter(item => item.permission_type === 2)
      )

      await SyncMenuPermissionData({ 'permissions': menuTree })

      await this.init()

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
        const permissionId = item.id
        if (permissionId) {
          permissionArr.push(permissionId)
        }
      })
      assignRolePermissions(this.roleId, permissionArr).then((result) => {
        return initializePermission(this.$store.getters.user.id)
      }).then((response) => {
        this.$message({
          message: '权限分配成功',
          type: 'success'
        })
      })
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
