import { AppState } from './appState';
import { MinElement } from './minElement';
import { defineElement } from './defineElement';
import {Router} from './router';
import {el} from './elScope';

(window as any).el = el;

export default {
  MinElement,
  AppState,
  defineElement,
  Router
};
