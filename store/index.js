// import Vue from 'vue';
import Axios from '~/plugins/Axios';
import {setToken, unsetToken, getToken} from "../utils/auth.js"
import imperfectApi from '../api/index'
// const cookieparser = require('cookieparser');
import cookieParser from 'cookieparser'


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
      const parsed = cookieParser.parse(req.headers.cookie);
      //console.log('parsed:', parsed.token);
      let accessToken = parsed.token;
      if (!!accessToken) {
        // 切记一定要返回promise
        return Promise.all([
          // 加载用户信息
          store.dispatch("redisUserInfo", accessToken)
        ]).catch(err => {
          console.log('加载用户信息错误err:', err);
          // 如果token已过期则删除token以免一直去查redis然后一直报错
          unsetToken();
        });
      }
    }
  },
  // 加载用户没有在线时的消息
  userNotOnlineMsgs({commit}, params) {
    if (!!params) {
      let url = imperfectApi.messageApi.userNotOnlineMsgs(params.userId);
      return Axios.get(url).then(res => {
        commit("message/USER_NEW_MSGS", "newMsg");
      }).catch(err => {
        console.log('加载用户没有在线时的消息错误err:', err);
        return Promise.reject("加载用户没有在线时的消息错误");
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
      msgUrl = loadAll ? imperfectApi.commentApi.userSentComments(params.userId) : imperfectApi.commentApi.userSentComments(params.userId, params.pageNo);
    } else {
      msgUrl = loadAll ? imperfectApi.commentApi.userReceivedComments(params.userId) : imperfectApi.commentApi.userReceivedComments(params.userId, params.pageNo)
    }
    return Axios.get(msgUrl).then(res => {
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
    }).catch(err => {
      console.log('加载用户消息错误err:', err);
      return Promise.reject("加载用户消息错误");
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
      msgUrl = loadAll ? imperfectApi.messageApi.sysMessages(params.userId) : imperfectApi.messageApi.sysMessages(params.userId, params.pageNo);
    } else {
      msgUrl = loadAll ? imperfectApi.messageApi.subMessages(params.userId) : imperfectApi.messageApi.sub(params.userId, params.pageNo);
    }
    return Axios.get(msgUrl).then(res => {
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
    }).catch(err => {
      console.log('加载消息err:', err);
      return Promise.reject("加载消息错误");
    });
  },
  // 用户是否点赞某篇文章
  userDidFavor({commit}, params) {
    if (params) {
      let url = imperfectApi.articleApi.didFavor(params.articleId, params.userId);
      return Axios.get(url).then(res => {
        if (res.data && Object.is(res.data.state, 1)) {
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
  articleBasicInfo({commit}, articleId) {
    if (articleId) {
      // 如果获取失败则全部设置为0
      const data = {
        readCount: 0,
        commentCount: 0,
        favorCount: 0
      };
      let url = imperfectApi.articleApi.articleBasicInfo(articleId);
      return Axios.get(url).then(res => {
        commit("article/ARTICLE_INFO", res.data.ob);
      }).catch(err => {
        console.log('获取文章信息err:', err);
        commit("article/ARTICLE_INFO", data);
      });
    }
  },
  // 检查是否关注
  checkFollowed({commit}, params) {
    if (params && params.userId && params.followedId) {
      let url = imperfectApi.friendApi.ifFriend(params.userId, params.followedId);
      return Axios.get(url).then(res => {
        // 0 未关注 1已关注
        if (Object.is(res.data.ob, 1)) {
          commit("user/CLEAR_USER_FOLLOWED");
          commit("user/USER_FOLLOWED", true);
        } else {
          commit("user/USER_FOLLOWED", false);
        }
      }).catch(err => {
        console.log('检查是否关注err:', err);
        return Promise.reject("检查是否关注err:" + err);
      });
    }
  },
  // 加载文章评论
  loadArticleComments({commit}, params) {
    let url = imperfectApi.commentApi.articleComments(params.articleId, params.page);
    return Axios.get(url).then(res => {
      commit("comment/ARTICLE_COMMENT_LIST", res.data.ob);
    }).catch(err => {
      console.log('加载评论err:', err);
      return Promise.reject("加载评论err:" + err);
    });
  },
  // 往store中插入新评论，目的：不刷新页面展示新评论
  newComment({commit}, comment) {
    commit("comment/NEW_ARTICLE_COMMENT", comment);
  },
  // 用户登录
  userLoginUp({commit}, params) {
    let url = imperfectApi.userApi.loginUp();
    return Axios.post(url, params).then(res => {
      commit("user/USER_TOKEN", res.data.ob);
      setToken(res.data.ob);
    }).catch(err => {
      console.log('用户登录err:', err);
      return Promise.reject("用户登录err:" + err);
    });
  },
  // 用户注销
  userLoginOut({commit}) {
    const token = getToken();
    // 注销把本地jwt删掉就行
    commit("user/CLEAR_USER_TOKEN");
    commit("user/CLEAR_USER_INFO");
    unsetToken();
     /* let url = imperfectApi.userApi.loginOut(token);
    return Axios.get(url).then(res => {
      
    }).catch(err => {
      console.log('用户注销err:', err);
      return Promise.reject("用户注销err: " + err);
    })*/
  },
  // 获取redis里的用户信息
  redisUserInfo({commit}, params = null) {
    //console.log('redisUserInfo执行+1');
    const token = getToken() ? getToken() : params;
    let url = imperfectApi.userApi.redisUserInfo(token);
    return Axios.get(url).then(res => {
      // 已经登录
      commit("user/USER_INFO", res.data.ob);
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
      paramsState ? imperfectApi.friendApi.friends(params.userId) : imperfectApi.friendApi.friends(params.userId, params.pageNo);
    return Axios.get(url).then(res => {
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
      }
    ).catch((error) => {
      console.log('加载已关注人列表error:', error);
      return Promise.reject("加载已关注人列表error: " + error);
    });
  },
  // 用户收藏文章
  userFavorArticles({commit}, params) {
    // 是否为分页查询
    const paramsState = params && !params.pageNo;
    let url =
      paramsState ? imperfectApi.articleApi.favorArticles(params.userId) :
        imperfectApi.articleApi.favorArticles(params.userId, params.pageNo);
    return Axios.get(url).then(res => {
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
      paramsState ? imperfectApi.articleApi.postedArticles(params.userId) :
        imperfectApi.articleApi.postedArticles(params.userId, params.pageNo);
    return Axios.get(url).then(res => {
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
    }).catch((error) => {
      console.log('加载文章列表error:', error);
      return Promise.reject("加载文章列表error: " + error);
    });
  },
  // 用户首页基本信息
  userIndexInfo({commit}, params) {
    let url = imperfectApi.userApi.basicUserInfo(params.userId);
    return Axios.get(url).then(res => {
      commit("user/USER_INDEX_INFO", res.data.ob);
    }).catch(err => {
      console.log('加载用户首页信息错误err:', err);
      return Promise.reject("加载用户首页信息错误err: " + err);
    });
  },
  // 加载文章列表
  loadArticleList({commit}, params) {
    const paramsState = params === undefined;
    // 首页加载文章列表
    let url = paramsState ? imperfectApi.articleApi.homeArticleList() : imperfectApi.articleApi.homeArticleList(params.pageNo);
    return Axios.get(url).then(res => {
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
    }).catch(error => {
      console.log('加载文章列表error:', error);
      return Promise.reject("加载文章列表error: " + error);
    });
  },
  // 加载文章详情
  loadArticleDetails({commit}, articleId) {
    // 一定要return
    let url = imperfectApi.articleApi.articleInfo(articleId);
    return Axios.get(url).then((res) => {
      commit("article/ARTICLE_DETAILS", res.data.ob);
    }).catch(error => {
      // 要reject出去要不然页面上捕捉不到错误
      console.log('加载文章详情error:', error);
      return Promise.reject("加载文章详情error: " + error);
    });
  },
  // 加载文章分类
  loadCategories({commit}) {
    let url = imperfectApi.articleApi.articleCategories();
    return Axios.get(url).then((res) => {
      commit("category/LOAD_CATEGORIES", res.data.ob);
    }).catch(err => {
      console.log('加载文章分类error:', err);
      return Promise.reject("加载文章分类error: " + err);
    });
  },
  // 上传文章封面
  uploadArticleCover({commit}, file) {
    //判断支不支持FileReader
    if (!file || !window.FileReader) return;
    //创建一个reader
    let reader = new FileReader();
    //将图片转成base64格式
    reader.readAsDataURL(file);
    //读取成功后的回调
    reader.onloadend = function () {
      let result = this.result;
      let img = new Image();
      img.src = result;
      console.log("********未压缩前的图片大小********" + result.length);
      img.onload = function () {
        let data = compress(img);
        let blob = dataURItoBlob(data);
        let config = {
          // 添加请求头
          headers: {'Content-Type': 'multipart/form-data'}
        };
        let param = new FormData();
        // 创建form对象 通过append向form对象添加数据
        param.append('file', blob, file.name);
        let url = imperfectApi.articleApi.uploadCover();
        return Axios.post(url, param, config).then((res) => {
          commit("article/ARTICLE_COVER_URL", res.data.ob);
        }).catch(err => {
          console.log("上传图片错误: ", err);
          return Promise.reject("上传图片错误: " + err);
        });
      }
    };

    // 照片压缩
    function compress(img) {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      let initSize = img.src.length;
      let width = img.width;
      let height = img.height;
      canvas.width = width;
      canvas.height = height;
      // 铺底色
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);
      //进行最小压缩
      let ndata = canvas.toDataURL("image/jpeg", 0.5);
      console.log("*******压缩后的图片大小*******" + ndata.length);
      // console.log(ndata)
      return ndata;
    }

    // base64转成bolb对象
    function dataURItoBlob(base64Data) {
      let byteString;
      if (base64Data.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(base64Data.split(",")[1]);
      else byteString = unescape(base64Data.split(",")[1]);
      let mimeString = base64Data
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      let ia = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], {type: mimeString});
    }
  }
};
