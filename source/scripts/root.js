require('./polyfill.js');

window.AOS = require('./components/aos.js');

const DEV_MODE = true;

window.root = {

  config: init(),

  incoming: incoming,
  
  templates: require('./collections/templates.js'),
  
  courses: require('./collections/courses.js'),
  
  blocks: require('./collections/blocks.js'),

  sessions: require('./collections/sessions.js'),

  labels: require('./components/labels.js'),
  
  modal: require('./components/modal.js'),

  upload: require('./components/upload.js'),

  editor: require('./components/editor.js'),
  
  prefill: require('./components/prefill.js'),

  tickets: require('./collections/tickets.js'),

  users: require('./collections/users.js')

};

function init(){

  require('./listeners.js')();

  requestAnimationFrame(()=> {

	root.sessions.load();

	create_websocket();

  });

  return {
    user: '',
    session: '',
    error: error,
    query: location.search.slice(1).split('&').reduce((memo, pair) => {

	  let p = pair.split('=');

	  memo[p[0]] = p[1];

	  return memo;

	}, {})
  };

}

function create_websocket() {

  let query = '',
      callbacks = [];

  for(let i in localStorage)
    query += (query ? '&' : '?') + encodeURIComponent(i) + '=' +  encodeURIComponent(localStorage.getItem(i));

  new WebSocket(DEV_MODE ?
    `ws://localhost:443/${ query }` :
    `wss://vitalityone.fearless-apps.com/${ query }`
  ).addEventListener('message', function listener(e){

    let ws = e.target;

    root.send = Send(ws, callbacks);

    incoming(JSON.parse(e.data), callbacks);

    ws.removeEventListener('message', listener);

    ws.addEventListener('message', (e) => incoming(JSON.parse(e.data), callbacks));

  });

}

function error(element) {

  if(element && element.dataset) return console.error(element.dataset.message);
  
  console.error(arguments);

}

function Send(ws, callbacks) {

  return function send(data, callback) {

    let cb = `cb_${ Math.floor(Math.random() * 10000) }`;

    data.callback = cb;

    if(callback) callbacks[cb] = callback;

    ws.send(JSON.stringify(data));

  };

}

function incoming(message, callbacks){

  if(message instanceof Array) {

  	for(let m in message) merge(message[m]);

	return;

  }

  merge(message);
  
  if(message.error) notify(message);

  if(message.redirect) location.href = message.redirect;

  if(message.callback && callbacks[message.callback]) {

  	callbacks[message.callback](message);

  	delete callbacks[message.callback];
  	
  }

  if(typeof message.token == 'undefined') return;

  root.me = Object.assign(root.me || {}, message);

  document.body.classList[message.token ? 'add' : 'remove']('authenticated');

  if(!message.token) root.sessions.url('/');

  localStorage.setItem('authenticated', message.token || '');

  root.sessions.load_page(null, { prevent_url: true });
  
}

function notify(message) {

  	document.body.classList.add('notified');

	document.querySelector('#notification-message').innerHTML = message.error;
	
}

function merge(message){

  if(!message.key) return;

  let collection = message.key.split('_').slice(0, -1).join('_');

  if(!root[collection]) return console.log(`collection <${ collection }> not found`);

  if(!root[collection].memory[message.key]) {

  	root[collection].memory[message.key] = message;

  	return root[collection].updated = true;

  }
  
  root[collection].memory[message.key] = Object.assign(root[collection].memory[message.key] || {}, message);
  
}