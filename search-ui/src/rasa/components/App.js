// @flow

import React, { Component } from 'react'
import ExampleTable from './ExampleTable'
import TopBar from './TopBar'
import AddExampleModal from './AddExampleModal'
import CompatibilityAlert from './CompatibilityAlert'
import { connect } from 'react-redux'
import { Spin } from 'antd'

import store from '../../state/store'
import * as actions from '../state/actions'

const mapState = (state) => ({
  examples: state.rasa.examples
})

class App extends Component {

  componentWillMount() {
    this.props.dispatch(actions.loadData());
  }

  render() {
    const { examples } = this.props
    if (!examples) {
      return (
        <Spin style={{ width: '100%', height: '100%' }}>
          <div />
        </Spin>
      )
    }

    const intents = []
    examples.forEach(({intent}) => {
      if (intent && intents.indexOf(intent) === -1) {
        intents.push(intent)
      }
    })

    const entityNames = []
    examples.forEach((example) => {
      example.entities.forEach(({entity}) => {
        if (entity && entityNames.indexOf(entity) === -1) {
          entityNames.push(entity)
        }
      })
    })

    return (
      <div>
        <ul className="nav nav-tabs">
          <li role="presentation"><a href="/">Search</a></li>
          <li role="presentation" className="active"><a href="/rasa/">Train</a></li>
        </ul>
        <ExampleTable
          intents={intents}
          entityNames={entityNames}
          header={() => <TopBar />}
        />
        <AddExampleModal
          intents={intents}
          entityNames={entityNames}
        />
        <CompatibilityAlert />
      </div>
    )
  }
}

export default connect(mapState)(App)
