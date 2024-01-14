# Mini Framework

A tiny front end framework. GZipped Bundle Size: `3.0kb`.

> *For browsers that don't implement the [Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API), this package imports [DOMPurify](https://www.npmjs.com/package/dompurify) (9.1kb) over the [JSDeliver](https://www.jsdelivr.com/) CDN.

## What it is

A front end framework with all the tooling necessary to build modern web applications, without the dependencies and complex build processes. The entire framework can be imported on the browser side via the CDN, to be used on any website.

This package uses browser-native HTML custom elements to offer the same functionality as popular frameworks like
React, Vue, and Angular.

### Features

- Dynamic components which extend HTML Custom Elements, otherwise known as Web Components.
- Change detection for live template updates
- State management
- Page routing

## Getting Started

Import the package of the CDN, and create your first component:

```html
<!DOCTYPE html>
<head>
  <title>To Do List</title>
  <script src="https://www.unpkg.com/minifw@1.0.0/dist/minifw.umd.js"></script>

  <script>
    MiniFw.createElement(
        class extends MiniFw.AppElement {
            static tagName = 'grocery-list';
            items = ['Milk', 'Bread', 'Eggs', 'Apples'];

            render() {
                return `
                    <h3>Grocery List</h3>
                    <ul>
                        ${this.templateMap(this.items, (item) => `<li>${item}</li>`)}
                    </ul>
                `
            }
        }
    )
  </script>
</head>
<body>
  <grocery-list></grocery-list>
</body>
```
