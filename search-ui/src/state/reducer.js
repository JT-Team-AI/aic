import { List } from 'immutable';

import {
  ERROR,
  RECEIVED_SEARCH_RESULT,
  RECEIVED_INTENT_RESULT,
  RECEIVED_ENTITY_RESULT,
} from './actions'

export default function reducer (state: Object = {}, action: Object): Object {
  switch (action.type) {
    case ERROR:
      // TODO
      console.log('Error', action);
      return state;
    case RECEIVED_SEARCH_RESULT:
      return {
        ...state,
        results: action.results,
      };
    case RECEIVED_INTENT_RESULT:
      return {
        ...state,
        intent: action.results,
      };
    case RECEIVED_ENTITY_RESULT:
      return {
        ...state,
        entity: action.results,
      };
    default:
      return state
  }
};
