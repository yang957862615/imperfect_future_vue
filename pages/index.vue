<template>
  <main>
    <!-- hide if already logged in -->
    <div class="jumbotron">
      <div class="container">
        <button type="button" class="close" aria-label="Close">
          <span aria-hidden="true" class="fa fa-close"></span>
        </button>
        <h1 class="display-3">Welcome!</h1>
        <p>This is a brand new version you haven’t played!</p>
        <p>
          <nuxt-link class="btn btn-primary btn-lg" to="/user/post" role="button">发表新文章 &raquo;</nuxt-link>
        </p>
      </div>
    </div>
    <!--文章 瀑布流布局-->
    <ArticleList :articleList="articleList" @infiniteHandler="infiniteHandler"></ArticleList>
  </main>
</template>

<script>
  import ArticleList from '~/components/views/article/ArticleList';

  export default {
    head: {
      title: 'Home Page'
    },
    fetch({store}) {
      return Promise.all([
        store.dispatch('loadArticleList')
      ]).catch(err => {
        console.log('err:',err);
        layer.msg(err, {time: 1500, icon: 5});
      });
    },
    components: {
      ArticleList
    },
    computed: {
      articleList() { // 获取文章列表
        // 注意: this.$store.state获取模块数据时需要加上模块名
        return this.$store.state.article.articles.list;
      },
      nextPageParam() { // 下一页
        return {
          pageNo: this.$store.state.article.articles.currentPage + 1
        }
      }
    },
    methods: {
      scrollToMoreArticles(pageNo, $state) { // 加载所有文章
        const params = {pageNo, $state};
        this.$store.dispatch('loadArticleList', params);
      },
      infiniteHandler($state) { // 滚动加载
        setTimeout(() => {
          // 获取更多数据
          this.scrollToMoreArticles(this.nextPageParam.pageNo, $state);
        }, 1000);
      }
    }
  }
</script>

<style>

</style>
