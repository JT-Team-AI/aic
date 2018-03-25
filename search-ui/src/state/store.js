import { List } from 'immutable';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { searchEpic, intentEpic, entityEpic, semanticEpic, trainEpic } from './actions';
import reducer from './reducer';
import rasaReducer from './../rasa/state/reducer';
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();

const store = createStore(
  combineReducers({
    search: reducer,
    rasa: rasaReducer,
  }),
  {
    search: {
      results: List(),
      intent: {},
      semantic: {},
      entity: List(),
      isTraining: false,
    },
    rasa: {
      examples: [],
      isUnsaved: false,
      selection: null,
      idExampleInModal: null,
    },
  },
  applyMiddleware(
    createEpicMiddleware(combineEpics(intentEpic, entityEpic, semanticEpic, searchEpic, trainEpic)),
    thunk,
    routerMiddleware(history),
  ),
);

export default store;
