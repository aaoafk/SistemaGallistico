# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin "select2", to: "https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"
pin "idb", to: "https://cdn.jsdelivr.net/npm/idb@8.0.1/+esm"
pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/custom", under: "custom"
