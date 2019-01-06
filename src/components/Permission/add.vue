<template>
  <!--弹窗：新增或编辑权限-->
  <!--:visible.sync="dialogFormVisible"-->
  <el-dialog :title="titleName" :visible.sync="visible" width="30%">
    <el-form ref="dataForm" :rules="rules" :model="temp" label-position="top">
      <el-form-item label="权限名" prop="name">
        <el-input v-model="temp.name" placeholder="例如：用户管理、添加用户"/>
      </el-form-item>
      <el-form-item label="权限值" prop="path">
        <el-input v-model="temp.path" :disabled="dialogType===constDialogType.UPDATE" placeholder="例如：/test"/>
      </el-form-item>
      <el-form-item label="父级权限值" prop="absolute_path">
        <el-input :value="currentNode.parent.data.absolute_path" :readonly="true"/>
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
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button v-if="dialogType===constDialogType.ADD" type="primary" @click="add">确定</el-button>
      <el-button v-else-if="dialogType===constDialogType.ADD" type="primary" @click="update">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import path from 'path'

const permType = {
  BUTTON: { code: 3, name: '按钮', type: 'BUTTON' },
  API: { code: 1, name: '接口', type: 'API' }
}

const constDialogType = {
  ADD: 'add',
  UPDATE: 'update'
}

export default {
  name: 'PermissionAdd',
  props: {
    // 业务类型 编辑Or新增
    dialogType: {
      type: String,
      default: constDialogType.ADD
    },
    businessType: {
      type: String,
      default: permType.BUTTON.code
    },
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
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      permType,
      constDialogType,
      textMap: {
        addButton: '添加权限',
        updateButton: '更新权限'
      },
      temp: {
        name: this.dialogType === constDialogType.ADD ? '' : this.currentNode.data.name,
        permission_type: permType[this.businessType].code,
        path: this.dialogType === constDialogType.ADD ? '' : this.currentNode.data.absolute_path
      },
      rules: {
        name: [{ required: true, message: '必填', trigger: 'blur' }],
        permission_type: [{ required: true, message: '必填', trigger: 'blur' }],
        path: [{ required: true, message: '必填', trigger: 'change' }]
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
    titleName() {
      return this.textMap[this.dialogType + 'Button']
    }
  },
  methods: {
    add() {
      // if (this.currentNode.childNodes.length === 0) {
      //   this.currentNode.
      // }
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const childNode = Object.assign({}, this.temp)
        childNode.title = childNode.name
        childNode.absolute_path = `${this.permType[this.businessType].type}:` + path.join('/', this.currentNode.data.absolute_path, childNode.path)

        this.$parent.$refs.menuPermTreeRef.append(childNode, this.currentNode)
        this.visible = false
      })
    },
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return
        const data = Object.assign({}, this.temp)// copy obj
        console.log(data)
        // permApi.updatePerm(data).then(res => {
        //   this.dialogFormVisible = false
        //   this.initData()
        //   this.$message.success('更新按钮权限成功')
        // })
      })
    }
  }
}
</script>

<style scoped>

</style>
