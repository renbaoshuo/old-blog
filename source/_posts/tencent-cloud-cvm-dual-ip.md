---
title: 给腾讯云服务器免费增加第二个 IP
date: 2020-08-20 13:22:47
updated: 2020-08-20 13:22:47
categories:
  - 随笔
tags:
  - 腾讯云
---

## 前言

良心云果然是良心云，增加了一个 IP 四舍五入居然不要钱，不过还是要登进系统配置一下双 IP 的。

<!-- more -->

![](https://vip2.loli.io/2020/11/26/rAyvBmDw2bdMP6t.jpg)

和客服的对话

## 增加网卡&公网 IP

![](https://vip2.loli.io/2020/11/26/SWwlbLRaHACnuBz.png)

点击按钮新建一个弹性网卡并绑定

![](https://vip1.loli.io/2020/11/26/sJqBfdbv4eRzZFm.png)

绑定完以后可以在服务器的弹性网卡管理页面看到详情

![](https://vip1.loli.io/2020/11/26/ivPFgfH69XTCo8Z.png)

点击新建的弹性网卡，进入管理页面，并记录下这张网卡的**内网 IP**，稍后会用到

![](https://vip1.loli.io/2020/11/26/FAy8U5lpzNtuMTi.png)

点击绑定按钮，并申请一个弹性公网 IP

![](https://vip2.loli.io/2020/11/26/AbZ4vTwr1UCdz2n.png)
![](https://vip2.loli.io/2020/11/26/2G5jsdTSZrocqwh.png)

此时弹性公网 IP 已经绑定成功，并且可以看到已经变为不收取 IP 资源费的状态了

![](https://vip1.loli.io/2020/11/26/x8q7I5E2dMSDt4B.png)

查看主网卡的**内网 IP**，并记录下这个 IP，稍后会用到

## 配置服务器的网络设置

使用 `ip addr` 查看网卡名称，并记录下来

![](https://vip2.loli.io/2020/11/26/Ofh8CzvnYKPGsH7.png)

切换到网卡配置文件目录

```bash
cd /etc/sysconfig/network-scripts/
```

编辑 `ifcfg-eth0` 文件，将下方内容修改后填入

```
DEVICE="eth0"             # 弹性网卡名称
NM_CONTROLLED="yes"       # 是否由 Network Manager 控制该网络接口
ONBOOT="yes"              # 系统启动时是否激活
IPADDR="172.21.0.10"      # 弹性网卡上的 IP 地址
NETMASK="255.255.240.0"   # 子网掩码
GATEWAY="172.21.0.1"      # 网关
```

- 其中 `IPADDR` 填写主网卡的**内网 IP**。
- 子网掩码可以使用 [V2EX 提供的 IPv4 子网查询工具](https://www.v2ex.com/tools/ipv4) 查询对应的子网。
- 网关根据创建网卡时选择的子网而定。

新建 `ifcfg-eth1` 文件，将下方内容修改后填入

```
DEVICE="eth1"             # 需配置的弹性网卡名称（此处是新添加的网卡名称）
NM_CONTROLLED="yes"       # 是否由 Network Manager 控制该网络接口
ONBOOT="yes"              # 系统启动时是否激活
IPADDR="172.21.0.12"      # 弹性网卡上的 IP 地址
NETMASK="255.255.240.0"   # 子网掩码
# GATEWAY="172.21.0.1"    # 网关（若与eth0的网关不同，需要删除注释并修改为正确的网关）
```

- 其中 `IPADDR` 填写新添加网卡的**内网 IP**。
- 子网掩码可以 [V2EX 提供的 IPv4 子网查询工具](https://www.v2ex.com/tools/ipv4) 查询对应的子网。
- 网关根据创建网卡时选择的子网而定。

保存后重启网络服务。

```bash
service network restart
```

![](https://vip1.loli.io/2020/11/26/ReBSM4C9oF2HbVi.png)

## 配置路由（可选）

> 按照上述步骤配置好后，Linux 还是默认都从主网卡发包。
> 您可通过策略路由让报文从哪个网卡进，并从该网卡返回。

### 创建路由表

```bash
echo "10 t1" >> /etc/iproute2/rt_tables
echo "20 t2" >> /etc/iproute2/rt_tables
```

### 添加默认路由

```bash
ip route add default dev eth0 via 172.21.0.1 table 10
ip route add default dev eth1 via 172.21.0.1 table 20
```

> 上述两个命令中，172.21.0.1 要分别替换成主网卡所属子网的网关，以及辅助网卡所属子网的网关。

### 配置策略路由

```bash
ip rule add from 172.21.0.10 table 10
ip rule add from 172.21.0.12 table 20
```
