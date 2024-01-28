import { MinElement } from "./minElement";

export const defineElement = (elementClass: typeof MinElement) => {
  window.customElements.define(elementClass.tagName, elementClass as any);
}
