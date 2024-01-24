import { AppElement } from './appElement';
import { createElement } from './createElement';
describe('AppElement', () => {
  const appendEl = (elClass: any) => {
    const el = document.createElement(elClass.tagName);
    document.body.appendChild(el);
    return el;
  }
  class SimpleElClass extends AppElement {
    static tagName = 'simple-el';

    render() {
      return `<p>This is a simple element</p>`
    }
  };
  class ShadowElClass extends AppElement {
    static tagName = 'shadow-el';
    static shadowDom = true;

    render() {
      return `<p>This is a simple shadow dom element</p>`
    }
  };
  class AttrsElClass extends AppElement {
    static observedAttributes: string[] = ['first', 'last'];
    static tagName = 'attrs-el-class';

    first: string = '';
    last: string = '';

    render() {
      return `<p>Name:</p><p>${this.first} ${this.last}</p>`;
    }
  };
  class GroceryListClass extends AppElement {
    static observedAttributes: string[] = ['items', 'store-name'];
    static tagName = 'grocery-list';
    items = ['Milk', 'Bread', 'Eggs', 'Apples'].map(name => ({
      name,
      complete: false
    }));

    render() {
      return `<h3>Grocery List</h3>
            <ul>
              ${this.templateMap(this.items, (item: any) => `<li>
                ${item.name} ${item.complete ? 'COMPLETE' : ''}
              </li>`)}
            </ul>`;
    }
  }
  const elClasses = [SimpleElClass, AttrsElClass, GroceryListClass, ShadowElClass];

  beforeAll(() => {
    for (const klass of elClasses) {
      createElement(klass);
    }
  });

  it('should be defined', () => {
    expect(AppElement).toBeTruthy();
  });

  it('should create element', () => {
    const el = appendEl(SimpleElClass);
    expect(el).toBeTruthy();
  });

  it('should convert attr names to prop names', () => {
    const el = appendEl(GroceryListClass);
    el.setAttribute('store-name', 'Kroger');
    expect(el.storeName).toBeTruthy();
    expect(el.storeName).toBe('Kroger');
  });

  it('should render', () => {
    appendEl(SimpleElClass);
    const instance = document.body.firstChild as HTMLElement;
    expect(instance).toBeInstanceOf(SimpleElClass);
    expect(instance.innerHTML).toBe('<p>This is a simple element</p>');
  });

  it('should use callbacks', () => {
    const el = document.createElement(SimpleElClass.tagName) as AppElement;
    const initializedCbSpy = jest.spyOn(el, 'initializedCallback');
    const renderSpy = jest.spyOn(el, 'render');
    const renderedCbSpy = jest.spyOn(el, 'renderedCallback');
    document.body.appendChild(el);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(initializedCbSpy).toHaveBeenCalledTimes(1);
    expect(renderedCbSpy).toHaveBeenCalledTimes(1);
  });

  it('should render on observed attribute change', () => {
    const el = document.createElement(AttrsElClass.tagName) as AppElement;
    const renderSpy = jest.spyOn(el, 'render');
    document.body.appendChild(el);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    el.setAttribute('first', 'John');
    expect(renderSpy).toHaveBeenCalledTimes(2);
    el.setAttribute('last', 'Smith');
    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(el.innerHTML).toBe(`<p>Name:</p><p>John Smith</p>`);
  });

  it('should render on observed property change', () => {
    const el = document.createElement(AttrsElClass.tagName) as AttrsElClass;
    const renderSpy = jest.spyOn(el, 'render');
    document.body.appendChild(el);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    el.first = 'John';
    expect(renderSpy).toHaveBeenCalledTimes(2);
    el.last = 'Smith'
    expect(renderSpy).toHaveBeenCalledTimes(3);
    expect(el.innerHTML).toBe(`<p>Name:</p><p>John Smith</p>`);
  });

  it('should render on converted attr name change', () => {
    const el = appendEl(GroceryListClass);
    const renderSpy = jest.spyOn(el, 'render');
    el.setAttribute('store-name', 'Foo');
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should render on complex observed attribute change', () => {
    const el = document.createElement(GroceryListClass.tagName) as GroceryListClass;
    const getLiEls = () => Array.from(el.querySelectorAll('li'));
    const completeText = 'COMPLETE';
    const renderSpy = jest.spyOn(el, 'render');
    document.body.appendChild(el);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(getLiEls()).toHaveLength(4);
    expect(el.innerHTML).not.toContain(completeText);
    el.items[1].complete = true;
    expect(renderSpy).toHaveBeenCalledTimes(2);
    expect(el.innerHTML).toContain(completeText);
    expect(getLiEls()[0].innerHTML).not.toContain(completeText);
    expect(getLiEls()[1].innerHTML).toContain(completeText);
    expect(getLiEls()[2].innerHTML).not.toContain(completeText);
    expect(getLiEls()[3].innerHTML).not.toContain(completeText);
  });

  it('should render in parallel with complex attr changes', () => {
    const el = document.createElement(GroceryListClass.tagName) as GroceryListClass;
    const renderSpy = jest.spyOn(el, 'render');
    document.body.appendChild(el);
    expect(renderSpy).toHaveBeenCalledTimes(1);
    for (let i = 0; i < 4; i++) {
      el.items[i].complete = true;
    }
    expect(renderSpy).toHaveBeenCalledTimes(5);
  });

  it('should create element with shadow dom', () => {
    const el = appendEl(ShadowElClass);
    expect(el).toBeTruthy();
    expect(el.innerHTML).toBeFalsy();
    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot.innerHTML).toBe('<p>This is a simple shadow dom element</p>');
  });

});