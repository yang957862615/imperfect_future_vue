const path = require('path');
const webpack = require('webpack');
const apiConfig = require('./api.config');
const isProdMode = Object.is(process.env.NODE_ENV, 'prod');

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'IMPERFECT FUTURE',
    htmlAttrs: {
      xmlns: 'http://www.w3.org/1999/xhtml',
      lang: 'zh'
    },
    cache: {
      max: 100,
      maxAge: 1000 * 60 * 15
    },
    meta: [
      {charset: 'utf-8'},
      {
        name: 'viewport',
        content: 'target-densitydpi=device-dpi, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
      },
      {name: 'http-equiv', content: 'http-equiv=X-UA-Compatible,content=IE=edge'},
      {hid: 'description', name: 'description', content: 'IMPERFECT FUTURE'},
      {hid: 'keywords', name: 'keywords', content: 'IMPERFECT,FUTURE,joegreens,joe green,帅帅',},
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
      {rel: 'stylesheet', href: 'https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css'},
      {rel: 'stylesheet', href: 'https://cdn.bootcss.com/animate.css/3.5.2/animate.css'},
      {rel: 'stylesheet', href: 'https://cdn.bootcss.com/layer/3.1.0/theme/default/layer.css'}
    ],
    script: [
      {src: 'https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js'},
      {src: 'https://cdn.bootcss.com/bootstrap/4.0.0/js/bootstrap.min.js'},
      {src: 'https://cdn.bootcss.com/layer/3.1.0/layer.js'}
    ]
  },
  css: [
    '~/assets/css/bootstrap4.0_materia.css',
    '~/assets/css/future.css',
    '~/assets/css/github-markdown.min.css'
  ],
  render: {
    bundleRenderer: {
      shouldPreload: (file, type) => {
        return ['script', 'style', 'font'].includes(type)
      }
    }
  },
  router: {
    /*中间件*/
    middleware: 'check-auth'
  },
  /*
  ** Customize the progress bar color
  */
  loading: {
    color: '#3aff00',
    height: '3px'
  },
  /*
  ** Build configuration
  */
  build: {
    filenames: {
      vendor: 'vendor.[hash].js',
      app: 'app.[chunkhash].js'
    },
    /*
    ** Run ESLint on save
    */
    extend(config, {isDev, isClient}) {
      // 为 客户端打包 进行扩展配置
      if (isClient) {
        config.devtool = 'eval-source-map'
      }
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    },
    vendor: [
      'axios',
      'mavon-editor',
      'vue-lazyload',
      'vue-infinite-loading',
      'vue-countupjs',
      'vue-multiple-back-top'
    ],
    // 下面这一句导致了很大问题 一直报错webpackJsonp is not defined
    // maxChunkSize: 350000,
    // 为 JS 和 Vue 文件定制 babel 配置。https://nuxtjs.org/api/configuration-build/#analyze
    babel: {
      presets: ['es2015', 'stage-2'],
      plugins: [
        'transform-async-to-generator',
        'transform-runtime'
      ],
      comments: true
    },
  },
  dev: isProdMode,
  env: {
    baseUrl: apiConfig.baseURL
  },
  plugins: [
    {src: '~/plugins/mavonEditor.js', ssr: false},
    {src: '~/plugins/vueLazyload.js', ssr: false},
    {src: '~/plugins/CountUp.js', ssr: false},
    {src: '~/plugins/backTop.js', ssr: false}
  ]
};
