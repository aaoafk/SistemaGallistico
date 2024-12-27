// app/javascript/custom/companion.js

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
    .then(serviceWorkerReady)
    .then(registerPeriodicBackgroundSync)
    .then(logCompanionStatus('Service worker registered!'))
}

// These are hoisted up due to function hoisting
function serviceWorkerReady () {
  if (navigator.ServiceWorker) {
    return navigator.ServiceWorker.ready
  }
}

function registerPeriodicBackgroundSync (registration) {
  if (registration) {
    if ('SyncManager' in window) {
			registration.periodicSync.register('sync-forms', {
				minInterval: 5 * 60 * 1000, // 5 minutes
			});
    } else {
      window.alert('This browser does not support background sync.')
    }
  }
}

function logCompanionStatus (msg) {
  console.log(`[Companion] :: ${msg}`)
}
