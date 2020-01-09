'use strict'

const React = require('react')
const { WindowContext } = require('./main')
const { bool, func, node, string } = require('prop-types')
const cx = require('classnames')
const { has } = require('../dom')

const Toolbar = React.forwardRef((props, ref) =>
  <div
    ref={ref}
    className={cx('toolbar', 'tb-target', props.className)}
    onDoubleClick={props.onDoubleClick}>
    {props.children}
  </div>
)

Toolbar.propTypes = {
  children: node,
  className: string,
  onDoubleClick: func
}

Toolbar.Context = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    className={cx('toolbar-context', 'tb-target', props.className, {
      active: props.isActive
    })}>
    {props.children}
  </div>
))

Toolbar.Context.propTypes = {
  children: node,
  className: string,
  isActive: bool
}


Toolbar.Left = ({ children, className }) => (
  <div className={cx('toolbar-left', 'tb-target', className)}>
    {children}
  </div>
)

Toolbar.Left.propTypes = {
  children: node,
  className: string
}

Toolbar.Center = ({ children, className }) => (
  <div className={cx('toolbar-center', 'tb-target', className)}>
    {children}
  </div>
)

Toolbar.Center.propTypes = {
  children: node,
  className: string
}

Toolbar.Right = ({ children, className }) => (
  <div className={cx('toolbar-right', 'tb-target', className)}>
    {children}
  </div>
)

Toolbar.Right.propTypes = {
  children: node,
  className: string
}


const ToolGroup = ({ children }) =>
  <div className="tool-group">{children}</div>

ToolGroup.propTypes = {
  children: node
}


class Titlebar extends React.PureComponent {

  handleDoubleClick = (event) => {
    if (this.context.state.frameless && has(event.target, 'tb-target'))
      this.context.send('double-click')
  }

  render() {
    return (this.props.isOptional && !this.context.state.frameless) ? null : (
      <Toolbar
        className="titlebar"
        onDoubleClick={this.handleDoubleClick}>
        {this.props.children}
      </Toolbar>
    )
  }

  static contextType = WindowContext

  static propTypes = {
    children: node,
    isOptional: bool
  }
}

module.exports = {
  Toolbar,
  ToolGroup,
  Titlebar
}
