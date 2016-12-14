'use strict'

const B = require('./promisify')

const { resolve, join } = require('path')
const { readFileAsync: read } = require('fs')
const { flatten } = require('./util')

const yaml = require('js-yaml')
const root = resolve(__dirname, '..', '..', 'res')

class Resource {
  static get base() {
    return root
  }

  static get ext() {
    return '.yml'
  }

  static parse(data) {
    return yaml.safeLoad(data)
  }

  static async open(name, ...args) {
    return new this(this.parse(await read(this.expand(name))), ...args)
  }

  static expand(name) {
    return join(this.base, `${name}${this.ext}`)
  }

  constructor() {
  }
}

class Menu extends Resource {
  static get base() {
    return join(super.base, 'menu')
  }

  constructor(data = {}) {
    super()
    this.template = data[process.platform]
  }
}

class Strings extends Resource {
  static get base() {
    return join(super.base, 'strings')
  }

  static open(locale, ...args) {
    return super.open(locale, locale, ...args)
  }

  static openWithFallback(locale, fallback = 'en', ...args) {
    return B
      .resolve(this.open(locale, ...args))
      .catch({ code: 'ENOENT' }, () => this.open(fallback, ...args))
  }

  static expand(locale) {
    return super.expand(`${process.type}.${String(locale).slice(0, 2)}`)
  }

  constructor(dict = {}, locale = 'en') {
    super()
    this.dict = dict
    this.locale = locale
  }

  flatten() {
    return flatten(this.dict)
  }
}

module.exports = {
  Resource, Menu, Strings
}
