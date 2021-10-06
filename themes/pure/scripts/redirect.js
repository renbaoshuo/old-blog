const full_url_for = require('hexo-util').full_url_for.bind(hexo);

hexo.extend.filter.register('after_generate', () => {
    const { config, route, theme } = hexo;
    const redirectTemplate = theme.getView('redirect.ejs');
    config.redirects.forEach((redirect) => {
        route.set(route.format(redirect.from), redirectTemplate.renderSync({ to: full_url_for(redirect.to) }));
    });
});
