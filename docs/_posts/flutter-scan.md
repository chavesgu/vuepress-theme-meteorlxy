---
category: flutter
tags:
  - flutter
date: 2020-10-20
title: Flutter折腾记一扫一扫
meta:
  -
    name: description
    content: flutter,扫一扫
  -
    name: keywords
    content: flutter,扫一扫
vssue-title: flutter-scan
---

实现扫描二维码功能，利用了方便开发者自定义布局的native-view，可以自定义嵌入widget树。

<!-- more -->

**扫一扫[scan](https://pub.flutter-io.cn/packages/scan)**

> 如果需要生成二维码图片[qr_flutter](https://pub.flutter-io.cn/packages/qr_flutter)
### 功能支持
1. 使用`ScanView`插入widget树展示扫一扫界面
2. 可按比例定义可识别二维码区域大小
3. 通过`Scan.parse(path)`解析出图片中的二维码

### 引入插件和客户端权限配置
1. 将插件引入`pubspec.yaml`
```yaml
dependencies:
  scan: ^0.0.3
```
2. android配置`AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE"/>
```
3. ios配置`info.list`
```
<key>NSCameraUsageDescription</key>
<string>获取相机权限使用扫一扫功能</string>
<key>io.flutter.embedded_views_preview</key>
<string>YES</string>
```
### 使用方法
1. 在页面中import
```dart
import "package:scan/scan.dart"
```
2. 调用api
- 在widget树中使用`ScanView`
```dart
ScanController controller = ScanController();
String qrcode = 'Unknown';

Container(
  width: 250, // custom wrap size
  height: 250,
  child: ScanView(
    controller: controller,
// custom scan area, if set to 1.0, will scan full area
    scanAreaScale: .7,
    scanLineColor: Colors.green.shade400,
    onCapture: (data) {
      // use data do something
    },
  ),
),
```
- 暂停或恢复扫一扫
```dart
ScanController controller = ScanController();
// ...
controller.resume();
controller.pause();
```
- 从图片中解析二维码
```dart
String result = await Scan.parse(imagePath);
```
> 选择相册图片[images_picker](https://pub.flutter-io.cn/packages/images_picker)
- 打开/关闭闪光灯
```dart
controller.toggleTorchMode();
```
### 欢迎star和issue
[github](https://github.com/chavesgu/FlutterScan)
