<template>
  <el-dialog :visible.sync="visible" :append-to-body="true" title="更新权限" width="30%">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top">
      <el-form-item label="父级权限值" prop="parent_id">
        <select-tree
          :dic="permssionTree"
          :value="temp.parent_id"
          :options="{defaultExpandLevel: 2, idKey: 'id', valKey:'title', childrenKey:'children'}"
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
import { getPermission, updatePermission } from '@/api/rbac'
import { PermissionMixin } from '@/constant/permission'

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
  mixins: [PermissionMixin],
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
        // if (!newVal) {
        //   this.$emit('updateSuccess')
        // }
        this.$emit('update:dialogVisible', newVal)
      }
    }
  },
  methods: {
    update() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) return
        const data = Object.assign({}, this.temp)

        if (data.parent_id > 0) {
          const resp = await getPermission(data.parent_id)
          if (!this.isMenu(resp.data.payload.permission_type)) {
            this.$alert('仅支持菜单节点作为api接口节点上级')
            return
          }
        }

        await updatePermission(this.currentNode.data.id, {
          parent_id: data.parent_id > 0 ? data.parent_id : 0,
          path: this.currentNode.data.source.path,
          method: this.currentNode.data.source.method,
          permission_type: this.currentNode.data.source.permission_type
        })

        await this.$confirm('需要关闭编辑框并刷新列表么?', '权限更新成功', {
          type: 'success'
        })

        this.visible = !this.visible
        this.$emit('updateSuccess')
      })
    },
    handleParentIdChange(object) {
      this.temp.parent_id = object.id
    }
  }
}
</script>

<style scoped>

</style>
