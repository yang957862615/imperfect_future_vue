// import Vue from 'vue';
import {getToken, setToken, unsetToken} from '../utils/auth.js';
import imperfectApi from '../api/index';
import cookieParser from 'cookieparser';
import Cookie from 'js-cookie';

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
	},
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
					store.dispatch('jwtUserInfo', accessToken)
				]).catch(err => {
					console.log('加载用户信息错误err:', err);
					// 如果token已过期则删除token以免一直去查redis然后一直报错
					Cookie.remove('token');
					commit('user/CLEAR_USER_TOKEN');
				});
			}
		}
	},
	// 加载用户没有在线时的消息
	userNotOnlineMsgs({commit}, {userId}) {
		let url = imperfectApi.messageApi.userNotOnlineMsgs(userId);
		return this.$axios.get(url).then(res => {
			if (!!res.data.ob) {
				commit('message/USER_NEW_MSGS', 'newMsg');
			}
		});
	},
	// 加载用户发出的评论和收到的评论
	userComments({commit}, {type, userId, pageNo, $state}) {
		// 判断是否是加载全部
		let msgUrl = null;
		// 是否为系统消息
		let isSent = Object.is(type, 'sent');
		let loadAll = pageNo === 1;
		if (isSent) {
			msgUrl = loadAll ? imperfectApi.commentApi.userSentComments(userId) :
				imperfectApi.commentApi.userSentComments(userId, pageNo);
		} else {
			msgUrl = loadAll ? imperfectApi.commentApi.userReceivedComments(userId) :
				imperfectApi.commentApi.userReceivedComments(userId, pageNo);
		}
		return this.$axios.get(msgUrl).then(res => {
			if (loadAll) {
				isSent ? commit('message/USER_SENT_COMMENTS', res.data.ob) :
					commit('message/USER_RECEIVED_COMMENTS', res.data.ob);
			} else { // 分页查询
				if (res.data.ob.records.length) {
					// 合并数据
					// console.log('res.data.ob:', res.data.ob);
					if (isSent) {
						commit('message/SCROLL_TO_MORE_USER_SENT_COMMENTS', res.data.ob);
					} else {
						commit('message/SCROLL_TO_MORE_USER_RECEIVED_COMMENTS', res.data.ob);
					}
					// 准备好下一次加载
					$state.loaded();
				} else { // 如果没有数据
					$state.complete();
				}
			}
		});
	},
	// 加载用户通知
	userMsgs({commit}, {type, userId, pageNo, $state}) {
		// 判断是否是加载全部
		let msgUrl = null;
		// 是否为系统消息
		let isSys = Object.is(type, 'sys');
		let loadAll = pageNo === 1;
		if (isSys) {
			msgUrl = loadAll ? imperfectApi.messageApi.sysMessages(userId) :
				imperfectApi.messageApi.sysMessages(userId, pageNo);
		} else {
			msgUrl = loadAll ? imperfectApi.messageApi.subMessages(userId) :
				imperfectApi.messageApi.subMessages(userId, pageNo);
		}
		return this.$axios.get(msgUrl).then(res => {
			if (loadAll) {
				isSys ?
					commit('message/USER_SYS_MSGS', res.data.ob) :
					commit('message/USER_SUB_MSGS', res.data.ob);
			} else { // 分页查询
				if (res.data.ob.records.length) {
					// 合并数据
					// console.log('res.data.ob:', res.data.ob);
					if (isSys) {
						commit('message/USER_SYS_SCROLL_TO_MORE_MSGS', res.data.ob);
					} else {
						commit('message/USER_SUB_SCROLL_TO_MORE_MSGS', res.data.ob);
					}
					// 准备好下一次加载
					$state.loaded();
				} else { // 如果没有数据
					$state.complete();
				}
			}
		});
	},
	// 用户是否点赞某篇文章
	userDidFavor({commit}, {articleId, userId}) {
		if (!articleId || !userId) {
			return;
		}
		let url = imperfectApi.articleApi.didFavor(articleId, userId);
		return this.$axios.get(url).then(res => {
			if (Object.is(Number(res.data.ob), 1)) {
				commit('user/USER_DID_FAVOR', true);
			} else {
				commit('user/USER_DID_FAVOR', false);
			}
		}).catch(err => {
			console.log('查询是否点赞err:', err);
			commit('user/USER_DID_FAVOR', false);
			return Promise.reject(err);
		});
	},
	// 文章点击数、评论数、点赞数等
	articleBasicInfo({commit}, articleId) {
		if (!articleId) {
			return;
		}
		// 如果获取失败则全部设置为0
		const data = {
			readCount: 0,
			commentCount: 0,
			favorCount: 0
		};
		let url = imperfectApi.articleApi.articleBasicInfo(articleId);
		return this.$axios.get(url).then(res => {
			commit('article/ARTICLE_INFO', res.data.ob);
		}).catch(err => {
			console.log('获取文章信息err:', err);
			commit('article/ARTICLE_INFO', data);
			return Promise.reject(err);
		});
	},
	// 检查是否关注
	checkFollowed({commit}, {userId, followedId}) {
		if (!userId || !followedId) {
			return;
		}
		let url = imperfectApi.friendApi.ifFriend(userId, followedId);
		return this.$axios.get(url).then(res => {
			// 0 未关注 1已关注
			if (Object.is(Number(res.data.ob), 1)) {
				commit('user/CLEAR_USER_FOLLOWED');
				commit('user/USER_FOLLOWED', true);
			} else {
				commit('user/USER_FOLLOWED', false);
			}
		});
	},
	// 加载文章评论
	loadArticleComments({commit}, {articleId, page}) {
		if (!articleId || !page) {
			return;
		}
		let url = imperfectApi.commentApi.articleComments(articleId, page);
		return this.$axios.get(url).then(res => {
			commit('comment/ARTICLE_COMMENT_LIST', res.data.ob);
		});
	},
	// 往store中插入新评论，目的：不刷新页面展示新评论
	newComment({commit}, comment) {
		commit('comment/NEW_ARTICLE_COMMENT', comment);
	},
	// 用户登录
	userLoginUp({commit}, {username, password}) {
		if (!username || !password) {
			return;
		}
		let url = imperfectApi.userApi.loginUp();
		let uRLSearchParams = new URLSearchParams();
		uRLSearchParams.append('username', username);
		uRLSearchParams.append('password', password);
		return this.$axios.post(url, uRLSearchParams).then(res => {
			// console.log('res.data.ob:', res.data.ob);
			commit('user/USER_TOKEN', res.data.ob);
			setToken(res.data.ob);
		});
	},
	// 用户注销
	userLoginOut({commit}) {
		// 注销把本地jwt删掉就行
		commit('user/CLEAR_USER_TOKEN');
		commit('user/CLEAR_USER_INFO');
		unsetToken();
	},
	// 获取jwt里的用户信息
	jwtUserInfo({commit}, params = {}) {
		//console.log('redisUserInfo执行+1');
		const token = getToken() ? getToken() : params;
		console.log('token=', token);
		let url = imperfectApi.userApi.jwtUserInfo(token);
		return this.$axios.post(url, token).then(res => {
			// 已经登录
			commit('user/USER_INFO', res.data.ob);
		}).catch(err => {
			console.log('获取jwt里的用户信息err:', err);
			Cookie.remove('token');
			commit('user/CLEAR_USER_TOKEN');
			return Promise.reject(err);
		});
	},
	// 查询已关注用户
	userFollowedUsers({commit}, {pageNo, userId, $state}) {
		// 是否为分页查询
		const paramsState = !pageNo;
		let url = paramsState ? imperfectApi.userApi.friends(userId) :
			imperfectApi.userApi.friends(userId, pageNo);
		return this.$axios.get(url).then(res => {
				if (paramsState) { // 加载全部
					commit('user/USER_FOLLOWED_USERS_LIST', res.data.ob);
				} else { // 分页查询
					if (res.data.ob.records.length) {
						// 合并数据
						commit('user/USER_SCROLL_TO_MORE_FOLLOWED_USERS', res.data.ob);
						// 准备好下一次加载
						$state.loaded();
					} else { // 如果没有数据
						$state.complete();
					}
				}
			}
		);
	},
	// 用户收藏文章
	userFavorArticles({commit}, {pageNo, userId, $state}) {
		// 是否为分页查询
		const paramsState = !pageNo;
		let url = paramsState ? imperfectApi.articleApi.favorArticles(userId) :
			imperfectApi.articleApi.favorArticles(userId, pageNo);
		return this.$axios.get(url).then(res => {
			if (paramsState) { // 加载全部
				commit('user/USER_FAVOR_ARTICLE_LIST', res.data.ob);
			} else { // 分页查询
				if (res.data.ob.records.length) {
					// 合并数据
					commit('user/USER_FAVOR_SCROLL_TO_MORE_ARTICLES', res.data.ob);
					// 准备好下一次加载
					$state.loaded();
				} else { // 如果没有数据
					$state.complete();
				}
			}
		});
	},
	// 用户首页加载用户基本信息和用户所有文章
	userIndexArticles({commit}, {pageNo, userId, $state}) {
		// 是否为分页查询
		const paramsState = !pageNo;
		let url =
			paramsState ? imperfectApi.articleApi.postedArticles(userId) :
				imperfectApi.articleApi.postedArticles(userId, pageNo);
		return this.$axios.get(url).then(res => {
			if (paramsState) { // 加载全部
				commit('user/USER_ARTICLE_LIST', res.data.ob);
			} else { // 分页查询
				if (res.data.ob.records.length) {
					// 合并数据
					commit('user/USER_SCROLL_TO_MORE_ARTICLES', res.data.ob);
					// 准备好下一次加载
					$state.loaded();
				} else { // 如果没有数据
					$state.complete();
				}
			}
		});
	},
	// 用户首页基本信息
	userIndexInfo({commit}, {userId}) {
		let url = imperfectApi.userApi.basicUserInfo(userId);
		return this.$axios.get(url).then(res => {
			commit('user/USER_INDEX_INFO', res.data.ob);
		});
	},
	// 加载文章列表
	loadArticleList({commit}, params) {
		const paramsState = !params;
		// 首页加载文章列表
		let url = paramsState ? imperfectApi.articleApi.homeArticleList() :
			imperfectApi.articleApi.homeArticleList(params.pageNo);
		return this.$axios.get(url).then(res => {
			if (paramsState) {
				// 加载全部
				commit('article/ARTICLE_LIST', res.data.ob);
			} else {
				// 分页查询
				if (res.data.ob.records.length) {
					// 合并数据
					commit('article/SCROLL_TO_MORE_ARTICLES', res.data.ob);
					// 准备好下一次加载
					params.$state.loaded();
				} else { // 如果没有数据
					params.$state.complete();
				}
			}
		});
	},
	// 加载文章详情
	loadArticleDetails({commit}, articleId) {
		// 一定要return
		let url = imperfectApi.articleApi.articleInfo(articleId);
		return this.$axios.get(url).then((res) => {
			commit('article/ARTICLE_DETAILS', res.data.ob);
		});
	},
	// 加载文章分类
	loadCategories({commit}) {
		let url = imperfectApi.articleApi.articleCategories();
		return this.$axios.get(url).then((res) => {
			commit('category/LOAD_CATEGORIES', res.data.ob);
		});
	},
	// 上传文章封面
	uploadArticleCover({commit}, file) {
		const _this = this;
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
			console.log('********未压缩前的图片大小********' + result.length);
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
				return _this.$axios.post(url, param, config).then(res => {
					commit('article/ARTICLE_COVER_URL', res.data.ob);
				});
			};
		};

		// 照片压缩
		function compress(img) {
			let canvas = document.createElement('canvas');
			let ctx = canvas.getContext('2d');
			let initSize = img.src.length;
			let width = img.width;
			let height = img.height;
			canvas.width = width;
			canvas.height = height;
			// 铺底色
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, width, height);
			//进行最小压缩
			let ndata = canvas.toDataURL('image/jpeg', 0.5);
			console.log('*******压缩后的图片大小*******' + ndata.length);
			// console.log(ndata)
			return ndata;
		}

		// base64转成blob对象
		function dataURItoBlob(base64Data) {
			let byteString;
			if (base64Data.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(base64Data.split(',')[1]);
			else byteString = unescape(base64Data.split(',')[1]);
			let mimeString = base64Data
				.split(',')[0]
				.split(':')[1]
				.split(';')[0];
			let ia = new Uint8Array(byteString.length);
			for (let i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}
			return new Blob([ia], {type: mimeString});
		}
	}
};
