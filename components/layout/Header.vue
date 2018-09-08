<template>
  <header>
    <div class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <div class="container d-flex justify-content-between">
        <nuxt-link to="/" class="navbar-brand d-flex align-items-center">
          <span class="fa fa-grav mr-2"></span>
          <strong>FUTURE IMPERFECT</strong>
        </nuxt-link>
        <button class="navbar-toggler" type="button" id="head_menu" data-toggle="collapse"
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
          <div class="header-post btn-group-sm mr-5" v-show="loggedUser">
            <nuxt-link class="font-weight-bold"
                       :to="{path: '/user/post'}">
              <span class="fa fa-pencil-square-o" title="发表新文章" style="font-size: 20px;color: #FFFFFF"></span>
            </nuxt-link>
          </div>
          <div class="header-msg btn-group-sm mr-5" v-show="loggedUser">
            <nuxt-link class="font-weight-bold"
                       :to="{path: '/user/message'}">
              <span class="fa fa-bell-o" title="新消息" style="font-size: 20px;color: #FFFFFF">
                <!--<span v-if="unReadMsgCount > 0" class="badge badge-primary ml-1">{{unReadMsgCount}}</span>-->
                <span v-if="unReadMsgCount > 0" class="fa fa-circle ml-1" style="color: red;font-size: 9px;"></span>
              </span>
            </nuxt-link>
          </div>
          <div class="header-user dropdown btn-group-sm" v-show="loggedUser">
            <nuxt-link
              class="dropdown-toggle font-weight-bold"
              id="header_u"
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
            <div class="dropdown-menu bg-secondary" id="hello2">
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
  import {mapGetters} from 'vuex'
  import api from '~/api.config';

  export default {
    data() {
      return {}
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
          this.$store.dispatch("userNotOnlineMsgs", {userId: this.loggedUser.userId});
        }
      }
    },
    mounted() {
      // 一刷新就连接webSocket
      const loggedUser = this.loggedUser;
      if (!!loggedUser && !Object.is(loggedUser.userId, null)) {
        this.initWebSocket(loggedUser.userId);
      }
      document.getElementById("header_u").onmouseenter = function () {
        document.getElementById("hello2").style.cssText = "display: block;";
      };
      document.getElementById("hello2").onmouseleave = function () {
        document.getElementById("hello2").style.cssText = "display: none;";
      };
      document.getElementById("head_menu").onclick = function () {
        document.getElementById("hello2").style.cssText = "display: none;";
      };
      // TODO 优化dropdown
    },
    methods: {
      signOff() {
        // 注销登录方法
        const router = this.$router;
        return this.$store.dispatch("userLoginOut").then(res => {
          layer.msg(res, {time: 1000, icon: 1});
          // 断开webSocket
          this.webSocket.close();
          router.push({path: "/"});
        }).catch(err => {
          layer.msg(err, {time: 1500, icon: 7});
        })
      },
      initWebSocket(userId) {
        if (!userId) {
          return;
        }
        // 初始化msgList
        let wsuri = "";
        const apiUrl = `${api.baseURL}`;
        if (apiUrl.indexOf("https://") > -1) {
          wsuri = `wss://${api.baseURL.replace("https://", "")}/webSocket/${userId}`;
        } else if (apiUrl.indexOf("http://") > -1) {
          wsuri = `ws://${api.baseURL.replace("http://", "")}/webSocket/${userId}`;
        }
        // 这里面的this都指向vue
        this.webSocket = new WebSocket(wsuri);
        this.webSocket.onopen = this.webSocketOpen;
        this.webSocket.onmessage = this.webSocketOnMessage;
        this.webSocket.onclose = this.webSocketClose;
        this.webSocket.onerror = this.webSocketError;
      },
      webSocketOpen() {
        // 打开连接
        console.log("WebSocket连接成功")
      },
      webSocketOnMessage(e) {
        // 接收消息
        //console.log("服务器推送消息：", e.data);
        if (!!e) {
          this.$store.commit("message/USER_NEW_MSGS", e.data);
        }
      },
      webSocketClose() {
        // 关闭连接
        console.log("WebSocket关闭");
      },
      webSocketError() {
        // 连接失败
        console.log("WebSocket连接失败");
      }
    }
  }
</script>

<style scoped>

</style>
