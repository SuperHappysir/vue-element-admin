<template>
  <div>
    <el-container class="l-select-container">
      <el-aside class="l-left-select-label">发布</el-aside>
      <el-main style="padding-top: 15px;">
        <div>
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="city in cities" :label="city" :key="city">{{ city }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
const cityOptions = ['上海', '北京', '广州', '深圳']
export default {
  data() {
    return {
      checkAll: false,
      checkedCities: ['上海', '北京'],
      cities: cityOptions,
      isIndeterminate: true
    }
  },
  methods: {
    handleCheckAllChange(val) {
      this.checkedCities = val ? cityOptions : []
      this.isIndeterminate = false
    },
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.cities.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.cities.length
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .l-select-container {
    .l-left-select-label {
      padding: 15px;
      text-align: center;
      width: 80px !important;
    }
  }

  .l-left-select-label {
    padding: 15px;
    text-align: center;
    width: 80px !important;
  }
</style>
