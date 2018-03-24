import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';

const API_PATH = 'http://localhost:8001/data';

export const ERROR = 'ERROR'
export const SEARCH = 'SEARCH'
export const RECEIVED_RESULT = 'RECEIVED_RESULT'

export const search = (
  text: string,
): Object => ({
  type: SEARCH,
  payload: { text }
});

export const searchEpic = action$ =>
  action$.ofType(SEARCH)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/search`, { text: action.text }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .map(payload => ({ type: RECEIVED_RESULT, results: List(payload.json.results) }))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );
