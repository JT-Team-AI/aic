import { List } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';
import { Observable } from 'rxjs/Observable';
import { intent, entity } from './state/actions';

class SearchInput extends React.Component {
  render() {
    const { onChange } = this.props;
    return (
      <input
        className="form-control"
        aria-describedby="sizing-addon1"
        type="search"
        placeholder="Type what you want to do"
        ref={(node) => {
          if (this.subscription) {
            this.subscription.forEach(s => s.unsubscribe());
            this.subscription = undefined;
          }
          if (node) {
            const eventSource = Observable.fromEvent(node, 'keyup');
            this.subscription = [
              eventSource
                .debounce(() => Observable.timer(150))
                .map(event => event.target.value.trim())
                .filter(v => v)
                .distinctUntilChanged()
                .subscribe(onChange),
            ];
          }
          this.textInput = node;
        }}
      />
    );
  }
}

const mapDispatch = (dispatch) => ({
  onChange: (text) => {
    dispatch(intent(text));
    dispatch(entity(text));
  },
});

export default connect(null, mapDispatch)(SearchInput);
