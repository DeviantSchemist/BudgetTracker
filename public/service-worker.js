const urls = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('transaction-cache-v1')
      .then(cache => cache.addAll(urls)))
})

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open('transactation-data-cache-v1').then(cache => {
        return fetch(event.request)
          .then(res => {
            console.log('Not failing')
            if (res.status === 200) {
              cache.put(event.request.url, res.clone())
            }

            return res
          })
          .catch(err => {
            console.log('Failing')
            console.log(err)
            return cache.match(event.request)
          })
      })
        .catch(err => console.log(err))
    )
    return
  }

  event.respondWith(
    fetch(event.request)
      .catch(err => {
        console.log(err)
        return caches.match(event.request).then(match => {
          if (match) {
            return match
          } else if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/')
          }
        })
      })
  )
})
