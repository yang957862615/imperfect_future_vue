<template>
  <div role="main">
    <section class="jumbotron text-center">
      <div class="container">
        <img
          v-if="!myself"
          :src="userInfo ? userInfo.headImg : ''"
          alt="头像"
          class="rounded-circle mb-2"
          style="max-width: 100px;min-width: 100px;"
        >
        <img
          v-if="myself"
          :src="userInfo ? userInfo.headImg : ''"
          alt="头像"
          class="rounded-circle mb-2"
          id="avatar"
          @click="changeHeadImg()"
          style="max-width: 100px;min-width: 100px;"
        >
        <h1 class="jumbotron-heading">{{userInfo ? userInfo.username : ''}}</h1>
        <p class="lead text-muted" v-if="!modifier">
          {{userInfo ? userInfo.desc : ''}}
          <a href="javascript:;" @click="showChangeInput()" v-if="myself">
            <span class="fa fa-pencil"></span>
          </a>
        </p>
        <!--点击修改后显示此-->
        <div class="lead" v-if="modifier">
          <input type="text" class="form-control" ref="desc" :value="userInfo ? userInfo.desc : ''" title="个性签名">
          <div class="btn-group">
            <button class="btn btn-primary btn-block mt-2" @click="changeDesc()">提交</button>
            <button class="btn btn-primary btn-block mt-2" @click="modifier = false">取消</button>
          </div>
        </div>
        <p v-if="!myself">
          <a href="javascript:;" @click="follow" v-if="!followed" class="btn btn-primary my-2">
            <span class="fa fa-plus mr-2"></span>
            <span class="mr-1">关注</span>
          </a>
          <a href="javascript:;" @click="unFollow" v-if="followed" class="btn btn-info my-2">
            <span class="fa fa-check mr-2"></span>
            <span class="mr-1">已关注</span>
          </a>
        </p>
      </div>
    </section>
    <!--如果已登录-->
    <div class="container" v-if="!!loggedUser && myself">
      <nav class="pl-3 pb-2">
        <div class="nav nav-tabs" id="nav-tab">
          <a @click="changeType(1)" :class="[viewType === 1 ? 'nav-link active' : 'nav-link']" href="javascript:;">
            我的发布
          </a>
          <a @click="changeType(2)" :class="[viewType === 2 ? 'nav-link active' : 'nav-link']" href="javascript:;">
            我的收藏
          </a>
          <a @click="changeType(3)" :class="[viewType === 3 ? 'nav-link active' : 'nav-link']" href="javascript:;">
            我的关注
          </a>
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        <div v-show="viewType===1" class="tab-pane fade show active">
          <!--用户发布的文章 瀑布流布局-->
          <ArticleList :articleList="articleList" @infiniteHandler="infiniteHandler" :viewChange="this.viewType"></ArticleList>
        </div>
        <div v-show="viewType===2" class="tab-pane fade show active">
          <!--用户收藏的文章 瀑布流布局-->
          <ArticleList :articleList="favorArticleList" @infiniteHandler="infiniteHandler" :viewChange="this.viewType"></ArticleList>
        </div>
        <div v-show="viewType===3" class="pl-3 tab-pane fade show active">
          <!--已关注的用户-->
          <div id="columns">
            <figure
              v-for="(user,index) in userFollowedUsers"
              :key="index"
              class="animated fadeInDown"
            >
              <img
                class="card-img-top p-2"
                :src="user.headImg"
                alt="Card image cap"
              >
              <figcaption>
                <div class="card-body">
                  <p class="card-text">
                    {{user.desc}}
                  </p>
                  <div class="d-flex justify-content-between mt-3">
                    <small class="text-muted">
                      <nuxt-link :to="`/user/${user.userId}`" class="badge">
                        {{user.username}}
                      </nuxt-link>
                    </small>
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
          <infinite-loading ref="infiniteLoading" @infinite="infiniteHandler">
              <span slot="no-more">
                没有更多数据啦 :(
              </span>
              <span slot="no-results">
                没有更多数据啦 :(
              </span>
          </infinite-loading>
        </div>
      </div>
    </div>
    <!--如果未登录-->
    <div v-if="!loggedUser || !myself">
      <!--文章 瀑布流布局-->
      <ArticleList :articleList="articleList" @infiniteHandler="infiniteHandler"></ArticleList>
    </div>
    <!--真正的上传图片框 不需要显示-->
    <input
      type="file"
      id="upload"
      class="invisible"
      accept="image/png,image/gif,image/jpeg"
      @change="uploadFile"
    >
  </div>
</template>

<script>
  import Axios from '~/plugins/Axios';
  import ArticleList from '~/components/views/article/ArticleList';
  // 上拉加载插件
  import InfiniteLoading from 'vue-infinite-loading/src/components/InfiniteLoading.vue';

  export default {
    head: {
      title: 'About Page'
    },
    data() {
      return {
        // 修改个性签名
        modifier: false,
        desc: '',
        viewType: 1
      }
    },
    // middleware: 'authenticated',
    components: {
      ArticleList,
      InfiniteLoading
    },
    validate({params}) { // 检测路由参数
      return params.id && !isNaN(Number(params.id));
    },
    fetch({store, params, error}) {
      let loadParams = {userId: params.id};
      let followedId = params.id;
      const promises = [];
      const userIndexArticles = store.dispatch('userIndexArticles', loadParams);
      const userIndexInfo = store.dispatch('userIndexInfo', loadParams);
      promises.push(userIndexArticles, userIndexInfo);
      if (store.getters.isAuthenticated) {
        let userId = store.getters.loggedUser.userId;
        if (!Object.is(userId, followedId)) {
          // 检查是否关注
          const checkFollowed = store.dispatch("checkFollowed", {userId, followedId});
          promises.push(checkFollowed);
        }
        // 收藏文章列表
        const favorArticles = store.dispatch("userFavorArticles", {userId});
        // 已关注人列表
        const followedUsers = store.dispatch("userFollowedUsers", {userId});
        promises.push(favorArticles,followedUsers);
      }
      return Promise.all(promises).catch(err =>
        error({statusCode: 500, message: err})
      );
    },
    computed: {
      myself() {
        // 判断本人
        return this.loggedUser && Object.is(this.loggedUser.userId, this.$route.params.id);
      },
      articleList() { // 获取文章列表
        // 注意: this.$store.state获取模块数据时需要加上模块名
        return this.$store.state.user.articles.list;
      },
      favorArticleList() { // 收藏文章列表
        return this.$store.state.user.favorArticles.list;
      },
      userFollowedUsers() {
        // 关注列表
        return this.$store.state.user.followedUsers.list;
      },
      userInfo() {
        return this.$store.state.user.articles.userInfo;
      },
      nextPageParam() { // 下一页
        return {
          pageNo: this.$store.state.user.articles.currentPage + 1,
          favorArticlePageNo: this.$store.state.user.favorArticles.currentPage + 1,
          followedUserPageNo: this.$store.state.user.followedUsers.currentPage + 1
        }
      },
      // 已登录用户
      loggedUser() {
        return this.$store.getters.loggedUser;
      },
      followed() {
        return this.$store.state.user.followed;
      }
    },
    methods: {
      changeType(type) {
        this.viewType = type;
        // 切换tab时重置loading组件
        this.$nextTick(() => {
          this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
        });
      },
      // 加载所有文章
      scrollToMoreArticles(pageNo, $state) {
        let userId = this.$route.params.id;
        const params = {pageNo, userId, $state};
        if (Object.is(this.viewType, 1)) {
          this.$store.dispatch('userIndexArticles', params);
        } else if (Object.is(this.viewType, 2)) {
          this.$store.dispatch('userFavorArticles', params);
        } else if (Object.is(this.viewType, 3)) {
          this.$store.dispatch('userFollowedUsers', params);
        }
      },
      // 滚动加载下一页文章
      infiniteHandler($state) {
        setTimeout(() => {
          // 获取更多数据
          if (Object.is(this.viewType, 1)) {
            this.scrollToMoreArticles(this.nextPageParam.pageNo, $state);
          } else if (Object.is(this.viewType, 2)) {
            this.scrollToMoreArticles(this.nextPageParam.favorArticlePageNo, $state);
          } else if (Object.is(this.viewType, 3)) {
            this.scrollToMoreArticles(this.nextPageParam.followedUserPageNo, $state);
          }
        }, 1000);
      },
      changeHeadImg() { // 点击修改头像
        document.getElementById("upload").click();
      },
      // 修改头像
      uploadFile(e) {
        const file = e.target;
        const filePath = file.value;
        const filePic = file.files[0];
        const store = this.$store.getters;
        const router = this.$router;
        if (filePath) {
          //读取图片数据
          let reader = new FileReader();
          reader.onload = function (e) {
            let data = e.target.result;
            //加载图片获取图片真实宽度和高度
            let image = new Image();
            image.onload = function () {
              let width = image.width;
              let height = image.height;
              if (width > 300 || height > 300) {
                layer.msg("头像尺寸应为：300*300！", {time: 1500, icon: 8});
                file.value = "";
              } else {
                // 上传头像
                let config = { //添加请求头
                  headers: {'Content-Type': 'multipart/form-data'}
                };
                let param = new FormData(); //创建form对象
                param.append('file', filePic, filePic.name);//通过append向form对象添加数据
                return Axios.post("/pic/upload", param, config).then(res => {
                  if (res.data.error === 0) {
                    // 修改用户头像路径
                    Axios.post("/user/userInfo", {userId: store.loggedUser.userId, headImg: res.data.url}).then(res => {
                      if (res.data && Object.is(res.data.state, 200)) {
                        // 刷新页面
                        router.go(0);
                      } else {
                        layer.msg("上传头像错误", {time: 1200, icon: 2});
                      }
                    }).catch(err => {
                      console.log("上传头像错误: ", err);
                      layer.msg("上传头像错误", {time: 1200, icon: 2});
                    });
                  } else {
                    layer.msg("上传头像错误", {time: 1200, icon: 2});
                  }
                }).catch(err => {
                  console.log("上传头像错误: ", err);
                  layer.msg("上传头像错误", {time: 1200, icon: 2});
                });
              }
            };
            image.src = data;
          };
          reader.readAsDataURL(filePic);
        }
      },
      showChangeInput() {
        // 显示修改框
        this.modifier = true;
      },
      // 修改个性签名
      changeDesc() {
        let desc = this.$refs.desc;
        //去掉所有的html标记
        const newDesc = desc.value.replace(/<[^>]+>/g, "");
        console.log('newDesc:', newDesc);
        const store = this.$store.getters;
        const router = this.$router;
        return Axios.post("/user/userInfo", {userId: store.loggedUser.userId, desc: newDesc}).then(res => {
          if (res.data && Object.is(res.data.state, 200)) {
            router.go(0);
          } else {
            layer.msg("修改个性签名错误", {time: 1500, icon: 8});
          }
        }).catch(err => {
          layer.msg("修改个性签名错误", {time: 1500, icon: 8});
        });
      },
      follow() {
        // 添加关注
        if (!this.loggedUser) {
          layer.msg("未登录", {time: 1500, icon: 8});
          return;
        }
        const userId = this.loggedUser.userId;
        const followUserId = this.$route.params.id;
        const store = this.$store;
        if (userId && followUserId) {
          Axios.post("/follow", {userId, followUserId}).then(res => {
            if (res.data && Object.is(res.data.state, 200)) {
              store.commit("user/USER_FOLLOWED", true);
            } else {
              layer.msg("添加关注错误", {time: 1500, icon: 8});
            }
          }).catch(err => {
            layer.msg("添加关注错误", {time: 1500, icon: 8});
          })
        }
      },
      unFollow() {
        // 取消关注
        if (!this.loggedUser) {
          layer.msg("未登录", {time: 1500, icon: 8});
          return;
        }
        const userId = this.loggedUser.userId;
        const followUserId = this.$route.params.id;
        const store = this.$store;
        if (userId && followUserId) {
          Axios.post("/follow/unsubscribe", {userId, followUserId}).then(res => {
            if (res.data && Object.is(res.data.state, 200)) {
              store.commit("user/USER_FOLLOWED", false);
            } else {
              layer.msg("取消关注错误", {time: 1500, icon: 8});
            }
          }).catch(err => {
            layer.msg("取消关注错误", {time: 1500, icon: 8});
          })
        }
      }
    }
  }
</script>

<style>
  #avatar:hover {
    opacity: 0.6;
    color: #fff;
    background: rgba(0, 0, 0, 0.8);
  }
</style>
