<template>
  <div class="container">
    <div class="mt-5">
      <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
        <li class="nav-item">
          <a @click="showDiffrentMsgs(1)" class="nav-link active" id="notification" data-toggle="pill"
             href="#pills-home" role="tab"
             aria-controls="pills-home" aria-selected="true">通知</a>
        </li>
        <li class="nav-item">
          <a @click="showDiffrentMsgs(3)" class="nav-link" id="comments" data-toggle="pill" href="#pills-profile"
             role="tab"
             aria-controls="pills-profile" aria-selected="false">评论</a>
        </li>
      </ul>
      <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="notification">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a
                @click="showDiffrentMsgs(1)"
                :class="[msgType === 1 ? 'nav-link active' : 'nav-link']"
                href="javascript:;"
              >
                订阅通知
              </a>
            </li>
            <li class="nav-item">
              <a
                @click="showDiffrentMsgs(2)"
                :class="[msgType === 2 ? 'nav-link active' : 'nav-link']"
                href="javascript:;"
              >
                系统通知
              </a>
            </li>
          </ul>
          <div class="mb-1">
            <div class="list-group">
              <div
                class="list-group-item list-group-item-action flex-column align-items-start"
                v-if="msgType === 1" v-for="(subMsg,index) in userSubMsgs" :key="index"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mt-2">{{subMsg.subject === 'sub' ? '订阅通知' : '系统通知'}}</h5>
                  <small>{{timeDifference(subMsg.createTime)}}</small>
                </div>
                <div class="mb-1" v-html="subMsg.message"></div>
              </div>
            </div>
            <div class="list-group">
              <div
                class="list-group-item list-group-item-action flex-column align-items-start"
                v-if="msgType === 2" v-for="(sysMsg,index) in userSysMsgs" :key="index"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mt-2">{{sysMsg.subject === 'sub' ? '订阅通知' : '系统通知'}}</h5>
                  <small>{{timeDifference(sysMsg.createTime)}}</small>
                </div>
                <div class="mb-1" v-html="sysMsg.message"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="comments">
          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a
                @click="showDiffrentMsgs(3)"
                :class="[msgType === 3 ? 'nav-link active' : 'nav-link']"
                href="javascript:;"
              >
                我发出的评论
              </a>
            </li>
            <li class="nav-item">
              <a
                @click="showDiffrentMsgs(4)"
                :class="[msgType === 4 ? 'nav-link active' : 'nav-link']"
                href="javascript:;"
              >
                我收到的评论
              </a>
            </li>
          </ul>
          <div class="mb-1">
            <div class="list-group">
              <div
                class="list-group-item list-group-item-action flex-column align-items-start"
                v-if="msgType === 3" v-for="(sentComment,index) in userSentComments" :key="index"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5
                    class="mt-2"
                    v-html="!sentComment.parentId ?
                      `我 评论了文章 <a href='/article/${sentComment.articleId}'>${sentComment.articleTitle}</a>` :
                      `我 回复了文章 <a href='/article/${sentComment.articleId}'>${sentComment.articleTitle}</a> 下的评论` "
                  >
                  </h5>
                  <small>{{timeDifference(sentComment.createTime)}}</small>
                </div>
                <div v-if="sentComment.replyContent" class="mt-2"
                     v-html="`<a href='/user/${sentComment.parentId}'>@${sentComment.replyUserName}</a>： ${sentComment.replyContent} <span class='fa fa-send-o'></span> ${sentComment.content}`">
                </div>
                <div v-else class="mb-1" v-html="sentComment.content"></div>
              </div>
            </div>
            <div class="list-group">
              <div
                class="list-group-item list-group-item-action flex-column align-items-start"
                v-if="msgType === 4" v-for="(receivedComment,index) in receivedComments" :key="index"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mt-2">
                    <div
                      v-html="`${receivedComment.commentUserName} 评论了你的文章 <a href='/article/${receivedComment.articleId}'>${receivedComment.articleTitle}</a>`"></div>
                  </h5>
                  <small>{{timeDifference(receivedComment.createTime)}}</small>
                </div>
                <div class="mb-1" v-html="receivedComment.content">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--实际上，每当 identifier 属性发生变化的时候，该组件就会自行重设-->
    <infinite-loading :identifier="infiniteId" ref="infiniteLoading" @infinite="scrollToMore">
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
// 导入方法要使用花括号
import {timeDifference} from '~/utils/time_diffrent';
import {mapState} from 'vuex';

export default {
	head: {
		title: '消息中心'
	},
	middleware: 'authenticated',
	data() {
		return {
			msgType: 1,
			infiniteId: +new Date()
		};
	},
	fetch({store}) {
		const {userId} = store.getters.loggedUser;
		let pageNo = 1;
		let sub = store.dispatch('userMsgs', {userId, pageNo, type: 'sub'});
		let sys = store.dispatch('userMsgs', {userId, pageNo, type: 'sys'});
		let sentComments = store.dispatch('userComments', {userId, pageNo, type: 'sent'});
		let receivedComments = store.dispatch('userComments', {userId, pageNo, type: 'received'});
		// 清空未读消息
		let clearAllMsgs = store.commit('message/CLEAR_ALL_NEW_MSGS');
		let promises = [sub, sys, sentComments, receivedComments, clearAllMsgs];
      return Promise.all(promises).catch(err => {
        console.log('加载消息中心err:', err);
        layer.msg("加载消息中心失败", {time: 1500, icon: 8});
      });
    },
    computed: {
      ...mapState({
        // 获取文章详细信息
        userSubMsgs: state => state.message.subMsgs.list,
        userSysMsgs: state => state.message.sysMsgs.list,
        userSentComments: state => state.message.sentComments.list,
        receivedComments: state => state.message.receivedComments.list
      }),
      nextPageParam() {
        return {
          pageNo: this.msgType === 1 ? this.$store.state.message.subMsgs.currentPage + 1 :
            this.$store.state.message.sysMsgs.currentPage + 1,
          commentPageNo: this.msgType === 3 ? this.$store.state.message.sentComments.currentPage + 1 :
            this.$store.state.message.receivedComments.currentPage + 1
        }
      }
    },
    methods: {
      timeDifference(time) { // 计算时间差
        return timeDifference(time);
      },
      showDiffrentMsgs(type) {
        this.msgType = type;
        // 更换消息tab时重置loading组件
        this.infiniteId += 1;
        /*this.$nextTick(() => {
          this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
        });*/
      },
      scrollToMore($state) {
        setTimeout(() => {
          // 获取下一页消息
          if (this.msgType === 1 || this.msgType === 2) {
            this.scrollToMoreMsgs(this.nextPageParam.pageNo, $state);
          } else if (this.msgType === 3 || this.msgType === 4) {
            this.scrollToMoreMsgs(this.nextPageParam.commentPageNo, $state);
          }
        }, 1000);
      },
      scrollToMoreMsgs(pageNo, $state) {
        // 滚动加载更多消息
        const userId = this.$store.getters.loggedUser.userId;
        let type;
        let msg;
        switch (this.msgType) {
          case 1 :
            type = 'sub';
            msg = 'userMsgs';
            break;
          case 2 :
            type = 'sys';
            msg = 'userMsgs';
            break;
          case 3 :
            type = 'sent';
            msg = 'userComments';
            break;
          case 4 :
            type = 'received';
            msg = 'userComments';
            break;
        }
        const params = {pageNo, $state, type, userId};
        this.$store.dispatch(msg, params);
      }
    }
  }
</script>

<style>
  p img {
    max-width: 25%;
  }
</style>
