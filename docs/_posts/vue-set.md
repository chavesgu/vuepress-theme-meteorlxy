---
category: vue
tags:
  - vue
date: 2019-05-16
title: Vue.set的使用
meta:
  -
    name: description
    content: Vue.set
  -
    name: keywords
    content: Vue.set
vssue-title: Vue.set
---

### 前言
😊我活的好累，工作8小时并且非工作时间并不想碰代码的我还是利用上班的空闲编一篇文章。

> 推荐有兴趣的开发者可以参加6月份Vue.js的[分享会](https://vue.w3ctech.com/)

<!-- more -->

### 场景
一般想到这个api的开发者，都是遇到明明更改了数据，然而浏览器的dom却没有更新新的数据，有时候会出现操作一下其他数据，之前更新的数据才渲染到dom，有时候不管怎么操作都不会更新，这种类似的bug一直让很多开发者苦恼。

### Vue.set
首先让我们看看尤大的[文档](https://cn.vuejs.org/v2/api/#Vue-set)。

> 每个组件都是继承了vue的原型，所以组件实例化后会在`this`上挂载一个`$set`方法，和`Vue.set`是一样的。

> 向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。

文档写的很明白，向响应式对象中添加一个响应式属性，那么出现无法更新视图(dom)的情况，不就是说明视图所绑定的属性值并不是响应式么。

### 案例
#### 例一:
```vue
<!-- demo.vue -->
<template>
  <div class="demo">
    <input v-model="obj.value1" />
    <input v-model="obj.value2" />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        obj: {}
      }
    }
  }
</script>
```
如上代码，当一个组件中有多个input标签，并且v-model绑定多个值时，且这些值都是**某一个对象中动态出现的属性**，这种情况下，如果单纯的赋值,
```js
// 错误赋值
export default {
  methods: {
    fn() {
      getData().then(res => {
        this.obj[res.key] = res.value;
      })
    }
  }
}
```
这种情况下，你会在`devtools`中看到，数据的确赋值成功了，然而input无法更新视图，并且可能你无法在这个input内输入任何内容了，这时`this.obj`里面的键都不是响应式的，那么`this.$set`方法该出场了。
```js
// 正确姿势
export default {
  methods: {
    fn() {
      getData().then(res => {
        // this.obj[res.key] = res.value;
        this.$set(this.obj, res.key, res.val);
      })
    }
  }
}
```
此时你会发现，🤩视图更新了，一切都美好了，吃的饭也更香了。

#### 例二:
有人说了，只用`this.$set`不就行了，`Vue.set`有啥用
```vue
<!-- demo.vue -->
<template>
  <div class="demo">
    <input v-model="obj.value1" />
    <input v-model="obj.value2" />
  </div>
</template>

<script>
  import { mapState } from 'vuex';
  export default {
    computed: {
      ...mapState(['obj']),
    }
  }
</script>
```
此时obj是一个vuex的状态，这个obj可能是其他组件或者页面的，此时`Vue.set`就出场了。
```js
// 某个mutation😊
import Vue from 'vue';
export default {
  updateObj(state, { key, value }) {
    // state.obj[key] = value;  这是错误的赋值
    Vue.set(state.obj, key, value);
  }
}
```

### It's over
一切vue技术栈的bug和疑问都可以来问我
> **欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**