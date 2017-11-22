let customers = module.exports = {

  memory: {},

  add: (element) => {

    root.send({ request: 'new_customer' });

  },
  
  save_search: (element) => {

	localStorage.setItem('search', element.value);

	customers.updated = true;

  },

  edit: (element, options) => {

    let request = {
       request: 'edit',
       key: element.dataset.customer
     };

     let v = options ? options.value : element.value;

     request[element.dataset.property] = v;

     root.send(request, options ? options.callback : null);

  },

  list: (element) => {

    if(!element) return;

    element.innerHTML = ``;

    root.labels.loading(element);

    requestAnimationFrame(()=> {

      let search = String(localStorage.getItem('search') || '').toLowerCase();

      customers.render(element, search);

    });

  },


  render: (element, search, keys, iteration) => {

    if(!element) return;

    if(!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    if(element.dataset.iteration != iteration) return;

    keys = keys || Object.keys(customers.memory);

    if(!keys.length) {

        if(!element.children.length) return root.labels.no_results(element);

        return element.dataset.title = '';

    }

    let customer = customers.memory[keys.shift()];

    
    if(!customer || customer.archived ||
       (search && String(customer.name).toLowerCase().indexOf(search) == -1)
     ) {

       if(keys.length % 100 == 0) return requestAnimationFrame(()=> {

         customers.render(element, search, keys, iteration);

       });

       return customers.render(element, search, keys, iteration);

     }

     requestAnimationFrame(()=> {

      customers.render(element, search, keys, iteration);

    });

    let elem = document.createElement('div');

    elem.dataset.load = 'customers.render_one';

    elem.dataset.customer = customer.key;

    element.appendChild(elem);

  },

  archive: (element) => {

    let customer = customers.memory[element.dataset.key];

    root.send({ request: 'archive', key: customer.key }, () => {

      customers.updated = true;
      
    });

  },

  render_one: (element) => {

    let customer = customers.memory[element.dataset.customer];

    element.innerHTML = `
      <div class="customer-container">
        <input placeholder="Naam" data-property="name" data-customer="${ customer.key }" data-input="customers.edit" type="text" value="${ customer.name }">
      </div>
      <div class="customer-container">
        <input placeholder="Adres" data-property="address" data-customer="${ customer.key }" data-input="customers.edit" type="text" value="${ customer.address }">
      </div>
      <div>
        <button data-key="${ customer.key }" data-click="customers.archive">ARCHIVEER</button>
      </div>
    `;

    if(!customer.name) element.querySelector('input').focus();

    function format(date) {

      date = new Date(date);

      let months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

      if (!date || String(date).toLowerCase() == 'invalid date') return '';

      return `
        ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}
        ${ date.getHours() }:${ String(date.getMinutes()).length > 1 ? '' : 0 }${ date.getMinutes() }
      `;

    }

  }
  
};

(function updater(){

  if(!customers.updated) return setTimeout(updater, 300);

  if(root.me.launched) customers.list(document.querySelector('[data-load="customers.list"]'));

  customers.updated = false;

  updater();

}());