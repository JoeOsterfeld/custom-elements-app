import {AppState} from './appState';
import {AppElement} from './appElement';

export default {
  AppElement,
  AppState,
  createElement: (elementClass) => {
    window.customElements.define(elementClass.tagName, elementClass);
  }
}
