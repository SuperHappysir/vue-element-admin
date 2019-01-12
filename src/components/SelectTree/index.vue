<template>
  <treeselect
    :value="value"
    :multiple="multiple"
    :default-expand-level="options.defaultExpandLevel"
    :options="dic"
    :allow-selecting-disabled-descendants="options.allowSelectingDisabledDescendants"
    :value-format="options.valueFormat"
    :value-consists-of="options.valueConsistsOf"
    :placeholder="placeholder"
    :max-height="options.maxHeight"
    :name="name"
    :no-options-text="options.noOptionsText"
    :no-results-text="options.noResultsText"
    :searchable="options.searchable"
    :disabled="disabled"
    :open-on-click="options.openOnClick"
    :open-on-focus="options.openOnFocus"
    :clear-on-select="options.clearOnSelect"
    :close-on-select="options.closeOnSelect"
    :always-open="options.alwaysOpen"
    :append-to-body="options.appendToBody"
    :disable-branch-nodes="options.disableBranchNodes"
    :show-count="options.showCount"
    :normalizer="options.normalizer"
    :required="options.required"
    :open-direction="options.openDirection"
    :z-index="options.zIndex"
    @select="handleSelect"
  />
</template>

<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'SelectTree',
  components: {
    Treeselect
  },
  props: {
    value: {
      type: Number,
      default: null
    },
    dic: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    options: {
      defaultExpandLevel: {
        type: Number,
        default: 0
      },
      loading: {
        type: String,
        default: '加载中...'
      },
      searchable: {
        type: Boolean,
        default: true
      },
      openOnClick: {
        type: Boolean,
        default: true
      },
      openOnFocus: {
        type: Boolean,
        default: false
      },
      clearOnSelect: {
        type: Boolean,
        default: true
      },
      closeOnSelect: {
        type: Boolean,
        default: false
      },
      alwaysOpen: {
        type: Boolean,
        default: false
      },
      appendToBody: {
        type: Boolean,
        default: false
      },
      disableBranchNodes: {
        type: Boolean,
        default: false
      },
      showCount: {
        type: Boolean,
        default: false
      },
      normalizer: {
        type: Function
      },
      loadOptions: {
        type: Function
      },
      allowSelectingDisabledDescendants: {
        type: Boolean,
        default: false
      },
      valueFormat: {
        type: String,
        default: 'id'
      },
      valueConsistsOf: {
        type: String,
        default: 'LEAF_PRIORITY'
      },
      maxHeight: {
        type: Number,
        default: 300
      },
      noOptionsText: {
        type: String,
        default: '没有选项'
      },
      noResultsText: {
        type: String,
        default: '未找到结果...'
      },
      required: {
        type: Boolean,
        default: false
      },
      openDirection: {
        type: String,
        default: 'auto'
      },
      zIndex: {
        type: [Number, String],
        default: 999
      },
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      text: undefined
    }
  },
  methods: {
    handleClick() {
      if (typeof this.click === 'function') { this.click({ value: this.text, column: this.column }) }
    },
    handleSelect(object) {
      this.$emit('select', object)
    }
  }
}
</script>
