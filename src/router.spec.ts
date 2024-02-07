import { defineElement } from './defineElement';
import { MinElement } from './minElement';
import { Router } from './router';

const ogLocation = window.location;

describe('Router', () => {
  const routeConfig = {
    notFoundTag: 'not-found-page',
    routes: {
      '/': 'default-sample-page-el',
      '/first': 'first-sample-page-el',
      '/second': 'second-sample-page-el',
      '/third': 'third-sample-page-el',
      '/this/is/a/variable/:name/with/another/one/:second-name': 'complex-path-el',
      '/nested': {
        tagName: 'nested-element',
        routes: {
          '/path': {
            tagName: 'nested-element',
            routes: {
              '/that': {
                tagName: 'nested-element',
                notFoundTag: 'nested-not-found-page',
                routes: {
                  '/that': {
                    tagName: 'nested-element',
                    routes: {
                      '/is': {
                        tagName: 'nested-element',
                        routes: {
                          '/deep': 'nested-element',
                          '/:name/:second-name': 'complex-path-el'
                        }
                      }
                    }
                  }
                }
              },
              '/:name': {
                tagName: 'nested-element',
                routes: {
                  '/that': {
                    tagName: 'nested-element',
                    routes: {
                      '/is': {
                        tagName: 'nested-element',
                        routes: {
                          '/:second-name': 'complex-path-el'
                        }
                      }
                    }
                  }
                }
              },
            }
          }
        }
      }
    }
  };
  const els = [
    class extends MinElement {
      static tagName = 'root-min-el';

      render() {
        return `<h1>
          Mock App with Routing
        </h1>
        <main>
          <router-outlet></router-outlet>
        </main>
        `
      }
    },
    class extends MinElement {
      static tagName = 'not-found-page';

      render() {
        return `<h1>
          404: Not Found
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'nested-not-found-page';

      render() {
        return `<h1>
          404: Nested Not Found
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'default-sample-page-el';

      render() {
        return `<h1>
          Default Sample Page!
        </h1>
        ${['/first', '/second', '/third', 'https://example.com'].map(name => `
          <a class="${name.substring(1)}" href="${name}">${name}</a>
          <button class="${name.substring(1)}" data-router-link href="${name}">${name}</button>
        `)}
        `
      }
    },
    class extends MinElement {
      static tagName = 'first-sample-page-el';

      render() {
        return `<h1>
          First Sample Page!
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'second-sample-page-el';

      render() {
        return `<h1>
          Second Sample Page!
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'third-sample-page-el';

      render() {
        return `<h1>
          Third Sample Page!
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'complex-path-el';
      static observedAttributes = ['name', 'second-name'];

      name = '';
      secondName = '';

      render() {
        return `<h1>
          Name: ${this.name}<br>
          Second Name: ${this.secondName}
        </h1>
        `
      }
    },
    class extends MinElement {
      static tagName = 'nested-element';

      render() {
        return `<h1>Nested Element!</h1>
        <router-outlet></router-outlet>`
      }
    },
  ];

  // Gets deepest level router outlet's first child
  const getPageEl = () => {
    const outlets = Array.from(document.querySelectorAll('router-outlet'));
    return (outlets[outlets.length - 1]?.firstChild as any);
  }
  const getPageTag = () => {
    return getPageEl()?.tagName?.toLowerCase();
  }

  const initAtRoute = async (route: string = '/') => {
    delete (window as any).location;
    (window as any).location = new URL(`https://example.com${route}`);
    Router.init(routeConfig);
    const el = document.createElement('root-min-el');
    document.body.appendChild(el);
  };

  beforeAll(() => {
    for (const el of els) {
      defineElement(el);
    }
  });

  const resetRouter = () => {
    // Reset mocks and router configuration
    jest.resetAllMocks();
    (window as any).location = ogLocation;
    window.dispatchEvent(new CustomEvent('beforeunload'));
  };

  afterEach(() => {
    resetRouter();
  });

  it('removes event listeners on beforeunload', () => {
    Router.init(routeConfig);
    const el = document.createElement('root-min-el');
    document.body.appendChild(el);
    Router.navigate('/');
    const windowSpy = jest.spyOn(window, 'removeEventListener');
    const docSpy = jest.spyOn(document, 'removeEventListener');
    window.dispatchEvent(new CustomEvent('beforeunload'));
    expect(windowSpy).toHaveBeenCalledTimes(1);
    expect(windowSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(docSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });

  describe('initial page load resolution', () => {

    it('should create page element', () => {
      initAtRoute();
      expect(document.body.firstChild).toBeTruthy();
      expect((document.body.firstChild as any)?.tagName).toBe('root-min-el'.toUpperCase());
    });

    it('should render default route element', () => {
      initAtRoute();
      const firstOutlet = document.querySelector('router-outlet');
      expect((firstOutlet?.firstChild as any)?.tagName).toBe('default-sample-page-el'.toUpperCase());
    });

    it('should render default route element', () => {
      initAtRoute();
      const firstOutlet = document.querySelector('router-outlet');
      expect((firstOutlet?.firstChild as any)?.tagName).toBe('default-sample-page-el'.toUpperCase());
    });

    it.each([
      ['first'], ['second'], ['third']
    ])('should render %s route element', (name) => {
      initAtRoute(`/${name}`);
      const firstOutlet = document.querySelector('router-outlet');
      expect((firstOutlet?.firstChild as any)?.tagName).toBe(`${name}-sample-page-el`.toUpperCase());
    });

    it('should render complex route with variables', () => {
      const [name, secondName] = ['John', 'Smith'];
      initAtRoute(`/this/is/a/variable/${name}/with/another/one/${secondName}`);
      const firstOutlet = document.querySelector('router-outlet');
      const pageEl = (firstOutlet?.firstChild as any) as MinElement;
      expect(pageEl?.tagName).toBe('complex-path-el'.toUpperCase());
      expect(pageEl.textContent).toContain(`Name: ${name}`);
      expect(pageEl.textContent).toContain(`Second Name: ${secondName}`);
    });

    it('should handle deep nested path', async () => {
      initAtRoute('/nested/path/that/that/is/deep');
      const outlets = Array.from(document.querySelectorAll('router-outlet'));
      expect(outlets).toHaveLength(7);
    });

    it('should handle deep nested path with path variables', async () => {
      const [name, secondName] = ['Steve', 'Jobs'];
      initAtRoute(`/nested/path/${name}/that/is/${secondName}`);
      const outlets = Array.from(document.querySelectorAll('router-outlet'));
      expect(outlets).toHaveLength(6);
      const pageEl = document.querySelector('complex-path-el') as MinElement;
      expect(pageEl).toBeTruthy();
      expect(pageEl.textContent).toContain(`Name: ${name}`);
      expect(pageEl.textContent).toContain(`Second Name: ${secondName}`);
    });

    it('should handle deep nested path with deeper path variables', async () => {
      const [name, secondName] = ['Steve', 'Jobs'];
      initAtRoute(`/nested/path/that/that/is/${name}/${secondName}`);
      const outlets = Array.from(document.querySelectorAll('router-outlet'));
      expect(outlets).toHaveLength(6);
      const pageEl = document.querySelector('complex-path-el') as MinElement;
      expect(pageEl).toBeTruthy();
      expect(pageEl.textContent).toContain(`Name: ${name}`);
      expect(pageEl.textContent).toContain(`Second Name: ${secondName}`);
    });

    it('should render not found page for invalid URL', () => {
      initAtRoute('/invalid-route/path');
      const pageEl = document.querySelector(routeConfig.notFoundTag);
      expect(pageEl).toBeTruthy();
    });

    it('should render nested not found page for invalid nested URL', () => {
      initAtRoute('/nested/path/that/foo');
      const pageEl = document.querySelector('nested-not-found-page');
      expect(pageEl).toBeTruthy();
    });
  });

  describe('navigation', () => {

    beforeEach(() => {
      Router.init(routeConfig);
      const el = document.createElement('root-min-el');
      document.body.appendChild(el);
      Router.navigate('/');
    });

    it('navigates to other pages', () => {
      // Verify initial state
      expect(window.location.pathname).toBe('/');
      expect(getPageTag()).toBe('default-sample-page-el');

      // Navigates to first page
      Router.navigate('/first');
      expect(window.location.pathname).toBe('/first');
      expect(getPageTag()).toBe('first-sample-page-el');

      // Navigates to second page
      Router.navigate('/second');
      expect(window.location.pathname).toBe('/second');
      expect(getPageTag()).toBe('second-sample-page-el');

      // Navigates to third page
      Router.navigate('/third');
      expect(window.location.pathname).toBe('/third');
      expect(getPageTag()).toBe('third-sample-page-el');

      // Navigates to complex path
      const complexPath = '/this/is/a/variable/foo/with/another/one/bar';
      Router.navigate(complexPath);
      expect(window.location.pathname).toBe(complexPath);
      expect(getPageTag()).toBe('complex-path-el');

      // Navigates to not found page
      Router.navigate('/nonexistent');
      expect(window.location.pathname).toBe('/nonexistent');
      expect(getPageTag()).toBe('not-found-page');

      // Navigates to first page
      Router.navigate('/first');
      expect(window.location.pathname).toBe('/first');
      expect(getPageTag()).toBe('first-sample-page-el');

      // Navigates to nested not found page
      const nestedNotFoundPath = '/nested/path/that/foo';
      Router.navigate(nestedNotFoundPath);
      expect(window.location.pathname).toBe(nestedNotFoundPath);
      expect(getPageTag()).toBe('nested-not-found-page');
    });

    it('navigate back works', async () => {
      // Verify initial state
      expect(window.location.pathname).toBe('/');
      expect(getPageTag()).toBe('default-sample-page-el');

      // Navigates to first page
      Router.navigate('/first');
      expect(window.location.pathname).toBe('/first');
      expect(getPageTag()).toBe('first-sample-page-el');

      // Navigates to second page
      Router.navigate('/second');
      expect(window.location.pathname).toBe('/second');
      expect(getPageTag()).toBe('second-sample-page-el');

      Router.back();
      expect(window.location.pathname).toBe('/first');
      expect(getPageTag()).toBe('first-sample-page-el');

      Router.back();
      expect(window.location.pathname).toBe('/');
      expect(getPageTag()).toBe('default-sample-page-el');
    });

  });

  describe('link clicks', () => {
    let navSpy: jest.SpyInstance<any>;

    beforeEach(async () => {
      initAtRoute('/');
      await new Promise(process.nextTick);
      navSpy = jest.spyOn(Router, 'navigate');
    });

    it('clicking local anchor tag calls navigate', async () => {
      const anchor = document.querySelector('a.first') as HTMLAnchorElement;
      anchor.click();
      await new Promise(process.nextTick);
      expect(navSpy).toHaveBeenCalledTimes(1);
      expect(navSpy).toHaveBeenCalledWith('/first');
    });

    // it('clicking button tag with proper attributes calls navigate', async () => {
    //   Router.navigate('/');
    //   await new Promise(process.nextTick);
    //   const button = document.querySelector('button.first') as HTMLAnchorElement;
    //   button.click();
    //   await new Promise(process.nextTick);
    //   expect(navSpy).toHaveBeenCalledTimes(1);
    //   expect(navSpy).toHaveBeenCalledWith('/first');
    // });

    // it.each([
    //   ['first'], ['second'], ['third']
    // ])('%s: button with attr and href click calls navigate', async (name: string) => {
    //   const anchor = document.querySelector(`button[data-router-link].${name}`) as HTMLButtonElement;
    //   anchor.click();
    //   await new Promise(process.nextTick);
    //   expect(navSpy).toHaveBeenCalledTimes(1);
    //   expect(navSpy).toHaveBeenCalledWith(`/${name}`);
    // });
  });

});
