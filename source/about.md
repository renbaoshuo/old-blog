---
title: 关于
permalink: /about/
layout: about
feature: https://cdn.jsdelivr.net/npm/bsi@0.0.5/banner/1600x900.png
---

## 关于博客

English version is on Medium: [baoshuo.medium.com](https://baoshuo.medium.com).

### 图片

图片托管于 [SM.MS 图床](https://sm.ms) 上，图片域名为 `vip[1-2].loli.(?:net|io)` ，如果您使用代理连接至国际互联网，请将这些域名添加至代理列表。

### 评论

评论默认使用 [Disqus](https://disqus.com) 评论系统，如果无法连接至 Disqus 则会使用 [DisqusJS](https://github.com/SukkaW/DisqusJS) 渲染评论列表。如果您使用代理连接至国际互联网，请将 `*.disqus.com` `disq.us` `*.disquscdn.com` 加入代理列表。

<details>
<summary>评论语法</summary>

Disqus 评论支持使用部分 **HTML** 标签。
注：下方的 `{{ text }}` 表示显示文字，`{{ link }}` 表示链接，`{{ code }}` 表示代码，`{{ code_language }}` 表示代码语言。

下方列出了一些能使用的常用标签。为了方便查看，这些标签都是以单行形式呈现的。

<!-- prettier-ignore -->
|  语法  |  含义  |
| ------ | ----- |
| `<b>{{ text }}</b>` | 粗体文本 |
| `<blockquote>{{ text }}</blockquote>` | 引用文本 |
| `<i>{{ text }}</i>` | 斜体文本 |
| `<a href="{{ link }}">{{ text }}</a>` | 超链接 |
| `<code>{{ code }}</code>` | 行内代码 |
| `<pre><code class="{{ code_language }}">{{ code }}</code></pre>` | 代码块 |

详情请见：[What HTML tags are allowed within comments? - Disqus Help](https://help.disqus.com/en/articles/1717235-what-html-tags-are-allowed-within-comments)

</details>

<details>
<summary>评论设置</summary>

<button style="background: #3273dc; color: #fff; border: 0; border-radius: 4px; padding: .25rem .75rem;" id="checkComment" onclick="localStorage.setItem('dsqjs_mode','dsqjs');document.getElementById('disqusjs-status').innerHTML=`成功切换至 DisqusJS 评论系统。`;">强制使用 DisqusJS</button>
<button style="background: #3273dc; color: #fff; border: 0; border-radius: 4px; padding: .25rem .75rem;" id="checkComment" onclick="localStorage.setItem('dsqjs_mode','disqus');document.getElementById('disqusjs-status').innerHTML=`成功切换至 Disqus 评论系统。`;">强制使用原版 Disqus</button>

<span id="disqusjs-status"></span>

</details>

<details>
<summary>评论检测</summary>

Disqus: <span id="check-disqus">尚未检测</span><br>
Disqus API (via api.baoshuo.ren): <span id="check-disqus-api">尚未检测</span><br>
Disqus CDN: <span id="check-disqus-cdn">尚未检测</span><br>

<button style="background: #3273dc; color: #fff; border: 0; border-radius: 4px; padding: .25rem .75rem;" id="checkComment" onclick="this.style.display='none';checkDisqus();">检测</button>

<script>
function checkDisqus() {
    // document.getElementById('checkComment').style.display = 'none';
    // Disqus
    const disqusFavicon = new Image;
    const disqusTimeout = setTimeout(function () {
        disqusFavicon.onerror = disqusFavicon.onload = null;
        document.getElementById('check-disqus').innerHTML = `<span style="color: red;">失败</span>`;
    }, 3000);
    disqusFavicon.onerror = function () {
        clearTimeout(disqusTimeout);
        document.getElementById('check-disqus').innerHTML = `<span style="color: red;">失败</span>`;
    };
    disqusFavicon.onload = function () {
        clearTimeout(disqusTimeout);
        document.getElementById('check-disqus').innerHTML = `<span style="color: green;">成功</span>`;
    };
    disqusFavicon.src = `https://disqus.com/favicon.ico?${+(new Date)}=${+(new Date)}`;

    // Disqus API
    // https://api.baoshuo.ren/check
    fetch(`https://api.baoshuo.ren/check?${+(new Date)}=${+new Date()}`)
        .then(data => document.getElementById('check-disqus-api').innerHTML = `<span style="color: green;">成功</span>`)
        .catch(error => document.getElementById('check-disqus-api').innerHTML = `<span style="color: red;">失败</span>`);

    // Disqus CDN
    // https://c.disquscdn.com/next/embed/assets/img/disqus-social-icon-dark.a621bea3e02c9fa04fd3965a3d6f424d.svg
    const disqusCDNLogo = new Image;
    const disqusCDNLogoTimeout = setTimeout(function () {
        disqusCDNLogo.onerror = disqusCDNLogo.onload = null;
        document.getElementById('check-disqus-cdn').innerHTML = `<span style="color: red;">失败</span>`;
    }, 3000);
    disqusCDNLogo.onerror = function () {
        clearTimeout(disqusCDNLogoTimeout);
        document.getElementById('check-disqus-cdn').innerHTML = `<span style="color: red;">失败</span>`;
    };
    disqusCDNLogo.onload = function () {
        clearTimeout(disqusCDNLogoTimeout);
        document.getElementById('check-disqus-cdn').innerHTML = `<span style="color: green;">成功</span>`;
    };
    disqusCDNLogo.src = `https://c.disquscdn.com/next/embed/assets/img/disqus-social-icon-dark.a621bea3e02c9fa04fd3965a3d6f424d.svg?${+(new Date)}=${+(new Date)}`;
};
</script>

</details>

### CDN

部分静态资源使用 jsDelivr CDN 提供加速服务。

### 博客历程

- **2019/01/30** 开通博客，托管于 [洛谷博客](https://baoshuo.blog.luogu.org) 上。
- **2019/08/20** 注册 `baoshuo.ren` 域名。
- **2020/01/27** 切换到 [Typecho](https://www.typecho.org) 平台，使用 [handsome](https://www.ihewro.com/archives/489/) 主题。
- **2020/06/23** 切换到 [Gridea](https://gridea.dev) 平台，使用 [Pure](https://github.com/imhanjie/gridea-theme-pure) 主题。
- **2020/07/22** 更换到新域名 `baoshuo.blog` 。
- **2020/11/25** 将所有图片迁移到 SM.MS 图床上。
- **2020/12/06** 换回旧域名 `blog.baoshuo.ren` ，迁回到国内服务器。
- **2021/02/01** 切换到 [Hexo](https://hexo.io) 平台，使用 [Pure](https://github.com/renbaoshuo/hexo-theme-pure) 主题。
- **2021/02/23** 重构主题。
- **2021/04/18** 重构文章页面。
- **2021/08/14** 重构归档页面。
- **2021/08/26** 再次重构主题，修复了深色模式无法正常切换的问题。
- **2021/09/22** 将 OI 相关内容移至 [oi.baoshuo.ren](https://oi.baoshuo.ren) 。

## 关于我

一个很正经的人。

很惭愧，就做了一点微小的贡献。

<span id="baoshuo-age"></span>在上学。

<script>(function(){document.getElementById('baoshuo-age').innerHTML=`现在 <b>${Math.floor((+new Date() - 1151942400000) / 31536000000)}</b> 岁，`;})();</script>

### 在干什么事情

- 学习文化课。
- 学习 [信息学奥林匹克竞赛](https://www.noi.cn) 相关知识。
- 学习 [计算机网络](https://zh.wikipedia.org/zh-cn/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C) 相关知识。
- 运营 [AS141776](https://net.baoshuo.ren) ，一个中立性的教育与科研网络。
- 运营 [AS4242420247](https://dn42.baoshuo.ren) ，一个中立性的实验网络。
- 代运营 [AS142566](https://net.baoyun.ren) 。

### 说什么语言

- 中文 (zh-CN) <span style="color: green; font-family: monospace;">★★★★★</span>（母语）
- 英文 (en-US) <span style="color: orange; font-family: monospace;">★★★☆☆</span>

### 会什么东西

- C++ <span style="color: green; font-family: monospace;">★★★★☆</span>
- HTML <span style="color: green; font-family: monospace;">★★★★☆</span> <small>(HTML is a programming language!)</small>
- C <span style="color: green; font-family: monospace;">★★★★☆</span>
- JavaScript <span style="color: green; font-family: monospace;">★★★★☆</span>
- CSS <span style="color: green; font-family: monospace;">★★★★☆</span>
- PHP <span style="color: orange; font-family: monospace;">★★★☆☆</span>
- Python <span style="color: orange; font-family: monospace;">★★★☆☆</span>
- ShellScript <span style="color: orange; font-family: monospace;">★★★☆☆</span>

### 关于竞赛

> 竞赛不是火，却能点亮一生。  
> <span style="text-align: right; display: block;">—— 石家庄二中实验学校 · 信息技术中心</span>

## 联系我

- 主页： [baoshuo.ren](https://baoshuo.ren)
- 邮箱： [i@baoshuo.ren](mailto:i@baoshuo.ren)
- Telegram：[@baoshuo](https://t.me/baoshuo)
- Twitter：[@renbaoshuo](https://twitter.com/renbaoshuo)

## 版权相关

本博客使用 [Hexo](https://hexo.io) 构建博客，主题为 [Pure](https://github.com/renbaoshuo/hexo-theme-pure) 主题（修改版）。

博客上所有文章除特别声明外，均采用 <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/legalcode">知识共享 署名-非商业性使用-相同方式共享 4.0 国际许可协议</a> 进行许可。转载请在文中明显位置注明出处。
