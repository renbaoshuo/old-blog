---
title: NOI Linux 2.0 上手体验
date: 2021-08-08 21:44:33
updated: 2021-08-08 21:44:33
categories:
  - 随笔
tags:
  - Linux
  - VMware
feature: 'https://vip2.loli.io/2021/08/15/POMht9fim1vVKcp.png'
---

时隔多年，CCF 终于发布了新版的 NOI Linux ，替换了以前基于 Ubuntu 14.04 的 NOI Linux 1.4.1。

<!-- more -->

在 NOI Linux 2.0 发布的当天，我就迫不及待地下载好了镜像（[`ubuntu-noi-v2.0.iso`](https://noiresources.ccf.org.cn/ubuntu-noi-v2.0.iso)），但由于时间原因，没有第一时间进行体验。

## 安装

首先先新建好一台虚拟机。

![](https://vip2.loli.io/2021/07/25/ceaObqknR3FTtlU.png)

新建虚拟机及挂载镜像的步骤不再过多叙述，在安装时需要断开网络连接。

![开屏就是自定义的启动加载界面](https://vip2.loli.io/2021/07/25/PeYV6lquxawzL7b.png)

安装后需要连接网络，运行 `sudo apt update` 更新软件包列表，然后安装 `open-vm-tools-desktop` ，安装完成后建议重启虚拟机。

## 简单体验

### 整体评价

1. 在考场上如果提供 NOI Linux 虚拟机的话，可能需要手动安装 VMware Tools （因为没网所以不能装 Open VM Tools），略麻烦。
2. 系统操作有点卡，不知道是不是因为虚拟机的原因。
3. 预装的软件部分是处于半残状态的，在考场上无法正常使用。
4. 编译器版本较新，默认支持一些新的语言特性。
5. 在考场上推荐使用 Sublime Text 或者 Code::Blocks 进行代码编写，不推荐使用 VSCode 。

### 更新

![](https://vip2.loli.io/2021/08/08/MbBrDuQyYpwP9TA.png)

模拟考试环境时不建议安装**任何**更新，以还原考场上的「本真的」NOI Linux 。如果需要日常使用则建议安装更新。

### VSCode

![](https://vip2.loli.io/2021/08/08/vs2mDg5KCO61n8X.png)

CCF 预置在 NOI Linux 2.0 中的 VSCode 只能当一个编辑器，并且并没有安装中文语言包和完整的 C/C++ 扩展，处于半残状态。

### Sublime Text

![](https://vip1.loli.io/2021/08/08/TuEGMtsYcndIoNm.png)

相比于 VSCode ，NOI Linux 预装的 Sublime Text 的自动补全功能在始终离线的环境下依旧能正常工作，同时 Sublime Text 也支持单文件编译运行，颜值也不低，写起代码来很舒服。

### Code::Blocks

![](https://vip1.loli.io/2021/08/08/J598DiCRqthEgTS.png)

Code::Blocks 是一个免费、开源、跨平台的集成开发环境，可以在 [codeblocks.org](https://www.codeblocks.org/) 上找到系统对应版本的 Code::Blocks 预编译二进制包及其源码。

NOI Linux 中内置的 Code::Blocks 的自动补全、代码提示等功能均能正常使用，且不需要网络连接。

### Nano

![](https://vip2.loli.io/2021/08/08/9BrALjlHxGK54kR.png)

关于 Nano 此处就不再过多叙述，可以在 [The GNU nano homepage](https://nano-editor.org) 上找到系统对应版本的 Nano 预编译二进制包及其源码。

### Emacs

![](https://vip2.loli.io/2021/08/08/FQdGqx8bv2oZNJL.png)

笔者并没有深度体验过 Emacs ，所以不做过多评价，在这里推荐一篇入门教程：[Emacs 入门指南：Why & How - Keep Coding](https://liujiacai.net/blog/2020/11/25/why-emacs/) 。

可以在 [GNU Emacs](https://www.gnu.org/software/emacs/) 找到系统对应版本的 Emacs 预编译二进制包及其源码。

### Vim

![](https://vip1.loli.io/2021/08/08/aN9xjIneAYByEXv.png)

Vim 还是老样子，可以在 [vim.org](https://www.vim.org) 上找到系统对应版本的 Vim 预编译二进制包及其源码，关于 Vim 的使用请参阅 [第九章、vim 程式編輯器 - 鳥哥的 Linux 私房菜](http://linux.vbird.org/linux_basic/0310vi.php)。

### 编译器

![](https://vip1.loli.io/2021/08/07/lWviXCj9Txqgmr8.png)

> 使用 `g++ -dM -E -x c++ /dev/null | grep -F __cplusplus` 命令可以查看编译器默认使用的 C++ 标准。

通过上图可以得出 NOI Linux 自带的编译器默认的 C++ 标准是 C++ 14 ，希望 CCF 在比赛评测的时候不要添加 `--std=c++98` ，同时选手也需要做好无法使用 C++ 14 特性的准备。

### 对拍

NOI Linux 2.0 依旧安装了 Arbiter 评测系统，但是由于系统内置了 Python ，所以可以自行编写对拍程序。

## 后记

NOI Linux 的本次更新使得 NOI Linux 系统更加地人性化、更加适合 OIer 们的使用。美中不足的一点是此版本的 NOI Linux 仍然没有卸载 `openssh-client` 软件包。

## 参考资料

1. [NOI Linux 2.0 发布，将于 9 月 1 日起正式启用！ - noi.cn](https://noi.cn/gynoi/jsgz/2021-07-16/732450.shtml)
1. [安装 Open VM Tools - VMware Tools - VMware Docs](https://docs.vmware.com/cn/VMware-Tools/11.3.0/com.vmware.vsphere.vmwaretools.doc/GUID-C48E1F14-240D-4DD1-8D4C-25B6EBE4BB0F.html)
