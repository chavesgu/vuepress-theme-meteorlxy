import Iconfont from '@theme/components/Iconfont.vue'

// const head = document.querySelector('head')
// const ie = document.createComment('[if IE]> <script>window.location.href = "https://www.chavesgu.com/browser.html";</script> <![endif]')
// head.appendChild(ie)

export default ({ Vue }) => {
  Vue.component('Iconfont', {
    functional: true,

    /* eslint-disable-next-line vue/require-render-return */
    render (h, { parent }) {
      if (parent._isMounted) {
        return h(Iconfont)
      } else {
        parent.$once('hook:mounted', () => {
          parent.$forceUpdate()
        })
      }
    },
  })
}
