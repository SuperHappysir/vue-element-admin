<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <sticky class-name="box-card">
          <el-tooltip class="item" effect="dark" content="添加角色" placement="top-start" >
            <el-button class="filter-item" icon="el-icon-plus" size="mini" @click="handleCreate"/>
          </el-tooltip>
          <el-popover
            placement="bottom-start"
            width="800"
            trigger="hover">
            <div class="handler-container">
              <el-button size="mini" @click="handlebatchEnable">启用</el-button>
              <el-button size="mini" @click="handlebatchDestoryRole">禁用</el-button>
            </div>
            <div class="tool-container">
              <el-input v-model="temp" placeholder="已选择项ID" readonly>
                <el-button slot="append" type="primary" icon="document" size="mini" @click.native="handleClearSelection">清空</el-button>
                <el-button v-clipboard:copy="temp" v-clipboard:success="clipboardSuccess" slot="append" type="primary" icon="document" size="mini">复制</el-button>
              </el-input>
            </div>
            <el-button slot="reference" plain size="mini" @dblclick.native="handleClearSelection">
              已选<em style="color: red;font-weight: bolder">{{ temp.split(',').filter((item) => !!item).length }}</em> 项 (双击清空) <i class="el-icon-caret-bottom el-icon--right"/>
            </el-button>
          </el-popover>
          <el-button class="filter-item" icon="el-icon-refresh" size="mini" @click="getList"/>
        </sticky>
      </div>
      <div>
        <sticky class-name="box-card" style="margin-bottom:20px;">
          <label class="el-form-item__label" style="width: 75px;font-size: 14px;line-height: 28px;">筛选项:</label>
          <el-input :placeholder="$t('role.name')" v-model="listQuery.name" style="width: 200px;" class="filter-item" size="mini" @keyup.enter.native="handleFilter"/>
          <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" size="mini" @click="handleFilter">{{ $t('table.search') }}</el-button>
        </sticky>

        <el-table
          v-loading.body="listLoading"
          ref="roleListTable"
          :data="list"
          :row-key="getRowKeys"
          fit
          style="width: 100%"
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange">
          <el-table-column
            :reserve-selection="true"
            type="selection"
            width="40"
            label="ID"/>
          <el-table-column align="center" label="ID" width="55">
            <template slot-scope="scope">
              <span>{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" label="名称">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column class-name="status-col" label="状态">
            <template slot-scope="scope">
              <el-tag :type="scope.row.state | statusFilter">{{ scope.row.state | enableStatusName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column align="center" label="创建时间">
            <template slot-scope="scope">
              <span>{{ scope.row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" label="更新时间">
            <template slot-scope="scope">
              <span>{{ scope.row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            </template>
          </el-table-column>

          <el-table-column align="center" label="操作">
            <template slot-scope="scope">
              <span>
                <el-button type="text" @click.stop="handleUpdate(scope.row.id)">编辑</el-button>
                <el-button type="text" @click.stop="assignPermissions(scope.row.id)">权限</el-button>
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            :current-page="listQuery.page"
            :page-sizes="[15,30,50]"
            :page-size="listQuery.limit"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
        </div>
      </div>
    </el-card>

    <el-collapse-transition>
      <role-detail :is-edit="dialogForm.isEdit" :dialog-visible.sync="dialogForm.visible" :id="dialogForm.payload.id" @handleSuccess="getList"/>
    </el-collapse-transition>
    <el-collapse-transition>
      <el-dialog :visible.sync="permissionDialogForm.visible" title="分配权限" width="30%">
        <permission :business-type="permissionDialogForm.businessType" :business-id="permissionDialogForm.payload.id"/>
      </el-dialog>
    </el-collapse-transition>
    <el-tooltip placement="top" content="去顶部">
      <back-to-top :visibility-height="300" :back-position="50" transition-name="fade"/>
    </el-tooltip>
  </div>
</template>

<script>
import { getRoles, batchDestoryRole, batchEnableRole } from '@/api/rbac'
import RoleDetail from './components/RoleDetail'
import BackToTop from '@/components/BackToTop'
import Permission from '@/components/Permission'
import waves from '@/directive/waves' // 水波纹指令
import Sticky from '@/components/Sticky'
import clipboard from '@/directive/clipboard/index'

export default {
  name: 'RoleList',
  components: { RoleDetail, BackToTop, Permission, Sticky },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  directives: {
    waves, clipboard
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        name: '',
        page: 1,
        limit: 15
      },
      dialogForm: {
        visible: false,
        isEdit: false,
        payload: {
          id: 0
        }
      },
      popover: {
        visible: false
      },
      permissionDialogForm: {
        visible: false,
        businessType: 1,
        payload: {
          id: 0
        }
      },
      temp: ''
    }
  },
  computed: {
  },
  watch: {
    dialogForm(val) {
      this.getList()
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleRowClick(row, event, column) {
      this.$refs.roleListTable.toggleRowSelection(row)
      console.log(row, event, column)
      // this.$refs.roleListTable.selection.map(item => item.id).join(',')
    },
    handleSelectionChange(selection) {
      this.temp = selection.map(item => item.id).join(',')
    },
    handleClearSelection() {
      this.$refs.roleListTable.clearSelection()
    },
    clipboardSuccess() {
      this.$message({
        message: 'Copy successfully',
        type: 'success',
        duration: 1500
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    getList() {
      this.listLoading = true
      getRoles(this.listQuery).then(response => {
        const payload = response.data.payload
        this.list = payload.paginate.items
        this.total = payload.paginate.total
        this.listLoading = false
      })
    },
    assignPermissions(id) {
      this.permissionDialogForm.payload.id = id
      this.permissionDialogForm.visible = true
    },
    handleUpdate(id) {
      this.dialogForm.payload.id = id
      this.dialogForm.visible = true
      this.dialogForm.isEdit = true
    },
    handleCreate() {
      this.dialogForm.payload.id = 0
      this.dialogForm.visible = true
      this.dialogForm.isEdit = false
    },
    handlebatchDestoryRole() {
      if (!this.temp) {
        this.$message.error('请选择操作对象')
        return
      }
      batchDestoryRole(this.temp.split(',')).then((response) => {
        this.getList()
        this.$message({
          message: '禁用成功',
          type: 'success',
          duration: 1500
        })
      })
    },
    handlebatchEnable() {
      if (!this.temp) {
        this.$message.error('请选择操作对象')
        return
      }
      batchEnableRole(this.temp.split(',')).then((response) => {
        this.getList()
        this.$message({
          message: '启用成功',
          type: 'success',
          duration: 1500
        })
      })
    },
    handleSizeChange(val) {
      this.listQuery.page = 1
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    getRowKeys(row) {
      return row.id
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
    .handler-container {
        margin-bottom: 20px;
    }
</style>
