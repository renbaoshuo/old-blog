---
title: 年轻人的第一个 ASN
date: 2021-03-21 01:06:09
updated: 2021-03-21 01:06:09
tags:
  - BGP
categories:
  - 网络
feature: 'https://vip2.loli.io/2021/02/28/XMjiBGVdHmARW48.png'
---

很久之前就有了这样的一个想法：拥有一个自己的 ASN 。2021 年的寒假末尾，我终于找到了一个肯给我这个未成年人申请 ASN 的 LIR 。  
~~于是这个世界上又多了一个祸害公网的人。~~

<!-- more -->

## 注册 ASN

我找了某个 LIR 注册的 APNIC 的 ASN ，下号用时 3 个工作日。

需要提供的信息有这些（带有 `[保密]` 标签的是非公开信息）：

1. [保密] 身份证明材料
1. 主标识
1. 联系人邮箱
1. noc 邮箱
1. abuse 邮箱
1. 国家
1. 联系人地址
1. 联系人姓名
1. 联系人电话
1. ASN 的标识
1. ASN 的全名
1. ASN 所属国家
1. [保密] 两个上游 ASN
1. [保密] ASN 将要部署在的物理位置

然后等了 3 个工作日，我的 ASN 申请终于通过审核了（其实在这之前我已经去上学了）。

需要注意的是 APNIC 每半年会向联系人邮箱发送一封验证邮件，所以邮箱需要保持畅通。

## 申请 Vultr BGP 广播功能

我的 LIR 为我提供了一段 `/44` 的 IP （而不是 `/48`）：`2406:840:e080::/44` 。

由于某些原因，我选择了使用 Vultr 来进行 IP 的广播，当然 HE 的 BGP 隧道也是可以的。

点击 https://my.vultr.com/bgp/ 进入 Vultr BGP 广播功能的开通页面。

![](https://vip2.loli.io/2021/03/12/aYNdpciAb217wuP.png)

点击页面中的 **Get Started** 进入 BGP 开通申请页面。

![](https://vip1.loli.io/2021/03/12/Sb6AoPXTuJ3YIKn.png)

1. 将 **I have my own IP space** 和 **I have my own ASN** 设置为 YES
1. 在 **My ASN** 处填写 ASN （不含 `AS` 前缀）
1. 在 **BGP Password** 处填写你想要的 BGP 密码
1. 在 **IP Prefixes** 处填写你的 IP 前缀（CIDR 格式）
1. **Routes we shoule send you** 选择 **Full Table**

然后点击 **Setup** 即可。

> **小插曲**
>
> 由于我的 LIR 忘记了给我设置 RPKI 记录，导致出现了没有查询到 RPKI 记录的错误。

---

这是一篇 LOA 模板，照抄即可。

```text
AUTHORIZATION LETTER

[日期, 如 Feb 27, 2021]

To whom it may concern,

This letter serves as authorization for [服务商公司名, 如 Vultr] with [ASN, 如 AS2333] to announce the following IP address blocks:

[IP SPACE / ASN / SUBNET]
[IP SPACE / ASN / SUBNET]
[...]

As a representative of the company [公司名称] that is the owner of the subnet and/or ASN, I hereby declare that I'm authorized to represent and sign for this LOA.

Should you have questions about this request, email me at [邮箱], or call: [电话号码]

From,

[姓名]
[公司名称]
[职位, 如 Network Administrator]
[电话号码]
```

---

![](https://vip2.loli.io/2021/03/13/nbQxcZLFNV6KBgP.png)

提交完毕之后会出现如图所示的界面，点击 **Start** 即可开始验证进程。

![](https://vip1.loli.io/2021/03/13/6QKhFL4PGxoeEXn.png)

以 asn 141776 的验证为例，选择好接收验证邮件的邮箱，然后点击 **Send** 即可。

![](https://vip2.loli.io/2021/03/13/rE4txqgBLeZK9Ou.png)

![](https://vip2.loli.io/2021/03/13/rAOSIP5oezGRqpc.png)

点击邮箱里的链接即可（第一个是允许，第二个是拒绝）

![验证成功后的提示](https://vip2.loli.io/2021/03/13/xBXiqmukOQbZT6r.png)

之后等待客服开通即可。  
由于我是在半夜申请的 Vultr BGP 服务，所以几分钟就开通好了。

![完成后的界面](https://vip2.loli.io/2021/03/13/2aLwgPWHzlxF9DY.png)

之后不要忘记去控制台重启实例哦~

## 使用 BIRD 1.6 广播 IP

目前 BIRD 1.x 和 2.x 同时在维护，二者的区别是 1.x 中 IPv4 和 IPv6 协议是分开的（bird 和 bird6），而 2.x 将两部分代码合并在了一起还引入了更多新功能。  
1.x 和 2.x 两个版本的语法并无差别，只是 2.x 在涉及与路由表相关的操作的时候，需要指定特别的协议（`ipv4` 或 `ipv6`）。

[BIRD 2.x 官方文档](https://bird.network.cz/?get_doc&f=bird.html&v=20)

我选用的是 CentOS 7 系统 + BIRD 1.6.8 的组合。

由于直接使用 yum 安装 bird6 会出现无法找到包的情况，我们需要先通过 yum 安装 epel。

```bash
yum install epel-release -y
```

### 安装 bird

安装 bird6 ：

```bash
yum install bird6 -y
```

### 配置 bird

安装完成后先停止 bird 服务：

```bash
systemctl stop bird6
```

由于默认的配置文件注释的内容过多，推荐先删除原有配置文件里面的全部内容。

使用你喜欢的编辑器编辑 `/etc/bird6.conf` ，填入如下方所示的配置：

```
router id [实例的 IPv4 地址];

define OWNIP = [实例的 IPv6 地址];
define OWNAS = [ASN, 不含 AS 前缀];

protocol device {
    scan time 20;
}

protocol static {
    route [要广播的 IP 地址, CIDR 格式] via OWNIP;
}

protocol bgp vultr {
    local as OWNAS;
    source address OWNIP;
    import none;
    export all;
    graceful restart on;
    multihop 2;
    neighbor 2001:19f0:ffff::1 as 64515;
    password "[你设置的 BGP 密码]";
}
```

之后保存配置文件，启动广播。

```bash
systemctl start bird6
```

![成果](https://vip1.loli.io/2021/03/13/R3UZXdnOx7yTVhc.png)

可以使用 `birdc6 show route` 和 `birdc6 show proto all` 命令查看状态。

### 添加虚拟网卡

接下来需要创建一个虚拟网卡并设置一个 IP ：

```bash
ip link add dev baoshuo1 type dummy
ip link set baoshuo1 up
ip addr add dev baoshuo1 2406:840:e080::1/128
```

在 `/etc/bird6.conf` 的末尾添加以下内容：

```
protocol direct {
    interface "baoshuo*";
    import all;
}
```

之后使用 `systemctl reload bird6` 命令重载 bird 即可。

## 使用 BIRD2 广播 IP

### 安装 BIRD2

由于直接使用 yum 安装 bird6 会出现无法找到包的情况，我们需要先通过 yum 安装 epel。

```bash
yum install epel-release -y
```

安装 bird2 ：

```bash
yum install bird2 -y
```

### 配置 BIRD2

BIRD2 的配置文件在 `/etc/bird.conf` 目录下。

```
router id [实例的 IPv4 地址];

define OWNIP = [实例的 IPv6 地址];
define OWNAS = [ASN, 不含 AS 前缀];

protocol device {
    scan time 20;
}

protocol static {
    ipv6;
    route [要广播的 IP 地址, CIDR 格式] via OWNIP;
}

protocol bgp lsy {
    local as OWNAS;
    source address OWNIP;
    import none;
    export all;
    graceful restart on;
    multihop 2;
    neighbor 2001:19f0:ffff::1 as 64515;
    password "[你设置的 BGP 密码]";
}

protocol direct {
    interface "baoshuo*";
    ipv6 {
        import all;
    };
}
```

由于我的需求比较简陋，所以配置文件并无较大改动。

![成果](https://vip2.loli.io/2021/03/26/Sdw9oWyuKiZNUpL.png)

## 拆分 IP 段

由于我一下子用不了那么多 IP，所以我决定拆分一下。

如果不涉及 whois 信息的修改操作，那么只需要修改一下 bird 的配置分开广播即可。

APNIC 修改 whois 信息的流程可以参考 https://www.apnic.net/manage-ip/using-whois/updating-whois/objects/email-updates/ 。

## Peer

首先编写一个模板，像下面这样：

```
# /etc/bird6.conf
template bgp peers6 {
    local OWNIP as OWNAS;
    path metric 1;
    import keep filtered;
    import filter {
        print "WARNING: no import filter set, all routes will be rejected.";
        reject;
    };
    export filter {
        print "WARNING: no export filter set, all routes will be rejected.";
        reject;
    };
    import limit 1000 action block;
    export limit 1000 action block;
}

include "/etc/bird/peers6/*";
```

如果需要 Peer ，就在 `/etc/bird/peers6/` 目录下新建一个任意名称配置文件，如下所示（需要自行替换尖角括号括住的内容）：

```
# /etc/bird/peers6/<PEER_NAME>.conf
protocol bgp <PEER_NAME> from peers6 {
    neighbor <PEER_IP> as <PEER_ASN>;
    import all;
    export filter myexport;
}
```

![和 LSC.MOE 的 Peer](https://vip2.loli.io/2021/03/27/IsGKxX9wRAUNBrH.png)

## 术语解释

- LIR: 本地互联网注册机构
- RIR: 区域互联网注册机构 （[维基百科](https://zh.wikipedia.org/zh-cn/%E5%8C%BA%E5%9F%9F%E4%BA%92%E8%81%94%E7%BD%91%E6%B3%A8%E5%86%8C%E7%AE%A1%E7%90%86%E6%9C%BA%E6%9E%84)）
- ASN: 自治系统编号（[维基百科](https://zh.wikipedia.org/zh-cn/%E8%87%AA%E6%B2%BB%E7%B3%BB%E7%BB%9F)）
- BGP: 边界网关协议（[维基百科](https://zh.wikipedia.org/zh-cn/%E8%BE%B9%E7%95%8C%E7%BD%91%E5%85%B3%E5%8D%8F%E8%AE%AE)）
- BIRD: 一个功能齐全的动态 IP 路由守护程序（[官方网站](https://bird.network.cz)）

## 参考资料

1. [Example Letter of Authorization for BGP Announcements - Vultr Docs](https://www.vultr.com/docs/example-letter-of-authorization-for-bgp-announcements)
2. [IP 广播 : CentOS 7 使用 bird6 广播 IPv6 - LiCEO](https://blog.lsc.moe/post/12/)
