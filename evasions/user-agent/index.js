'use strict'

const UAParser = require("ua-parser-js")
const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')
const withUtils = require('../_utils/withUtils')

class Plugin extends PuppeteerExtraPlugin {
  opts = {}

  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'fingerprinter/evasions/user-agent'
  }

  async onPageCreated(page) {
    page.setUserAgent(this.opts.userAgent)
    let parser = new UAParser(this.opts.userAgent);
    let OS = parser.getOS().name == "Windows"
            ? "Win32"
            : "Linux x86_64"

    withUtils(page).evaluateOnNewDocument(async (utils, OS) => {
      utils.replaceGetterWithProxy(
        Object.getPrototypeOf(navigator),
        'platform',
        utils.makeHandler().getterValue(OS)
      )
    }, OS)

    withUtils(page).evaluateOnNewDocument(async (utils, ver) => {
      utils.replaceGetterWithProxy(
        Object.getPrototypeOf(navigator),
        'appVersion',
        utils.makeHandler().getterValue(ver)
      )
    }, this.opts.userAgent)

    /*let parts = this.opts.userAgent.split(" ")
    let version = parts.shift().split("/")[1]

    withUtils(page).evaluateOnNewDocument(async (utils, ver) => {
      utils.replaceGetterWithProxy(
        Object.getPrototypeOf(navigator),
        'appVersion',
        utils.makeHandler().getterValue(ver)
      )
    }, version + parts.join(" "))*/
  }

  async beforeLaunch(options) {
    this.opts = JSON.parse(JSON.stringify(options.opts))
  }
}

module.exports = function (pluginConfig) {
  return new Plugin(pluginConfig)
}
