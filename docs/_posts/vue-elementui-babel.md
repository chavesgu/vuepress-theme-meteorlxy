---
category: vue
tags:
  - vue
  - element
date: 2019-03-05
title: babel-plugin-component按需加载组件及自定义主题对应的scss样式
meta:
  -
    name: description
    content: vue elementui babel
  -
    name: keywords
    content: vue elementui babel
vssue-title: babel-plugin-component
---
作者本人在工作之余喜欢自己写一些东西玩玩，
虽然不是资深程序员，
不过也还是能够完成前端页面+后端接口+服务端部署的整个流程了。

<!-- more -->
## 如果不愿意看分析过程，可以直接拉到最后看结果。
>开始入坑

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**

### 首先前端页面使用了[Vue](https://cn.vuejs.org)作为前端开发框架，我相信点这个标题进来看文章的都用过这个框架的吧。。。

1. 首先肯定是要引入[element](http://element.eleme.io/)这个ui组件库，但是作者是个很讲究的人，虽然自己瞎倒腾的页面没多少东西，但是有些东西还是要规范处理的↓↓↓
2. 为了项目整体内容不过于庞大，按需加载是许多第三方的库和插件必不可少的，于是使用了官方提供的按需加载插件[babel-plugin-component](https://github.com/ElementUI/babel-plugin-component)↓↓↓
3. 先看看官方的代码[按需加载](http://element-cn.eleme.io/#/zh-CN/component/quickstart)
```json
[
    "component",
    {
    "libraryName": "element-ui",
    "styleLibraryName": "theme-chalk"
    }
]
```
这是.babelrc配置参数，component是babel插件的名字，对象是参数。
```javascript
import Vue from 'vue';
import {
    Dialog,
    Autocomplete,
    Dropdown,
    ...
} from 'element-ui';
Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Autocomplete);
...
//这里提个醒
//MessageBox，Message,Notification这三个组件只能挂载Vue原型上调用，
//不能使用Vue.use()；否则项目运行会默认执行一次，即使没有使用它们
```
这样就可以愉快的按需加载使用自己想要的组件了，接下来给大家看一下这个按需加载插件的部分源码，看它到底干了什么

 4. 位置在node_modules/babel-plugin-component/lib/core.js

```javascript
var _options = options,
    _options$libDir = _options.libDir,//这是组件所在根目录下的路径element-ui/lib/
    libDir = _options$libDir === void 0 ? 'lib' : _options$libDir,
    _options$libraryName = _options.libraryName,//这是ui库的名字--elementui
    libraryName = _options$libraryName === void 0 ? defaultLibraryName : _options$libraryName,
    _options$style = _options.style,
    style = _options$style === void 0 ? true : _options$style,
    styleLibrary = _options.styleLibrary,//这是引入组件时，所需要引入对应组件样式的配置对象
    _options$root = _options.root,
    root = _options$root === void 0 ? '' : _options$root,
    _options$camel2Dash = _options.camel2Dash,
    camel2Dash = _options$camel2Dash === void 0 ? true : _options$camel2Dash;
    
    var styleLibraryName = options.styleLibraryName;//这是组件所需样式的路径（相对于上面的lib）
    var _root = root;
    var isBaseStyle = true;
    var modulePathTpl;
    var styleRoot;
    var mixin = false;
    var ext = options.ext || '.css';//这是加载样式的后缀，默认css
```
就这一部分代码，我们已经知道在执行按需加载时已经配置了对应样式的加载，所以如果在`.babelrc`文件配置过`styleLibraryName`属性的，不要在全局引入element的css样式了，如果你不在乎打包体积的话，请无视我。

>踩坑

1. 作者当时第一次在看element官网时，就发现了定制主题，很有趣，改个scss变量，整个主题色就变了，来看下官方的代码
```scss
/* 改变主题色变量 */
$--color-primary: teal;

/* 改变 icon 字体路径变量，必需 */
$--font-path: '~element-ui/lib/theme-chalk/fonts';

@import "~element-ui/packages/theme-chalk/src/index";//注意此处引入了所有组件的scss样式
```
2. 看到这里你们发现什么了吗？是的，没错，这里引入了全部的scss，上面我们刚说babel-plugin-component会在按需加载组件时，同时引入对应组件的css样式，有人会说那这里就不引入这个`index.scss`文件，如果没有组件的scss，那这个`$--color-primary`变量会有效吗？
答案当然是不可能有效的。

3. 既然我们`node_modules`里面有所有组件的scss样式文件，我们是不是就可以让babel-plugin-component在引入组件时，就引入对应的scss文件呢？答案是完全ojbk的，不然还写这文章干嘛。。。

>爬坑

1. 我们回到按需加载插件的源码，之前看到代码是配置了加载样式的部分代码的，我们现在看一下具体怎么加载的（这段代码是作者连蒙带猜的。。有错请指出）
```javascript
if (styleLibrary && _typeof(styleLibrary) === 'object') {//这个是样式的一些配置
  styleLibraryName = styleLibrary.name;
  isBaseStyle = styleLibrary.base;
  modulePathTpl = styleLibrary.path;
  mixin = styleLibrary.mixin;
  styleRoot = styleLibrary.root;
}

if (styleLibraryName) {//是否在.babelrc配置了styleLibraryName
  if (!cachePath[libraryName]) {//是否存在配置好的样式获取路径
    var themeName = styleLibraryName.replace(/^~/, '');
    cachePath[libraryName] = styleLibraryName.indexOf('~') === 0 ?//路径是否相对于element-ui/lib
    resolve(process.cwd(), themeName) : 
    "".concat(libraryName, "/").concat(libDir, "/").concat(themeName);
  }//如果是相对于lib   组合路径---element-ui/lib/theme-chalk/   这个目录下是75个css文件
  //这里将这一段路径保存在了cachePath[libraryName]  后续会用到

  if (libraryObjs[methodName]) {//作者也没搞清楚这里是什么  不过没关系，事实证明这里走了false
    /* istanbul ingore next */
    if (cache[libraryName] === 2) {
      throw Error('[babel-plugin-component] If you are using both' + 'on-demand and importing all, make sure to invoke the' + ' importing all first.');
    }

    if (styleRoot) {//这里默认是没有配置的  所有走false
      path = "".concat(cachePath[libraryName]).concat(styleRoot).concat(ext);
    } else {
      path = "".concat(cachePath[libraryName]).concat(_root || '/index').concat(ext);
    }//这里会默认先加载index.css  因为ext没设置就会默认css

    cache[libraryName] = 1;
  } else {//走了else
    if (cache[libraryName] !== 1) {//这里肯定是不等于1，因为上面一行才会赋值1
      /* if set styleLibrary.path(format: [module]/module.css) */
      var parsedMethodName = parseName(methodName, camel2Dash);

      if (modulePathTpl) {
        var modulePath = modulePathTpl.replace(/\[module]/ig, parsedMethodName);
        path = "".concat(cachePath[libraryName], "/").concat(modulePath);
      } else {//这里走了else 也就是样式路径后续为模块名.[ext]
        path = "".concat(cachePath[libraryName], "/").concat(parsedMethodName).concat(ext);
      }//所有这里的路径就是element-ui/lib/

      if (mixin && !isExist(path)) {
        path = style === true ? "".concat(_path, "/style").concat(ext) : "".concat(_path, "/").concat(style);
      }

      if (isBaseStyle) {
        addSideEffect(file.path, "".concat(cachePath[libraryName], "/base").concat(ext));
      }

      cache[libraryName] = 2;
    }
  }

  addDefault(file.path, path, {
    nameHint: methodName
  });
} else {
  if (style === true) {
    addSideEffect(file.path, "".concat(path, "/style").concat(ext));
  } else if (style) {
    addSideEffect(file.path, "".concat(path, "/").concat(style));
  }
}
}
```
2. 好的，这就过了一遍了，连蒙带猜知道是怎么回事了，我们进入正题，如何变为加载对应组件的scss
```javascript
//第一步不用说了 先把ext后缀改为scss
[
    "component",
    {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk",
        "ext":".scss"
    }
]
//-------------------
//第二步呢  就是配置路径  比较重要的
//有一段代码需要看的  虽然作者也看不懂，不过大概知道这一段是加载模块的
if (libraryObjs[methodName]) {
  path = "".concat(libraryName, "/").concat(libDir).concat(_root);
    //需要注意这里的libDir，之前的代码我们看到  加载样式也会基于libDir
    //所以我们无法通过.babelrc的option去修改libDir，
    //那样的话组件加载就有问题我们不能影响最基本的组件加载
  if (!_root) {
    importAll[path] = true;
  }
} else {
  path = "".concat(libraryName, "/").concat(libDir, "/").concat(parseName(methodName, camel2Dash));
}
//所以我们只能通过修改core.js的源码解决，这是我目前的办法
```
3. 既然我们要修改按需加载对应的scss样式，那首先先找到文件位置，这里我直接说了element-ui/packages/theme-chalk/src/   和默认加载css一样75个文件，哇，文件数量都一样，是不是瞬间感觉很放心了呢。
4. 我们对比一下，
- 默认的是element-ui/lib/theme-chalk
- 要修改成element-ui/packages/theme-chalk/src

5. `libDir`是不能改的 我们说了  所以看源码
```javascript
//这是上面提到的三目运算
if (!cachePath[libraryName]) {
    var themeName = styleLibraryName.replace(/^~/, '');
    cachePath[libraryName] = styleLibraryName.indexOf('~') === 0 ?
    resolve(process.cwd(), themeName) : 
    "".concat(libraryName, "/").concat(libDir, "/").concat(themeName);
}//我们把这里------------------------libDir修改为 "packages"

现在路径从element-ui/lib/theme-chalk--->element-ui/packages/theme-chalk
```
6. 我们再看看，还少了个src
- element-ui/packages/theme-chalk
- element-ui/packages/theme-chalk/src
7. 老规矩，看源码
```javascript
//咳咳，还是那个三目运算
if (!cachePath[libraryName]) {
    var themeName = styleLibraryName.replace(/^~/, '');
    cachePath[libraryName] = styleLibraryName.indexOf('~') === 0 ?
    resolve(process.cwd(), themeName) : 
    "".concat(libraryName, "/").concat("packages", "/").concat(themeName);
}
//我们看packages后面的路径是个变量themeName
//这个themeName就是styleLibraryName，你懂了吗，你懂怎么修改了吗
```
8. 如下
```javascript
[
  "component",
  {
    "libraryName": "element-ui",
    "styleLibraryName": "theme-chalk/src",//这里把theme-chalk-->theme-chalk/src
    "ext":".scss"
  }
]
```
9. 至此，已经完成。快去跑项目玩玩看吧。

>总结

`.babelrc`
```javascript
"plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk/src",
        "ext":".scss"
      }
    ]
]
```
`node_modules/babel-plugin-component/lib/core.js`
```javascript
//95-98行左右
if (!cachePath[libraryName]) {
    var themeName = styleLibraryName.replace(/^~/, '');
    cachePath[libraryName] = styleLibraryName.indexOf('~') === 0 ? resolve(process.cwd(), themeName) : "".concat(libraryName, "/").concat("packages", "/").concat(themeName);
}
```

**由于随便修改官方提供的插件源码并不合理，作者我fork了官方的npm包，并且修改了对应位置的代码，合理的做法是安装我提供的[babel-plugin-component-scss](https://www.npmjs.com/package/babel-plugin-component-scss),当不需要scss时，仍可使用官方的插件**

**需要注意的是，当使用[babel-plugin-component-scss](https://www.npmjs.com/package/babel-plugin-component-scss)时，`babel.config.js`or`.babelrc`的配置需要如下:**

```javascript
"plugins": [
    [
      "component-scss",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk/src",
        "ext":".scss"
      }
    ]
]
```

> over

**欢迎来我的Vue技术群交流：<a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=c91a3422bf05cc5e2c127ae1ed10e1953c8134583c07505ef860ba1a4531c9de"><img border="0" src="https://user-gold-cdn.xitu.io/2018/10/25/166aae7ff406eec4?w=90&h=22&f=png&s=1827" alt="Vue" title="Vue">887516034</a>**