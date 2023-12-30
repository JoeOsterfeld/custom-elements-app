
export const createElement = (elementClass) => {
  window.customElements.define(elementClass.tagName, elementClass);
}
