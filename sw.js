importScripts('https://mobbbb.top/resource/workbox-v4.3.1/workbox-sw.js')
workbox.setConfig({
    debug: false,
    modulePathPrefix: 'https://mobbbb.top/resource/workbox-v4.3.1'
})
// workbox.core.skipWaiting() <- This method is deprecated, and will be removed in Workbox v7. 
// Calling self.skipWaiting() instead.
self.skipWaiting()
// Claim any currently available clients once the service worker becomes active
workbox.core.clientsClaim()

// 一键预渲染
// This method will add entries to the precache list and add a route to respond to fetch events.
// This is a convenience method that will call precache() and addRoute() in a single call
// workbox.precaching.precacheAndRoute(self.__precacheManifest, {})

/*
const workboxChannel = new BroadcastChannel('workbox')
const backgroundSyncOptions = {
    maxRetentionTime: 24 * 60, // 1 day
    async onSync({ queue }) {
        let status = true
        try {
            return await queue.replayRequests()
        } catch (error) {
            status = false
            throw error
        } finally {
            workboxChannel.postMessage({
                type: 'BACKGROUND_SYNC',
                meta: queue.name,
                payload: {
                    status
                }
            })
        }
    }
}

// 后台同步请求——保证离线的请求可以被发送
// 一般用于向后端发送增、删、改请求
workbox.routing.registerRoute(
    new RegExp(/\.(json)$/),
    new workbox.strategies.NetworkOnly({ // 缓存优先
        plugins: [
            new workbox.backgroundSync.Plugin('getJsonData', backgroundSyncOptions)
        ]
    }),
    'GET'
)
*/

var cacheFirstOptions = {
    requestWillFetch: function(_ref2) {
        var request = _ref2.request
        request = new Request(request.url)
        return request
    },
    cachedResponseWillBeUsed: function(e) {
        if (e.cachedResponse && e.cachedResponse.type === 'opaque') {
            caches.delete(e.cacheName)
            return null
        }
        return e.cachedResponse
    }
}

var chunksCacheName = 'chunks'
function urlHashFilter(url) {
    var requestUrl = new URL(url);
    var name = requestUrl.pathname.split('.');
    if (name.length > 2) {
        var hash = name.splice(-2, 1)[0];
        return [requestUrl.origin + name.join('.'), hash]
    }
    return [requestUrl.origin + name.join('.'), '']
}
function traverseCaches(callbackfunc) {
    caches.keys().then(function(cacheNames) {
        cacheNames.filter(function(cacheName) {
            return cacheName === chunksCacheName
        }).map(function(cacheName) {
            return caches.open(cacheName).then(function(cache) {
                cache.keys().then(function(cachedRequests) {
                    cachedRequests.map(function(cachedRequest) {
                        callbackfunc(cachedRequest, cache)
                    })
                })
            })
        })
    })
}
function handlerUpdateChunks(_ref) {
    var event = _ref.event
    var request = event.request
    return caches.match(request).then(function(cachedRespond) {
        if (!cachedRespond) {
            traverseCaches(function(cachedRequest, cache) {
                var cacheReqUrlHash = urlHashFilter(cachedRequest.url);
                var resUrlHash = urlHashFilter(request.url);
                if (resUrlHash[0] === cacheReqUrlHash[0] && resUrlHash[1] !== cacheReqUrlHash[1]) {
                    cache.delete(cachedRequest) // 删除旧缓存
                }
            })
        }
        return workbox.strategies.cacheFirst({
            cacheName: chunksCacheName,
            plugins: [
                new workbox.cacheableResponse.Plugin({
                    statuses: [0, 200]
                }),
                cacheFirstOptions,
            ]
        }).handle({
            event: event
        }).catch(function(e) {
            console.error(e)
        })
    })
}

function handlerUpdateAPI(_ref3) {
    var event = _ref3.event
    if (event.request.headers.get('accept').indexOf('application/json') > -1) {
        return workbox.strategies.networkFirst({
            cacheName: 'api',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 20,
                    maxAgeSeconds: 24 * 60 * 60,
                }),
            ]
        }).handle({
            event: event
        }).catch(function(e) {
            console.error(e)
        })
    } else if (event.request.headers.get('accept').indexOf('text/html') > -1) {
        return workbox.strategies.staleWhileRevalidate({ // 先缓存后网络
            cacheName: 'page',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 20,
                    maxAgeSeconds: 24 * 60 * 60,
                }),
            ]
        }).handle({
            event: event
        }).catch(function() {
            caches.match(location.origin)
        })
    }
    return workbox.strategies.networkOnly({
        plugins: [{
            requestWillFetch: function(_ref4) {
                var request = _ref4.request
                request = new Request(request, {
                    mode: 'same-origin'
                })
                return request
            }
        }]
    }).handle({
        event: event
    }).catch(function(e) {
        console.error(e)
    })
}

// chunks资源缓存——cacheFirst
workbox.routing.registerRoute(
    new RegExp(/^https?:\/\/mobbbb\.top(.*)\.(js|css)$/), 
    handlerUpdateChunks
)

// 图片缓存策略
workbox.routing.registerRoute(
    new RegExp(eval('/^https?:\\/\\/' + location.host + '(.*).(png|gif|jpg|jpeg|webp)$/')), 
    workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 365 * 24 * 60 * 60,
                maxEntries: 300 // 缓存条数(FIFO)
            }),
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200] // 可被缓存的状态码
            }), 
            cacheFirstOptions,
        ]
    })
)

// cdn静态资源缓存策略
workbox.routing.registerRoute(
    new RegExp(/^https?:\/\/unpkg\.com\/(.*)\.(js|css|woff)$/),
    workbox.strategies.cacheFirst({
        cacheName: 'statics',
        plugins: [
            new workbox.expiration.Plugin({
                maxAgeSeconds: 365 * 24 * 60 * 60
            }), 
            new workbox.cacheableResponse.Plugin({
                statuses: [0, 200]
            }),
            cacheFirstOptions,
        ]
    })
)

// 兜底缓存策略
// 数据接口——networkFirst
// doc文件——staleWhileRevalidate
// 其他——networkOnly
workbox.routing.registerRoute(
    new RegExp(eval('/^https?:\\/\\/' + location.host + '.*/')), 
    handlerUpdateAPI
)

self.addEventListener('error', function(event) {
    console.error('error')
    console.dir(event)
})
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
    console.error(event.data)
})
