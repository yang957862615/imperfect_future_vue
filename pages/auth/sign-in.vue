<template>
  <div class="container mt-5">
    <h1 class="text-center">登录</h1>
    <div class="form-group">
      <span>用户名</span>
      <input type="text" autocomplete="username" ref="username" class="form-control" placeholder="请输入用户名">
      <small class="form-text text-danger">{{msg1}}</small>
    </div>
    <div class="form-group">
      <span>密码</span>
      <input type="password" autocomplete="current-password" ref="password" class="form-control" placeholder="请输入密码">
      <small class="form-text text-danger">{{msg2}}</small>
    </div>
    <button class="btn btn-primary btn-block" @click="loginUp">登录</button>
  </div>
</template>

<script>
  import md5 from 'js-md5';
  import {getToken} from "~/utils/auth.js";

  export default {
    name: "login-in",
    head: {
      title: '登录'
    },
    data() {
      return {
        msg1: '',
        msg2: ''
      }
    },
    methods: {
      loginUp() {
        const username = this.$refs.username;
        const password = this.$refs.password;
        this.msg1 = '';
        this.msg2 = '';
        if (!username.value) {
          this.msg1 = '用户名不能为空';
          username.focus();
          return false;
        }
        if (!password.value) {
          this.msg2 = '密码不能为空';
          password.focus();
          return false;
        }
        const router = this.$router;
        // 回到跳转前页面
        const redirect = this.$route.query.redirect ? decodeURIComponent(this.$route.query.redirect) : null;
        return this.$store.dispatch("userLoginUp", {username: username.value, password: md5(password.value)})
          .then(res => {
            layer.msg("登录成功", {time: 1500, icon: 1});
            this.$store.dispatch("redisUserInfo").then(res1 => {
              if (redirect) {
                console.log('redirect:', redirect);
                router.push({path: `${redirect}`});
              } else {
                console.log('redirect1:', redirect);
                router.push({path: "/"});
              }
            }).catch(err => {
              layer.msg(err, {time: 1500, icon: 7});
            });
          }).catch(err => {
            layer.msg(err, {time: 1500, icon: 7});
          })
      }
    }
  }
</script>
