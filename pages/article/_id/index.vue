<template>
  <div class="article">
    <div class="row">
      <div class="cover">
        <img v-lazy="articleDetails.imgUrl" class="img-fluid" alt="文章封面" style="object-fit: cover;">
      </div>
    </div>
    <div class="container">
      <div class="article-info border-bottom">
        <div class="article-title">
          <p>{{articleDetails.title}}</p>
        </div>
        <div class="category">
          <div>
            {{articleDetails.author}} ·
            {{timestampConvert(articleDetails.createTime)}} ·
            {{articleDetails.categoryName}}
          </div>
          <div class="info mt-2">
            <span class="fa fa-eye mr-3"> {{articleInfo.readCount}}</span>
            <span class="fa fa-comments mr-3"> {{articleInfo.commentCount}}</span>
            <span v-if="favNum === 0" class="fa fa-heart" v-show="didFavor === true" style="color: red"> {{articleInfo.favorCount}}</span>
            <span v-if="favNum > 0" class="fa fa-heart" v-show="didFavor === true" style="color: red"> {{parseInt(articleInfo.favorCount)+1}}</span>
            <span
                class="fa fa-heart"
                @click.once="favor"
                v-show="didFavor === false"
            >
                {{articleInfo.favorCount}}
              </span>
          </div>
        </div>
      </div>
      <div class="article-content">
        <div class="row">
          <div class="markdown-body" v-html="articleDetails.content"></div>
        </div>
      </div>
      <div class="row">
        <ArticleComment></ArticleComment>
      </div>
    </div>
  </div>
</template>

<script>
import {timestampToTime} from '~/utils/timestamp_convertor';
import ArticleComment from '~/components/views/article/ArticleComment.vue';
import {mapState} from 'vuex';
import imperfectApi from '~/api/index';

export default {
	scrollToTop: true,
	validate({params}) { // 检测路由参数
		return params.id && !isNaN(Number(params.id));
	},
	components: {
		ArticleComment
	},
	fetch({store, params, error}) {
		let param = {articleId: params.id, page: 1};
		let promises = [
			store.dispatch('loadArticleDetails', params.id),
			store.dispatch('loadArticleComments', param),
			store.dispatch('articleBasicInfo', params.id)
		];
		// 如果已经登录则查询用户是否给此篇文章点赞
		if (store.getters.isAuthenticated) {
			let userDidFavor = store.dispatch('userDidFavor', {
				articleId: params.id,
				userId: store.getters.loggedUser.userId
			});
			promises.push(userDidFavor);
		}
		return Promise.all(promises).catch(err => {
			error({statusCode: 500, message: err});
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
		};
	},
	data() {
		return {
			favNum: 0
		};
	},
	methods: {
		timestampConvert(timestamp) { // 时间戳转换
			return timestampToTime(timestamp);
		},
		favor() {
			// 给文章点赞
			if (!this.$store.getters.isAuthenticated) {
				layer.msg('请先登录！', {time: 1500, icon: 6});
				return;
			}
			let articleId = this.$route.params.id;
			let userId = this.$store.getters.loggedUser.userId;
			const store = this.$store;
			let url = imperfectApi.articleApi.favor(articleId, userId);
			this.$axios.post(url).then(res => {
				this.favNum = this.favorCount + 1;
				store.commit('user/USER_DID_FAVOR', true);
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
};
</script>

<style>
  /*电脑端*/
  @media (min-width: 999px) {
    /*给图片添加蒙版遮罩让文字更突出*/
    .article .cover:after {
      position: absolute;
      left: 0;
      top: 0;
      display: block;
      width: 100%;
      height: 100%;
      background-color: rgba(11, 11, 11, 0.23);
      /*background-color: rgba(255, 255, 255, 0);*/
      /*background-color: rgba(155, 143, 143, 0.19);*/
      content: attr(data-text);
      color: #FFF;
    }
  
    /*.background {
      width: 100%;
      height: 800px;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }*/
  }

  /*手机端*/
  @media (max-width: 999px) {
    /*.background {
      width: 100%;
      height: 400px;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }*/
  }
</style>
