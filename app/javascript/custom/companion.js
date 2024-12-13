// app/javascript/custom/companion.js
// This is easier to understand
if (navigator.serviceWorker) {
		navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
				.then(serviceWorkerReady)
				.then(registerBackgroundSync)
				.then(logCompanionStatus("Service worker registered!"))
}

// These are hoisted up due to function hoisting
function serviceWorkerReady() {
		if (navigator.ServiceWorker) {
				return navigator.ServiceWorker.ready
		}
}

function registerBackgroundSync(registration) {
		if (registration) {
				if ("SyncManager" in window) {
						registration.sync.register("sync-forms");
				} else {
						window.alert("This browser does not support background sync.")
				}
		}
}

function logCompanionStatus(msg) {
    console.log(`[Companion] :: ${msg}`)
}
