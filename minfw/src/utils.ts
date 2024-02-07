
export const getParentElement = (el: any) => {
  let parent = el.parentElement || el.parentNode;
  if (parent?.host) {
    parent = parent.host;
  }
  return parent;
};
