export const offlineBehavior = controller => {
  Object.assign(controller, {
    async checkNetworkStatus () {
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
      const networkStatusKey = 'networkStatusCache'

      // Check existing localStorage entry
      const cachedStatus = localStorage.getItem(networkStatusKey)
      const cachedTimestamp = localStorage.getItem(`${networkStatusKey}Timestamp`)

      // If cached status exists and is recent, return it
      if (cachedStatus && cachedTimestamp) {
        const timeSinceLastCheck = Date.now() - Date.parse(cachedTimestamp)
        if (timeSinceLastCheck < CACHE_DURATION) {
          return JSON.parse(cachedStatus)
        }
      }

      // Perform network check
      try {
        const online = await fetch('/assets/misc/1x1.png', {
          signal: AbortSignal.timeout(5000)
        })

        const isOnline = online.status >= 200 && online.status < 300

        // Cache the result with a timestamp
        localStorage.setItem(networkStatusKey, JSON.stringify(isOnline))
        localStorage.setItem(`${networkStatusKey}Timestamp`, Date.now().toString())

        return isOnline
      } catch (err) {
        // If network check fails, default to offline
        const isOnline = false

        // Cache the offline status
        localStorage.setItem(networkStatusKey, JSON.stringify(isOnline))
        localStorage.setItem(`${networkStatusKey}Timestamp`, Date.now().toString())

        return isOnline
      }
    },
    connect () {
      // checkNetworkStatus()
      // declare an IndexedDB Database
    },
    submit () {
      // checkNetworkStatus()
      // if user online then business as usual
      // if user offline then prevent the default form behavior
    },
    async saveFormData () {
      // checkNetworkStatus()
      // if checkFormValid() save in IndexedDB, else notify user form invalid
    }
  })
}
