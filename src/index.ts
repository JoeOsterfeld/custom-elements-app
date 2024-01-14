import { AppState } from './appState';
import { AppElement } from './appElement';
import { createElement } from './createElement';
import {Router} from './router';
import {el} from './elScope';

(window as any).el = el;

export default {
  AppElement,
  AppState,
  createElement,
  Router
}
