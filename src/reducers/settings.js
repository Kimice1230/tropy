'use strict'

const { SETTINGS, ITEM, PHOTO, SELECTION, ESPER, DC } = require('../constants')
const { merge } = require('../common/util')
const { darwin } = require('../common/os')

const defaults = {
  completions: 'datatype',
  debug: ARGS.debug,
  dup: 'prompt',
  density: 72,
  export: {
    note: {
      format: {
        text: true,
        html: true,
        markdown: false
      },
      localize: true
    }
  },
  fontSize: ARGS.fontSize,
  layout: ITEM.LAYOUT.STACKED,
  locale: ARGS.locale,
  localtime: true,
  tagColor: null,
  templates: {
    item: ITEM.TEMPLATE.DEFAULT,
    photo: PHOTO.TEMPLATE.DEFAULT,
    selection: SELECTION.TEMPLATE.DEFAULT
  },
  theme: ARGS.theme,
  title: {
    item: DC.title,
    photo: DC.title,
    force: false
  },
  overlayToolbars: ARGS.frameless,
  print: {
    mode: 'photo',
    photos: true,
    metadata: true,
    notes: true,
    onlyNotes: false,
    overflow: false
  },
  invertScroll: true,
  invertZoom: darwin,
  zoomMode: ESPER.MODE.FIT
}

module.exports = {
  settings(state = defaults, { type, payload }) {
    switch (type) {
      case SETTINGS.RESTORE:
        return {
          ...merge(defaults, payload),
          fontSize: ARGS.fontSize,
          theme: ARGS.theme,
          locale: ARGS.locale
        }
      case SETTINGS.UPDATE:
        return merge(state, payload)
      default:
        return state
    }
  }
}
