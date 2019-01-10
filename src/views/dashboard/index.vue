<template>
  <div>
    <vue-particles
      :particle-opacity="0.5"
      :particles-number="80"
      :particle-size="4"
      :lines-width="1"
      :line-linked="true"
      :line-opacity="0.3"
      :lines-distance="150"
      :move-speed="3"
      :hover-effect="true"
      :click-effect="true"
      color="#6B798F"
      shape-type="circle"
      lines-color="#99a9bf"
      hover-mode="grab"
      click-mode="push"
    />

    <el-container>
      <el-main class="c-introduction">{{ introduction }}</el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      introduction: 'welcome to base-admin'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .c-introduction {
        margin-top: 200px;
        text-align: center;
        font-size: 80px;
        line-height: 240px;
        height: 100%;
        color: rgba(126, 126, 135, 0.8);
        z-index: 20;
        font-family: YaHeiConsolas,'Open Sans', Arial, sans-serif;
    }

    #particles-js {
        /*background-image: url("~@resource/base-admin/images/do_or_die.jpg");*/
        background-size: cover;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
