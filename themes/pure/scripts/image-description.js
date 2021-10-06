hexo.extend.filter.register('after_post_render', (data) => {
    let className = 'image-description';
    if (data.layout == 'post' || data.layout == 'page') {
        data.content = data.content.replace(
            /(<img [^>]*(?:alt|title)="([^"]+)"[^>]*>)/g,
            '$1' + '<span class="' + className + '">$2</span>'
        );
    }
    return data;
});
