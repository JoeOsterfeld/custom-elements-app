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

MiniFw.createElement(
  class TodoAppElement extends MiniFw.AppElement {
    static observedAttributes = ['items'];
    static tagName = 'app-element';

    items = [];

    initializedCallback() {
      this.stateListener('items', (items) => {
        this.items = items || [];
      });
    }

    renderedCallback() {
      this.queryListener('.add', 'click', (event) => {
        const name = prompt('Enter item name');
        if (name) {
          this.stateDispatch('addItem', {name, completed: false, store: {name: 'Kroger'}});
        }
      });
    }

    get template() {
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

    renderedCallback() {
      this.queryListener('input', 'change', (event) => {
        this.stateDispatch('setItem', this.indexNum, {...this.item, completed: event.target.checked});
      });

      this.queryListener('.remove', 'click', () => {
        this.stateDispatch('removeItem', this.indexNum);
      });
      this.queryListener('.change-store', 'click', () => {
        const otherStoreName = 'Giant Eagle';
        this.item.store.name = this.item.store.name === otherStoreName ? 'Kroger' : otherStoreName;
      });
    }

    get template() {
      if (!this.item) {
        return '';
      }
      const {name, completed, store} = this.item;
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

    get template() {
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

    get template() {
      return `<div>
        <p>This is a component with a simple template.</p>
      </div>`
    }
  }
);
