import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';
import SearchInput from './SearchInput';

import logo from './logo.svg';
import './App.css';


const mapState = (state) => ({
  intent: state.search.intent,
  entity: state.search.entity,
  results: state.search.results,
})

const App = ({ intent, entity, results }) => (
  <div className="app">
    <ul className="nav nav-tabs">
      <li role="presentation" className="active"><a href="/">Search</a></li>
      <li role="presentation"><a href="/rasa/">Train</a></li>
    </ul>
    <div className="container app-searchbox input-group">
      <SearchInput />
    </div>
    <div className="container">
      <div className="app-searchanalyze">
        <div className="app-intent">
          <div className="app-intent-label">{intent.top_intent}</div>
          <div className="app-intent-score">{intent.score}</div>
        </div>
        <table className="app-entity table">
          {
            entity.map(ent => (<tr className="list-group-item" key={ent.name}>
              <td className="app-entity-label">{ent.type}</td>
              <td className="app-entity-score">{ent.name}</td>
            </tr>))
           }
        </table>
      </div>
    </div>
    <div className="app-results">{
        results.map(r => <div className="app-results-row" key={r.title}>
          <div className="app-results-row-title">{r.title}</div>
          <div className="app-results-row-description">{r.description}</div>
        </div>)
    }</div>
  </div>
);

export default connect(mapState)(App);
