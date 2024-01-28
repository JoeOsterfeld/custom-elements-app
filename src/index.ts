import { AppState } from './appState';
import { AppElement } from './appElement';
import { defineElement } from './defineElement';
import {Router} from './router';
import {el} from './elScope';

(window as any).el = el;

export default {
  AppElement,
  AppState,
  defineElement,
  Router
};
