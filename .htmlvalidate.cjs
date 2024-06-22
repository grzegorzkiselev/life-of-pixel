const { defineConfig } = require("html-validate");

module.exports = defineConfig({
  "elements": [
    "html5"
  ],
  "extends": [
    "html-validate:recommended"
  ],
  "rules": {
    "no-inline-style": "off",
    "no-autoplay": "off",
    "no-raw-characters": "off",
    "wcag/h37": "off",
    "no-redundant-role": "off"
  }
});