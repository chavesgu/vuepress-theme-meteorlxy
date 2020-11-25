---
category: flutter
tags:
  - flutter
date: 2019-12-02
title: Flutter折腾记一支持横屏的视频控件
meta:
  -
    name: description
    content: flutter,video
  -
    name: keywords
    content: flutter,video
vssue-title: flutter-video
---

又有一段时间没有写文章了，闲暇时间比较少。痴迷游戏。哎~~~

最近在玩`flutter`，对于vuejs感觉没啥可分享的了。每次看到群友们问的问题，我都只能叹口气。

不用我说，应该都知道`flutter`是基于`dart`语言的，我目前的体验来说，除了组件嵌套比较恶心之外，真的比js舒服，懂的自然懂~~~

<!-- more -->

### 场景分析

可能是由于平时比较喜欢看视频吧，上手flutter之后，还没多久呢，就想搞一搞视频播放。中间陆陆续续用了社区好几个现成的视频插件，都感觉没有达到自己想要的效果，当然也许这些插件可以满足正在看这个文章的你，先列一下吧。

1. 首推flutter官方的[video_player](https://pub.flutter-io.cn/packages/video_player)，只有视频播放，无ui(其实藏了一个带手势操作的进度条)，无特殊功能。
2. [chewie](https://pub.flutter-io.cn/packages/chewie)，在官方的基础上做了一些ui，不过这个插件全屏(只是单纯的竖屏全屏，类似于H5的全屏)，并不是我要的效果，新增的ui不是我的style
3. [flutter_ijkplayer](https://pub.flutter-io.cn/packages/flutter_ijkplayer),基于`ijkplayer`，增加了ui和横屏(ui的横屏，手机还是竖屏)，不过`ijkplayer`在ios老是报错，并且这个插件没有封面图，所以我。。
4. [fijkplayer](https://pub.flutter-io.cn/packages/fijkplayer)，和上面的差不多，也是基于`ijkplayer`，有封面图，但是没有全屏，并且api有点难受。

就说这几个吧，不多说了，可能这些插件已经满足你了，却满足不了我，谁叫我是处女座呢。

### 进入正题
首先准备一个空页面，就叫`media.dart`吧。
```dart
class MediaPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return MediaPageState();
  }
}

class MediaPageState extends State<MediaPage> {
  // 记录当前设备是否横屏，后续用到
  bool get _isFullScreen => MediaQuery.of(context).orientation == Orientation.landscape;
  
   @override
   Widget build(BuildContext context) {
       return Scaffold(
          appBar: AppBar(
            title: Text('Media'),
          ),
          body: Container(
            child: MyVideo( // 这个是等会儿要编写的组件
              url: 'http://www.sample-videos.com/video123/mp4/720/big_buck_bunny_720p_20mb.mp4',
              title: '示例视频',
              // 这个vw是MediaQueryData.fromWindow(window).size.width屏幕宽度
              width: _isFullScreen?vh:vw,
              height: _isFullScreen?vw:vw/16*9, // 竖屏时容器为16：9
            ),
          ),
       )
   }
}
```
OK,空页面准备好了。

### 打造播放器
我这里选用的是官方的`video_play`，因为其他插件都增加了东西缺让我不满意，所以我只能选择最原始的插件，自己增加满意的东西。
```yaml
video_player: ^0.10.2+5
```
好，开始编写我们想要的ui~~
```dart
// MyVideo.dart
import 'package:video_player/video_player.dart'; // 引入官方插件

class MyVideo extends StatefulWidget {
  MyVideo({
    @required this.url, // 当前需要播放的地址
    @required this.width, // 播放器尺寸（大于等于视频播放区域）
    @required this.height,
    this.title = '', // 视频需要显示的标题
  });

  // 视频地址
  final String url;
  // 视频尺寸比例
  final double width;
  final double height;
  // 视频标题
  final String title;

  @override
  State<MyVideo> createState() {
    return _MyVideoState();
  }
}

class _MyVideoState extends State<MyVideo> {
  // 指示video资源是否加载完成，加载完成后会获得总时长和视频长宽比等信息
  bool _videoInit = false;
  // video控件管理器
  VideoPlayerController _controller;
  // 记录video播放进度
  Duration _position = Duration(seconds: 0);
  // 记录播放控件ui是否显示(进度条，播放按钮，全屏按钮等等)
  Timer _timer; // 计时器，用于延迟隐藏控件ui
  bool _hidePlayControl = true; // 控制是否隐藏控件ui
  double _playControlOpacity = 0; // 通过透明度动画显示/隐藏控件ui
  // 记录是否全屏
  bool get _isFullScreen => MediaQuery.of(context).orientation==Orientation.landscape;
  
  @override
  Widget build(BuildContext context) {
    // 继续往下看
  }
}
```
现在已经完成了视频播放器组件的大框架了，开始编写渲染播放器和控件ui。

**想法：控件的ui我希望分为上半部分和下半部分，上半部显示标题，下半部显示播放按钮，全屏按钮，进度条，点击视频区域控制控件ui显示/隐藏。ok。开干**

1. 先写视频播放区
```dart
class _MyVideoState extends State<MyVideo> {
  // ......
  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width,
      height: widget.height,
      color: Colors.black,
      child: widget.url!=null?Stack( // 因为控件ui和视频是重叠的，所以要用定位了
        children: <Widget>[
          GestureDetector( // 手势组件
            onTap: () { // 点击显示/隐藏控件ui
              _togglePlayControl();
            },
            child: _videoInit?
            Center(
              child: AspectRatio( // 加载url成功时，根据视频比例渲染播放器
                aspectRatio: _controller.value.aspectRatio,
                child: VideoPlayer(_controller),
              ),
            ):
            Center( // 没加载完成时显示转圈圈loading
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(),
              ),
            ),
          ),
          _bottomControl,// 控件ui下半部 看下面
        ],
      ):Center( // 判断是否传入了url，没有的话显示"暂无视频信息"
        child: Text(
          '暂无视频信息',
          style: TextStyle(
            color: Colors.white
          ),
        ),
      ),
    )
  }
  
  @override
  void initState() {
    _urlChange(); // 初始进行一次url加载
    super.initState();
  }

  @override
  void didUpdateWidget(MyVideo oldWidget) {
    if (oldWidget.url != widget.url) {
      _urlChange(); // url变化时重新执行一次url加载
    }
    super.didUpdateWidget(oldWidget);
  }

  @override
  void dispose() {
    if (_controller!=null) { // 惯例。组件销毁时清理下
      _controller.removeListener(_videoListener);
      _controller.dispose();
    }
    super.dispose();
  }
  
  void _urlChange() {
    if (widget.url==null || widget.url=='') return;
    if (_controller!=null) { // 如果控制器存在，清理掉重新创建
      _controller.removeListener(_videoListener);
      _controller.dispose();
    }
    setState(() { // 重置组件参数
      _hidePlayControl = true;
      _videoInit = false;
      _position = Duration(seconds: 0);
    });
    // 加载network的url，也支持本地文件，自行阅览官方api
    _controller = VideoPlayerController.network(widget.url)
    ..initialize().then((_) {
      // 加载资源完成时，监听播放进度，并且标记_videoInit=true加载完成
      _controller.addListener(_videoListener);
      setState(() {
        _videoInit = true;
      });
    });
  }
  void _videoListener() async {
    Duration res = await _controller.position;
    if (res >= _controller.value.duration) {
      _controller.pause();
      _controller.seekTo(Duration(seconds: 0));
    }
    setState(() {
      _position = res;
    });
  }
}
```
2. 然后编写控件ui
```dart
// 控件ui下半部
Widget _bottomControl = Positioned( // 需要定位
  left: 0,
  bottom: 0,
  child: Offstage( // 控制是否隐藏
    offstage: _hidePlayControl,
    child: AnimatedOpacity( // 加入透明度动画
      opacity: _playControlOpacity,
      duration: Duration(milliseconds: 300),
      child: Container( // 底部控件的容器
        width: widget.width,
        height: 40,
        decoration: BoxDecoration(
          gradient: LinearGradient( // 来点黑色到透明的渐变优雅一下
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [Color.fromRGBO(0, 0, 0, .7), Color.fromRGBO(0, 0, 0, .1)],
          ),
        ),
        child: _videoInit?Row( // 加载完成时才渲染,flex布局
          children: <Widget>[
            IconButton( // 播放按钮
              padding: EdgeInsets.zero,
              iconSize: 26,
              icon: Icon( // 根据控制器动态变化播放图标还是暂停
                _controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
                color: Colors.white,
              ),
              onPressed: (){
                setState(() { // 同样的，点击动态播放或者暂停
                  _controller.value.isPlaying
                    ? _controller.pause()
                    : _controller.play();
                  _startPlayControlTimer(); // 操作控件后，重置延迟隐藏控件的timer
                });
              },
            ),
            Flexible( // 相当于前端的flex: 1
              child: VideoProgressIndicator( // 嘻嘻，这是video_player编写好的进度条，直接用就是了~~
                _controller,
                allowScrubbing: true, // 允许手势操作进度条
                padding: EdgeInsets.all(0),
                colors: VideoProgressColors( // 配置进度条颜色，也是video_player现成的，直接用
                  playedColor: Theme.of(context).primaryColor, // 已播放的颜色
                  bufferedColor: Color.fromRGBO(255, 255, 255, .5), // 缓存中的颜色
                  backgroundColor: Color.fromRGBO(255, 255, 255, .2), // 为缓存的颜色
                ),
              ),
            ),
            Container( // 播放时间
              margin: EdgeInsets.only(left: 10),
              child: Text( // durationToTime是通过Duration转成hh:mm:ss的格式，自己实现。
                durationToTime(_position)+'/'+durationToTime(_controller.value.duration),
                style: TextStyle(
                  color: Colors.white
                ),
              ),
            ),
            IconButton( // 全屏/横屏按钮
              padding: EdgeInsets.zero,
              iconSize: 26,
              icon: Icon( // 根据当前屏幕方向切换图标
                _isFullScreen?Icons.fullscreen_exit:Icons.fullscreen,
                color: Colors.white,
              ),
              onPressed: (){ // 点击切换是否全屏
                _toggleFullScreen();
              },
            ),
          ],
        ):Container(),
      ),
    ),
  ),
);
```
3. 先看下显示/隐藏控件ui的方法
```dart
void _togglePlayControl() {
    setState(() {
      if (_hidePlayControl) { // 如果隐藏则显示
        _hidePlayControl = false;
        _playControlOpacity = 1;
        _startPlayControlTimer(); // 开始计时器，计时后隐藏
      } else { // 如果显示就隐藏
        if (_timer!=null) _timer.cancel(); // 有计时器先移除计时器
        _playControlOpacity = 0;
        Future.delayed(Duration(milliseconds: 300)).whenComplete(() {
          _hidePlayControl = true; // 延迟300ms(透明度动画结束)后，隐藏
        });
      }
    });
}

void _startPlayControlTimer() { // 计时器，用法和前端js的大同小异
    if (_timer!=null) _timer.cancel();
    _timer = Timer(Duration(seconds: 3), () { // 延迟3s后隐藏
      setState(() {
        _playControlOpacity = 0;
        Future.delayed(Duration(milliseconds: 300)).whenComplete(() {
          _hidePlayControl = true;
        });
      });
    });
}
```
4. 再来看下全屏的方法，此处采用了切换横屏竖屏的插件[orientation](https://pub.flutter-io.cn/packages/orientation)
```dart
void _toggleFullScreen() {
    setState(() {
      if (_isFullScreen) { // 如果是全屏就切换竖屏
        OrientationPlugin.forceOrientation(DeviceOrientation.portraitUp);
      } else {
        OrientationPlugin.forceOrientation(DeviceOrientation.landscapeRight);
      }
      _startPlayControlTimer(); // 操作完控件开始计时隐藏
    });
}
```
切换成横屏后，需要用`_isFullScreen`和`Offstage`把你不想显示的组件隐藏掉，例如appBar等等。

### 至此，已经完成我想要的效果。下面看下效果吧。
![效果图: https://cdn.chavesgu.com/flutter/SampleVideo.gif](https://cdn.chavesgu.com/flutter/SampleVideo.gif)

### 咳咳。
代码随意copy，重在学习，可以随时和我一起研究flutter，欢迎关注，后续有时间会继续分享flutter。
