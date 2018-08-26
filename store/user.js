export const state = () => {
  return {
    token: '',
    userInfo: null,
    articles: {
      list: [],
      currentPage: 0,
      userInfo: null
    },
    favorArticles: {
      list: [],
      currentPage: 0
    },
    followedUsers: {
      list: [],
      currentPage: 0
    },
    followed: false,
    // 点赞文章
    didFavor: false
  }
};

export const mutations = {
  USER_ARTICLE_LIST(state, data) { // 加载文章列表
    state.articles.list = [...data.records];
    state.articles.currentPage = data.current;
  },
  USER_SCROLL_TO_MORE_ARTICLES(state, data) { // 滚动获取更多文章
    state.articles.list = state.articles.list.concat(data.records);
    state.articles.currentPage = data.current;
  },
  USER_FAVOR_ARTICLE_LIST(state, data) { // 加载收藏文章列表
    state.favorArticles.list = [...data.records];
    state.favorArticles.currentPage = data.current;
  },
  USER_FAVOR_SCROLL_TO_MORE_ARTICLES(state, data) { // 滚动获取更多收藏文章
    state.favorArticles.list = state.favorArticles.list.concat(data.records);
    state.favorArticles.currentPage = data.current;
  },
  USER_FOLLOWED_USERS_LIST(state, data) { // 加载已关注人列表
    state.followedUsers.list = [...data.records];
    state.followedUsers.currentPage = data.current;
  },
  USER_SCROLL_TO_MORE_FOLLOWED_USERS(state, data) { // 滚动获取更多已关注人
    state.followedUsers.list = state.followedUsers.list.concat(data.records);
    state.followedUsers.currentPage = data.current;
  },
  USER_INDEX_INFO(state, data) { // 用户首页加载用户基本信息(头像 用户名 个性签名等)
    state.articles.userInfo = data;
  },
  USER_TOKEN(state, token) {
    state.token = token || null;
  },
  USER_INFO(state, data) {
    state.userInfo = data || null;
  },
  CLEAR_USER_INFO(state) {
    state.userInfo = null;
  },
  CLEAR_USER_TOKEN(state) {
    state.token = '';
  },
  USER_FOLLOWED(state, data) {
    state.followed = data;
  },
  CLEAR_USER_FOLLOWED(state) {
    state.followed = false;
  },
  USER_DID_FAVOR(state, data) {
    state.didFavor = data;
  }
};
