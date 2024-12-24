import { openDB } from 'idb';

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
    async IDBConnect() {
			const userIsConnectedToInternet = await this.isOnline();
			if (!userIsConnectedToInternet) {
				try {
					// Open a database using idb's openDB
					this.db = await openDB('sg-app-db', 1, {
						upgrade(db) {
							// Define object stores and indexes here
							const storeName = 'persisted-offline-form-data';
							if (!db.objectStoreNames.contains(storeName)) {
								const store = db.createObjectStore(storeName, {
									// The 'id' property of the object will be the key
									keyPath: 'id',
									// If it isn't explicitly set, create by value by auto incrementing
									autoIncrement: true
								});
							}
						}
					});
					console.log('Database connection established!');
					return this.db;
				} catch (error) {
					console.error('Database connection failed:', error);
					throw error;
				}
			} else {
				console.log('User is online. No need to opendb()');
			}
    },
    async submit(event) {
      const userIsConnectedToInternet = await this.isOnline();

      if (!userIsConnectedToInternet) {
        // Prevent default form submission
        event.preventDefault();
        
        // Optionally save form data for later submission
        await this.saveFormData(event);
        
        // Notify user about offline status
        // this.notifyOfflineMode();
				console.log('Notify offline mode!')
        return;
      } else {
				console.log('User is online...Allowing online form submit.')
			}
    },
		// Usage in submit or save methods
		async saveFormData(event) {
			// If online, proceed with normal submission
			const userIsConnectedToInternet = await this.isOnline();
			if (userIsConnectedToInternet) {
				return;
			} else {
				// Intialize connection to IDBDatabase
				const idbConnected = await this.IDBConnect()
				if (idbConnected) {
					// Collect form data
					// Get everything from the form
					const data = Object.fromEntries(new FormData(event.target).entries())
					console.log(`Captured form data: ${data}`)
					// const formData = {
					// 	banda_de_ala: this.formElement.querySelector('input[name="gallo[banda_de_ala]"]').value,
					// 	weight_pounds: this.formElement.querySelector('input[name="gallo[weight_pounds]"]').value,
					// 	weight_ounces: this.formElement.querySelector('input[name="gallo[weight_ounces]"]').value,
					// 	genero: this.formElement.querySelector('select[name="gallo[genero]"]').value,
					// 	apodo: this.formElement.querySelector('input[name="gallo[apodo]"]').value
					// };
					// Validate form
					const validationResult = this.checkFormValid(data);

					if (!validationResult.isValid) {
						// Handle validation errors
						this.displayValidationErrors(validationResult.errors);
						return false;
					}
					
					// Offline handling - save to IndexedDB
					try {
						await this.db.add('persisted-offline-form-data', {
							...formData,
							submittedAt: Date.now()
						});
						
						// this.notifyOfflineSave();
						console.log('Offline saved')
						return false; // Prevent default form submission
					} catch (error) {
						console.error('Failed to save offline form data', error);
						return false;
					}
				}
			}
		},
		checkFormValid(formData) {
			// Create a temporary Gallo object instance to reflect rails validations
			const tempGallo = {
				// Map form data to model attributes
				banda_de_ala: formData.banda_de_ala,
				weight_pounds: formData.weight_pounds,
				weight_ounces: formData.weight_ounces,
				genero: formData.genero,
				apodo: formData.apodo,
				// Method to simulate Rails validation errors
				errors: {
					base: [],
					add(field, message) {
						this.base.push({ field, message });
					}
				}
			};

			// Validate required fields
			const validations = [
				{
					field: 'banda_de_ala',
					validate: () => {
						if (!tempGallo.banda_de_ala || tempGallo.banda_de_ala <= 0) {
							tempGallo.errors.add('banda_de_ala', 'Banda de ala must be present and greater than zero');
							return false;
						}
						return true;
					}
				},
				{
					field: 'weight',
					validate: () => {
						// Check if at least one weight value is present
						if ((!tempGallo.weight_pounds || tempGallo.weight_pounds === 0) && 
								(!tempGallo.weight_ounces || tempGallo.weight_ounces === 0)) {
							tempGallo.errors.add('peso', 'Te falta llenar el peso del gallo!');
							return false;
						}
						
						// Optional: Additional weight range validations
						if (tempGallo.weight_pounds && tempGallo.weight_pounds < 0) {
							tempGallo.errors.add('peso', 'El peso no puede ser menos que cero!');
							return false;
						}
						
						if (tempGallo.weight_ounces && (tempGallo.weight_ounces < 0 || tempGallo.weight_ounces > 15)) {
							tempGallo.errors.add('peso', 'El peso debe ser entre cero y quince onzas!');
							return false;
						}
						
						return true;
					}
				},
				{
					field: 'genero',
					validate: () => {
						if (!tempGallo.genero) {
							tempGallo.errors.add('genero', 'Género debe estar presente!');
							return false;
						}
						return true;
					}
				}
			];

			// Run all validations
			const validationResults = validations.map(validation => validation.validate());

			// Prepare return object
			return {
				// Form is valid only if all validations pass
				isValid: validationResults.every(result => result === true),
				
				// Collect and return any error messages
				errors: tempGallo.errors.base
			};
		},
		// Helper method to display validation errors
		displayValidationErrors(errors) {
			// Clear previous errors
			const errorContainer = document.querySelector('.error-container');
			errorContainer.innerHTML = '';

			// Create error messages
			errors.forEach(error => {
				const errorElement = document.createElement('div');
				errorElement.classList.add('error-message');
				errorElement.textContent = error.message;
				errorContainer.appendChild(errorElement);
			});

			// Optional: Scroll to error container
			errorContainer.scrollIntoView({ behavior: 'smooth' });
		}
  })
}
