<template>
  <div>
    <select-tree
      :dic="dic"
      :options="option"/>
  </div>
</template>

<script>
import '@/components/SelectTree'
import SelectTree from '@/components/SelectTree/index'

export default {
  components: { SelectTree },
  data: () => ({
    value: [],
    placeholder: '请选择...',
    dic: [
      {
        id: 'fruits',
        label: 'Fruits',
        children: [
          {
            id: 'apple',
            label: 'Apple 🍎',
            isNew: true
          },
          {
            id: 'grapes',
            label: 'Grapes 🍇'
          },
          {
            id: 'pear',
            label: 'Pear 🍐'
          },
          {
            id: 'strawberry',
            label: 'Strawberry 🍓'
          },
          {
            id: 'watermelon',
            label: 'Watermelon 🍉'
          }
        ]
      },
      {
        id: 'vegetables',
        label: 'Vegetables',
        children: [
          {
            id: 'corn',
            label: 'Corn 🌽'
          },
          {
            id: 'carrot',
            label: 'Carrot 🥕'
          },
          {
            id: 'eggplant',
            label: 'Eggplant 🍆'
          },
          {
            id: 'tomato',
            label: 'Tomato 🍅'
          }
        ]
      }
    ],
    option: {
      defaultExpandLevel: 2
    }
  }),
  methods: {
    submit() {
      this.$message.success('当前数据' + JSON.stringify(this.form))
    }
  }
}
</script>
