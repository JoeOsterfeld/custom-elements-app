class AppStateKlass {
  _listeners: { [name: string]: [string, any, any[]] } = {};
  _state: any = {};
  _selectors: any = {};
  _actions: any = {};

  initialize(initialState: any = {}) {
    this._listeners = {};
    this._selectors = {};
    this._actions = {};
    this._state = initialState;
  }

  getState() {
    return {...this._state};
  }

  createAction(eventName: string, mutatorFn: any) {
    this._actions[eventName] = mutatorFn;
  }

  createSelector(selectorName: string, selectorFn: any) {
    if (this._selectors[selectorName]) {
      throw new Error(`AppState, createSelector: Selector name "${selectorName}" already exists`);
    }
    this._selectors[selectorName] = selectorFn;
  }

  listen(selectorName: string, callback: any, ...selectorArgs: any[]) {
    callback(this._selectors[selectorName](this._state, ...selectorArgs));
    const listenerId = this._getUniqueId();
    this._listeners[listenerId] = [selectorName, callback, selectorArgs];
    return listenerId;
  }

  select(selectorName: string, ...selectorArgs: any[]) {
    return this._selectors[selectorName](this._state, ...selectorArgs);
  }

  removeListener(listenerId: string) {
    if (listenerId) {
      delete this._listeners[listenerId];
    }
  }

  dispatch(actionName: string, ...args: any[]) {
    this._state = this._actions[actionName](this._state, ...args);
    for (const [selectorName, callback, additionalArgs] of (Object as any).values(this._listeners)) {
      callback(this._selectors[selectorName](this._state, ...additionalArgs));
    }
    return this._state;
  }

  _getUniqueId() {
    return "id" + Math.random().toString(16).slice(2);
  }
}

export const AppState = new AppStateKlass();
