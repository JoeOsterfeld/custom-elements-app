import {AppState} from './appState';
import {createProxy} from './elementValueProxy';

export class AppElement extends HTMLElement {
  static tagName = 'app-element'
  static observedAttributes = [];
  _eventListenerParams = [];
  _stateListenerIds = [];
  _proxyValues = {};
  _renderNum = 0;

  get template() {
    return `New element: ${this.constructor.tagName}`;
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    this[name] = newValue;
  }

  connectedCallback() {
    for (const attrName of this.constructor.observedAttributes) {
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

  templateMap = (arrayValue, mapFn) => {
    return arrayValue.map(mapFn).join('');
  }

  queryListener(query, eventName, handler) {
    this.querySelectorAll(query).forEach(el => {
      this._eventListenerParams.push([el, eventName, handler]);
      el.addEventListener(eventName, handler);
    });
  }

  stateListener(selectorName, callback, ...args) {
    this._stateListenerIds.push(
      AppState.listen(selectorName, callback, ...args)
    );
  }

  stateDispatch(actionName, ...args) {
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

  _initObservedAttribute(attrName) {
    const initialVal = this[attrName];
    Object.defineProperty(this, attrName, {
      get: () => this._proxyValues[attrName],
      set: (value) => {
        this._proxyValues[attrName] = createProxy(value, () => this.updateTemplate());
        this.updateTemplate();
      }
    });
    this[attrName] = initialVal;
  }

  /**
   * Helper for setting HTML on element without XSS concerns.
   * If Sanitizer not present, imports the DomPurify pkg
   * over the CDN.
   */
  async setSanitizedHTML(html, renderNum) {
    if (!window.Sanitizer && !window.DOMPurify) {
      /**
       * Load DOMPurify package on demand when not present
       */
      window.DOMPurify = (await import("https://cdn.jsdelivr.net/npm/dompurify@3.0.6/+esm")).default;
    }
    if (renderNum !== this._renderNum) {
      // Keep track of render number so initial load doesn't get mixed with subsequent ones
      return;
    }
    if (window.Sanitizer) {
      this.setHTML(html); // TODO: Test this
    } else {
      this.innerHTML = DOMPurify.sanitize(html, {
        WHOLE_DOCUMENT: false,
        FORCE_BODY: false,
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: (_tagName) => true, // allow all tags starting with "foo-"
          attributeNameCheck: (_attr) => true, // allow all attributes containing "baz"
          allowCustomizedBuiltInElements: true, // allow customized built-ins
        }
      });
    }
  }
}