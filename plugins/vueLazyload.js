// 全局注册
// import with ES6
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'
import loading from '../assets/img/loading4.gif'
import error from '../assets/img/error.png'
import errorSvg from '../assets/svg/Error.svg'

Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: errorSvg,
  loading: loading,
  attempt: 1
});
