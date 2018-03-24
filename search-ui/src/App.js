import React, { Component } from 'react';
import { connect } from 'react-redux'
import SearchInput from './SearchInput';

import logo from './logo.svg';
import './App.css';


const mapState = (state) => ({
  results: state.search.results
})

const App = ({ results }) => (
  <div className="app">
    <header className="app-header">
      <img src={logo} className="app-logo" alt="logo" />
      <h1 className="app-title">AI Challenge</h1>
    </header>
    <div className="app-searchbox">
      <SearchInput />
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
