<template>
  <el-container>
    <el-aside>发布</el-aside>
    <el-main>
      <div style="margin: 15px 0;border-top: 1px #97a8be solid; padding-top: 20px;">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" style="margin: 20px 0;" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
          <el-checkbox v-for="city in cities" :label="city" :key="city">{{ city }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </el-main>
  </el-container>
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
