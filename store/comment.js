export const state = () => {
  return {
    comments: {
      list: [],
      currentPage: 0,
      pages: 0
    }
  }
};

export const mutations = {
  ARTICLE_COMMENT_LIST(state, data) {
    state.comments.list = data.content;
    state.comments.currentPage = data.number + 1;
    state.comments.pages = data.totalPages;
  },
  NEW_ARTICLE_COMMENT(state, data) {
    // 插入数组首位
    state.comments.list.push(data);
  },
  CLEAR_COMMENT_LIST(state) {
    state.comments.list = [];
    state.comments.currentPage = 0;
    state.comments.pages = 0;
  }
};
