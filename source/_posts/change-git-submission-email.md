---
title: 批量修改 Git 仓库的提交邮箱
date: 2020-11-25 20:03:03
updated: 2020-11-25 20:03:03
categories:
  - 随笔
tags:
  - Git
---

这几天重装了系统，一个不小心提交了好多 author 为 `"root"<root@localhost>` 的 commit ，于是寻找到了一个修改的方法。

在仓库根目录下新建一个名为 `fix.sh` 的 shell 脚本，输入以下内容：

```bash
#!/bin/bash

git filter-branch --env-filter '
an="$GIT_AUTHOR_NAME"
am="$GIT_AUTHOR_EMAIL"
cn="$GIT_COMMITTER_NAME"
cm="$GIT_COMMITTER_EMAIL"

if [ "$GIT_COMMITTER_EMAIL" = "错误邮箱" ]
then
    cn="正确名称"
    cm="正确邮箱"
fi
if [ "$GIT_AUTHOR_EMAIL" = "错误邮箱" ]
then
    an="正确名称"
    am="正确邮箱"
fi

export GIT_AUTHOR_NAME="$an"
export GIT_AUTHOR_EMAIL="$am"
export GIT_COMMITTER_NAME="$cn"
export GIT_COMMITTER_EMAIL="$cm"
'
```

完成后运行 `./fix.sh` 即可。

PS: 跑完记得删脚本，或者直接把脚本内容改好之后拖进终端
