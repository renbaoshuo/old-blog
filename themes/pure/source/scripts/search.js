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
        '<p>搜索多个关键词时请用空格分隔,如「<a href="/search/?s=网页+深色模式">网页 深色模式</a>」、「<a href="/search/?s=CTF+Write+Up">CTF Write Up</a>」、「<a href="/search/?s=题解">题解</a>」</p>',
    ].join('');
    const noResultMsg = [
        `<p>找不到和「${searchKeyWord}」相符的文章。`,
        `<small>（耗时 <span id="search-used-time">null</span> 毫秒）</small>`,
        `</p>`,
        `<p>请检查关键字是否有误，或尝试搜索其它关键字。你也可以前往 `,
        `<a href="https://www.google.com/search?q=site%3Ablog.baoshuo.ren%20${encodeURIComponent(searchKeyWord)}">Google</a>`,
        ` 或 <a href="https://www.bing.com/search?q=site%3Ablog.baoshuo.ren%20${encodeURIComponent(searchKeyWord)}">Bing</a>`,
        ` 搜索「<a href="https://www.google.com/search?q=site%3Ablog.baoshuo.ren%20${encodeURIComponent(
            searchKeyWord
        )}">${searchKeyWord}</a>」。`,
        `</p>`,
    ].join('');
    const errorMsg = [
        '<p style="text-align: center;">',
        '获取文章数据出错，请尝试 <a href="javascript:location.reload();"><b>重新加载</b></a> 。',
        '</p>',
    ].join('');

    if (searchKeyWord === null || searchKeyWord.trim() === '') {
        result.innerHTML = noKeyWordMsg;
    } else {
        input.value = searchKeyWord;
        fetch('/search.json')
            .then((response) => response.json())
            .then((searchData) => {
                let searchResult = new Fuse(searchData, {
                    includeMatches: true,
                    findAllMatches: true,
                    threshold: 0.45,
                    keys: ['title', 'content', 'tags', 'categories'],
                }).search(searchKeyWord);
                let searchResultHTML = ['<div id="search-result-info" class="search-result-info"></div>'];
                console.log('Search result:', searchResult);
                searchResult.forEach((data) => {
                    searchResultHTML.push(
                        [
                            '<div class="divider"></div>',
                            '<a href="' + data.item.url.substring(1, data.item.url.length) + '" class="search-result-link">',
                            '<div class="search-result-item">',
                            '<div class="search-result-item-title">',
                        ].join('')
                    );
                    let titleFlag = false;
                    let contentFlag = false;
                    let titleResultHTML = [];
                    let contentResultHTML = [];
                    data.matches.forEach((match) => {
                        if (match.key === 'title') {
                            titleFlag = true;
                            let titleLastMatch = 0;
                            match.indices.forEach((indice) => {
                                titleResultHTML.push(
                                    [
                                        data.item.title.substring(titleLastMatch, indice[0]),
                                        '<mark>',
                                        data.item.title.substring(indice[0], indice[1] + 1),
                                        '</mark>',
                                    ].join('')
                                );
                                titleLastMatch = indice[1] + 1;
                            });
                            titleResultHTML.push(data.item.title.substring(titleLastMatch));
                        } else if (match.key == 'content') {
                            contentFlag = true;
                            let contentStart = match.indices[0][0] - 30;
                            let contentEnd = match.indices[0][1] + 130;
                            let contentLastMatch = contentStart;
                            match.indices.forEach((indice) => {
                                if (indice[0] >= contentStart && indice[1] <= contentEnd) {
                                    contentResultHTML.push(
                                        [
                                            data.item.content.substring(contentLastMatch, indice[0]),
                                            '<mark>',
                                            data.item.content.substring(indice[0], indice[1] + 1),
                                            '</mark>',
                                        ].join('')
                                    );
                                    contentLastMatch = indice[1] + 1;
                                }
                            });
                            contentResultHTML.push(data.item.content.substring(contentLastMatch, contentEnd + 1));
                        }
                    });
                    if (titleFlag) {
                        searchResultHTML.push(titleResultHTML.join(''));
                    } else {
                        searchResultHTML.push(data.item.title);
                    }
                    searchResultHTML.push(['</div>', '<div class="search-result-item-description">'].join(''));
                    if (contentFlag) {
                        searchResultHTML.push(contentResultHTML.join(''));
                    } else {
                        searchResultHTML.push(data.item.content.substring(0, 130));
                    }
                    searchResultHTML.push(['</div>', '</div>', '</a>'].join(''));
                });
                const endTime = new Date().getTime();
                if (!searchResult.length) {
                    result.innerHTML = noResultMsg;
                    document.getElementById('search-used-time').innerHTML = endTime - startTime;
                } else {
                    result.innerHTML = searchResultHTML.join('');
                    document.getElementById('search-result-info').innerHTML = `<b>搜索结果</b><small>（耗时 ${
                        endTime - startTime
                    } 毫秒）</small>`;
                }
            })
            .catch((error) => {
                console.error(error);
                result.innerHTML = errorMsg;
            });
    }
};

initSearch(document.getElementById('search-input'), document.getElementById('search-result'));
