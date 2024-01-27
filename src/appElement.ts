import {AppState} from './appState';
import {createProxy} from './elementValueProxy';
import { getParentElement } from './utils';
import DOMPurify from 'dompurify';

export abstract class AppElement extends HTMLElement {
  static elementType = 'MinFwAppElement';
  static tagName: string = 'app-element'
  static observedAttributes: string[] = [];
  static shadowDom = false;
  static css = '';
  _stateListenerIds: any[] = [];
  _proxyValues: any = {};
  _hasInitialized = false;
  _isRefreshingDataProps = false;
  _eventListenerParams: [string, string, any][] = [];
  _eventListeners: [Element, string, any][] = [];

  __cssTagHtml: string;
  __parentScope: AppElement;

  get innerHtmlTarget(): HTMLElement | ShadowRoot {
    return this.shadowRoot || this;
  }

  get _cssTagHtml() {
    if (this.__cssTagHtml) {
      return this.__cssTagHtml
    }
    let css = '';
    if ((this.constructor as any).css) {
      css = `<style>${(this.constructor as any).css}</style>`;
    }
    this.__cssTagHtml = css;
    return this.__cssTagHtml;
  }

  render() {
    return '';
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    const propName = this._attrNameToPropName(name);
    (this as any)[propName] = newValue;
  }

  connectedCallback() {
    if ((this.constructor as any).shadowDom) {
      this.attachShadow({ mode: 'open' });
    }
    for (const attrName of (this.constructor as any).observedAttributes) {
      this._initObservedAttribute(attrName);
    }
    this._hasInitialized = true;
    this.doRender();
    this.initializedCallback();
  }

  disconnectedCallback() {
    this._removeRegisteredListeners();
    for (const id of this._stateListenerIds) {
      AppState.removeListener(id);
    }
  }

  initializedCallback() { };
  renderedCallback() { };

  templateMap = (arrayValue: any, mapFn: any) => {
    return arrayValue.map(mapFn).join('');
  }

  stateListener(selectorName: string, callback: any, ...args: any[]) {
    this._stateListenerIds.push(
      AppState.listen(selectorName, callback, ...args)
    );
  }

  eventListener(querySelector: string, eventName: string, handler: (event: Event) => void) {
    this._eventListenerParams.push([querySelector, eventName, handler]);
  }

  stateDispatch(actionName: string, ...args: any[]) {
    AppState.dispatch(actionName, ...args);
  }

  doRender() {
    if (this._hasInitialized) {
      this._refreshDataProps();
      const templateHtml = this._cssTagHtml + this.render();
      this.setSanitizedHTML(templateHtml);
      this._renderEventListeners();
      this.renderedCallback();
    }
  }

  _initObservedAttribute(attrName: string) {
    const propName = this._attrNameToPropName(attrName);
    const value: any = (this as any)[propName];
    Object.defineProperty(this, propName, {
      get: () => this._proxyValues[propName] as any,
      set: (value) => {
        this._proxyValues[propName] = createProxy(value, () => this.doRender());
        if (!this._isRefreshingDataProps) {
          // If not setting data props pre-render, trigger render
          this.doRender();
        }
      }
    });
    (this as any)[propName] = value;
  }

  // Update event listeners after render
  _renderEventListeners() {
    this._removeRegisteredListeners();
    // Add latest listeners
    for (const [selector, eventName, handler] of this._eventListenerParams) {
      this.innerHtmlTarget.querySelectorAll(selector).forEach(el => {
        const args: [string, any] = [eventName, handler];
        this._eventListeners.push([el, ...args]);
        el.addEventListener(...args);
      });
    }
  }

  // Remove registered event listeners
  _removeRegisteredListeners() {
    for (const [el, eventName, handler] of this._eventListeners) {
      el.removeEventListener(eventName, handler);
    }
    this._eventListeners = [];
  }

  /**
   * Helper for setting HTML on element without XSS concerns.
   * If Sanitizer not present, imports the DomPurify pkg
   * over the CDN.
   */
  setSanitizedHTML(html: string) {
    if (window.Sanitizer) {
      (this as any).setHTML(html); // TODO: Test this
    } else {
      this.innerHtmlTarget.innerHTML = DOMPurify.sanitize(html, {
        WHOLE_DOCUMENT: true, // Important. Workaround for this: https://github.com/cure53/DOMPurify/issues/37
        FORCE_BODY: false,
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: (_tagName: string) => true, // allow all tags starting with "foo-"
          attributeNameCheck: (_attr: string) => true, // allow all attributes containing "baz"
          allowCustomizedBuiltInElements: true, // allow customized built-ins
        }
      });
    }
  }
  
  /**
   * Convert attribute names to camelcase for use on element
   * @param {string} attrName - attribute name
   * @returns {string}
   */
  _attrNameToPropName(attrName: string) {
    if (!attrName.includes('-')) {
      return attrName;
    }
    return attrName.replace(/-./g, x=>x[1].toUpperCase())
  }

  /**
   * Retrieve a value from the parent property for data values
   * @param propertyName
   * @returns
   */
  _getParentScopeValue(propertyName: string): any {
    if (!this.__parentScope) {
      let appEl: any = getParentElement(this);
      while (appEl && (appEl.constructor as any)?.elementType !== AppElement.elementType) {
        appEl = getParentElement(appEl);
      }
      this.__parentScope = appEl;
    }
    
    return (this.__parentScope as any)[propertyName];
  }

  /**
   * Updates the props saved as dataset attributes
   */
  _refreshDataProps() {
    this._isRefreshingDataProps = true;
    for (const [key, value] of Object.entries(this.dataset)) {
      if (typeof value === 'string') {
        const parentValue = this._getParentScopeValue(value);
        if (parentValue || parentValue === 0) {
          (this as any)[key] = parentValue;
        }
      }
    }
    this._isRefreshingDataProps = false;
  }
}