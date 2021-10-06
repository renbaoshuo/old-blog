/**
 * @name bsblog-inline-css
 * @author Ren Baoshuo <i@baoshuo.ren>
 * @description Inline CSS
 */

const { JSDOM, VirtualConsole } = require('jsdom');
const micromatch = require('micromatch');

const virtualConsole = new VirtualConsole();

let cache = {};

const readStream = async (stream) => {
    let data = '';
    for await (chunk of stream) {
        data += chunk.toString();
    }
    return data;
};

if (process.env.NODE_ENV !== 'development') {
    hexo.extend.filter.register(
        'after_generate',
        async () => {
            let { route, log } = hexo;
            let list = route.list();
            let htmls = list.filter((path) => micromatch.isMatch(path, '**/*.html', { nocase: true }));
            for (path of htmls) {
                log.debug('Processing:', path);
                let stream = route.get(path);
                let content = await readStream(stream);
                let dom = new JSDOM(content, { virtualConsole });
                let document = dom.window.document;
                let links = [...document.querySelectorAll('link')];
                if (links.length < 1) continue;
                links = links.filter(
                    (element) => element.rel === 'stylesheet' && element.href[0] === '/' && element.href[1] !== '/'
                );
                for (element of links) {
                    let newElement = document.createElement('style');
                    let styleContentStream = route.get(element.href);
                    log.debug('Inserting:', element.href);
                    cache[element.href] = cache[element.href] || (await readStream(styleContentStream));
                    newElement.innerHTML = cache[element.href];
                    element.parentElement.replaceChild(newElement, element);
                }
                route.set(path, dom.serialize());
            }
            log.debug('Finished:', 'bsblog-inline-css.js');
        },
        15
    );
} else {
    const { log } = hexo;
    log.info('Disabled inline css.');
}
