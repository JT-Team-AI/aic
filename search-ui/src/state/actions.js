import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';

const API_PATH = '/data';

export const ERROR = 'ERROR'
export const SEARCH = 'SEARCH'
export const INTENT = 'INTENT'
export const ENTITY = 'ENTITY'
export const RECEIVED_SEARCH_RESULT = 'RECEIVED_SEARCH_RESULT'
export const RECEIVED_INTENT_RESULT = 'RECEIVED_INTENT_RESULT'
export const RECEIVED_ENTITY_RESULT = 'RECEIVED_ENTITY_RESULT'

export const search = (
  text: string,
): Object => ({
  type: SEARCH,
  text,
});

export const intent = (
  text: string,
): Object => ({
  type: INTENT,
  text,
});

export const entity = (
  text: string,
): Object => ({
  type: ENTITY,
  text,
});

export const searchEpic = action$ =>
  action$.ofType(SEARCH)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/search`, { text: action.text }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .map(payload => ({ type: RECEIVED_SEARCH_RESULT, results: List(payload.json.results) }))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );

export const intentEpic = action$ =>
  action$.ofType(INTENT)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/intent`, { text: action.text, language: 'en' }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .map(payload => ({ type: RECEIVED_INTENT_RESULT, results: payload.json }))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );

export const entityEpic = action$ =>
  action$.ofType(ENTITY)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/entity`, { text: action.text, language: 'en' }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .flatMap(payload =>
        Observable.concat(
          Observable.of({ type: SEARCH, intent: payload.json }),
          Observable.of({ type: RECEIVED_ENTITY_RESULT, results: payload.json }),
        ))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );
    