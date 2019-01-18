<template>
  <div v-loading="loading">
    <el-card class="box-card">
      <div slot="header">
        <div class="title-box">
          <el-tooltip content="同步权限数据到后端" placement="top">
            <el-button type="primary" size="mini" round @click="syncMenuPermissionData">同步数据</el-button>
          </el-tooltip>
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
              <el-tag v-if="isMenu(data.permission_type)" class="mgl-10" type="success" size="mini">菜</el-tag>
              <el-tag v-else-if="isButton(data.permission_type)" class="mgl-10" type="success" size="mini">钮</el-tag>
              <el-tag v-else-if="isApi(data.permission_type)" class="mgl-10" type="success" size="mini">接</el-tag>
            </el-tooltip>
            <el-tooltip content="权限还未同步到后端服务器" placement="top">
              <el-tag v-if="!isApi(data.permission_type) && syncMenu.indexOf(data.absolute_path) === -1" class="mgl-10" type="danger" size="mini">!</el-tag>
            </el-tooltip>
          </span>
          <span class="mgl-10">
            <el-button v-if="data.permission_type === 1" class="edit-btn" type="text" size="mini" icon="el-icon-edit" @click.stop="showdialog(node)"/>
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
  assignRolePermissions, generateBackendPremission, getMenuPermissionData, getRolePermissions, syncMenuPermissionData
} from '@/api/rbac'
import {
  initializePermission, permissionTreeToList, transferBackRoutePermissionToTree, transferRoutePermission
} from '@/utils/permission'
import path from 'path'
import debounce from 'lodash.debounce'
import permissionEdit from './edit'
import { PermissionMixin } from '@/constant/permission'

export default {
  name: 'Tree',
  components: { permissionEdit },
  mixins: [PermissionMixin],
  props: {
    roleId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      // 所有权限树
      allMenuTree: [],
      // 过滤不显示的权限后的树
      menuTree: [],
      treeProps: {
        label: 'title',
        children: 'children'
      },
      // path为key 权限对象为value的对象
      permissionPath2ObjectMap: {},
      // 后端返回的权限源数据
      permissionSource: [],
      // 当前角色拥有的权限
      rolePermission: [],
      // 权限树筛选变量
      filterMenuPermText: '',
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
      return this.rolePermission.map((item) => item.id).filter((item) => !!item)
    }
  },
  watch: {
    'filterMenuPermText': debounce(function(val) {
      this.$refs.menuPermTreeRef.filter(val)
    }, 600),
    roleId(value) {
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
      this.rolePermission = response.data.payload.permission_list
    },
    async init() {
      this.loading = true

      await this.initPermission()

      if (this.roleId > 0) {
        await this.initOwnPermission()
      }

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
    async syncMenuPermissionData() {
      // 将前端权限钻换成后端对应的格式
      const menuTree = transferRoutePermission(
        // 将树型权限转成列表
        permissionTreeToList(this.allMenuTree).filter(item => !this.isApi(item.permission_type))
      )

      await Promise.all([
        // 同步前端数据
        syncMenuPermissionData({ 'permissions': menuTree }),
        // 后端路由数据生成
        generateBackendPremission()
      ])

      await this.init()

      this.$message({
        message: '恭喜你，同步成功',
        type: 'success'
      })
    },
    // 获取已选择权限
    getCheckedPermissionIdArr() {
      const checkedMenus = this.$refs.menuPermTreeRef.getCheckedNodes()
      const permissionIdArr = []
      checkedMenus.forEach((item) => {
        const permissionId = item.id
        if (permissionId) {
          permissionIdArr.push(permissionId)
        }
      })
      return permissionIdArr
    },
    // 分配权限
    async assignPermissions() {
      const permissionIdArr = this.getCheckedPermissionIdArr()

      const resp = await assignRolePermissions(this.roleId, permissionIdArr)

      this.$emit('assign-success', resp)

      await initializePermission(this.$store.getters.user.id)

      this.$message({
        message: '权限分配成功',
        type: 'success'
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
