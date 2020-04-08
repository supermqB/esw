const pathProp = Symbol('path');
const revealProp = Symbol('reveal');

const PATH_SEPARATOR = '/';

function hasSetterGetter(obj, propName) {
  let desc = Object.getOwnPropertyDescriptor(obj, propName);
  return desc.get && desc.set && true;
}

export default class Observer {
  constructor(obj) {
    this.originalData = obj;
    this.observe(obj);
    this.listeners = {};
  }

  on(path, callback) {
    let cbs = this.listeners[path] || (this.listeners[path] = []),
        idx = cbs.push(callback) - 1;
    return {
      remove: () => cbs[idx] = null
    };
  }

  reorder() {
    this.observe(this.originalData);
  }

  getValueFromPath(path) {
    let depths = path.split(PATH_SEPARATOR),
      val = this.originalData;

    depths.some(prop => {
      prop && (val = val[prop]);
      return val == null;
    });
    return val;
  }

  observe(obj, path = '') {
    obj[pathProp] = path;
    obj[revealProp] = (callback, prop = '') => this.on(`${path}${prop && PATH_SEPARATOR + prop}`, callback);

    Object.entries(obj).forEach(([k, v]) => {
      !hasSetterGetter(obj, k) && this.defineReactive(obj, k, v);

      if (typeof v == 'object') {
        this.observe(v, obj[pathProp] + PATH_SEPARATOR + k);
      }
    });
  }

  defineReactive(obj, k, v) {
    Object.defineProperty(obj, k, {
      get: () => v,
      set: nv => {
        v = nv;

        let curPath = obj[pathProp] + PATH_SEPARATOR + k;

        if (typeof v == 'object') {
          this.observe(v, obj[pathProp] + PATH_SEPARATOR + k);
        }

        Object.entries(this.listeners).forEach(([listenerPath, cbs]) => {
          if (listenerPath.indexOf(curPath) === 0 || curPath.indexOf(listenerPath) === 0) {
            cbs.forEach(cb => {
              try {
                cb && cb(this.getValueFromPath(listenerPath), curPath, listenerPath);
              } catch (e) {
                console.error(e);
              }
            });
          }
        });
      }
    });
  }
}


export {
  revealProp as reveal,
  pathProp as path
};