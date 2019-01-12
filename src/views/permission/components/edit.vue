<template>
  <el-dialog :visible.sync="visible" title="更新权限" width="30%">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top">
      <el-form-item label="父级权限值" prop="parent_id">
        <select-tree
          :dic="permissionData"
          :value="temp.parent_id"
          :options="{defaultExpandLevel: 2}"
          @select="handleParentIdChange"
        />
      </el-form-item>
      <el-form-item label="权限类型" prop="permission_type">
        <el-select v-model="temp.permission_type" :disabled="true">
          <el-option
            v-for="item in permType"
            :key="item.code"
            :label="item.name"
            :value="item.code"/>
        </el-select>
      </el-form-item>
      <el-form-item label="权限名称" prop="name">
        <el-input v-model="temp.title" :disabled="true"/>
      </el-form-item>
      <el-form-item label="权限名" prop="name">
        <el-input v-model="temp.name" :disabled="true"/>
      </el-form-item>
      <el-form-item label="权限值" prop="path">
        <el-input v-model="temp.path" :disabled="true" placeholder="例如：/test"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = !visible">取消</el-button>
      <el-button type="primary" @click="update">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import '@/components/SelectTree'
import SelectTree from '@/components/SelectTree/index'
import { updatePermission } from '@/api/rbac'

const permType = {
  MENU: { code: 2, name: '菜单', type: 'MENU' },
  BUTTON: { code: 3, name: '按钮', type: 'BUTTON' },
  API: { code: 1, name: '接口', type: 'API' }
}

const constDialogType = {
  ADD: 'add',
  UPDATE: 'update'
}

export default {
  name: 'Edit',
  components: { SelectTree },
  props: {
    currentNode: {
      type: Object,
      default: () => {
        return {
          'data': {
            absolute_path: '',
            name: '',
            path: '',
            title: '',
            parent: {}
          },
          'parent': {}
        }
      }
    },
    permssionTree: {
      type: Array,
      default() {
        return {}
      }
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      permType,
      constDialogType,
      temp: {
        title: this.currentNode.data.title,
        name: this.currentNode.data.name,
        parent_id: this.currentNode.data.parent_id > 0 ? this.currentNode.data.parent_id : -1,
        path: this.currentNode.data.absolute_path,
        permission_type: this.currentNode.data.permission_type
      },
      rules: {
        parent_id: [{ required: true, message: '必填', trigger: 'blur' }]
      }
    }
  },
  computed: {
    visible: {
      get() {
        return this.dialogVisible
      },
      set(newVal) {
        this.$emit('update:dialogVisible', newVal)
      }
    },
    permissionData() {
      return this.transformKeyValue(this.permssionTree)
    }
  },
  methods: {
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const data = Object.assign({}, this.temp)// copy obj
        updatePermission(this.currentNode.data.id, {
          parent_id: data.parent_id > 0 ? data.parent_id : 0,
          path: this.currentNode.data.source.path,
          method: this.currentNode.data.source.method,
          permission_type: this.currentNode.data.source.permission_type
        }).then((response) => {
          this.$message({
            message: '权限分配成功',
            type: 'success'
          })
          return response
        }).then((response) => {
          this.$emit('updateSuccess', response)
        })
      })
    },
    handleParentIdChange(object) {
      this.temp.parent_id = object.id
    },
    transformKeyValue(permissionArr) {
      if (!permissionArr) {
        return []
      }
      return permissionArr.map(item => {
        const object = {
          id: item.id,
          label: item.title
        }

        const children = this.transformKeyValue(item.children)
        if (children.length > 0) {
          object.children = children
        }
        return object
      })
    }
  }
}
</script>

<style scoped>

</style>
