let tmp;

let orders = module.exports = {

  add: (element) => {

    root.ws.send(JSON.stringify({ request: 'new_order' }));

  },
  
  save_search: (element) => {

	localStorage.setItem('search', element.value);

	orders.updated = true;

  },

  list: (element) => {

    if(!element) return;

    element.innerHTML = ``;

    root.labels.loading(element);

    requestAnimationFrame(()=> {

      let search = String(localStorage.getItem('search') || '').toLowerCase();

      orders.render(element, search);

    });

  },


  render: (element, search, keys, iteration) => {

    if(!element) return;

    if(!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    if(element.dataset.iteration != iteration) return;

    keys = keys || Object.keys(orders.memory);

    if(!keys.length) {

        if(!element.children.length) return root.labels.no_results(element);

        return element.dataset.title = '';

    }

    let order = orders.memory[keys.shift()];

    if(!order ||
       (search && String(order.customer).toLowerCase().indexOf(search) == -1)
     ) {

       if(keys.length % 100 == 0) return requestAnimationFrame(()=> {

         orders.render(element, search, keys, iteration);

       });

       return orders.render(element, search, keys, iteration);

     }

     requestAnimationFrame(()=> {

      orders.render(element, search, keys, iteration);

    });

    let elem = document.createElement('div');

    elem.dataset.load = 'orders.render_one';

    elem.dataset.order = order.key;

    element.appendChild(elem);

  },

  save_date: (element) => {

    let data = element.parentElement.dataset;

    orders.edit(element.parentElement, {
      value: element.parentElement.querySelector('input').value,
      callback: () => {
       orders.render_one(
         document.querySelector(`[data-order="${ data.order }"][data-load="orders.render_one"]`)
       );
      }
    });

  },

  edit_date: (element) => {

    if(!element || element.dataset.clicked) return;

    let order = orders.memory[element.dataset.order],
        value = order[element.dataset.property],
        date = value ? new Date(value) : new Date();

    element.dataset.clicked = true;

    element.innerHTML = `
      <input type="datetime-local" value="${
        date.getFullYear() }-${
          date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1) }-${
            date.getDate() < 10 ? '0' + date.getDate() : date.getDate() }T${
              date.getHours() < 10 ? '0' + date.getHours() : date.getHours() }:${
              date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() }">
      <button class="blue" data-click="orders.save_date">opslaan</button>
    `;

  },

  edit: (element, options) => {

    let request = {
       request: 'edit',
       key: element.dataset.order
     };

     let v = options ? options.value : element.value;

     if(['arrival', 'departure'].indexOf(element.dataset.property) > -1) {

       v = new Date(v).toJSON();

     }

     request[element.dataset.property] = v;

     root.send(request, options ? options.callback : null);

  },

  toggle_status: (element) => {

    let order = orders.memory[element.dataset.order],
        index = order.tasks.indexOf(order.status);

    element.dataset.index = index;

    orders.toggle_task(element);

  },

  render_one: (element) => {

    let order = orders.memory[element.dataset.order];

    let tasks = root.users.memory[root.me.user].tasks.reduce((html, task, index) => {

      if(task) html += `<div data-index="${ index }" data-order="${ order.key }" data-click="orders.toggle_task" class="small tag${ order.tasks[index] ? ' active' : '' }">${ task }</div>`;

      return html;

    }, '');

    element.innerHTML = `
      <div class="customer-container">
        <form class="prefiller" data-submit="prefill.submit">
          <ul></ul>
          <input data-property="customer" data-collection="customers" data-key="${ order.key }" data-load="prefill.load" type="text">
          <input type="submit">
        </form>
      </div>
      <div class="customer-container">
        <form class="prefiller" data-submit="prefill.submit">
          <ul></ul>
          <input data-property="driver" data-collection="users" data-key="${ order.key }" data-load="prefill.load" type="text">
          <input type="submit">
        </form>
      </div>
      <div class="task-container">
        <div data-order="${ order.key }" data-click="orders.toggle_status" data-index="${ order.tasks.indexOf(order.status) }" class="tag active">${ order.status }</div>
      </div>
      <div class="date-container" data-property="arrival" data-order="${ order.key }" data-click="orders.edit_date">${ format(order.arrival) }</div>
      <div class="date-container" data-property="departure" data-order="${ order.key }" data-click="orders.edit_date">${ format(order.departure) }</div>
      <div class="task-container grouped">${ tasks }</div>
      <div><input data-property="cargo" data-order="${ order.key }" data-input="orders.edit" type="text" value="${ order.cargo || '' }"></div>
      <div><input data-property="contents" data-order="${ order.key }" data-input="orders.edit" type="text" value="${ order.contents || '' }"></div>
      <div><input data-property="extra" data-order="${ order.key }" data-input="orders.edit" type="text" value="${ order.extra || '' }"></div>
      <div><select data-property="repeat" data-order="${ order.key }" data-change="orders.edit">
        <option${ order.repeat == '' ? ' selected' : '' } value="">Niet</option>
        <option${ order.repeat == 'week' ? ' selected' : '' } value="week">Week</option>
        <option${ order.repeat == 'month' ? ' selected' : '' } value="month">Maand</option>
      </select></div>
    `;

    if(!order.customer) element.querySelector('input').focus();

    function format(date) {

      date = new Date(date);

      let months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

      if (!date || String(date).toLowerCase() == 'invalid date') return '';

      return `
        ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}
        ${ date.getHours() }:${ String(date.getMinutes()).length > 1 ? '' : 0 }${ date.getMinutes() }
      `;

    }

  },

  toggle_task: (element) => {

    let index = parseInt(element.dataset.index, 10),
        order = orders.memory[element.dataset.order],
        tasks = order.tasks.slice(),
        status = 'AFGEHANDELD'

     tasks[index] = tasks[index] ? '' : root.users.memory[root.me.user].tasks[index]

     for(let i = 0; i < tasks.length; i++) {

       if(tasks[i] == '') continue;

        status = tasks[i];

        break;

     }

     root.send({ request: 'edit', key: order.key, status: status, tasks: tasks }, () => {

       orders.render_one(document.querySelector(`[data-order="${ order.key }"][data-load="orders.render_one"]`));
       
     });

  },

  memory: {}

};

(function updater(){

  if(!orders.updated) return setTimeout(updater, 300);

  orders.updated = false;

  // updater(); turn this on if you want to use this updater

}());