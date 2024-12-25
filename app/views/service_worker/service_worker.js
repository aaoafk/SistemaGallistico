// Load workbox runtime without a build step
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
)

import { openDB } from "idb"

/// ////////////////////////////////////////////////////////////////////////////
//                             Routing & Caching                              //
/// ////////////////////////////////////////////////////////////////////////////

// CacheFirst is good for critical resources, i.e. always try network first

const { CacheFirst } = workbox.strategies
const { registerRoute } = workbox.routing

registerRoute(criticalResourcePagesMatchCB, new CacheFirst({ cacheName: 'critical-resource-pages' }))

function criticalResourcePagesMatchCB ({ url }) {
  return url.pathname.startsWith('/gallos') || url.pathname.startsWith('/practicas')
}

// StaleWhileRevalidate is good for when having the most up to date resource is not
// super important... I don't really expect to have to update these styles a bunch
// so lets just use that

const { StaleWhileRevalidate } = workbox.strategies

registerRoute(new RegExp('/styles/.*\\.css'), new StaleWhileRevalidate({ cacheName: 'styles-css' }))
registerRoute(new RegExp('/assets/.*\\.js'), new StaleWhileRevalidate({ cacheName: 'assets-js' }))
registerRoute(new RegExp('/assets/.*\\.css'), new StaleWhileRevalidate({ cacheName: 'assets-css' }))
registerRoute(new RegExp('/assets/.*\\.woff2'), new StaleWhileRevalidate({ cacheName: 'assets-fonts' }))
registerRoute(new RegExp('/assets/.*\\.ico'), new StaleWhileRevalidate({ cacheName: 'assets-ico' }))

/// ////////////////////////////////////////////////////////////////////////////
//                              Offline Fallback                              //
/// ////////////////////////////////////////////////////////////////////////////

const { warmStrategyCache } = workbox.recipes
const { setCatchHandler } = workbox.routing
const strategy = new CacheFirst()
const urls = ['/offline.html']
// Warm the runtime cache with a list of asset URLs
warmStrategyCache({ urls, strategy })
// Trigger a 'catch' handler when any of the other routes fail to generate a response
setCatchHandler(async ({ event }) => {
  switch (event.request.destination) {
    case 'document':
      return strategy.handle({ event, request: urls[0] })
    default:
      return Response.error()
  }
})

/// ////////////////////////////////////////////////////////////////////////////
//                        ServiceWorker Initialization                        //
/// ////////////////////////////////////////////////////////////////////////////

function onInstall (event) {
  logServiceWorkerStatus('Installing!')
}

function onActivate (event) {
  logServiceWorkerStatus('Activating!')
}

function onFetch (event) {
  const { request } = event
  logServiceWorkerStatus(`Current request: ${request}`)
  logServiceWorkerStatus(`Fetching url: ${request.url}. Using cache: ${request.cache}`)
}

function logServiceWorkerStatus (msg) {
  console.log(`[ServiceWorker] :: ${msg}`)
}

function syncOfflineFormData() {
	// Get all records persisted into indexedDB
	const db = await openDB('sg-app-db')
	if (db) {
		const persistedOfflineForms = await db.getAllFromIndex('persisted-offline-form-data', 'submittedAt')
		if (persistedOfflineForms) {
			// Post each of these to server
			persistedOfflineForms.forEach(prettyPrintRecord(el))
			const prettyPrintRecord = (d) => {
				for(const [k,v] of Object.entries(d)) { console.log(`${k}: ${v}:`)}
			}
		} else {
			console.error('persistedOfflineForms does not contain a value')
		}
	} else {
		console.error('Failed to openDB()')
	}
}

function onSync(event) {
  // Implement
	if (event.tag === 'sync-forms') {
		event.waitUntil(syncOfflineFormData())
	}
}
self.addEventListener('install', onInstall)
self.addEventListener('activate', onActivate)
self.addEventListener('fetch', onFetch)
self.addEventListener('sync', onSync)
