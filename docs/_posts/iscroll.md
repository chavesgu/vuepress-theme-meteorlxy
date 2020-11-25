---
category: iscroll
tags:
  - iscroll
date: 2019-05-16
title: 前端必备自定义滚动库——iScroll
meta:
  -
    name: description
    content: iScroll
  -
    name: keywords
    content: iScroll
vssue-title: iScroll
---

> 作者真的很懒，这篇文章从想法开始到现在都几个月了。😊

### iScroll是什么
很多场景，如果使用body的滚动会很不方便，这时候，就会使用某个元素的局部滚动，恶心的事情就会发生了。

<!-- more -->

1. pc端web，windows系统的浏览器会出现丑陋的滚动条。(其实也有最新的css样式可以解决，兼容性欠佳)
2. 手机移动端，ios浏览器无法惯性和弹性滑动（默认使用浏览器滚动，非ios系统原生滚动）,如果加上`-webkit-overflow-scrolling: touch;`使用系统原生滚动，兼容性方面欠佳，bug不是一个两个😭。
3. 不利于实现一些个性化需求，例如加载，刷新，贴合滚动等。

**巧了，iScroll解决了这些问题。**

iScroll的作者是位国际友人，他的github飞机票[在此](https://github.com/cubiq)。

遗憾的是，作者几乎不再维护这个iScroll插件，网上的相关中文文档很少，但是这并不影响我们拿着这个插件到处浪。

**下面看看iScroll怎么运作的**

iScroll采用了css3的transform动画模拟了惯性和弹性滚动的效果，效果和性能完美接近原生的滚动效果。同时提供了诸多功能包括`自定义滚动条，指定滚动到元素`等功能，还可以轻松实现`下拉刷新，上拉加载`。

### iScroll的基本使用
##### 首先肯定是先安装了
```shell
npm install iscroll

yarn add iscroll
```
##### 然后引用
```js
import IScroll from 'iscroll/build/iscroll'; // 普通版
import IScroll from 'iscroll/build/iscroll-probe'; // 复杂版
import IScroll from 'iscroll/build/iscroll-infinite';
```
> iscroll有几中不同js文件，分别是普通本，复杂版，无限滚动版。这里常用的是复杂版，是支持实时监听滚动的位置的，如果不需要实时监听，可以用普通版。
##### 初始化使用
*这里以vue框架为例*

```html
<template>
  <div class="wrap">
    <div class="scroll-area">
      <div v-for="n in 50" class="item">{{ n }}</div>
    </div>
  </div>
</template>
<script>
  import IScroll from 'iscroll/build/iscroll-probe';
  
  export default {
    data() {
      scroll: null,
    },
    mounted() {
      // 提示，因为transform是对dom操作，所以需要在这个生命周期操作
      this.scroll = new IScroll('.wrap', {
        mouseWheel: true, // 允许鼠标滚轮
      });
      // 第一个参数是dom选择器，建议使用唯一性的id，这里以class为例
      // 第二个参数为参数对象，是iscroll的一些配置
      // 参数配置可以参考 http://wiki.jikexueyuan.com/project/iscroll-5/
    }
  }
</script>
<style>
  .wrap{
    height: 400px;
    overflow: hidden;
    /* 给滚动区域固定可滚动高度，并且超出隐藏 */
  }
</style>
```
以上代码就完成了简单的iscroll初始化使用，可以看下效果

![效果1](//cdn.chavesgu.com/blog/iscroll-1.gif)

### iScroll刷新
```!
注意点，由于滚动内容可能是异步获取并加载dom，如果不刷新iscroll，那么滚动功能可能会受到影响，所以当异步内容加载后，需要调用刷新方法，刷新iscroll，刷新方式如下
```

```html
<template>
  <div ref="scroll" class="wrap">
    <div class="scroll-area">
      <div v-for="n in 50" class="item">{{ n }}</div>
    </div>
  </div>
</template>
<script>
  import IScroll from 'iscroll/build/iscroll-probe';
  
  export default {
    data() {
      scroll: null,
    },
    mounted() {
      const el = this.$refs.scroll;
      this.scroll = new IScroll('.wrap', {
        ...
      });
      // ① 异步数据刷新
      getData().then(_=>{
        this.scroll.refresh();
      })
      // ② 首次滑动时刷新
      el.addEventListener('touchstart', _=>this.scroll.refresh());
    }
  }
</script>
```

### 监听位置
```js
this.scroll = new IScroll('.wrap', {
  probeType: 3, // 滚动监听级别  有3档，3是像素级监听
});
// 用iscroll实例注册scroll事件
this.scroll.on('scroll', e => {
  // 此处不用箭头函数可以用this.x和this.y访问实时位置，用了箭头函数需要从实例上访问
  // this.scroll.x
  // this.scroll.y
})
```
多的不说，看效果

![效果2](//cdn.chavesgu.com/blog/iscroll-2.gif)

```!
注意取值的正负,监听取得的值是transform的值,确认好正负值所对应的方向。
```
### 滚动到指定元素位置
这里需要使用iscroll的贴合功能
```js
this.scroll = new IScroll('.wrap', {
  snap: '.item',
});
// 当设置snap属性为true时，iscroll会把容器可视区域分割为一个page
// 当设置snap属性为元素选择器时，iscroll会把对应的元素设置为一个page
// 这里我们设置为'.item'
```
然后使用iscroll的`goToPage`方法，跳到对应元素
```js
this.scroll.goToPage(0, 30, 1000);
// 参数分别为x, y, 动画时间,
// 注意x,y是传入索引，第一个是0，类推
```
也可以使用`prev`和`next`方法跳上一个或者下一个
```js
this.scroll.prev();
this.scroll.next();
```

![效果3](//cdn.chavesgu.com/blog/iscroll-3.gif)

### 配置滚动条
如果想要滚动条呢，也很简单
```js
this.scroll = new IScroll('.wrap', {
  scrollbars: true, // 开启滚动条
  shrinkScrollbars: 'scale', // 超出滚动时，缩放滚动条
});
```
```css
/* 因为iscroll的滚动条是定位实现，所以容器需要加一个相对定位 */
.wrap{
  position: relative;
}
```

![效果4](//cdn.chavesgu.com/blog/iscroll-4.gif)

### 点击事件
iscroll默认禁用了click事件，如果需要也可以开启
```js
this.scroll = new IScroll('.wrap', {
  click: true,
});
```
并且iscroll很人性化的内置了tap事件，只要开启tap，就可以在元素上响应tap
```js
this.scroll = new IScroll('.wrap', {
  tap: true,
});
```
```html
<template>
  <div ref="scroll" class="wrap">
    <div class="scroll-area">
      <div v-for="n in 50" class="item" @tap="onTap">{{ n }}</div>
    </div>
  </div>
</template>
```
### iScroll的sticky
在基于dom元素的原生滚动中，是可以给内容添加`position: sticky`来实现吸顶效果的。
> 吸顶: 在父元素的滚动过程中，如果子元素含有`position: sticky`和`top: 0`样式，那么该内容滚到顶部时，会吸附在父元素的顶部，不会继续向上滚动。(横向滚动同理)

没玩过`position: sticky`的，去试下就知道啦。当然这个css并不是无敌的，原因就是兼容性不过关。[戳这里](https://caniuse.com/#search=sticky)

好了，我们来说iscroll如何实现sticky，因为iscroll使用了transform实现滚动，所以容器设置了`overflow: hidden`，所以没办法用css的sticky实现，那么既然是父元素transform滚动，那么到达吸顶位置的时候，子元素反向transform是不是就可以了呢？

**仔细看下面的代码呢，很重要，认真看注释️**
```js
// 这段代码可以理解为是对iscroll类的扩展
// 这里的参数为iscroll类
export const extendSticky = (iScroll) => {
  let m = Math;
  // 这里是为了兼容性配置的浏览器css前缀，网络上有很多写法呢
  let vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' :
      (/firefox/i).test(navigator.userAgent) ? 'Moz' :
        'opera' in window ? 'O' : '',
    has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix(),
    trnOpen = 'translate' + (has3d ? '3d(' : '('),
    trnClose = has3d ? ',0)' : ')';
  
  /**
   * 这里开始拓展iscroll类
   * @param selector 需要sticky的对象集合，包含元素和sticky的位置
   * @return { iScrollStickyHeaders }
   */
   // 在iscroll原型上添加 enableStickyHeaders 方法
  iScroll.prototype.enableStickyHeaders = function (selector) {
    return new iScrollStickyHeaders(this, selector); // 拓展方法采用新的类并传参
  };

  // 参数，iscroll实例，需要sticky的元素集合
  let iScrollStickyHeaders = function (iscroll, selector) {
    if (!iscroll.options.useTransform) {
      return;
    }
    this.iscroll = iscroll;
    this.selector = selector;
    this.initialize(); // 初始化
  };
  iScrollStickyHeaders.prototype = {
    headers: [], // 存储需要sticky的对象集合
    initialize() {
      let that = this;
      this._augment();
      this.iscroll.on('refresh', function() {
        that._refresh() // 每次iscroll刷新，sticky方法也刷新
      });
      this.iscroll.refresh()
    },
    _refresh() { // 初始化或者刷新
      let elms = this.selector;
      this.headers = [ // 深拷贝对象集合
        ...elms,
      ]
      // 此处对象集合的格式为 { el: 元素, top: 需要sticky的位置 }
      // 此处可以根据习惯和喜欢自行定义格式和逻辑代码
      this._translate(0， 0); // 初始化
    },
    _augment() { // 初始化函数
      let that = this;
      this.iscroll.on('scroll', function() {
        that._translate(this.x, this.y) // iscroll滚动时，触发主函数
      });
      this.iscroll.on('beforeScrollStart', function() {
        that._translate(this.x, this.y) // iscroll即将滚动时，触发主函数
      });
      this.iscroll.on('scrollStart', function() {
        that._translate(this.x, this.y) // iscroll开始滚动时，触发主函数
      });
    },
    _translate(x, y) { // 主函数，到达sticky位置后，反向transform
      let absY = m.abs(y); // 获取y轴滚动的绝对值
      this.headers.forEach((stickyObj) => { // 遍历sticky对象
        let translateY = 0; // sticky的反向transform默认为0
        let yy = m.abs(absY - stickyObj.el.offsetTop); // 计算iscroll的y轴滚动值-当前元素距离父级的值
        // stickyObj.el.offsetTop为固定值
        // yy即为当前元素距离容器顶部的位置
        // absY < stickyObj.el.offsetTop说明该元素还没到达顶部
        // yy <= stickyObj.top 判断元素是否到达需要sticky的位置
        // ① 当元素还没到达容器顶部时，默认为0，再判断是否到达指定sticky位置
        // ② 如果没到达指定sticky，依然为0
        // ③ 如果达到指定sticky位置，那么就计算超过sticky位置后，需要反向transform的距离
        // ④ 这里默认指定位置是小于元素初始位置的，指定位置大于初始位置的，我想会很奇葩吧。
        if (absY - stickyObj.el.offsetTop > 0 || yy <= stickyObj.top) {
          // 这个公式需要反复理解一下
          // 当容器往上滚动时，容器的transform是负值，所以我们反向是正值
          // 容器向上滚动值absY不断变大，我们sticky就不断向下transform
          // stickyObj.el.offsetTop - stickyObj.top 即为容器滚动多少范围才会让元素到达指定sticky位置
          // 计算iscroll容器的滚动值 - (初始位置 - 指定位置)
          // 当滚动值等于初始位置和指定位置之差时，刚好等于0
          // 随着滚动值越来越大，超过0的部分，即为需要反向transform的值
          translateY = absY - (stickyObj.el.offsetTop - stickyObj.top);
        } else {
          translateY = 0;
        }
        // 最后拼接浏览器前缀，完成css赋值
        stickyObj.el.style[vendor + 'Transform'] = trnOpen + ('0, ' + translateY + 'px') + trnClose;
      });
    },
  };
};
export default extendSticky;
```
为了便于理解，我就秀一下Axure的功力。

![效果5](//cdn.chavesgu.com/blog/iscroll-5.jpg)

好了，上面的`iscroll-sticky.js`工具已经完成，下面开始使用。
```html
<template>
  <div ref="scroll" class="wrap">
    <div class="scroll-area">
      <div v-for="n in 20" class="item">{{ n }}</div>
      <div ref="sticky" class="sticky" :top="20">21</div>
      <div v-for="n in 20" class="item">{{ n+20 }}</div>
    </div>
  </div>
</template>
<script>
  import IScroll from 'iscroll/build/iscroll-probe';
  import enableSticky from 'path/to/iscroll-sticky.js';
  enableSticky(IScroll); // 这一步是将sticky方法挂载到iscroll原型上
  
  export default {
    data() {
      scroll: null,
    },
    mounted() {
      const el = this.$refs.scroll;
      this.scroll = new IScroll('.wrap', {
        ...
      });
      const stickyEl = this.$refs.sticky;
      // 允许元素对象集合sticky
      this.scroll.enableStickyHeaders([
        {
          el: stickyEl,
          top: stickyEl.getAttribute('top') // 此处我把top值配置在了原生prop
        }
      ]);
    }
  }
</script>
```
看效果吧。

![效果6](//cdn.chavesgu.com/blog/iscroll-6.gif)

> 上面的`iscroll-sticky.js`是个灵活的js，可以根据自己的需求自行配置修改。

### 下拉刷新

事实上iscroll本身没有下拉刷新功能，但是可以自己实现。
```js
export default {
  data() {
    scroll: null,
    status: 0, // 用一个变量记录iscroll滚动状态，默认为0
    txt: '下拉刷新', // 记录刷新文本，默认
  },
  watch: {
    status() {
      // 每次iscroll的状态码变化时，就要刷新iscroll，以便iscroll重新计算dom元素
      this.iscroll.refresh();
    }
  }
}
```
然后添加一个刷新文本(或者动画)
```html
<template>
  <div ref="scroll" class="wrap">
    <div class="scroll-area">
      <div :class="{hide: status===0}" class="refresh">{{ txt }}</div>
      <div v-for="n in 50" class="item">{{ n }}</div>
    </div>
  </div>
</template>
```
```scss
.refresh{
  width: 100%;
  height: 50px;
  line-height: 50px;
  text-align: center;
  &.hide{
    /* 当status为0默认时，隐藏刷新文本，通过定位到容器外面 */
    position: absolute;
    left: 0;
    top: -50px;
  }
}
```
接下来监听下拉iscroll
```js
// ...
this.scroll.on('scroll', e => {
  const y = this.iscroll.y; // 监听下拉的y值，下拉是正值
  if (y >= 50) { // 当下拉距离>=刷新文本高度时,
    this.status = 1; // 状态码变为1, 表示准备好刷新了
  }
})
```
这个时候，`status`的值变为1，那么之前被我们`hide`的刷新文本，已经变为正常的内容载入`iscroll`了，这里的dom变化需要理解清楚的，关键就在于**状态改变后iscroll的刷新**，我们手指并没有释放，所以目前是准备刷新状态，这个时候需要一个新的监听，去监听手指离开并且滚动停止。
```js
this.scroll.on('scroll', e => {
  const y = this.iscroll.y; // 监听下拉的y值，下拉是正值
  if (y >= 50) { // 当下拉距离>=刷新文本高度时,
    this.txt = '释放刷新';
    this.status = 1; // 状态码变为1, 表示准备好刷新了
  } else if (y > 0) { // 如果返回了，又不想刷新了,恢复status为0
	this.txt = '下拉刷新';
	this.status = 0;
  }
})
this.scroll.on('scrollEnd', e => {
  if (status === 1) { // 滚动停止时，如果是准备刷新状态
    this.txt = '刷新中。。。';
    this.status = 2; // 改变状态码，开始刷新
    this.scroll.disable(); // 刷新过程禁止滚动，这个禁用方法视需求而定。
    this.updateData(); // 假设有一个更新数据的method
  }
})
```
```js
export default {
  methods: {
    updateData() {
      getData().then(_=>{
        // 数据更新完成
        this.txt = '刷新完成';
        // 延迟1秒后继续隐藏刷新文本
        setTimeout(_=>{
          this.txt = '下拉刷新';
          this.status = 0; // 状态重置为0
          this.scroll.enable();
        }, 1000);
      })
    }
  }
}
```
看下demo的效果:
![效果7](//cdn.chavesgu.com/blog/iscroll-7.gif)

这里附上一个我平时做的一个猫眼电影demo:

![效果8](//cdn.chavesgu.com/blog/iscroll-8.gif)

### 上拉加载
这个也是要自己实现，不过这个很简单了，判断滚动触底即可。
```js
this.scroll.on('scroll', e => {
  // 此处scrollEl是容器高度，contentEl是内容高度，因为y是负值，所以用scrollEl - contentEl
  if (this.scroll.y <= scrollEl.offsetHeight - contentEl.offsetHeight) {
    // do something 上拉加载
  }
});
```

### 总结
iscroll是个很灵活的库，可以根据自己想要的效果，自由配置。

如果对模块化比较熟悉，可以尝试将`sticky`,`下拉刷新`,`上拉加载`封装到一个组件中。

> 评论有人提到`better-scroll`，没什么问题，喜欢哪个用哪个。

> 欢迎点赞收藏，后续和iscroll相关的会及时更新进来。