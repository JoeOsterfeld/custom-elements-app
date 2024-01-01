import { AppElement } from "./appElement";

export const createElement = (elementClass: typeof AppElement) => {
  window.customElements.define(elementClass.tagName, elementClass as any);
}
