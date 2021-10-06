---
title: 【随笔】下载自己在 SM.MS 图床上的所有图片
date: 2020-11-28 21:39:32
updated: 2020-11-28 21:39:32
categories:
  - 随笔
tags:
---

前提条件：有 SM.MS 图床账号，并且图片存储在该账号下。

思路：先请求 API，获取图片列表。遍历列表，判断本地是否存在该图片，若不存在则下载该图片。

代码如下。

```python
import requests
import os
import json
import pathlib
import sys

def getUploadedImages(token) -> str:
    url = "https://sm.ms/api/v2/upload_history"
    headers = {"Authorization": token}
    return requests.get(url, headers=headers).text

data = json.loads(getUploadedImages(sys.argv[1]))

for img in data["data"]:
    path = "./data/" + img["storename"]
    if not pathlib.Path(path).is_file():
        pic = requests.get(img["url"]).content
        f = open(path, "wb")
        f.write(pic)
        f.close()
        del pic
        print("Successfully get "+img["storename"]+" .")
    else:
        print(""+img["storename"]+" is already exists.")
```

使用方法：`python3 smms-image.py "[your token here]"`

下载下来的图片会存到 `./data/` 目录下（请提前新建）。
