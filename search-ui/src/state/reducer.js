import { List } from 'immutable';

import {
  ERROR,
  RECEIVED_RESULT,
} from './actions'

const INITIAL_STATE = {
  results: List()
}

export default function reducer (
  state: Object = INITIAL_STATE,
  action: Object
): Object {
  switch (action.type) {
    case ERROR:
      // TODO
      console.log('Error', action);
      return state;
    case RECEIVED_RESULT:
      return {
        ...state,
        results: action.results,
      };
    default:
      return state
  }
};
