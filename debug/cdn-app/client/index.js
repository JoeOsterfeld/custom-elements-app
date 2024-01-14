// Sets all items
MiniFw.AppState.createAction('setItems', (state, items) => {
  return {
    ...state,
    items
  };
});

// Sets a single item using its index
MiniFw.AppState.createAction('setItem', (state, index, item) => {
  const items = [...state.items];
  items[index] = item;
  return {
    ...state,
    items
  };
});

// Appends a new item to this list
MiniFw.AppState.createAction('addItem', (state, item) => {
  return {
    ...state,
    items: state.items.concat([item])
  };
});

// Removes and item
MiniFw.AppState.createAction('removeItem', (state, index) => {
  const items = [...state.items]
  items.splice(index, 1)
  return {
    ...state,
    items
  };
});

// Get all items
MiniFw.AppState.createSelector('items', (state) => state.items || []);
// Get a single item by its index
MiniFw.AppState.createSelector('item', (state, itemIndex) => (state.items || [])[itemIndex]);

// Dispatch the initial database state
MiniFw.AppState.dispatch('setItems', 'Milk Bread Eggs Apples Oranges'.split(' ').map(name => ({
  name, completed: false, store: { name: 'Kroger' }
})));

MiniFw.Router.init({
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

MiniFw.createElement(
  class MainAppElement extends MiniFw.AppElement {
    static tagName = 'app-element'

    render() {
      return `
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

MiniFw.createElement(
  class extends MiniFw.AppElement {
    static tagName = 'calendar-page'
    static observedAttributes = ['name'];

    name;

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

MiniFw.createElement(
  class extends MiniFw.AppElement {
    static tagName = 'not-found-page'

    render() {
      return `
        <h1>404</h1>
        <h2>Not found</h2>
      `;
    }
  }
);

MiniFw.createElement(
  class extends MiniFw.AppElement {
    static tagName = 'shadow-dom-page'
    static shadowDom = true;

    render() {
      return `
        <h1>This is the Shadow Dom Page</h1>
        <h2>You cannot style inside here!</h2>
      `;
    }
  }
);

MiniFw.createElement(
  class TodoAppElement extends MiniFw.AppElement {
    static observedAttributes = ['items'];
    static tagName = 'todo-list';

    items = [];

    initializedCallback() {
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
        <button class="add" onclick="el.handleAdd(event)">Add Item</button>
      </div>`
    }

    handleAdd() {
      const name = prompt('Enter item name');
      if (name) {
        this.stateDispatch('addItem', { name, completed: false, store: { name: 'Kroger' } });
      }
    }
  }
);

MiniFw.createElement(
  class TodoItemElement extends MiniFw.AppElement {
    static observedAttributes = ['index', 'item'];
    static tagName = 'todo-item';

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
      <input onchange="el.handleCheck(event)" type="checkbox" data-name="${name}" ${completed ? 'checked="true"' : ''}"/>
      <h3>
        ${name}
        ${completed ? 'DONE!' : ''}  
      </h3>
      <p>Store: ${store.name}</p>
      <button onclick="el.handleChangeStore(event)" class="change-store" style="float: right;">Change Store</button>
      <button onclick="el.handleRemove(event)" class="remove" style="float: right;">Remove Item</button>
    </div>`
    }

    handleCheck(event) {
      this.stateDispatch('setItem', this.indexNum, { ...this.item, completed: event.target.checked });
    }

    handleRemove() {
      this.stateDispatch('removeItem', this.indexNum);
    }

    handleChangeStore() {
      const otherStoreName = 'Giant Eagle';
      this.item.store.name = this.item.store.name === otherStoreName ? 'Kroger' : otherStoreName;
    }
  }
);

MiniFw.createElement(
  class TimeDisplayElement extends MiniFw.AppElement {
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

MiniFw.createElement(
  class TimeElement extends MiniFw.AppElement {
    static observedAttributes = [];
    static tagName = 'simple-template';

    render() {
      return `<div>
        <p>This is a component with a simple template.</p>
      </div>`
    }
  }
);

MiniFw.createElement(
  class CalendarDay extends MiniFw.AppElement {
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
