
export class EventListenerRegistry {
  _eventAttrPrefix = 'data-on';
  _eventListenerParams: any[] = [];

  rendered(element: Element) {
    this._removeAllListeners();
    if (element.innerHTML.includes(this._eventAttrPrefix)) {
      this._registerListeners(element, element);
    }
  }

  removed() {
    this._removeAllListeners();
  }

  _registerListeners(el: Element, rootEl: Element) {
    for (const { name, value } of el.attributes) {
      if (name.startsWith(this._eventAttrPrefix) && value) {
        this._addListener(
          el,
          name.slice(this._eventAttrPrefix.length),
          (...args: any[]) => {
            const callFn = (rootEl as any)[value];
            if ((rootEl as any)[value] instanceof Function) {
              (rootEl as any)[value](...args)
            }
          }
        );
      }
    }
    for (const child of el.children) {
      this._registerListeners(child, rootEl);
    }
  }

  _addListener(el: any, eventName: string, callback: any) {
    this._eventListenerParams.push([el, eventName, callback]);
    el.addEventListener(eventName, callback);
  }

  _removeAllListeners() {
    for (const [el, eventName, callback] of this._eventListenerParams) {
      el.removeEventListener(eventName, callback);
    }
    this._eventListenerParams = [];
  }
}