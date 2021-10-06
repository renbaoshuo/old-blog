---
title: 初探 DN42 网络
date: 2021-04-04 11:29:32
date: 2021-08-18 16:27:30
tags:
  - BGP
  - DN42
categories:
  - 网络
feature: 'https://vip1.loli.io/2021/04/03/R6IHLundNjpKxCD.png'
---

DN42 全称 Decentralized Network 42（42 号去中心网络），是一个大型、去中心化的 BGP 网络。DN42 的目的是模拟一个互联网。它使用了大量在目前互联网骨干上应用的技术（例如 BGP 和递归 DNS），可以很好地模拟一个真实的网络环境。

<!-- more -->

DN42 适合以下类别的用户：

- 想要研究网络技术，练习服务器、路由器等网络设备配置，甚至后续在真实互联网建立 AS 的用户。
- 已经拥有真实 AS ，但担心自己[配置错误广播出错误路由、干掉半个互联网](https://blog.cloudflare.com/how-verizon-and-a-bgp-optimizer-knocked-large-parts-of-the-internet-offline-today/)，希望有个地方测试的用户。

DN42 不适合以下类别的用户：

- 单纯想要保护隐私、规避网络审查的用户
- 在网内消耗大量流量，例如用于解锁流媒体服务的用户

所以，DN42 的使用门槛还是比较高的。这与在真实互联网中一样，你要扮演一个 ISP （互联网服务提供商），注册自己的个人信息， ASN 号码，IPv4 和 IPv6 的地址池，并且使用 BGP 在自己的服务器上广播它们。你还要和其它的用户联系，和他们进行 Peering（对等互联），一步步进入完整的 DN42 网络。

---

DN42 在 `172.20.0.0/14` 和 `fd00::/8` 上运行，而这两个 IP 段都是分配给内网使用的。换句话说，你在 DN42 上怎么折腾，都不会影响到服务器其它的互联网连接。

你可以通过加入 [Telegram 群组](https://t.me/Dn42Chat) 或者 [IRC 频道](irc://irc.hackint.org/#dn42) 来寻求帮助。

请注意，DN42 是一个测试网络，所有人都在帮助所有人。即使你不小心搞砸了，也没有人会指责你。

欢迎在搭建完成自己的内网以后与我进行对等互联，可以访问 [dn42.baoshuo.ren](https://dn42.baoshuo.ren) 获取更多信息。

若无特别说明，本文中所使用的系统环境均为 `Ubuntu 20.04.2 LTS` ，本文中所有使用 `<>` 包裹的内容均需要自行替换。

## 注册 DN42

在注册过程中会大量使用到一些 UNIX 工具（如 Git 、 GPG 等），所以最好使用 Linux 或者 macOS 系统完成整个流程，如果你正在使用 Windows 系统，那么可以使用 [WSL](http://aka.ms/wsl) 。

### 注册前的准备

- 了解如何编写 RPSL （[RFC2622](https://tools.ietf.org/html/rfc2622/)） 格式的配置文件。
- 了解如何使用 [CIDR](https://zh.wikipedia.org/wiki/%E6%97%A0%E7%B1%BB%E5%88%AB%E5%9F%9F%E9%97%B4%E8%B7%AF%E7%94%B1) （[RFC1518](https://tools.ietf.org/html/rfc1518)，[RFC1519](https://tools.ietf.org/html/rfc1519)） 格式表示 IP 地址块。
- 熟悉 [DN42 Wiki](https://dn42.dev) 中的 [Getting-Started](https://dn42.dev/howto/Getting-Started) 、 [Address Space](https://dn42.dev/howto/Address-Space) 页面中的内容。
- 在 [DN42 Git](https://git.dn42.dev) 中有一个注册好的账户。
- 会使用英文与他人交流。

### 克隆 DN42 注册表 Git 仓库

将 [dn42/registry](https://git.dn42.dev/dn42/registry) 这个仓库 clone 到本地。

新建一个名为 `<用户名>-<日期, YYYYMMDD>/<自定义名称>` 的分支。

```bash
git checkout -b <用户名>-<日期, YYYYMMDD>/register
```

### 注册维护者

在仓库的 `data/mntner` 目录下新建一个文件，命名为 `<昵称>-MNT` 。

文件内填入以下内容：

```rpsl
mntner:             <昵称>-MNT
admin-c:            <昵称>-DN42
tech-c:             <昵称>-DN42
auth:               <身份验证信息>
mnt-by:             <维护者>
source:             DN42
```

示例：[`data/mntner/BAOSHUO-MNT` at dn42/registry@master](https://git.dn42.dev/dn42/registry/src/branch/master/data/mntner/BAOSHUO-MNT)

- `mntner` ：维护者（全称为 Maintainer），这个维护者的名称，与文件名相同。
- `admin-c` ：管理员联系信息（Admin Contact），需要指向 [注册联系人](#注册联系人) 一节中的 `person` 文件，一般为 `<昵称>-DN42` 。
- `tech-c` ：技术人员联系信息（Tech Contact），需要指向 [注册联系人](#注册联系人) 一节中的 `person` 文件，一般为 `<昵称>-DN42` 。
- `auth` ：身份验证信息，接受 **GPG 公钥** 和 **SSH 公钥** ，可以查看 [Registry Authentication](https://dn42.dev/howto/Registry-Authentication) 页面获取详细信息。
- `mnt-by` ：由谁维护（全称为 Maintain by），此处需要指向这个维护者本身，即 `<昵称>-MNT` 。
- `source` ：信息来源，默认为 `DN42` 。

### 注册联系人

在仓库的 `data/person` 目录下新建一个文件，命名为 `<昵称>-DN42` 。

```rpsl
person:             <姓名>
contact:            <邮箱>
nic-hdl:            <NIC 句柄>
mnt-by:             <维护者>
source:             DN42
```

示例：[`data/person/BAOSHUO-DN42` at dn42/registry@master](https://git.dn42.dev/dn42/registry/src/branch/master/data/person/BAOSHUO-DN42)

- `person` ：姓名。
- `contact` ：联系方式，一般为邮箱。
- `nic-hdl` ：NIC 句柄（即 [NIC handle](https://en.wikipedia.org/wiki/NIC_handle)），指向文件本身，与文件名相同。
- `mnt-by` ：由谁维护（全称为 Maintain by），指向你在 [注册维护者](#注册维护者) 一节中注册的的维护者信息。
- `source` ：固定为 `DN42`。

### 注册 ASN

在国际互联网上，ASN 范围 `4200000000 - 4294967294` 是被保留以供私人使用的，而 DN42 占用的就是其中的一块： `4242420000 - 4242429999` 。目前 DN42 开放注册的 ASN 范围是 `4242420000 - 4242423999` ，只需要在这个区间里面挑一个没有被他人占用的号码即可。

DN42 Registry 的管理员 burble 提供了一个在线查看可用 ASN 的工具: [DN42 Free ASN Explorer](https://explorer.burble.com/free#/asn) 。访问该页面就会随机生成 10 个当前还未注册的 ASN 以便使用。

在仓库的 `data/aut-num` 目录下新建一个文件，命名为刚才选中的 AS 号码。

```rpsl
aut-num:            <AS 号码, 带 AS 前缀>
as-name:            <AS 名称>
descr:              <AS 简介>
admin-c:            <NIC 句柄>
tech-c:             <NIC 句柄>
mnt-by:             <维护者>
source:             DN42
```

示例：[`data/aut-num/AS4242420247` at dn42/registry@master](https://git.dn42.dev/dn42/registry/src/branch/master/data/aut-num/AS4242420247)

- `aut-num` ：AS 号，此处可以使用私有 AS 号码，也可以使用公网 AS 号码（不推荐）。
- `as-name` ：AS 的名称，可以设置为 `<昵称>-AS` 。
- `descr` ：（选填）AS 简介，随意填写。
- `admin-c` ：管理员联系信息（Admin Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `tech-c` ：技术员联系信息（Tech Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `mnt-by` ：由谁维护（Maintain by），指向你在 [注册维护者](#注册维护者) 一节中注册的的维护者信息。
- `source` ：如果使用私有 AS 号码则此处填写 `DN42` ，否则填写 ASN 所对应的 RIR 名称。

### 注册 IPv4 地址块

_如果您想在 DN42 上创建一个 IPv6 Only 网络，请不要注册 IPv4 地址块，并忽略 [添加路由记录](#添加路由记录) 一节中的 IPv4 部分。_

在国际互联网上， `172.16.0.0/12` 是由 [RFC1918](https://tools.ietf.org/html/rfc1918) 规定的由专用网络使用的 IP 地址块，而 DN42 占用的就是其中的一块： `172.20.0.0/14` 。目前 DN42 开放注册的地址块范围可以在 [Address Space](https://dn42.dev/howto/Address-Space#ipv4-address-space) 页面上查看。

DN42 Registry 的管理员 burble 提供了一个在线查看可用 IPv4 地址块的网站，点击 [DN42 Free IPv4 Explorer](https://explorer.burble.com/free#/4) 即可随机生成 10 个当前还未注册的 IPv4 地址块。

和在真实互联网上一样，DN42 的 IPv4 地址资源也是十分紧缺的，因此 IPv4 的申请原则是「够用就好」。如果节点数量足够少，只申请 `/28` 或 `/29` 大小的地址块就够用了。

在仓库的 `data/inetnum` 目录下新建一个文件，命名为 IP 地址块的 CIDR 格式，并使用 `_` 代替 `/`。

```rpsl
inetnum:            <起始 IP 地址> - <结束 IP 地址>
cidr:               <IP 地址块的 CIDR 格式>
netname:            <IP 地址块名称>
descr:              <IP 地址块简介>
country:            <IP 地址块所属国家>
admin-c:            <NIC 句柄>
tech-c:             <NIC 句柄>
mnt-by:             <维护者>
status:             ASSIGNED
source:             DN42
```

示例：[`data/inetnum/172.23.250.64_26` at dn42/registry@master](https://git.dn42.dev/dn42/registry/src/branch/master/data/inetnum/172.23.250.64_26)

- `inetnum` ：这个地址块的范围。
- `cidr` ：以 CIDR 格式表示的这个地址块的范围，含义与 `inetnum` 相同。
- `netname` ：这个地址块的名称。可以设置为 `<昵称>-IPV4` 。
- `descr` ：（选填）这个地址块的简介。
- `nserver` ：（选填）IP 地址反向解析的 DNS 服务器。
- `country` ：你的 [ISO 3166](https://zh.wikipedia.org/wiki/ISO_3166) 国家代码，填 `CN` 代表中国大陆地区。
- `admin-c` ：管理员联系信息（Admin Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `tech-c` ：技术员联系信息（Tech Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `mnt-by` ：由谁维护（Maintain by），指向你在 [注册维护者](#注册维护者) 一节中注册的的维护者信息。
- `status` ：固定为 `ASSIGNED`。
- `source` ：固定为 `DN42`。

### 注册 IPv6 地址块

在国际互联网上， `fc00::/7` 是由 [RFC4193](https://tools.ietf.org/html/rfc4193) 定义的 [唯一本地地址](https://en.wikipedia.org/wiki/Unique_local_address)，而 DN42 占用的就是其中的一块： `fd00::/8` 。目前 DN42 开放注册的地址块范围可以在 [Address Space](https://dn42.dev/howto/Address-Space#ipv6-address-space) 页面上查看。

DN42 Registry 的管理员 burble 提供了一个在线查看可用 IPv6 地址块的网站，点击 [DN42 Free IPv6 Explorer](https://explorer.burble.com/free#/6) 即可随机生成 10 个当前还未注册的 IPv6 地址块。

在仓库的 `data/inet6num` 目录下新建一个文件，命名为 IPv6 地址块的 CIDR 格式，并使用 `_` 代替 `/`。

```rpsl
inet6num:           <起始 IPv6 地址> - <结束 IPv6 地址>
cidr:               <IPv6 地址块的 CIDR 格式>
netname:            <IPv6 地址块名称>
descr:              <IPv6 地址块简介>
country:            <IPv6 地址块所属国家>
admin-c:            <NIC 句柄>
tech-c:             <NIC 句柄>
mnt-by:             <维护者>
status:             ASSIGNED
source:             DN42
```

示例：[`data/inet6num/fd42:4242:247::_48` at dn42/registry@master](https://git.dn42.dev/dn42/registry/src/branch/master/data/inet6num/fd42:4242:247::_48)

- `inet6num` ：这个地址块的范围。
- `cidr` ：使用 CIDR 格式表示的这个地址块的范围，含义与 `inet6num` 相同。
- `netname` ：这个地址块的名称。可以设置为 `<昵称>-IPV6` 。
- `descr` ：（选填）这个地址块的简介。
- `nserver` ：（选填）IP 地址反向解析的 DNS 服务器。
- `country` ：你的 [ISO 3166](https://zh.wikipedia.org/wiki/ISO_3166) 国家代码，填 `CN` 代表中国大陆地区。
- `admin-c` ：管理员联系信息（Admin Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `tech-c` ：技术员联系信息（Tech Contact），指向你在 [注册联系人](#注册联系人) 一节中注册的 NIC 句柄。
- `mnt-by` ：由谁维护（Maintain by），指向你在 [注册维护者](#注册维护者) 一节中注册的的维护者信息。
- `status` ：固定为 `ASSIGNED`。
- `source` ：固定为 `DN42`。

### 添加路由记录

在仓库的 `data/route` 目录下新建一个文件，命名为 IP 地址块的 CIDR 格式，并使用 `_` 代替 `/`。

```rpsl
route:              <IP 地址块的 CIDR 格式>
descr:              <简介>
origin:             <AS 号码, 带 AS 前缀>
mnt-by:             <维护者>
source:             DN42
```

- `route` ：这个 IPv4 地址块的范围，CIDR 格式。
- `descr` ：（选填）路由简介。
- `origin` ：填写你的 AS 号码。
- `mnt-by` ：由谁维护（Maintain by），指向你在 [注册维护者](#注册维护者) 一节中注册的的维护者信息。
- `source` ：固定为 `DN42`。

如需添加 IPv6 路由，将本节所述的 `route` 改为 `route6` 即可，此处不再赘述。

### 上传更改到 DN42 注册表

完成以上步骤之后，使用 `git diff` 查看文件变动，检查无误后，使用 `git add .` 暂存。

![](https://vip2.loli.io/2021/08/14/RhjwYHFGcaKUSye.png)

运行仓库根目录下的 `./check-my-stuff <维护者>` 检查文件内容是否有误，确定无误后，提交。

在提交时，如果需要使用 GPG 签名，需要在添加 `-S` 参数，如 `git commit -S` ；如果使用 SSH 签名，请直接使用 `git commit` 进行提交，待提交后再进行签名工作。

使用下面的命令进行签名：

```bash
./sign-my-commit --ssh --key <SSH 私钥文件> <维护者>
```

之后使用下面的命令上传即可：

```bash
git push --set-upstream origin <用户名>-<日期, YYYYMMDD>/register
```

![](https://vip2.loli.io/2021/04/04/1YwNjs8uvOJMFoq.png)

上传后在 DN42 Git 中切换到自己的分支，并创建一个合并请求，等待管理员审核。

### 注意事项

1. 各个项目的键和值之间有一长串空格，键、冒号与空格的总长度必须是 20 个字符，且不能随意修改。为了编辑时的方便，注册表中提供了一个脚本 `fmt-my-stuff` ，只需要使用 `./fmt-my-stuff <维护者>` 即可自动完成此步骤。
2. DN42 Registry 的工作语言是英语。请使用英语完成全部流程，以免出现不必要的麻烦。
3. 请认真对待管理员提出的更改请求，按照要求完成全部修改后直接上传到原分支下即可，无需再新开合并请求。
4. 推荐使用随机的 IPv4 与 IPv6 地址块，避免与其他网络重复。请明白，DN42 并不是这些网络资源的权威注册机构。

## DN42 BIRD2 使用入门

如无特别说明，本部分中所使用的 BIRD 版本为 `2.0.7` 。

### 安装 BIRD2

```bash
apt update
apt install bird2 -y
```

一般情况下，执行此命令即可自动安装 BIRD2 并启动系统服务。

### 编写 BIRD 配置文件

对于刚刚加入 DN42 网络的新人来说，推荐使用 [howto/Bird2 - DN42 Wiki](https://dn42.dev/howto/Bird2#example-configuration) 中的示例配置以节省配置时间。

这套配置默认使用了 Multi Protocol BGP ，如果不想使用此功能请自行编写配置文件，如果没有 DN42 IPv4 地址需要去掉文件中的 IPv4 部分。

将以下配置写入到 `/etc/bird/bird.conf` 中：

```
define OWNAS       = <AS 号>;
define OWNIP       = <DN42 IPv4 地址>;
define OWNIPv6     = <DN42 IPv6 地址>;
define OWNNET      = <DN42 IPv4 地址块, CIDR 格式>;
define OWNNETv6    = <DN42 IPv6 地址块, CIDR 格式>;
define OWNNETSET   = [ <DN42 IPv4 地址块, CIDR 格式>+ ];
define OWNNETSETv6 = [ <DN42 IPv4 地址块, CIDR 格式>+ ];

router id OWNIP;

protocol device {
    scan time 10;
}

function is_self_net() {
    return net ~ OWNNETSET;
}

function is_self_net_v6() {
    return net ~ OWNNETSETv6;
}

function is_valid_network() {
    return net ~ [
        172.20.0.0/14{21,29}, # dn42
        172.20.0.0/24{28,32}, # dn42 Anycast
        172.21.0.0/24{28,32}, # dn42 Anycast
        172.22.0.0/24{28,32}, # dn42 Anycast
        172.23.0.0/24{28,32}, # dn42 Anycast
        172.31.0.0/16+,       # ChaosVPN
        10.100.0.0/14+,       # ChaosVPN
        10.127.0.0/16{16,32}, # neonetwork
        10.0.0.0/8{15,24}     # Freifunk.net
    ];
}

roa4 table dn42_roa;
roa6 table dn42_roa_v6;

protocol static {
    roa4 { table dn42_roa; };
    include "/etc/bird/roa_dn42.conf";
};

protocol static {
    roa6 { table dn42_roa_v6; };
    include "/etc/bird/roa_dn42_v6.conf";
};

function is_valid_network_v6() {
  return net ~ [
    fd00::/8{44,64} # ULA address space as per RFC 4193
  ];
}

protocol kernel {
    scan time 20;

    ipv6 {
        import none;
        export filter {
            if source = RTS_STATIC then reject;
            krt_prefsrc = OWNIPv6;
            accept;
        };
    };
};

protocol kernel {
    scan time 20;

    ipv4 {
        import none;
        export filter {
            if source = RTS_STATIC then reject;
            krt_prefsrc = OWNIP;
            accept;
        };
    };
}

protocol static {
    route OWNNET reject;

    ipv4 {
        import all;
        export none;
    };
}

protocol static {
    route OWNNETv6 reject;

    ipv6 {
        import all;
        export none;
    };
}

template bgp dnpeers {
    local as OWNAS;
    path metric 1;

    ipv4 {
        import filter {
            if is_valid_network() && !is_self_net() then {
                if (roa_check(dn42_roa, net, bgp_path.last) != ROA_VALID) then {
                    print "[dn42] ROA check failed for ", net, " ASN ", bgp_path.last;
                    reject;
                }
                accept;
            }
            reject;
        };

        export filter {
            if is_valid_network() && source ~ [RTS_STATIC, RTS_BGP] then accept;
            reject;
        };
        import limit 1000 action block;
    };

    ipv6 {
        import filter {
            if is_valid_network_v6() && !is_self_net_v6() then {
                if (roa_check(dn42_roa_v6, net, bgp_path.last) != ROA_VALID) then {
                    print "[dn42] ROA check failed for ", net, " ASN ", bgp_path.last;
                    reject;
                }
                accept;
            }
            reject;
        };
        export filter {
            if is_valid_network_v6() && source ~ [RTS_STATIC, RTS_BGP] then accept;
            reject;
        };
        import limit 1000 action block;
    };
}


include "/etc/bird/peers/*";
```

然后在 `/etc/bird` 目录下创建一个文件夹，命名为 `peers` ，以便后续存储配置文件使用。

如果想更深入的学习如何编写 BIRD 配置文件，推荐查看 [BIRD 与 BGP 的新手开场](https://github.com/moesoha/bird-bgp-kickstart) 和 [BIRD 官方文档](https://bird.network.cz/?get_doc&f=bird.html&v=20) 。

### 下载 ROA 配置文件

```bash
wget -4 -O /tmp/dn42_roa.conf https://dn42.burble.com/roa/dn42_roa_bird2_4.conf && mv -f /tmp/dn42_roa.conf /etc/bird/dn42_roa.conf
wget -4 -O /tmp/dn42_roa_v6.conf https://dn42.burble.com/roa/dn42_roa_bird2_6.conf && mv -f /tmp/dn42_roa_v6.conf /etc/bird/dn42_roa_v6.conf
```

使用此命令即可将 ROA 文件下载到本机以供使用。

还需要将此命令添加为定时任务，推荐设置为每小时运行一次，否则不会更新到最新的 ROA ，每次更新后都需要使用 `birdc configure` 命令重载 BIRD 配置。

### 重新加载 BIRD 配置

```bash
birdc configure
```

使用该命令重新加载 BIRD 配置，并使用 `birdc show protocol` 查看状态。

![](https://vip1.loli.io/2021/08/16/ZSPe6a3fpuDATG2.png)

## DN42 WireGuard 使用入门

WireGuard 是一种简单易用、速度快、现代化的 VPN ，它利用了最先进的加密技术，并使用 UDP 协议传输数据。WireGuard 设计为通用 VPN ，可在嵌入式设备和超级计算机上运行，​​ 适用于许多不同的环境。WireGuard 起初是专为 Linux 编写并发布的，后来被移植到各个平台上。在 WireGuard.com 上可以找到它的 [技术白皮书](https://www.wireguard.com/papers/wireguard.pdf) 。

### 安装 WireGuard

```bash
apt update
apt install wireguard -y
```

一般情况下，执行此命令即可直接安装 WireGuard 和 WireGuard Tools ，无需额外操作。

### 生成公钥与私钥

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```

使用此命令即可在当前目录下生成两个名叫 `privatekey` 和 `publickey` 的文件，分别代表私钥和公钥。

### 搭建 WireGuard 隧道

搭建 WireGuard 隧道非常简便，只需要生成一对公钥与私钥并与对等端交换公钥即可。

如果需要通过 WireGuard 隧道建立 BGP 会话，不能使用 WireGuard 内建的多 Peer 功能，必须为每个对等端创建一条隧道。

在 `/etc/wireguard` 目录下新建一个名为 `<隧道名>.conf` 的文件：

```ini
[Interface]
PrivateKey = <私钥>
ListenPort = <监听端口>
PostUp     = ip address add <链路本地地址>/64 dev %i
PostUp     = ip addr add <本地 IPv6 地址>/128 peer <对端 IPv6 地址>/128 dev %i
PostUp     = ip addr add <本地 IPv4 地址>/32 peer <对端 IPv4 地址>/32 dev %i
Table      = off
```

- `PrivateKey` ：私钥。
- `ListenPort` ：监听端口。
- 第一个 `PostUp` ：（可选，推荐）添加链路本地地址。
- 第二个 `PostUp` ：（可选）添加本地和对等端的 DN42 IPv6 地址。
- 第三个 `PostUp` ：（可选）添加本地和对等端的 DN42 IPv4 地址。
- `Table` ：必须设定为 `off` （不导入系统路由表），否则会导致系统断网。

当使用链路本地地址建立 BGP 会话时，可以不设置 DN42 IPv4 和 DN42 IPv6 地址，但是机器上必须有一张网卡上绑定了本机的 DN42 IPv4 和 DN42 IPv6 地址。同理，如果不使用链路本地地址建立 BGP 会话则无需添加链路本地地址。

```ini
[Peer]
PublicKey           = <对端公钥>
PresharedKey        = <对端预共享密钥>
Endpoint            = <对端 IP/域名 和 端口号>
PersistentKeepalive = 30
AllowedIPs          = 10.0.0.0/8, 172.20.0.0/14, 172.31.0.0/16, fd00::/8, fe80::/64
```

- `PublicKey` ：对端公钥。
- `PresharedKey` ：（可选）对端预共享密钥。
- `Endpoint` ：（可选）对端的连接域名/IP 及端口号。<br>
  如果对端没有公网 IP 地址，需要本地设置为被动模式则无需填写此项。
- `PersistentKeepalive` ：（可选）每隔多少秒发送一次握手信息防止连接被中断并更新对端 IP 。<br>
  如果本地没有公网 IP 地址，必须配置此项。
- `AllowedIPs` ：允许使用 WireGuard 转发流量的 IP 地址段。

之后使用 `wg-quick up <隧道名>` 来启动隧道即可。

如需开机自启，可以在测试无误后执行 `systemctl enable wg-quick@<隧道名>` 。

### 检测隧道状态

```bash
wg show <隧道名>
```

使用该命令即可查看隧道状态。

![](https://vip1.loli.io/2021/08/16/wxgUJNHnQAXFMdS.png)

如上图所示，当 `latest handshake` 时间较近且 `transfer` 有收有发时可以认为隧道正常。

如需查看所有隧道的状态，直接使用 `wg` 命令即可。

## 与其他网络进行对等互联

### 系统配置

在 DN42 网络中，没有绝对意义上的客户端，每个人都可能是他人的路由器，经常会出现数据包的来源网卡与回复使用的网卡不一致的情况，因此需要打开 Linux 内核的数据包转发功能，具体操作如下：

```bash
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.default.forwarding=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p
```

同时，也需要关闭 Linux 内核的 `rp_filter` 的严格模式，具体操作如下：

```bash
echo "net.ipv4.conf.default.rp_filter=0" >> /etc/sysctl.conf
echo "net.ipv4.conf.all.rp_filter=0" >> /etc/sysctl.conf
sysctl -p
```

除此之外，还需要关闭一些自动化的配置 iptables 防火墙的工具，如 UFW 。

### 搭建 WireGuard 隧道

请参考 [DN42 WireGuard 使用入门](#DN42-WireGuard-使用入门) 一节。

### 配置 BGP 会话

在 `/etc/bird/peers` 目录下新建一个文件，命名为 `<名字>.conf` 。

如果使用链路本地地址进行 Peer 的话，需要按照下面的配置示例进行配置：

```bird
protocol bgp <名字> from dnpeers {
    neighbor <对端链路本地地址> % '<对端 WireGuard 隧道名>' as <对端 ASN>;
    source address <本地的链路本地地址>;
}
```

否则按照下面的配置示例进行配置：

```bird
protocol bgp <名字> from dnpeers {
    neighbor <对端 IPv6 地址> as <对端 ASN>;
}
```

然后使用 `birdc configure` 重载配置即可。

## 更新日志

- 2021-04-04 第一版 <sup>（2021 年 8 月 10 日存档于 [互联网档案馆](https://web.archive.org/web/20210810062825/https://blog.baoshuo.ren/post/dn42-network/)）</sup>
- 2021-08-14 第二版

## 参考资料

1. [Getting Started - DN42 Wiki](https://dn42.dev/howto/Getting-Started)
2. [Guide for creating a Pull Request - dn42/registry - DN42 Git](https://git.dn42.dev/dn42/registry/src/branch/master/README.md)
3. [DN42 实验网络介绍及注册教程（2020-10-01 更新） - Lan Tian @ Blog](https://lantian.pub/article/modify-website/dn42-experimental-network-2020.lantian/)
4. [IETF Datatracker](https://datatracker.ietf.org/)
5. [Unique local address - Wikipedia](https://en.wikipedia.org/wiki/Unique_local_address)
6. [BIRD 与 BGP 的新手开场 - Soha Jin - GitHub](https://github.com/moesoha/bird-bgp-kickstart)
