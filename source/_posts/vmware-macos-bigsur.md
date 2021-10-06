---
title: 在 VMware 上安装 macOS 11 Big Sur Beta
date: 2020-08-03 12:52:59
updated: 2020-08-03 12:52:59
categories:
  - 技术
tags:
  - macOS
  - VMware
---

## 工具准备

- 文件：`BigSur.cdr`
- 文件：`unlocker.zip`
- 软件：`VMware Workstation Pro 15`

文末会给出上述工具的下载地址。

## 安装 VMware

安装步骤这里不再细说。

不过这里来说下 `VMware 15.5.5` 以后 VMware 和 微软的新动作：`VMware` 和 `Hyper-V` 可以共存了~<small>[1][2]</small>

\*_注：需 Windows 10 2004 以上版本的系统_

只需要在安装时勾选下图所示的选项即可：

![](https://vip1.loli.io/2020/12/13/5OcenBTq1jNzhpV.png)

于是，我的 WSL2 和我的 Docker Desktop 可以和 VMware 一起愉快的玩耍辣 😆~

## 解锁 VMware

条件：先关闭 VMware 的所有进程。

### Windows

解压 Unlocker.zip 内的所有文件到一个文件夹中，右键 `win-install.cmd` ，选择"以管理员身份运行"，等待运行完毕即可。

### Linux

使用以下命令解锁 VMware ：

```bash
unzip unlocker.zip
chmod +x lnx-install.sh
sudo bash lnx-install.sh
```

检验方法：创建虚拟机时是否可以选择 macOS 系统。

## 创建虚拟机

![](https://vip2.loli.io/2020/12/13/XsklfzviZH52W1b.png)

▲ 打开 `VMware Workstation 15` ，选择 "新建虚拟机"。

![](https://vip1.loli.io/2020/12/13/LkQCmegM7rXo5fv.png)

▲ 初始页面

![](https://vip2.loli.io/2020/12/13/7EHteuSpzjUPXnF.png)

▲ 硬件兼容性

![](https://vip2.loli.io/2020/12/13/V69RyPoevf3a54z.png)

▲ 镜像配置

我们创建完成后再挂载镜像，选择"稍后安装操作系统"。

![](https://vip2.loli.io/2020/12/13/MCty81QcrugavZd.png)

▲ 选择系统版本

由于 Unlocker 最高只支持 macOS 10.16 ，所以这里选择最高的版本即 macOS 10.16 。

![](https://vip2.loli.io/2020/12/13/KtWfMrTvXZGxBVc.png)

▲ 设置虚拟机名称、选择存储位置

![](https://vip2.loli.io/2020/12/13/gnMWvl6Qhctreyw.png)

▲ 设置 CPU 核心数量

![](https://vip2.loli.io/2020/12/13/fXaZm8Ol6D73TBR.png)

▲ 调整内存大小

![](https://vip2.loli.io/2020/12/13/8HbAItsv6SQG53j.png)

▲ 网络配置

![](https://vip1.loli.io/2020/12/13/875sIHFRMbvndLu.png)

▲ IO 配置

![](https://vip2.loli.io/2020/12/13/MnxHIWXyJGrRDcA.png)

▲ 磁盘配置

![](https://vip2.loli.io/2020/12/13/PodpwtYKNfyrQk1.png)

▲ 磁盘配置

![](https://vip1.loli.io/2020/12/13/Tcx4GnBXIlJgjRF.png)

▲ 磁盘配置

![](https://vip1.loli.io/2020/12/13/KhRYtIU692Bx5Cw.png)

▲ 磁盘配置

![](https://vip1.loli.io/2020/12/13/ncrqyEHemAD5kpu.png)

▲ 完成！

## 配置虚拟机

在 vmx 文件末尾添加以下内容并保存。

```
smc.version = "0"
hw.model = "MacBookPro16,1"
board-id = "Mac-E1008331FDC96864"
board-id.reflectHost = "TRUE"
```

## 挂载安装镜像

点击"编辑虚拟机设置"，选择"CD/DVD"选项。

![](https://vip2.loli.io/2020/12/13/KVdIk9ZXcqH2aBG.png)

如图所示，先勾选"使用 ISO 映像文件"选项，再点击浏览，点击"所有文件"，选中 `bigsur.cdr` 并确认。

保存以后点击"开启虚拟机"

## 安装 macOS

![](https://vip2.loli.io/2020/12/13/zsFHvAyPN8RBTnc.png)

▲ 耐心等待加载

![](https://vip1.loli.io/2020/12/13/cK7PEd2wJ4j3shO.png)

▲ 选择中文并继续

![](https://vip2.loli.io/2020/12/13/qZtEFjMzgTOsVhJ.png)

▲ 选中磁盘工具并打开

![](https://vip2.loli.io/2020/12/13/oywQHiUkIALxDcM.png)

▲ 找到名称为 `VMware Virtual SATA Hard Drive Media` 的磁盘，选中该磁盘

![](https://vip2.loli.io/2020/12/13/KitXEPgHakBNbMO.png)

▲ 抹掉名称为 `VMware Virtual SATA Hard Drive Media` 的磁盘，格式选择 `APFS`

![](https://vip2.loli.io/2020/12/13/e6rjZxK4AL9wN8n.png)

▲ 退出磁盘工具，选择 `安装 macOS` 并继续

![](https://vip1.loli.io/2020/12/13/8xAyUC3togLSlQJ.png)

▲ 点击继续开始正式安装

![](https://vip2.loli.io/2020/12/13/axXkKfTndAPVNts.png)

▲ 同意条款与条件

![](https://vip1.loli.io/2020/12/13/QbyZxRqrdDNAuJU.png)

▲ 选择安装位置

![](https://vip1.loli.io/2020/12/13/kaIrlscM1mt87wF.png)

▲ 开始安装

![](https://vip2.loli.io/2020/12/13/Wh4qSs2oxYc13E6.png)

▲ 上面显示的剩余时间通常都是忽悠人的，得等好久

## 配置 macOS

![](https://vip2.loli.io/2020/12/13/14eXWOKTdbUg8kM.png)

▲ 首先选择国家和地区

_接下来按照自己需求配置即可，到**配置迁移助理**时选择`以后`_

![](https://vip1.loli.io/2020/12/13/9u1R7XxeGNy6c8C.png)

▲ 选择 `以后`

![](https://vip2.loli.io/2020/12/13/exTUZudn6WLsKzy.png)

▲ 选择 `稍后设置`

![](https://vip1.loli.io/2020/12/13/8BxFmJTZ13WLYr2.png)

▲ All done!

## 安装 VMware Tools

在 VMware 的 `虚拟机(M)` 菜单栏中选择 `安装 VMware Tools(T)...` 选项。

![](https://vip2.loli.io/2020/12/13/6tTqm4uYsl5byAr.png)

之后按照步骤操作就行啦~

## 参考资料

[1] [VMware Blogs: VMware Workstation 15.5 Now Supports Host Hyper-V Mode](https://blogs.vmware.com/workstation/2020/05/vmware-workstation-now-supports-hyper-v-mode.html)
[2] [Microsoft Tech Community: VMware Workstation and Hyper-V](https://techcommunity.microsoft.com/t5/virtualization/vmware-workstation-and-hyper-v/ba-p/1419928)

## 文件下载

### 百度网盘

- 链接：<https://pan.baidu.com/s/1m_iwiZK1XVIhwrrpCenB3Q>
- 提取码：`blog`
