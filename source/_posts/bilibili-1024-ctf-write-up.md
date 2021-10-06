---
title: Bilibili 1024 节 CTF Write Up
date: 2020-10-26 18:02:08
updated: 2020-10-26 18:02:08
categories:
  - 技术
tags:
  - CTF
  - Bilibili
feature: https://vip1.loli.io/2020/12/01/cZoPxLHXlkFSjrt.jpg
---

比赛地址： <https://security.bilibili.com/sec1024/>

## T1：页面的背后是什么？

~~F12 解决一切问题~~

![](https://vip2.loli.io/2020/11/28/XrLpIf2OHs4YAxJ.png)

## T2：真正的秘密只有特殊的设备才能看到

改下 UA 就行了，轻松到手

![](https://vip2.loli.io/2020/11/28/WPLCUHNYiE2nFwJ.png)

![](https://vip2.loli.io/2020/11/28/83GrjFbTwJf1BHn.png)

## T3：密码是啥？

看了看源码，没啥思路，最后随便试了试 `admin` `root` `bilibili` 什么的，竟然是对的。

- 用户名 `admin`
- 密码 `bilibili`

另外，你告诉我什么是 **falg** ？

![](https://vip1.loli.io/2020/11/28/eg9kBtR1aQizGYE.png)

## T4：对不起，权限不足～

第一次访问：

![](https://vip1.loli.io/2020/11/28/roVjXTfs4v8ibP5.png)

第二次访问：

![](https://vip1.loli.io/2020/11/28/RpEsGn8c9KY16MH.png)

查看源码可以发现有个 API 请求，查看请求数据得到以下信息。

![](https://vip1.loli.io/2020/11/28/nhF7pCTQsVYxKdj.png)

role 里面的东西，贴进谷歌一搜就知道它是 `user` 的 MD5 。

和超级管理员相关的名字相信大家都知道，无非就是 `admin` `Administrator` `root` 之类的东西。

挨个试，最后发现 `Administrator` 是正确的。

```shell
curl "http://45.113.201.36/api/ctf/4" --cookie "role=7b7bc2512ee1fedcd76bdc68926d4f7b; session=***;"
```

![](https://vip1.loli.io/2020/11/28/gEhkmTJrnaoMwPv.png)

## T5：别人的秘密

![](https://vip1.loli.io/2020/11/28/c4BjYs3nVuCpxmH.png)

发现有个 API，还有个 UID。

最开始没想到需要从代码里面的"初始 UID"开始扫，浪费了我好多时间。

```shell
for ((i=100336889;$i<9999999999;i=($i+1))); do echo -e "[$i] \c" && curl "http://45.113.201.36/api/ctf/5?uid=${i}" -H 'User-Agent: bilibili Security Browser' -H 'Cookie: session=*****; role=ee11cbb19052e40b07aac0ca060c23ee' ; done
```

![](https://vip1.loli.io/2020/11/28/m1Hr4u8FOJe7ycI.png)

## T6~T10：结束亦是开始，接下来的旅程，需要少年自己去探索啦～

先扫了扫端口，发现有个 redis

![](https://vip2.loli.io/2020/11/28/E29tLxSiC6Qzn5O.png)

```shell
redis-cli -h 120.92.151.189 -p 6379
```

登上去看看，发现了第八题的 flag 。

![](https://vip1.loli.io/2020/11/28/Oo5vyeEsChmSt2H.png)

然后爆破下目录

![](https://vip1.loli.io/2020/11/28/QEnxZsg8FpiOKwm.png)

有个 test.php ，访问下发现是个 JSfuck 加密，丢进浏览器里面解密下

![](https://vip1.loli.io/2020/11/28/G7TWPndrhqBmvAI.png)

程序员最多的地方，那就肯定是 Github 了。

然后找到了一个仓库 [interesting-1024/end](https://github.com/interesting-1024/end)

有个 `end.php`

```php
<?php

//filename end.php

$bilibili = "bilibili1024havefun";

$str = intval($_GET['id']);
$reg = preg_match('/\d/is', $_GET['id']);

if(!is_numeric($_GET['id']) and $reg !== 1 and $str === 1){
    $content = file_get_contents($_GET['url']);

    //文件路径猜解
    if (false){
        echo "还差一点点啦～";
    }else{
        echo $flag;
    }
}else{
    echo "你想要的不在这儿～";
}
?>
```

然后需要构造出一个 符合 `!is_numeric($_GET['id']) and preg_match('/\d/is', $_GET['id']) !== 1 and intval($_GET['id']) === 1` 的请求即可。

![](https://vip1.loli.io/2020/11/28/mCIevr1HSMBpkdi.png)

可以得到一个图片的链接 `http://45.113.201.36/blog/imgs/bilibili_224a634752448def6c0ec064e49fe797_havefun.jpg`

![](https://vip2.loli.io/2020/11/28/iXEgYzjPtH2NhQw.png)

这个图片的末尾就是第十个 flag 了（图中标蓝的地方）。
