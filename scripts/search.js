/**
 * @name Search.JS
 * @author Ren Baoshuo <i@baoshuo.ren>
 * @description Search Script for Baoshuo's Blog
 */

 /**
  * Init Search Page
  * @param {HTMLElement} input Search Input Element
  * @param {HTMLElement} result Result Element
  */
 const initSearch = (input, result) => {
    const startTime = new Date().getTime();
    const { searchParams } = new URL(location.href);
    const searchKeyWord = searchParams.get('s');
    const noKeyWordMsg = [
        '<p>这是宝硕博客的站内搜索引擎。</p>',
        '<p>搜索多个关键词时请用空格分隔,如「<a href="https://blog.baoshuo.ren/search/?s=网页+深色模式">网页 深色模式</a>」、「<a href="https://blog.baoshuo.ren/search/?s=CTF+Write+Up">CTF Write Up</a>」</p>',
    ].join('');
    const noResultMsg = [
        `<p>找不到和「${searchKeyWord}」相符的文章。`,
        `<small>（耗时 <span id="search-used-time">null</span> 毫秒）</small>`,
        `</p>`,
        `<p>请检查关键字是否有误，或尝试搜索其它关键字。你也可以前往 `,
        `<a href="https://www.google.com/search?q=site%3Ablog.baoshuo.ren%20${encodeURIComponent(searchKeyWord)}">Google</a>`,
        ` 或 <a href="https://www.bing.com/search?q=site%3Ablog.baoshuo.ren%20${encodeURIComponent(searchKeyWord)}">Bing</a>`,
        ` 搜索「${searchKeyWord}」。`,
        `</p>`
    ].join('');
    const errorMsg = [
        '<p style="text-align: center;">获取文章数据出错，请尝试 <a href="javascript:locaton.reload();">重新加载</a> 。</p>'
    ].join('');

    if (searchKeyWord === null || searchKeyWord.trim() === '') {
        result.innerHTML = noKeyWordMsg;
    } else {
        input.value = searchKeyWord;
        fetch('/search.json')
            .then(response => response.json())
            .then(searchData => {
                let searchResult = new Fuse(searchData, { includeMatches: true, threshold: 0.4, keys: ['title', 'content'] }).search(searchKeyWord);
                let searchResultHTML = ['<div id="search-result-info" class="search-result-info"></div>'];
                console.log('Search result:', searchResult);
                searchResult.forEach((data) => {
                    ((match) => {
                        data.item.content = data.item.content.trim();
                        searchResultHTML.push([
                            '<div class="divider"></div>',
                            '<a href="' + data.item.url.substring(1, data.item.url.length) + '" class="search-result-link">',
                            '<div class="search-result-item">',
                            '<div class="search-result-item-title">',
                            (match.key === 'title'
                                ? [
                                    data.item.title.substring(0, match.indices[0][0]),
                                    '<mark>',
                                    data.item.title.substring(match.indices[0][0], match.indices[0][1] + 1),
                                    '</mark>',
                                    data.item.title.substring(match.indices[0][1] + 1, data.item.title.length),
                                ].join('')
                                : data.item.title
                            ),
                            '</div>',
                            '<div class="search-result-item-description">',
                            (match.key === 'content'
                                ? [
                                    data.item.content.substring(match.indices[0][0] - 30, match.indices[0][0]),
                                    '<mark>',
                                    data.item.content.substring(match.indices[0][0], match.indices[0][1] + 1),
                                    '</mark>',
                                    data.item.content.substring(match.indices[0][1] + 1, match.indices[0][1] + 130)
                                ].join('')
                                : data.item.content.substring(0, 80)
                            ),
                            '</div>',
                            '</div>',
                            '</a>',
                        ].join(''));
                    })(data.matches[0]);
                });
                const endTime = new Date().getTime();
                if (!searchResult.length) {
                    result.innerHTML = noResultMsg;
                    document.getElementById('search-used-time').innerHTML = endTime - startTime;
                } else {
                    result.innerHTML = searchResultHTML.join('\n');
                    document.getElementById('search-result-info').innerHTML = `<b>搜索结果</b><small>（耗时 ${endTime - startTime} 毫秒）</small>`;
                }
            })
            .catch((error) => {
                console.error(error);
                result.innerHTML = errorMsg;
            });
    }
};

initSearch(document.getElementById('search-input'), document.getElementById('search-result'));
