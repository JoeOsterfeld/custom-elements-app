import {defineElement, MinElement} from 'minfw';

defineElement(
  class AppRootElement extends MinElement {
    static tagName = 'app-header';
    static observedAttributes: string[] = ['title'];

    render() {
      return `
        <header>${this.title}</header>
      `;
    }
  }
);
