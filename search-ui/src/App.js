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

const INTENT_MAP = {
  set_maximum_price: 'Set maximum price',
  set_minimum_price: 'Set minimum price',
  set_location: 'Set location',
  clear_search: 'Clear search context',
  find_creative: 'Find something creative activity',
  find_relaxing: 'Find something relaxing activity',
  find_cultural: 'Find something cultural activity',
  set_language: 'Change language',
};

const ENTITY_MAP = {
  PERSON        :'Person',
  NORP          :'Nationalities/Groups',
  FAC           :'Facility',
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

const detectProbablilityClass = (v) => {
  if (v > 0.65) {
    return 'high-rate';
  } else if (v >= 0.5) {
    return 'middle-rate';
  } else {
    return 'low-rate';
  }
};

const App = ({ intent, entity, semantic, results }) => (
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
        <div className="app-intent panel col-md-4">
          <div className="panel-heading">
            <h3 className="panel-title">You want to</h3>
          </div>
          <div className="panel-body">
            <h4 className="app-intent-label">{INTENT_MAP[intent.top_intent]}</h4>
            { intent.score &&
              <div className="app-intent-score">probability: <span className={detectProbablilityClass(intent.score)}>{intent.score}</span></div>
            }
          </div>
        </div>
        <div className="app-entity panel col-md-4">
          <div className="panel-heading">
            <h3 className="panel-title">Entities</h3>
          </div>
          <div className="panel-body">
            { entity.length > 0 &&
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">key</th>
                    <th scope="col">value</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    entity.map(ent => (<tr key={ent.name}>
                      <td className="app-entity-label">{ENTITY_MAP[ent.type]}</td>
                      <td className="app-entity-score">{ent.name}</td>
                    </tr>))
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
        <div className="app-semantic panel col-md-4">
          <div className="panel-heading">
            <h3 className="panel-title">Search criteria</h3>
          </div>
          <div className="panel-body">
           { semantic.filter &&
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">key</th>
                    <th scope="col">value</th>
                  </tr>
                </thead>
                <tbody>
                  {semantic.filter.budget_less && <tr><td>Budget less than</td><td>{semantic.filter.budget_less} yen</td></tr>}
                  {semantic.filter.budget_more && <tr><td>Budget greater than</td><td>{semantic.filter.budget_more} yen</td></tr>}
                  {semantic.filter.distance && <tr><td>Location</td><td>Around {semantic.filter.distance}m from {semantic.filter.location.lat}° N, {semantic.filter.location.lng}° E</td></tr>}
                  {semantic.filter.tags && semantic.filter.tags.length > 0 && <tr><td>Theme</td><td>{semantic.filter.tags}</td></tr>}
                  {semantic.filter.words && semantic.filter.words.length > 0 && <tr><td>Keyword</td><td>{semantic.filter.words}</td></tr>}
                  {semantic.langs && <tr><td>Language</td><td>{semantic.langs[0]}</td></tr>}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <ul className="app-results list-group">{ results.size > 0
        ? results.map(r => <li className="app-results-row list-group-item" key={r.id}>
          <div className="media">
            <div className="media-left">
              <img className="media-object" src={`https://d3fbf9i27pqcx4.cloudfront.net/global/cropped/160/${r.id}-0.jpeg`} />
            </div>
            <div className="media-body">
              <h4 className="app-results-row-title media-heading">{r.attributes.title}</h4>
              <h4 className="app-results-row-price">{r.attributes.price} yen</h4>
              <p>{r.attributes.latitude} {r.attributes.longitude}</p>
              <div>{r.attributes.description}</div>
            </div>
          </div>
        </li>)
        : <h4>0 result</h4>
      }</ul>
    </div>
  </div>
);

export default connect(mapState)(App);
