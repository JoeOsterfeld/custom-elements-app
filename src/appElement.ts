import {AppState} from './appState';
import {createProxy} from './elementValueProxy';
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
  _eventListenerParams: [string, string, any][] = [];
  _eventListeners: [Element, string, any][] = [];
  _lastUsedHtml: string;

  __cssTagHtml: string;

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
      const templateHtml = this._cssTagHtml + this.render();
      if (templateHtml !== this._lastUsedHtml) {
        this._lastUsedHtml = templateHtml;
        this.setSanitizedHTML(templateHtml);
        this._renderEventListeners();
        this.renderedCallback();
      }
    }
  }

  _initObservedAttribute(attrName: string) {
    const propName = this._attrNameToPropName(attrName);
    const value: any = (this as any)[propName];
    Object.defineProperty(this, propName, {
      get: () => this._proxyValues[propName] as any,
      set: (value) => {
        this._proxyValues[propName] = createProxy(value, () => this.doRender());
        this.doRender();
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
}