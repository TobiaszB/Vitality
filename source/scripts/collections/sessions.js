module.exports = {

  memory: {},
  
  load: function load(){

    root.main = document.querySelector('main');

    if(!root.main) return setTimeout(load, 0);

  },

  sign_in: (element) => {

    root.send({
      request: 'sign_in',
      email: element.parentElement.querySelector('[type="email"]').value || '',
      password: element.parentElement.querySelector('[type="password"]').value || '',
    });
  	
  },

  sign_out: (element) => {

    root.ws.send(JSON.stringify({ request: 'sign_out' }));

  },

  check_passwords: (element) => {

    let inputs = root.main.querySelectorAll('input[type="password"]');

    if(!inputs[0].value && !inputs[2].value) return root.sessions.launch();

    if(inputs[0].value != inputs[1].value) return alert('not equal');

    root.send({
      request: 'set_password',
      old_password: inputs[0].value,
      password: inputs[2].value || ''
    }, (res) => {

      root.sessions.launch();

    });

  },

  launch: () => {

    root.send({ request: 'launch' });

  },
  
  load_page: (elem, options) => {

    if(!root.main) return setTimeout(root.main, 0, elem, options);

    let page = elem ? elem.dataset.page : history.state ? history.state.page : 'courses';

    document.body.classList.forEach((c) => {

      if(c.indexOf('-page') == -1) return;

      document.body.classList.remove(c);

    });

    document.body.classList.remove('notified');

    document.body.classList.add(page + '-page');
    
    root.main.dataset.load = page + '.html';

    if(!options || !options.prevent_url) root.sessions.url('/' + page);

    window.scrollTo(0, 0);

  },

  url: (state, options) => {

    let operation = options && options.replace ? 'replaceState' : 'pushState';

    let url = typeof state == 'string' ? decode() : location.pathname;

    return history[operation](state ? state : decode(), options ? options.title : document.title, state ? encode() : pathname);

    function encode() {

      let page = state ? state.page || 'courses' : 'courses';

      return Object.keys(state).reduce((url,key)=>{

        if (key == 'page') return url;

        return `${url}/${key}/${state[key]}`;

      }
      , `/${page}`);

    }

    function decode() {

      let parts = (state || location.pathname).split(/\//g);

      state = {};

      for (let i = 0; i < parts.length; i += 2) {

        state[parts[i] || 'page'] = parts[i + 1];

      }

      state.page = state.page || 'courses';
      
      return state;

    }

  }

};