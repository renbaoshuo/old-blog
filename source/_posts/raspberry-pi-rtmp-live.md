---
title: '使用树莓派+nginx搭建 rtmp 直播服务'
date: 2020-10-05 21:35:32
updated: 2020-10-05 21:35:32
categories:
  - 技术
tags:
  - 折腾
---

国庆在家闲着没啥事，把一直在角落里吃灰的树莓派 4B 拿出来捣鼓了几下。

<!-- more -->

使用 nginx 模块：[`nginx-rtmp-module`](https://github.com/arut/nginx-rtmp-module)

## 安装 nginx & nginx-rtmp-module

apt, yes!

```bash
apt update
apt upgrade -y
apt install nginx libnginx-mod-rtmp -y
```

访问服务器 IP ，出现如下图所示网页即代表安装成功。

![](https://vip1.loli.io/2020/11/26/BdKOhDuxIaYks6q.png)

## 修改 nginx 配置

打开 `/etc/nginx/nginx.conf` ，在末尾处插入下面的配置

```nginx
rtmp {
    server {
        listen     1935;              # 服务端口
        chunk_size 4096;              # 数据传输块的大小

        application vod {
            play /opt/video;          # 视频文件存放位置。
        }

        application rtmplive {
            live            on;        # 开启直播
            max_connections 64;        # 为 rtmp 引擎设置最大连接数。默认为 off
        }

        application live {
            live                on;              # 开启直播
            hls                 on;              # 这个参数把直播服务器改造成实时回放服务器。
            wait_key            on;              # 对视频切片进行保护，这样就不会产生马赛克了。
            hls_path            /opt/video/hls;  # 切片视频文件存放位置。
            hls_fragment        10s;             # 设置HLS片段长度。
            hls_max_fragment    10s;             # 设置HLS片段最大长度。
            hls_playlist_length 30s;             # 设置HLS播放列表长度。
            hls_continuous      on;              # 连续模式。
            hls_cleanup         on;              # 对多余的切片进行删除。
            hls_nested          on;              # 嵌套模式。
        }
    }
}
```

打开默认站点配置文件 `/etc/nginx/sites-available/default` ，在 `server` 部分的末尾添加以下内容

```nginx
location /live {
    types {
        application/vnd.apple.mpegurl m3u8;
        video/mp2t                    ts;
    }

    autoindex on;
    alias     /opt/video/hls;

    expires -1;

    add_header 'Cache-Control'                    'no-cache';
    add_header 'Access-Control-Allow-Origin'      '*';
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Allow-Methods'     'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers'     'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
}
location /stat {
    rtmp_stat all;
    # rtmp_stat_stylesheet stat.xsl;
}
```

插入完以后配置文件会变成下面的样子

```diff
--- /etc/nginx/sites-available/default
+++ /etc/nginx/sites-available/default
@@ -1,14 +1,36 @@
 server {
     listen 80 default_server;
     listen [::]:80 default_server;

     root /var/www/html;

     index index.html index.htm index.nginx-debian.html;

     server_name _;

     location / {
         try_files $uri $uri/ =404;
     }
+
+    location /live {
+        types {
+            application/vnd.apple.mpegurl m3u8;
+            video/mp2t                    ts;
+        }
+
+        autoindex on;
+        alias     /opt/video/hls;
+
+        expires -1;
+
+        add_header 'Cache-Control'                    'no-cache';
+        add_header 'Access-Control-Allow-Origin'      '*';
+        add_header 'Access-Control-Allow-Credentials' 'true';
+        add_header 'Access-Control-Allow-Methods'     'GET, POST, OPTIONS';
+        add_header 'Access-Control-Allow-Headers'     'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
+    }
+    location /stat {
+        rtmp_stat all;
+        # rtmp_stat_stylesheet stat.xsl;
+    }
 }
```

修改完成后使用 `nginx -t` 测试配置文件是否正确

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

当出现成功提示时，使用 `nginx -s reload` 平滑重启 nginx。

重启成功后使用 `netstat -lnp` 查看 `tcp/1935` 端口是否开启。

![](https://vip1.loli.io/2020/11/26/Xy3Nq5WZaogLIvR.png)

## 使用 OBS 连接直播服务器

打开 OBS ，在 设置 -> 推流 中配置以下内容

| 项目     | 值                  |
| -------- | ------------------- |
| 服务     | `自定义...`         |
| 服务器   | `rtmp://${ip}/live` |
| 串流密钥 | `${key}`            |

其中，`${ip}` 和 `${key}` 设置为你需要的值即可。

回到主界面，点击 **开始推流** 进行推流。

## 使用客户端拉取直播流

![](https://vip2.loli.io/2020/11/26/jpqVTAgXSW6oyEP.png)

在 `PotPlayer` `QQ影音` 等播放器中选择 `打开->打开URL` 。

![](https://vip1.loli.io/2020/11/26/rzBNukVTntf5xUR.png)

输入 `http://${ip}/live/${key}/index.m3u8` ，点击确定。

![](https://vip1.loli.io/2020/11/26/crbEBQNC3qH8uOl.jpg)

此时可以就看到直播画面了。

## 网页端播放

页面中只有一个播放器，其他功能请自行实现。

```
<html>

<head>
    <title>Live Player</title>
    <meta charset="UTF-8">
</head>

<body>
    <div id="dplayer"></div>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@0.14.13/dist/hls.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dplayer@1.26.0/dist/DPlayer.min.js"></script>
    <script>
        const dp = new DPlayer({
            container: document.getElementById('dplayer'),
            live: true,
            video: {
                url: 'http://${ip}/live/${key}/index.m3u8',
                type: 'hls',
            },
        });
    </script>
</body>

</html>
```

![](https://vip1.loli.io/2020/11/26/9X6mUtF4fLzdaYn.jpg)

## 后记

如果没有在外直播的需求，不要将 rtmp 端口映射至公网，这可能会带来一些不必要的麻烦。

## 参考资料

1. [NGINX-based Media Streaming Server](https://github.com/arut/nginx-rtmp-module)
