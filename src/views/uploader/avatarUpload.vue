<template>
  <div class="components-container">
    <avue-crud ref="crud" :data="data" :option="option4" @selection-change="selectionChange"/>
    <div style="margin-top: 20px">
      <el-button @click="toggleSelection([data[1]])">选中第二行</el-button>
      <el-button @click="toggleSelection()">取消选择</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [
        {
          name: '张三',
          sex: '男'
        }, {
          name: '李四',
          sex: '女'
        }
      ],
      option4: {
        selection: true,
        page: false,
        align: 'center',
        menuAlign: 'center',
        column: [
          {
            label: '姓名',
            prop: 'name'
          }, {
            label: '性别',
            prop: 'sex'
          }
        ]
      }
    }
  },
  methods: {
    selectionChange(list) {
      this.$message.success('选中的数据' + JSON.stringify(list))
    },
    toggleSelection(val) {
      this.$refs.crud.toggleSelection(val)
    }
  }
}
</script>

<style scoped>
  .avatar{
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
</style>

