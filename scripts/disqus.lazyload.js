function callback() {
    window.disqus_config = function () {
        this.page.url = disqus_page_url;
        this.page.identifier = disqus_page_identifier;
    }
    new DisqusJS(disqus_options);
}

function addStyle(url) {
    let d = document.createElement('link');
    d.rel = 'stylesheet';
    d.href = url;
    document.head.appendChild(d);
}

function addScript(url) {
    let d = document.createElement('script');
    d.src = url;
    d.async = false;
    document.body.appendChild(d);
    d.onload = () => {
        callback();
    }
}

function loadDisqus() {
    addScript('https://cdn.jsdelivr.net/npm/disqusjs/dist/disqus.js');
    addStyle('https://cdn.jsdelivr.net/npm/disqusjs/dist/disqusjs.css');
}

var runningOnBrowser = typeof window !== "undefined";
var isBot = runningOnBrowser && !("onscroll" in window) || typeof navigator !== "undefined" && /(gle|ing|ro|msn)bot|crawl|spider|yand|duckgo/i.test(navigator.userAgent);
var supportsIntersectionObserver = runningOnBrowser && "IntersectionObserver" in window;

setTimeout(function () {
    if (!isBot && supportsIntersectionObserver) {
        var disqus_observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                loadDisqus();
                disqus_observer.disconnect();
            }
        });
        disqus_observer.observe(document.getElementById('disqus_thread'));
    } else {
        loadDisqus();
    }
}, 0);