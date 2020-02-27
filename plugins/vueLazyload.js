// 全局注册
// import with ES6
import Vue from 'vue';
import VueLazyload from 'vue-lazyload';
import loading from '../assets/img/loading3.gif';
import errorSvg from '../assets/svg/Error.svg';

Vue.use(VueLazyload, {
	preLoad: 1.3,
	error: errorSvg,
	loading: loading,
	attempt: 1
});
