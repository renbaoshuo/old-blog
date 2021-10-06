---
title: 修改 Git 配置加速 clone GitHub 源码
date: 2020-07-21 18:38:23
updated: 2020-07-21 18:38:23
categories:
  - 随笔
tags:
  - Git
---

设置代理：

```bash
# socks5协议，1080端口修改成自己的本地代理端口
git config --global http.https://github.com.proxy  socks5://127.0.0.1:1080
git config --global https.https://github.com.proxy socks5://127.0.0.1:1080

# http协议，7890端口修改成自己的本地代理端口
git config --global http.https://github.com.proxy  http://127.0.0.1:7890
git config --global https.https://github.com.proxy http://127.0.0.1:7890
```

之后运行 `git config -l` 即可查看代理设置情况。

清除代理：

```shell
git config --global --unset http.proxy
git config --global --unset https.proxy
```
