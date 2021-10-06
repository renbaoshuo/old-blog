---
title: 浅谈网页「深色模式」的实现
date: 2021-02-17 23:25:30
updated: 2021-02-20 19:25:30
categories:
  - 技术
tags:
  - Web
  - 前端
feature: 'https://vip2.loli.io/2021/02/17/2Ia7ONPMKQDyiBn.png'
---

随着越来越多的操作系统、浏览器开始支持 Dark Mode 和相应的 [Media Queries Level 5](https://drafts.csswg.org/mediaqueries-5/#prefers-color-scheme)，越来越多的网站开始添加深色模式。

我的博客其实早在 2019 年末就支持了深色模式，但一直没有很好地实现这个功能。于是在 2020 年的那个超长寒假，我把博客系统更换到了 Typecho，并与某位大佬一起实现了一个深色模式插件^（原文链接已丢失）^。正好今年寒假把博客换到了 Hexo 上，趁着主题代码还热乎、能看懂，赶紧来写写我的深色模式是如何实现的。

<!-- more -->

![现在的深色模式效果](https://vip2.loli.io/2021/02/17/tYEURzvx7LQ4mej.png)

## 关于深色模式

![](https://vip2.loli.io/2021/02/17/jXVHb1aAUf5pRhk.png)

Dark themes reduce the luminance emitted by device screens, while still meeting minimum color contrast ratios. They help improve visual ergonomics by reducing eye strain, adjusting brightness to current lighting conditions, and facilitating screen use in dark environments – all while conserving battery power.

> **翻译**
>
> 深色主题能降低设备屏幕发出的亮度，同时仍然满足最小的颜色对比度。它们有助于改善视觉效果、减少眼睛疲劳，调整亮度以适应当前的照明条件，并有助于在黑暗环境中使用屏幕，同时节省电池电量。

## 界面设计

### 颜色

**不要使用 100% 的纯黑**

Google 在 Material Design 的设计指南中对于深色模式列出了一系列设计规范，其中第一条就是 "不要使用 100% 的纯黑" 。

Google 推荐将深色表面和 100% 白色文字的对比度至少设置为为 15.8:1 （Dark surfaces and 100% white body text have a contrast level of at least 15.8:1）

为什么呢？因为纯白色会反射所有波长的光线，而纯黑色会吸收所有光线，这是对比度最大的两种颜色，白底黑字时，文字过于刺眼，而黑底白字时，文字又可能难以辨认。如果长时间阅读这样的文字，势必会让眼睛感觉到疲劳，与深色模式开发的初衷背道而驰。

Google 推荐使用 `#121212` 来作为深色模式的**主背景色**。

{% img https://vip2.loli.io/2021/02/17/QOjZ8D2PnW6wtSN.png 700 %}

A dark theme uses dark grey, rather than black, as the primary surface color for components. Dark grey surfaces can express a wider range of color, elevation, and depth, because it's easier to see shadows on grey (instead of black).

Dark grey surfaces also reduce eye strain, as light text on a dark grey surface has less contrast than light text on a black surface.

> **翻译**
>
> 深色主题应使用深灰而不是黑色作为组件的主要表面颜色。深灰色表面可以表示更广泛的颜色，高度和深度范围，因为更容易看到灰色阴影（而不是黑色）。
>
> 深灰色的表面还可以减少眼睛疲劳，因为深灰色表面上的浅色文本的对比度低于黑色表面上的浅色文本。

许多常见应用的深色模式背景色的 H 值都在 200~250 范围内（即蓝色范围），在纯灰色的基础上稍微偏冷一些。不过也有一些例外，比如网易云音乐的背景色有点偏暖，可能和其品牌色有关（网易云音乐的品牌色是暖红色）。

---

**不要让亮色占据过多面积**

在深色主题中应该尽可能地使用有限的颜色进行强调，并使大部分空间显示出深色表面。

{% img https://vip2.loli.io/2021/02/17/o1x4jPm92AWECZp.png 300 正确示例 %}

{% img https://vip1.loli.io/2021/02/17/SguCOs4WM5Gqd7I.png 300 错误示例 %}

---

**不要使用过高的色彩饱和度**

在深色模式下，过高的色彩饱和度可能会使文本像下方这样难以辨识（清晰度降低）：

![这张图片中的文本辨识度较低](https://vip1.loli.io/2021/02/17/u16JvHsZBgeFYER.png)

色彩饱和度过高还可能会导致文本在深色背景上产生光学振动，从而引起眼睛疲劳。

最佳做法是使用「去饱和色」，这样可以提高清晰度，并减少视觉抖动。

![这张图片中的文本较上方的图片来说文本辨识度提高了许多](https://vip2.loli.io/2021/02/17/YxOwh46ZFNIC5Rg.png)

### 层次

在浅色模式下，我们通常会使用投影来区分页面内元素的层次，但这种方法在深色模式中如果使用不当，不仅起不到区分页面内元素层次的作用，还会影响整体观感，起到反作用。

![Google 给出的示例](https://vip1.loli.io/2021/02/17/O7qzgYK98DGLvCV.png)

---

![WWDC 2019 中苹果设计师讲到深色模式的文本](https://vip1.loli.io/2021/02/17/Amac2CMl4bzurYe.png)

Apple 认为在浅色模式下投影能轻松地区分两个视觉元素，但是在深色模式下作用甚微。所以他们建议在深色背景下，对前置元素的使用稍亮的灰色。

---

![](https://vip1.loli.io/2021/02/17/OHZqYmAaQDJ9RBe.png)

在组件表面^(1)^上放置一个白色半透明的遮罩层^(2)^，就可以体现出深色模式中的层次。

## 代码实现

这个主题使用了向 `body` 添加 `.dark` 类来实现深色模式。

### 利用 Media Query 简单实现深色模式

可以直接为深色模式编写独立的样式：

```css
body {
  color: #111;
}

@media (prefers-color-scheme: dark) {
  body.dark {
    color: #eee;
  }
}
```

更进一步地，还可以使用 CSS Variable 来简化代码：

```css
:root {
  --text: #111;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #eee;
  }
}

body {
  color: var(--text);
}
```

还可以利用 `<link>` 标签的 Media Query 来有条件地加载文件，节省流量：

```css
/* main.css */
body {
  color: #111;
}

/* dark.css */
body {
  color: #eee;
}
```

需要注意 CSS 选择器的权重，因此作为可选的 `dark.css` 一定要放在 `main.css` 之后加载。

```html
<link rel="stylesheet" href="main.css" />
<link rel="stylesheet" href="dark.css" media="(prefers-color-scheme: dark)" />
```

### 使用 Media Query + JavaScript 实现跟随系统/定时切换深色模式

```css
:root {
  --text: #111;
}

.dark {
  --text: #eee;
}

body {
  color: var(--text);
}
```

这段 CSS 与先前的并没有什么差别，而且与其相对应的 JavaScript 也很好编写。

```javascript
document.addEventListener('DOMContentLoaded', (event) => {
  if (
    (window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches) ||
    new Date().getHours() >= 19 ||
    new Date().getHours() < 7
  ) {
    document.body.classList.add('dark');
  }
});
```

此段代码中开启深色模式的条件有两个：

- 系统开启了深色模式
- 时间在晚 7 点~早 7 点之间

只要满足上述任意一个条件，深色模式就会被开启。

### 使用 Media Query + Toggle Button 实现跟随系统/手动切换深色模式

```css
:root {
  --text: #111;
}

.dark {
  --text: #eee;
}

body {
  color: var(--text);
}
```

这段 CSS 与先前的并没有什么差别，下面就是令人头大的 JavaScript 部分了。

先定义一些常量：

```javascript
const rootElement = document.documentElement;
const darkModeClassName = 'dark';
const darkModeStorageKey = 'user-color-scheme';
const darkModeTogglebuttonElement = document.getElementById(
  'dark-mode-toggle-button'
);
const validColorModeKeys = { dark: true, light: true };
const invertDarkModeObj = { dark: 'light', light: 'dark' };
```

接下来使用 `try {} catch (e) {}` 封装一下 localStorage 的操作，以应对 HTML5 Storage 被禁用、localStorage 被写满、localStorage 实现不完整的情况：

```javascript
const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {}
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

const getLocalStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null; // 与 localStorage 中没有找到对应 key 的行为一致
  }
};
```

获取当前 `prefers-color-scheme` 的方法：

```javascript
const getModeFromCSSMediaQuery = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};
```

再写一个清除 Class 和 LocalStorage 的函数：

```javascript
const resetRootDarkModeClassAndLocalStorage = () => {
  rootElement.classList.remove(darkModeClassName);
  rootElement.classList.remove(invertDarkModeObj[darkModeClassName]);
  removeLocalStorage(darkModeStorageKey);
};
```

接下来就是起主要作用的函数了，负责为 `<body>` 标签增删深色模式的 Class ：

```javascript
const applyCustomDarkModeSettings = (mode) => {
  // 接受从「开关」处传来的模式，或者从 localStorage 读取
  const currentSetting = mode || getLocalStorage(darkModeStorageKey);

  if (currentSetting === getModeFromCSSMediaQuery()) {
    // 当用户自定义的显示模式和 prefers-color-scheme 相同时重置、恢复到自动模式
    resetRootDarkModeClassAndLocalStorage();
  } else if (validColorModeKeys[currentSetting]) {
    rootElement.classList.add(currentSetting);
    rootElement.classList.remove(invertDarkModeObj[currentSetting]);
  } else {
    // 首次访问或从未使用过开关、localStorage 中没有存储的值，currentSetting 是 null
    // 或者 localStorage 被篡改，currentSetting 不是合法值
    resetRootDarkModeClassAndLocalStorage();
  }
};
```

还需要一个函数负责获取相反的显示模式，并将其存储到 LocalStorage 中

```javascript
const toggleCustomDarkMode = () => {
  let currentSetting = getLocalStorage(darkModeStorageKey);

  if (validColorModeKeys[currentSetting]) {
    // 从 localStorage 中读取模式，并取相反的模式
    currentSetting = invertDarkModeObj[currentSetting];
  } else if (currentSetting === null) {
    // localStorage 中没有相关值，或者 localStorage 抛了 Error
    // 从 CSS 中读取当前 prefers-color-scheme 并取相反的模式
    currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
  } else {
    // 不知道出了什么幺蛾子，比如 localStorage 被篡改成非法值
    return; // 直接 return;
  }
  // 将相反的模式写入 localStorage
  setLocalStorage(darkModeStorageKey, currentSetting);

  return currentSetting;
};
```

相关的函数都定义完了，是时候添加执行了：

```javascript
// 当页面加载时，将显示模式设置为 localStorage 中自定义的值（如果有的话）
applyCustomDarkModeSettings();
```

```javascript
// 当用户点击「开关」时，获得新的显示模式、写入 localStorage、并在页面上生效
darkModeTogglebuttonElement.addEventListener('click', () => {
  applyCustomDarkModeSettings(toggleCustomDarkMode());
});
```

<iframe src="https://codesandbox.io/embed/shiyong-media-query-toggle-button-shixiangensuixitongshoudongqiehuanshensemoshi-7d60d?autoresize=1&fontsize=16&theme=dark&view=preview" style="width:100%; height:500px; border:0; border-radius: 4px; overflow: hidden;" title="使用 Media Query + Toggle Button 实现跟随系统/手动切换深色模式" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe>

### 使用 Media Query + Toggle Button + JavaScript 实现跟随系统/定时/手动切换深色模式

CSS 和大部分 JavaScript 代码没有变化，此处仅说明有变化的代码。

在函数 `toggleCustomDarkMode()` 中添加写入一个时间戳的操作：

```diff
@@ -85,19 +114,20 @@
 const toggleCustomDarkMode = () => {
     let currentSetting = getLocalStorage(darkModeStorageKey);

     if (validColorModeKeys[currentSetting]) {
         // 从 localStorage 中读取模式，并取相反的模式
         currentSetting = invertDarkModeObj[currentSetting];
     } else if (currentSetting === null) {
         // localStorage 中没有相关值，或者 localStorage 抛了 Error
         // 从 CSS 中读取当前 prefers-color-scheme 并取相反的模式
         currentSetting = invertDarkModeObj[getModeFromCSSMediaQuery()];
     } else {
         // 不知道出了什么幺蛾子，比如 localStorage 被篡改成非法值
         return; // 直接 return;
     }
     // 将相反的模式写入 localStorage
     setLocalStorage(darkModeStorageKey, currentSetting);
+    setLocalStorage(darkModeTimeKey, +new Date());

     return currentSetting;
};
```

重新编写入口，用来检测是否符合定时条件：

```javascript
const initDarkMode = (nowTime) => {
  const lastSunrise = (
    nowTime.getHours() < 7
      ? new Date(
          nowTime.getFullYear(),
          nowTime.getMonth(),
          nowTime.getDate() - 1,
          7
        )
      : new Date(
          nowTime.getFullYear(),
          nowTime.getMonth(),
          nowTime.getDate(),
          7
        )
  ).getTime(); // 日出
  const lastSunset = (
    nowTime.getHours() < 19
      ? new Date(
          nowTime.getFullYear(),
          nowTime.getMonth(),
          nowTime.getDate() - 1,
          19
        )
      : new Date(
          nowTime.getFullYear(),
          nowTime.getMonth(),
          nowTime.getDate(),
          19
        )
  ).getTime(); // 日落
  const darkModeTime = new Date(
    parseInt(getLocalStorage(darkModeTimeKey) || '0', 10)
  ).getTime();
  nowTime = nowTime.getTime();
  if (lastSunrise < lastSunset) {
    // 日出比日落早表示晚上
    if (lastSunset < darkModeTime) {
      // 当晚自行调整过日间/夜间模式
      applyCustomDarkModeSettings();
    } else {
      applyCustomDarkModeSettings(darkModeClassName);
    }
  } else {
    // 日出比日落晚表示白天
    if (lastSunrise < darkModeTime) {
      applyCustomDarkModeSettings();
    } else {
      applyCustomDarkModeSettings(invertDarkModeObj[darkModeClassName]);
    }
  }
};

initDarkMode(new Date());
```

<iframe src="https://codesandbox.io/embed/shiyong-media-query-toggle-button-javascript-shixiangensuixitongdingshishoudongqiehuanshensemoshi-dyei7?autoresize=1&fontsize=14&theme=dark&view=preview" style="width: 100%; height: 500px; border: 0; border-radius: 4px; overflow: hidden;" title="使用 Media Query + Toggle Button + JavaScript 实现跟随系统/定时/手动切换深色模式" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"></iframe>

### 深色模式下的页面滚动条

只需在页面的 `<head>` 中添加一个 [`<meta name="color-scheme">`](https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme) 的标签即可让页面滚动条的样式跟随深色模式变化。

```html
<!--
  The page supports both light and dark color schemes,
  and the page author prefers light.
-->
<meta name="color-scheme" content="light dark" />
```

如果你使用类似上一节所示的切换按钮的话，别忘了添加下面的 CSS ：

```css
/*
  The page supports both light and dark color schemes,
  and the page author prefers light.
*/
:root {
  color-scheme: light;
}
.dark {
  color-scheme: dark;
}
```

## Disqus 相关

如果网页上有 Disqus 评论系统，请添加下方的 CSS 以避免 Disqus 的自动深色模式失效。

```css
iframe {
  color-scheme: light;
}
```

_来源：[Disqus iframe transparency won't work on Chrome 87 - StackOverflow](https://stackoverflow.com/a/65313819/14109955)_

## 参考资料

1. [Dark theme - Material Design](https://material.io/design/color/dark-theme.html)
2. [What's New in iOS Design - WWDC 2019](https://developer.apple.com/videos/play/wwdc2019/808/)
3. [你好黑暗，我的老朋友 —— 为网站添加用户友好的深色模式支持 - Sukka's Blog](https://blog.skk.moe/post/hello-darkmode-my-old-friend/)
4. [Improved dark mode default styling with the color-scheme CSS property and the corresponding meta tag - web.dev](https://web.dev/color-scheme/)

_文章头图来自：https://material.io/design/color/dark-theme.html_
