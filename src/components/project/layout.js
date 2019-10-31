'use strict'

const React = require('react')
const { connect } = require('react-redux')
const throttle = require('lodash.throttle')
const { restrict } = require('../../common/util')
const { SASS: { BREAKPOINT, GIANT, PANEL } } = require('../../constants')
const { ProjectView } = require('./view')
const { ItemView } = require('../item')
const cx = require('classnames')
const { Resizable } = require('../resizable')
const actions = require('../../actions')
const { round } = require('../../common/math')

const {
  arrayOf, object, bool, func, array, shape, number, string
} = require('prop-types')


class ProjectLayout extends React.Component {
  container = React.createRef()

  constructor(props) {
    super(props)
    const { sidebar, panel, display } = this.props.ui
    let proportion = display.proportion || GIANT.DEFAULT_PROPORTION

    this.state = {
      offset: panel.width,
      sidebar: sidebar.width,
      project: 0,
      panel: panel.width,
      item: 0,
      proportion,
      displayType: 'standard',
    }
  }

  componentDidMount() {
    this.ro = new ResizeObserver(([e]) => {
      this.handleResize(e.contentRect.width)
    })
    this.ro.observe(this.container.current)
  }

  componentWillUnmount() {
    this.ro.unobserve(this.container.current)
    this.ro.disconnect()
    this.ro = null
  }

  get classes() {
    return ['layout',
      { 'layout-giant': this.state.displayType === 'giant' },
      { 'layout-standard': this.state.displayType === 'standard' }
    ]
  }

  get style() {
    if (this.state.displayType === 'giant') {
      let offset2 = this.state.sidebar + this.state.project
      return {
        transform: `translate3d(${offset2}px, 0, 0)`,
      }
    } else {
      return {
        transform: `translate3d(${this.state.offset}, 0, 0)`
      }
    }
  }

  handleResize = throttle((width) => {
    this.resizeAll(width)
  }, 50)

  calcProportion = (project, item) => {
    let tandem = project + item
    return round((tandem - item) / tandem, GIANT.DEC_PRECISION)
  }

  isProportionOk = (p) => p >= GIANT.MIN_PROPORTION && p <= GIANT.MAX_PROPORTION

  getDelta = (value) => {
    return (this.drag.prev !== value) ? value - this.drag.prev : 0

  getChange = (value, isMax, isMin) => {
    var action
    let delta = (this.drag.prev !== value) ? value - this.drag.prev : 0
    if (delta > 0) {
      action = (isMax) ? 'PULL' : 'GROW'
      if (action !== this.drag.action) {
        this.drag.action = action
        console.log('change to', action)
      }
    }
    if (delta < 0) {
      action = (isMin) ? 'PUSH' : 'SHRINK'
      if (action !== this.drag.action) {
        this.drag.action = action
        console.log('change to', action)
      }
    }

    return { delta, action }
  }

  resizeAll = (totalWidth) => {
    const { ui } = this.props
    if (this.props.isGiantViewEnabled && totalWidth >= BREAKPOINT.XL) {
      let tandemWidth = totalWidth - ui.sidebar.width - ui.panel.width
      let project = Math.ceil(tandemWidth * this.state.proportion)
      let item = Math.floor(tandemWidth * (1 - this.state.proportion))
      this.setState({
        displayType: 'giant',
        project,
        item
      })
    } else {
      this.setState({
        displayType: 'standard'
      })
    }
  }

  resizePortion = (portion, value, explicit = false) => {
    let counterP = {
      sidebar: 'project',
      project: 'item',
      panel: 'item',

    }
    let delta = this.state[portion] - value
    let counter = (explicit) ? explicit : counterP[portion]
    let newState = {
      ...this.state,
      [portion]: value,
      [counter]: this.state[counter] + delta
    }

    if (portion === 'panel') {
      newState.offset = value
    }

    newState.proportion = this.calcProportion(newState.project, newState.item)
    if (this.isProportionOk(newState.proportion)) {
      this.setState(newState)
    }
  }

  handleSidebarOnResize = ({ value }) => {
    this.resizePortion('sidebar', value)
  }

  handleProjectOnResize = ({ value }) => {
    const max = PANEL.MAX_WIDTH + this.drag.startItem
    const min = PANEL.MIN_WIDTH + this.drag.startItem
    let delta = this.getDelta(value)

    if (value > min && value < max)
      this.resizePortion('panel', this.state.panel + delta, 'project')
    else
      this.resizePortion('project', this.state.project - delta)

    this.drag.prev = value
  }

  handlePanelResize = ({ value, unrestrictedValue }) => {
    const max = PANEL.MAX_WIDTH
    const min = PANEL.MIN_WIDTH
    let isMax = this.state.panel === max
    let isMin = this.state.panel === min
    let { action, delta } = this.getChange(unrestrictedValue, isMax, isMin)

    if (action === 'GROW' || action === 'SHRINK') {
      this.resizePortion('panel', restrict(this.state.panel + delta, min, max))
    }
    if (action === 'PULL' || action === 'PUSH') {
      this.resizePortion('project', this.state.project + delta)
    }
    this.drag.prev = unrestrictedValue
  }

  handleProjectDragStart = () => {
    this.drag = {
      prev: this.state.panel + this.state.item,
      startItem: this.state.item
    }
  }

  handlePanelDragStart = () => {
    this.drag = {
      action: '',
      prev: this.state.panel,
    }
  }

  handleSidebarDragStop = () => {
    this.props.onUiUpdate({
      sidebar: { width: this.state.sidebar },
      display: { proportion: this.state.proportion }
    })
  }

  handleProjectDragStop = () => {
    this.drag = {}
    this.props.onUiUpdate({
      display: { proportion: this.state.proportion }
    })
  }

  handlePanelDragStop = () => {
    this.drag = {}
    this.props.onUiUpdate({
      panel: { width: this.state.panel },
      display: { proportion: this.state.proportion }
    })
  }

  render() {
    const  {
      ui,
      ...props
    } = this.props

    return (
      <div className={cx(this.classes)} ref={this.container}>
        <ProjectView {...props}
          width={this.state.project}
          nav={this.props.nav}
          items={this.props.items}
          data={this.props.data}
          isActive={this.props.isActive}
          isEmpty={this.props.isEmpty}
          columns={this.props.columns}
          offset={this.state.offset}
          photos={this.props.photos}
          templates={this.props.templates}
          sidebarWidth={this.state.sidebar}
          zoom={ui.zoom}
          display={ui.display}
          displayType={this.state.displayType}
          onSidebarResize={this.handleSidebarOnResize}
          onSidebarDragStop={this.handleSidebarDragStop}
          onMetadataSave={this.props.onMetadataSave}/>

        <Resizable
          edge="left"
          value={this.state.panel + this.state.item}
          onDragStart={this.handleProjectDragStart}
          onResize={this.handleProjectOnResize}
          onDragStop={this.handleProjectDragStop}
          style={this.style}>
          <ItemView {...props}
            width={this.state.item}
            items={this.props.selection}
            data={this.props.data}
            activeSelection={this.props.nav.selection}
            note={this.props.note}
            notes={this.props.notes}
            photo={this.props.photo}
            photos={this.props.visiblePhotos}
            panel={ui.panel}
            offset={this.state.offset}
            mode={this.props.mode}
            display={ui.display}
            displayType={this.state.displayType}
            isModeChanging={this.props.isModeChanging}
            isTrashSelected={!!this.props.nav.trash}
            isProjectClosing={this.props.project.closing}
            onPanelDragStart={this.handlePanelDragStart}
            onPanelResize={this.handlePanelResize}
            onPanelDragStop={this.handlePanelDragStop}
            onMetadataSave={this.props.onMetadataSave}/>
        </Resizable>
      </div>
    )
  }

  static propTypes = {
    data: object.isRequired,
    canDrop: bool,
    edit: object.isRequired,
    isActive: bool,
    isEmpty: bool.isRequired,
    isOver: bool,
    items: array.isRequired,
    keymap: object.isRequired,
    nav: object.isRequired,
    photos: object.isRequired,
    tags: object.isRequired,
    dt: func.isRequired,
    onItemCreate: func.isRequired,
    onItemImport: func.isRequired,
    onItemSelect: func.isRequired,
    onItemTagAdd: func.isRequired,
    onSearch: func.isRequired,
    onSort: func.isRequired,
    project: object.isRequired,
    selection: arrayOf(
      shape({ id: number.isRequired })
    ),
    note: shape({ id: number.isRequired }),
    notes: arrayOf(
      shape({ id: number.isRequired })
    ),
    photo: object,
    visiblePhotos: arrayOf(
      shape({ id: number.isRequired })
    ),
    columns: object.isRequired,
    templates: object.isRequired,
    isModeChanging: bool.isRequired,
    mode: string.isRequired,

    ui: object.isRequired,
    isGiantViewEnabled: bool,
    onUiUpdate: func.isRequired,
    onMetadataSave: func.isRequired
  }
}

module.exports = {
  ProjectLayout: connect(
    state => ({
      ui: state.ui,
      isGiantViewEnabled: state.settings.giantView
    }),

    dispatch => ({

      onUiUpdate(...args) {
        dispatch(actions.ui.update(...args))
      }

    })
  )(ProjectLayout)
}