import { List } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';
import { Observable } from 'rxjs/Observable';
import { intent } from './state/actions';

class SearchInput extends React.Component {
  startDictation(onChange) {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      const recognition = new webkitSpeechRecognition(); // eslint-disable-line no-undef
  
      recognition.continuous = false;
      recognition.interimResults = false;
  
      recognition.lang = "en-US";
      recognition.start();
      const img = document.querySelector('#recording_img');
      img.classList.add('recording');

      recognition.onresult = (e) => {
        const result = e.results[0][0].transcript;
        document.getElementById('sentence').value = result;
        recognition.stop();
        onChange(result);
        img.classList.remove('recording');
      };
  
      recognition.onerror = (e) => {
        recognition.stop();
        img.classList.remove('recording');
      }
    }
  }

  render() {
    const { onChange } = this.props;
    return (<div>
      <input
        className="form-control"
        id="sentence"
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
      <div><img id="recording_img" onClick={() => this.startDictation(onChange)} src="//i.imgur.com/cHidSVu.gif" /></div>
    </div>);
  }
}

const mapDispatch = (dispatch) => ({
  onChange: (text) => {
    dispatch(intent(text));
  },
});

export default connect(null, mapDispatch)(SearchInput);
