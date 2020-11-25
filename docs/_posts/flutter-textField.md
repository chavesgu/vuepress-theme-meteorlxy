---
category: flutter
tags:
  - flutter
date: 2019-12-10
title: Flutter折腾记一textField的样式
meta:
  -
    name: description
    content: flutter,textField
  -
    name: keywords
    content: flutter,textField
vssue-title: flutter-textField
---

`TextField`其实就是前端代码的`input`，输入框组件。

基本的使用其实看api就已经可以日常使用了，官方的api解释还是很清楚的。（翻译软件还挺给力）😬

<!-- more -->

### 场景1：在较小的父级空间时
这种情况需要注意，不能给`TextField`加一些花式操作（包括边框，前后置icon等）。

如果加了这些，会导致输入框的文本无法垂直居中，不管你加任何居中属性都无法正常工作。
并且这种场景，你需要加上一个特殊属性`isDense`,作用是在较小空间时，使组件正常渲染（包括文本垂直居中）。

```dart
TextField(
    decoration: InputDecoration(
      isDense: true,
    )
)
```
这种情况，如果需要边框、圆角等样式，合理的做法应该是，实现一个带样式的`Container`，作为`TextField`的父级，并且要加上合适的`padding`，因为`Container`的圆角无法遮住input（即使使用overflow组件也无法达到你的期望）。

### 场景2：自定义输入中文本的样式

使用过这个`TextField`的大兄嘚一定知道，默认的`Editing Text`的样式是**黑色文字**,**无底色**,**黑色下划线**。

显而易见，在日常APP的使用中，这种样式很痛。谁叫我是处女座呢。

先来看下原本的样式。
![https://cdn.chavesgu.com/flutter/textField-1.jpg](https://cdn.chavesgu.com/flutter/textField-1.jpg)
再看看微信的输入样式。
![https://cdn.chavesgu.com/flutter/textField-2.jpg](https://cdn.chavesgu.com/flutter/textField-2.jpg)
不多说，我就是喜欢有底色的。搞它。

我刚开始准备修改这个样式的时候，把我的脑袋整的是天翻地覆，因为`TextField`没有任何一个属性样式可以修改这个。

本来就要准备在“某群”找“收费解决问题”的大佬（钱蛆）搞定这个问题，但是囊中羞涩的我保持了理智，继续钻研这个组件，终于让我发现了控制这个样式的东西！

`TextEditingController`

这是flutter用来控制输入框的文本输入、赋值、监听、focus/blur的控制器，我特么哪能想到这玩意还控制样式？？无意中看到他的英文带有`Editing`，才认真看了这东西。

我在这个`TextEditingController`的源码中发现了这么一段：

```dart
  /// Builds [TextSpan] from current editing value.
  ///
  /// By default makes text in composing range appear as underlined.
  /// Descendants can override this method to customize appearance of text.
  TextSpan buildTextSpan({TextStyle style , bool withComposing}) {
```
大概的中文意思就是，当前正在输入的文本的build方式（方法），默认表现是underline，后代可以重写这个方法自定义文本的表现。（我四级没过的还能看懂这段英文，太棒了）

我就尝试写一个`MyTextEditingController`继承`TextEditingController`，然后重写`buildTextSpan`方法。

```dart
import 'package:flutter/material.dart';

class MyTextEditingController extends TextEditingController {

  MyTextEditingController({
    String text,
    this.editingTextStyle = const TextStyle(backgroundColor: Colors.black12),
  })
    : super(text: text);

// 增加editingTextStyle参数，让他随时可变自定义，默认灰色---↑↑↑↑↑↑↑↑↑↑↑↑↑
  final TextStyle editingTextStyle;

  @override
  TextSpan buildTextSpan({TextStyle style , bool withComposing}) {
    if (!value.composing.isValid || !withComposing) {
      return TextSpan(style: style, text: text);
    }
    // -----此处就是正在输入的样式
    final TextStyle composingStyle = style.merge(
      const TextStyle(decoration: TextDecoration.underline),
    );
    // -----↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓--------
    final TextStyle composingStyle = style.merge(editingTextStyle);
    // ---------------------------
    return TextSpan(
      style: style,
      children: <TextSpan>[
        TextSpan(text: value.composing.textBefore(value.text)),
        TextSpan(
          style: composingStyle,
          text: value.composing.textInside(value.text),
        ),
        TextSpan(text: value.composing.textAfter(value.text)),
      ]);
  }
}
```
写完新的`MyTextEditingController`，就可以开始使用了。

```dart
final _inputController = MyTextEditingController();

TextField(
    controller: _inputController,
)
```
看下效果：
![https://cdn.chavesgu.com/flutter/textField-3.png](https://cdn.chavesgu.com/flutter/textField-3.png)

舒服了~~~

### 总结
会持续补充~~~
