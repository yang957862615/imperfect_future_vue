<template>
  <div class="container">
    <div class="row mt-5 mb-3">
      <div class="col-sm-3">
        <select
          class="custom-select"
          style="font-size: 1.2em"
          @change="selectCategory"
          title=""
        >
          <option selected>选择分类</option>
          <option
            v-for="(category,index) in articleCategories"
            :key="index"
            :value="category.categoryId">{{category.categoryName}}
          </option>
        </select>
      </div>
      <div class="col-sm-9">
        <input
          type="text"
          class="form-control pl-2 pr-2"
          placeholder="请输入标题"
          v-model="title"
          maxlength="100"
          autofocus
        >
      </div>
    </div>
    <!-- 上传文件组件 -->
    <ArticleImgUpload
      @uploadCover="uploadCover"
      :coverSrc="getCoverSrc"
    >
    </ArticleImgUpload>
    <div>
      <mavon-editor
        class="v-note-wrapper markdown-body"
        style="min-height: 600px;min-width: 100%;"
        @change="addArticle"
        @fullScreen="fullScreen"
        ref=md
        @imgAdd="$imgAdd"
        @imgDel="$imgDel"
        :imageClick="imageClick"
      >
      </mavon-editor>
    </div>
    <div class="row mt-3">
      <div class="col">
        <input
          type="text"
          placeholder="添加标签"
          class="form-control p-2"
          maxlength="15"
          @keyup.enter="addTag"
        >
        <div class="mt-2">
          <button
            type="button"
            v-for="(tag,index) in tags"
            :key="index"
            :class="['btn btn-sm',randomClass()]"
          >
            {{tag}}
            <span
              class="fa fa-remove"
              @click="deleteTag(tag)"
            >
            </span>
          </button>
        </div>
      </div>
    </div>
    <div class="row mt-5 mb-5">
      <div class="col">
        <button class="btn btn-primary btn-lg btn-block" @click="postArticle">发表</button>
      </div>
    </div>
  </div>
</template>

<script>
  import Axios from '~/plugins/Axios';
  import ArticleImgUpload from '~/components/views/article/ArticleImgUpload'

  export default {
    head: {
      title: '发表文章'
    },
    middleware: 'authenticated',
    components: {
      ArticleImgUpload
    },
    fetch({store, error}) {
      // 获取文章分类
      return store.dispatch("loadCategories").catch(err => {
        error({statusCode: 500, message: err})
      });
    },
    data() {
      return {
        // 文章标签
        tags: [],
        // 选择的文章分类id
        categoryId: '',
        // 文章标题
        title: '',
        // 文章内容
        articleContent: '',
        // markdown组件上传的所有图片
        img_file: {},
        // 标签样式随机
        btnClasses: ['btn-outline-primary', 'btn-outline-secondary', 'btn-outline-success', 'btn-outline-info', 'btn-outline-dark']
      }
    },
    computed: {
      articleCategories() { // 获取文章分类
        return this.$store.state.category.categories.list;
      },
      getCoverSrc() { // 获取上传后的封面url
        return this.$store.state.article.cover.url;
      }
    },
    methods: {
      selectCategory(e) { // 选择文章分类
        this.categoryId = e.target.value;
      },
      uploadCover(file) { // 上传封面
        let index = layer.load(1, {
          shade: [0.1, '#fff'] //0.1透明度的白色背景
        });
        this.$store.dispatch('uploadArticleCover', file).then(res => {
          layer.msg("封面上传成功~", {time: 1000, icon: 1}, function () {
            layer.close(index);
          });
        }).catch(err => {
          layer.msg("封面上传失败", {time: 1500, icon: 8}, function () {
            layer.close(index);
          });
        });
      },
      addArticle(value, render) { // 文章内容
        // value为纯文字 render为html格式
        this.articleContent = render;
      },
      fullScreen(flag) { // markdown插件全屏预览动作
        if (flag) {
          // 去掉header高度
          document.getElementsByClassName("markdown-body")[0].style.marginTop = 80 + 'px';
          layer.msg("写完文章后记得退出全屏模式再点击发布哦~", {icon: 7, time: 1500});
          return;
        }
        document.getElementsByClassName("markdown-body")[0].style.marginTop = '0px';
      },
      imageClick() { // markdown组件点击图片事件，默认为预览
        return false;
      },
      addTag(e) { // 添加标签
        if (Object.is(this.tags.length, 5)) {
          layer.msg("最多添加5个标签~", {time: 800, icon: 5});
          return false;
        }
        let tag = e.target.value.trim();
        let correct = /^[a-zA-Z]|[\u4e00-\u9fa5]+$/.test(tag);
        if (!correct) {
          layer.msg("标签只支持英文和汉字~", {time: 1000, icon: 5});
          return false;
        }
        if (!tag) return false;
        if (this.tags.includes(tag)) {
          layer.msg("标签不能重复~", {time: 800, icon: 2});
          return false;
        }
        // 插入标签
        this.tags.unshift(tag);
        e.target.value = '';
      },
      deleteTag(tag) { // 删除标签
        this.tags.splice(this.tags.findIndex(tag1 => tag1 === tag), 1);
      },
      randomClass() { // 添加标签时给标签随机添加样式
        const genRandom = (min, max) => (Math.random() * (max - min + 1) | 0) + min;
        let random = genRandom(0, this.btnClasses.length);
        return this.btnClasses[random];
      },
      // 绑定@imgAdd event
      $imgAdd(pos, $file) { // 绑定@imgAdd event markdown组件上传图片
        // 第一步.将图片上传到服务器.
        let formdata = new FormData();
        formdata.append("file", $file);
        Axios({
          url: '/pic/upload',
          method: 'post',
          data: formdata,
          headers: {'Content-Type': 'multipart/form-data'},
        }).then((res) => {
          // 第二步.将返回的url替换到文本原位置![...](./0) -> ![...](url)
          /**
           * $vm 指为mavonEditor实例，可以通过如下两种方式获取
           * 1. 通过引入对象获取: `import {mavonEditor} from ...` 等方式引入后，`$vm`为`mavonEditor`
           * 2. 通过$refs获取: html声明ref : `<mavon-editor ref=md ></mavon-editor>，`$vm`为 `this.$refs.md`
           */
          //console.log('评论组件上传图片res.data.url:', res.data.url);
          this.$refs.md.$img2Url(pos, res.data.url);
        })
      },
      $imgDel(pos) { // markdown组件删除图片
        delete this.img_file[pos];
      },
      postArticle() { // 发布文章
        let splitTags = this.tags.join(",");
        let desc = this.articleContent.substr(0, 100);
        let msg = null;
        let article = {
          title: this.title || (msg = '标题不能为空'),
          categoryId: this.categoryId || (msg = '分类不能为空'),
          userId: this.$store.getters.loggedUser.userId || (msg = '请登录'),
          tags: splitTags || (msg = '标签不能为空'),
          desc: desc || (msg = '描述不能为空'),
          imgUrl: this.getCoverSrc || (msg = '封面不能为空'),
          content: this.articleContent || (msg = '内容不能为空')
        };
        //console.log('发布文章的article参数:', article);
        if (msg != null) {
          layer.msg(msg, {time: 800, icon: 2});
          return false;
        }
        let router = this.$router;
        let store = this.$store;
        Axios.post("/article/", article).then((res) => {
          //console.log('res:', res);
          if (res.data.state === 200) {
            layer.msg("文章发布成功~", {time: 800, icon: 1}, function () {
              store.commit("article/CLEAR_ARTICLE_COVER_URL");
              router.push({path: "/"});
            });
          }
        }).catch((error) => {
          console.log('文章发布error:', error);
        });
      }
    }
  }
</script>

<style>

</style>
