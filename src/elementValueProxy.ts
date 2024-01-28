// Proxy classes. "instanceof Proxy" doesn't work, so created 
// the classes below. All Proxies will return these class prototypes
class MinElementProxy { };
class MinElementProxyArray { };
// const isProxy = (obj) => obj instanceof MinElementProxy || obj instanceof MinElementProxyArray
const getProxy = (value: any, config: any) => {
  const isArray = Array.isArray(value);
  return new Proxy(
    value,
    {
      ...config,
      getPrototypeOf: () => isArray ? MinElementProxyArray.prototype : MinElementProxy.prototype
    }
  );
}

const getProxyConfig = (callback: any) => ({
  get: (target: any, propertyName: string) => {
    let targetValue = target[propertyName];
    // Array functions are just properties which are accessed via get.
    // Override mutating array properties to trigger renders
    if (Array.isArray(target) && targetValue instanceof Function) {
      if (propertyName === 'push') {
        targetValue = (...args: any[]) => {
          callback();
          return target[propertyName](...args);
        }
      }
      if (propertyName === 'splice') {
        targetValue = (...args: any[]) => {
          const endVal = (target[propertyName] as any)(...args);
          callback();
          return endVal;
        }
      }
      if (propertyName === 'fill') {
        targetValue = (...args: any[]) => {
          const endVal = (target[propertyName] as any)(...args);
          callback();
          return endVal;
        }
      }
    }
    if (typeof targetValue === 'object' && targetValue !== null) {
      return getProxy(targetValue, getProxyConfig(callback));
    }
    return targetValue;
  },
  set: (target: any, propertyName: string, newValue: any) => {
    target[propertyName] = newValue;
    callback();
    return true;
  },
  defineProperty: (target: any, property: string, attributes: any) => {
    target.defineProperty(property, attributes);
    return true;
  },
});

export const createProxy = (value: any, updateTemplateCb: () => any) => {
  if (typeof value === 'object') {
    return getProxy(value, getProxyConfig(updateTemplateCb))
  } else {
    return value;
  }
};