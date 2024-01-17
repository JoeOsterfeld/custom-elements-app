import {AppState} from './appState';
import {createProxy} from './elementValueProxy';
import DOMPurify from 'dompurify';

export abstract class AppElement extends HTMLElement {
  static elementType = 'MiniFwAppElement';
  static tagName: string = 'app-element'
  static observedAttributes: string[] = [];
  static shadowDom = false;
  _stateListenerIds: any[] = [];
  _proxyValues: any = {};
  _hasInitialized = false;

  get innerHtmlTarget(): HTMLElement | ShadowRoot {
    return this.shadowRoot || this;
  }

  render() {
    return '';
  }

  attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
    (this as any)[name] = newValue;
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

  stateDispatch(actionName: string, ...args: any[]) {
    AppState.dispatch(actionName, ...args);
  }

  doRender() {
    if (this._hasInitialized) {
      const templateHtml = this.render();
      if (templateHtml !== this.innerHTML) {
        this.setSanitizedHTML(templateHtml);
        this.renderedCallback();
      }
    }
  }

  _initObservedAttribute(attrName: string) {
    const value: any = (this as any)[attrName];
    Object.defineProperty(this, attrName, {
      get: () => this._proxyValues[attrName] as any,
      set: (value) => {
        this._proxyValues[attrName] = createProxy(value, () => this.doRender());
        this.doRender();
      }
    });
    (this as any)[attrName] = value;
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
        ADD_ATTR: [
          // Form events
          'onblur',
          'oncontextmenu',
          'onfocus',
          'oninput',
          'oninvalid',
          'onreset',
          'onsearch',
          'onselect',
          'onsubmit',
          'onchange',
          // Keyboard events
          'onkeydown',
          'onkeypress',
          'onkeyup',
          // Mouse events
          'onclick',
          'ondblclick',
          'onmousedown',
          'onmousemove',
          'onmouseout',
          'onmouseover',
          'onmouseup',
          'onmousewheel',
          'onwheel',
          // Drag events
          'ondrag',
          'ondragend',
          'ondragenter',
          'ondragleave',
          'ondragover',
          'ondragstart',
          'ondrop',
          'onscroll',
          // Clipboard events
          'oncopy',
          'oncut',
          'onpaste',
          // Media events
          'onabort',
          'oncanplay',
          'oncanplaythrough',
          'oncuechange',
          'ondurationchange',
          'onemptied',
          'onended',
          'onerror',
          'onloadeddata',
          'onloadedmetadata',
          'onloadstart',
          'onpause',
          'onplay',
          'onplaying',
          'onprogress',
          'onratechange',
          'onseeked',
          'onseeking',
          'onstalled',
          'onsuspend',
          'ontimeupdate',
          'onvolumechange',
          'onwaiting',
          // Misc
          'ontoggle'
        ],
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: (_tagName: string) => true, // allow all tags starting with "foo-"
          attributeNameCheck: (_attr: string) => true, // allow all attributes containing "baz"
          allowCustomizedBuiltInElements: true, // allow customized built-ins
        }
      });
    }
  }
}