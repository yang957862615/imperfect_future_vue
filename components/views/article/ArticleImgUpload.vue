<template>
  <div class="row">
    <div class="col">
      <div class="select_cover_btn">
        <button
          class=""
          @click="chooseFile"
        >
          <div class="btnInfo">
            <i class="fa fa-upload mr-4"></i>
            <span>{{uploadText}}</span>
          </div>
        </button>
      </div>
      <!--美化后不用显示，点击上面按钮直接调用file的click事件即可。-->
      <input
        type="file"
        id="upload"
        class="invisible"
        accept="image/png,image/gif,image/jpeg"
        @change="uploadFile"
      >
    </div>
    <div class="mb-2 mb-0" style="margin-top: -24px" v-show="coverSrc">
      <div class="col" style="max-height: 100%">
        <img class="justify-content-center" :src="coverSrc" alt="封面图" style="max-height: 100%;max-width: 100%;">
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ArticleImgUpload",
    props: {
      coverSrc: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        uploadText: '请选择封面'
      }
    },
    methods: {
      chooseFile() { // 调用上传图片事件
        document.getElementById("upload").click();
      },
      uploadFile(e) { // 调用父组件上传文件事件
        this.$emit('uploadCover', e.target.files[0]);
        e.target.value = '';
      }
    },
    watch: {
      // 监听如果图片url传进来就改变文字
      coverSrc() {
        this.uploadText = '更换封面图片';
      }
    }
  }
</script>

<style scoped>

</style>
