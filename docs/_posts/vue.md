---
category: vue
tags:
  - vue
date: 2019-03-06
title: Vue的使用总结和技巧
meta:
  -
    name: description
    content: vue
  -
    name: keywords
    content: vue
vssue-title: Vue
---

> 这篇文章主要是宏观总结，如果有哪部分知识需要另外单独讲解，根据留言会另外发布。

<!-- more -->

[Vue-router详细讲解](https://juejin.im/post/5b5a7780f265da0f455a10d3)

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

## 起步
当然是尤大的[官网](https://cn.vuejs.org/v2/guide/index.html)入手了,许多刚学框架的新手都喜欢从网上找视频教程，例如慕课网这种，本人不建议这种学习方法，因为视频的作者会让你跟着他的思维去写一套他的风格的代码，这是一个细思极恐的事情。

其实vuejs官网的东西是非常丰富的，并且我认为需要加入浏览器书签，是需要不间断的重复看的，因为会更新新的文档，不经常留意官网，可能就会漏掉新的语法糖，开发体验应该是每个开发者都需要的。

## 项目的开始
建议直接上`vue-cli`脚手架，从一开始就进入模块化编程的思想。
> 虽然我也说不出什么是模块化编程，好像就是那么回事吧。

`vue-cli@2+`老掉牙的操作我就不提了，全局安装脚手架，再用脚手架的cmd命令去拉取webpack模板。
> 这里提一下，可以自己去官方的[github](https://github.com/vuejs-templates/webpack)去fork下来，然后自己定义一个喜欢的模板，比如加入`vuex`等等，具体操作自行搜索。

我在上个礼拜也体验了`vue-cli@3.0`，目前还没正式发布，不过已经可以使用了，这个我也不多讲了，咱们掘金也有相关文章。
> 友情链接 `vue.config.js`相关配置 [config.md](https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli/config.md)

## 实操
### 1、Vue
`vue`的语法不多说了，无非就是`template`,`script`,`style`,建议根据尤大的[语法规范](https://cn.vuejs.org/v2/style-guide/)去书写。

`eslint`一个强制规范编码的插件，不建议使用，经常出现莫名其妙的错误，公司内部可以自己定义一套规范，并且文档整理，也是个不错的选择。

#### --------------- 总结和技巧 -----------------
```html
<template>
    <div :style="{color:$options.filters.txtToColor(msg)}"></div>
    <!-- 行内filter -->
</template>
```
```javascript
import { txtToColor } from '/path/to/filters.js'
export default {
    name:'a',
    data(){
        return{
            msg:123,
            obj:{
                msg:321
            }
        }
    },
    filters:{
        txtToColor
    },
    watch:{
        'obj.msg'(newV,oldV){ //监听对象里的属性
            
        }
    }
}
```
```css
<style lang="less/sass/stylus...">
</style>
```

### 2、Vue-router
`router`第一次接触这个词的小萌新可能一脸懵逼，因为`jquery`已经写习惯了。

因为`vue`是单页面应用，`router`其实就是把以前的`domain.com/a.html`,`domain.com/b.html`多页面整合为多路径管理多个模块。

#### --------------- 总结和技巧 -----------------

```javascript
//router.js
import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);

const router = new Router({
    //此处可以利用node环境变量来设置打包后项目放在服务器某个目录后，路由的根路径配置
    base: process.env.NODE_ENV==='development'?'/':'/some/dir/',
    //...routes
});
//很多人把beforeEach写到main.js
router.beforeEach((from,to,next)=>{
    //...某些拦截操作，是否登录权限等
    next()
});
export default router
```
每一层子路由，就需要多一层`router-view`，如果只是希望浏览器的url作为语义，可以使用`alias`
```javascript
//router.js
const router = new Router({
    routes:[
        {
            path:'/b',
            component:B,
            alias:'/a/c'//这样当路径为/a/c时  页面显示为B，router-view也会对应根路由
            //别名只能通过path跳转
        },
        {
            path:'/a',
            component:A,
            children:[
                {
                    path:'c',//这里要注意  空配置要写在后面。
                    //因为路由匹配到规则后就不会继续匹配了
                }
            ]
        }
    ]
})
```
#### 路由懒加载
原理就是将需要懒加载的路由通过`webpack`分开打包，切换至对应路由时，才开始加载js文件，可以实现首页加载速度，但是整体项目体积会变大。
```javascript
//router.js
const router = new Router({
    routes:[
        {
            path:'/a',
            component:()=>import('path/to/A.vue')
        }
    ]
})
```
```js
//package.json
"devDependencies":{
    //...
    "babel-plugin-syntax-dynamic-import": "^6.18.0"
    //...
}
```
```js
//.babelrc
"plugins":["syntax-dynamic-import"]
```
### 3、Vuex
`vuex`一个状态(数据)管理官方插件，高效管理全局数据，并且注入vue实例，让所有组件可以轻松读写全局数据，让所有组件直接共享状态完成通信。
#### --------------- 总结和技巧 -----------------
```javascript
//store.js
import Vue from 'vue';
import Vuex from 'vuex';
import moduleA from '/path/to/moduleA.js'
Vue.use(Vuex);

const store = new Vuex.Store({
    strict:process.env.NODE_ENV==="development",//开发环境开启严格模式
    state:{
        test:666
    },
    getters:{
        
    },
    mutations:{
        testCommit(state,opt){
            
        }
    },
    actions:{
        testAction({commit}){
            
        }
    },
    modules:{
        moduleA
    }
})

```
```javascript
//moduleA.js
export default {
    namespaced:true,//vuex模块化 模块名前缀
    state:{
        test:666
    },
    getters:{
        
    },
    mutations:{
        testCommit(state,opt){
            
        }
    },
    actions:{
        testAction({commit,state,rootState,rootGetter}){
            
        }
    }
}
```
```javascript
//***.vue
import {mapState,mapAction,mapMutation} from 'vuex'
//将vuex的方法注入到组件中，使用更方便
export default {
    computed:{
        ...mapState('moduleA',{
            test1:'test'
        }),
        ...mapState({//vuex的根状态
            test2:'test'
        })
    },
    method:{
        ...mapMutation('moduleA',{
            testCommit1:"testCommit"
        }),
        ...mapMutation({
            testCommit2:"testCommit"
        })
        ...mapAction('moduleA',{
            testAction1:"testAction"
        }),
        ...mapAction({
            testAction2:"testAction"
        })
    },
    mounted(){
        this.testCommit1();//===this.$store.commit('moduleA/testCommit')
        this.testCommit2();//===this.$store.commit('testCommit')
        this.testAction1();//===this.$store.dispatch('moduleA/testAction')
        this.testAction2();//===this.$store.dispatch('testAction')
    }
}
```
### 4、Components
> 这一段讲一讲父子组件那些事

假设手写了个custom-btn组件,在父组件如何监听这个子组件的点击。这里不讲`slot`了
```html
<!--parent.vue-->
<template>
    <custom-btn @click="some-fn"/>
</template>

<script>
import custom-btn from 'path/to/custom-btn.vue';
export default{
    components:{
        custom-btn
    }
}
</script>
```
```html
<!--custom-btn.vue-->
<template>
    <button @click="$emit('click')"></button>
</template>

<script>
export default{
    name:'custom-btn'
}
</script>
```
只有在子组件`emit`了`click`，在父组件才能响应`click`，这个`click`可以自定义名字。
也可以在emit时，携带参数，实现父子组件传值。
> router-link是个内置组件，由于没有emit，所以是不能响应click的，但是可以通过@click.native来为组件内的dom元素绑定click。

#### 组件的缓存
一部分组件，包括路由，在业务需求上是需要缓存的，例如某个弹窗组件打开时，里面有选项已经勾选了，需要临时关闭弹窗但是又不希望再次打开重新渲染，这个时候就需要使用`keep-alive`

```html
<template>
    <keep-alive>
        <custom-dialog></custom-dialog>
    </keep-alive>
</template>
```
这个时候组件已经不会重新渲染，内部的常用钩子函数也不会执行，只有利用专用的2个钩子去处理缓存的组件逻辑。
```html
<!--custom-dialog.vue -->
<script>
export default{
    activated(){
        //唤醒时
    },
    deactivated(){
        //睡眠时
    }
}
</script>
```
这个属于小场景，当然也有可能出现大场景，就是某个路由页面全部缓存下来，这里就有丶东西了，因为路由的渲染都是在`router-view`,他是个动态的，同级的路由都会渲染在这个位置，这里就要动态缓存了。
```html
<template>
    <keep-alive :include="[]"><!-- 这个数组里写需要缓存路由的.vue文件的name -->
        <router-view />
    </keep-alive>
</template>
```
> 请保持每个文件的`name`唯一

### 5、API
推荐大家可以刷几遍vue的[api](https://cn.vuejs.org/v2/api/)，
很多人看官方文档会漏掉这一页
### 6、Webpack
前面讲到`router`的`base`可以配置部署服务器后，非根目录的情况，同样webpack也需要配置项目资源的根路径
```javascript
//config/index.js
module.exports = {
    build:{
        assetsPublicPath:'some/dir/'，
        productionSourceMap：false
        //打包不生成map文件，有效减小打包体积，并且别人看不到你的源码
    }
}
```
默认的dev配置为`localhost:8080`,可以利用`ip`这个node包，让同事可以访问你正在跑的项目
```javascript
//config/index.js
const ip = require('ip').address();
//...
module.exports = {
    dev:{
        host: ip,
    }
}
```
这里还涉及到一个配置，可以通过代理进行`跨域`，仅限开发环境，生产环境可以通过nginx实现，自行搜索。
```javascript
//config/index.js
module.exports = {
    proxyTable:{
        '/api':{//当有/api/...路径时，解析为下面的域名
            target: 'https://domain.com',//代理此域名
            changeOrigin: true,
            pathRewrite: { //当前解析为domain.com/api/...
              '^/api': '' //如有需求，可以将api/去掉,此处为domain.com/...
            }
      }
    }
}
```
#### scss拓展
> less等其他语言自行搜索

通过webpack实现`.vue`单文件可访问全局scss变量,需要安装`sass-resources-loader`包
```js
//  build/utils.js  60行左右
// https://vue-loader.vuejs.org/en/configurations/extract-css.html
return {
    //...
    scss: generateLoaders('sass').concat({
      loader: 'sass-resources-loader',
      options: {
        resources: path.resolve(__dirname,'../src/assets/theme/index.scss')
        //这里按照你的文件路径填写
        //这里可以理解为将此文件的变量广播全局,.vue文件可以使用这个文件中的变量
        //多个文件可以写成数组
        //详细文档可看 https://github.com/shakacode/sass-resources-loader
      }
    }),
    //...
}
```
> 其余配置文件不建议修改,如果对webpack非常熟练，可以随意玩耍。
### 7、常用node包

1. `@tweenjs/tween.js` 一个js动画库
2. `axios` 支持promise的http库
3. `qs` 数据格式转换插件，配合axios使用
4. `crypto-js` 各种加密，没什么实际安全作用
5. `prismjs` 语法高亮插件
6. `vue-lazyload` 图片懒加载，功能很全
7. `vue-meta` 组件中动态修改head标签里面的内容
8. `babel-plugin-equire` echarts按需加载插件，优化写法，默认会携带指定版本的echarts，建议自行安装需要的版本覆盖
9. `webpack-bundle-analyzer` 打包完成后显示体积相关信息，可以了解是否重复加载,哪些文件过大等

### 8、dev/build出现javascript out of memory解决方案
```js
//package.json
"scripts": {
    "dev": "node --max_old_space_size=4096 node_modules/webpack-dev-server/bin/webpack-dev-server.js --inline --progress --config build/webpack.dev.conf.js",
    "build": "node --max_old_space_size=4096 build/build.js"
},
```

## 最后
其实这篇文章分享的东西并不多，因为我写文章并没有什么准备，随性写写，欢迎指正错误，
有不懂得可以留言，会发布更详细的讲解。(感觉自己很装b啊，其实我也是菜鸟)

> 分享几个链接

1. 我的个人github:[**https://github.com/chavesgu**](https://github.com/chavesgu),自己没写什么牛逼的东西，但是可以看看我star的东西
2. 自己瞎写的[lavas](https://lavas.baidu.com)项目:[**http://lavas.chavesgu.com**](http://lavas.chavesgu.com)
3. 自己瞎写的网站[**https://www.chavesgu.com**](https://www.chavesgu.com),(vue+nodejs+mysql)


> tips: 懂得分享，才会走的越来越远。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

