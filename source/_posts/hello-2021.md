---
title: '你好，2021 —— 博客迁移记录'
date: 2021-01-01 00:00:00
updated: 2021-01-01 00:00:00
categories:
  - 技术
tags: 
  - 折腾
---

再见，2020。

<!-- more -->

最近总是觉得博客太慢了，于是乎，我把博客迁移到自己的服务器上面了。

## 服务器端操作

### 安装 nginx

apt 一把梭，省时又省力。

```shell
apt install nginx -y
```

### 配置 nginx

简简单单配置了一下，没有什么过于复杂的东西。

在申请 SSL 证书之前，不要写 HTTPS 的配置。

```nginx
server {
    listen      80;
    listen      [::]:80;
    server_name blog.baoshuo.ren;

    # ACME-challenge
    location ^~ /.well-known/acme-challenge/ {
        allow all;
        root /var/www/_letsencrypt;
    }

    location / {
        return 301 https://blog.baoshuo.ren$request_uri;
    }
}
```

### 申请 SSL 证书

由于笔者懒得每年换证书，所以就用了 [Let's Encrypt](https://letsencrypt.org/) + [acme.sh](https://acme.sh) 的组合套装来配置 SSL 。
当然，ECC 证书也是少不了的。

```bash
acme.sh --issue -d baoshuo.ren -d www.baoshuo.ren -d blog.baoshuo.ren \
    -w /var/www/_letsencrypt/ \
    --renew-hook "acme.sh --install-cert -d baoshuo.ren \
    --key-file /***/baoshuo.ren.key \
    --fullchain-file /***/baoshuo.ren.cer \
    --reloadcmd \"service nginx force-reload\""
acme.sh --issue --keylength ec-256 \
    -d baoshuo.ren -d www.baoshuo.ren -d blog.baoshuo.ren \
    -w /var/www/_letsencrypt/ \
    --renew-hook "acme.sh --install-cert -d baoshuo.ren --ecc \
    --key-file /***/baoshuo.ren.ecc.key \
    --fullchain-file /***/baoshuo.ren.ecc.cer \
    --reloadcmd \"service nginx force-reload\""
```

申请完成后，将 RSA 和 ECC 证书添加到 nginx 配置中，在配置文件中写入以下内容：

```nginx
server {
    listen                               443 ssl http2;
    listen                               [::]:443 ssl http2;
    server_name                          blog.baoshuo.ren;
    root                                 /var/www/blog/;

    # SSL
    ssl_certificate                      /***/baoshuo.ren.cer;
    ssl_certificate_key                  /***/baoshuo.ren.key;
    ssl_certificate                      /***/baoshuo.ren.ecc.cer;
    ssl_certificate_key                  /***/baoshuo.ren.ecc.key;
    ssl_protocols                        TLSv1.2 TLSv1.3;
    ssl_ciphers                          ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security 'max-age=31536000';

    # logging
    error_log                            /var/log/nginx/blog.baoshuo.ren.error.log warn;

    # 404 page
    error_page                           404 /404.html;
}
```

上方使用的 SSL 配置是 Mozilla 推荐的现代化配置 ，如果需要更好的兼容性，可以使用 Mozilla 提供的中等安全性配置 ：

```
ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA;
ssl_prefer_server_ciphers on;
```

## 将博客文件同步到服务器上

在 `.github/workflows` 目录下创建一个 `server.yml` 文件，写入以下内容：

```yaml
name: Deploy blog to Server

on:
  push:
    branches: [ master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Deploy
        uses: easingthemes/ssh-deploy@v2.1.5
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-avz --delete  --exclude '.git/*' --exclude '.github/*' --exclude '.gitlab-ci.yml' --exclude '.nojekyll'"
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
          TARGET: ${{ secrets.TARGET }}
```

之后在 `https://github.com/{username}/{repo}/settings/secrets/actions` 中添加四个 Secrets 。

| 名称             | 内容                  |
| --------------- | --------------------- |
| REMOTE_HOST     | 服务器 IP 地址         |
| REMOTE_USER     | 服务器用户名           |
| SSH_PRIVATE_KEY | 连接到服务器的 SSH 私钥 |
| TARGET          | 存放文件的路径          |

将博客文件 push 到仓库中，就能在服务器上查看到文件了。

## 参考资料

1. [nginx 1.18.0, modern config, OpenSSL 1.1.1f - Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/#server=nginx&version=1.18.0&config=modern&openssl=1.1.1f&ocsp=false&guideline=5.6)
2. [nginx 1.18.0, intermediate config, OpenSSL 1.1.1f - Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/#server=nginx&version=1.18.0&config=intermediate&openssl=1.1.1f&ocsp=false&guideline=5.6)
