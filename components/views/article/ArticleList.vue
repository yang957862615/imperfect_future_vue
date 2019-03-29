<template>
  <div class="">
    <!--文章 瀑布流布局-->
    <div id="columns">
      <figure
        v-for="(article,index) in articleList"
        class="animated fadeInDown"
        :key="index"
      >
        <img v-lazy="article.imgUrl">
        <figcaption>
          <div class="card-body">
            <p class="card-text" style="">
              <nuxt-link class="text-dark" :to="'/article/'+article.articleId">{{article.title}}</nuxt-link>
            </p>
            <div class="d-flex justify-content-between">
              <div class="btn-group">
                <a
                  class="btn btn-outline-primary btn-sm"
                  v-for="(tag,index) in tagsArray(article.tags)"
                  :key="index"
                >
                  {{tag}}
                </a>
              </div>
            </div>
            <div class="d-flex justify-content-between mt-3">
              <small class="text-muted">
                <nuxt-link :to="`/user/${article.userId}`" class="badge">
                  {{article.author}}
                </nuxt-link>
                <span style="font-size: 13px;margin-left: 5px;">
                  发布于{{timeDifference(article.createTime)}}
                </span>
              </small>
            </div>
          </div>
        </figcaption>
      </figure>
    </div>
    <infinite-loading ref="infiniteLoading" @infinite="scrollToMore">
      <span slot="no-more">
        没有更多数据啦 :(
      </span>
      <span slot="no-results">
        没有更多数据啦 :(
      </span>
    </infinite-loading>
  </div>
</template>

<script>
  // 上拉加载插件
  import InfiniteLoading from 'vue-infinite-loading/src/components/InfiniteLoading.vue';
  // 导入方法要使用花括号
  import {timeDifference} from '~/utils/time_diffrent';

  export default {
    name: "ArticleList",
    props: {
      articleList: {
        type: Array
      },
      viewChange: {
        type: Number
      }
    },
    components: {
      InfiniteLoading
    },
    watch: {
      viewChange() {
        // 切换tab时重置loading组件
        this.$nextTick(() => {
          this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
        });
      }
    },
    methods: {
      tagsArray(tags) {
        // 多个tag时会用逗号分割，此时需要拆分。
        return tags.split(",");
      },
      timeDifference(time) {
        // 计算时间差
        return timeDifference(time);
      },
      scrollToMore($state) {
        this.$emit('infiniteHandler', $state);
      }
    }
  }
</script>

<style scoped>

</style>
