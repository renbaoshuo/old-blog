hexo.extend.filter.register('after_post_render', (data) => {
    if (data.layout == 'post' || data.layout == 'page') {
        data.content = data.content.replace(/<img ([^>]*)>/g, '<img $1 data-action="zoom">');
    }
    return data;
});
