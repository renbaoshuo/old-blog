hexo.extend.filter.register('after_generate', () => {
    const site = hexo.locals.toObject();
    let htmlContent = `<html>`;
    htmlContent +=
        `<head>` +
        `<meta charset="UTF-8">` +
        `<title>HTML SiteMap - Baoshuo's Blog</title>` +
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@4.0.0/github-markdown.min.css">` +
        `</head>`;
    htmlContent +=
        `<body class="markdown-body" style="margin:0 auto; max-width:1000px; padding:32px 16px;">` +
        `<h1>HTML SiteMap</h1>`;
    htmlContent += `<h2>Posts</h2>` + `<p>Total: ${site.posts.length}</p>`;
    htmlContent += `<ul>`;
    site.posts.data.forEach((post) => {
        htmlContent += `<li><a href="${post.permalink}">${post.title}</a> (published at ${post.date}, updated at ${post.updated})</li>`;
    });
    htmlContent += `</ul>`;
    htmlContent += `<h2>Tags</h2>` + `<p>Total: ${site.tags.length}</p>`;
    htmlContent += `<ul>`;
    site.tags.data.forEach((tag) => {
        htmlContent += `<li><a href="${tag.permalink}">${tag.name}</a></li>`;
    });
    htmlContent += `</ul>`;
    htmlContent += `<h2>Categories</h2>` + `<p>Total: ${site.categories.length}</p>`;
    htmlContent += `<ul>`;
    site.categories.data.forEach((category) => {
        htmlContent += `<li><a href="${category.permalink}">${category.name}</a></li>`;
    });
    htmlContent += `</ul>`;
    htmlContent +=
        `<hr>` +
        `<p><small>&copy; 2019-2021 <a href="https://baoshuo.ren/?utm_source=404">Baoshuo</a>, All rights reserved.</small></p>`;
    htmlContent += `</body>`;
    htmlContent += `</html>`;
    hexo.route.set(hexo.route.format('/sitemap.html'), htmlContent);
});
