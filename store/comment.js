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
    state.comments.list = data.records;
    state.comments.currentPage = data.current;
    state.comments.pages = data.pages;
  },
  CLEAR_COMMENT_LIST(state) {
    state.comments.list = [];
    state.comments.currentPage = 0;
    state.comments.pages = 0;
  }
};
