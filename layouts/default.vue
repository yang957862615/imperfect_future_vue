<template>
  <div>
    <keep-alive>
      <Header></Header>
    </keep-alive>
    <!---->
    <keep-alive>
      <nuxt/>
    </keep-alive>
    <!---->
    <!--<Footer></Footer>-->
    <vm-back-top :duration="500"></vm-back-top>
  </div>
</template>

<script>
  import Header from '~/components/layout/Header.vue'
  import Footer from '~/components/layout/Footer.vue'
  import {getToken} from '~/utils/auth.js'

  export default {
    head: {},
    components: {
      Header,
      Footer
    },
  }
</script>
