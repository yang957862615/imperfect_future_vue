<template>
  <div class="card border-light" style="width: 100%;margin-top: 250px;">
    <div class="card-body">
      <h1 class="card-title text-info pt-1">评论 · {{comments.list.length}}</h1>
      <div class="mb-5 pt-3" style="border-top: 1px solid #eaecef;">
        <div
            v-for="(comment,index) in comments.list"
            :key="index"
            :class="[index > 0 ? 'card mt-2' : 'card']"
        >
          <div class="card-body">
            <div class="media comment" :id="`c${index}`">
              <img class="mr-3 rounded-circle" style="width: 50px;height: 50px;"
                   :src="comment.headImg"
                   alt="头像">
              <div class="media-body" style="max-width: 100%;">
                <div class="comment-desc">
                  <nuxt-link :to="`/user/${comment.userId}`" class="text-info mt-0">
                    {{mySelf(comment.userId) ? '我' : comment.commentUserName}} ·
                  </nuxt-link>
                  <span class="font-weight-light text-info badge">
                    {{timestampConvert(comment.createTime)}}
                    <span class="mt-2" v-if="comment.replyUserName" style="color: rgba(138, 139, 150, 0.53);">
                      ·
                      <a
                          :href="`#c${Number(comment.replyIndex) > 0 ? Number(comment.replyIndex)-1 : comment.replyIndex}`">
                        回复#{{comment.replyIndex}}
                      </a>
                      <nuxt-link :to="`/user/${comment.parentId}`">
                        @{{mySelf(comment.parentId) ? '我' : comment.replyUserName}}
                      </nuxt-link>
                    </span>
                    <span class="mt-2" v-else-if="comment.parentId" style="color: rgba(138, 139, 150, 0.53);">
                      ·
                      <a
                          :href="`#c${Number(comment.replyIndex) > 0 ? Number(comment.replyIndex)-1 : comment.replyIndex}`">
                        回复了#{{comment.replyIndex}}
                      </a>
                    </span>
                  </span>
                  <a class="font-weight-light text-info badge"
                     href="#editor" @click="replyComment(comment,index)">
                    <span class="fa fa-mail-reply"> 回复</span></a>
                  <span class="ml-2 text-info badge comment-index">#{{index}}</span>
                </div>
                <div
                    class="mt-2"
                    v-html="comment.content"
                >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <nav v-show="comments.pages>0">
        <ul class="pagination">
          <li :class="[comments.currentPage===1 ? 'page-item disabled' : 'page-item']">
            <a
                class="page-link"
                href="javascript:;"
                @click="commentsNextPage(comments.currentPage-1)">
              上一页
            </a>
          </li>
          <li
              :class="[comments.currentPage === page ? 'page-item active' : 'page-item']"
              v-for="(page,index) in comments.pages"
              :key="index"
          >
            <a class="page-link" href="javascript:;" @click="commentsNextPage(page)">{{page}}</a>
          </li>
          <li
              :class="[comments.currentPage===comments.pages ? 'page-item disabled' : 'page-item']">
            <a
                class="page-link"
                href="javascript:;"
                @click="commentsNextPage(comments.currentPage+1)"
            >
              下一页
            </a>
          </li>
        </ul>
      </nav>
      <div id="editor">
        <div class="form-group" v-show="parentId">
          <a href="javascript:" @click="closeReply" class="float-right">X</a>
          <label>
            <input type="text" class="form-control" v-model="replyUser" disabled>
          </label>
          <label>
            <textarea class="form-control" v-model="replyContent" disabled></textarea>
          </label>
        </div>
        <mavon-editor
            class="v-note-wrapper markdown-body"
            style="min-height: 250px;min-width: 100%;"
            ref=md
            :toolbars="toolbars"
            :defaultOpen="'edit'"
            @change="comment"
            @imgAdd="$imgAdd"
            @imgDel="$imgDel"
            :placeholder="'评论支持markdown语法'"
            :imageClick="imageClick"
            v-model="text"
        >
        </mavon-editor>
      </div>
      <div class="mt-3" v-show="!parentId">
        <button class="btn btn-primary" @click="sendComment">提交评论</button>
      </div>
      <div class="mt-3" v-show="parentId">
        <button type="button" class="btn btn-primary" @click="sendComment">提交评论</button>
        <button type="button" class="btn btn-danger" @click="closeReply">取消评论</button>
      </div>
    </div>
  </div>
</template>

<script>
import {timeDifference} from '~/utils/time_diffrent';
import {mapGetters, mapState} from 'vuex';

export default {
	name: 'ArticleComment',
	data() {
		return {
			toolbars: {
				bold: true, // 粗体
				italic: true, // 斜体
				header: false, // 标题
				underline: true, // 下划线
				strikethrough: true, // 中划线
				mark: true, // 标记
				superscript: true, // 上角标
				subscript: true, // 下角标
				quote: true, // 引用
				ol: true, // 有序列表
				ul: true, // 无序列表
				link: true, // 链接
				imagelink: true, // 图片链接
				code: true, // code
				table: true, // 表格
				fullscreen: false, // 全屏编辑
				readmodel: false, // 沉浸式阅读
				htmlcode: false, // 展示html源码
				help: true, // 帮助
              /* 1.3.5 */
				undo: true, // 上一步
				redo: true, // 下一步
				trash: true, // 清空
				save: false, // 保存（触发events中的save事件）
              /* 1.4.2 */
				navigation: false, // 导航目录
              /* 2.1.8 */
				alignleft: false, // 左对齐
				aligncenter: false, // 居中
				alignright: false, // 右对齐
              /* 2.2.1 */
				subfield: false, // 单双栏模式
				preview: true, // 预览
			},
			img_file: [],
			commentContent: '',
			placeHolder: '评论支持markdown语法',
			// 回复楼层的id
			parentId: '',
			// 回复的楼层
			replyIndex: '',
			// 回复的评论id
			replyCommentId: '',
			// 如： 回复 #1 joe
			replyUser: '',
			// 回复楼层的评论内容
			replyContent: '',
			text: '',
		};
	},
	computed: {
		...mapState({
			comments: state => state.comment.comments,
			currentPage: state => state.comment.comments.currentPage
		}),
		...mapGetters(['loggedUser'])
	},
	methods: {
		mySelf(userId) {
			// 判断是否为本人回复
			return this.loggedUser && Object.is(userId, this.loggedUser.userId);
		},
		commentsNextPage(page) {
			let articleId = this.$route.params.id;
			let params = {articleId, page};
			this.$store.dispatch('loadArticleComments', params);
		},
		comment(value, render) {
			// value为纯文字 render为html格式
			this.commentContent = render;
		},
		replyComment(comment, index) {
			// bug描述：点击回复按钮之后->删除文字->再点击回复相同楼层->进入方法但是不替换文字。
			// 暂时解决方案： 在输入框上写两个输入框里面显示回复信息
			this.parentId = comment.userId;
			this.replyIndex = index;
			this.replyCommentId = comment._id;
			this.replyUser = `回复 #${index} @${this.mySelf(comment.userId) ? '我' : comment.commentUserName}`;
			// TODO 如果是代码或者图片 怎么优化？
			this.replyContent = comment.content.replace(/<[^>]+>/g, ''); //去掉所有的html标记;
		},
		closeReply() {
			// 取消评论
			this.parentId = null;
			this.replyIndex = null;
			this.replyUser = null;
			this.replyContent = null;
			this.replyCommentId = null;
			this.commentContent = null;
			// 清空编辑框
			this.text = '';
		},
		timestampConvert(timestamp) {
			// 时间戳转换
			return timeDifference(timestamp);
		},
		sendComment() {
			// 发送评论/回复
			if (!this.commentContent) {
				layer.msg('请添加评论', {time: 1000, icon: 5});
				return false;
			}
			if (!this.$store.getters.isAuthenticated) {
				layer.msg('请先登录', {time: 1000, icon: 8});
				return false;
			}
			const comment = {
				userId: this.$store.getters.loggedUser.userId,
				articleId: this.$route.params.id,
				content: this.commentContent,
				parentId: null,
				replyIndex: null,
				replyCommentId: null
			};
			// 判断是否为回复
			const isReply = this.replyIndex >= 0 && !!this.replyUser && !!this.replyContent;
			if (isReply) {
				if (isReply && !!this.parentId) {
					comment.parentId = this.parentId;
					comment.content = this.commentContent.replace(`${this.replyContent}`, '');
					comment.replyIndex = this.comments.list.length + 1;
					comment.replyCommentId = this.replyCommentId;
				}
			}
			this.$axios.post('/comment/post', comment).then(res => {
				if (res.data.state && Object.is(res.data.state, 200)) {
					layer.msg('评论成功', {time: 1000, icon: 6});
					comment.headImg = this.$store.getters.loggedUser.headImg;
					// 评论后不会刷新页面就会展示出来
					this.$store.dispatch('newComment', comment);
					this.closeReply();
				}
			}).catch(err => {
				layer.msg('评论错误' + err, {time: 2000, icon: 8});
			});
		},
		// 绑定@imgAdd event
		$imgAdd(pos, $file) {
			if (!this.$store.getters.isAuthenticated) {
				layer.msg('请先登录', {time: 1000, icon: 8});
				return false;
			}
			// 绑定@imgAdd event markdown组件上传图片
			// 第一步.将图片上传到服务器.
			let formdata = new FormData();
			formdata.append('file', $file);
			this.$axios({
				url: '/article/pic/upload',
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
			});
		},
		$imgDel(pos) {
			// markdown组件删除图片
			delete this.img_file[pos];
		},
		imageClick() {
			// 图片点击事件，默认为预览
			return false;
		}
	}
};
</script>

<style>
</style>
