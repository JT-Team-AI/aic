import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Link } from 'react-router';
import SearchInput from './SearchInput';

import logo from './logo.svg';
import './App.css';


const mapState = (state) => ({
  intent: state.search.intent,
  entity: state.search.entity,
  semantic: state.search.semantic,
  results: state.search.results,
})

const ENTITY_MAP = {
  PERSON        :'Person',
  NORP          :'Nationalities/Groups',
  FACILITY      :'Facility',
  ORG           :'Organization',
  GPE           :'Country/City/State',
  LOC           :'Location',
  PRODUCT       :'Product',
  EVENT         :'Event',
  WORK_OF_ART   :'Art',
  LAW           :'Law',
  LANGUAGE      :'Language',
  DATE          :'Date',
  TIME          :'Time',
  PERCENT       :'Percentage',
  MONEY         :'Money',
  QUANTITY      :'Quantity',
  ORDINAL       :'Ordinal',
  CARDINAL      :'Numerals',
};


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
        <div className="app-intent panel col-md-6">
          <div className="panel-heading">
            <h3 class="panel-title">Your intent</h3>
          </div>
          <div className="panel-body">
            <div className="app-intent-label">{intent.top_intent}</div>
            <div className="app-intent-score">{intent.score}</div>
          </div>
        </div>
        <div className="app-entity panel col-md-6">
          <div className="panel-heading">
            <h3 class="panel-title">Your intent</h3>
          </div>
          <div className="panel-body">
            {
              entity.map(ent => (<div key={ent.name}>
                <div className="app-entity-label">{ENTITY_MAP[ent.type]}</div>
                <div className="app-entity-score">{ent.name}</div>
              </div>))
            }
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <ul className="app-results list-group">{
        results.map(r => <li className="app-results-row list-group-item" key={r.id}>
          <div className="app-results-row-title">{r.attributes.title}</div>
          <div className="app-results-row-description">{r.attributes.description}</div>
        </li>)
      }</ul>
    </div>
  </div>
);

export default connect(mapState)(App);
