---
title: 搭建 BIRD Looking Glass 速成指北
date: 2021-05-03 12:23:00
updated: 2021-05-03 12:23:00
tags:
  - BIRD
  - BGP
  - DN42
categories:
  - 网络
---

BIRD 是 Linux 上常用的一款 BGP 路由软件。bird-lg-go 是 [蓝天](https://lantian.pub) 使用 Go 语言编写的 Looking Glass 程序，内存占用比原版 bird-lg 更低。它提供了一个网页面板，可以显示各个服务器上的 BIRD 路由软件的状态，以及查询到指定 IP 的路由。

<!-- more -->

- 项目地址：https://github.com/xddxdd/bird-lg-go
- 成品： https://lg.dn42.as141776.net

## 安装 Docker 和 Docker Compose

虽然这个程序可以直接运行，但我还是比较喜欢套个 Docker 防止污染环境。

```bash
curl -sSL https://get.docker.com | sh
pip install docker-compose
```

## 编排 Docker Compose 服务

在运行 web 的服务器上找个地方（如 `/var/bird-lg/`），将下面的内容修改后写入 `docker-compose.yml` 中：

```yml
version: '3'

services:
  bird-lg:
    image: xddxdd/bird-lg-go
    container_name: bird-lg
    restart: always
    environment:
      - BIRDLG_SERVERS=cn1,eu1 # 节点列表，以逗号分隔
      - BIRDLG_DOMAIN=dn42.as141776.net # 节点 endpiont 后缀
      - BIRDLG_TITLE_BRAND=Looking Glass # 标签栏上显示的名称
      - BIRDLG_NAVBAR_BRAND=Looking Glass # 页面上显示的名称
      - BIRDLG_WHOIS=whois.lantian.dn42 # Whois 服务器地址
      - BIRDLG_DNS_INTERFACE=asn.dn42
    ports:
      - '5000:5000'
  bird-lgproxy:
    image: xddxdd/bird-lgproxy-go
    container_name: bird-lgproxy
    restart: always
    volumes:
      - '/var/run/bird/bird.ctl:/var/run/bird/bird.ctl'
    ports:
      - '8000:8000'
```

在各个节点上只需要写入下面内容即可：

```yml
version: '3'

services:
  bird-lgproxy:
    image: xddxdd/bird-lgproxy-go
    container_name: bird-lgproxy
    restart: always
    volumes:
      - '/var/run/bird/bird.ctl:/var/run/bird/bird.ctl'
    ports:
      - '8000:8000'
```

之后启动 Docker 容器：

```bash
docker-compose up -d
```

## 使用 nginx 反代页面

使用下方的配置启动反向代理即可。

```nginx
server {
    listen      *:80;
    listen      [::]:80;
    server_name lg.dn42.as141776.net;

    # reverse proxy
    location / {
        proxy_pass                         http://127.0.0.1:5000;
        proxy_http_version                 1.1;
        proxy_cache_bypass                 $http_upgrade;

        # Proxy headers
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-Port  $server_port;

        # Proxy timeouts
        proxy_connect_timeout              60s;
        proxy_send_timeout                 60s;
        proxy_read_timeout                 60s;
    }
}
```

## 配置 DNS 解析

bird-lg-go 的节点 endpiont 生成逻辑是 `http://[节点].[endpoint后缀]:8000` ，如 `http://eu1.dn42.as141776.net:8000` ，所以只需要去配置对应的解析。

> **警告**
>
> 建议解析到节点的公网 IP 上，以免 DN42 炸掉时 Looking Glass 也一并炸掉。

配置示例：

```
eu1.dn42.as141776.net.  3600    IN      A       136.243.221.96
cn1.dn42.as141776.net.  3600    IN      CNAME   home.baoshuo.ren.
```

## 成果

![](https://vip2.loli.io/2021/05/03/iaFfTWAhpdZGJ9t.png)
