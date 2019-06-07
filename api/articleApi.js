const articleApi = {
  /**
   * 用户是否点赞
   */
  didFavor(articleId, userId) {
    return `/article/${articleId}/${userId}/didFavor`;
  },
  /**
   * 文章评论数等信息
   */
  articleBasicInfo(articleId) {
    return `/article/${articleId}/articleInfo`;
  },
  /**
   * 首页所有文章列表
   */
  homeArticleList(pageNo) {
    if (!!pageNo) {
      return `/article/all?pageNo=${pageNo}`;
    }
    return "/article/all";
  },
  /**
   * 文章内容
   */
  articleInfo(articleId) {
    return `/article/${articleId}/article`;
  },
  /**
   * 用户发布的文章
   */
  postedArticles(userId, pageNo) {
    if (!!pageNo) {
      return `/article/posted?userId=${userId}&pageNo=${pageNo}`;
    }
    return `/article/posted?userId=${userId}`;
  },
  /**
   * 用户喜欢的文章
   */
  favorArticles(userId, pageNo) {
    if (!!pageNo) {
      return `/article/usersFavorArticles?userId=${userId}&pageNo=${pageNo}`;
    }
    return `/article/usersFavorArticles?userId=${userId}`;
  },
  /**
   * 文章分类
   */
  articleCategories() {
    return `/article/articleCategories`;
  },
  /**
   * 上传文章封面
   */
  uploadCover() {
    return `/article/pic/upload`;
  },
  /**
   * 文章点赞
   */
  favor(articleId, userId) {
    return `/article/${articleId}/${userId}/favor`;
  },
  /**
   * 发布文章
   */
  postArticle() {
    return `/article/post`;
  }
};

export default articleApi;
