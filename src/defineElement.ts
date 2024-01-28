import { AppElement } from "./appElement";

export const defineElement = (elementClass: typeof AppElement) => {
  window.customElements.define(elementClass.tagName, elementClass as any);
}
