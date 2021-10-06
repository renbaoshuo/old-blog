importScripts('https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.3/workbox/workbox-sw.js');

workbox.setConfig({
    modulePathPrefix: 'https://cdn.jsdelivr.net/npm/workbox-cdn@5.1.3/workbox/',
});

const { core, precaching, routing, strategies, expiration, cacheableResponse, backgroundSync, googleAnalytics } = workbox;
const { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } = strategies;
const { ExpirationPlugin } = expiration;
const { CacheableResponsePlugin } = cacheableResponse;

const cacheSuffixVersion = '-210926';

core.setCacheNameDetails({
    prefix: 'baoshuo-blog',
    suffix: cacheSuffixVersion,
});

core.skipWaiting();
core.clientsClaim();
precaching.cleanupOutdatedCaches();

/*
 * Precache
 */
precaching.precacheAndRoute([
    {
        url: 'https://cdn.jsdelivr.net/npm/disqusjs@1.3.0/dist/disqus.js',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/instant.page@5.1.0/instantpage.min.js',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/@nishanths/zoom.js@3.1.0/dist/zoom.min.js',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/bsi@0.0.4/favicon/64x64.png',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/bsi@0.0.4/avatar/512x512.png',
        revision: null,
    },
    {
        url: 'https://cdn.jsdelivr.net/npm/bsi@0.0.5/banner/1600x900.png',
        revision: null,
    },
]);

/*
 * Cache File From jsDelivr
 * cdn.jsdelivr.net
 *
 * Method: CacheFirst
 * cacheName: static-immutable
 * cacheTime: 30d
 */
routing.registerRoute(
    /^https?:\/\/cdn\.jsdelivr\.net/,
    new CacheFirst({
        cacheName: 'static-immutable' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit',
        },
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    })
);

/*
 * Images from SM.MS
 * i.loli.net | vip1.loli.net | vip2.loli.net | vip1.loli.io | vip2.loli.io
 *
 * Method: CacheFirst
 * cacheName: img-cache
 * cacheTime: 30d
 */
routing.registerRoute(
    /^https?:\/\/(?:i|vip1|vip2)\.loli\.(?:io|net)/,
    new CacheFirst({
        cacheName: 'img-cache' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit',
        },
        plugins: [
            new ExpirationPlugin({
                maxAgeSeconds: 30 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            }),
        ],
    })
);

/*
 * Google Analytics Async - No Cache
 *
 * Mathod: networkOnly
 */
routing.registerRoute(
    /^https?:\/\/api.baoshuo.ren\/cfga\//,
    new NetworkOnly({
        plugins: [
            new backgroundSync.BackgroundSyncPlugin('Optical_Collect', {
                maxRetentionTime: 12 * 60, // Retry for max of 12 Hours (specified in minutes)
            }),
        ],
    })
);

/*
 * Google Analytics
 */
googleAnalytics.initialize();

/*
 * Disqus API - No Cache
 * api.baoshuo.ren/disqus/
 *
 * Method: networkOnly
 */
routing.registerRoute(
    /^https?:\/\/api.baoshuo.ren\/disqus/,
    new NetworkFirst({
        cacheName: 'dsqjs-api' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit',
        },
        networkTimeoutSeconds: 3,
    })
);

/*
 * Disqus Related - No cache
 * *.disqus.com | *.disquscdn.com
 *
 * Method: NetworkOnly
 */
routing.registerRoute(/^https?:\/\/[(.*)\.]?disqus.com/, new NetworkOnly());

routing.registerRoute(/^https?:\/\/[(.*)\.]?disquscdn.com/, new NetworkOnly());

/*
 * Friends Link
 * friends.baoshuo.ren
 *
 * Method: StaleWhileRevalidate
 */
routing.registerRoute(
    /^https?:\/\/friends.baoshuo.ren(.*)(png|jpg|jpeg|svg|gif)/,
    new StaleWhileRevalidate({
        cacheName: 'img-cache' + cacheSuffixVersion,
        fetchOptions: {
            mode: 'cors',
            credentials: 'omit',
        },
    })
);

routing.registerRoute(/^https?:\/\/friends.baoshuo.ren\/links.json/, new StaleWhileRevalidate());

/*
 * Others img
 * Method: staleWhileRevalidate
 * cacheName: img-cache
 */
routing.registerRoute(
    // Cache image files
    /.*\.(?:png|jpg|jpeg|svg|gif|webp)/,
    new StaleWhileRevalidate({
        cacheName: 'img-cache' + cacheSuffixVersion,
    })
);

/*
 * Static Assets
 * Method: staleWhileRevalidate
 * cacheName: static-assets-cache
 */
routing.registerRoute(
    // Cache CSS files
    /.*\.(css|js)/,
    // Use cache but update in the background ASAP
    new StaleWhileRevalidate({
        cacheName: 'static-assets-cache' + cacheSuffixVersion,
    })
);

/*
 * sw.js - Revalidate every time
 * staleWhileRevalidate
 */
routing.registerRoute('/sw.js', new StaleWhileRevalidate());

/*
 * Default - Serve as it is
 * networkFirst
 */
routing.setDefaultHandler(
    new NetworkFirst({
        networkTimeoutSeconds: 3,
    })
);
