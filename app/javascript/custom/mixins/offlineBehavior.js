import { openDB } from 'idb'

export const offlineBehavior = controller => {
  Object.assign(controller, {
    async isOnline () {
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
    async IDBConnect () {
      const userIsConnectedToInternet = await this.isOnline()
      if (!userIsConnectedToInternet) {
        try {
          // Open a database using idb's openDB
          this.db = await openDB('sg-app-db', 1, {
            upgrade (db) {
              // Define object stores and indexes here
              const storeName = 'persisted-offline-form-data'
              if (!db.objectStoreNames.contains(storeName)) {
                const store = db.createObjectStore(storeName, {
                  // The 'id' property of the object will be the key
                  keyPath: 'id',
                  // If it isn't explicitly set, create by value by auto incrementing
                  autoIncrement: true
                })
              }
            }
          })
          console.log('Database connection established!')
          return this.db
        } catch (error) {
          console.error('Database connection failed:', error)
          throw error
        }
      } else {
        console.log('User is online. No need to opendb()')
      }
    },
    async submit (event) {
      const userIsConnectedToInternet = await this.isOnline()

      if (!userIsConnectedToInternet) {
        // Prevent default form submission
        event.preventDefault()

				// Scaffold Offline UI
				this.notifyOfflineMode()

        // Optionally save form data for later submission
        await this.saveFormData(event)
      } else {
        console.log('User is online...Allowing online form submit.')
      }
    },
    // Usage in submit or save methods
    async saveFormData (event) {
      // If online, proceed with normal submission
      const userIsConnectedToInternet = await this.isOnline()
      if (userIsConnectedToInternet) {
				return;
      } else {
        // Intialize connection to IDBDatabase
        const idbConnected = await this.IDBConnect()
        if (idbConnected) {
          // Collect form data
          // Get everything from the form
					const data = Object.fromEntries(new FormData(event.target).entries())
					console.log('Captured form data:');
					for (const [key, value] of Object.entries(data)) {
						console.log(`${key}: ${value}`);
					}
          // Validate form
          const validationResult = this.checkFormValid(data)

          if (!validationResult.isValid) {
            // Handle validation errors
            this.displayValidationErrors(validationResult.errors)
            return false
          }

          // Offline handling - save to IndexedDB
          try {
            await this.db.add('persisted-offline-form-data', {
              ...data,
              submittedAt: Date.now()
            })

            return false // Prevent default form submission
          } catch (error) {
            console.error('Failed to save offline form data', error)
            return false
          }
        }
      }
    },
    checkFormValid (formData) {
			// Transform FormData keys to remove the 'gallo[...]' prefix
			const transformedData = Object.fromEntries(
				Object.entries(formData).map(([key, value]) => {
					// Remove 'gallo[' from the start and ']' from the end
					const cleanKey = key.replace(/^gallo\[|\]$/g, '');
					return [cleanKey, value];
				})
			);

			// Create temporary Gallo object with cleaned data
			const tempGallo = {
				banda_de_ala: transformedData.banda_de_ala,
				weight_pounds: transformedData.weight_pounds,
				weight_ounces: transformedData.weight_ounces,
				genero: transformedData.genero,
				apodo: transformedData.apodo,
				
				// Method to simulate Rails validation errors
				errors: {
					base: [],
					add(field, message) {
						this.base.push({ field, message });
					}
				}
			};

			// Optional: Logging to verify data
			for (const [key, value] of Object.entries(tempGallo)) {
				if (key !== 'errors') {
					console.log(`checkFormValid :: tempGallo :: ${key}: ${value}`);
				}
			}

      // Validate required fields
      const validations = [
        {
          field: 'banda_de_ala',
          validate: () => {
            if (!tempGallo.banda_de_ala || parseInt(tempGallo.banda_de_ala) <= 0) {
              tempGallo.errors.add('banda_de_ala', 'La banda de ala debe estar presente')
              return false
            }
            return true
          }
        },
        {
          field: 'weight',
          validate: () => {
            // Check if at least one weight value is present
            if ((!tempGallo.weight_pounds || parseInt(tempGallo.weight_pounds) === 0) &&
								(!tempGallo.weight_ounces || parseInt(tempGallo.weight_ounces) === 0)) {
              tempGallo.errors.add('peso', 'Te falta llenar el peso del gallo!')
              return false
            }

            // Optional: Additional weight range validations
            if (tempGallo.weight_pounds && parseInt(tempGallo.weight_pounds) < 0) {
              tempGallo.errors.add('peso', 'El peso no puede ser menos que cero!')
              return false
            }

            if (tempGallo.weight_ounces && (parseInt(tempGallo.weight_ounces) < 0 || parseInt(tempGallo.weight_ounces) > 15)) {
              tempGallo.errors.add('peso', 'El peso debe ser entre cero y quince onzas!')
              return false
            }

            return true
          }
        },
        {
          field: 'genero',
          validate: () => {
            if (!tempGallo.genero) {
              tempGallo.errors.add('genero', 'Género debe estar presente!')
              return false
            }
            return true
          }
        }
      ]

      // Run all validations
      const validationResults = validations.map(validation => validation.validate())

      // Prepare return object
      return {
        // Form is valid only if all validations pass
        isValid: validationResults.every(result => result === true),

        // Collect and return any error messages
        errors: tempGallo.errors.base
      }
    },
		notifyOfflineMode() {
			// Async method to handle offline notification
			const setupOfflineBanner = async () => {
				// Check if actually offline using our custom method
				const isOffline = !(await this.isOnline());
				
				if (!isOffline) return;

				// Find the offline notifications container
				const notificationsContainer = document.querySelector('#offline-notifications');
				
				// If container doesn't exist, create and append it
				if (!notificationsContainer) {
					const container = document.createElement('div');
					container.id = 'offline-notifications';
					container.className = `
        fixed top-0 left-0 w-full z-50
      `;
					document.body.appendChild(container);
				}

				// Check if a banner already exists
				const existingBanner = document.querySelector('#offline-banner');
				if (existingBanner) return;

				// Create offline banner
				const banner = document.createElement('div');
				banner.id = 'offline-banner';
				banner.className = `
      bg-yellow-500 text-white 
      p-3 text-center flex items-center justify-center 
      shadow-lg transition-all duration-300 ease-in-out
    `;
				
				// Banner content with cloud icon and message
				banner.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
      Estás trabajando sin conexión. Tus cambios se guardarán y sincronizarán cuando vuelvas a estar en línea.
    `;

				notificationsContainer.appendChild(banner);

				// Optional: Method to check and remove banner when online
				const checkAndRemoveBanner = async () => {
					const online = await this.isOnline();
					if (online) {
						banner.classList.add('opacity-0', '-translate-y-full');
						setTimeout(() => {
							notificationsContainer.removeChild(banner);
						}, 300);
					}
				};

				// Periodically check online status
				const offlineCheckInterval = setInterval(async () => {
					await checkAndRemoveBanner();
				}, 5000); // Check every 5 seconds

				// Clear interval if banner is removed
				banner.addEventListener('remove', () => {
					clearInterval(offlineCheckInterval);
				});

				return banner;
			};

			// Initiate offline banner setup
			setupOfflineBanner();
		},
    // Helper method to display validation errors
    displayValidationErrors (errors) {
      // Clear previous errors
      const errorContainer = document.querySelector('.error-container')
      errorContainer.innerHTML = ''

      // Create error messages
      errors.forEach(error => {
        const errorElement = document.createElement('div')
        errorElement.classList.add('error-message')
        errorElement.textContent = error.message
        errorContainer.appendChild(errorElement)
      })

      // Optional: Scroll to error container
      errorContainer.scrollIntoView({ behavior: 'smooth' })
    }
  })
}
