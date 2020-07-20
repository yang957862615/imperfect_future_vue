<template>
    <div class="container">
        <div class="form-row">
            <div class="form-group col-md-8 mt-3">
                <label for="a" class="sr-only">搜索文章</label>
                <input id="a" class="form-control form-control-lg" type="text" placeholder="搜索文章" v-model="keywords">
            </div>
            <div class="form-group col-md-2 mt-4 ml-3">
                <button type="button" class="btn btn-sm btn-primary" @click="search">搜索</button>
            </div>
        </div>
        <div v-if="articleList.length > 0" class="media mb-5" v-for="(article,index) in articleList" :key="index">
            <h1 class="mr-3"><span class="badge badge-primary">{{index}}</span></h1>
            <div class="media-body">
                <nuxt-link class="text-dark" :to="'/article/'+article.articleId">
                    <h5 class="mt-0"> {{article.title}} </h5>
                    <span v-html="article.description"></span>
                </nuxt-link>
            </div>
        </div>
    </div>
</template>

<script>
	import imperfectApi from '~/api/index'

	export default {
		name: "index",
		data() {
			return {
				keywords: '',
				pageNo: 1,
				articleList: []
			}
		},
		methods: {
			search() {
                if (!this.keywords) {
                    return;
                }
                let url = imperfectApi.searchApi.search(this.keywords, this.pageNo);
                this.$axios.get(url).then(res => {
                    console.log(res.data.ob);
                    if (!!res.data.ob) {
                        this.articleList = res.data.ob.content;
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>