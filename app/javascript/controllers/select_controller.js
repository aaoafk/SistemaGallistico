// app/javascript/controllers/select_controller.js
import { Controller } from "@hotwired/stimulus"
import Select2 from "select2"

// Initialize select2 on our select element
// Connects to data-controller="select"

export default class extends Controller {
  connect() {
    $(this.element).select2({
      theme: "classic",
      placeholder: "Buscar por banda...",
      allowClear: true,
      width: '100%'
    });
  }

  disconnect() {
    $(this.element).select2('destroy');
  }
}
