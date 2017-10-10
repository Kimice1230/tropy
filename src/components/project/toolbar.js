'use strict'

const React = require('react')
const { PureComponent } = React
const { FormattedMessage } = require('react-intl')
const { bool, func, number, string } = require('prop-types')
const { Toolbar } = require('../toolbar')
const { IconPlus, IconList, IconGrid } = require('../icons')
const { Slider } = require('../slider')
const { SearchField } = require('../search')
const { IconButton } = require('../button')


class ProjectToolbar extends PureComponent {
  get isEmpty() {
    return this.props.items.length === 0
  }

  renderItemCreateButton() {
    if (this.props.isDisabled) return
    if (!this.props.canCreateItems) return

    return (
      <IconButton
        icon={<IconPlus/>}
        title="toolbar.import"
        onClick={this.props.onItemCreate}/>
    )
  }

  render() {
    const {
      isDisabled,
      isDraggable,
      items,
      query,
      zoom,
      maxZoom,
      onDoubleClick,
      onSearch,
      onZoomChange,
    } = this.props

    return (
      <Toolbar isDraggable={isDraggable} onDoubleClick={onDoubleClick}>
        <div className="toolbar-left">
          <div className="tool-group">
            <Slider
              value={zoom}
              max={maxZoom}
              isDisabled={this.isEmpty || isDisabled}
              onChange={onZoomChange}
              minIcon={<IconList/>}
              maxIcon={<IconGrid/>}/>
          </div>
          <div className="tool-group">
            {this.renderItemCreateButton()}
          </div>
        </div>
        <FormattedMessage id="toolbar.items" values={{ count: items }}/>
        <div className="toolbar-right">
          <SearchField
            query={query}
            isDisabled={isDisabled}
            onSearch={onSearch}/>
        </div>
      </Toolbar>
    )
  }

  static propTypes = {
    canCreateItems: bool,
    isDraggable: bool,
    isDisabled: bool,
    items: number.isRequired,
    query: string.isRequired,
    maxZoom: number.isRequired,
    zoom: number.isRequired,
    onDoubleClick: func,
    onItemCreate: func.isRequired,
    onSearch: func.isRequired,
    onZoomChange: func.isRequired
  }

  static defaultProps = {
    isDraggable: ARGS.frameless
  }
}


module.exports = {
  ProjectToolbar
}
