<template>
  <el-dialog :title="titleName" :visible.sync="visible" width="30%">
    <el-form v-loading="loading" ref="dataForm" :rules="rules" :model="formData" label-position="top">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称"/>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="update">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getRole, createRole, updateRole } from '@/api/rbac'

export default {
  name: 'RoleDetail',
  props: {
    id: {
      type: Number,
      default: 0
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rules: {
        name: [{ required: true, message: '必填', trigger: 'blur' }]
      },
      formData: {
        id: this.id,
        name: ''
      },
      loading: false
    }
  },
  computed: {
    titleName() {
      return this.isEdit ? '编辑角色' : '添加角色'
    },
    visible: {
      get() {
        return this.dialogVisible
      },
      set(newVal) {
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
        this.$emit('update:dialogVisible', newVal)
      }
    }
  },
  watch: {
    id(val) {
      if (this.isEdit) {
        this.loading = true
        getRole(val).then((response) => {
          this.loading = false
          this.formData = response.data.payload
        })
      }
    }

  },
  methods: {
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) return

        const promise = this.formData.id > 0 ? updateRole(this.formData.id, this.formData) : createRole(this.formData)

        promise.then(({ data: response }) => {
          if (response.code === '200') {
            this.visible = false
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.$emit('handleSuccess')
            return
          }
          this.$message.error(response.message)
        })
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>

</style>
