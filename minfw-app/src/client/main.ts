import {defineElement} from 'minfw';
import AppRoot from './appRoot';

const elements = [
  AppRoot
];

for (const element of elements) {
  defineElement(element);
}
