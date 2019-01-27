
<template>
  <avue-crud
    :option="option"
    :data="data"
    :page="page"
    @search-change="searchChange"
    @on-load="onLoad">
    <template slot="search">
      <el-form-item label="自定义">
        <el-input v-model="searchForm.solt" placeholder="自定义搜索" size="small" />
      </el-form-item>
    </template>
    <template slot="searchMenu">
      <el-button size="small">自定义按钮</el-button>
    </template>
    <template slot="tip">
      <el-button type="text" size="small">
        自定义按钮
      </el-button>
      <span>自定义内容</span>
    </template>
  </avue-crud>
</template>
<script>
export default {
  name: 'RoleList',
  data() {
    return {
      searchForm: {},
      data: [],
      option: {
        index: true,
        selection: true,
        column: [{
          label: '姓名',
          prop: 'name',
          search: true
        }]
      },
      page: {
        pageSize: 1,
        pageSizes: [1, 5, 10, 20, 30, 40],
        currentPage: 1,
        total: 0
      }
    }
  },
  methods: {
    searchChange(params) {
      this.$message.success('search callback' + JSON.stringify(Object.assign(params, this.searchForm)))
    },
    onLoad(page) {
      this.$message.success('分页信息:' + JSON.stringify(page))
      this.page.total = 40
      // 模拟分页
      if (page.currentPage === 1) {
        this.data = [
          { id: 1, name: '张三1' }
        ]
      } else if (page.currentPage > 1) {
        this.data = [
          {
            id: page.currentPage,
            name: '李四' + page.currentPage
          }
        ]
      }
    }
  }
}
</script>
