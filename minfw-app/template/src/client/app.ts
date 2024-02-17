import {defineElement, MinElement} from 'minfw';

defineElement(
  class AppRootElement extends MinElement {
    static tagName = 'app-root';
    static css = `
      main {
        min-height: 80vh;
      }
    `;

    appTitle = 'New Web App 😎';

    render() {
      return `
        <app-header title="${this.appTitle}"></app-header>
        <main>
          <p>This is an app made with minfw</p>
        </main>
        <app-footer title="${this.appTitle}"></app-footer>
      `;
    }
  }
);

export * from './header';
export * from './footer';
