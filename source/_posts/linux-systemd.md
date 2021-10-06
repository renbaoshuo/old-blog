---
title: Linux Systemd 入门
date: 2021-02-12 00:06:31
updated: 2021-02-12 00:06:31
categories:
  - 技术
tags:
  - Linux
feature: 'https://vip1.loli.io/2021/08/17/bnP7pH3XR6IAx1U.png'
---

Systemd 是 Linux 电脑操作系统之下的一套中央化系统及设置管理程序，包括有守护进程、程序库以及应用软件，由 Lennart Poettering 带头开发。其开发目标是提供更优秀的框架以表示系统服务间的依赖关系，并依此实现系统初始化时服务的并行启动，同时达到降低 Shell 的系统开销的效果，最终代替现在常用的 System V 与 BSD 风格 init 程序。

<!-- more -->

目前绝大多数的 Linux 发行版都已采用 systemd 代替原来的 System V。

## 常用命令列表

- 列出所有已加载的单元：`systemctl list-units`
- 查看指定的单元的配置：`systemctl cat [serviceName]` _(e.g. `systemctl cat sshd.service`)_
- 修改指定单元的配置：`systemctl edit [serviceName]` _(e.g. `systemctl edit sshd.service`)_
- 查看指定的单元的运行状态： `systemctl status [serviceName|pid]` _(e.g. `systemctl status sshd.service`)_
  - 如果指定了单元名称，那么显示指定单元的运行时状态信息，以及这些单元最近的日志数据。
  - 如果指定了 PID ，那么显示指定 PID 所属单元的运行时状态信息，以及这些单元最近的日志数据。
  - 如果未指定任何单元或 PID ，那么显示整个系统的状态信息， 此时若与 `--all` 连用，则同时显示所有已加载的单元（可以用 `-t` 限定单元类型）的状态信息。
- 启动指定的单元：`systemctl start [serviceName]` _(e.g. `systemctl start sshd.service`)_
  - 被指定的单元必须是已经被加载的。
- 重新启动指定的单元：`systemctl restart [serviceName]` _(e.g. `systemctl restart sshd.service`)_
  - 如果指定的单元没有启动，则直接启动它们。
- 停止指定的单元：`systemctl stop [serviceName]` _(e.g. `systemctl stop sshd.service`)_
- 启用指定的单元：`systemctl enable [serviceName]` _(e.g. `systemctl enable sshd.service`)_
- 停用指定的单元：`systemctl disable [serviceName]` _(e.g. `systemctl disable sshd.service`)_
- 重新加载指定的单元的配置：`systemctl reload [serviceName]` _(e.g. `systemctl reload sshd.service`)_
- 重新加载所有已修改过的配置文件：`systemctl daemon-reload`

## 开机启动

对于那些支持 Systemd 的软件，安装的时候，会自动在 `/usr/lib/systemd/system` 目录添加一个配置文件。

如果你想让该软件开机启动，就执行下面的命令（以 `sshd.service` 为例）。

```bash
sudo systemctl enable sshd.service
```

上面的命令相当于在 `/etc/systemd/system` 目录添加一个符号链接，指向 `/usr/lib/systemd/system` 里面的 `sshd.service` 文件。

这是因为开机时，Systemd 只执行 `/etc/systemd/system` 目录里面的配置文件。这也意味着，如果把修改后的配置文件放在该目录，就可以达到覆盖原始配置的效果。

## Unit

### 配置文件

对于那些没有原生支持 Systemd 的软件，可以自行编写配置文件来达到开机自启的目的。

> 我曾经为 Sakura Frp 编写过一个脚本：[getfrp.sh](https://getfrp.sh) <sup>（[存档](https://gist.github.com/renbaoshuo/9c351b3e5750a2f6d453d035e0fd071a#file-getfrp-sh-L200-L213) 于 GitHub Gist）</sup> ，里面便是使用了自行编写配置文件的方法。

以 `sshd.service` 这个配置文件为例子，来分析一下 Systemd 的配置文件：

```ini
# /lib/systemd/system/ssh.service

[Unit]
Description=OpenBSD Secure Shell server
Documentation=man:sshd(8) man:sshd_config(5)
After=network.target auditd.service
ConditionPathExists=!/etc/ssh/sshd_not_to_be_run

[Service]
EnvironmentFile=-/etc/default/ssh
ExecStartPre=/usr/sbin/sshd -t
ExecStart=/usr/sbin/sshd -D $SSHD_OPTS
ExecReload=/usr/sbin/sshd -t
ExecReload=/bin/kill -HUP $MAINPID
KillMode=process
Restart=on-failure
RestartPreventExitStatus=255
Type=notify
RuntimeDirectory=sshd
RuntimeDirectoryMode=0755

[Install]
WantedBy=multi-user.target
Alias=sshd.service
```

可以看出这个文件一共有三个部分：`[Unit]`, `[Service]` 和 `[Install]` 。

配置项通常是可以重复的，但靠后的配置项会取代前面同名的配置项。  
因此，如果你想要将某项的设定值归零，可以在该配置所在部分的结尾添加一个空值项（如 `After=`），就将该设定归零了。

#### [Unit]: 启动顺序与依赖关系

这个部分主要有以下几个配置项：

- `Description`: 当前服务的简易说明
- `Documentation`: 文档位置（以空格分隔）
  - 该项可以是网页链接，也可以是 manpages 的名称，亦或是文件路径。
- `Before`: 在哪些服务之前启动
  - 本字段不涉及依赖关系，只是说明了启动顺序
- `After`: 在哪些服务之后启动
  - 本字段不涉及依赖关系，只是说明了启动顺序
  - 以 `sshd.service` 中的配置为例，该服务需要在 `network.target` 和 `auditd.service` 之后启动
- `Wants`: 弱依赖的服务
  - 若被依赖的服务被停止，这个服务不需要停止
- `Requires`: 强依赖的服务
  - 若被依赖的服务没有启动，则不能启动这个服务
  - 若被依赖的服务被停止，则这个服务也必须停止
- `Conflicts`: 冲突的服务
  - 如果列出的服务中有一个已经运行，那么就不能启动这个服务

#### [Service]: 启动行为

这个部分主要有以下几个配置项：

- `Type`: 启动类型。默认值为 `simple` ，可选值如下：
  - `simple`: 使 `ExecStart` 项启动的项成为主进程
  - `forking`: `ExecStart` 项将会以 `fork()` 的形式启动，此时父进程将会退出，子进程将成为主进程
  - `oneshot`: 类似于 `simple` ，但只执行一次，Systemd 会等它执行完，才启动其他服务
  - `dbus`: 类似于 `simple` ，但会等待 `D-Bus` 信号后启动
  - `notify`: 类似于 `simple` ，启动结束后会发出通知信号，然后 Systemd 再启动其他服务
  - `idle`: 类似于 `simple` ，但是要等到其他任务都执行完，才会启动该服务。
    - 这个选项的其中一种使用场合是为让该服务的输出，不与其他服务的输出相混合
    - 这个选项的另外一种使用场合是执行只需要再开机的时候执行一次的程序
- `Environment`: 指定环境变量
- `EnvironmentFile`: 环境变量配置文件，该文件内部的 `key=value` 形式的配置可以在当前文件中以 `$key` 获取
- `ExecStart`: 服务启动时执行的命令
- `ExecReload`: 服务重启时执行的命令
- `ExecStop`: 服务停止时执行的命令
- `ExecStartPre`: 服务启动之前执行的命令
- `ExecStartPost`: 服务启动之后执行的命令
- `ExecStopPost`: 服务停止之后执行的命令
- `Restart`: 服务退出后的重启方式，默认值为 `no`
  - `no`: 进程退出后不会重启
  - `on-success`: 当进程正常退出时（退出状态码为 0）重启
  - `on-failure`: 当进程非正常退出时（退出状态码不为 0、被信号终止、程序超时）重启
  - `on-abnormal`: 当进程被信号终止或程序超时时重启
  - `on-abort`: 当收到没有捕捉到的信号终止时重启
  - `on-watchdog`: 当进程超时退出时重启
  - `always`: 总是重启（不论原因）
  - 对于守护进程，推荐设为 `on-failure`。对于那些允许发生错误退出的服务，可以设为 `on-abnormal`。
- `RemainAfterExit`: 退出后是否重新启动
  - 当设定为 `RemainAfterExit=1` 时，则当这个服务所属的所有程序都终止之后，此服务会再尝试启动。这对于 `Type=oneshot` 的服务很有帮助
- `TimeoutSec`: 当这个服务在启动或停止时失败进入"强制结束"状态的等待秒数。
- `KillMode`: 定义 Systemd 如何停止这个服务，默认值为 `control-group`
  - `control-group`: 服务停止时关闭此控制组中所有的进程
  - `process`: 服务停止时只终止主进程（ExecStart 接的后面那串指令）
  - `mixed`: 主进程将收到 **SIGTERM** 信号，子进程收到 **SIGKILL** 信号
  - `none`: 没有进程会被杀掉，只是执行服务的 stop 命令
- `RestartSec`: 表示 Systemd 重启服务之前，需要等待的秒数（默认是 100ms）

所有的启动设置之前，都可以加上一个连词号 (`-`) ，表示 "抑制错误" ，即发生错误的时候，不影响其他命令的执行。以 `sshd.service` 为例，文件中的 `EnvironmentFile=-/etc/sysconfig/sshd`（注意等号后面的那个连词号），表示 `/etc/sysconfig/sshd` 文件不存在，也不会抛出错误。

#### [Install]: 安装行为

这个部分主要有以下几个配置项：

- `WantedBy`: 表示该服务所在的 Target
  - 一般来说，服务性质的单元都是挂在 `multi-user.target` 下的
- `Also`: 当该服务被启用时需要同时启用的单元
- `Alias`: 指定创建软链接时链接至本单元配置文件的别名文件

### 模板实例

此处以 `getty@.service` 文件为例，来分析一下它是如何做到使用一个配置文件启动多个服务的：

```ini
# /lib/systemd/system/getty@.service
#
#  SPDX-License-Identifier: LGPL-2.1+
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

[Unit]
Description=Getty on %I
Documentation=man:agetty(8) man:systemd-getty-generator(8)
Documentation=http://0pointer.de/blog/projects/serial-console.html
After=systemd-user-sessions.service plymouth-quit-wait.service getty-pre.target
After=rc-local.service

# If additional gettys are spawned during boot then we should make
# sure that this is synchronized before getty.target, even though
# getty.target didn't actually pull it in.
Before=getty.target
IgnoreOnIsolate=yes

# IgnoreOnIsolate causes issues with sulogin, if someone isolates
# rescue.target or starts rescue.service from multi-user.target or
# graphical.target.
Conflicts=rescue.service
Before=rescue.service

# On systems without virtual consoles, don't start any getty. Note
# that serial gettys are covered by serial-getty@.service, not this
# unit.
ConditionPathExists=/dev/tty0

[Service]
# the VT is cleared by TTYVTDisallocate
# The '-o' option value tells agetty to replace 'login' arguments with an
# option to preserve environment (-p), followed by '--' for safety, and then
# the entered username.
ExecStart=-/sbin/agetty -o '-p -- \\u' --noclear %I $TERM
Type=idle
Restart=always
RestartSec=0
UtmpIdentifier=%I
TTYPath=/dev/%I
TTYReset=yes
TTYVHangup=yes
TTYVTDisallocate=yes
KillMode=process
IgnoreSIGPIPE=no
SendSIGHUP=yes

# Unset locale for the console getty since the console has problems
# displaying some internationalized messages.
UnsetEnvironment=LANG LANGUAGE LC_CTYPE LC_NUMERIC LC_TIME LC_COLLATE LC_MONETARY LC_MESSAGES LC_PAPER LC_NAME LC_ADDRESS LC_TELEPHONE LC_MEASUREMENT LC_IDENTIFICATION

[Install]
WantedBy=getty.target
DefaultInstance=tty1
```

运行 `systemctl status getty@tty1.service` 命令，可以看到如下图所示的输出：

![](https://vip1.loli.io/2021/02/11/lhw1BzOUb7TRDrq.png)

不难发现图中标橙色的字符与上方配置文件中的 `%I` 相对应，并且配置文件的名称也不是 `getty@tty1.service` ，而是 `getty@.service` ，这种配置文件叫做 "模板实例" 。

启动时只需要在 `@` 后面添加需要填入 `%I` 位置的参数即可，如 `getty@tty9.service` 。

## Target

一般来说，常用的 Target 有两个：一个是 `multi-user.target` ，表示多用户命令行状态；另一个是 `graphical.target` ，表示图形用户状态（它依赖于 `multi-user.target`），这一点和 SysVinit 的运行级别很是相似。

官方提供了一张非常清晰的 Target 依赖关系图：

![](https://vip2.loli.io/2021/02/11/ubmqlLdiGeCtUg7.png)

图源：https://www.freedesktop.org/software/systemd/man/bootup.html#System%20Manager%20Bootup

### 配置文件

以 `multi-user.target` 这个文件为例子，来简要说明一下 Target 的配置文件中的主要项目：

```ini
# /lib/systemd/system/multi-user.target
#
#  SPDX-License-Identifier: LGPL-2.1+
#
#  This file is part of systemd.
#
#  systemd is free software; you can redistribute it and/or modify it
#  under the terms of the GNU Lesser General Public License as published by
#  the Free Software Foundation; either version 2.1 of the License, or
#  (at your option) any later version.

[Unit]
Description=Multi-User System
Documentation=man:systemd.special(7)
Requires=basic.target
Conflicts=rescue.service rescue.target
After=basic.target rescue.service rescue.target
AllowIsolate=yes
```

- `Requires`: 要求于某个 Target 一起运行
- `Conflicts`: 冲突的 Target
- `After`: 在哪些 Target 之后启动
- `AllowIsolate`: 是否允许使用 `systemctl isolate` 命令切换到这个 Target

## 参考资料

1. [Systemd - Wikipedia](https://en.wikipedia.org/wiki/Systemd) <sup>（[存档](https://web.archive.org/web/20210210150200/https://en.wikipedia.org/wiki/Systemd) 于 [互联网档案馆](https://archive.org)）</sup>
2. [Systemd - Ubuntu Manpages](https://manpages.ubuntu.com/manpages/bionic/zh_CN/man1/systemctl.1.html) <sup>（[存档](https://web.archive.org/web/20210210150518/https://manpages.ubuntu.com/manpages/bionic/zh_CN/man1/systemctl.1.html) 于 [互联网档案馆](https://archive.org)）</sup>
3. [第十七章 认识系统服务(daemons) - 鸟哥的 Linux 私房菜](http://linux.vbird.org/linux_basic/0560daemons.php) <sup>（[存档](https://web.archive.org/web/20200810204650/http://linux.vbird.org/linux_basic/0560daemons.php) 于 [互联网档案馆](https://archive.org)）</sup>
