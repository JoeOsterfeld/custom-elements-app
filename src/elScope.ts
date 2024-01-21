import { AppElement } from './appElement';

const fnHandler = {
  apply: (fn: any, _proxy: any, [event, ...otherArgs]: any[]) => {
    // Gets the next MinFw app element up the tree and call the function on it
    let appEl = event.target;
    while (appEl && appEl.constructor?.elementType !== AppElement.elementType) {
      appEl = appEl.parentElement || appEl.parentNode;
      if (appEl.host) {
        // If the parent is a shadowDom root, climb up to its host
        appEl = appEl.host;
      }
    }
    return appEl[fn()](event, ...otherArgs);
  }
};

const handler = {
  get: (_target: any, propertyName: string) => {
    const res = new Proxy(function () {
      return propertyName;
    }, fnHandler) as any;
    
    return res;
  },
};

export const el = new Proxy({}, handler);
