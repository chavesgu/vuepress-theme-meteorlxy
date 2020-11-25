---
category: vue
tags:
  - vue
  - component
date: 2019-03-06
title: Vue父子组件如何双向绑定传值
meta:
  -
    name: description
    content: vue component
  -
    name: keywords
    content: vue component
vssue-title: vue-component
---

父子组件之间的双向绑定非常简单，但是很多人因为是从Vue 2+开始使用的，可能不知道如何双向绑定，当然最简单的双向绑定（单文件中）就是表单元素的`v-model`了，例如`<input type="text" />`它会响应表单元素的`value`属性，

<!-- more -->

当输入框文本改变时，会将`value`值传给`v-model`所绑定的变量，如果同时设置`v-model`和`value`，`value`属性无效。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

## 父子组件的自定义双向`v-model`
当若干dom封装成组件时，在父组件中使用子组件时，却无法在子组件标签上使用`v-model`，因为子组件标签不是表单元素,这个时候，我们需要自定义我们想要的`v-model`规则。

```html
<!-- children.vue -->
<template>
    <h1>{{ msg }}</h1>
</template>
<script>

export default{
    model:{
        prop:'msg',//这个字段，是指父组件设置 v-model 时，将变量值传给子组件的 msg
        event:'parent-event'//这个字段，是指父组件监听 parent-event 事件
    },
    props:{
        msg:String //此处必须定义和model的prop相同的props，因为v-model会传值给子组件
    },
    mounted(){
    //这里模拟异步将msg传到父组件v-model，实现双向控制
        setTimeout(_=>{
            let some = '3秒后出现的某个值';//子组件自己的某个值
            this.$emit('parent-event',some);
            //将这个值通过 emit 触发parent-event，将some传递给父组件的v-model绑定的变量
        },3000);
    }
}
</script>
```
```html
<!-- parent.vue -->
<template>
    <children v-model="parentMsg"></children>
</template>
<script>
import children from 'path/to/children.vue';
export default{
    components:{
        children
    },
    data(){
        return{
            parentMsg:'test'
        }
    },
    watch:{
        parentMsg(newV,oldV){
            console.log(newV,oldV);
            //三秒后控制台会输出
            //'3秒后出现的某个值','test'
        }
    }
}
</script>
```
> 你学会组件的自定义`v-model`了吗 ？ 如果是普通的表单元素，同理，监听表单的`input`或者`change`事件，实时将`value`或者`checked`通过`$emit`传递就可以了。
## 父子组件的自定义多个双向值
上述例子，是实现单个prop值的双向绑定，当组件的需求需要复杂的操作，需要多个双向值，是如何实现的呢。这里需要用到以前被vue抛弃，后来又回归的`.sync`修饰符。

**事实上，这个比`v-model`更加简单**

```html
<!-- children.vue -->
<template>
    <h1>{{ msg }}</h1>
</template>
<script>

export default{
    props:{
        msg:String
    },
    mounted(){
    //这里模拟异步将msg传到父组件v-model，实现双向控制
        setTimeout(_=>{
            let some = '3秒后出现的某个值';//子组件自己的某个值
            this.$emit('update:msg',some);
            //将这个值通过 emit
            //update为固定字段，通过冒号连接双向绑定的msg，将some传递给父组件的v-model绑定的变量
        },3000);
    }
}
</script>
```
```html
<!-- parent.vue -->
<template>
    <children :msg.sync="parentMsg"></children>
    <!-- 此处只需在平时常用的单向传值上加上.sync修饰符 -->
</template>
<script>
import children from 'path/to/children.vue';
export default{
    components:{
        children
    },
    data(){
        return{
            parentMsg:'test'
        }
    },
    watch:{
        parentMsg(newV,oldV){
            console.log(newV,oldV);
            //三秒后控制台会输出
            //'3秒后出现的某个值','test'
        }
    }
}
</script>
```
此处需要注意，虽然加上`.sync`即可双向绑定，但是还是要依靠子组件`$emit`去触发`update:prop名`实现修改父组件的变量值实现双向数据流，如果直接对prop的属性直接赋值，依然会出现报错。

**事实上，`.sync`修饰符是一个简写，它做了一件事情**
```html
<template>
    <children :msg.sync="parentMsg"></children>
    <!-- 等价于 -->
    <children :msg="parentMsg" @update:msg="parentMsg = $event"></children>
    <!-- 这里的$event就是子组件$emit传递的参数 -->
</template>
```
**当需要把一个对象中的属性全部通过`.sync`传入双向数据流时，可以再简便一下写法**
```html
<template>
    <children :.sync="obj"></children>
</template>
<script>
export default{
    components:{
        children
    },
    data(){
        return{
            obj:{
                parentMsg:'test'
            }
        }
    }
}
</script>
```
当使用这种写法时，会将obj对象中的所有属性都通过独立的props传递给子组件，并监听对应的`update:`，此时在子组件中也要声明对应的props。
## 总结
在父子组件中，使用双向数据流，在某些时候，能够起到很好效果，以及开发体验，不过一定要适量使用，双向数据流会给项目的后期维护增加负担。

> tips:懂得分享才会走得更远。

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**