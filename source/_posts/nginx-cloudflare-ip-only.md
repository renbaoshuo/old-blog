---
title: 配置 nginx 只允许 Cloudflare 的 IP 回源
date: 2020-08-18 13:32:04
updated: 2020-08-18 13:32:04
categories:
  - 技术
tags:
  - 网络
---

配置好 Cloudflare 后，建议禁止非 Cloudflare IP 访问源站来防止一些不好的事情发生。

<!-- more -->

## 配置

在站点配置文件中增加以下内容：

```nginx
# Cloudflare (IPv4 - https://www.cloudflare.com/ips-v4)
allow 173.245.48.0/20;
allow 103.21.244.0/22;
allow 103.22.200.0/22;
allow 103.31.4.0/22;
allow 141.101.64.0/18;
allow 108.162.192.0/18;
allow 190.93.240.0/20;
allow 188.114.96.0/20;
allow 197.234.240.0/22;
allow 198.41.128.0/17;
allow 162.158.0.0/15;
allow 104.16.0.0/12;
allow 172.64.0.0/13;
allow 131.0.72.0/22;
allow 36.27.212.0/24;
allow 123.129.232.0/24;

# Cloudflare (IPv6 - https://www.cloudflare.com/ips-v6)
allow 2400:cb00::/32;
allow 2405:8100::/32;
allow 2405:b500::/32;
allow 2606:4700::/32;
allow 2803:f800::/32;
allow 2c0f:f248::/32;
allow 2a06:98c0::/29;

# Others
deny all;
```

## 后记

这个配置文件可以自己生成。

## 参考资料

1. [Cloudflare IP Ranges (Last updated: February 21, 2019)](https://www.cloudflare.com/ips/)
