import { AppElement } from "./appElement";
import { createElement } from "./createElement";

const navigateEventName = 'MiniFw.navigate';

class RouterKlass {
  config = {}; // Route Config. TODO: Type this
  pathHistory = []; // String array of previous paths navigated to
  routeHierarchy = []; // Array of configuration of router outlets from root down.

  init(config) {
    this.config = config;
    this.navigate(window.location.pathname);
    const documentClickArgs = ['click', (event) => {
      if (event.target instanceof HTMLAnchorElement || event.target.hasAttribute('data-router-link')) {
        const href = event.target.getAttribute('href');
        let urlObj;
        try { urlObj = new URL(href) } catch { };
        if (!urlObj || urlObj.origin === location.origin) {
          event.preventDefault();
          this.navigate(href);
        }
      }
    }];
    document.addEventListener(...documentClickArgs);
    const winPopArgs = ['popstate', () => {
      this.navigate(window.location.pathname, true);
    }];
    window.addEventListener(...winPopArgs);
    window.addEventListener('beforeunload', () => {
      document.removeEventListener(...documentClickArgs);
      window.removeEventListener(...winPopArgs);
    });
  }

  navigate(path, back) {
    this.pathHistory[back ? 'pop' : 'push'](path);
    window.history[back ? 'replaceState' : 'pushState']({}, null, path);
    this.routeHierarchy = this.getHierarchy();
    document.dispatchEvent(new CustomEvent(navigateEventName, { detail: this.routeHierarchy }));
    // TODO: Add active classes to all link els.
  }

  /**
   * Gets current route hierarchy, which is an array of route configurations,
   * starting at the root router outlet, and ending with the lowest one.
   * @returns {{ path: string; tag: string; params: object }[]} From root to bottom level route parameters
   */
  getHierarchy() {
    const _getMatch = this._getMatchParams; // For keeping "this" reference
    const locationSegs = window.location.pathname.split('/');
    let hierarchy = (function deepResolve(config, parents) {
      const parentPath = parents.map(res => res.path).join('/');
      for (const [routePath, routeCfg] of (Object.entries(config.routes || {}))) {
        let composedPath = `${parentPath}${routePath}`;
        if (composedPath.length > 1) {
          composedPath = composedPath.replace(/\/$/, ''); // Strip trailing slash
        }
        const templateSegs = composedPath.split('/');
        if (typeof routeCfg === 'string' && locationSegs.length === templateSegs.length) {
          // Means there are no deeper routes and has same number of segs as URL
          const params = _getMatch(locationSegs, templateSegs);
          if (params) {
            // Means this is the total URL match
            return [
              ...parents,
              { path: composedPath, tag: routeCfg, params }
            ];
          }
        } else if (typeof routeCfg === 'object') {
          // Check if this segment matches the beginning of the URL
          const matchLocSegs = locationSegs.slice(0, templateSegs.length);
          const params = _getMatch(matchLocSegs, templateSegs);
          if (params) {
            // If matching, append a parent and recursively dig for full match
            parents.push({ path: composedPath, tag: routeCfg.tagName, params });
            return deepResolve(routeCfg, parents);
          }
        }
      }
    })(this.config, []);
    if (!hierarchy || (hierarchy && !hierarchy.length)) {
      hierarchy = [{ path: window.location.pathname, tag: this.config.notFoundTag, params: {} }];
    }
    return hierarchy;
  }

  /**
   * Checks whether the two arrays match a pattern and returns
   * any parsed parameters
   * @param {string[]} segs 
   * @param {string[]} templateSegs 
   * @returns 
   */
  _getMatchParams(segs, templateSegs) {
    const params = {};
    const escapeDots = (str) => Array.from(str, char => char === '.' ? '\\.' : char).join('');
    const match = RegExp(`^${templateSegs
      .map((str, index) => {
        if (str.startsWith(':')) {
          params[str.substring(1)] = segs[index];
          return '[^\/]+';
        } else if (str.includes('.')) {
          return escapeDots(str)
        }
        return str;
      })
      .join('\/')
      }$`).test(segs.join('/'));
    if (match) {
      return params;
    }
  }
}

createElement(
  class RouterElement extends AppElement {
    static tagName = 'router-outlet';
    static observedAttributes = ['pageTag']

    pageTag;
    params;

    get parentRouterOutlets() {
      if (this._parentRouterOutlets) {
        return this._parentRouterOutlets;
      }
      const parents = [];
      let el = this;
      while (el) {
        el = el.parentNode;
        if (el && el.tagName?.toLowerCase() === RouterElement.tagName) {
          parents.push(el);
        }
      }
      this._parentRouterOutlets = parents;
      return parents;
    }

    initializedCallback() {
      this.resolve();
      document.addEventListener(navigateEventName, () => this.resolve());
    }

    get template() {
      return this.pageTag ? `<${this.pageTag}${this._paramsString}></${this.pageTag}>` : '';
    }

    /**
     * Composes the parameters as HTML attributes in the template
     */
    get _paramsString() {
      if (!this.params || !Object.keys(this.params).length || !this.pageTag) {
        return '';
      }
      return ` ${Object.entries(this.params).map(([name, value]) => `${name}="${value}"`).join(' ')}`;
    }

    /**
     * Checks the Router class's route hierarchy to retrieve the
     * parameters for this router outlet.
     */
    resolve() {
      if (Router.routeHierarchy) {
        const currentRoute = Router.routeHierarchy[this.parentRouterOutlets.length];
        if (currentRoute) {
          this.params = currentRoute.params;
          this.pageTag = currentRoute.tag;
        }
      }
    }
  }
)

export const Router = new RouterKlass();
