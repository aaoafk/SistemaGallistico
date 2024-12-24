import { Controller } from '@hotwired/stimulus'
import { offlineBehavior } from 'custom/mixins/offlineBehavior'
// Connects to data-controller="gallos-offline"
export default class extends Controller {
  connect () {
    // Mixin offlineBehavior for this controller
    offlineBehavior(this)
  }
}
