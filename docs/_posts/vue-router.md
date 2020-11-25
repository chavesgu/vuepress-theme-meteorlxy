---
category: vue-router
tags:
  - vue
  - vue-router
date: 2019-03-06
title: Vue-router的使用姿势
meta:
  -
    name: description
    content: vue vue-router
  -
    name: keywords
    content: vue vue-router
vssue-title: vue-router
---
> 虽然有很多`router`的相关文章了，但是那又怎么样，我就是要写。
<!-- more -->
**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

**其实vuejs有一个叫做动态组件的东西，效果和路由有点相似，根据需求显示不同的组件，但是在实际使用上，很小气，就给人玩不爽，没办法像路由一样编程式导航(`push`,`replace`)，也没有浏览器路径的语义引导，动态组件更适合小规模的局部tab，给大家秀一波用法**
```html
<template>
    <div>
        ul>li>tab1+tab2     @click=""  <!-- >>>此处改变下面data中的tab值就可以切换了 -->
        <!-- 此处相当于router-link效果，虽然没有浏览器的url引导，但是可以自己写面包屑 -->
        <component :is="tab"></component>  <!-- 这里就是router-view显示区了 -->
    </div>
</template>

<script>
import tab1 from 'path/to/tab1.vue' //相比vue-router要引入很多文件  麻烦
import tab2 from 'path/to/tab2.vue'
//其实vue-router也引入文件，但是在.vue文件里面引入那么多就很难看

export default {
    data(){
        tab:'tab1' //默认显示tab1
    },
    components:{
        tab1,
        tab2   //es6语法   对象中，键值相同可以这样写
    }
}
</script>
```

**我们不提动态组件了，开始router了。常用的api，官网介绍的很详细了。记得看官方教程，别忘了[官方的api](https://router.vuejs.org/zh/api/)**

## 路由的配置
不管是什么路由的配置 还是vuex的配置等等，都有相应的规范，在普通js文件，不按规范也不会怎么样，在ts文件，就会报错了。前提是有兴趣玩ts。
```javascript
//  router/index.js
// 此处省略一堆 import
const router = new Router({
    base:'/',
    mode:'history',//default-->hash
    routes:[],
    scrollBehavior:()=>{
        return {x:0,y:0}
    }
})
```
其实配置很简单，就这么一点。
### base
浏览器url的前缀，默认为`'/'`，如果设置为`'/some/'`,则运行项目，浏览器url都是`'/some/...'`,不会对静态文件的引用产生影响，一般写网站都会有域名，都可以把域名指向某个服务器目录，所以默认`'/'`即可，如果是写公司内部后台管理，那么不一定会用域名，可能就是某个ip下的某个目录，比如打包后的文件在`111.22.33.44/admin`，这个时候路由的配置匹配浏览器路径的时候，会从这个`/admin`开始算，如果base还是默认的`/`，那么路由配置的`routes`的`path`就要全部加上`/admin/`前缀，并且`router-link`和`push`方法也要加上这个`/admin`，很麻烦,但是只要设置`base`为`'/admin/'`,路由内部配置以及所有相关的方法都可以忽视服务器ip下的目录名。这种情况，同样也要配置`webpack`的`publicPath`也为`/admin/`，这里不细说了。
### mode
这个太简单了，一共三种模式，

`hash`:浏览器会有‘#’符号，参考锚点效果，缺点很丑，但是兼容性棒棒

`history`:去除‘#’符号，让url变好看，下面会讲服务端配置。

`abstract`:非浏览器环境，会强制使用这个模式,例如`weex`

**history模式服务端配置**

我个人和公司都是用`nginx`，这里就讲`nginx`，配置这个的原因是**当你进入某个路由之后，再次刷新页面时（或者是浏览器直接输入某个路由路径时）**，当刷新页面，浏览器就会重新dns解析，tcp协议，这个时候会根据浏览器的url去服务器找对应资源，当然我们`vue-router`是为单页面服务的，对应的url在服务端是肯定没有静态资源的，就会出现404，当配置了以下url重写语句，注意是重写，不是重定向，**不改变url的情况重写浏览器内容**，重写到`index.html`，因为这个`index.html`使我们项目的入口，`index.html`里面会读取当时打包好的`app.js`，就可以读取到路由配置，以实现我们浏览器的url对应的路由页面。
> `hash`模式不需要配置，因为浏览器会忽略#和？后面的参数

打包文件在根目录时，
```nginx
location / { 
  try_files $uri $uri/ /index.html;
}
```
打包文件在非根目录时，
```nginx
location /admin {
  try_files $uri $uri/ /admin/index.html;
}
```
### routes
核心路由配置，[官网](https://router.vuejs.org/zh/guide)讲的很详细，我就讲几个注意点，所有自定义的配置，例如是否需要鉴权或者对应的icon等，需要规范化的话都写在`meta`对象中，
不规范的话 ，就和`path`同级咯，随意玩，玩坏了我不背锅。

`path`是必须指定的，`name`需要唯一，不是必须。

`routes`的配置遵循顺序匹配，当url成功匹配，就不会再往下匹配，所以像`403,404`的页面应当写在最后。

`alias`别名的使用，当需要在指定`router-view`显示某个组件，并且希望浏览器url是自己想要的语义时使用

`redirect`重定向，参数可以是路径，也可以是对象(重定向到某个name),注意重定向是改变内容+改变url

### scrollBehavior
这个滚动行为，老实说，感觉很蹩脚，本人基本没有使用过，他控制的是**body**的滚动，
很多需求都是局部滚动。如果的确是需要控制body滚动，参考官方文档即可。

## 路由的使用
路由的配置一开始只有根目录`/`，每写一层`children`就要写一层`router-view`，否则组件不显示。每一个嵌套`children`的层级和`router-view`的层级都是一一对应的。
```javascript
// router/index.js
const router = new Router({
    routes:[
        {
            path:'/',   //此时配置数组的第一层级，即对应app.vue中的router-view
            component:Home,//   <<<----------------------------
            children:[//                                       |
                {   //                                         |
                    //此时第一层级出现children第二层级,------------
                    //那么在这个第二层级所属的第一层级 Home组件中，就要写一层router-view,以此类推
                    path:'user', 
                    component:User,
                }
            ]
        }
    ]
})
```
## 路由配置生成menu菜单
menu其实就是路由的导航，就是router-link，有很多小伙伴会另外建一个叫做menu.js的文件，然后模拟路由配置的结构去写一个数组，然后根据这个文件遍历生成dom，是不是有多此一举的感觉，并且当使用第三方的menu的ui组件时，这种静态文件是没有**状态** (当前访问路由的对应menu高亮，刷新页面或者输入路由的url进入页面会丢失高亮) 的。

menu有很多种情况，

1. 固定层级，比如固定2层，或者3层，一般后台管理系统，固定层级较多，因为美观，整洁。这种就比较方便了。template的dom结构也比较方便。
2. “个性”的产品经理，“定制化”的menu菜单，未知的层级，这里就要用到render函数去写dom。

**固定层级**
```html
<template>
    <div class="menu">
        <div class="first-menu" v-for="item,index in menus" :key="item.name">
            <router-link :to="item.name">{{ item.meta.zhName }}</router-link>
            <template v-if="item.children.length">
                <div class="sub-menu" v-for="subItem.subIndex in item.children"
                        :key="subItem.name">
                    <img :src="subItem.meta.icon" />
                    <router-link :to="subItem.name">
                    {{subItem.meta.zhName}}
                    </router-link>
                </div>
            </template>
        </div>
    </div>
</template>
<script>
export default {
    computed:{
        menus(){
            return this.$router.options.routes
            //获取路由配置
        }
    }
}
</script>
<style>
.router-link-active{
    /* 激活样式 */
}
</style>
```
这里我只写了2层，并且没有写样式，如果使用了像[element-ui](http://element-cn.eleme.io/#/zh-CN/component/menu)这样的menu组件,他底层没有渲染成`router-link`，那就要编程式导航了，`click`的时候，`push`到`item.name`，并且当前路由的导航样式需要根据`$route.name(当前路由配置)`来判断

**未知层级**

因为不知道是几层菜单，所以在template的html标签没办法自由的遍历，所以需要js去操作路由配置的递归,因为render函数式js操作，所以需要用render函数渲染。
```html
<script>
export default {
    computed:{
        menus(){
            return this.$router.options.routes
            //获取路由配置
        }
    },
    // 使用render函数就不需要写template标签的dom了
    render(h){ 
        //这个 h 参数，原来的语义是createElement ，这里使用 h 是方便操作，也是官方建议
        // ...... 这里是操作 menus 的递归代码,再通过render函数循环出来
        return h('div','这是一个div')
        //这里必须return 对应的语法
    }
}
</script>
```
> render函数的语法参见官方文档即可 [render函数](https://cn.vuejs.org/v2/guide/render-function.html)。

> 这里有个注意点，如果`router`做了权限控制，那么路由配置不能通过`$router.options.routes`获取，因为`addRoutes`方法不改变原先的配置，需要在`addRoutes`的同时，把完整的路由配置保存在`vuex`,再获取。权限控制不细讲了，有很多相关文章，但是不建议copy，建议加入自己的理解，没有绝对的方案。

## 路由的缓存和过渡动画
过渡动画应该都用了，一般使用`opacity`过渡一下。
```html
<template>
    <transition mode="out-in" name="fade">
        <!-- 这里如果在行内直接用$route.meta去v-if判断缓存 dom结构会变复杂 -->
        <keep-alive :include="aliveRoutes">
            <router-view :key="$route.fullPath" />
            <!-- 此处通过路由的完整路径加上key，当为动态路由时，触发路由组件重新渲染 -->
        </keep-alive>
    </transition>
    <!-- 都是些官方用法 不细说了-->
</template>
<script>
export default {
    computed:{
        aliveRoutes(){
            // this.$router.options.routes  获取路由配置
            //可以配置meta 是否缓存 根据 meta 字段  push到数组里
            return [/* ... */]
        }
    }
}
</script>
```
## 路由的钩子
官网讲的超详细的。触发顺序也讲清楚了，官方的说法叫[导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)。

**注意点:要搞清楚哪些是全局钩子，哪些是组件内的钩子。并且所有的前置钩子，需要调用next() 才会正常进入路由,在写钩子函数内部逻辑时，需要注意，不能形成死循环**

例如

```javascript
router.beforeEach((to,from,next)=>{
    if (from.name === 'login'){
        next({
            name:'login'  //死循环
        })
        //更多next回调方法可以查看官方文档
    }
})
```

组件内钩子使用情况，要看业务需求，比如动态路由↓↓↓。

## 动态路由

动态路由，使用场景是一个固定的路由视图组件，配合一个动态的浏览器url，在视图中显示不同的数据，同时希望url中有当前详情的语义，例如详情页，用户信息页。

先看下路由如何配置动态,这里用详情页举例
```javascript
// router/index.js
const router = new Router({
    routes:[
        {
            path:'/list',
            name:'list',
            component:List
        },
        {
            path:'/detail/:id',//此处id对应params.id
            name:'detail',
            component:Detail
        }
    ]
})
```
```html
<!-- List.vue -->
<template>
    <div>
        <ul>
            <li @click="goDetail(item.id)" v-for="item in someData" :key="item.id">
            </li>
        </ul>
    </div>
</template>

<script>
export default{
    methods:{
        goDetail(_id){
            this.$router.push({
                name:'detail',
                //此处注意只有通过name跳转路由，params才会生效
                //query不受影响
                params:{
                    id:_id  //此处对应routes配置的/:id
                }
            })
        }
    }
}
</script>
```
```html
<!-- Detail.vue -->

<script>
export default {
    beforeRouteEnter (to, from, next) {
        //此处为路由组件内的钩子，可以通过判断 to.params.id 是否 undefined，
        //进行一些操作，因为即使 to.params.id 是 undefined,路由也能匹配成功
        //因为这些id可能是用来获取数据的，不会在页面显示，不一定能察觉是 undefined
    }
}
</script>
```
**关于路由传参**

1. `params`就如上面动态路由所讲，只有通过路由配置的`name`跳转，才会生效，即使没有使用动态路由，也可以通过`params`传参

这里有注意点：

- 如果使用动态路由，那么在动态路由页面刷新路由，`params`参数依然存在，

- 如果没有使用动态路由，`params`参数只在跳转路由时有效，刷新页面则会丢失`params`

2. `query`参数，可以通过`path`或`name`跳转都可以传参，并且参数会和`ajax`的`get`请求一样，附加到浏览器的url上，刷新页面依然保留

## 路由的懒加载
路由组件打包单独的js，当访问路由时，加载对应js文件，加快首页加载时间，会增加项目的总体积。

1. `npm`或`yarn`安装`babel-plugin-syntax-dynamic-import`
2. `.babelrc`或`babel.config.js`配置
```javascript
module.exports = {
    plugins:["syntax-dynamic-import"]
}
```
3. 路由文件使用
```javascript
// router/index.js
const router = new Router({
    routes:[
        {
            path:'/list',
            name:'list',
            component:()=>import(/* webpackChunkName:"SOME_NAME" */'path/to/List.vue')
            //此处 import 是方法  和 es6 的 import 不一样
            //特殊注释语法 相同chunkName 打包到一个js中  可省略
        }
    ]
})
```
## 路由的命名视图
我从来没用到过命名视图，不给大家误导了，我能解释的就是命名视图的作用是一个浏览器url，匹配多个`router-view`。有需求的移步官方文档。

## 部分api

1. `.vue`文件中`this.$router`是指挂载的路由实例，可以使用`push`等方法。
2. `.vue`文件中`this.$route`当前路由信息对象，包括`path`，`query`等，只读属性。
3. `router.app`指`router`所挂载的`vue`实例，可以通过`router.app.$options.store`访问`vuex`，前提是`main.js`中,要先引入`vuex`，后引入`router`，否则报错。
4. `router.push()`常用路由跳转方法,参数为`{path?:string,name?:string,params?:object,query?:object}`,需要注意的是，`push`为方法名，与数组没有联系。
5. `router.replace()`替换当前路由，参数和`push`一致，区别是替换当前路由，即点击浏览器的返回，不会回到之前被替换的路由。
6. `router.go()`和`router.back()`，参数为整数，前进或后退几步。
7. `router.addRoutes()`参数是需要符合`routes`配置的数据，动态添加路由配置到原有配置。

## 结束

> 有疑问或者讲错的可以提出

> tips:懂得分享才能走的更远。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**