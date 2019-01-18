<template>
  <div>
    <el-card class="box-card">
      <div slot="header">
        <div class="title-box">
          <el-tooltip content="同步权限数据到后端" placement="top">
            <el-button type="primary" size="mini" round>同步数据</el-button>
          </el-tooltip>
          <!-- 仅执行权限分配的时候才展示此按钮 -->
          <el-tooltip v-if="roleId !== -1" content="分配权限" placement="top">
            <el-button type="success" size="mini" round>分配权限</el-button>
          </el-tooltip>
        </div>
      </div>
      <el-container class="l-select-container">
        <el-aside width="100px" class="l-left-select-label">发布</el-aside>
        <el-main style="padding-top: 15px;">
          <div>
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <el-checkbox-group v-model="checkedCities" @change="handleCheckedCitiesChange">
              <el-row>
                <el-col v-for="city in cities" :xs="8" :sm="6" :md="4" :lg="2" :key="city" class="l-checkbox-col">
                  <el-checkbox :label="city" :key="city">{{ city }}</el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
        </el-main>
      </el-container>
    </el-card>
  </div>
</template>
<script>
const cityOptions = ['上海', '北京', '广州', '深圳']
export default {
  name: 'PermissionGroup',
  props: {
    roleId: {
      type: Number,
      default: -1
    }
  },
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
    margin-top: 15px;
    /*border-top: 1px #EFF0DC solid;*/
    padding-top: 20px;
    .l-left-select-label {
      padding: 15px;
      text-align: center;
    }
    .l-checkbox-col {
      padding: 10px 0 0;
    }
  }
</style>
