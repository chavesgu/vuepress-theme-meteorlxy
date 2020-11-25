---
category: axios
tags:
  - vue
  - axios
date: 2019-03-06
title: Axios封装api
meta:
  -
    name: description
    content: vue axios
  -
    name: keywords
    content: vue axios
vssue-title: vue-axios
---

本文涉及到`axios`,`vuex`,`vuex/modules`并且没有覆盖所有的项目情况,如果不符合你的技术栈，还请随便看看。

<!-- more -->
如果不愿意看作者扯淡，可以看[github上的demo(typescript)](https://github.com/chavesgu/myBlog-ts)。

另外，这个demo是使用了`vue-cli@3.0`，`ts`和`class`写的，如果不熟悉语法的，还请担待。本文章的语法会依然使用js。

> 不建议在vue中使用ts，目前还没有完全兼容，组件中使用vuex的action也会丢失类型监测等等，感觉ts的语法相比eslint的检测更适合团队。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

# Axios
首先先封装需要使用的请求api
```javascript
//-- src/utils/api.js

import Axios from 'axios';
import qs from 'qs';
import store from '../store/'  //-- src/store/index.js
import Vue from 'vue'
import router from '../router/'
import myCookie from './cookie'    
//-- src/utils/cookie.js   这里使用的是mdn网站的cookie封装,附上链接
// https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework

//create方法会创建一个新的axios实例，并继承axios几乎所有属性,配置和方法
//建议使用 create 方法封装 api ，不对 axios 本身做特殊配置
const api = Axios.create({
    //传参是一个对象，配置包含baseUrl，timeout等等，既可以在这里传进去，也可以在实例化后设置配置
    
    baseURL: process.env.NODE_ENV==="development"?'/api':'https://example.domain',
    // 设置通用url，使用请求的方法时，就可以省略这个url
    // 可以通过process.env.NODE_ENV判断是否开发环境，来决定是否使用代理url
    // 代理是用来解决跨域的。。
    
    headers: {
        //这个配置不用说了吧。默认携带请求头，
        //有的后台更喜欢让前端把session_id放在header里发送
    },
    
    transformRequest: [function (data, headers) {
        // 此处是格式化发请求时，需要发送的数据格式
        // 某些后台在处理数据时不识别默认的 payload
        // 此处用第三方模块qs 转换成 兼容较好的 form-data(x-www-form-urlencoded)
        return qs.stringify(data);
    }],
    
    timeout: 10000,//超时，超出这时间，就会Promise.reject()，单位ms
    
    withCredentials: true,
    // 允许浏览器端在发请求时，携带cookie一起发送，
    // 某些后台语言会把session_id放在cookie里返回给前端
    // 如果这时不允许发送cookie的话  那么后台会判断是另一个浏览器在登录操作。
    // 我都是在实例化后 配置这个属性 因为我偶尔出现在这里传参配置会无效。
    // 设置这个属性为true后 ，后台不可以把允许跨域设置为'*'，必须指定ip或域名
    
    proxy:{}//axios的代理我没用过，不过看了下源码，也是开发环境才可以使用
});

//现在这里再给实例化后的api 配置拦截  不是axios本身
//添加请求拦截器
api.interceptors.request.use(config => {
  //在发送请求之前做某事，比如说 设置loading动画显示
  store.commit('loadingStart');
  //此处我是把全局loading动画的控制放在vuex的，所以引入了store
  return config
}, error => {
  //请求错误时做些事
  return Promise.reject(error)
});
//添加响应拦截器
api.interceptors.response.use(response => {
  //对响应数据做些事，比如说把loading动画关掉
  store.commit('loadingOver');
  return response.data
  //此处我直接返回res.data,方不方便你们应该有点b数的
}, error => {
  //请求错误时做些事
  // error.response.status是后台响应请求的状态码
  // 可以根据自己项目的需求  执行操作
  if (error.response.status===401){
  //这里引入vue是因为要使用挂载在vue原型上的element-ui的弹窗组件
  // 因为这时挂载vue原型上的方法，这个import的vue并没有实例化，无法省略prototype
    Vue.prototype.$alert(error.response.data.msg,{
      type:error.response.data.type,
      title:'Message',
    }).then(()=>{
      myCookie.removeItem('user');
      router.push({name:'SignIn'});//这里就是引入router的目的
      console.clear();
    })
  }
  store.commit('loadingOver');//关闭动画
  return Promise.reject(error)
});

api.defaults.withCredentials = true;
// 允许发送cookie，根据自己的项目需求是否需要开启
// axios的更多配置可以看官方的文档 github的 readme.md
// https://github.com/axios/axios   

export default api
```
至此，一个简单常用的api的配置部分封装完成

这里提一下`proxy`的使用，好多人出过错。
```javascript
// https://github.com/chimurai/http-proxy-middleware
'/api':{
    target:'http://example.domain',
    changeOrigin: true, //是否需要虚拟站点，我也不懂啥意思。。好像写不写差不多
    pathRewrite:{
        //这个属性，是看后台接口的请求url中是否有你配置的这个api
        //如果有的话你就不用写这个属性，
        //如果没有，你就需要写
        '^api':'',//把你本地请求的url中的api字段去掉
    }
}

//以上的配置效果是
//--  /api/xxx --->>>  http://example.domain/xxx
// 如果不写pathRewrite
//--  /api/xxx --->>>  http://example.domain/api/xxx
```
> 当项目中需要多个url时，再建一个文件，再create一个实例就可以,使用哪个就引入哪个，分开维护，很方便。

# Service

这里我们封装完api的url和请求配置部分，下面就要封装具体的请求。这里我定义为`services`

```javascript
//-- src/services/user.js  这里可以把请求整理成模块，如果请求接口较多，后期维护方便

import api from '../utils/api'

// 参数是es6的解构，小白自己去看 阮老师 的 es6 
// USER_REGISTER声明为一个方法
export const USER_REGISTER = ({user,password,email,phone,code}) => {
  return api.post('/register',{//此处 post '/register' ===>>  baseURL+'/register'
    user,password,email,phone,code
    // es6 对象的键值对字符相同时的写法
  })
};//注册接口

export const USER_LOGIN = ({user,password}) => {
  return api.post('/signIn',{user,password});
};//登录接口

// 我这里导出的是多个方法名的集合，是一个对象，
// 可以通过 import { USER_LOGIN，USER_REGISTER } from '...' 使用
// 这里就举例 2个  不详细写了
```
> 这里提一下，很多小伙伴对axios的使用文档不熟悉，在get和post时,经常出现2个方法的混肴，传参出错，建议对不熟悉语法的，不要使用‘省略式’的写法，下面可以看一下详细写法，可以减少出错率。（其实就是官方文档的。）

```javascript
axios({
    url:'...',
    method:'...',
    headers:{},
    params:{},//这个是get携带请求参数用的，拼接在url的，直接写在url上也可以，
    data:{},// 这个是post put patch请求发送的数据
})
```
# Vuex
现在我们已经封装完成完整的api了，如果觉得没必要使用vuex，可以直接引入`services`的`user.js`直接使用了。
```javascript
import { USER_LOGIN } from '@/services/user'

USER_LOGIN({user,password}).then().catch()
```
**为什么要用加入vuex,vuex的`action`是用来处理异步操作的，同时vuex的`state`是整个项目组件之间数据流动的重要环节，多数数据会在组件之间通用，将api请求放在`action`中可以更合理的读写`state`,不多说，上代码。**

个人习惯，一用vuex就喜欢直接使用模块(namespaced),这里推荐vuex多使用模块，在团队开发中提供很大的便利，[右转vuex官网](https://vuex.vuejs.org/zh/guide/modules.html)。

```javascript
//-- src/store/modules/user/action.js
import { USER_INFO } from '@/services/user'

export default {
    async getInfo({ commit }){
        try{ //请求成功
            const data = await USER_INFO();
            commit('setUserInfo',data);
            //模块的action中使用commit,不需要使用namespace前缀
            return data
            // async函数的返回值，默认会以promise.resolve(data)的形式
        }catch(e){
        //请求失败或者代码块出错
            return e
        }
        
    }
}
//合理使用 async/await 可以让逻辑代码更清晰
```
```javascript
//--- src/store/modules/user/commit.js
export default {
    setUserInfo(state,data){
        state.info = data
    }
}
```
```html
<!-- 此处假设已经调用getInfo请求 -->
<template>
    <div>
        <p>{{info.name}}</p>
        <p>{{info.age}}</p>
        <img :src="info.photo" />
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default{
    //...
    computed:{
        //需要使用模块中数据时，第一个参数为模块名
        ...mapState('user',{
            info:'info'
        })
    }
}
</script>
```
> tips:懂得分享才能走的更远。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**