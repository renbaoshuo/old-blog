---
title: 浅谈跨域资源共享（CORS）
date: 2021-10-02 22:24:02
updated: 2021-10-02 22:24:02
categories:
  - 技术
tags:
  - Web
  - HTTP
  - JavaScript
excerpt: >
  跨域资源共享（CORS）是一种基于 HTTP 头来让网页的受限资源能够被其他域名的页面访问的一种机制。通过该机制，页面能够自由地使用不同源的图片、样式、脚本、iframes 以及视频。
  在通常情况下，一些跨域的请求会被同源策略禁止。而 CORS 定义了一种方式，可以允许 Web 应用服务器进行跨源访问控制，从而使得跨源数据传输得以安全进行。
feature: 'https://vip1.loli.io/2021/10/02/6YfLj17HUV4e9Wd.png'
---

跨域资源共享（CORS）是一种基于 HTTP 头来让网页的受限资源能够被其他域名的页面访问的一种机制。通过该机制，页面能够自由地使用不同源（cross-origin）的图片、样式、脚本、iframes 以及视频。

在通常情况下，一些跨域的请求（特别是 ajax）会被同源策略（same-origin policy）禁止。而 CORS 定义了一种方式，可以允许 Web 应用服务器进行跨源访问控制，从而使得跨源数据传输得以安全进行。

---

目前几乎所有现代浏览器都支持 CORS ，可以在 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7) 上找到有关浏览器兼容性的信息。

浏览器将 CORS 请求分成两类：简单请求（simple request）和非简单请求（not-so-simple request）。_这两个术语并不属于 Fetch 规范。_

## 简单请求

某些请求不会触发 CORS 预检请求。本文中称这样的请求为「简单请求」。

### 定义

若请求满足所有下述条件则该请求可被视为「简单请求」：

1. 请求方法为 `HEAD`，`GET` 或 `POST` 。
2. 除了被用户代理自动设置的字段以及在 Fetch 规范中被定义为 [禁用头名称](https://fetch.spec.whatwg.org/#forbidden-header-name) 的字段之外，HTTP 头信息只允许包含 Fetch 规范定义的 [对 CORS 安全的首部字段集合](https://fetch.spec.whatwg.org/#cors-safelisted-request-header) ：
   - `Accept`
   - `Accept-Language`
   - `Content-Language`
   - `Last-Event-ID`
   - `Content-Type` 仅限于三个值：`application/x-www-form-urlencoded`、`multipart/form-data` 或 `text/plain`
3. 请求中的任意 `XMLHttpRequestUpload` 对象均没有注册任何事件监听器；`XMLHttpRequestUpload` 对象可以使用 `XMLHttpRequest.upload` 属性访问。
4. 请求中没有使用 `ReadableStream` 对象。

简单请求的设计是为了兼容表单（form），因为历史上表单就一直可以发出跨域请求。

### 基本流程

对于简单请求，浏览器会直接发出 CORS 请求。具体来说，就是增加一个名为 `Origin` 的字段到 HTTP 头中。

```http
GET /cors HTTP/1.1
Origin: http://foo.example
Host: foo.example
Accept-Language: zh-CN
Connection: keep-alive
User-Agent: Mozilla/5.0...
```

上面的头信息中，`Origin` 字段用来说明本次请求来自哪个源，服务器端根据这个值决定是否同意这个请求。

如果 `Origin` 指定的源在许可范围内，服务器返回的响应头会添加以下几个字段：

- `Access-Control-Allow-Origin` 字段表明服务器允许的请求源，其值要么为请求时 Origin 字段的值，要么为 `*` 。
- `Access-Control-Allow-Credentials` 字段表明服务器是否允许发送凭据信息，该字段是可选的，默认情况下不允许发送凭据信息。
- `Access-Control-Expose-Headers` 字段表明服务器指定的允许获取的 HTTP 头字段，该字段是可选的。

如果 `Origin` 指定的源不在许可范围内，服务器会返回一个不带 `Access-Control-Allow-Origin` 字段的正常的 HTTP 回应。当浏览器发现没有包含这个字段就知道请求出错了，会抛出一个异常。需要注意的是，这种错误的 HTTP 响应码有可能是 200 或 204 ，因此无法通过状态码识别。

### 代码示例

```javascript
fetch('https://baoshuo.ren', {
  mode: 'no-cors',
});
```

## 非简单请求 —— 预检请求

上面提到，CORS 请求除了简单请求外还有非简单请求。简单来说，非简单请求时对服务器有特殊要求的请求，比如请求方法是 `PUT` 或 `DELETE` ，或者 HTTP 头中 `Content-Type` 字段的值不是上文所述的那三个「对 CORS 安全的 `Content-type` 字段值」。

### 基本流程

非简单请求的 CORS 请求，会在正式通信之前增加一次称为「预检」（preflight）的 HTTP 查询请求。

![](https://vip2.loli.io/2021/10/02/Nt9o2cX7gWzuMCr.png)

从上面的报文中可以看到，浏览器先发送了一个使用 `OPTIONS` 方法的「预检请求」。OPTIONS 是 HTTP/1.1 协议中定义的方法，用以从服务器获取更多信息。该方法不会对服务器资源产生影响。预检请求中同时携带了下面两个首部字段：

```http
Access-Control-Request-Method: POST
Access-Control-Request-Headers: X-PINGOTHER, Content-Type
```

- `Access-Control-Request-Method` 字段将告知服务器实际请求将要使用的方法。
- `Access-Control-Request-Headers` 字段将告知服务器实际请求将要携带的自定义请求首部字段。

服务器将据此决定是否允许实际请求，并返回相应的响应。

```http
Access-Control-Allow-Origin: http://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

- `Access-Control-Allow-Origin` 字段与简单请求时并无差异。
- `Access-Control-Allow-Methods` 字段表明服务器允许哪些方法发起请求。
- `Access-Control-Allow-Headers` 字段表明服务器允许请求头中携带的额外字段。
- `Access-Control-Allow-Credentials` 字段与简单请求时并无差异。
- `Access-Control-Max-Age` 字段表明该响应的有效时间，在有效时间内浏览器无须为同一请求再次发起预检请求。需要注意的是浏览器自身维护了一个最大有效时间，如果该字段的值超出了浏览器维护的最大有效时间则不会生效。

如果服务器「否定」了一个预检请求，也会返回一个正常的 HTTP 回应，但不包含任何与 CORS 相关的 HTTP 头信息字段。此时浏览器就会认定服务器不同意预检请求，并抛出一个错误。

一旦通过了预检请求，接下来的步骤就都和简单请求一样了，此处不过多赘述。

### 代码示例

```javascript
fetch('https://baoshuo.ren', {
  mode: 'cors',
});
```

## 附带身份凭证的 CORS 请求

上文中提到，CORS 请求默认不发送凭据信息（Cookie 和 HTTP 认证信息），如果要向服务器发送凭据，不仅需要服务器指定 HTTP 头的 `Access-Control-Allow-Credentials` 字段，还需要在请求时指明是否发送凭据信息。

### 代码示例

使用 `XmlHttpRequest` 向服务器发起 CORS 请求时，需要将 `withCredentials` 标志设置为 `true` 。

```javascript
var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://baoshuo.ren', true);
xhr.withCredentials = true;
xhr.onreadystatechange = handler; // 此处的 Handler 需要自行定义
xhr.send();
```

使用 fetch 进行请求时则需要设置 `credentials` 为 `include` 才能使浏览器向跨域源发送包含凭据的请求。

```javascript
fetch('https://baoshuo.ren', {
  credentials: 'include',
});
```

## 与 JSONP 的比较

CORS 与 JSONP 的使用目的是相同的，但是 CORS 比 JSONP 更强大。

JSONP 的缺点是只支持 GET 请求，而 CORS 则支持所有类型的 HTTP 请求。如果网站需要兼容老式浏览器或者需要向不支持 CORS 的网站请求数据仍然需要使用 JSONP 。

## 参考资料

1. [跨源资源共享（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)，MDN Web Docs，2021 年 8 月 8 日。
2. [跨域资源共享 CORS 详解](https://www.ruanyifeng.com/blog/2016/04/cors.html)，阮一峰的网络日志，2016 年 4 月 12 日。
3. [跨域资源共享](https://zh.wikipedia.org/wiki/%E8%B7%A8%E4%BE%86%E6%BA%90%E8%B3%87%E6%BA%90%E5%85%B1%E4%BA%AB)，维基百科，2021 年 5 月 3 日。
4. 3.2. CORS protocol，[Fetch Standard](https://fetch.spec.whatwg.org/#http-cors-protocol)，2021 年 9 月 30 日。
5. 参数，[WorkerOrGlobalScope.fetch()](https://developer.mozilla.org/zh-CN/docs/Web/API/fetch#%E5%8F%82%E6%95%B0)，MDN Web Docs，2021 年 9 月 1 日。
