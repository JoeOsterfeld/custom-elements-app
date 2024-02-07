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
    '/pass-down-data': 'pass-down-data'
  },
  notFoundTag: 'not-found-page'
});

const pageTitleChangeEventName = 'pagetitlechange';
const dispatchPageTitleEv = (el, title) => {
  el.dispatchEvent(new CustomEvent(pageTitleChangeEventName, {detail: title, bubbles: true}));
}

Min.defineElement(
  class MainMinElement extends Min.MinElement {
    static tagName = 'app-element'
    static observedAttributes = ['title'];
    title = '';

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
        <a href="/pass-down-data">Pass Down Data</a>

        <router-outlet data-on${pageTitleChangeEventName}="onPageTitleChange"></router-outlet>
      `;
    }

    onPageTitleChange(event) {
      this.title = event.detail;
    }
  }
);

Min.defineElement(
  class extends Min.MinElement {
    static tagName = 'calendar-page'
    static observedAttributes = ['name'];

    name;

    onInit() {
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

Min.defineElement(
  class extends Min.MinElement {
    static tagName = 'not-found-page'

    onInit() {
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

Min.defineElement(
  class extends Min.MinElement {
    static tagName = 'shadow-dom-page'
    static shadowDom = true;

    onInit() {
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

Min.defineElement(
  class TodoMinElement extends Min.MinElement {
    static observedAttributes = ['items'];
    static tagName = 'todo-list';

    items = [];

    onInit() {
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
        <button class="add" data-onclick="addItem">Add Item</button>
      </div>`
    }

    addItem() {
      const name = prompt('Enter item name');
      if (name) {
        this.stateDispatch('addItem', { name, completed: false, store: { name: 'Kroger' } });
      }
    }
  }
);

Min.defineElement(
  class TodoItemElement extends Min.MinElement {
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

    onInit() {
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
      <input 
        type="checkbox"
        data-name="${name}"
        ${completed ? 'checked="true"' : ''}"
        data-onchange="inputChange"
      />
      <h3>
        ${name}
        ${completed ? 'DONE!' : ''}  
      </h3>
      <p>Store: ${store.name}</p>
      <button data-onclick="changeStore" class="change-store" style="float: right;">Change Store</button>
      <button data-onclick="removeItem" class="remove" style="float: right;">Remove Item</button>
    </div>`
    }

    inputChange() {
      this.stateDispatch('setItem', this.indexNum, { ...this.item, completed: event.target.checked });
    }

    removeItem() {
      this.stateDispatch('removeItem', this.indexNum);
    }

    changeStore() {
      const otherStoreName = 'Giant Eagle';
      this.item.store.name = this.item.store.name === otherStoreName ? 'Kroger' : otherStoreName;
    }
  }
);

Min.defineElement(
  class TimeDisplayElement extends Min.MinElement {
    static observedAttributes = ['time'];
    static tagName = 'time-display';
    intervalId;

    time = this._getTimestamp();

    onInit() {
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

Min.defineElement(
  class TimeElement extends Min.MinElement {
    static observedAttributes = [];
    static tagName = 'simple-template';

    render() {
      return `<div>
        <p>This is a component with a simple template.</p>
      </div>`
    }
  }
);

Min.defineElement(
  class CalendarDay extends Min.MinElement {
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

Min.defineElement(
  class CalendarDay extends Min.MinElement {
    static observedAttributes = ['counter'];
    static tagName = 'pass-down-data';
    days = [{
      name: 'Monday',
      isWorkDay: true
    },{
      name: 'Tuesday',
      isWorkDay: true
    },{
      name: 'Wednesday',
      isWorkDay: true
    },{
      name: 'Thursday',
      isWorkDay: true
    },{
      name: 'Friday',
      isWorkDay: true
    },{
      name: 'Saturday',
      isWorkDay: false
    },{
      name: 'Sunday',
      isWorkDay: false
    }];

    counter = 1;

    onInit() {
      dispatchPageTitleEv(this, 'Passing Data Into Children');
    }

    render() {
      return `
        <div>
          <button data-onclick="buttonClick">+</button>
          <button data-onclick="buttonClick">-</button>
        </div>
        <days-list data-count="counter" data-days="days"></days-list>
        <days-list data-count="counter" data-days="days"></days-list>
        <days-list data-count="counter" data-days="days"></days-list>
      `
    }

    buttonClick(event) {
      let value = 1;
      if (event.target.textContent === '-') {
        value *= -1;
      }
      this.counter += value;
    }
  }
);

Min.defineElement(
  class extends Min.MinElement {
    static tagName = 'days-list';
    static css = `
      ${this.tagName} {
        display: block;
      }
    `;
    days = [];
    count;

    render() {
      return `
      Count: ${this.count}<br>
      ${this.templateMap(this.days, (day) => `
        <span>
          ${day.isWorkDay ? '💼' : ''}
          ${day.name}
        </span>
      `)}`
    }
  }
);
