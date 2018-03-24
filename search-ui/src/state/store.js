import { createStore, applyMiddleware } from 'redux';
import { combineEpics, createEpicMiddleware } from 'redux-observable';
import { searchEpic } from './actions';
import reducer from './reducer';

const store = createStore(
  reducer,
  applyMiddleware(
    createEpicMiddleware(searchEpic)
  ),
);

export default store;
