import {defineElement, MinElement} from 'minfw';

defineElement(
  class AppRootElement extends MinElement {
    static tagName = 'app-footer';
    static observedAttributes: string[] = ['title'];

    render() {
      return `<footer>${this.title} &copy; ${new Date().getFullYear()}</footer>`;
    }
  }
);
