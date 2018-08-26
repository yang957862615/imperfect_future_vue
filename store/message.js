export const state = () => {
  return {
    subMsgs: {
      list: [],
      currentPage: 0
    },
    sysMsgs: {
      list: [],
      currentPage: 0
    },
    newMsgs: {
      // 服务端推送新消息
      list: []
    },
    sentComments: {
      list: [],
      currentPage: 0
    },
    receivedComments: {
      list: [],
      currentPage: 0
    }
  }
};

export const mutations = {
  USER_SUB_MSGS(state, data) {
    state.subMsgs.list = [...data.records];
    state.subMsgs.currentPage = data.current;
  },
  USER_SYS_MSGS(state, data) {
    state.sysMsgs.list = [...data.records];
    state.sysMsgs.currentPage = data.current;
  },
  USER_SUB_SCROLL_TO_MORE_MSGS(state, data) {
    // 滚动获取更多消息
    state.subMsgs.list = state.subMsgs.list.concat(data.records);
    state.subMsgs.currentPage = data.current;
  },
  USER_SYS_SCROLL_TO_MORE_MSGS(state, data) {
    // 滚动获取更多消息
    state.sysMsgs.list = state.sysMsgs.list.concat(data.records);
    state.sysMsgs.currentPage = data.current;
  },
  USER_NEW_MSGS(state, data) {
    state.newMsgs.list.push(data);
  },
  CLEAR_ALL_NEW_MSGS(state) {
    state.newMsgs.list = [];
  },
  USER_SENT_COMMENTS(state, data) {
    state.sentComments.list = [...data.records];
    state.sentComments.currentPage = data.current;
  },
  USER_RECEIVED_COMMENTS(state, data) {
    state.receivedComments.list = [...data.records];
    state.receivedComments.currentPage = data.current;
  },
  SCROLL_TO_MORE_USER_SENT_COMMENTS(state, data) {
    // 滚动获取更多消息
    state.sentComments.list = state.sentComments.list.concat(data.records);
    state.sentComments.currentPage = data.current;
  },
  SCROLL_TO_MORE_USER_RECEIVED_COMMENTS(state, data) {
    // 滚动获取更多消息
    state.receivedComments.list = state.receivedComments.list.concat(data.records);
    state.receivedComments.currentPage = data.current;
  },

};
