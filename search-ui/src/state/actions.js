import { List } from 'immutable';
import { Observable } from 'rxjs/Observable';

const API_PATH = '/data';

export const ERROR = 'ERROR'
export const SEARCH = 'SEARCH'
export const INTENT = 'INTENT'
export const ENTITY = 'ENTITY'
export const SEMANTIC = 'SEMANTIC'
export const RECEIVED_SEARCH_RESULT = 'RECEIVED_SEARCH_RESULT'
export const RECEIVED_INTENT_RESULT = 'RECEIVED_INTENT_RESULT'
export const RECEIVED_ENTITY_RESULT = 'RECEIVED_ENTITY_RESULT'
export const RECEIVED_SEMANTIC_RESULT = 'RECEIVED_SEMANTIC_RESULT'

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

export const semantic = (
  text: string,
): Object => ({
  type: SEMANTIC,
  text,
});

export const intentEpic = action$ =>
  action$.ofType(INTENT)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/intent`, { text: action.text, language: 'en' }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .flatMap(payload =>
        Observable.concat(
          Observable.of({ type: ENTITY, text: action.text, intent: payload.json }),
          Observable.of({ type: RECEIVED_INTENT_RESULT, results: payload.json }),
        ))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );

export const entityEpic = action$ =>
  action$.ofType(ENTITY)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/entity`, { text: action.text, language: 'en' }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .flatMap(payload =>
        Observable.concat(
          Observable.of({ type: SEMANTIC, text: action.text, intent: action.intent, entities: payload.json || [] }),
          Observable.of({ type: RECEIVED_ENTITY_RESULT, results: payload.json }),
        ))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );

export const semanticEpic = action$ =>
  action$.ofType(SEMANTIC)
    .switchMap(action =>
    Observable.ajax.post(`${API_PATH}/semantic`, { text: action.text, intent: action.intent, entities: action.entities, language: 'en' }, { 'Content-Type': 'application/json' })
      .map(resp => ({ json: (typeof resp.xhr.response === 'string') ? JSON.parse(resp.xhr.response) : resp.xhr.response, xhr: resp.xhr }))
      .flatMap(payload =>
        Observable.concat(
          Observable.of({ type: SEARCH, semantic: payload.json }),
          Observable.of({ type: RECEIVED_SEMANTIC_RESULT, results: payload.json }),
        ))
      .catch(ex => Observable.of({ type: ERROR, ex })),
    );

const makeSearchUrl = semantic => {
  const { filter } = semantic;
  return "/api/v1/contents?"
      + "&filter[category]=activity"
      + `&filter[words]=${encodeURIComponent((filter.tags || []).concat(filter.words || []).join(','))}`
      + `${filter.budget_more ? `&filter[budget_more]=${filter.budget_more}` : ''}`
      + `${filter.budget_less ? `&filter[budget_less]=${filter.budget_less}` : ''}`
      + `${filter.distance ? `&filter[distance]=${filter.distance}` : ''}`
      + `&page[offset]=${semantic.page.offset || 0}&page[limit]=${semantic.page.limit || 5}&sort=${semantic.sort || 'recommended'}&currency=${semantic.currency || 'JPY'}&locale=${semantic.locale || 'en'}&langs=${(semantic.langs && semantic.langs.join(',')) || 'en'}&fields[contents]=title,description,latitude,longitude,price`;
};

export const searchEpic = action$ =>
  action$.ofType(SEARCH)
    .switchMap(action => Observable.ajax.getJSON(makeSearchUrl(action.semantic)))
    .map(payload => ({ type: RECEIVED_SEARCH_RESULT, results: List(payload.data) }))
    .catch(ex => Observable.of({ type: ERROR, ex })
    );
