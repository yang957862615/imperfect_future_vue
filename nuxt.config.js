import baseUrl from './api.config'

module.exports = {
    /*
    ** Headers of the page
    */
    head: {
        title: 'IMPERFECT FUTURE',
        meta: [
            {charset: 'utf-8'},
            {
                name: 'viewport',
                content: 'initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no'
            },
        ],
        link: [
            {rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'},
            {rel: 'stylesheet', href: 'https://lib.baomitu.com/font-awesome/4.7.0/css/font-awesome.css'},
            {rel: 'stylesheet', href: 'https://lib.baomitu.com/animate.css/3.7.0/animate.css'},
            {rel: 'stylesheet', href: 'https://lib.baomitu.com/layer/3.1.1/theme/default/layer.css'}
        ],
        script: [
            {src: 'https://lib.baomitu.com/jquery/3.3.1/jquery.js'},
            {src: 'https://lib.baomitu.com/twitter-bootstrap/4.0.0/js/bootstrap.js'},
            {src: 'https://lib.baomitu.com/layer/3.1.1/layer.js'}
        ]
    },
    css: [
        '~/assets/css/bootstrap4.0_materia.css',
        '~/assets/css/future.css',
        '~/assets/css/github-markdown.min.css'
    ],
    modules: [
        '@nuxtjs/axios',
    ],
    axios: {
        baseURL: baseUrl.apiBaseURL
    },
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
    env: {
        baseUrl: baseUrl.apiBaseURL
    },
    plugins: [
        {src: '~/plugins/mavonEditor.js', ssr: false},
        {src: '~/plugins/vueLazyload.js', ssr: false},
        {src: '~/plugins/CountUp.js', ssr: false},
        {src: '~/plugins/backTop.js', ssr: false},
        {src: '~/plugins/vueImageCropper.js', ssr: false},
        {src: '~/plugins/infiniteLoading.js', ssr: false},
        '~/plugins/axios'
    ]
};
