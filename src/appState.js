class AppStateKlass {
  _listeners = {};
  _state = {};
  selectors = {};
  actions = {};

  createAction(eventName, mutatorFn) {
    this.actions[eventName] = mutatorFn;
  }

  createSelector(selectorName, selectorFn) {
    if (this.selectors[selectorName]) {
      throw new Error(`AppState, createSelector: Selector name "${selectorName}" already exists`);
    }
    this.selectors[selectorName] = selectorFn;
  }

  listen(selectorName, callback, ...callbackArgs) {
    callback(this.selectors[selectorName](this._state, ...callbackArgs));
    const listenerId = this._getUniqueId();
    this._listeners[listenerId] = [selectorName, callback];
    return listenerId;
  }

  removeListener(listenerId) {
    if (listenerId) {
      delete this._listeners[listenerId];
    }
  }

  dispatch(actionName, ...args) {
    this._state = this.actions[actionName](this._state, ...args);
    for (const [selectorName, callback] of Object.values(this._listeners)) {
      callback(this.selectors[selectorName](this._state));
    }
    return this._state;
  }

  _getUniqueId() {
    return "id" + Math.random().toString(16).slice(2);
  }
}

export const AppState = new AppStateKlass();
