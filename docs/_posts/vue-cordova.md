---
category: cordova
tags:
  - vue
  - cordova
date: 2019-03-06
title: Cordova的webview环境下，ios和Android的兼容性差异整理
meta:
  -
    name: description
    content: vue cordova
  -
    name: keywords
    content: vue cordova
vssue-title: vue-cordova
---

> 好像都是ios的锅。😂

<!-- more -->

### 1、ios上下有2个黑色块

**解决方案: 添加启动屏**

```bash
cordova plugin add cordova-plugin-splashscreen
```

```xml
<!-- config.xml -->
<platform name="ios">
	<splash height="1136" src="res/screen/ios/screen-portrait-640x1136.png" width="640" />
</platform>
```

### 2、ios下new Date()不支持"xxxx-xx-xx"的日期时间格式

**解决方案: 改为"xxxx/xx/xx"**

```javascript
new Date("2018-11-26".replace(/-/g,'/'));
```

### 3、ios下全屏(横屏)浏览时，当进入后台运行后，回到前台无法正确识别屏幕状态(竖屏/横屏)

**解决方案: 每次从后台进入前台时，重新定位屏幕方向**

```bash
cordova plugin add cordova-plugin-screen-orientation
cordova plugin add cordova-plugin-background-mode
```

```javascript
window.cordova.plugins.backgroundMode.on('deactivate', ()=>{
	const type = window.screen.orientation.type.split('-')[0];
    window.screen.orientation.lock(type);
})
```

### 4、ios下横竖屏切换无法正确监听window.resize事件

**解决方案: 监听屏幕方向切换事件**

```bash
cordova plugin add cordova-plugin-screen-orientation
```

```javascript
window.addEventListener('orientationchange', someFn);
```

### 5、部分移动设备无法正确兼容Promise.prototype.finally方法

**解决方案: 在catch方法后使用then**

```javascript
SomePromise.then().catch().then();
```

### 6、cordova在ios下使用wkwebview无法正常启动项目(和background-mode插件冲突)

> wkwebview相对于uiwebview可以明显提升app运行性能

**解决方案: 打包后修改background-mode插件代码**

```objectivec
/**
 * APPBackgroundMode.m 文件
 */
/**
 * ···
 * ···
 * ···
 */
+ (void) swizzleWKWebViewEngine
{
    if (![self isRunningWebKit])
        return;

    Class wkWebViewEngineCls = NSClassFromString(@"CDVWKWebViewEngine");
    SEL selector = NSSelectorFromString(@"createConfigurationFromSettings:");

    SwizzleSelectorWithBlock_Begin(wkWebViewEngineCls, selector)
    ^(CDVPlugin *self, NSDictionary *settings) {
        id obj = ((id (*)(id, SEL, NSDictionary*))_imp)(self, _cmd, settings);

        [obj setValue:[NSNumber numberWithBool:YES]
               forKey:[APPBackgroundMode wkProperty]];

        [obj setValue:[NSNumber numberWithBool:NO]
               forKey:@"requiresUserActionForMediaPlayback"];
        
        return obj;
    }
    SwizzleSelectorWithBlock_End;
}

@end
    
/**
 *	forKey:@"_requiresUserActionForMediaPlayback"] 		
 *	===>forKey:@"requiresUserActionForMediaPlayback"];
 */
```

### 7、ios下输入框input无法自动获取焦点(ios默认策略禁止自动聚焦)

**解决方案: 配置ios策略开启输入框聚焦功能**

```xml
<!-- UIWEBVIEW -->
<preference name="KeyboardDisplayRequiresUserAction" value="false" />
```

```bash
wkwebview
cordova plugin add cordova-plugin-wkwebview-inputfocusfix
```

### 8、ios推送通知在生产环境（production）无法正确推送

**解决方案: 手动注入aps-environment权限**

```xml
<!-- /platforms/ios/projectname/Entitlements-Release.plist -->
<plist version="x.x.x">
    <dict>
        <key>aps-environment</key>
        <string>production</string>
    </dict>
</plist>
```
### 9、ios推送通知实现app前台运行显示通知横幅
**解决方案: xcode修改推送通知策略**

```bash
cordova plugin add phonegap-plugin-push
```

```objectivec
// 入口文件 AppDelegate.m

#import "AppDelegate.h"
#import "MainViewController.h"
#import <UserNotifications/UserNotifications.h>  // 新增

@interface AppDelegate () <UNUserNotificationCenterDelegate> // 新增

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{
    self.viewController = [[MainViewController alloc] init];
    
    [UNUserNotificationCenter currentNotificationCenter].delegate = self; // 新增
    
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 新增
- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler {
    completionHandler(UNNotificationPresentationOptionAlert|UNNotificationPresentationOptionSound|UNNotificationPresentationOptionBadge); // 此处配置通知允许的功能(横幅,声音,角标)
}

@end

```

### 10、android默认不支持mixed-content(https协议下使用http资源)

**解决方案:添加允许mixed-content**

```java
/*
	'/platform/androud/CordovaLib/src/org/apache/cordova/engine/SystemWebViewEngine.java' */
private void initWebViewSettings() {
    final WebSettings settings = webView.getSettings();
    /* 开启mixed-content */
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
      settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
    }
}
```
### 11、android去除背景图

```java
/*
	'/platform/androud/CordovaLib/src/org/apache/cordova/CordovaActivity.java'
*/
protected void createViews() {
    setContentView(appView.getView());
   	/* ... */
    getWindow().setBackgroundDrawable(null);
}
```

### 12、ios允许video标签非全屏播放

```xml
<preference name="AllowInlineMediaPlayback" value="YES" />
```

### 13、






> 持续更新