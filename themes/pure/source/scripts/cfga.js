/**
 * @name CloudflareGoogleAnalytics.JS
 * @author Ren Baoshuo <i@baoshuo.ren>
 */

(function (window, document, navigator) {
    const screen = window.screen;
    const encode = encodeURIComponent;
    const max = Math.max;
    // var min = Math.min;
    const performance = window.performance;
    const useNewPerformanceAPI = 'getEntriesByType' in performance && 'getEntriesByName' in performance;
    const filterNumber = (num) => {
        return isNaN(num) || num == Infinity || num < 0 ? void 0 : num;
    };
    const randomStr = (num) => {
        return Math.random().toString(36).slice(-num);
    };
    const randomNum = (num) => {
        return Math.ceil(Math.random() * (num - 1)) + 1;
    };
    const getEntriesByName = (name) => {
        return performance.getEntriesByName(name);
    };
    const getEntriesByType = (name) => {
        return performance.getEntriesByType(name);
    };
    const fallback = (id) => {
        // Original Google Analytics `analytics.js` Code
        (function (window, document, tag, src, name) {
            window['GoogleAnalyticsObject'] = name;
            window[name] =
                window[name] ||
                function () {
                    (window[name].q = window[name].q || []).push(arguments);
                };
            window[name].l = 1 * new Date();
            var element = document.createElement(tag);
            first_element = document.getElementsByTagName(tag)[0];
            element.async = true;
            element.src = src;
            first_element.parentNode.insertBefore(element, first_element);
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
        ga('create', id, 'auto');
        ga('send', 'pageview');
    };

    const t = useNewPerformanceAPI ? getEntriesByType('navigation')[0] : performance.timing;
    const startTime = useNewPerformanceAPI ? t.startTime : t.navigationStart;

    // sendGA: collect data and send.
    function sendGA() {
        var pv_data = [
            // Random String against Easy Privacy
            randomStr(randomNum(4)) + '=' + randomStr(randomNum(6)),
            // GA tid
            'ga=' + window.ga_tid,
            // Title
            'dt=' + encode(document.title),
            // Document Encoding
            'de=' + encode(document.characterSet || document.charset),
            // Referrer
            'dr=' + encode(document.referrer),
            // Language
            'ul=' + (navigator.language || navigator.browserLanguage || navigator.userLanguage),
            // Color Depth
            'sd=' + screen.colorDepth + '-bit',
            // Screen Size
            'sr=' + screen.width + 'x' + screen.height,
            // Display
            'vp=' +
                max(document.documentElement.clientWidth, window.innerWidth || 0) +
                'x' +
                max(document.documentElement.clientHeight, window.innerHeight || 0),
            // plt: Page Loading Time
            // open the page => window.onload
            // (window.onload)
            'plt=' + filterNumber(t.loadEventStart - startTime || 0),
            // dns: DNS Time
            'dns=' + filterNumber(t.domainLookupEnd - t.domainLookupStart || 0),
            // pdt: Page Dowenload Time
            // start download time => finish download time
            'pdt=' + filterNumber(t.responseEnd - t.responseStart || 0),
            // rrt: Redirect Time
            'rrt=' + filterNumber(t.redirectEnd - t.redirectStart || 0),
            // tcp: TCP Time
            'tcp=' + filterNumber(t.connectEnd - t.connectStart || 0),
            // srt: Server Response Time
            // start request => server send first byte
            // (TTFB - TCP - DNS)
            'srt=' + filterNumber(t.responseStart - t.requestStart || 0),
            // dit: DOM Interactive Time
            'dit=' + filterNumber(t.domInteractive - t.domLoading || 0),
            // clt: Content Loading Time
            // open the page => DOMContentLoaded
            'clt=' + filterNumber(t.domContentLoadedEventStart - startTime || 0),
            'z=' + Date.now(),
        ];

        if (useNewPerformanceAPI) {
            // fp: First Paint Time
            pv_data.push('fp=' + filterNumber(getEntriesByName('first-paint')[0].startTime || 0));
            // fpc: First Contentful Paint Time
            pv_data.push('fcp=' + filterNumber(getEntriesByName('first-contentful-paint')[0].startTime || 0));
        }

        if (/(?:localhost|127\.0\.0\.1)/.test(location.hostname)) {
            console.log('Disabled Google Analytics because in preview mode');
        } else {
            fetch(`${window.ga_api}?${pv_data.join('&')}`, {
                mode: 'no-cors',
                credentials: 'include',
            }).catch((error) => {
                // Use original google analytics code if catched an error
                fallback(window.ga_tid);
                console.error("Failed to Connect Baoshuo's Google Analytics API:\n", error);
            });
        }
    }

    window.cfga = sendGA;

    if (document.readyState === 'complete') {
        sendGA();
    } else {
        window.addEventListener('load', sendGA);
    }
})(window, document, navigator);
