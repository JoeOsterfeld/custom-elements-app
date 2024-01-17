import { AppState } from "./appState";
describe('AppState', () => {
  const initialState = {
    names: [
      { first: 'Jon', last: 'Smith' },
      { first: 'Jim', last: 'Jones' },
      { first: 'Mike', last: 'Johnson' },
      { first: 'Steve', last: 'Jobs' }
    ]
  };
  const firstNameSelectorName = 'getByFirstName';
  const initializeWithFirstNameSelector = () => {
    AppState.initialize(initialState);
    AppState.createSelector(firstNameSelectorName, (state: any, firstName: string) => {
      return state.names.find((name: any) => name.first === firstName);
    });
  };

  afterEach(() => {
    AppState.initialize({});
  });

  it('should be defined', () => {
    expect(AppState).toBeTruthy();
  });

  it('should create valid action', () => {
    const actionName = 'addName'
    AppState.createAction(actionName, (state: any, first: string, last: string) => {
      state.names = state.names || [];
      state.names.push({first, last})
      return state;
    });
    AppState.dispatch(actionName, 'John', 'Smith');
    expect(AppState.getState().names).toEqual([{first: 'John', last: 'Smith'}]);
    AppState.dispatch(actionName, 'Jim', 'Steve');
    expect(AppState.getState().names).toEqual([
      {first: 'John', last: 'Smith'},
      {first: 'Jim', last: 'Steve'}
    ]);
  });

  it('should create a selector and select value', () => {
    initializeWithFirstNameSelector();
    expect(AppState.select(firstNameSelectorName, 'Jon')).toEqual(AppState.getState().names[0]);
  });

  it('should create a selector and select value with listen', () => {
    initializeWithFirstNameSelector();
    const actionName = 'addName';
    AppState.createAction(actionName, (state: any, first: string, last: string) => {
      state.names = state.names || [];
      state.names.push({ first, last })
      return state;
    });
    const selectorCallback = jest.fn();
    AppState.listen(firstNameSelectorName, selectorCallback, 'Larry');
    AppState.dispatch(actionName, 'Larry', 'Page');
    expect(selectorCallback).toHaveBeenCalledTimes(2);
    expect(selectorCallback).toHaveBeenCalledWith(undefined);
    expect(selectorCallback).toHaveBeenCalledWith({first: 'Larry', last: 'Page'});
  });

  it('should create and remove listener', () => {
    initializeWithFirstNameSelector();
    const actionName = 'addName';
    AppState.createAction(actionName, (state: any, first: string, last: string) => {
      state.names = state.names || [];
      state.names.push({ first, last })
      return state;
    });
    const selectorCallback = jest.fn();
    const listenerId = AppState.listen(firstNameSelectorName, selectorCallback, 'Larry');
    AppState.dispatch(actionName, 'Larry', 'Page');
    expect(selectorCallback).toHaveBeenCalledTimes(2);
    expect(listenerId).toBeTruthy();
    AppState.removeListener(listenerId);
    AppState.dispatch(actionName, 'Sergey', 'Brin');
    AppState.dispatch(actionName, 'Steve', 'Wozniak');
    // Since listener was removed, no more calls
    expect(selectorCallback).toHaveBeenCalledTimes(2);
  });
});
