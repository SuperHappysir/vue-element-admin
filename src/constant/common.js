// bool值选项
export const BOOL_STATE = {
  YES: 1,
  NO: 0,
  isTrue: (state) => {
    return parseInt(state) === this.YES
  },
  isFalse: (state) => {
    return !this.isTrue(state)
  }
}

// 删除状态选项
export const DELETE_STATE = {
  IS_DELETED: BOOL_STATE.YES,
  NORMAL: BOOL_STATE.NO,
  isDeleted: (state) => {
    return parseInt(state) === this.IS_DELETED
  },
  isNORMAL: (state) => {
    return !this.isDeleted(state)
  }
}

export const CommonMixin = {
  methods: {
    isNORMAL: DELETE_STATE.isNORMAL,
    isDeleted: DELETE_STATE.isDeleted,
    isTrue: BOOL_STATE.isTrue,
    isFalse: BOOL_STATE.isFalse
  }
}

