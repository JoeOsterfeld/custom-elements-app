// Sets all items
Min.AppState.createAction('setItems', (state, items) => {
  return {
    ...state,
    items
  };
});

// Sets a single item using its index
Min.AppState.createAction('setItem', (state, index, item) => {
  const items = [...state.items];
  items[index] = item;
  return {
    ...state,
    items
  };
});

// Appends a new item to this list
Min.AppState.createAction('addItem', (state, item) => {
  return {
    ...state,
    items: state.items.concat([item])
  };
});

// Removes and item
Min.AppState.createAction('removeItem', (state, index) => {
  const items = [...state.items]
  items.splice(index, 1)
  return {
    ...state,
    items
  };
});

// Get all items
Min.AppState.createSelector('items', (state) => state.items || []);
// Get a single item by its index
Min.AppState.createSelector('item', (state, itemIndex) => (state.items || [])[itemIndex]);

// Dispatch the initial database state
Min.AppState.dispatch('setItems', 'Milk Bread Eggs Apples Oranges'.split(' ').map(name => ({
  name, completed: false, store: { name: 'Kroger' }
})));

Min.Router.init({
  routes: {
    '/': 'todo-list',
    '/calendar': 'calendar-page',
    '/shadow': 'shadow-dom-page',
    '/calendar/:name': {
      tagName: 'calendar-page',
      routes: {
        '/': '',
        '/:day': 'calendar-day'
      }
    },
  },
  notFoundTag: 'not-found-page'
});

const pageTitleChangeEventName = 'pagetitlechange';
const dispatchPageTitleEv = (el, title) => {
  el.dispatchEvent(new CustomEvent(pageTitleChangeEventName, {detail: title, bubbles: true}));
}

Min.createElement(
  class MainAppElement extends Min.AppElement {
    static tagName = 'app-element'
    static observedAttributes = ['title'];
    title = '';

    pageTitleChangeListener = this.eventListener('router-outlet', pageTitleChangeEventName, (event) => {
      this.title = event.detail;
    });

    render() {
      return `
        <h1>${this.title}</h1>
        <style>
          a, button {
            margin: 6px;
            display: inline-block;
            box-sizing: border-box;
          }
        </style>
        <a href="/">To Do List</a>
        <a href="/calendar">Calendar</a>
        <a href="https://google.com">Google</a>
        <button data-router-link href="/">To Do list</button>
        <a href="/calendar/krista">Krista's Calendar</a>
        <a href="/calendar/joe/monday">Joe's Monday Calendar</a>
        <a href="/shadow">Shadow</a>

        <router-outlet></router-outlet>
      `;
    }
  }
);

Min.createElement(
  class extends Min.AppElement {
    static tagName = 'calendar-page'
    static observedAttributes = ['name'];

    name;

    initializedCallback() {
      dispatchPageTitleEv(this, 'Calendar');
    }

    render() {
      return `
        <h1>${this.name ? `${this.name}'s calendar` : `Calendar page`}</h1>
        <time-display></time-display>
        <p>This is the calendar page</p>
        ${this.name ? '<router-outlet></router-outlet>' : ''}
      `;
    }
  }
);

Min.createElement(
  class extends Min.AppElement {
    static tagName = 'not-found-page'

    initializedCallback() {
      dispatchPageTitleEv(this, 'Not Found Page');
    }

    render() {
      return `
        <h1>404</h1>
        <h2>Not found</h2>
      `;
    }
  }
);

Min.createElement(
  class extends Min.AppElement {
    static tagName = 'shadow-dom-page'
    static shadowDom = true;

    initializedCallback() {
      dispatchPageTitleEv(this, 'Shadow DOM Element Page');
    }

    render() {
      return `
        <h1>This is the Shadow Dom Page</h1>
        <h2>You cannot style inside here!</h2>
      `;
    }
  }
);

Min.createElement(
  class TodoAppElement extends Min.AppElement {
    static observedAttributes = ['items'];
    static tagName = 'todo-list';

    items = [];

    initializedCallback() {
      dispatchPageTitleEv(this, 'To Do List');
      this.stateListener('items', (items) => {
        this.items = items || [];
      });
    }

    render() {
      if (!this.items) {
        return '';
      }
      return `<div>
        <simple-template></simple-template>
        <div>
          <h4>
          Time:  <time-display></time-display>
          </h4>
        </div>
        ${this.templateMap(this.items, (_item, index) => `<todo-item index="${index}"></todo-item>`)}
        <button class="add">Add Item</button>
      </div>`
    }

    addItemListener = this.eventListener('.add', 'click', () => {
      const name = prompt('Enter item name');
      if (name) {
        this.stateDispatch('addItem', { name, completed: false, store: { name: 'Kroger' } });
      }
    });
  }
);

Min.createElement(
  class TodoItemElement extends Min.AppElement {
    static observedAttributes = ['index', 'item'];
    static tagName = 'todo-item';
    static css = `
      .todo-item {
        border: 1px solid green;
        border-radius: 8px;
        margin: 6px;
        padding: 6px;
      }
      
      .todo-item > * {
        display: inline-block;
      }
    `;

    index;
    item;

    get indexNum() {
      return Number(this.index || 0);
    }

    initializedCallback() {
      this.stateListener('item', (item) => {
        this.item = item;
      }, this.indexNum);
    }

    render() {
      if (!this.item) {
        return '';
      }
      const { name, completed, store } = this.item;
      return `<div class="todo-item">
      <input type="checkbox" data-name="${name}" ${completed ? 'checked="true"' : ''}"/>
      <h3>
        ${name}
        ${completed ? 'DONE!' : ''}  
      </h3>
      <p>Store: ${store.name}</p>
      <button class="change-store" style="float: right;">Change Store</button>
      <button class="remove" style="float: right;">Remove Item</button>
    </div>`
    }

    checkBoxListener = this.eventListener('input', 'change', () => {
      this.stateDispatch('setItem', this.indexNum, { ...this.item, completed: event.target.checked });
    });

    removeItemListener = this.eventListener('.remove', 'click', () => {
      this.stateDispatch('removeItem', this.indexNum);
    });

    changeStoreListener = this.eventListener('.change-store', 'click', () => {
      const otherStoreName = 'Giant Eagle';
      this.item.store.name = this.item.store.name === otherStoreName ? 'Kroger' : otherStoreName;
    });
  }
);

Min.createElement(
  class TimeDisplayElement extends Min.AppElement {
    static observedAttributes = ['time'];
    static tagName = 'time-display';
    intervalId;

    time = this._getTimestamp();

    initializedCallback() {
      this.intervalId = setInterval(() => {
        this.time = this._getTimestamp();
      }, 1000);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      clearInterval(this.intervalId);
    }

    render() {
      return this.time;
    }

    _getTimestamp() {
      const dt = new Date();
      const doubleDigits = (num) => String(num).padStart(2, '0');
      return `${doubleDigits(dt.getHours())}:${doubleDigits(dt.getMinutes())}:${doubleDigits(dt.getSeconds())}`
    }
  }
);

Min.createElement(
  class TimeElement extends Min.AppElement {
    static observedAttributes = [];
    static tagName = 'simple-template';

    render() {
      return `<div>
        <p>This is a component with a simple template.</p>
      </div>`
    }
  }
);

Min.createElement(
  class CalendarDay extends Min.AppElement {
    static observedAttributes = ['day'];
    static tagName = 'calendar-day';

    get uiDay() {
      if (!this.day) {
        return '';
      }
      return this.day[0].toUpperCase() + this.day.substring(1);
    }

    render() {
      return `<div>
        Calendar day!
        <h2>${this.uiDay}</h2>
      </div>`
    }
  }
);
