let tickets = module.exports = {

  // here we save all tickets in client memory
  // { [key]: OBJECT }
  memory: {},

  change_language: (element) => {

    let block = document.querySelector('#invite-block');

    block.dataset.language = element.dataset.language;

  },

  open_invite_block: (element) => {

    let block = document.querySelector('#invite-block');

    block.classList.toggle('open');

  },

  // button is placed to the right of the title of the page
  add: (element) => {

    // root.send is used to talk to the server
    root.send({ request: 'new_ticket' });

  },

  // anytime the user triggers the data-input of the search field, we execute this
  save_search: (element) => {

    // used inside of tickets.render()
	tickets.search_query = String(element.value || '').toLowerCase();

    // see update loop at the bottom of this file
	tickets.updated = true;

  },

  // goes off anytime ticket-related data-input is fired
  edit: (element, options) => {

    // we always need to provide a request string and the key of the object we are editing
    let request = {
       request: 'edit',
       key: element.dataset.ticket
     };

     // but the value we are changing shall be added dynamically,
     // so we can use this edit function straight from the HTML
     // <input data-input="tickets.edit" data-key="[KEY]">
     let v = options ? options.value : element.value;

     request[element.dataset.property] = v;

     // options.callback can only be used when this function is fired manually in Javascript
     // since we cannot write a function inside of the HTML tag
     root.send(request, options ? options.callback : null);

  },

  list: (element) => {

    // we are lazy developers that do not want to select the list over and over
    // whenever we use this list function manually
    if(!element) element = document.querySelector('[data-load="tickets.list"]');

    // element still not found?! we must stop this madness
    if(!element) return;
    
    // we clean out the old HTML should this function be fired after the list already rendered
    element.innerHTML = ``;

    // we show a loading text
    root.labels.loading(element);

    // and start the render loop!
    tickets.render(element);

  },


  render: (element, keys, iteration) => {

    // maybe the user navigated away? Somehow the element is gone, RIP loop :'(
    if(!element) return;

    // we need to make sure we only run 1 loop at the same time
    // every time render is called outside of its own loop, iteration will be undefined
    // so we use this condition to also update the dataset of the element
    // in order for the old loop to kill itself...
    if(!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    // if it turns out this execution is an outdated iteration,
    // the element has updated its dataset.iteration outside of this loop
    // we have to bring this loop to the white shores
    // I offer this line of comment in dedication to the loop whos life will be cut before the natural end
    if(element.dataset.iteration != iteration) return;

    // every time render is called outside of its own loop, keys will be undefined
    if(!keys) keys = Object.keys(tickets.memory);

    // the loop has finished
    if(!keys.length) {

        // sadly, no children are found inside of the element
        // this can only mean there were no results
        if(!element.children.length) return root.labels.no_results(element);

        // we had results, and are no longer loading, so lets clear that loading message
        return element.dataset.message = '';

    }

    let search = tickets.search_query, // search value is changed by tickets.save_search()
        ticket = tickets.memory[keys.shift()];

    if(!ticket || ticket.archived ||
      (search && String(ticket.name).toLowerCase().indexOf(search) == -1) ||
      (tickets.manager_filter.length && tickets.manager_filter.indexOf(ticket.admin) == -1)
    ) {

       if(keys.length % 100 == 0) return requestAnimationFrame(()=> {

         tickets.render(element, keys, iteration);

       });

       return tickets.render(element, keys, iteration);

     }

     requestAnimationFrame(()=> {

      tickets.render(element, keys, iteration);

    });

    let elem = document.createElement('div');

    elem.dataset.load = 'tickets.render_one';

    elem.dataset.ticket = ticket.key;

    element.appendChild(elem);

  },

  archive: (element) => {

    let ticket = tickets.memory[element.dataset.key];

    root.send({ request: 'archive', key: ticket.key }, () => {

      // see update loop at the bottom of this file
      tickets.updated = true;
      
    });

  },

  manager_filter: [],

  toggle_course: (element) => {

    let key = element.dataset.key,
        filter = tickets.manager_filter,
        index = filter.indexOf(key);

    element.classList.toggle('active');

    if(index > -1) filter.splice(index, 1);

    else filter.push(key);

    tickets.updated = true;

  },

  load_courses: (element) => {

    element.innerHTML = Object.keys(root.courses.memory).reduce((html, key) => {

      return html + `<div data-click="tickets.toggle_course" data-key="${ key }">
        <span data-load="courses.memory.${ key }.name"></span>
      </div>`;

    }, '');

  },

  render_one: (element) => {

    let ticket = tickets.memory[element.dataset.ticket],
        user = root.users.memory[ticket.user];

    element.innerHTML = `

      <div class="${ user.key == root.me.user ? 'me' : '' }" data-key="${ user.key }">
        <img src="${ user.avatar }">
        <span data-load="users.memory.${ user.key }.name"></span>
        <span data-load="users.memory.${ user.key }.email"></span>
      </div>

    `;

  },

};

(function updater(){

  if(!tickets.updated) return setTimeout(updater, 300);

  tickets.updated = false;

  tickets.list();

  updater();

}());