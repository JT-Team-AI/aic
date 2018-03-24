import store from '../../state/store'
import immutable from 'object-path-immutable'

export default function () {
  const state = store.getState()
  const source = immutable.set(
    state.rasa.originalSource,
    'rasa_nlu_data.common_examples',
    state.rasa.examples.map(
      ({text, intent, entities}) => ({text, intent, entities})
    )
  )
  return JSON.stringify(source, null, 2)
}
