'use strict'

const React = require('react')
const cx = require('classnames')
const { IconTrash } = require('../icons')
const { FormattedMessage } = require('react-intl')
const { DND, DropTarget } = require('../dnd')
const { bool, func } = require('prop-types')


class TrashListNode extends React.PureComponent {
  get classes() {
    return {
      active: this.props.isSelected,
      over: this.props.isOver
    }
  }

  handleContextMenu = (event) => {
    this.props.onContextMenu(event, 'trash', {})
  }

  render() {
    const { dt, isSelected, onClick } = this.props

    return dt(
      <li
        className={cx(this.classes)}
        onContextMenu={this.handleContextMenu}
        onClick={isSelected ? null : onClick}>
        <div className="list-node-container">
          <IconTrash/>
          <div className="name">
            <div className="truncate">
              <FormattedMessage id="sidebar.trash"/>
            </div>
          </div>
        </div>
      </li>
    )
  }

  static propTypes = {
    isOver: bool,
    isSelected: bool,
    dt: func.isRequired,
    onClick: func.isRequired,
    onContextMenu: func.isRequired,
    onDropItems: func.isRequired
  }
}

const spec = {
  drop({ onDropItems }, monitor) {
    onDropItems(monitor.getItem().items)
  }
}

const collect = (connect, monitor) => ({
  dt: connect.dropTarget(),
  isOver: monitor.isOver()
})


module.exports = {
  TrashListNode: DropTarget(DND.ITEMS, spec, collect)(TrashListNode)
}
