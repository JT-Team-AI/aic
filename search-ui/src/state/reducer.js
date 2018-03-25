import { List } from 'immutable';

import {
  ERROR,
  RECEIVED_INTENT_RESULT,
  RECEIVED_ENTITY_RESULT,
  RECEIVED_SEMANTIC_RESULT,
  RECEIVED_SEARCH_RESULT,
} from './actions'

export default function reducer (state: Object = {}, action: Object): Object {
  switch (action.type) {
    case ERROR:
      // TODO
      console.log('Error', action);
      return state;
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
    case RECEIVED_SEMANTIC_RESULT:
      return {
        ...state,
        semantic: action.results,
      };
    case RECEIVED_SEARCH_RESULT:
      if (state.intent && state.intent.top_intent === 'clear_search') {
        return {
          intent: state.intent,
          entity: [],
          semantic: [],
          results: [],
        };
      }
      return {
        ...state,
        results: action.results,
      };
    default:
      return state
  }
};
