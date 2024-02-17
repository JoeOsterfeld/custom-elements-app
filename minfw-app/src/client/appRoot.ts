import { MinElement } from "minfw";

export default class extends MinElement {
  static tagName = 'app-root';
  static observedAttributes = ['res-json'];

  resJson: any;

  async onInit() {
    const res = await fetch('/api/hello');
    const json = await res.json();
    this.resJson = JSON.stringify(json);
    console.log('Emitting event');
    window.dispatchEvent(new CustomEvent('minfwRendered'));
  }

  render() {
    if (!this.resJson) {
      return 'SPINNER';
    }

    return `
      <h1>This is an app!! Woohoo</h1>
      <pre>${this.resJson}</pre>
    `;
  }
}
