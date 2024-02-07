import { MinElement } from "./minElement";

export const defineElement = (elementClass: typeof MinElement) => {
  if (!customElements.get(elementClass.tagName)) {
    window.customElements.define(elementClass.tagName, elementClass as any);
  }
}
