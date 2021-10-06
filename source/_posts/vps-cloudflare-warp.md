---
title: 使用 Cloudflare Warp 为单栈 VPS 添加双栈网络访问
date: 2021-07-15 17:57:25
updated: 2021-07-15 17:57:25
categories:
  - 技术
tags:
  - Cloudflare
  - Linux
feature: 'https://vip1.loli.io/2021/08/15/UOBRkoXaV9wnYW6.jpg'
---

[Warp](https://blog.cloudflare.com/1111-warp-better-vpn/) 是 Cloudflare 提供的一项基于 WireGuard 的网络流量安全及加速服务，能够让你通过连接到 Cloudflare 的边缘节点实现隐私保护及链路优化。

<!-- more -->

由于 Cloudflare 官方的 [Warp Client](https://developers.cloudflare.com/warp-client/setting-up/linux) 过于臃肿，导致我看到安装包大小后就决定直接放弃安装，于是我选择了 [ViRb3/wgcf](https://github.com/ViRb3/wgcf) 替代。

![使用 apt 安装 cloudflare-warp 时的提示](https://vip1.loli.io/2021/07/15/dHClLqSsvDKbrBc.png)

## 安装依赖

可以前往 [Releases 页面](https://github.com/ViRb3/wgcf/releases/latest) 下载编译好的二进制文件以供使用。

也可使用如下命令安装：

```bash
curl -Ls https://git.io/wgcf-installer.sh | bash
```

安装好之后运行 `wgcf --help` ，得到类似下图的输出即为安装成功：

![](https://vip1.loli.io/2021/07/15/lDaywAzQGd8HI9S.png)

另外还需按照 [WireGuard 官网](https://www.wireguard.com/install/) 上的说明安装 WireGuard 。

根据需求可能还需要安装 `resolvconf` 。

## 生成 WireGuard 配置文件

先使用 `wgcf register` 命令注册 Warp 。

![使用键盘上的方向键选择 "Yes" 并回车确认](https://vip2.loli.io/2021/07/15/MYT5bkX4r2pGHUv.png)

注册成功后的提示：

![](https://vip2.loli.io/2021/07/15/y4homkVbqsr9PYj.png)

之后使用 `wgcf generate` 命令生成配置文件。

![](https://vip1.loli.io/2021/07/15/3zWUZYTdGhn9qkP.png)

## 修改 WireGuard 配置文件

这是一份生成出来的配置文件：

```ini
[Interface]
PrivateKey = ******
Address = 172.16.*.*/32
Address = fd01:******/128
DNS = 1.1.1.1
MTU = 1280

[Peer]
PublicKey = ******
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = engage.cloudflareclient.com:2408
```

- 添加 IPv4 网络访问
  1. 删去 `[Interface]` 中的 `Address = fd01:******/128` ；
  1. 删去 `[Peer]` 中的 `AllowedIPs = ::/0` ；
  1. 将 Endpoint 的域名替换为解析出来的 IPv6 地址，如 `[2606:4700:d0::a29f:c001]:2408` 。
- 添加 IPv6 网络访问
  1. 删去 `[Interface]` 中的 `Address = 172.16.*.*/32` ；
  1. 删去 `[Peer]` 中的 `AllowedIPs = 0.0.0.0/0` ；
  1. 将 Endpoint 的域名替换为解析出来的 IPv4 地址，如 `162.159.192.1:2408` 。

如果不需要使用 Cloudflare 的 DNS 服务可以删去 `DNS = 1.1.1.1` 这一行，使用的话需要安装 `resolvconf` 。

## 启动 WireGuard 隧道

将刚才修改好的配置文件移动到 `/etc/wireguard/` 目录下，推荐命名为 `wgcf.conf` ，下面的操作以这个文件名为准。

使用 `systemd enable --now wg-quick@wgcf` 命令启动隧道，然后使用 `wg show wgcf` 命令查看隧道状态。

如果在启动时出现了错误，可以使用 `systemd status wg-quick@wgcf` 命令查看错误信息，修复后使用 `systemd start wg-quick@wgcf` 启动隧道。

![一切正常](https://vip1.loli.io/2021/07/15/M9D1L2rFfHCPtcU.png)

之后就可以享受双栈网络带来的便利了~

注：日常如果需要重启隧道可以使用 `systemctl restart wg-quick@wgcf` 命令。

## 后记

折腾这些的原因是我从某个 Player IX 那里嫖的 VM 没有提供 IPv4 网络访问权限，这让我日常的维护工作麻烦了很多，于是我想到了 Cloudflare Warp 这个东西。CloudFlare Warp 提供的网络访问相较于 TunnelBroker.net 、 TunnelBroker.ch 等一众隧道要好很多，延迟并不像其他隧道那样高。

在查找资料的过程中我也发现了很多博客里面所描述的内容有误或已经过时，所以综合其他文章的内容加上自己的实践，写下了这篇文章。

## 参考资料

1. [【WGCF】连接 CF WARP 为服务器添加 IPv4/IPv6 网络 - Luminous’ Home](https://luotianyi.vc/5252.html)
1. [Cloudflare WARP 给 VPS 服务器额外添加 IPv4 或 IPv6 网络获得“原生”IP - P3TERX](https://p3terx.com/archives/use-cloudflare-warp-to-add-extra-ipv4-or-ipv6-network-support-to-vps-servers-for-free.html)
