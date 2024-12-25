// Load workbox runtime without a build step
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js',
	'https://cdn.jsdelivr.net/npm/idb@8.0.1/build/umd.min.js'
)

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

// Define pretty print function outside of the main function
function prettyPrintRecord(d) {
  for (const [k, v] of Object.entries(d)) {
    console.log(`${k}: ${v}`);
  }
}

async function syncOfflineFormData() {
  try {
    // Open the database
    const db = await idb.openDB('sg-app-db');
    
    // Retrieve persisted offline forms
    const persistedOfflineForms = await db.getAllFromIndex(
      'persisted-offline-form-data', 
      'submittedAt'
    );

    // Check if there are any offline forms to sync
    if (persistedOfflineForms && persistedOfflineForms.length > 0) {
      // Transform form data to match Rails expectations
      const submissions = persistedOfflineForms.map(async (formData) => {
        try {
          // Create a new object in the Rails-expected format
          const railsFormData = {
            authenticity_token: formData.authenticity_token,
            gallo: {
              banda_de_ala: formData['gallo[banda_de_ala]'] || formData.banda_de_ala,
              weight_pounds: formData['gallo[weight_pounds]'] || formData.weight_pounds,
              weight_ounces: formData['gallo[weight_ounces]'] || formData.weight_ounces,
              genero: formData['gallo[genero]'] || formData.genero,
              apodo: formData['gallo[apodo]'] || formData.apodo
            }
          };

          // Submission with appropriate headers
          const response = await fetch('/gallos', {
            method: 'POST',
            body: JSON.stringify(railsFormData),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            // Parse error response for more detailed information
            const errorBody = await response.text();
            throw new Error(`Submission failed: ${errorBody}`);
          }

          // If successful, remove the record from IndexedDB
          await db.delete('persisted-offline-form-data', formData.id);
        } catch (submissionError) {
          console.error('Failed to submit offline form:', submissionError);
          // Optionally, mark the record for later retry
        }
      });

      // Wait for all submissions to complete
      await Promise.all(submissions);

    } else {
      console.log('No offline forms to synchronize');
    }
  } catch (error) {
    console.error('Error during offline form synchronization:', error);
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
