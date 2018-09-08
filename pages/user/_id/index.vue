<template>
  <div role="main">
    <div class="container" ref="cropperContainer" style="display: none;">
      <div>
        <vue-cropper
          style="height: 300px;"
          ref="cropper"
          :img="imgCropper.img"
          :autoCrop="imgCropper.autoCrop"
          :autoCropWidth="imgCropper.autoCropWidth"
          :autoCropHeight="imgCropper.autoCropHeight"
          :fixedBox="imgCropper.fixedBox"
          :outputSize="imgCropper.size"
          :outputType="imgCropper.outputType"
          :full="imgCropper.full"
          :canMove="imgCropper.canMove"
          :canMoveBox="imgCropper.canMoveBox"
          :original="imgCropper.original"
          :centerBox="imgCropper.centerBox"
          :info="true"
        >
        </vue-cropper>
      </div>
      <div class="btn-group-sm text-center mt-2 mb-2">
        <button type="button" class="btn btn-primary" @click="confirmCropper">确认</button>
        <button type="button" class="btn btn-primary" @click="cancelCropper">取消</button>
      </div>
    </div>
    <section class="jumbotron text-center">
      <div class="container">
        <img
          v-if="!myself"
          :src="userInfo ? userInfo.headImg : ''"
          alt="头像"
          class="rounded-circle mb-2"
          style="width: 150px;height: 150px;"
        />
        <img
          v-if="myself"
          :src="userInfo ? userInfo.headImg : ''"
          alt="头像"
          class="rounded-circle mb-2"
          id="avatar"
          @click="changeHeadImg()"
          style="width: 150px;height: 150px;"
        />
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
          <ArticleList
            :articleList="articleList"
            @infiniteHandler="infiniteHandler"
            :viewChange="this.viewType"
          >
          </ArticleList>
        </div>
        <div v-show="viewType===2" class="tab-pane fade show active">
          <!--用户收藏的文章 瀑布流布局-->
          <ArticleList
            :articleList="favorArticleList"
            @infiniteHandler="infiniteHandler"
            :viewChange="this.viewType"
          >
          </ArticleList>
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
    <!--如果未登录或者不是自己的主页就只显示文章-->
    <div v-if="!loggedUser || !myself">
      <!--文章 瀑布流布局-->
      <ArticleList :articleList="articleList" @infiniteHandler="infiniteHandler"></ArticleList>
    </div>
    <!--真正的上传图片框 不需要显示-->
    <input
      type="file"
      id="upload"
      class="invisible"
      accept="image/png, image/jpeg, image/gif, image/jpg"
      @change="cropperImage"
    >
  </div>
</template>

<script>
  import Axios from '~/plugins/Axios';
  import {getToken} from "~/utils/auth.js"
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
        viewType: 1,
        imgCropper: {
          img: '',
          autoCrop: true,
          autoCropWidth: 200,
          autoCropHeight: 200,
          fixedBox: true,
          size: 1,
          full: false,
          outputType: 'png',
          canMove: true,
          original: false,
          canMoveBox: false,
          centerBox: true
        }
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
      // 加载用户文章
      const userIndexArticles = store.dispatch('userIndexArticles', loadParams);
      // 加载用户基本信息
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
        promises.push(favorArticles, followedUsers);
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
      uploadFile(blob) {
        let index = layer.load(1, {
          shade: [0.1,'#fff'] //0.1透明度的白色背景
        });
        const store = this.$store;
        const router = this.$router;
        if (blob) {
          // 上传头像
          let config = { //添加请求头
            headers: {'Content-Type': 'multipart/form-data'},
            withCredentials: true
          };
          let param = new FormData(); //创建form对象
          param.append('file', blob,new Date().getTime() + ".png");//通过append向form对象添加数据
          return Axios.post("/pic/upload", param, config).then(res => {
            if (res.data.error === 0) {
              // 修改用户头像路径
              Axios.post(`/user/${getToken()}/userInfo`, {userId: store.getters.loggedUser.userId, headImg: res.data.url}).then(res1 => {
                if (res1.data && Object.is(res1.data.state, 200)) {
                  // 刷新页面
                  router.go(0);
                } else {
                  layer.close(index);
                  layer.msg("上传头像错误", {time: 1200, icon: 2});
                }
              }).catch(err => {
                layer.close(index);
                console.log("上传头像错误: ", err);
                layer.msg("上传头像错误", {time: 1200, icon: 2});
              });
            } else {
              layer.close(index);
              layer.msg("上传头像错误", {time: 1200, icon: 2});
            }
          }).catch(err => {
            layer.close(index);
            console.log("上传头像错误: ", err);
            layer.msg("上传头像错误", {time: 1200, icon: 2});
          });
        }
      },
      showChangeInput() {
        // 显示个性签名修改框
        this.modifier = true;
      },
      // 修改个性签名
      changeDesc() {
        let desc = this.$refs.desc;
        //去掉所有的html标记
        const newDesc = desc.value.replace(/<[^>]+>/g, "");
        //console.log('newDesc:', newDesc);
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
      },
      cropperImage (e) {
        // 显示剪裁框
        this.$refs.cropperContainer.style.display = 'block';
        // 剪裁图片
        let file = e.target.files[0];
        if (!/\.(gif|jpg|jpeg|png|bmp|GIF|JPG|PNG)$/.test(e.target.value)) {
          alert('图片类型必须是.gif,jpeg,jpg,png,bmp中的一种');
          return false;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
          let data;
          if (typeof e.target.result === 'object') {
            // 把Array Buffer转化为blob 如果是base64不需要
            data = window.URL.createObjectURL(new Blob([e.target.result]))
          } else {
            data = e.target.result;
          }
          this.imgCropper.img = data;
        };
        // 转化为base64
        // reader.readAsDataURL(file)
        // 转化为blob
        reader.readAsArrayBuffer(file)
      },
      confirmCropper() {
        // 确认截取
        // 获取截图的blob数据
        this.$refs.cropper.getCropBlob(data => {
          this.uploadFile(data)
        });
      },
      cancelCropper() {
        // 取消截取
        this.$refs.cropper.clearCrop();
        this.$refs.cropper.stopCrop();
        this.imgCropper.img = '';
        // 隐藏剪裁框
        this.$refs.cropperContainer.style.display = 'none';
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
