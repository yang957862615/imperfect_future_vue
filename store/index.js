import Vue from 'vue';
import Axios from '~/plugins/Axios';
import {setToken, unsetToken, getToken} from "~/utils/auth.js"
const isProdMode = Object.is(process.env.NODE_ENV, 'production');
const cookieparser = require('cookieparser');

/**
 * 貌似getter写在index里才能取到，暂时先这样。
 */
export const getters = {
  isAuthenticated(state) { // 是否已登录
    return !!state.user.userInfo;
  },
  loggedUser(state) { // 用户信息
    return state.user.userInfo || null;
  },
  userUnReadMsgCount(state) {
    // 未读消息数量
    return state.message.newMsgs.list.length;
  }
};

// global actions
export const actions = {
  // nuxtServerInit方法在应用程序将被加载时运行,只会在服务端运行
  nuxtServerInit({commit}, {req, store}) {
    // 页面刷新会第一个经过此方法
    // 官方示例https://nuxtjs.org/examples/auth-external-jwt/
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie);
      console.log('parsed:', parsed.token);
      let accessToken = parsed.token;
      if (!!accessToken) {
        // 切记一定要返回promise
        return Promise.all([
          // 加载用户信息
          store.dispatch("redisUserInfo", accessToken)
        ]).catch(err => {
          console.log('err:', err);
        })
      }
    }
  },
  // 加载用户没有在线时的消息
  userNotOnlineMsgs({commit}, params) {
    if (!!params) {
      let url = `/userMsg/${params.userId}/userNotOnlineMsgs`;
      return Axios.get(url).then(res => {
        let success = res.data && Object.is(res.data.state, 200);
        if (success && !!res.data.ob) {
          commit("message/USER_NEW_MSGS", "newMsg");
        }
      })
    }
  },
  // 加载用户发出的评论和收到的评论
  userComments({commit}, params) {
    // 判断是否是加载全部
    let msgUrl = null;
    // 是否为系统消息
    let isSent = Object.is(params.type, "sent");
    let loadAll = params.pageNo === 1;
    if (isSent) {
      msgUrl = loadAll ? `/userMsg/${params.userId}/userSentComments` : `/userMsg/${params.userId}/userSentComments?pageNo=${params.pageNo}`;
    } else {
      msgUrl = loadAll ? `/userMsg/${params.userId}/userReceivedComments` : `/userMsg/${params.userId}/userReceivedComments?pageNo=${params.pageNo}`
    }
    return Axios.get(msgUrl).then(res => {
      let success = res.data && Object.is(res.data.state, 200);
      if (success) {
        if (loadAll) {
          isSent ? commit("message/USER_SENT_COMMENTS", res.data.ob) : commit("message/USER_RECEIVED_COMMENTS", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            // console.log('res.data.ob:', res.data.ob);
            if (isSent) {
              commit("message/SCROLL_TO_MORE_USER_SENT_COMMENTS", res.data.ob);
            } else {
              commit("message/SCROLL_TO_MORE_USER_RECEIVED_COMMENTS", res.data.ob);
            }
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      }
    }).catch(err => {
      console.log('加载消息err:', err);
    });
  },
  // 加载用户通知
  userMsgs({commit}, params) {
    // 判断是否是加载全部
    let msgUrl = null;
    // 是否为系统消息
    let isSys = Object.is(params.type, "sys");
    let loadAll = params.pageNo === 1;
    if (isSys) {
      msgUrl = loadAll ? `/userMsg/${params.userId}/sys` : `/userMsg/${params.userId}/sys?pageNo=${params.pageNo}`;
    } else {
      msgUrl = loadAll ? `/userMsg/${params.userId}/sub` : `/userMsg/${params.userId}/sub?pageNo=${params.pageNo}`
    }
    return Axios.get(msgUrl).then(res => {
      let success = res.data && Object.is(res.data.state, 200);
      if (success) {
        if (loadAll) {
          isSys ? commit("message/USER_SYS_MSGS", res.data.ob) : commit("message/USER_SUB_MSGS", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            // console.log('res.data.ob:', res.data.ob);
            if (isSys) {
              commit("message/USER_SYS_SCROLL_TO_MORE_MSGS", res.data.ob);
            } else {
              commit("message/USER_SUB_SCROLL_TO_MORE_MSGS", res.data.ob);
            }
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      }
    }).catch(err => {
      console.log('加载消息err:', err);
    });
  },
  // 用户是否点赞某篇文章
  userDidFavor({commit}, params) {
    if (params) {
      return Axios.get(`/article/${params.articleId}/${params.userId}/didFavor`).then(res => {
        if (res.data && Object.is(res.data.state, 500)) {
          commit("user/USER_DID_FAVOR", true);
        } else {
          commit("user/USER_DID_FAVOR", false);
        }
      }).catch(err => {
        console.log('查询是否点赞err:', err);
        commit("user/USER_DID_FAVOR", false);
      })
    }
  },
  // 文章点击数、评论数、点赞数等
  articleInfo({commit}, articleId) {
    if (articleId) {
      // 如果获取失败则全部设置为0
      const data = {
        readCount: 0,
        commentCount: 0,
        favorCount: 0
      };
      return Axios.get(`/article/${articleId}/articleInfo`).then(res => {
        if (res.data && Object.is(res.data.state, 200)) {
          commit("article/ARTICLE_INFO", res.data.ob);
        } else {
          commit("article/ARTICLE_INFO", data);
        }
      }).catch(err => {
        console.log('获取文章信息err:', err);
        commit("/article/ARTICLE_INFO", data);
      });
    }
  },
  // 检查是否关注
  checkFollowed({commit}, params) {
    if (params && params.userId && params.followedId) {
      return Axios.get(`/follow/${params.userId}/${params.followedId}`).then(res => {
        if (res && Object.is(res.data.state, 200) && Object.is(res.data.ob, "已关注")) {
          commit("user/CLEAR_USER_FOLLOWED");
          commit("user/USER_FOLLOWED", true);
        } else {
          commit("user/USER_FOLLOWED", false);
        }
      }).catch(err => {
        console.log('检查是否关注err:', err);
        Promise.reject("检查是否关注err:" + err);
      });
    }
  },
  // 加载文章评论
  loadArticleComments({commit}, params) {
    return Axios.get(`/comment?articleId=${params.articleId}&pageNo=` + params.page).then(res => {
      if (res.data.state && Object.is(res.data.state, 200)) {
        commit("comment/ARTICLE_COMMENT_LIST", res.data.ob);
      } else {
        Promise.reject("加载评论err");
      }
    }).catch(err => {
      console.log('加载评论err:', err);
      Promise.reject("加载评论err:" + err);
    });
  },
  // 用户登录
  userLoginUp({commit}, params) {
    return Axios({
      method: 'post',
      url: "/user/loginUp",
      data: params
    }).then(res => {
      if (res.data.state && Object.is(res.data.state, 200)) {
        commit("user/USER_TOKEN", res.data.ob);
        setToken(res.data.ob);
      } else {
        return Promise.reject(res.data.info);
      }
    }).catch(err => {
      console.log('用户登录err:', err);
      return Promise.reject("用户登录err:" + err);
    })
  },
  // 用户注销
  userLoginOut({commit}) {
    const token = getToken();
    return Axios({
      method: 'get',
      url: `/user/loginOut/${token}`
    }).then(res => {
      if (Object.is(res.data.state, 200)) {
        commit("user/CLEAR_USER_TOKEN");
        commit("user/CLEAR_USER_INFO");
        unsetToken();
        return Promise.resolve(res.data.ob);
      } else {
        return Promise.reject(res.data.info);
      }
    }).catch(err => {
      console.log('用户注销err:', err);
      return Promise.reject("用户注销err: " + err);
    })
  },
  // 获取redis里的用户信息
  redisUserInfo({commit}, params = null) {
    console.log('redisUserInfo执行+1');
    const token = getToken() ? getToken() : params;
    return Axios({
      method: 'get',
      url: `/user/redis/${token}`
    }).then(res => {
      if (Object.is(res.data.state, 200)) {
        // 已经登录
        commit("user/USER_INFO", res.data.ob);
      } else {
        return Promise.reject(res.data.info);
      }
    }).catch(err => {
      console.log('获取redis里的用户信息err:', err);
      unsetToken();
      return Promise.reject(err);
    })
  },
  // 查询已关注用户
  userFollowedUsers({commit}, params) {
    // 是否为分页查询
    const paramsState = params && !params.pageNo;
    let url =
      paramsState ? `/user/userFollowedUsers?userId=${params.userId}` : `/user/userFollowedUsers?userId=${params.userId}&pageNo=${params.pageNo}`;
    return Axios.get(url).then(res => {
      const success = res.data.state && Object.is(res.data.state, 200);
      if (success) {
        if (paramsState) { // 加载全部
          commit("user/USER_FOLLOWED_USERS_LIST", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            commit("user/USER_SCROLL_TO_MORE_FOLLOWED_USERS", res.data.ob);
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      } else {
        Promise.reject(res.data.info);
      }
    }).catch((error) => {
      console.log('加载已关注人列表error:', error);
      return Promise.reject("加载已关注人列表error: " + error);
    });
  },
  // 用户收藏文章
  userFavorArticles({commit}, params) {
    // 是否为分页查询
    const paramsState = params && !params.pageNo;
    let url =
      paramsState ? `/user/usersFavorArticles?userId=${params.userId}` : `/user/usersFavorArticles?userId=${params.userId}&pageNo=${params.pageNo}`;
    return Axios.get(url).then(res => {
      const success = res.data.state && Object.is(res.data.state, 200);
      if (success) {
        if (paramsState) { // 加载全部
          commit("user/USER_FAVOR_ARTICLE_LIST", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            commit("user/USER_FAVOR_SCROLL_TO_MORE_ARTICLES", res.data.ob);
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      } else {
        Promise.reject(res.data.info);
      }
    }).catch((error) => {
      console.log('加载收藏文章列表error:', error);
      return Promise.reject("加载收藏文章列表error: " + error);
    });
  },
  // 用户首页加载用户基本信息和用户所有文章
  userIndexArticles({commit}, params) {
    // 是否为分页查询
    const paramsState = params && !params.pageNo;
    let url =
      paramsState ? `/user/articles?userId=${params.userId}` : `/user/articles?userId=${params.userId}&pageNo=${params.pageNo}`;
    return Axios.get(url).then(res => {
      const success = res.data.state && Object.is(res.data.state, 200);
      if (success) {
        if (paramsState) { // 加载全部
          commit("user/USER_ARTICLE_LIST", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            commit("user/USER_SCROLL_TO_MORE_ARTICLES", res.data.ob);
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      } else {
        Promise.reject(res.data.info);
      }
    }).catch((error) => {
      console.log('加载文章列表error:', error);
      return Promise.reject("加载文章列表error: " + error);
    });
  },
  // 用户首页基本信息
  userIndexInfo({commit}, params) {
    return Axios.get(`/user/${params.userId}`).then(res => {
      const success = res.data.state && Object.is(res.data.state, 200);
      if (success) {
        commit("user/USER_INDEX_INFO", res.data.ob);
      } else {
        return Promise.reject(res.data.info);
      }
    }).catch(err => {
      console.log('加载用户首页信息错误err:', err);
      return Promise.reject("加载用户首页信息错误err: " + err);
    });
  },
  // 加载文章列表
  loadArticleList({commit}, params) {
    const paramsState = params === undefined;
    // 首页加载文章列表
    let url = paramsState ? "/article/all" : `/article/all?pageNo=${params.pageNo}`;
    return Axios.get(url).then(res => {
      const success = res.data.state && Object.is(res.data.state, 200);
      if (success) {
        if (paramsState) { // 加载全部
          commit("article/ARTICLE_LIST", res.data.ob);
        } else { // 分页查询
          if (res.data.ob.records.length) {
            // 合并数据
            commit("article/SCROLL_TO_MORE_ARTICLES", res.data.ob);
            // 准备好下一次加载
            params.$state.loaded();
          } else { // 如果没有数据
            params.$state.complete();
          }
        }
      } else {
        Promise.reject(res.data.info);
      }
    }).catch(error => {
      console.log('加载文章列表error:', error);
      return Promise.reject("加载文章列表error: " + error);
    });
  },
  // 加载文章详情
  loadArticleDetails({commit}, articleId) {
    // 一定要return
    return Axios.get(`/article/${articleId}`).then((res) => {
      if (res.data.state && Object.is(res.data.state, 200)) {
        commit("article/ARTICLE_DETAILS", res.data.ob);
      } else {
        // 一定要抛出异常才能被下面的catch捕获
        return Promise.reject(res.data.info);
      }
    }).catch((error) => {
      // 要reject出去要不然页面上捕捉不到错误
      console.log('加载文章详情error:', error);
      return Promise.reject("加载文章详情error: " + error);
    });
  },
  // 加载文章分类
  loadCategories({commit}) {
    return Axios.get("/article/articleCategories").then((res) => {
      if (res.data.state && Object.is(res.data.state, 200)) {
        commit("category/LOAD_CATEGORIES", res.data.ob);
      } else {
        Promise.reject(res.data.info);
      }
    }).catch((err) => {
      console.log('加载文章分类error:', err);
      Promise.reject("加载文章分类error: " + err);
    });
  },
  // 上传文章封面
  uploadArticleCover({commit}, file) {
    let config = { //添加请求头
      headers: {'Content-Type': 'multipart/form-data'}
    };
    let param = new FormData(); //创建form对象
    param.append('file', file, file.name);//通过append向form对象添加数据
    return Axios.post("/pic/upload", param, config).then((res) => {
      if (res.data.error === 0) {
        commit("article/ARTICLE_COVER_URL", res.data.url);
      } else {
        Promise.reject(res.data.message);
      }
    }).catch((err) => {
      console.log("上传图片错误: ", err);
      Promise.reject("上传图片错误: " + err);
    });
  }
};
