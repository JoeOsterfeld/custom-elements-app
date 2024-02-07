import { createProxy } from './elementValueProxy';
describe('elementValueProxy', () => {
  let callback: any;
  let proxy: any;
  const getInitialProxyValue = () => ({
    numPeople: 2,
    listName: 'Some people',
    firstNames: ['John', 'Jim'],
    idOne: {
      value: {
        name: {
          first: 'John',
          last: 'Smith'
        }
      }
    },
    idTwo: {
      value: {
        name: {
          first: 'Jim',
          last: 'Johnson'
        }
      }
    },
    people: [
      {
        value: {
          name: {
            first: 'John',
            last: 'Smith'
          }
        }
      },
      {
        value: {
          name: {
            first: 'Jim',
            last: 'Johnson'
          }
        }
      }
    ]
  });

  beforeEach(() => {
    callback = jest.fn();
    proxy = createProxy(getInitialProxyValue(), () => callback());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be instantiated with proxy value', () => {
    expect(JSON.parse(JSON.stringify(proxy))).toEqual(getInitialProxyValue())
  });

  it('should not initially call callback', () => {
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it('should call callback when changing property value', () => {
    proxy.numPeople = 3;
    expect(callback).toHaveBeenCalledTimes(1);
    proxy.listName = 'This list';
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should call callback when adding property value', () => {
    expect(callback).toHaveBeenCalledTimes(0);
    proxy.idThree = {};
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback when changing deeply nested property value', () => {
    expect(callback).toHaveBeenCalledTimes(0);
    proxy.idOne.value.name.first = 'Tom';
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback when changing nested array property value', () => {
    expect(callback).toHaveBeenCalledTimes(0);
    proxy.people[1].value.name.first = 'Tom';
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not duplicate callback calls', () => {
    expect(callback).toHaveBeenCalledTimes(0);
    for (let i = 3; i < 13; i++) {
      proxy.numPeople = i;
    }
    expect(callback).toHaveBeenCalledTimes(10);
  });

  describe('Array manipulation', () => {
    it('should trigger on array push', () => {
      expect(callback).toHaveBeenCalledTimes(0);
      proxy.firstNames.push('Tom');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(proxy.firstNames).toEqual(['John', 'Jim', 'Tom']);
    });

    it('should trigger on array splice', () => {
      expect(callback).toHaveBeenCalledTimes(0);
      proxy.firstNames.splice(1, 0, 'Tim');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(proxy.firstNames).toEqual(['John', 'Tim', 'Jim']);
    });

    it('should trigger on array fill', () => {
      expect(callback).toHaveBeenCalledTimes(0);
      proxy.firstNames.fill('Jeff', 0, 2);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(proxy.firstNames).toEqual(['Jeff', 'Jeff']);
    });
  });

});