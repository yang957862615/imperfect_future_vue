/**
 * 文章vuex模块
 */
export const state = () => {
  return {
    articles: {
      list: [],
      currentPage: 0
    },
    detail: {
      data: {}
    },
    cover: {
      url: ''
    },
    articleInfo: {
      readCount: '',
      commentCount: '',
      favorCount: ''
    }
  };
};

export const mutations = {
  ARTICLE_LIST(state, data) { // 加载文章列表
    state.articles.list = [...data.records];
    state.articles.currentPage = data.current;
  },
  SCROLL_TO_MORE_ARTICLES(state, data) { // 滚动获取更多文章
    state.articles.list = state.articles.list.concat(data.records);
    state.articles.currentPage = data.current;
  },
  ARTICLE_DETAILS(state, data) { // 点击进入文章详情
    state.detail.data = data;
  },
  ARTICLE_COVER_URL(state, data) {
    state.cover.url = data;
  },
  CLEAR_ALL(state) {
    state.articles.list = [];
    state.articles.currentPage = 0;
  },
  ARTICLE_INFO(state,data) {
    state.articleInfo = data;
  }
};

/*
// 箭头函数
const f = (v) => {
  return v;
};
// 等同于
const f = function (v) {
  return v;
};
*/

/*
// 报错
// let getTempItem = id => { id: id, name: "Temp" };
// 不报错
// 由于大括号被解释为代码块，所以如果箭头函数直接返回一个对象，必须在对象外面加上括号，否则会报错。
let getTempItem = id => ({
  id: id, name: "Temp"
});
*/
