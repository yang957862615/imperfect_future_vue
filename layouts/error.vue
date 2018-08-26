<template>
  <div id="body">
    <div class="container pb-5">
      <div class="row pad-top text-center">
        <div class="col-md-6 offset-md-3 text-center">
          <h1> What have you done? </h1>
          <h5> Now Go Back Using Below LInk</h5>
          <span id="error-link">
            <v-countup :start-value="1" :end-value="errorStatus"></v-countup>
          </span>
          <h2 style="font-size: 2rem;"> {{error.message}} </h2>
        </div>
      </div>
      <div class="row text-center">
        <div class="col-md-8 offset-md-2">
          <h1 class="mb-5 mt-5"><i class="fa fa-grav"></i></h1>
          <nuxt-link to="/" class="btn btn-primary">回到主页</nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    head() {
      return {
        title: `ERROR ${this.error.statusCode} | ${this.error.message}`
      }
    },
    data() {
      return {}
    },
    layout: 'empty',
    name: "error",
    props: ['error'],
    computed: {
      errorStatus() {
        console.log('this.error:', this.error);
        if (!/^[0-9]+$/.test(this.error.statusCode)) {
          return Number(400);
        }
        return this.error.statusCode;
      }
    }
  }
</script>

<style scoped>
  h1, h5, h2, a {
    font-family: "Microsoft Sans Serif";
  }

  #body {
    background-color: #B396FF !important;
    color: #fff;
  }

  .pad-top {
    padding-top: 60px;
  }

  .text-center {
    text-align: center;
  }

  #error-link {
    font-size: 150px;
    padding: 10px;
  }

</style>
