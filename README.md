# Min Framework

A tiny front end framework. GZipped Bundle Size: `10.7kb`.

## What it is

A front end framework with all the tooling necessary to build modern web applications, without the dependencies and complex build processes. The entire framework
evaluates at runtime. This means it can be imported on the browser side via the CDN, to be used on any website.

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
  <script src="https://www.unpkg.com/minfw@1.0.0/dist/minfw.umd.js"></script>

  <script>
    Min.defineElement(
        class extends Min.MinElement {
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

# TODO:

- Router tests
- Add Services
- Create setup for building project without CDN method
- Deferred server components
  - Universal HTTP service
