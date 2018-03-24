import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/dom/ajax';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { Route } from 'react-router-dom'
import { Switch } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import './index.css';
import App from './App';
import Rasa from './rasa/components/App';
import enUS from 'antd/lib/locale-provider/en_US'
import { LocaleProvider } from 'antd'
import registerServiceWorker from './registerServiceWorker';
import store, { history } from './state/store'

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={enUS}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route exact path="/" component={App} />
          <Route path="/rasa" component={Rasa} />
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();

if (window.location.href === 'http://localhost:3000/') {
  window.location.href = 'http://localhost:8001/';
}
