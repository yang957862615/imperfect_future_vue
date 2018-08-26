<template>
  <div class="container article" style="">
    <div class="row">
      <div class="cover" style="opacity: 1">
        <img :src="articleDetails.imgUrl" class="img-fluid" alt="文章封面" style="">
      </div>
    </div>
    <div class="row" style="">
      <div class="article_title" style="word-break: break-all;">
        <p>{{articleDetails.title}}</p>
      </div>
      <div class="category" style="">
        <p>
          {{articleDetails.author}} ·
          {{timestampConvert(articleDetails.createTime)}} ·
          {{articleDetails.categoryName}}
        </p>
        <div class="info">
          <span class="fa fa-eye mr-3"> {{articleInfo.readCount}}</span>
          <span class="fa fa-comments mr-3"> {{articleInfo.commentCount}}</span>
          <span v-if="favNum === 0" class="fa fa-heart" v-show="didFavor === true" style="color: red"> {{articleInfo.favorCount}}</span>
          <span v-if="favNum > 0" class="fa fa-heart" v-show="didFavor === true" style="color: red"> {{parseInt(articleInfo.favorCount)+1}}</span>
          <span class="fa fa-heart" @click.once="favor" v-show="didFavor === false"> {{articleInfo.favorCount}}</span>
        </div>
      </div>
    </div>
    <div class="row mt-5">
      <div class="markdown-body" v-html="articleDetails.content"></div>
    </div>
    <div class="row">
        <ArticleComment></ArticleComment>
    </div>
  </div>
</template>

<script>
  import {timestampToTime} from '~/utils/timestamp_convertor';
  import ArticleComment from '~/components/views/article/ArticleComment.vue'
  import {mapState} from 'vuex';
  import Axios from '~/plugins/Axios.js'

  export default {
    validate({params}) { // 检测路由参数
      return params.id && !isNaN(Number(params.id));
    },
    components: {
      ArticleComment
    },
    fetch({store, params, error}) {
      let param = {articleId: params.id, page: 1};
      let promises = [
        store.dispatch("loadArticleDetails", params.id),
        store.dispatch("loadArticleComments", param),
        store.dispatch("articleInfo", params.id)
      ];
      // 如果已经登录则查询用户是否给此篇文章点赞
      if (store.getters.isAuthenticated) {
        let userDidFavor = store.dispatch("userDidFavor", {
          articleId: params.id,
          userId: store.getters.loggedUser.userId
        });
        promises.push(userDidFavor);
      }
      return Promise.all(promises).catch(err => {
        error({statusCode: 500, message: err})
      });
    },
    head() {
      return {
        title: this.articleDetails.title || '',
        meta: [
          {
            hid: 'keywords',
            name: 'keywords',
            content: (this.articleDetails.title) || ''
          },
          {hid: 'description', name: 'description', content: this.articleDetails.desc}
        ]
      }
    },
    data() {
      return {
        favNum: 0
      }
    },
    methods: {
      timestampConvert(timestamp) { // 时间戳转换
        return timestampToTime(timestamp);
      },
      favor() {
        // 给文章点赞
        if (!this.$store.getters.isAuthenticated) {
          layer.msg("请先登录！", {time: 1500, icon: 6});
          return;
        }
        let articleId = this.$route.params.id;
        let userId = this.$store.getters.loggedUser.userId;
        const store = this.$store;
        Axios.post(`/article/${articleId}/${userId}/favor`).then(res => {
          if (res.data && Object.is(res.data.state, 200)) {
            this.favNum = this.favorCount + 1;
            store.commit("user/USER_DID_FAVOR", true);
          } else {
            layer.msg("错误", {time: 1500, icon: 8});
          }
        }).catch(err => {
          layer.msg(err, {time: 1500, icon: 8});
        });
      }
    },
    computed: {
      ...mapState({
        // 获取文章详细信息
        articleDetails: state => state.article.detail.data,
        // 文章点击量等信息
        articleInfo: state => state.article.articleInfo,
        // 用户是否已经对此篇文章点赞
        didFavor: state => state.user.didFavor,
        favorCount: state => state.article.articleInfo.favorCount,
      })
    }
  }
</script>

<style>

</style>