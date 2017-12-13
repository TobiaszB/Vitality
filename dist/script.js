(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("source/scripts/collections/blocks.js", function(exports, require, module) {
'use strict';

var blocks = module.exports = {

  memory: [],

  load: function load(element) {

    element.innerHTML = Object.keys(blocks.memory).reduce(function (html, key) {
      return html + '\n      <div><a data-key="' + key + '" data-load="blocks.render_one"></a></div>';
    }, '');
  },

  render_one: function render_one(element) {

    element.innerHTML = '' + element.dataset.key;

    element.addEventListener('mousedown', function (e) {

      blocks.drag_x = e.clientX;

      blocks.drag_y = e.clientY;

      blocks.drag_block = element;
      console.log(element);
    });
  }

};

document.body.addEventListener('mousemove', function (e) {

  if (!blocks.drag_block) return e;

  blocks.drag_block.style.right = blocks.drag_x - e.clientX + 'px';

  blocks.drag_block.style.top = e.clientY - blocks.drag_y + 'px';

  root.main.classList[blocks.drag_x - e.clientX > 190 ? 'add' : 'remove']('dropzone');
});

document.body.addEventListener('mouseup', function (e) {

  if (!blocks.drag_block) return e;

  var key = blocks.drag_block.dataset.key;

  blocks.drag_block.removeAttribute('style');

  blocks.drag_block = null;

  if (!root.main.classList.contains('dropzone')) return e;

  root.main.classList.remove('dropzone');

  root.editor.add_block(key);
});
});

require.register("source/scripts/collections/courses.js", function(exports, require, module) {
'use strict';

var courses = module.exports = {

  // here we save all courses in client memory
  // { [key]: OBJECT }
  memory: {},

  // button is placed to the right of the title of the page
  add: function add(element) {

    // root.send is used to talk to the server
    root.send({ request: 'new_course' });
  },

  // view mode can be cards or list, it has a button in the left top of the interface
  view_mode: function view_mode(element) {

    courses.mode = element.dataset.mode;

    // we put the mode also in the main, to support CSS styling
    root.main.dataset.mode = element.dataset.mode;

    // see update loop at the bottom of this file
    courses.updated = true;
  },

  // anytime the user triggers the data-input of the search field, we execute this
  save_search: function save_search(element) {

    // used inside of courses.render()
    courses.search_query = String(element.value || '').toLowerCase();

    // see update loop at the bottom of this file
    courses.updated = true;
  },

  // goes off anytime course-related data-input is fired
  edit: function edit(element, options) {

    // we always need to provide a request string and the key of the object we are editing
    var request = {
      request: 'edit',
      key: element.dataset.course
    };

    // but the value we are changing shall be added dynamically,
    // so we can use this edit function straight from the HTML
    // <input data-input="courses.edit" data-key="[KEY]">
    var v = options ? options.value : element.value;

    request[element.dataset.property] = v;

    // options.callback can only be used when this function is fired manually in Javascript
    // since we cannot write a function inside of the HTML tag
    root.send(request, options ? options.callback : null);
  },

  list: function list(element) {

    // we are lazy developers that do not want to select the list over and over
    // whenever we use this list function manually
    if (!element) element = document.querySelector('[data-load="courses.list"]');

    // element still not found?! we must stop this madness
    if (!element) return;

    if (history.state.course) return courses.load_course(element);

    // we clean out the old HTML should this function be fired after the list already rendered
    element.innerHTML = '';

    // we show a loading text
    root.labels.loading(element);

    // and start the render loop!
    courses.render(element);
  },

  load_course: function load_course(element) {

    element.innerHTML = '<div data-load="courses.render_one" data-course="' + history.state.course + '"></div>';
  },

  render: function render(element, keys, iteration) {

    // maybe the user navigated away? Somehow the element is gone, RIP loop :'(
    if (!element) return;

    // we need to make sure we only run 1 loop at the same time
    // every time render is called outside of its own loop, iteration will be undefined
    // so we use this condition to also update the dataset of the element
    // in order for the old loop to kill itself...
    if (!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    // if it turns out this execution is an outdated iteration,
    // the element has updated its dataset.iteration outside of this loop
    // we have to bring this loop to the white shores
    // I offer this line of comment in dedication to the loop whos life will be cut before the natural end
    if (element.dataset.iteration != iteration) return;

    // every time render is called outside of its own loop, keys will be undefined
    if (!keys) keys = Object.keys(courses.memory);

    // the loop has finished
    if (!keys.length) {

      // sadly, no children are found inside of the element
      // this can only mean there were no results
      if (!element.children.length) return root.labels.no_results(element);

      // we had results, and are no longer loading, so lets clear that loading message
      return element.dataset.message = '';
    }

    var search = courses.search_query,
        // search value is changed by courses.save_search()
    course = courses.memory[keys.shift()];

    if (!course || course.archived || search && String(course.name).toLowerCase().indexOf(search) == -1 || courses.manager_filter.length && courses.manager_filter.indexOf(course.admin) == -1) {

      if (keys.length % 100 == 0) return requestAnimationFrame(function () {

        courses.render(element, keys, iteration);
      });

      return courses.render(element, keys, iteration);
    }

    requestAnimationFrame(function () {

      courses.render(element, keys, iteration);
    });

    var elem = document.createElement('div');

    elem.dataset.load = 'courses.render_one';

    elem.dataset.course = course.key;

    element.appendChild(elem);
  },

  archive: function archive(element) {

    var course = courses.memory[element.dataset.key];

    root.send({ request: 'archive', key: course.key }, function () {

      // see update loop at the bottom of this file
      courses.updated = true;
    });
  },

  manager_filter: [],

  toggle_manager: function toggle_manager(element) {

    var key = element.dataset.key,
        filter = courses.manager_filter,
        index = filter.indexOf(key);

    element.classList.toggle('active');

    if (index > -1) filter.splice(index, 1);else filter.push(key);

    courses.updated = true;
  },

  load_managers: function load_managers(element) {

    element.innerHTML = Object.keys(root.users.memory).reduce(function (html, key) {

      var user = root.users.memory[key];

      if (user.role == 'admin') html += '<div data-click="courses.toggle_manager" data-key="' + user.key + '">\n        <img src="' + user.avatar + '">\n        <span data-load="users.memory.' + user.key + '.name"></span>\n      </div>';

      return html;
    }, '');
  },

  render_one: function render_one(element) {

    var course = courses.memory[element.dataset.course];

    element.dataset.key = element.dataset.course;

    element.innerHTML = courses.mode == 'lists' ? '\n      <input placeholder="Naam" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n      <pre>' + JSON.stringify(course, null, 2) + '</pre>\n    ' : '\n      <div class="thumbnail" style="background-image:url(' + course.thumbnail + ')"></div>\n      ' + courses.course_nav(element) + '\n      <img src="' + root.users.memory[course.admin].avatar + '">\n      <input placeholder="Naam" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n      <span data-load="users.memory.' + course.admin + '.name"></span>\n    ';

    if (!course.name) element.querySelector('input').focus();

    function format(date) {

      date = new Date(date);

      var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

      if (!date || String(date).toLowerCase() == 'invalid date') return '';

      return '\n        ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + '\n        ' + date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes() + '\n      ';
    }
  },

  course_nav: function course_nav(element) {

    var course = root.courses.memory[element.dataset.key];

    return '<div class="course-nav">\n        ' + (course.published_at ? '<span class="published">PUBLISHED</span>' : '<span class="unpublished">UNPUBLISHED</span>') + '<br>\n        <a data-key="' + element.dataset.key + '" data-click="courses.view" data-load="labels.view"></a>\n        <a data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="courses.invite" data-load="labels.invite"></a>\n        <a data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="courses.stats" data-load="labels.stats_short"></a>\n      </div>';
  },

  view: function view(element) {

    root.sessions.url({ page: 'edit', course: element.dataset.key });

    root.sessions.load_page(null, { prevent_url: true });
  },

  invite: function invite(element) {

    var course = root.courses.memory[element.dataset.key];

    element.innerHTML = '<div class="modal">\n      <i class="fa fa-times close-modal" data-click="modal.close"></i>\n      <div class="content">\n        <div class="thumbnail" style="background-image:url(' + course.thumbnail + ')"></div>\n        <h3 data-load="labels.invite"></h3>\n        ' + courses.course_nav(element) + '\n        <input placeholder="Naam" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n        <span data-load="users.memory.' + course.admin + '.name"></span>\n      </div>\n    </div>';
  },

  stats: function stats(element) {

    var course = root.courses.memory[element.dataset.key];

    element.innerHTML = '<div class="modal">\n      <i class="fa fa-times close-modal" data-click="modal.close"></i>\n      <div class="content">\n        <div class="thumbnail" style="background-image:url(' + course.thumbnail + ')"></div>\n        <h3 data-load="labels.stats"></h3>\n        ' + courses.course_nav(element) + '\n        <input placeholder="Naam" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n        <span data-load="users.memory.' + course.admin + '.name"></span>\n      </div>\n    </div>';
  }

};

(function updater() {

  if (!courses.updated) return setTimeout(updater, 300);

  courses.updated = false;

  if (root.main.dataset.load == 'edit.html') root.main.dataset.load = 'edit.html'; // this correctly triggers the mutationobserver in listeners.js

  else courses.list();

  updater();
})();
});

require.register("source/scripts/collections/sessions.js", function(exports, require, module) {
'use strict';

var sessions = module.exports = {

    default_page: 'landing',

    memory: {},

    load: function load() {

        root.main = document.querySelector('main');

        if (!root.main) return setTimeout(load, 0);

        sessions.url(null, { prevent_url: true });
    },

    load_login: function load_login(element) {

        if (!root.me.session) return;

        sessions.url('/courses');

        sessions.load_page(null, { prevent_url: true });
    },

    sign_in: function sign_in(element) {

        root.send({
            request: 'sign_in',
            email: element.parentElement.querySelector('[type="email"]').value || '',
            password: element.parentElement.querySelector('[type="password"]').value || ''
        }, function () {

            sessions.url('/courses');

            sessions.load_page(null, { prevent_url: true });
        });
    },

    sign_out: function sign_out(element) {

        root.send({ request: 'sign_out' });
    },

    check_passwords: function check_passwords(element) {

        var inputs = root.main.querySelectorAll('input[type="password"]');

        if (inputs[0].value != inputs[1].value) return alert('not equal');

        root.send({
            request: 'set_password',
            old_password: inputs[0].value,
            password: inputs[2].value || ''
        }, function (res) {});
    },

    load_page: function load_page(elem, options) {

        if (!root.main) return setTimeout(root.main, 0, elem, options);

        var page = elem ? elem.dataset.page : history.state ? history.state.page : 'landing';

        if (!localStorage.getItem('authenticated') && ['landing', 'login', 'about'].indexOf(page) == -1) {
            page = 'landing';
        }

        document.body.classList.forEach(function (c) {

            if (c.indexOf('-page') == -1) return;

            document.body.classList.remove(c);
        });

        document.body.classList.remove('notified');

        document.body.classList.add(page + '-page');

        root.main.dataset.load = page + '.html';

        if (!options || !options.prevent_url) sessions.url('/' + page);

        window.scrollTo(0, 0);

        root.modal.close();
    },

    url: function url(state, options) {

        var operation = options && options.replace ? 'replaceState' : 'pushState';

        var url = typeof state == 'string' ? decode() : location.pathname;

        return history[operation](state ? state : decode(), options ? options.title : document.title, state ? encode() : pathname);

        function encode() {

            var page = state ? state.page || sessions.default_page : sessions.default_page;

            return Object.keys(state).reduce(function (url, key) {

                if (key == 'page') return url;

                return url + '/' + key + '/' + state[key];
            }, '/' + (page == sessions.default_page ? '' : page));
        }

        function decode() {

            var parts = (state || location.pathname).split(/\//g);

            state = {};

            for (var i = 0; i < parts.length; i += 2) {

                state[parts[i] || 'page'] = parts[i + 1];
            }

            state.page = state.page || sessions.default_page;

            return state;
        }
    }

};
});

require.register("source/scripts/collections/templates.js", function(exports, require, module) {
'use strict';

module.exports = {

  change_language: function change_language(element) {

    localStorage.setItem('language', element.dataset.language);

    location.reload();
  },

  highlight_lang: function highlight_lang(element) {

    if (!element.classList.contains(localStorage.getItem('language') || 'nl')) return;

    element.classList.add('active');
  },

  format_date: function format_date(element) {

    var date = new Date(element.dataset.date),
        months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

    if (!date || String(date).toLowerCase() == 'invalid date') return;

    element.innerHTML = date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
  },

  format_time: function format_time(element) {

    var date = new Date(element.dataset.date);

    if (!date || String(date).toLowerCase() == 'invalid date') return;

    element.innerHTML = date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes();
  },

  start: function start(element) {

    console.log('e', element);
  },

  hide_notification: function hide_notification(element) {

    document.querySelector('body').classList.remove('notified');
  }

};
});

require.register("source/scripts/collections/tickets.js", function(exports, require, module) {
'use strict';

var tickets = module.exports = {

  // here we save all tickets in client memory
  // { [key]: OBJECT }
  memory: {},

  // button is placed to the right of the title of the page
  add: function add(element) {

    // root.send is used to talk to the server
    root.send({ request: 'new_ticket' });
  },

  // anytime the user triggers the data-input of the search field, we execute this
  save_search: function save_search(element) {

    // used inside of tickets.render()
    tickets.search_query = String(element.value || '').toLowerCase();

    // see update loop at the bottom of this file
    tickets.updated = true;
  },

  // goes off anytime ticket-related data-input is fired
  edit: function edit(element, options) {

    // we always need to provide a request string and the key of the object we are editing
    var request = {
      request: 'edit',
      key: element.dataset.ticket
    };

    // but the value we are changing shall be added dynamically,
    // so we can use this edit function straight from the HTML
    // <input data-input="tickets.edit" data-key="[KEY]">
    var v = options ? options.value : element.value;

    request[element.dataset.property] = v;

    // options.callback can only be used when this function is fired manually in Javascript
    // since we cannot write a function inside of the HTML tag
    root.send(request, options ? options.callback : null);
  },

  list: function list(element) {

    // we are lazy developers that do not want to select the list over and over
    // whenever we use this list function manually
    if (!element) element = document.querySelector('[data-load="tickets.list"]');

    // element still not found?! we must stop this madness
    if (!element) return;

    // we clean out the old HTML should this function be fired after the list already rendered
    element.innerHTML = '';

    // we show a loading text
    root.labels.loading(element);

    // and start the render loop!
    tickets.render(element);
  },

  render: function render(element, keys, iteration) {

    // maybe the user navigated away? Somehow the element is gone, RIP loop :'(
    if (!element) return;

    // we need to make sure we only run 1 loop at the same time
    // every time render is called outside of its own loop, iteration will be undefined
    // so we use this condition to also update the dataset of the element
    // in order for the old loop to kill itself...
    if (!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    // if it turns out this execution is an outdated iteration,
    // the element has updated its dataset.iteration outside of this loop
    // we have to bring this loop to the white shores
    // I offer this line of comment in dedication to the loop whos life will be cut before the natural end
    if (element.dataset.iteration != iteration) return;

    // every time render is called outside of its own loop, keys will be undefined
    if (!keys) keys = Object.keys(tickets.memory);

    // the loop has finished
    if (!keys.length) {

      // sadly, no children are found inside of the element
      // this can only mean there were no results
      if (!element.children.length) return root.labels.no_results(element);

      // we had results, and are no longer loading, so lets clear that loading message
      return element.dataset.message = '';
    }

    var search = tickets.search_query,
        // search value is changed by tickets.save_search()
    ticket = tickets.memory[keys.shift()];

    if (!ticket || ticket.archived || search && String(ticket.name).toLowerCase().indexOf(search) == -1 || tickets.manager_filter.length && tickets.manager_filter.indexOf(ticket.admin) == -1) {

      if (keys.length % 100 == 0) return requestAnimationFrame(function () {

        tickets.render(element, keys, iteration);
      });

      return tickets.render(element, keys, iteration);
    }

    requestAnimationFrame(function () {

      tickets.render(element, keys, iteration);
    });

    var elem = document.createElement('div');

    elem.dataset.load = 'tickets.render_one';

    elem.dataset.ticket = ticket.key;

    element.appendChild(elem);
  },

  archive: function archive(element) {

    var ticket = tickets.memory[element.dataset.key];

    root.send({ request: 'archive', key: ticket.key }, function () {

      // see update loop at the bottom of this file
      tickets.updated = true;
    });
  },

  manager_filter: [],

  toggle_course: function toggle_course(element) {

    var key = element.dataset.key,
        filter = tickets.manager_filter,
        index = filter.indexOf(key);

    element.classList.toggle('active');

    if (index > -1) filter.splice(index, 1);else filter.push(key);

    tickets.updated = true;
  },

  load_courses: function load_courses(element) {

    element.innerHTML = Object.keys(root.courses.memory).reduce(function (html, key) {

      return html + ('<div data-click="tickets.toggle_course" data-key="' + key + '">\n        <span data-load="courses.memory.' + key + '.name"></span>\n      </div>');
    }, '');
  },

  render_one: function render_one(element) {

    var ticket = tickets.memory[element.dataset.ticket];

    element.dataset.key = element.dataset.ticket;

    element.innerHTML = tickets.mode == 'lists' ? '\n      <span data-load="tickets.memory.' + element.dataset.key + '.name"></span>\n      <pre>' + JSON.stringify(ticket, null, 2) + '</pre>\n    ' : '\n      <div class="thumbnail" style="background-image:url(' + ticket.thumbnail + ')"></div>\n      ' + tickets.ticket_nav(element) + '\n      <input placeholder="Naam" data-property="name" data-ticket="' + ticket.key + '" data-input="tickets.edit" type="text" value="' + ticket.name + '">\n      <span data-load="users.memory.' + ticket.admin + '.name"></span>\n    ';

    if (!ticket.name) element.querySelector('input').focus();

    function format(date) {

      date = new Date(date);

      var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

      if (!date || String(date).toLowerCase() == 'invalid date') return '';

      return '\n        ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + '\n        ' + date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes() + '\n      ';
    }
  },

  ticket_nav: function ticket_nav(element) {

    return '<div>\n        <button data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="tickets.view" data-load="labels.view"></button>\n        <button data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="tickets.invite" data-load="labels.invite"></button>\n        <button data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="tickets.stats" data-load="labels.stats_short"></button>\n      </div>';
  },

  view: function view(element) {

    var ticket = root.tickets.memory[element.dataset.key];

    element.innerHTML = '<div class="modal">\n      <i class="fa fa-times close-modal" data-click="modal.close"></i>\n      <div class="content">\n        <div class="thumbnail" style="background-image:url(' + ticket.thumbnail + ')"></div>\n        <h3 data-load="labels.view"></h3>\n        ' + tickets.ticket_nav(element) + '\n        <input placeholder="Naam" data-property="name" data-ticket="' + ticket.key + '" data-input="tickets.edit" type="text" value="' + ticket.name + '">\n        <span data-load="users.memory.' + ticket.admin + '.name"></span>\n      </div>\n    </div>';
  },

  invite: function invite(element) {

    var ticket = root.tickets.memory[element.dataset.key];

    element.innerHTML = '<div class="modal">\n      <i class="fa fa-times close-modal" data-click="modal.close"></i>\n      <div class="content">\n        <div class="thumbnail" style="background-image:url(' + ticket.thumbnail + ')"></div>\n        <h3 data-load="labels.invite"></h3>\n        ' + tickets.ticket_nav(element) + '\n        <input placeholder="Naam" data-property="name" data-ticket="' + ticket.key + '" data-input="tickets.edit" type="text" value="' + ticket.name + '">\n        <span data-load="users.memory.' + ticket.admin + '.name"></span>\n      </div>\n    </div>';
  },

  stats: function stats(element) {

    var ticket = root.tickets.memory[element.dataset.key];

    element.innerHTML = '<div class="modal">\n      <i class="fa fa-times close-modal" data-click="modal.close"></i>\n      <div class="content">\n        <div class="thumbnail" style="background-image:url(' + ticket.thumbnail + ')"></div>\n        <h3 data-load="labels.stats"></h3>\n        ' + tickets.ticket_nav(element) + '\n        <input placeholder="Naam" data-property="name" data-ticket="' + ticket.key + '" data-input="tickets.edit" type="text" value="' + ticket.name + '">\n        <span data-load="users.memory.' + ticket.admin + '.name"></span>\n      </div>\n    </div>';
  }

};

(function updater() {

  if (!tickets.updated) return setTimeout(updater, 300);

  tickets.updated = false;

  tickets.list();

  updater();
})();
});

require.register("source/scripts/collections/users.js", function(exports, require, module) {
'use strict';

var users = module.exports = {

    memory: {},

    add: function add(element) {

        root.send({ request: 'new_user' });
    },

    load_clients: function load_clients(element) {

        element.innerHTML = Object.keys(root.users.memory).reduce(function (html, key) {

            var user = root.users.memory[key];

            if (user.role == 'client') html += '\n\n        <div class="' + (user.key == root.me.user ? 'me' : '') + '" data-key="' + user.key + '">\n          <img src="' + user.avatar + '">\n          <span data-load="users.memory.' + user.key + '.name"></span>\n          <span data-load="users.memory.' + user.key + '.email"></span>\n        </div>\n\n      ';

            return html;
        }, '');
    },

    load_managers: function load_managers(element) {

        element.innerHTML = Object.keys(root.users.memory).reduce(function (html, key) {

            var user = root.users.memory[key];

            if (user.role == 'admin') html += '\n\n        <div class="' + (user.key == root.me.user ? 'me' : '') + '" data-key="' + user.key + '">\n          <img src="' + user.avatar + '">\n          <span data-load="users.memory.' + user.key + '.name"></span>\n          <span data-load="users.memory.' + user.key + '.email"></span>\n        </div>\n\n      ';

            return html;
        }, '');
    },

    load_profile: function load_profile(element) {

        var user = root.users.memory[root.me.user];

        element.innerHTML = '\n\n        <img class="avatar" src="' + user.avatar + '"><br>\n\n        <div class="divider horizontal grey"></div>\n\n        <input type="input" value="' + user.name + '"><br>\n\n        <a data-load="labels.sign_out" data-click="sessions.sign_out"></a>\n\n    ';
    },

    load_profile_link: function load_profile_link(element) {

        if (!root.me) return setTimeout(users.load_profile_link, 200, element);

        if (!root.me.user) return;

        var user = users.memory[root.me.user];

        if (!user) return;

        element.innerHTML = '\n\n      <div class="img-container"><img src="' + user.avatar + '"></div>\n      <span>' + user.name + '</span>\n      \n    ';
    },

    load_permissions: function load_permissions(element) {

        element.innerHTML = '\n      <label class="dark-grey" data-load="labels.permissions"></label><br>\n\n      <div class="row">\n        <input id="add" data-load="users.load_permission" data-change="users.update_permission" type="checkbox">\n        <label for="add" class="task fa fa-user-plus"></label>\n        <input disabled type="text" value="ADMIN">\n      </div>\n\n     ' + users.render_tasks() + '\n      ';
    },

    render_tasks: function render_tasks() {

        var user = users.memory[root.me.user];

        return user.tasks.reduce(function (memo, task, index) {

            memo += '\n      <div class="row">\n        ' + (task ? '<input id="task-' + index + '" data-load="users.load_permission" data-change="users.update_permission" type="checkbox">' : '') + '\n        <label for="task-' + (index + 1) + '" class="task task-' + (index + 1) + '">' + (index + 1) + '</label>\n        <input placeholder="NIEUW" data-index="' + index + '" data-input="users.update_task" type="text" value="' + task + '">\n      </div>';

            return memo;
        }, '');
    },

    load_permission: function load_permission(input) {

        if (input.id == 'add' && root.me.add_permission || input.id == 'archive' && root.me.archive_permission || root.me.tasks[parseInt(input.id.replace('task-', ''), 10)]) input.setAttribute('checked', true);
    },

    update_permission: function update_permission(input) {

        if (input.id == 'add') return root.send({ request: 'update_permission', add_permission: input.checked });

        if (input.id == 'archive') return root.send({ request: 'update_permission', archive_permission: input.checked });

        var tasks = users.memory[root.me.user].tasks.map(function (task, index) {

            if (index == parseInt(input.id.replace('task-', ''), 10)) return input.checked ? task : '';

            return root.me.tasks[index] ? task : '';
        });

        tasks.pop();

        root.send({ request: 'update_permission', tasks: tasks });
    },

    update_task: function update_task(element) {

        var index = element.dataset.index,
            tasks = users.memory.users_admin.tasks.slice();

        tasks[parseInt(element.dataset.index, 10)] = element.value;

        var update = tasks.reduce(function (memo, task) {

            if (!task) return memo;

            memo.push(String(task).toUpperCase());

            return memo;
        }, []);

        update.push('');

        root.send({ request: 'update_tasks', tasks: update }, function (user) {

            if (tasks.length == update.length) return;

            var elem = document.querySelector('[data-load="users.load_permissions"]');

            users.load_permissions(elem);

            var input = document.querySelector('[data-index="' + index + '"]');

            input.focus();

            input.selectionStart = input.selectionEnd = input.value.length;
        });
    },

    save_email: function save_email(input) {

        localStorage.setItem('remember_email', input.value);
    },

    load_email: function load_email(input) {

        input.value = localStorage.getItem('remember_email') || '';

        input.focus();
    },

    list: function list(element) {

        if (!element) return;

        element.innerHTML = '';

        root.labels.loading(element);

        requestAnimationFrame(function () {

            var search = String(localStorage.getItem('search') || '').toLowerCase();

            users.render(element, search);
        });
    },

    render: function render(element, search, keys, iteration) {

        if (!element) return;

        if (!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

        if (element.dataset.iteration != iteration) return;

        keys = keys || Object.keys(users.memory);

        if (!keys.length) {

            if (!element.children.length) return root.labels.no_results(element);

            return element.dataset.title = '';
        }

        var user = users.memory[keys.shift()];

        if (!user || user.archived || search && String(user.name).toLowerCase().indexOf(search) == -1) {

            if (keys.length % 100 == 0) return requestAnimationFrame(function () {

                users.render(element, search, keys, iteration);
            });

            return users.render(element, search, keys, iteration);
        }

        requestAnimationFrame(function () {

            users.render(element, search, keys, iteration);
        });

        var elem = document.createElement('div');

        elem.dataset.load = 'users.render_one';

        elem.dataset.user = user.key;

        element.appendChild(elem);
    },

    edit: function edit(element, options) {

        var request = {
            request: 'edit',
            key: element.dataset.user
        };

        var v = options ? options.value : element.value;

        request[element.dataset.property] = v;

        root.send(request, options ? options.callback : null);
    },

    archive: function archive(element) {

        var user = users.memory[element.dataset.key];

        root.send({ request: 'archive', key: user.key }, function () {

            users.updated = true;
        });
    },

    render_one: function render_one(element) {

        var user = users.memory[element.dataset.user];

        var tasks = users.memory[root.me.user].tasks.reduce(function (html, task, index) {

            if (task) html += '<div data-index="' + index + '" data-user="' + user.key + '" data-click="users.toggle_task" class="small">' + task + '</div>';

            return html;
        }, '');

        element.innerHTML = '\n      <div>\n        <input placeholder="Name" data-property="name" data-user="' + user.key + '" data-input="users.edit" type="text" value="' + (user.name || '') + '">\n      </div>\n      <div>\n        <input placeholder="example@email.com" data-property="email" data-user="' + user.key + '" data-input="users.edit" type="text" value="' + (user.email || '') + '">\n      </div>\n      <div>\n        <input placeholder="Password" data-property="password" data-user="' + user.key + '" data-input="users.edit" type="password">\n      </div>\n      <div>\n        <select data-property="role" value="' + user.role + '" data-user="' + user.key + '" data-change="users.edit">\n          <option' + (user.role == 'intern' ? ' selected' : '') + ' value="intern">Intern</option>\n          <option' + (user.role == 'driver' ? ' selected' : '') + ' value="driver">Chauffeur</option>\n          <option' + (user.role == 'admin' ? ' selected' : '') + ' value="admin">Admin</option>\n        </select>\n      </div>\n      <div>\n        <button data-click="users.archive" data-key="' + user.key + '">ARCHIVEER</button>\n      </div>\n    ';

        if (!user.name) element.querySelector('input').focus();

        function format(date) {

            date = new Date(date);

            var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

            if (!date || String(date).toLowerCase() == 'invalid date') return '';

            return '\n        ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + '\n        ' + date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes() + '\n      ';
        }
    },

    save_search: function save_search(element) {

        localStorage.setItem('search', element.value);

        users.updated = true;
    }

};

(function updater() {

    if (!users.updated) return setTimeout(updater, 300);

    users.updated = false;

    // updater();
})();
});

require.register("source/scripts/components/editor.js", function(exports, require, module) {
'use strict';

var editor = module.exports = {

  course: null,

  load_course: function load_course(element) {

    var key = history.state.course,
        course = root.courses.memory[key];

    editor.course = course;

    if (course.blocks) element.innerHTML = course.blocks.reduce(function (html, block, index) {

      var options = Object.keys(block.options).reduce(function (html, option) {
        return html + ' data-' + option + '="' + block.options[option] + '"';
      }, '');

      return html + '<div ' + options + ' data-index="' + index + '">' + block.html + '</div>';
    }, '');
  },

  add_block: function add_block(key) {

    var course = root.courses.memory[history.state.course],
        block = root.blocks.memory[key];

    course.blocks = course.blocks || [];

    course.blocks.push(block);

    console.log(course);

    root.courses.updated = true;
  },

  load_element: function load_element(element) {

    var index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index],
        key = element.dataset.element;

    element.dataset.input = 'editor.save';

    if (!block.content) block.content = {};

    if (!block.content[key]) block.content[key] = key;

    element.innerHTML = block.content[key];
  },

  save: function save(element) {

    var index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index];

    block.content[element.dataset.element] = element.value;

    console.log(JSON.stringify(editor.course, null, 2));
  }

};
});

require.register("source/scripts/components/labels.js", function(exports, require, module) {
'use strict';

var LANGS = ['nl', 'en'];

var index = LANGS.indexOf(localStorage.getItem('language'));

if (index == -1) index = 0;

var labels = {
  landing: ['Welkom', 'Landing'],
  landing_text: ['Persoonlijke Training & Persoonlijke Coaching', 'Personal Training & Personal Coaching'],
  landing_description: ['voor het programma Managers Vitality (voor een leef - werkbalans die de managementprestaties verbetert)', 'Program Managers Vitality (for a life - work balance that boosts management performance)'],
  landing_feel_good: ['Goed in je vel zitten', 'Just feel great'],
  landing_feel_good_description: ['Wil jij een gezondere levensstijl hebben, maar vind je het moeilijk om de juiste motivatie te vinden? Wil jij eindelijk eens echt een doel bereiken!!! Fitter zijn, afvallen, resultaat boeken!!. Dan ben je bij ons aan het juiste adres. We bieden zowel specifieke trainingsprogramma\'s aan als programma\'s met coaching. Daarbij gaat het vooral om het vinden van een goede werk - privé - balans. Zeker voor de drukke manager een geweldige mogelijkheid! Op deze site tref je meer informatie aan.', 'Do you want a healthier lifestyle, but do you find it difficult to find the right motivation? Do you finally really want to achieve a goal !!! Fitter, lose weight, book books !! Then you have come to the right place. We indicate specific training programs as programs with coaching. This mainly involves finding a good work - private balance. Especially for the busy manager a great opportunity! You will find more information on this site.'],
  landing_share_page: ['Deel deze pagina', 'Share this page'],
  landing_joris_merel: ['Joris Boon en Merel Witkamp', 'Joris Boon and Merel Witkamp'],
  landing_joris_merel_description: ["Mogen we ons even aan u voorstellen. Wij zijn Joris Boon en Merel Witkamp. We zijn beiden fanatieke sporttrainers waarbij we weten dat individuele training allereerst tot resultaat moet leiden bijvoorbeeld afvallen, vitaler of gewoon \'je beter voelen\'. Maar we weten ook dat training alleen vaak niet voldoende is. Vandaar dat we een uniek coachingprogramma hebben geïntroduceerd onder de noemer \'Managers Vitality: for a work - life balance that boosts your management performance'. Het gaat dan om een programma om een betere werk - privé balans te vinden (ook in relatie tot fitness) alsmede omveel betere resultaten op het werk te behalen. Het focust zich op de '7th habit' van managementgoeroe Stephan Covey waar hij heeft over 'het scherp houden van de zaag'. Inmiddels hebben al vele managers zich voor dit programma ingeschreven.", "May we introduce ourselves to you, we are Joris Boon and Merel Witkamp We are both fanatical sports trainers where we know that individual training should lead to results first, for example losing weight, being more vital or just 'feeling better'. also that training alone is often not sufficient, which is why we have introduced a unique coaching program under the heading 'Managers Vitality: for a work - life balance that boosts your management performance' - a program for a better work - private life. To find a balance (also in relation to fitness) as well as to achieve much better results at work, it focuses on the '7th habit' of management guru Stephan Covey, who talks about 'keeping the saw sharp'. managers registered for this program."],
  about_text: ['Mogen wij uw personal trainer of personal coach zijn?', 'Can we be your personal trainer or personal coach?'],
  about_joris: ["Onder andere samen met een collega een sportschool gehad, een sportschool waar ik overigens nog steeds met veel plezier training geef. Maar nu, na zoveel jaren les te hebben gegeven, merk ik ook waar mijn echte persoonlijke voorkeur ligt: personal training, trainen met kleine groepen en personal coaching. Ik merk daarbij dat kickboksen – een sport die ik al 27 jaar heb beoefend, en waar ik al 20 jaar les in geef – nu door grote groepen wordt gebruikt om zich vitaler te voelen, waarbij fysiek contact uiteraard vermeden wordt. Omdat ik dit vooral met ondernemers doe, heb ik de speciale vorm 'business boksen' bedacht: je lekker even op een bijzondere manier afreageren... heerlijk! Overigens gaat het niet alleen om business boksen, ook andere trainingsvormen bied ik als personal trainer aan. Het is juist de combinatie van verschillende vormen die de mensen zo aanspreekt.", "Together with a colleague I had a gym, a gym where I still enjoy training. But now, after having taught for so many years, I also notice my true personal preference: personal training, training with small groups and personal coaching. I notice that kick boxing - a sport that I have practiced for 27 years, and for which I have been teaching for 20 years - is now being used by large groups to feel more vital, whereby physical contact is naturally avoided. Because I mainly do this with entrepreneurs, I have come up with the special form of 'business boxing': you can have a nice chat in a special way ... delicious! Incidentally, it is not only about business boxing, other forms of training I offer as a personal trainer. It is precisely the combination of different forms that appeal to people in this way."],
  about_merel: ["Ook mijn leven is door sport bepaald. Ik ben begonnen met een dansopleiding en vanuit de dans ben ik overgestapt naar Yoga en vandaar uit ben ik met heel veel trainingsvormen bezig geweest. Omdat professionaliteit bij mij hoog in het vaandel staat, heb ik waar mogelijk diploma\'s behaald. Naast de CIOS-opleiding heb ik diploma\'s in Personal Hormonal Profiling (alles wat te maken heeft met hormonen en hoe die beïnvloed kunnen worden door voeding en training), Fitness diploma A en B, diploma Perfect Pilates en het diploma in Oncologische Revalidatie. Daarnaast ben ik me gaan verdiepen in personal coaching om beter om mensen te kunnen coachen om beter om te kunnen gaan met de balans werk - privé. Veel drukke managers weten hoe belangrijk fysieke training is om dagelijks fit te kunnen blijven. Maar er is meer en met ons speciale coachingprogramma zult u al snel merken hoeveel voordeel u hiervan kunt hebben. Het belangrijkste voor mij is mensen te motiveren om in beweging te blijven.", "My life has been determined by sport, I started a dance education and from dance I switched to Yoga and from there I have been busy with a lot of training forms. Because professionalism is of paramount importance to me, I have, wherever possible, I have diplomas in Personal Hormonal Profiling (everything that has to do with hormones and how they can be influenced by nutrition and training), Fitness diploma A and B, diploma Perfect Pilates. and the diploma in Oncological Rehabilitation, I also went into personal coaching in order to better coach people in order to better deal with the work-life balance.Many busy managers know how important physical training is to be able to get fit every day But there is more and with our special coaching program you will soon see how much benefit you can have of this, the most important thing for me is to motivate people to keep moving."],
  add: ['Toevoegen', 'Add'],
  invite: ['Uitnodigen', 'Invite'],
  about: ['Over ons', 'About'],
  sign_in: ['Inloggen', 'Sign in'],
  sign_in_input: [value('Inloggen', value('Sign in'))],
  sign_out: ['Uitloggen', 'Sign out'],
  courses: ['Cursussen', 'Courses'],
  invitations: ['Uitnodigingen', 'Invitations'],
  stats: ['Statistieken', 'Statistics'],
  no_results: [title('Geen resultaten'), title('No results')],
  loading: [title('Laden...'), title('Loading...')],
  archive: ['Archiveer', 'Archive'],
  view: ['Bekijk', 'View'],
  view_mode: ['VIEW MODE', 'VIEW MODE'],
  search: ['ZOEKEN', 'SEARCH'],
  managers: ['MANAGERS', 'MANAGERS'],
  edit: ['Aanpassen', 'Edit'],
  stats_short: ['Stats', 'Stats'],
  copy: ['Kopi&#xEB;ren', 'Copy'],
  viewed: ['Bekeken:', 'Viewed:'],
  published: ['Gepubliceerd', 'Published'],
  unpublished: ['Niet Gepubliceerd', 'Unpublished'],
  password: ['WACHTWOORD', 'PASSWORD'],
  edit_password: ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD'],
  old_password: [placeholder('oud wachtwoord'), placeholder('old password')],
  new_password: [placeholder('nieuw wachtwoord'), placeholder('new password')],
  placeholder_search: [placeholder('Zoeken'), placeholder('Search')],
<<<<<<< HEAD
  save_profile: [value('Sla profiel op'), value('Save profile')]
=======
  save_profile: [placeholder('Sla profiel op'), placeholder('Save profile')],
  clients: ['Klanten', 'Clients']
>>>>>>> af5b35a90e0e368b80aa369e3aea6273cff94bbd
};

for (var n in labels) {

  if (!labels.hasOwnProperty(n)) continue;

  if (labels[n] == false) labels[n] = n;else labels[n] = labels[n][index];
}

module.exports = labels;

function placeholder(label) {

  return function (el) {
    return el.setAttribute('placeholder', label);
  };
}

function title(label) {

  return function (el) {
    return el.setAttribute('data-title', label);
  };
}

function value(label) {

  return function (el) {
    el.value = label;
  };
}
});

;require.register("source/scripts/components/modal.js", function(exports, require, module) {
'use strict';

var modal = module.exports = {

	load: function load(element) {

		root.modal_element = element;
	},

	open: function open(element, load) {

		var modal = root.modal_element;

		if (modal.dataset.key) modal.dataset.key = element.dataset.key;

		if (!document.body.classList.contains('modal-open')) root.main.style.transform = 'translateY(-' + (window.scrollY || document.body.scrollTop) + 'px)';

		scroll(0, 0);

		modal.dataset.load = element.dataset.modal;

		requestAnimationFrame(function () {
			return document.body.classList.add('modal-open');
		});
	},

	close: function close(element) {

		var scrolltop = parseInt(root.main.style.transform.replace('translateY(', ''), 10);

		document.body.classList.remove('modal-open');

		root.main.removeAttribute('style');

		root.modal_element.load = "modal.empty";

		window.scroll(0, -1 * scrolltop);
	},

	empty: ''

};
});

require.register("source/scripts/components/prefill.js", function(exports, require, module) {
'use strict';

var prefill = module.exports = {

    memory: {},

    load: function load(element) {

        element.dataset.input = 'prefill.edit';

        if (!element.dataset.key) return;

        var key = element.dataset.key,
            collection = key.split('_')[0],
            item = root[collection].memory[key];

        if (!item[element.dataset.property]) return;

        var property_key = item[element.dataset.property],
            property_collection = property_key.split('_')[0];

        if (!root[property_collection]) return;

        var property = root[property_collection].memory[property_key];

        element.value = property.name;
    },

    select: function select(element) {

        var key = element.dataset.key,
            collection = key.split('_')[0],
            item = root[collection].memory[key];

        var input = element.parentElement.parentElement.querySelector('input');

        input.value = item.name;

        var input_collection = input.dataset.key.split('_')[0];

        element.parentElement.innerHTML = '';

        var request = {
            request: 'edit',
            key: input.dataset.key
        };

        request[input.dataset.property] = item.key;

        root.send(request);
    },

    submit: function submit(element) {

        var selection = element.querySelector('li');

        if (selection) prefill.select(selection);
    },

    edit: function search(element, keys) {

        var ul = element.parentElement.querySelector('ul');

        if (!keys) ul.innerHTML = '';

        keys = keys || Object.keys(root[element.dataset.collection].memory);

        if (prefill.loop && prefill.loop > keys.length) return; // new loop started, this one stops

        prefill.loop = keys.length - 1;

        if (!keys.length || !element.value) return; // done looping

        var key = keys.shift(),
            collection = key.split('_')[0],
            item = root[collection].memory[key];

        if (String(item.name || '').toLowerCase().indexOf(String(element.value).toLowerCase()) == -1) return search(element, keys);

        requestAnimationFrame(function () {
            return search(element, keys);
        });

        ul.innerHTML += '<li data-click="prefill.select" data-key="' + item.key + '">' + item.name + '</li>';
    }

};
});

require.register("source/scripts/listeners.js", function(exports, require, module) {
'use strict';

var updates = [];

module.exports = init;

function init() {

  bind();

  document.documentElement.addEventListener('click', listener);

  document.documentElement.addEventListener('change', listener);

  document.documentElement.addEventListener('input', listener);

  document.documentElement.addEventListener('submit', listener);
}

function listener(e, element) {

  element = element || e.target;

  if (e.type.toLowerCase() == 'submit') e.preventDefault();

  if (!element.dataset || !element.dataset[e.type]) {

    if (!element.parentElement) return;

    return listener(e, element.parentElement);
  }

  var target = root;

  for (var i = 0, parts = element.dataset[e.type].split('.'); i < parts.length; i++) {

    if (!target) return console.error(element.dataset[e.type] || e.type, 'does not exist');

    target = target[parts[i]];
  }

  if (typeof target == 'string') return element.innerHTML = target;

  if (typeof target != 'function') return console.error(element.dataset[e.type] || e.type, 'does not exist');

  target(element);
}

function bind() {

  (function loop() {

    if (!updates.length) return requestAnimationFrame(loop);

    var elements = updates.splice(0, updates.length);

    for (var i = 0; i < elements.length; i++) {

      [].map.call(elements[i].querySelectorAll('[data-bind], [data-load]'), bind_one);
    }

    requestAnimationFrame(loop);
  })();

  new MutationObserver(observer).observe(document.documentElement, {
    attributes: true,
    subtree: true,
    childList: true,
    characterData: true
  });
}

function observer(mutations) {

  for (var i = 0; i < mutations.length; i++) {

    if (mutations[i].type == 'attributes') {

      if (mutations[i].attributeName == 'data-load') load(mutations[i].target);

      continue;
    }

    if (mutations[i].type != 'childList') return;

    if (updates.indexOf(mutations[i].target) == -1) updates.push(mutations[i].target);
  }
}

function bind_one(element) {

  var d = element.dataset,
      key = d.bind == 'me' ? root.config.user : d.bind,
      collection = void 0;

  if (d.load) return load(element);

  if (!key) return collection.error(d);

  collection = root[key.split('_').slice(0, -1).join('_')];

  if (!collection || !collection.memory[key]) return console.error(key);

  var prop = d.value || d.text || d.bg || d.html,
      obj = collection.memory[key];

  if (d.value) element.value = obj[d.value] || '';

  if (d.html) element.innerHTML = obj[d.html] || '';

  if (d.text) element.innerHTML = (obj[d.text] || '').replace(/(>|<)/g, escape);

  if (d.bg) element.style.backgroundImage = 'url("' + (obj[d.bg] || '');
}

function load(element) {

  var target = root;

  for (var i = 0, parts = element.dataset.load.split('.'); i < parts.length; i++) {

    target = target[parts[i]];

    if (typeof target == 'undefined') {

      if (element.dataset.load.indexOf('.html') != -1) return load_file(element);

      return console.error(element.dataset.load, 'does not exist');
    }
  }

  if (element.dataset.load.substring(0, 11) == 'labels.user') {

    var user = root.users.memory[root.config.user],
        str = element.dataset.load;

    str = str.substring(12);

    if (user && typeof str == 'string' && user[str]) return element.value = user[str];
  }

  if (typeof target == 'string') return element.innerHTML = target;

  if (typeof target == 'function') return target(element);
}

function load_file(element) {

  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/' + element.dataset.load, true);

  xhr.onreadystatechange = function (e) {

    if (this.readyState != 4 || this.status != 200) return;

    root.templates = root.templates || {};

    var target = root.templates;

    for (var i = 0, parts = element.dataset.load.split('.'); i + 1 < parts.length; i++) {

      if (!target) return;

      target[parts[i]] = target[parts[i]] || {};

      target = target[parts[i]];
    }

    element.innerHTML = target.html = this.responseText;
  };

  xhr.send();
}

function escape(match) {

  return match == '>' ? '&gt;' : '&lt;';
}
});

;require.register("source/scripts/polyfill.js", function(exports, require, module) {
'use strict';

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function value(target) {
      'use strict';

      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

(function () {

  if (typeof window.Element === "undefined" || "classList" in document.documentElement) return;

  var prototype = Array.prototype,
      push = prototype.push,
      splice = prototype.splice,
      join = prototype.join;

  function DOMTokenList(el) {
    this.el = el;
    // The className needs to be trimmed and split on whitespace
    // to retrieve a list of classes.
    var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
    for (var i = 0; i < classes.length; i++) {
      push.call(this, classes[i]);
    }
  };

  DOMTokenList.prototype = {
    add: function add(token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.el.className = this.toString();
    },
    contains: function contains(token) {
      return this.el.className.indexOf(token) != -1;
    },
    item: function item(index) {
      return this[index] || null;
    },
    remove: function remove(token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.el.className = this.toString();
    },
    toString: function toString() {
      return join.call(this, ' ');
    },
    toggle: function toggle(token) {
      if (!this.contains(token)) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return this.contains(token);
    }
  };

  window.DOMTokenList = DOMTokenList;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(Element.prototype, 'classList', function () {
    return new DOMTokenList(this);
  });
})();
});

require.register("source/scripts/root.js", function(exports, require, module) {
'use strict';

require('./polyfill.js');

var DEV_MODE = true;

window.root = {

  config: init(),

  incoming: incoming,

  templates: require('./collections/templates.js'),

  courses: require('./collections/courses.js'),

  blocks: require('./collections/blocks.js'),

  sessions: require('./collections/sessions.js'),

  labels: require('./components/labels.js'),

  modal: require('./components/modal.js'),

  editor: require('./components/editor.js'),

  prefill: require('./components/prefill.js'),

  tickets: require('./collections/tickets.js'),

  users: require('./collections/users.js')

};

function init() {

  require('./listeners.js')();

  requestAnimationFrame(function () {

    root.sessions.load();

    create_websocket();
  });

  return {
    user: '',
    session: '',
    error: error,
    query: location.search.slice(1).split('&').reduce(function (memo, pair) {

      var p = pair.split('=');

      memo[p[0]] = p[1];

      return memo;
    }, {})
  };
}

function create_websocket() {

  var query = '',
      callbacks = [];

  for (var i in localStorage) {
    query += (query ? '&' : '?') + encodeURIComponent(i) + '=' + encodeURIComponent(localStorage.getItem(i));
  }new WebSocket(DEV_MODE ? 'ws://localhost:443/' + query : 'wss://vitalityone.fearless-apps.com/' + query).addEventListener('message', function listener(e) {

    var ws = e.target;

    root.send = Send(ws, callbacks);

    incoming(JSON.parse(e.data), callbacks);

    ws.removeEventListener('message', listener);

    ws.addEventListener('message', function (e) {
      return incoming(JSON.parse(e.data), callbacks);
    });
  });
}

function error(element) {

  if (element && element.dataset) return console.error(element.dataset.message);

  console.error(arguments);
}

function Send(ws, callbacks) {

  return function send(data, callback) {

    var cb = 'cb_' + Math.floor(Math.random() * 10000);

    data.callback = cb;

    if (callback) callbacks[cb] = callback;

    ws.send(JSON.stringify(data));
  };
}

function incoming(message, callbacks) {

  if (message instanceof Array) {

    for (var m in message) {
      merge(message[m]);
    }return;
  }

  merge(message);

  if (message.error) notify(message);

  if (message.redirect) location.href = message.redirect;

  if (message.callback && callbacks[message.callback]) {

    callbacks[message.callback](message);

    delete callbacks[message.callback];
  }

  if (typeof message.token == 'undefined') return;

  root.me = Object.assign(root.me || {}, message);

  document.body.classList[message.token ? 'add' : 'remove']('authenticated');

  if (!message.token) root.sessions.url('/');

  localStorage.setItem('authenticated', message.token || '');

  root.sessions.load_page(null, { prevent_url: true });
}

function notify(message) {

  document.body.classList.add('notified');

  document.querySelector('#notification-message').innerHTML = message.error;
}

function merge(message) {

  if (!message.key) return;

  var collection = message.key.split('_').slice(0, -1).join('_');

  if (!root[collection]) return console.log('collection <' + collection + '> not found');

  if (!root[collection].memory[message.key]) {

    root[collection].memory[message.key] = message;

    return root[collection].updated = true;
  }

  root[collection].memory[message.key] = Object.assign(root[collection].memory[message.key] || {}, message);
}
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

'use strict';

/* jshint ignore:start */
(function () {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = window.brunch || {};
  var ar = br['auto-reload'] = br['auto-reload'] || {};
  if (!WebSocket || ar.disabled) return;
  if (window._ar) return;
  window._ar = true;

  var cacheBuster = function cacheBuster(url) {
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'cacheBuster=' + date;
  };

  var browser = navigator.userAgent.toLowerCase();
  var forceRepaint = ar.forceRepaint || browser.indexOf('chrome') > -1;

  var reloaders = {
    page: function page() {
      window.location.reload(true);
    },

    stylesheet: function stylesheet() {
      [].slice.call(document.querySelectorAll('link[rel=stylesheet]')).filter(function (link) {
        var val = link.getAttribute('data-autoreload');
        return link.href && val != 'false';
      }).forEach(function (link) {
        link.href = cacheBuster(link.href);
      });

      // Hack to force page repaint after 25ms.
      if (forceRepaint) setTimeout(function () {
        document.body.offsetHeight;
      }, 25);
    },

    javascript: function javascript() {
      var scripts = [].slice.call(document.querySelectorAll('script'));
      var textScripts = scripts.map(function (script) {
        return script.text;
      }).filter(function (text) {
        return text.length > 0;
      });
      var srcScripts = scripts.filter(function (script) {
        return script.src;
      });

      var loaded = 0;
      var all = srcScripts.length;
      var onLoad = function onLoad() {
        loaded = loaded + 1;
        if (loaded === all) {
          textScripts.forEach(function (script) {
            eval(script);
          });
        }
      };

      srcScripts.forEach(function (script) {
        var src = script.src;
        script.remove();
        var newScript = document.createElement('script');
        newScript.src = cacheBuster(src);
        newScript.async = true;
        newScript.onload = onLoad;
        document.head.appendChild(newScript);
      });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname || 'localhost';

  var connect = function connect() {
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function (event) {
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function () {
      if (connection.readyState) connection.close();
    };
    connection.onclose = function () {
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();
/* jshint ignore:end */
;require('source/scripts/root.js');
//# sourceMappingURL=script.js.map