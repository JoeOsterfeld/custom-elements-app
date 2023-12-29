// Proxy classes. "instanceof Proxy" doesn't work, so created 
// the classes below. All Proxies will return these class prototypes
class AppElementProxy { };
class AppElementProxyArray { };
// const isProxy = (obj) => obj instanceof AppElementProxy || obj instanceof AppElementProxyArray
const getProxy = (value, config) => {
  const isArray = Array.isArray(value);
  return new Proxy(
    value,
    {
      ...config,
      getPrototypeOf: () => isArray ? AppElementProxyArray.prototype : AppElementProxy.prototype
    }
  );
}

const getProxyConfig = (updateTemplate) => ({
  get: (target, propertyName) => {
    let targetValue = target[propertyName];
    // Array functions are just properties which are accessed via get.
    // Override mutating array properties to trigger renders
    if (Array.isArray(target) && targetValue instanceof Function) {
      if (propertyName === 'push') {
        targetValue = (...args) => {
          const endVal = target[propertyName](...args.map(arg => getProxy(arg, getProxyConfig(updateTemplate))));
          updateTemplate();
          return endVal;
        }
      }
      if (propertyName === 'splice') {
        targetValue = (...args) => {
          const endVal = target[propertyName](...args);
          updateTemplate();
          return endVal;
        }
      }
      if (propertyName === 'fill') {
        targetValue = (...args) => {
          args[0] = getProxy(args[0], getProxyConfig(updateTemplate));
          const endVal = target[propertyName](...args);
          updateTemplate();
          return endVal;
        }
      }
    }
    if (typeof targetValue === 'object' && targetValue !== null) {
      return getProxy(targetValue, getProxyConfig(updateTemplate));
    }
    return targetValue;
  },
  set: (target, propertyName, newValue) => {
    target[propertyName] = newValue;
    updateTemplate();
    return true;
  },
  defineProperty: (target, property, attributes) => {
    target.defineProperty(property, attributes);
    return true;
  },
});

export const createProxy = (value, updateTemplateCb) => {
  if (typeof value === 'object') {
    return getProxy(value, getProxyConfig(updateTemplateCb))
  } else {
    return value;
  }
};