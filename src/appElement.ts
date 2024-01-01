import {AppState} from './appState';
import {createProxy} from './elementValueProxy';

export abstract class AppElement extends HTMLElement {
  static tagName: string = 'app-element'
  static observedAttributes: string[] = [];
  static shadowDom = false;
  _eventListenerParams: any[][] = [];
  _stateListenerIds: any[] = [];
  _proxyValues: any = {};
  _renderNum = 0;

  get innerHtmlTarget(): HTMLElement | ShadowRoot {
    return this.shadowRoot || this;
  }

  get template() {
    return '';
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    (this as any)[name] = newValue;
  }

  connectedCallback() {
    if ((this.constructor as any).shadowDom) {
      this.attachShadow({ mode: "open" });
    }
    for (const attrName of (this.constructor as any).observedAttributes) {
      this._initObservedAttribute(attrName);
    }
    this.updateTemplate();
    this.initializedCallback();
  }

  disconnectedCallback() {
    this._removeEventListeners();
    for (const id of this._stateListenerIds) {
      AppState.removeListener(id);
    }
  }

  initializedCallback() { };
  renderedCallback() { };

  templateMap = (arrayValue: any, mapFn: any) => {
    return arrayValue.map(mapFn).join('');
  }

  queryListener(query: string, eventName: string, handler: (event: Event) => any) {
    this.querySelectorAll(query).forEach(el => {
      this._eventListenerParams.push([el, eventName, handler]);
      el.addEventListener(eventName, handler);
    });
  }

  stateListener(selectorName: string, callback: any, ...args: any[]) {
    this._stateListenerIds.push(
      AppState.listen(selectorName, callback, ...args)
    );
  }

  stateDispatch(actionName: string, ...args: any[]) {
    AppState.dispatch(actionName, ...args);
  }

  async updateTemplate() {
    const templateHtml = this.template;
    if (templateHtml !== this.innerHTML) {
      this._renderNum++;
      this.setSanitizedHTML(templateHtml, this._renderNum);
      this._removeEventListeners();
      this.renderedCallback();
    }
  }

  _removeEventListeners() {
    for (const [el, eventName, handler] of this._eventListenerParams) {
      el.removeEventListener(eventName, handler);
    }
  }

  _initObservedAttribute(attrName: string) {
    const initialVal: any = (this as any)[attrName];
    Object.defineProperty(this, attrName, {
      get: () => this._proxyValues[attrName] as any,
      set: (value) => {
        this._proxyValues[attrName] = createProxy(value, () => this.updateTemplate());
        this.updateTemplate();
      }
    });
    (this as any)[attrName] = initialVal;
  }

  /**
   * Helper for setting HTML on element without XSS concerns.
   * If Sanitizer not present, imports the DomPurify pkg
   * over the CDN.
   */
  async setSanitizedHTML(html: string, renderNum: number) {
    if (!window.Sanitizer && !window.DOMPurify) {
      /**
       * Load DOMPurify package on demand when not present
       */
      window.DOMPurify = (await import('https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm' as any)).default;
    }
    if (renderNum !== this._renderNum) {
      // Keep track of render number so initial load doesn't get mixed with subsequent ones
      return;
    }
    if (window.Sanitizer) {
      (this as any).setHTML(html); // TODO: Test this
    } else {
      this.innerHtmlTarget.innerHTML = window.DOMPurify.sanitize(html, {
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
}