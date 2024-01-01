class AppStateKlass {
  _listeners: { [name: string]: [string, any] } = {};
  _state = {};
  selectors: any = {};
  actions: any = {};

  createAction(eventName: string, mutatorFn: any) {
    this.actions[eventName] = mutatorFn;
  }

  createSelector(selectorName: string, selectorFn: any) {
    if (this.selectors[selectorName]) {
      throw new Error(`AppState, createSelector: Selector name "${selectorName}" already exists`);
    }
    this.selectors[selectorName] = selectorFn;
  }

  listen(selectorName: string, callback: any, ...callbackArgs: any[]) {
    callback(this.selectors[selectorName](this._state, ...callbackArgs));
    const listenerId = this._getUniqueId();
    this._listeners[listenerId] = [selectorName, callback];
    return listenerId;
  }

  removeListener(listenerId: string) {
    if (listenerId) {
      delete this._listeners[listenerId];
    }
  }

  dispatch(actionName: string, ...args: any[]) {
    this._state = this.actions[actionName](this._state, ...args);
    for (const [selectorName, callback] of (Object as any).values(this._listeners)) {
      callback(this.selectors[selectorName](this._state));
    }
    return this._state;
  }

  _getUniqueId() {
    return "id" + Math.random().toString(16).slice(2);
  }
}

export const AppState = new AppStateKlass();
