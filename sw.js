/*
 * For more information about this script, please visit: https://blog.baoshuo.ren/post/workbox-service-worker/
 */

importScripts('https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.3/workbox/workbox-sw.js');

workbox.setConfig({
    modulePathPrefix: 'https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.3/workbox/'
});


console.log('Successful registered service worker.');


let cacheSuffixVersion = '-210227';
const maxEntries = 100;

workbox.core.setCacheNameDetails({
    prefix: 'baoshuo-blog',
    suffix: cacheSuffixVersion
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();
workbox.precaching.cleanupOutdatedCaches();

/*
 * Precache
 */
workbox.precaching.precacheAndRoute(
    [
        { url: 'https://cdn.jsdelivr.net/npm/disqusjs@1.3.0/dist/disqus.js', revision: null },
        { url: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css', revision: null },
        { url: 'https://cdn.jsdelivr.net/npm/cfga@1.0.3/cfga.min.js', revision: null },
        { url: 'https://cdn.jsdelivr.net/npm/instant.page@5.1.0/instantpage.min.js', revision: null },
        { url: 'https://cdn.jsdelivr.net/npm/@nishanths/zoom.js@3.1.0/dist/zoom.min.js', revision: null }
    ],
);

/*
 * Cache File From jsDelivr
 *
 * cdn.jsdelivr.net
 *
 * Method: CacheFirst
 * cacheName: static-immutable
 * cacheTime: 30d
 */

workbox.routing.registerRoute(
    new RegExp('^https://cdn\\.jsdelivr\\.net'),
    new workbox.strategies.CacheFirst({
        cacheName: 'static-immutable' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit'
        },
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true
            })
        ]
    })
);

/*
 * Google Analytics Async
 *
 * api.baoshuo.ren
 *
 * Method: NetworkOnly
 */
workbox.routing.registerRoute(
    new RegExp('^https://api\\.baoshuo\\.ren/cfga/(.*)'),
    new workbox.strategies.NetworkOnly({
        plugins: [
            new workbox.backgroundSync.BackgroundSyncPlugin('Optical_Collect', {
                maxRetentionTime: 12 * 60 // Retry for max of 12 Hours (specified in minutes)
            }),
        ]
    })
);


/*
 * Disqus API
 *
 * api.baoshuo.ren
 *
 * Method: NetworkFirst
 */
workbox.routing.registerRoute(
    new RegExp('^https://api\\.baoshuo\\.ren/disqus/(.*)'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'dsqjs-api' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit'
        },
        networkTimeoutSeconds: 3
    })
);

/*
 * Disqus Related - No cache
 *
 * disqus.com
 * *.disquscdn.com
 *
 * Method: NetworkOnly, CacheFirst
 */
workbox.routing.registerRoute(
    new RegExp('^https://(.*)disqus\\.com'),
    new workbox.strategies.NetworkOnly()
);

workbox.routing.registerRoute(
    new RegExp('^https://(.*)disquscdn\\.com(.*)'),
    new workbox.strategies.CacheFirst({
        cacheName: 'disqus-cdn-cache' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit'
        },
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxAgeSeconds: 10 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ]
    })
);

/*
 * Friends Link
 *
 * friends.baoshuo.ren
 *
 * Method: StaleWhileRevalidate
 */
workbox.routing.registerRoute(
    new RegExp('^https://friends\\.baoshuo\\.ren(.*)(png|jpg|jpeg|svg|gif)'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'img-cache' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit'
        }
    })
);

workbox.routing.registerRoute(
    new RegExp('https://friends\\.baoshuo\\.ren/links.json'),
    new workbox.strategies.StaleWhileRevalidate()
);

/*
 * Others img
 *
 * i.loli.net
 * vip1.loli.net
 * vip2.loli.net
 * vip1.loli.io
 * vip2.loli.io
 *
 * Method: CacheFirst
 * cacheName: img-cache
 * cacheTime: 360d
 */
workbox.routing.registerRoute(
    new RegExp('^https://(?:i|vip[0-9])\\.loli\\.(?:io|net)'),
    new workbox.strategies.CacheFirst({
        cacheName: 'img-cache' + cacheSuffixVersion,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries,
                maxAgeSeconds: 12 * 30 * 24 * 60 * 60,
            }),
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit'
        }
    })
);

/*
 * Google Fonts
 *
 * Method: CacheFirst
 * cacheName: font-cache
 */
workbox.routing.registerRoute(
    new RegExp('^https://(?:fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)'),
    new workbox.strategies.CacheFirst({
        // cache storage 名称和版本号
        cacheName: 'font-cache' + cacheSuffixVersion,
        plugins: [
            // 使用 expiration 插件实现缓存条目数目和时间控制
            new workbox.expiration.ExpirationPlugin({
                // 最大保存项目
                maxEntries,
                // 缓存 30 天
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
            // 使用 cacheableResponse 插件缓存状态码为 0 的请求
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ]
    })
);

/*
 * Other Images
 *
 * Method: StaleWhileRevalidate
 */
workbox.routing.registerRoute(
    // Cache image files
    new RegExp('.*\.(?:png|jpg|jpeg|svg|gif|webp)'),
    new workbox.strategies.StaleWhileRevalidate()
);


/*
 * Static Assets
 *
 * Method: StaleWhileRevalidate
 * cacheName: static-assets-cache
 */
workbox.routing.registerRoute(
    // Cache CSS files
    new RegExp('.*\.(css|js)'),
    // Use cache but update in the background ASAP
    new workbox.strategies.StaleWhileRevalidate()
);

/*
 * sw.js - Revalidate every time
 *
 * Method: StaleWhileRevalidate
 */
workbox.routing.registerRoute(
    '/sw.js',
    new workbox.strategies.StaleWhileRevalidate()
);

/*
 * Default - Serve as it is
 *
 * Method: NetworkFirst
 */
workbox.routing.setDefaultHandler(
    new workbox.strategies.NetworkFirst({
        networkTimeoutSeconds: 3
    })
);
