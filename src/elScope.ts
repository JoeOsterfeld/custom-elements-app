import { AppElement } from './appElement';

const fnHandler = {
  apply: (fn: any, _proxy: any, [event, ...otherArgs]: any[]) => {
    // Gets the next MiniFw app element up the tree and call the function on it
    let appEl = event.target;
    while (appEl && appEl.constructor?.elementType !== AppElement.elementType) {
      appEl = appEl.parentElement;
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
