---
title: 初识 Service Worker —— 使用 Workbox 快速开发 Service Worker
date: 2021-02-28 00:02:04
updated: 2021-02-28 00:02:04
categories:
  - 技术
tags:
  - Web
  - ServiceWorker
  - JavaScript
feature: 'https://vip1.loli.io/2021/02/28/kdnvD8ACWBa1tbI.png'
---

对于优化前端加载性能这个问题，许多人以 http-cache、异步加载、304 状态码、文件压缩、CDN 等方法来解决。  
其实除了这些方法，还有一个比它们都强大的，那就是 Service Worker 。

<!-- more -->

我们可以使用 Google Chrome 团队的 [Workbox](https://github.com/GoogleChrome/workbox) 来实现 Service Worker 的快速开发。

## 注册 Service Worker

在页面中添加以下内容以注册一个 Service Worker 。

```html
<script>
  // 检测是否支持 Service Worker
  // 也可使用 navigator.serviceWorker 判断
  if ('serviceWorker' in navigator) {
    // 为了保证首屏渲染性能，在页面 onload 完之后注册 Service Worker
    // 不使用 window.onload 以免冲突
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

当然，在这之前你需要先有一个 Service Worker 的代码 `/sw.js` 。

你可以在这个文件中写入以下代码来检测是否成功地注册了 Service Worker 。

```javascript
console.clear();
console.log('Successful registered service worker.');
```

![控制台输出](https://vip2.loli.io/2021/02/28/Eu4mVIC2kNrUgiL.png)

## 引入 Workbox

你可以使用 Google 提供的 CDN 来引入 Workbox 。  
只需在 `sw.js` 的开头写入以下内容即可：

```javascript
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.1.1/workbox-sw.js'
);
```

如果你觉得 Google 的 CDN 不太靠谱的话，可以使用 `workbox-cli` 将资源存在本地：

```bash
npm i workbox-cli -g
workbox copyLibraries {path/to/workbox/}
```

这时需要在 `sw.js` 的开头将上方写入的内容替换为以下内容即可：

```javascript
importScripts('{path/to}/workbox/workbox-sw.js');
workbox.setConfig({
  modulePathPrefix: '{path/to}/workbox/',
});
```

## Workbox 策略

### Stale While Revalidate（重新验证时过期）

![工作流程示意图](https://vip1.loli.io/2021/02/28/rx8zafbqPe1JnkX.png)

此策略将对网络请求使用缓存来响应（如果有），并在后台更新缓存。如果未缓存，它将等待网络响应并使用它。  
这是一个相当安全的策略，因为这意味着用户会定期更新其缓存。这种策略的缺点是：它总是从网络上请求资源，较为浪费用户的带宽。

```javascript
registerRoute(
  new RegExp(matchString),
  new workbox.strategies.StaleWhileRevalidate()
);
```

### Network First（网络优先）

![工作流程示意图](https://vip2.loli.io/2021/02/28/9ViWk1ZyU4CuDxE.png)

此策略将尝试首先从网络获得响应。如果收到响应，它将把它传递给浏览器，并将其保存到缓存中。如果网络请求失败，将使用最后一个缓存的响应。

```javascript
registerRoute(new RegExp(matchString), new workbox.strategies.NetworkFirst());
```

### Cache First（缓存优先）

![工作流程示意图](https://vip1.loli.io/2021/02/28/jkn4Y3mNCRZrSdX.png)

此策略将首先检查缓存中是否有响应，如果有响应，则使用该策略。如果请求不在缓存中，则将使用网络，并将任何有效响应添加到缓存中，然后再传递给浏览器。

```javascript
registerRoute(new RegExp(matchString), new workbox.strategies.CacheFirst());
```

### Network Only（仅网络）

![工作流程示意图](https://vip2.loli.io/2021/02/28/cQYTlvie1dX8hOF.png)

强制响应来自网络。

```javascript
registerRoute(new RegExp(matchString), new workbox.strategies.NetworkOnly());
```

### Cache Only（仅缓存）

![工作流程示意图](https://vip1.loli.io/2021/02/28/71Sw5tTaBQKl8ri.png)

强制响应来自缓存。

```javascript
registerRoute(new RegExp(matchString), new workbox.strategies.CacheOnly());
```

### 策略配置

可以通过定义要使用的插件来自定义路由的行为。

```javascript
new workbox.strategies.StaleWhileRevalidate({
    // Use a custom cache for this route.
    cacheName: 'my-cache-name',

    // Add an array of custom plugins (e.g. `ExpirationPlugin`).
    plugins: [
        ...
    ]
});
```

## Workbox 中的自定义策略

在某些情况下，您可能希望使用自己的其他策略来响应请求，或者只是通过模板在 Service Worker 中生成请求。  
为此可以提供一个异步返回 `Response` 对象的函数 `handler` 。

```javascript
const handler = async ({ url, event }) => {
  return new Response(`Custom handler response.`);
};

workbox.routing.registerRoute(new RegExp(matchString), handler);
```

需要注意的是，如果在 `match` 回调中返回一个值，它将 `handler` 作为 `params` 参数传递到回调中。

```javascript
const match = ({ url, event }) => {
  if (url.pathname === '/example') {
    return {
      name: 'Workbox',
      type: 'guide',
    };
  }
};

const handler = async ({ url, event, params }) => {
  // Response will be "A guide to Workbox"
  return new Response(`A ${params.type} to ${params.name}`);
};

workbox.routing.registerRoute(match, handler);
```

如果 URL 中的某些信息可以在 match 回调中解析一次并在中使用，则这可能会对 `handler` 有所帮助。

## Workbox 实践

通常对于大部分项目使用 Workbox 时一般会引入相应的 gulp 或者 webpack 插件，在构建流程中完成对 Service Worker 的注册、将指定 URL 进行 Precache、完成 sw.js 的生成，等等。  
但是对于 Hexo、Jekyll 这些静态站点生成器或者 WordPress、Typecho 这些 CMS，如果不安装相应的插件，就需要自己从头编写一个 `sw.js`。

先写一下总的配置：

```javascript
let cacheSuffixVersion = '-210227'; // 缓存版本号
const maxEntries = 100; // 最大条目数

core.setCacheNameDetails({
  prefix: 'baoshuo-blog', // 前缀
  suffix: cacheSuffixVersion, // 后缀
});
```

### Google Fonts

Google Fonts 主要使用两个域名：`fonts.googleapis.com` 和 `fonts.gstatic.com` ，因此只需在匹配到这两个域名时进行缓存。

```javascript
workbox.routing.registerRoute(
  // 匹配 fonts.googleapis.com 和 fonts.gstatic.com 两个域名
  new RegExp('^https://(?:fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)'),
  new workbox.strategies.StaleWhileRevalidate({
    // cache storage 名称和版本号
    cacheName: 'font-cache' + cacheSuffixVersion,
    plugins: [
      // 使用 expiration 插件实现缓存条目数目和时间控制
      new workbox.expiration.ExpirationPlugin({
        // 最大保存项目
        maxEntries,
        // 缓存 30 天
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
      // 使用 cacheableResponse 插件缓存状态码为 0 的请求
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
```

### jsDelivr CDN

使用 jsDelivr CDN 时如果指定了库的版本，对应的文件可以称得上是永久不会改变的，所以使用 `CacheFirst` 来进行缓存。

```javascript
workbox.routing.registerRoute(
  new RegExp('^https://cdn\\.jsdelivr\\.net'),
  new workbox.strategies.CacheFirst({
    cacheName: 'static-immutable' + cacheSuffixVersion,
    fetchOptions: {
      mode: 'cors',
      credentials: 'omit',
    },
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
    ],
  })
);
```

### Google Analytics

Workbox 有一个 [Google Analytics 离线统计插件](https://developers.google.com/web/tools/workbox/guides/enable-offline-analytics)，可惜我用的是 Sukka 大佬编写的[非官方 Google Analytics 实现](https://github.com/SukkaW/cloudflare-workers-async-google-analytics)，所以只能添加一个 `NetworkOnly` 来放弃离线统计。

```javascript
workbox.routing.registerRoute(
  new RegExp('^https://api\\.baoshuo\\.ren/cfga/(.*)'),
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin('Optical_Collect', {
        maxRetentionTime: 12 * 60, // Retry for max of 12 Hours (specified in minutes)
      }),
    ],
  })
);
```

### 图片

由于我开通了 SM.MS 的 LifeTime Premium VIP ，所以图片当然是要存到这里啦~

SM.MS 的图片域名有这几个：`i.loli.net`、`vip1.loli.net`、`vip2.loli.net`、`vip1.loli.io`、`vip2.loli.io`，只需要写一个正则匹配下就好了。

由于图片链接对应的文件像 jsDelivr 一样也是几乎永久都不会改变的，所以使用 `CacheFirst` 来进行缓存。

```javascript
workbox.routing.registerRoute(
  new RegExp('^https://(?:i|vip[0-9])\\.loli\\.(?:io|net)'),
  new workbox.strategies.CacheFirst({
    cacheName: 'img-cache' + cacheSuffixVersion,
    plugins: [
      // 使用 expiration 插件实现缓存条目数目和时间控制
      new workbox.expiration.ExpirationPlugin({
        maxEntries, // 最大保存项目
        maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存 30 天
      }),
      // 使用 cacheableResponse 插件缓存状态码为 0 的请求
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
```

### 友情链接

这些文件只是偶尔更新，使用 `StaleWhileRevalidate` ，可以兼顾速度与版本更新。

```javascript
workbox.routing.registerRoute(
  new RegExp('^https://friends\\.baoshuo\\.ren(.*)(png|jpg|jpeg|svg|gif)'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'img-cache' + cacheSuffixVersion,
    fetchOptions: {
      mode: 'cors',
      credentials: 'omit',
    },
  })
);
workbox.routing.registerRoute(
  new RegExp('https://friends\\.baoshuo\\.ren/links.json'),
  new workbox.strategies.StaleWhileRevalidate()
);
```

### Disqus 评论

DisqusJS 判断访客的 Disqus 可用性是通过检查 `shortname.disqus.com/favicon.ico` 和 `disqus.com/favicon.ico` ，显然是不能被缓存的。  
API 可以在无网络时使用 `NetworkFirst` 来达到无网络时也能查看评论的效果。  
另外 Disqus 本身也没有缓存的必要，所以对 `*.disqus.com` 使用 `NetworkOnly` 即可。  
但是 `*.disquscdn.com` 下的头像、JS、CSS 是可以缓存一段时间的，所以使用 `CacheFirst` 缓存 10 天。

```javascript
// API
workbox.routing.registerRoute(
  new RegExp('^https://api\\.baoshuo\\.ren/disqus/(.*)'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'dsqjs-api' + cacheSuffixVersion,
    fetchOptions: {
      mode: 'cors',
      credentials: 'omit',
    },
    networkTimeoutSeconds: 3,
  })
);
// Disqus
workbox.routing.registerRoute(
  new RegExp('^https://(.*)disqus\\.com'),
  new workbox.strategies.NetworkOnly()
);
workbox.routing.registerRoute(
  new RegExp('^https://(.*)disquscdn\\.com(.*)'),
  new workbox.strategies.CacheFirst({
    cacheName: 'disqus-cdn-cache' + cacheSuffixVersion,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 10 * 24 * 60 * 60,
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);
```

### 后缀匹配

针对其余没有被域名匹配到的静态文件，通过文件后缀进行匹配并使用 `StaleWhileRevalidate` ，可以兼顾速度与版本更新。

```javascript
workbox.routing.registerRoute(
  new RegExp('.*.(?:png|jpg|jpeg|svg|gif|webp)'),
  new workbox.strategies.StaleWhileRevalidate()
);
workbox.routing.registerRoute(
  new RegExp('.*.(css|js)'),
  new workbox.strategies.StaleWhileRevalidate()
);
```

### 默认行为

使用 Workbox 的 defaultHandler 匹配剩下的请求（包括页面自身），一律使用 `NetworkFirst` ，借助 Workbox 的 `runtimeCache` 起到加速和离线效果。

```javascript
workbox.routing.setDefaultHandler(
  new workbox.strategies.NetworkFirst({
    networkTimeoutSeconds: 3,
  })
);
```

## 参考资料

_文章头图来自：https://developers.google.com/web/tools/workbox_

_[Workbox 策略](#Workbox-策略) 一节中的配图来自：https://web.dev/offline-cookbook/_

- [Workbox - Google Developers](https://developers.google.com/web/tools/workbox/)
- [Workbox, not sw-toolbox & sw-precache - Sukka's Blog](https://blog.skk.moe/post/hello-workbox/)
- [GoogleChrome/workbox - GitHub](https://github.com/GoogleChrome/workbox)
- [The Offline Cookbook - web.dev](https://web.dev/offline-cookbook/#serving-suggestions)
