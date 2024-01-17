# Mini Framework

A tiny front end framework. GZipped Bundle Size: `10.8kb`.

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
