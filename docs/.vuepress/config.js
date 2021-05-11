const path = require('path')

module.exports = {
  title: 'Chaves 顾',

  description: "chavesgu's blog",

  head: [
    ['link', { rel: 'icon', href: '//cdn.chavesgu.com/title.ico' }],
    ['script', { id: 'ie' }, `
        if (!+[1,]) window.location.href = "https://www.chavesgu.com/browser.html"
    `],
  ],
  port: 8888,

  locales: {
    '/': {
      lang: 'en-US',
    },
  },

  evergreen: true,

  plugins: [
    ['@vuepress/google-analytics', {
      ga: 'UA-135380140-1',
    }],
    ['@vuepress/pwa', {
      serviceWorker: true,
      updatePopup: true,
    }],
  ],

  chainWebpack: (config, isServer) => {
    if (isServer === false) {
      config.optimization.splitChunks({
        maxInitialRequests: 5,
        cacheGroups: {
          vue: {
            test: /[\\/]node_modules[\\/](vue|vue-router|vssue)[\\/]/,
            name: 'vendor.vue',
            chunks: 'all',
          },
          commons: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name: 'vendor.commons',
            chunks: 'all',
          },
        },
      })
    }
  },

  theme: path.resolve(__dirname, '../../lib'),

  themeConfig: {
    lang: 'en-US',

    personalInfo: {
      nickname: 'chavesgu',
      description: '😊',
      email: 'mail@chavesgu.com',
      location: 'ShangHai, China',

      avatar: '//cdn.chavesgu.com/avatar.jpg',

      sns: {
        github: {
          account: 'chavesgu',
          link: 'https://github.com/chavesgu',
        },
        juejin: {
          account: 'chavesgu',
          link: 'https://juejin.im/user/5a98dece6fb9a028bd4bc12b',
        },
        linkedin: {
          account: 'chavesgu',
          link: 'http://www.linkedin.com/in/chavesgu',
        },
      },
    },

    header: {
      background: {
        // url: '/assets/img/header-image-01.jpg',
        useGeo: true,
      },
      showTitle: true,
    },

    footer: {
      poweredBy: false,
      poweredByTheme: false,
      custom: '<a href="http://beian.miit.gov.cn/" target="_blank">沪ICP备17017527号-1</a>',
    },

    infoCard: {
      headerBackground: {
        // url: '/assets/img/header-image-01.jpg',
        useGeo: true,
      },
    },

    lastUpdated: true,

    nav: [
      { text: 'Home', link: '/', exact: true },
      { text: 'Posts', link: '/posts/', exact: false },
      { text: 'About', link: '/about/', exact: true },
      { text: 'Github', link: 'https://github.com/chavesgu' },
    ],

    // Enable smooth scrolling or not
    smoothScroll: true,

    // Configs for vuepress-plugin-zooming
    zooming: {
      // @see https://vuepress.github.io/en/plugins/zooming
    },

    comments: {
      owner: 'chavesgu',
      repo: 'comments',
      clientId: '9c96f9376fc9b51a3447',
      clientSecret: '7174be2255902f43a34d13c5a3d04c49c0acb2b7',
      labels: ['comments'],
      autoCreateIssue: false,
    },

    pagination: {
      perPage: 6,
    },
  },
}
