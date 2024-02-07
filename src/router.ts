import { MinElement } from "./minElement";
import { defineElement } from "./defineElement";
import {getParentElement} from './utils';

const navigateEventName = 'Min.navigate';

export interface RouteHierarchyItem { path: string; tag: string; params: any }

export interface RouterConfig {
  tagName?: string;
  notFoundTag?: string;
  routes?: {
    [route: string]: string | RouterConfig
  }
};

/**
 * Keeping checks for whether listening here to avoid
 * duplicate listeners
 */
let isListeningToClicks = false;
let isListeningToPopstate = false;

class RouterKlass {
  config: RouterConfig = {};
  pathHistory = []; // String array of previous paths navigated to
  routeHierarchy: RouteHierarchyItem[] | undefined = []; // Array of configuration of router outlets from root down.

  documentClickHandler = (event: any) => {
    if (event.target instanceof HTMLAnchorElement || event.target.hasAttribute('data-router-link')) {
      const href = event.target.getAttribute('href');
      let urlObj;
      try { urlObj = new URL(href) } catch { };
      if (!urlObj || urlObj.origin === location.origin) {
        event.preventDefault();
        this.navigate(href);
      }
    }
  };

  popstateHandler = () => {
    this.navigate(window.location.pathname, true);
  };

  init(config: RouterConfig) {
    this.config = config;
    this.pathHistory = [];
    this.routeHierarchy = [];
    this.navigate(window.location.pathname);
    const documentClickArgs: [any, any] = ['click', this.documentClickHandler];
    if (!isListeningToClicks) {
      document.addEventListener(...documentClickArgs);
    }
    const winPopArgs: [any, any] = ['popstate', this.popstateHandler];
    if (!isListeningToPopstate) {
      window.addEventListener(...winPopArgs);
    }
    window.addEventListener('beforeunload', () => {
      document.removeEventListener(...documentClickArgs);
      window.removeEventListener(...winPopArgs);
    });
  }

  navigate(path: string, back = false) {
    this.pathHistory[back ? 'pop' : 'push'](path as never);
    window.history[back ? 'replaceState' : 'pushState']({}, '', path);
    this.routeHierarchy = this.getHierarchy();
    document.dispatchEvent(new CustomEvent(navigateEventName, { detail: this.routeHierarchy }));
    // TODO: Add active classes to all link els.
  }

  back() {
    if (this.pathHistory.length > 1) {
      this.navigate(this.pathHistory[this.pathHistory.length - 2], true);
    } else {
      window.history.back();
    }
  }

  /**
   * Gets current route hierarchy, which is an array of route configurations,
   * starting at the root router outlet, and ending with the lowest one.
   * @returns {{ path: string; tag: string; params: object }[]} From root to bottom level route parameters
   */
  getHierarchy() {
    const _getMatch = this._getMatchParams; // For keeping "this" reference
    const locationSegs = window.location.pathname.split('/');
    let hierarchy = (function deepResolve(config, parents: RouteHierarchyItem[]) {
      const parentPath = !parents.length ? '' : parents[parents.length - 1].path;
      for (const [routePath, routeCfg] of ((Object as any).entries(config.routes || {}))) {
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
            parents.push({ path: composedPath, tag: routeCfg.tagName || '', params });
            return deepResolve(routeCfg, parents);
          }
        }
      }
      // Enables not found page for nested tags
      if (config.notFoundTag) {
        return parents.concat([{
          path: window.location.pathname,
          tag: config.notFoundTag,
          params: {}
        }])
      }
    })(this.config, []);

    return hierarchy;
  }

  /**
   * Checks whether the two arrays match a pattern and returns
   * any parsed parameters. If no match, return undefined
   * @param {string[]} segs 
   * @param {string[]} templateSegs 
   * @returns {object|undefined}
   */
  _getMatchParams(segs: string[], templateSegs: string[]) {
    const params: any = {};
    const escapeDots = (str: string) => Array.from(str, char => char === '.' ? '\\.' : char).join('');
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
    return match ? params : undefined;
  }
}

defineElement(
  class RouterElement extends MinElement {
    static tagName = 'router-outlet';
    static observedAttributes: string[] = ['pageTag'];
    static routerOutletMaxDepth = 10;

    pageTag: string | undefined;
    params: any;
    _parentRouterOutlets!: HTMLElement[];

    get parentRouterOutlets() {
      if (this._parentRouterOutlets) {
        return this._parentRouterOutlets;
      }
      let parentOutlets = [];
      let el: any = getParentElement(this);
      while (el) {
        if (el.tagName === this.tagName) {
          parentOutlets.push(el);
        }
        el = getParentElement(el);
      }
      this._parentRouterOutlets = parentOutlets;
      return parentOutlets;
    }

    initializedCallback() {
      this.resolve(); 
      document.addEventListener(navigateEventName, () => {
        this.resolve()
      }); 
    }

    render() {
      return this.pageTag ? `<${this.pageTag}${this._paramsString}></${this.pageTag}>` : '';
    }

    /**
     * Composes the parameters as HTML attributes in the template
     */
    get _paramsString() {
      if (!this.params || !Object.keys(this.params).length || !this.pageTag) {
        return '';
      }
      return ` ${(Object as any).entries(this.params).map(([name, value]: [string, any]) => `${name}="${value}"`).join(' ')}`;
    }

    /**
     * Checks the Router class's route hierarchy to retrieve the
     * parameters for this router outlet.
     */
    resolve() {
      if (Router.routeHierarchy) {
        const hierarchyIndex = this.parentRouterOutlets.length;
        const currentRoute = Router.routeHierarchy[hierarchyIndex];
        if (hierarchyIndex >= RouterElement.routerOutletMaxDepth) {
          console.error(`Error: Exceeded max depth of ${RouterElement.routerOutletMaxDepth} router outlets. Skipping further router outlets.`);
        } if (currentRoute && currentRoute.tag) {
          this.params = currentRoute.params;
          this.pageTag = currentRoute.tag;
        }
      }
    }
  } 
)

export const Router = new RouterKlass();
