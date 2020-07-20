<template>
  <header>
    <div class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <div class="container d-flex justify-content-between">
        <nuxt-link to="/" class="navbar-brand d-flex align-items-center">
          <span class="fa fa-grav mr-2"></span>
          <strong>FUTURE IMPERFECT</strong>
        </nuxt-link>
        <button class="navbar-toggler" type="button" id="head_menu"
                data-toggle="collapse"
                data-target="#navbarsExampleDefault"
                aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon">
            <span v-if="unReadMsgCount > 0" class="fa fa-circle ml-4 mt-2" style="color: red;font-size: 9px;"></span>
          </span>
        </button>
        <div class="navbar-collapse collapse" id="navbarsExampleDefault">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <nuxt-link class="nav-link font-weight-bold" to="/">
                <span class="fa fa-home"></span>
                首页 <span class="sr-only">(current)</span>
              </nuxt-link>
            </li>
            <li class="nav-item active">
              <nuxt-link class="nav-link font-weight-bold" to="/">
                <span class="fa fa-life-bouy"></span>
                热门 <span class="sr-only">(current)</span>
              </nuxt-link>
            </li>
            <li class="nav-item active">
              <nuxt-link class="nav-link font-weight-bold" to="/">
                <span class="fa fa-code"></span>
                热搜 <span class="sr-only">(current)</span>
              </nuxt-link>
            </li>
            <li class="nav-item active">
              <nuxt-link class="nav-link font-weight-bold" to="/">
                <span class="fa fa-pencil"></span>
                日记 <span class="sr-only">(current)</span>
              </nuxt-link>
            </li>
            <li class="nav-item active">
              <nuxt-link class="nav-link font-weight-bold" to="/">
                <span class="fa fa-tags"></span>
                标签 <span class="sr-only">(current)</span>
              </nuxt-link>
            </li>
          </ul>
          <div class="btn-group-sm" v-show="!loggedUser">
            <nuxt-link :to="loginPage" class="btn btn-primary">登录</nuxt-link>
            <a href="#" class="btn btn-primary">注册</a>
          </div>
          <div class="header-msg btn-group-sm mr-5" v-show="loggedUser">
            <nuxt-link class="font-weight-bold" :to="{path: '/search'}">
              <span class="fa fa-search" title="搜索" style="font-size: 20px;color: #FFFFFF">
              </span>
            </nuxt-link>
          </div>
          <div class="header-post btn-group-sm mr-5" v-show="loggedUser">
            <nuxt-link class="font-weight-bold" :to="{path: '/user/post'}">
              <span class="fa fa-pencil-square-o" title="发表新文章" style="font-size: 20px;color: #FFFFFF"></span>
            </nuxt-link>
          </div>
          <div class="header-msg btn-group-sm mr-5" v-show="loggedUser">
            <nuxt-link class="font-weight-bold" :to="{path: '/user/message'}">
              <span class="fa fa-bell-o" title="消息中心" style="font-size: 20px;color: #FFFFFF">
                <!--<span v-if="unReadMsgCount > 0" class="badge badge-primary ml-1">{{unReadMsgCount}}</span>-->
                <span v-if="unReadMsgCount > 0" class="fa fa-circle ml-1" style="color: red;font-size: 9px;"></span>
              </span>
            </nuxt-link>
          </div>
          <div class="header-user dropdown btn-group-sm" id="header_u" v-show="loggedUser">
            <nuxt-link
                class="dropdown-toggle font-weight-bold"
                :to="{path: `/user/${loggedUser ? loggedUser.userId : ''}`}"
            >
              <!--&nbsp;&nbsp;<span class="fa fa-user-circle-o"></span>-->
              <img
                  :src="loggedUser ? loggedUser.headImg : ''"
                  alt="头像"
                  class="rounded-circle"
                  style="width: 40px; height: 40px;"
              >
              <!--{{loggedUser ? loggedUser.username : ''}}-->
            </nuxt-link>
            <div class="dropdown-menu bg-secondary" id="dropdown-menu">
              <nuxt-link class="dropdown-item"
                         :to="{path: `/user/${loggedUser ? loggedUser.userId : ''}`}">
                <span>
                <i class="fa fa-user-circle"></i>
                个人中心
                </span>
              </nuxt-link>
              <nuxt-link class="dropdown-item"
                         :to="{path: `/user/${loggedUser ? loggedUser.userId : ''}`}">
                <span class="fa fa-star"></span>
                我的收藏
              </nuxt-link>
              <nuxt-link class="dropdown-item"
                         :to="{path: `/user/${loggedUser ? loggedUser.userId : ''}`}">
                <span class="fa fa-user-plus"></span>
                我的关注
              </nuxt-link>
              <div class="dropdown-divider"></div>
              <span class="dropdown-item" href="#" @click="signOff">
                <span class="fa fa-sign-out"></span>
                注销
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import {mapGetters} from 'vuex';
import apiBaseURL from '~/api.config';
import Cookie from 'js-cookie';
import Stomp from 'stompjs';

export default {
	data() {
		return {
			stompClient: '',
			timer: '',
		};
	},
	computed: {
		...mapGetters(['loggedUser', 'userUnReadMsgCount']),
		loginPage() {
			return `/auth/sign-in?redirect=${this.$route.path}`;
		},
		unReadMsgCount() {
			return this.$store.state.message.newMsgs.list.length;
		},
		userInfo() {
			// 该用户基本信息
			return this.$store.state.user.articles.userInfo;
		}
	},
	watch: {
		// 一登录就连接webSocket
		loggedUser() {
			if (!!this.loggedUser && !Object.is(this.loggedUser.userId, null)) {
				this.initWebSocket(this.loggedUser.userId);
				this.$store.dispatch('userNotOnlineMsgs', {userId: this.loggedUser.userId});
			}
		}
	},
	mounted() {
		// 一刷新就连接webSocket
		const loggedUser = this.loggedUser;
		if (!!loggedUser && !Object.is(loggedUser.userId, null)) {
			this.initWebSocket(loggedUser.userId);
		}
		// 头像
		let headerImg = document.getElementById('header_u');
		// 头像下拉菜单(pc和mobile)
		let menu = document.getElementById('dropdown-menu');
		// 顶部下拉菜单按钮(mobile)
		let headMenu = document.getElementById('head_menu');
		// 移动端顶部下拉菜单(mobile)
		let header = document.getElementById('navbarsExampleDefault');
		// ---pc端header使用鼠标移动事件---
		headerImg.onmouseenter = function () {
			menu.classList.add('show');
		};
		headerImg.onmouseleave = function () {
			menu.classList.remove('show');
		};
		menu.onmouseenter = function () {
			menu.classList.add('show');
		};
		menu.onmouseleave = function () {
			menu.classList.remove('show');
		};
		// ---移动端时候点击事件---
		headerImg.onclick = function () {
			menu.classList.toggle('show');
		};
		// 增加全局事件监听
		document.onclick = function () {
			let e = window.event;
			let aim = e.target;
			// 如果点击的不是header、menu、headerImg其中的任何一个则隐藏这些部件。
			if (aim !== header && aim !== menu && aim !== headerImg) {
				header.classList.remove('show');
				menu.classList.remove('show');
			}
		};
	},
	methods: {
		signOff() {
			// 注销登录方法
			const router = this.$router;
			return this.$store.dispatch('userLoginOut').then(res => {
				layer.msg('注销成功', {time: 1000, icon: 1});
				// 断开webSocket
				Cookie.remove('auth');
				this.disconnect();
				router.push({path: '/'});
			}).catch(err => {
				layer.msg('请稍后重试', {time: 1500, icon: 7});
			});
		},
		initWebSocket() {
			this.connection();
		},
		connection() {
			// 建立连接对象
			let wsuri = '';
			if (apiBaseURL.indexOf('https://') > -1) {
				wsuri = `wss://${apiBaseURL.replace('https://', '')}webSocket/wss`;
			} else if (apiBaseURL.indexOf('http://') > -1) {
				wsuri = `ws://127.0.0.1:15674/ws`;
			}
			this.socket = new WebSocket(wsuri);
			// 获取STOMP子协议的客户端对象
			this.stompClient = Stomp.over(this.socket);
			let headers = {
				'login': 'guest',
				'passcode': 'guest',
			};
			// 向服务器发起websocket连接
			this.stompClient.connect(headers, () => {
				// 订阅服务端提供的某个topic
				this.stompClient.subscribe('postArticle', msg => {
					// msg.body存放的是服务端发送给我们的信息
					console.log('接收成功=' + msg.body);
					if (!!msg.body) {
						this.$store.commit('message/USER_NEW_MSGS', msg.body);
					}
				}, headers);
			}, err => {
				// 连接发生错误时的处理函数
				console.log('失败:' + err);
			});
		},
		disconnect() {
			// 断开连接
			if (this.stompClient) {
				this.stompClient.disconnect();
			}
		},
	}
};
</script>

<style scoped>

</style>
