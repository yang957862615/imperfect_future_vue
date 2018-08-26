<template>
  <div>
    <nuxt/>
    <Footer></Footer>
  </div>
</template>

<script>
  import Footer from '~/components/layout/Footer.vue'

  export default {
    name: 'empty',
    components: {
      Footer
    }
  }
</script>
