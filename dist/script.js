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

    element.style.backgroundImage = 'url(/' + element.dataset.key + '.jpg)';

    element.addEventListener('mousedown', function (e) {

      blocks.drag_x = e.clientX;

      blocks.drag_y = e.clientY;

      blocks.drag_block = element;
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

  blocks.drag_block.setAttribute('style', 'background-image:url(/' + key + '.jpg);');

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

  load_courses: function load_courses(element) {

    var keys = Object.keys(root.users.memory),
        html = '';

    element.innerHTML = Object.keys(root.courses.memory).reduce(function (html, key) {

      var course = root.courses.memory[key];

      if (course.published_at) html += '\n\n        <div data-key="' + course.key + '">\n          <img src="' + course.thumbnail + '">\n          <span>' + course.name + '</span>\n        </div>\n\n      ';

      return html;
    }, '');
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

    element.innerHTML = courses.mode == 'lists' ? '\n      <input placeholder="Naam" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n      <pre>' + JSON.stringify(course, null, 2) + '</pre>\n    ' : '\n      <div data-key="' + course.key + '" data-load="upload.render" class="upload thumbnail" style="background-image:url(' + course.thumbnail + ')"></div>\n      ' + courses.course_nav(element) + '\n      <img src="' + root.users.memory[course.admin].avatar + '">\n      <input data-load="labels.name" data-property="name" data-course="' + course.key + '" data-input="courses.edit" type="text" value="' + course.name + '">\n    ';

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

    return '<div class="course-nav">\n        ' + (course.published_at ? '<span class="published">PUBLISHED</span>' : '<span class="unpublished">UNPUBLISHED</span>') + '<br>\n        <a data-key="' + element.dataset.key + '" data-click="courses.view" data-load="labels.view"></a>\n        <a data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="courses.invite" data-load="labels.invite"></a>\n        <a data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="courses.stats" data-load="labels.stats_short"></a>\n        <a data-key="' + element.dataset.key + '" data-click="modal.open" data-modal="courses.delete" data-load="labels.delete"></a>\n      </div>';
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

    default_page: 'home',

    public_pages: ['home', 'courses', 'login', 'about', 'team', 'services', 'contact'],

    memory: {},

    load: function load() {

        root.main = document.querySelector('main');

        if (!root.main) return setTimeout(load, 0);

        AOS.init();

        sessions.url(null, { prevent_url: true });
    },

    load_login: function load_login(element) {

        if (!root.me || !root.me.session) return;

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

        var page = elem ? elem.dataset.page : history.state ? history.state.page : 'home';

        if (!localStorage.getItem('authenticated') && sessions.public_pages.indexOf(page) == -1) {
            page = 'home';
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

		load_courses: function load_courses(element) {

				var html = '',
				    keys = Object.keys(root.courses.memory);

				for (var i = 0; i < keys.length; i++) {

						var course = root.courses.memory[keys[i]];

						if (!course.published_at) continue;

						html += '\n\t\t\t<div class="invite-course" data-key="' + keys[i] + '">\n\n\t\t\t\t<div class="thumbnail-container"><img src="' + course.thumbnail + '"></div>\n\n\t\t\t\t<span>' + course.name + '</span>\n\n\t\t\t\t<small class="lang ' + course.language + '"></small>\n\n\t\t\t</div>\n\t\t';
				};

				element.innerHTML = html;
		},

		load_calender: function load_calender(element) {

				element.innerHTML = '\n\t\t\n\t\t\n\t\t\n\t';
		},

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

    change_language: function change_language(element) {

        var block = document.querySelector('#invite-block');

        block.dataset.language = element.dataset.language;
    },

    open_invite_block: function open_invite_block(element) {

        var block = document.querySelector('#invite-block');

        block.classList.toggle('open');
    },

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

        var ticket = tickets.memory[element.dataset.ticket],
            user = root.users.memory[ticket.user];

        element.innerHTML = '\n\n      <div class="' + (user.key == root.me.user ? 'me' : '') + '" data-key="' + user.key + '">\n        <img src="' + user.avatar + '">\n        <span data-load="users.memory.' + user.key + '.name"></span>\n        <span data-load="users.memory.' + user.key + '.email"></span>\n      </div>\n\n    ';
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

        var keys = Object.keys(root.users.memory),
            html = '';

        element.innerHTML = Object.keys(root.users.memory).reduce(function (html, key) {

            var user = root.users.memory[key];

            if (user.role == 'client') html += '\n\n        <div data-key="' + user.key + '">\n          <img src="' + user.avatar + '">\n          <span data-load="users.memory.' + user.key + '.name"></span>\n        </div>\n\n      ';

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

        if (!root.me || !root.me.user || !users.memory[root.me.user]) return setTimeout(users.load_profile_link, 500, element);

        var user = users.memory[root.me.user];

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

require.register("source/scripts/components/aos.js", function(exports, require, module) {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

//AOS
!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.AOS = t() : e.AOS = t();
}(undefined, function () {
  return function (e) {
    function t(o) {
      if (n[o]) return n[o].exports;var i = n[o] = { exports: {}, id: o, loaded: !1 };return e[o].call(i.exports, i, i.exports, t), i.loaded = !0, i.exports;
    }var n = {};return t.m = e, t.c = n, t.p = "dist/", t(0);
  }([function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }var i = Object.assign || function (e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = arguments[t];for (var o in n) {
          Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
        }
      }return e;
    },
        r = n(1),
        a = (o(r), n(6)),
        u = o(a),
        c = n(7),
        f = o(c),
        s = n(8),
        d = o(s),
        l = n(9),
        p = o(l),
        m = n(10),
        b = o(m),
        v = n(11),
        y = o(v),
        g = n(14),
        h = o(g),
        w = [],
        k = !1,
        x = document.all && !window.atob,
        j = { offset: 120, delay: 0, easing: "ease", duration: 400, disable: !1, once: !1, startEvent: "DOMContentLoaded" },
        O = function O() {
      var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0];if (e && (k = !0), k) return w = (0, y.default)(w, j), (0, b.default)(w, j.once), w;
    },
        S = function S() {
      w = (0, h.default)(), O();
    },
        _ = function _() {
      w.forEach(function (e, t) {
        e.node.removeAttribute("data-aos"), e.node.removeAttribute("data-aos-easing"), e.node.removeAttribute("data-aos-duration"), e.node.removeAttribute("data-aos-delay");
      });
    },
        E = function E(e) {
      return e === !0 || "mobile" === e && p.default.mobile() || "phone" === e && p.default.phone() || "tablet" === e && p.default.tablet() || "function" == typeof e && e() === !0;
    },
        z = function z(e) {
      return j = i(j, e), w = (0, h.default)(), E(j.disable) || x ? _() : (document.querySelector("body").setAttribute("data-aos-easing", j.easing), document.querySelector("body").setAttribute("data-aos-duration", j.duration), document.querySelector("body").setAttribute("data-aos-delay", j.delay), "DOMContentLoaded" === j.startEvent && ["complete", "interactive"].indexOf(document.readyState) > -1 ? O(!0) : "load" === j.startEvent ? window.addEventListener(j.startEvent, function () {
        O(!0);
      }) : document.addEventListener(j.startEvent, function () {
        O(!0);
      }), window.addEventListener("resize", (0, f.default)(O, 50, !0)), window.addEventListener("orientationchange", (0, f.default)(O, 50, !0)), window.addEventListener("scroll", (0, u.default)(function () {
        (0, b.default)(w, j.once);
      }, 99)), document.addEventListener("DOMNodeRemoved", function (e) {
        var t = e.target;t && 1 === t.nodeType && t.hasAttribute && t.hasAttribute("data-aos") && (0, f.default)(S, 50, !0);
      }), (0, d.default)("[data-aos]", S), w);
    };e.exports = { init: z, refresh: O, refreshHard: S };
  }, function (e, t) {},,,,, function (e, t) {
    (function (t) {
      "use strict";
      function n(e, t, n) {
        function o(t) {
          var n = b,
              o = v;return b = v = void 0, k = t, g = e.apply(o, n);
        }function r(e) {
          return k = e, h = setTimeout(s, t), S ? o(e) : g;
        }function a(e) {
          var n = e - w,
              o = e - k,
              i = t - n;return _ ? j(i, y - o) : i;
        }function c(e) {
          var n = e - w,
              o = e - k;return void 0 === w || n >= t || n < 0 || _ && o >= y;
        }function s() {
          var e = O();return c(e) ? d(e) : void (h = setTimeout(s, a(e)));
        }function d(e) {
          return h = void 0, E && b ? o(e) : (b = v = void 0, g);
        }function l() {
          void 0 !== h && clearTimeout(h), k = 0, b = w = v = h = void 0;
        }function p() {
          return void 0 === h ? g : d(O());
        }function m() {
          var e = O(),
              n = c(e);if (b = arguments, v = this, w = e, n) {
            if (void 0 === h) return r(w);if (_) return h = setTimeout(s, t), o(w);
          }return void 0 === h && (h = setTimeout(s, t)), g;
        }var b,
            v,
            y,
            g,
            h,
            w,
            k = 0,
            S = !1,
            _ = !1,
            E = !0;if ("function" != typeof e) throw new TypeError(f);return t = u(t) || 0, i(n) && (S = !!n.leading, _ = "maxWait" in n, y = _ ? x(u(n.maxWait) || 0, t) : y, E = "trailing" in n ? !!n.trailing : E), m.cancel = l, m.flush = p, m;
      }function o(e, t, o) {
        var r = !0,
            a = !0;if ("function" != typeof e) throw new TypeError(f);return i(o) && (r = "leading" in o ? !!o.leading : r, a = "trailing" in o ? !!o.trailing : a), n(e, t, { leading: r, maxWait: t, trailing: a });
      }function i(e) {
        var t = "undefined" == typeof e ? "undefined" : c(e);return !!e && ("object" == t || "function" == t);
      }function r(e) {
        return !!e && "object" == ("undefined" == typeof e ? "undefined" : c(e));
      }function a(e) {
        return "symbol" == ("undefined" == typeof e ? "undefined" : c(e)) || r(e) && k.call(e) == d;
      }function u(e) {
        if ("number" == typeof e) return e;if (a(e)) return s;if (i(e)) {
          var t = "function" == typeof e.valueOf ? e.valueOf() : e;e = i(t) ? t + "" : t;
        }if ("string" != typeof e) return 0 === e ? e : +e;e = e.replace(l, "");var n = m.test(e);return n || b.test(e) ? v(e.slice(2), n ? 2 : 8) : p.test(e) ? s : +e;
      }var c = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
        return typeof e === "undefined" ? "undefined" : _typeof(e);
      } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
      },
          f = "Expected a function",
          s = NaN,
          d = "[object Symbol]",
          l = /^\s+|\s+$/g,
          p = /^[-+]0x[0-9a-f]+$/i,
          m = /^0b[01]+$/i,
          b = /^0o[0-7]+$/i,
          v = parseInt,
          y = "object" == ("undefined" == typeof t ? "undefined" : c(t)) && t && t.Object === Object && t,
          g = "object" == ("undefined" == typeof self ? "undefined" : c(self)) && self && self.Object === Object && self,
          h = y || g || Function("return this")(),
          w = Object.prototype,
          k = w.toString,
          x = Math.max,
          j = Math.min,
          O = function O() {
        return h.Date.now();
      };e.exports = o;
    }).call(t, function () {
      return this;
    }());
  }, function (e, t) {
    (function (t) {
      "use strict";
      function n(e, t, n) {
        function i(t) {
          var n = b,
              o = v;return b = v = void 0, O = t, g = e.apply(o, n);
        }function r(e) {
          return O = e, h = setTimeout(s, t), S ? i(e) : g;
        }function u(e) {
          var n = e - w,
              o = e - O,
              i = t - n;return _ ? x(i, y - o) : i;
        }function f(e) {
          var n = e - w,
              o = e - O;return void 0 === w || n >= t || n < 0 || _ && o >= y;
        }function s() {
          var e = j();return f(e) ? d(e) : void (h = setTimeout(s, u(e)));
        }function d(e) {
          return h = void 0, E && b ? i(e) : (b = v = void 0, g);
        }function l() {
          void 0 !== h && clearTimeout(h), O = 0, b = w = v = h = void 0;
        }function p() {
          return void 0 === h ? g : d(j());
        }function m() {
          var e = j(),
              n = f(e);if (b = arguments, v = this, w = e, n) {
            if (void 0 === h) return r(w);if (_) return h = setTimeout(s, t), i(w);
          }return void 0 === h && (h = setTimeout(s, t)), g;
        }var b,
            v,
            y,
            g,
            h,
            w,
            O = 0,
            S = !1,
            _ = !1,
            E = !0;if ("function" != typeof e) throw new TypeError(c);return t = a(t) || 0, o(n) && (S = !!n.leading, _ = "maxWait" in n, y = _ ? k(a(n.maxWait) || 0, t) : y, E = "trailing" in n ? !!n.trailing : E), m.cancel = l, m.flush = p, m;
      }function o(e) {
        var t = "undefined" == typeof e ? "undefined" : u(e);return !!e && ("object" == t || "function" == t);
      }function i(e) {
        return !!e && "object" == ("undefined" == typeof e ? "undefined" : u(e));
      }function r(e) {
        return "symbol" == ("undefined" == typeof e ? "undefined" : u(e)) || i(e) && w.call(e) == s;
      }function a(e) {
        if ("number" == typeof e) return e;if (r(e)) return f;if (o(e)) {
          var t = "function" == typeof e.valueOf ? e.valueOf() : e;e = o(t) ? t + "" : t;
        }if ("string" != typeof e) return 0 === e ? e : +e;e = e.replace(d, "");var n = p.test(e);return n || m.test(e) ? b(e.slice(2), n ? 2 : 8) : l.test(e) ? f : +e;
      }var u = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
        return typeof e === "undefined" ? "undefined" : _typeof(e);
      } : function (e) {
        return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
      },
          c = "Expected a function",
          f = NaN,
          s = "[object Symbol]",
          d = /^\s+|\s+$/g,
          l = /^[-+]0x[0-9a-f]+$/i,
          p = /^0b[01]+$/i,
          m = /^0o[0-7]+$/i,
          b = parseInt,
          v = "object" == ("undefined" == typeof t ? "undefined" : u(t)) && t && t.Object === Object && t,
          y = "object" == ("undefined" == typeof self ? "undefined" : u(self)) && self && self.Object === Object && self,
          g = v || y || Function("return this")(),
          h = Object.prototype,
          w = h.toString,
          k = Math.max,
          x = Math.min,
          j = function j() {
        return g.Date.now();
      };e.exports = n;
    }).call(t, function () {
      return this;
    }());
  }, function (e, t) {
    "use strict";
    function n(e, t) {
      a.push({ selector: e, fn: t }), !u && r && (u = new r(o), u.observe(i.documentElement, { childList: !0, subtree: !0, removedNodes: !0 })), o();
    }function o() {
      for (var e, t, n = 0, o = a.length; n < o; n++) {
        e = a[n], t = i.querySelectorAll(e.selector);for (var r, u = 0, c = t.length; u < c; u++) {
          r = t[u], r.ready || (r.ready = !0, e.fn.call(r, r));
        }
      }
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = window.document,
        r = window.MutationObserver || window.WebKitMutationObserver,
        a = [],
        u = void 0;t.default = n;
  }, function (e, t) {
    "use strict";
    function n(e, t) {
      if (!(e instanceof t)) throw new TypeError("Cannot call a class as a function");
    }function o() {
      return navigator.userAgent || navigator.vendor || window.opera || "";
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = function () {
      function e(e, t) {
        for (var n = 0; n < t.length; n++) {
          var o = t[n];o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, o.key, o);
        }
      }return function (t, n, o) {
        return n && e(t.prototype, n), o && e(t, o), t;
      };
    }(),
        r = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
        a = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
        u = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,
        c = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
        f = function () {
      function e() {
        n(this, e);
      }return i(e, [{ key: "phone", value: function value() {
          var e = o();return !(!r.test(e) && !a.test(e.substr(0, 4)));
        } }, { key: "mobile", value: function value() {
          var e = o();return !(!u.test(e) && !c.test(e.substr(0, 4)));
        } }, { key: "tablet", value: function value() {
          return this.mobile() && !this.phone();
        } }]), e;
    }();t.default = new f();
  }, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var n = function n(e, t, _n) {
      var o = e.node.getAttribute("data-aos-once");t > e.position ? e.node.classList.add("aos-animate") : "undefined" != typeof o && ("false" === o || !_n && "true" !== o) && e.node.classList.remove("aos-animate");
    },
        o = function o(e, t) {
      var o = window.pageYOffset,
          i = window.innerHeight;e.forEach(function (e, r) {
        n(e, i + o, t);
      });
    };t.default = o;
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = n(12),
        r = o(i),
        a = function a(e, t) {
      return e.forEach(function (e, n) {
        e.node.classList.add("aos-init"), e.position = (0, r.default)(e.node, t.offset);
      }), e;
    };t.default = a;
  }, function (e, t, n) {
    "use strict";
    function o(e) {
      return e && e.__esModule ? e : { default: e };
    }Object.defineProperty(t, "__esModule", { value: !0 });var i = n(13),
        r = o(i),
        a = function a(e, t) {
      var n = 0,
          o = 0,
          i = window.innerHeight,
          a = { offset: e.getAttribute("data-aos-offset"), anchor: e.getAttribute("data-aos-anchor"), anchorPlacement: e.getAttribute("data-aos-anchor-placement") };switch (a.offset && !isNaN(a.offset) && (o = parseInt(a.offset)), a.anchor && document.querySelectorAll(a.anchor) && (e = document.querySelectorAll(a.anchor)[0]), n = (0, r.default)(e).top, a.anchorPlacement) {case "top-bottom":
          break;case "center-bottom":
          n += e.offsetHeight / 2;break;case "bottom-bottom":
          n += e.offsetHeight;break;case "top-center":
          n += i / 2;break;case "bottom-center":
          n += i / 2 + e.offsetHeight;break;case "center-center":
          n += i / 2 + e.offsetHeight / 2;break;case "top-top":
          n += i;break;case "bottom-top":
          n += e.offsetHeight + i;break;case "center-top":
          n += e.offsetHeight / 2 + i;}return a.anchorPlacement || a.offset || isNaN(t) || (o = t), n + o;
    };t.default = a;
  }, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var n = function n(e) {
      for (var t = 0, n = 0; e && !isNaN(e.offsetLeft) && !isNaN(e.offsetTop);) {
        t += e.offsetLeft - ("BODY" != e.tagName ? e.scrollLeft : 0), n += e.offsetTop - ("BODY" != e.tagName ? e.scrollTop : 0), e = e.offsetParent;
      }return { top: n, left: t };
    };t.default = n;
  }, function (e, t) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });var n = function n(e) {
      e = e || document.querySelectorAll("[data-aos]");var t = [];return [].forEach.call(e, function (e, n) {
        t.push({ node: e });
      }), t;
    };t.default = n;
  }]);
});
});

require.register("source/scripts/components/calender.js", function(exports, require, module) {
'use strict';

var calender = module.exports = {

  load: function load(element) {

    root.calender = element;

    var a = moment('2016-01-01');
    var b = a.add(1, 'week');
    a.format();

    console.log(a);
  }

};
});

require.register("source/scripts/components/editor.js", function(exports, require, module) {
'use strict';

var editor = module.exports = {

    course: null,

    ticket: null,

    load_button_primary: function load_button_primary() {},

    load_button_secondary: function load_button_secondary() {},

    load_overlay: function load_overlay() {},

    load_background: function load_background() {},

    toggle_publish: function toggle_publish(element) {

        editor.course.published_at = editor.course.published_at ? '' : new Date();

        editor.update();
    },

    load_course: function load_course(element) {

        var key = history.state.course,
            course = root.courses.memory[key],
            colors = ['7ac673', '1abc9c', '27aae0', '2c82c9', '9365b8', '4c6972', 'ffffff', '41a85f', '00a885', '3d8eb9', '2969b0', '553982', '475577', 'efefef', 'f7da64', 'faaf40', 'eb6b56', 'e25041', 'a38f84', '28324e', 'cccccc', 'fac51c', 'f97352', 'd14841', 'b8312f', '7c706b', '000000', 'c1c1c1'];

        if (editor.ticket) root.main.classList.add('ticket-mode');

        editor.looping = Math.random();

        editor.tooltip(editor.looping);

        editor.course = course;

        editor.element = element;

        element.dataset.published = course.published_at ? 'yes' : 'no';

        element.dataset.device = 'desktop';

        if (!course.blocks) course.blocks = [];

        element.innerHTML = course.blocks.reduce(function (html, block, index) {

            var options = Object.keys(block.options).reduce(function (html, option) {
                return html + ' data-' + option + '="' + block.options[option].value + '"';
            }, '');

            return html + '<div class="block" ' + options + ' data-key="' + block.key + '" data-index="' + index + '">\n        ' + block.html + '\n        <div class="block-tooltip" data-index="' + index + '" data-load="editor.load_tooltip">\n          <div class="inner">\n           <div class="color-picker">' + colors.map(function (c) {
                return '<b style="background-color:#' + c + ';"></b>';
            }).join('') + '</div>\n           <div class="set-link"><button>set link</button></div>\n           <i data-click="editor.toggle_tooltip_submenu" data-tab="link" class="fa fa-link"></i>\n           <span data-click="editor.toggle_tooltip_submenu" data-tab="color" class="color"><i class="fa fa-paint-brush"></i></span>\n           <i data-click="editor.toggle_tooltip_submenu" data-tab="align" class="fa fa-align-left"></i>\n           <i data-click="editor.toggle_tooltip_submenu" data-tab="add" class="fa fa-plus"></i>\n           <i data-click="editor.toggle_tooltip_submenu" data-tab="delete" class="fa fa-trash"></i>\n          </div>\n        </div>\n        <div class="block-options">\n          <a data-index="' + index + '" data-action="move-up" data-load="labels.title_move_up" data-click="editor.update" class="control-btn fa fa-arrow-up"></a>\n          <a data-index="' + index + '" data-action="move-down" data-load="labels.title_move_down" data-click="editor.update" class="control-btn fa fa-arrow-down"></a>\n          <a data-load="labels.title_options" class="control-btn fa fa-cog"></a>\n          <div class="block-config">' + Object.keys(block.options).reduce(function (html, option, id) {

                var element = '<label for="input-' + id + '" data-load="labels.' + option + '"></label><br>';

                if (block.options[option].type == 'boolean') element = '<input data-option="' + option + '" data-index="' + index + '" data-change="editor.input_save" ' + (block.options[option].value ? 'checked' : '') + ' id="input-' + id + '" type="checkbox">' + element;

                return '' + html + element;
            }, '') + '</div>\n          <a data-action="delete" data-index="' + index + '" data-load="labels.title_delete" data-click="editor.update" class="control-btn fa fa-trash"></a>\n        </div>\n      </div>';
        }, '\n      <div class="control-editor">\n        <a data-load="labels.title_save" data-click="editor.update" class="control-btn fa fa-save"></a>\n        <a data-load="labels.title_online" data-click="editor.toggle_publish" class="control-btn fa fa-cloud-upload"></a>\n        <a data-load="labels.title_offline" data-click="editor.toggle_publish" class="control-btn fa fa-cloud-download"></a>\n        <a data-load="labels.title_preview" data-click="editor.preview" class="control-btn fa fa-eye"></a>\n        <a data-load="labels.title_mobile_view" data-click="editor.toggle_view" class="control-btn fa fa-mobile"></a>\n        <a data-load="labels.title_desktop_view" data-click="editor.toggle_view" class="control-btn fa fa-desktop"></a>\n        <div data-load="blocks.load"></div>\n      </div>\n    ');
    },

    toggle_tooltip_submenu: function toggle_tooltip_submenu(element) {

        var data = editor.focus.dataset,
            index = parseInt(data.index, 10),
            count = parseInt(data.count, 10),
            options = void 0;

        element.parentElement.dataset.tab = element.dataset.tab;

        switch (element.dataset.tab) {

            case 'add':

                options = editor.course.blocks[index].options[data.element];

                options.content.splice(count + 1, 0, '');

                root.main.dataset.load = root.main.dataset.load;

                break;

            case 'delete':

                options = editor.course.blocks[index].options[data.element];

                if (options.content.length < 2) options.value = false;else options.content.splice(count, 1);
                console.log(options);
                root.main.dataset.load = root.main.dataset.load;

                break;

        }
    },

    tooltip_list: [],

    load_tooltip: function load_tooltip(element) {

        editor.tooltip_list[parseInt(element.dataset.index, 10)] = element;
    },

    input_save: function input_save(element) {

        var block = editor.course.blocks[parseInt(element.dataset.index, 10)],
            option = block.options[element.dataset.option];

        if (option.type == 'boolean') option.value = !option.value;

        root.main.dataset.load = root.main.dataset.load;
    },

    tooltip: function tooltip(iteration, block) {

        if (history.state.page != 'edit' || editor.looping != iteration) return;

        var focus = document.activeElement;

        if (!focus || focus.tagName.toLowerCase() != 'textarea') {

            setTimeout(editor.tooltip, 500, iteration);

            return editor.tooltip_list.map(close);
        }

        editor.focus = focus;

        block = block || focus.parentElement;

        if (!block.parentElement) return setTimeout(editor.tooltip, 500, iteration);

        if (!block.classList.contains('block')) {

            block = block.parentElement;

            return editor.tooltip(iteration, block);
        }

        setTimeout(editor.tooltip, 500, iteration);

        var index = block.dataset.index;

        if (typeof index == 'undefined') return editor.tooltip_list.map(close);

        editor.tooltip_list[index].style.bottom = block.offsetHeight - focus.offsetTop + 'px';

        editor.tooltip_list[index].style.left = focus.offsetLeft + 'px';

        editor.tooltip_list[index].querySelector('.block-tooltip .inner').dataset.tab = '';

        var is_array = Array.isArray(editor.course.blocks[index].options[focus.dataset.element].content);

        editor.tooltip_list[index].classList[is_array ? 'add' : 'remove']('is-array');

        if (editor.tooltip_list[index].classList.contains('fade-in')) return;

        editor.tooltip_list.map(close);

        editor.tooltip_list[index].style.display = 'block';

        requestAnimationFrame(function () {

            editor.tooltip_list[index].classList.add('fade-in');
        });

        function close(element) {

            element.style.display = 'none';

            element.classList.remove('fade-in');
        }
    },

    add_block: function add_block(key) {

        var course = root.courses.memory[history.state.course],
            block = root.blocks.memory[key];

        course.blocks = course.blocks || [];

        var demo = [{ page: 'Introduction', tab: 'Part I', index: 0 }, { progress: 5 }, { tab: 'Part II', index: 2, progress: 5 }, { tab: 'Part III', index: 3, progress: 5 }, { page: 'Learning the basics', tab: 'Module A', index: 4, progress: 15 }, { progress: 15 }, { progress: 15 }, { tab: 'Module B', index: 7, progress: 10 }, { page: 'Questions', index: 8, progress: 10 }, { progress: 10 }, { progress: 10 }, { page: 'Conclusion', index: 11 }];

        block = Object.assign(demo[course.blocks.length] || {}, block);

        course.blocks.push(block);

        block.options = Object.keys(block.options).reduce(function (options, key) {

            options[key] = editor.set_option(block.options[key], key);

            return options;
        }, {});

        root.courses.updated = true;
    },

    scroll_trigger: function scroll_trigger(element) {},

    set_option: function set_option(config, property) {

        config.property = property;

        if (config.type == 'boolean') config.value = true;

        if (config.type == 'number') config.value = 2;

        return config;
    },

    load_element: function load_element(element, parent) {

        parent = parent || element.parentElement;

        if (!parent.classList.contains('block')) return editor.load_element(element, parent.parentElement);

        var index = parent.dataset.index;

        if (typeof index == 'undefined') return element.dataset.load = 'editor.load_' + key;

        index = parseInt(index, 10);

        var block = editor.course.blocks[index],
            key = element.dataset.element;

        element.dataset.input = 'editor.save';

        element.addEventListener('mouseenter', function () {
            element.focus();
        });

        if (!block.options[key]) return console.log(key, editor.course.key, index, block);

        if (!block.options[key].value) return element.style.display = 'none';

        if (!block.options[key].content) block.options[key].content = key;

        if (element.tagName.toLowerCase() == 'textarea') {

            element.value = block.options[key].content;

            if (editor.ticket) element.disabled = true;
        }

        element.dataset.index = index;

        element.dataset.load = 'editor.load_' + key;
    },

    load_button_group: function load_button_group(element) {

        var index = parseInt(element.dataset.index, 10),
            block = editor.course.blocks[index],
            options = block.options[element.dataset.element];

        element.innerHTML = options.content.map(function (string, count) {
            return '<textarea ' + (editor.ticket ? 'disabled' : '') + ' data-input="editor.save" data-count="' + count + '" data-element="button_group" data-index="' + index + '">' + string + '</textarea>';
        }).join('');
    },

    load_title: function load_title(element) {},

    load_text: function load_text(element) {},

    load_video: function load_video(element) {

        var html = '\n      <img src="/placeholder-video.png"><!--\n\n   --><input type="text" data-load="labels.youtube_placeholder"><!--\n\n   --><button data-click="editor.insert_video"></button>\n\n      <div class="player"></div>\n    ';

        element.innerHTML = html;
    },

    insert_video: function insert_video(element) {

        var input = element.previousElementSibling,
            container = element.nextElementSibling,
            iframe = document.createElement("iframe");

        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("src", 'https://www.youtube.com/embed/' + input.value);
        container.innerHTML = '';
        container.appendChild(iframe);
    },

    // only locally
    save: function save(element) {

        var index = parseInt(element.parentElement.dataset.index, 10),
            block = editor.course.blocks[index];

        if (typeof element.dataset.count == 'undefined') return block.options[element.dataset.element].content = element.value;

        var count = parseInt(element.dataset.count, 10);

        block.options[element.dataset.element].content[count] = element.value;
    },

    // updates course in server
    update: function update(element) {

        var index = parseInt(element.dataset.index, 10),
            temp_index = void 0,
            moved = void 0;

        switch (element.dataset.action) {

            case 'delete':
                editor.course.blocks.splice(index, 1);
                break;

            case 'move-down':
                if (index + 2 > editor.course.blocks.length) return;
                moved = editor.course.blocks.splice(index, 2).reverse();
                temp_index = moved[1].index;
                moved[1].index = moved[0].index;
                moved[0].index = temp_index;
                editor.course.blocks.splice(index, 0, moved[0], moved[1]);
                break;

            case 'move-up':
                if (index < 1) return;
                moved = editor.course.blocks.splice(index - 1, 2).reverse();
                temp_index = moved[1].index;
                moved[1].index = moved[0].index;
                moved[0].index = temp_index;
                editor.course.blocks.splice(index - 1, 0, moved[0], moved[1]);
                break;

        }

        editor.element.classList.add('saving');

        root.send({
            request: 'set_course',
            set: editor.course
        }, function () {

            editor.element.classList.remove('saving');

            root.main.dataset.load = root.main.dataset.load;
        });
    }

};
});

require.register("source/scripts/components/labels.js", function(exports, require, module) {
'use strict';

var LANGS = ['nl', 'en'];

var index = LANGS.indexOf(localStorage.getItem('language'));

if (index == -1) index = 0;

var labels = {
    title_move_up: [title('Omhoog'), title('Move up')],
    title_move_down: [title('Omlaag'), title('Move down')],
    title_options: [title('Opties'), title('Options')],
    title_delete: [title('Verwijder'), title('Delete')],
    title_save: [title('Opslaan'), title('Save')],
    title_online: [title('Online'), title('Online')],
    title_offline: [title('Offline'), title('Offline')],
    title_preview: [title('Preview'), title('Preview')],
    title_mobile_view: [title('Mobile'), title('Mobile')],
    title_desktop_view: [title('Desktop'), title('Desktop')],
    delete: ['Verwijder', 'Delete'],
    home: ['Home', 'Home'],
    home_text: ['De enige echte privéstudio!', 'The only real private studio!'],
    home_intake_button: ['Gratis intake', 'Free intake'],
    home_nutrition: ['Voeding', 'Nutrition'],
    home_nutrition_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_training: ['Training', 'Training'],
    home_training_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_lifestyle: ['Lifestyle', 'Lifestyle'],
    home_lifestyle_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_share_page: ['Deel deze pagina', 'Share this page'],
    home_joris_merel: ['Joris Boon en Merel Witkamp', 'Joris Boon and Merel Witkamp'],
    home_joris_merel_description: ["Mogen we ons even aan u voorstellen. Wij zijn Joris Boon en Merel Witkamp. We zijn beiden fanatieke sporttrainers waarbij we weten dat individuele training allereerst tot resultaat moet leiden bijvoorbeeld afvallen, vitaler of gewoon \'je beter voelen\'. Maar we weten ook dat training alleen vaak niet voldoende is. Vandaar dat we een uniek coachingprogramma hebben geïntroduceerd onder de noemer \'Managers Vitality: for a work - life balance that boosts your management performance'. Het gaat dan om een programma om een betere werk - privé balans te vinden (ook in relatie tot fitness) alsmede omveel betere resultaten op het werk te behalen. Het focust zich op de '7th habit' van managementgoeroe Stephan Covey waar hij heeft over 'het scherp houden van de zaag'. Inmiddels hebben al vele managers zich voor dit programma ingeschreven.", "May we introduce ourselves to you, we are Joris Boon and Merel Witkamp We are both fanatical sports trainers where we know that individual training should lead to results first, for example losing weight, being more vital or just 'feeling better'. also that training alone is often not sufficient, which is why we have introduced a unique coaching program under the heading 'Managers Vitality: for a work - life balance that boosts your management performance' - a program for a better work - private life. To find a balance (also in relation to fitness) as well as to achieve much better results at work, it focuses on the '7th habit' of management guru Stephan Covey, who talks about 'keeping the saw sharp'. managers registered for this program."],
    team_text: ['Mogen wij uw personal trainer of personal coach zijn?', 'Can we be your personal trainer or personal coach?'],
    team_intro_1: ["Joris Boon en Merel Witkamp, beiden met een jarenlange ervaring in de sportbranche, bundelen hun krachten om jou een training op maat te kunnen bieden. Joris Boon is een zeer ervaren trainer op het gebied van vechtsport en krachttraining. Met zijn 25 jaar ervaring als sportinstructeur weet hij deze technieken perfect toe te passen bij personal training. Merel Witkamp is thuis in de wereld van personal training, yoga en pilates. Daarnaast is ze gespecialiseerd in revalidatietraining en revalidatietraining voor ex-kankerpatiënten.", "Joris Boon and Merel Witkamp, both with years of experience in the sports industry, join forces to offer you a tailor-made training. Joris Boon is a very experienced trainer in the field of martial arts and strength training. With his 25 years of experience as a sports instructor he knows how to perfectly apply these techniques to personal training. Merel Witkamp is at home in the world of personal training, yoga and pilates. She is also specialized in rehabilitation training and rehabilitation training for ex-cancer patients."],
    team_intro_2: ["Afgelopen jaar besloten wij om samen een privéstudio te openen in een eigen luxe stijl. Een privéstudio waar je in alle rust ook echt privé traint! Jij alleen samen met een van ons. We willen jou door onze persoonlijke begeleiding helpen om op een snelle en effectieve wijze je doelen te verwezenlijken. Door het brede aanbod van krachttraining, conditietraining, revalidatietraining, bokstraining, yoga en pilates kunnen we jou de training bieden die op je lijf geschreven is. Durf jij nu de stap te nemen?", "Last year we decided to open a private studio together in our own luxury style. A private studio where you can practice private training in peace! You alone with one of us. We want to help you through our personal guidance to realize your goals in a fast and effective way. Through the wide range of strength training, fitness training, rehabilitation training, boxing training, yoga and pilates we can offer you the training that is right for you. Do you dare to take the step now?"],
    add: ['Toevoegen', 'Add'],
    invite: ['Uitnodigen', 'Invite'],
    team: ['Team', 'Team'],
    sign_in: [value('Inloggen'), value('Sign in')],
    sign_in_link: ['Inloggen', 'Sign in'],
    sign_in_input: [value('Inloggen', value('Sign in'))],
    sign_out: ['Uitloggen', 'Sign out'],
    courses: ['Cursussen', 'Courses'],
    invitations: ['Uitnodigingen', 'Invitations'],
    stats: ['Statistieken', 'Statistics'],
    confirm_delete: ['Bevestig verwijdering', 'Confirm deletion'],
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
    login_password: ['WACHTWOORD', 'PASSWORD'],
    edit_password: ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD'],
    old_password: [placeholder('oud wachtwoord'), placeholder('old password')],
    new_password: [placeholder('nieuw wachtwoord'), placeholder('new password')],
    placeholder_search: [placeholder('Zoeken'), placeholder('Search')],
    save_profile: [value('Sla profiel op'), value('Save profile')],
    clients: ['Klanten', 'Clients'],
    app_settings: ['App instellingen', 'App settings'],
    name: [placeholder('Naam'), placeholder('Name')],
    password: [placeholder('Wachtwoord'), placeholder('Password')],
    send_invite: ['Verstuur uitnodiging', 'Send invite'],
    events: ['Evenementen', 'Events'],
    title: ['Show Title', 'Show Title'],
    text: ['Show Text', 'Show Text'],
    button_primary: ['Show Primary Button', 'Show Primary Button'],
    button_secondary: ['Show Secondary Button', 'Show Secondary Button'],
    buttons: ['Show Buttons', 'Show Buttons'],
    button_group: ['Show Buttons', 'Show Buttons'],
    arrow: ['Show Arrow', 'Show Arrow'],
    content_align: ['Content Align', 'Content Align'],
    background: ['Background', 'Background'],
    parallax: ['Parallax', 'Parallax'],
    background_color: ['Background Color', 'Background Color'],
    background_video: ['Background Video', 'Background Video'],
    overlay: ['Overlay', 'Overlay'],
    services: ['Diensten', 'Services'],
    contact_name: ['Naam', 'Name'],
    contact_email: ['Email', 'Email'],
    contact_message: ['Bericht', 'Message'],
    send: ['Verstuur', 'Send'],
    progress: ['Progressie', 'Progress'],
    video: ['Video', 'Video'],
    youtube_placeholder: [placeholder('mXq8SekC5Qg'), placeholder('mXq8SekC5Qg')],
    points: ['Punten', 'Points']
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

require.register("source/scripts/components/upload.js", function(exports, require, module) {
'use strict';

var component = {
    render: render,
    uploads: {},
    busy: false
};

module.exports = component;

function render(elem) {

    elem.addEventListener('dragover', hover);

    elem.addEventListener('dragleave', hover);

    elem.addEventListener('click', clicked);

    elem.addEventListener('change', changed);

    elem.innerHTML = '<input type="file" multiple="multiple"><div class="progress"><span></span></div>';
}

function clicked(e) {

    if (e.target.dataset.action != 'select') return e;

    e.stopPropagation();

    find_elem(e).firstElementChild.click();
}

function hover(e) {

    e.stopPropagation();

    find_elem(e).classList[e.type == 'dragover' ? 'add' : 'remove']('input-hover');
}

function find_elem(e, elem) {

    elem = elem || e.target;

    if (!elem.parentElement) return;

    if (elem.dataset.load) return elem;

    return find_elem(e, elem.parentElement);
}

function changed(e) {

    extract(e);

    return e;
}

function extract(e) {

    e.stopPropagation();

    var files = e.target.files,
        elem = find_elem(e);

    for (var i = 0; i < files.length; i++) {

        var img = new Image();

        elem.appendChild(img);

        img.onload = loaded;

        img.src = URL.createObjectURL(files[i]);
    }
}

function loaded(e) {

    var props = {
        img: e.target,
        width: e.target.clientWidth,
        height: e.target.clientHeight,
        ratio: e.target.clientWidth / e.target.clientHeight
    };

    upload(e, read(e, paint(e, scale(props))));
}

function scale(props) {

    var w = props.width,
        h = props.height,
        r = props.ratio;

    if (w < 800) {
        props.height = Math.floor(800 / r);
        props.width = 800;
    }

    if (h < 300) {
        props.width = Math.floor(300 * r);
        props.height = 300;
    }

    if (h > 1080) {
        props.width = Math.floor(1080 * r);
        props.height = 1080;
    }

    if (w > 1920) {
        props.height = Math.floor(1920 / r);
        props.width = 1920;
    }

    return props;
}

function paint(e, props) {

    props.canvas = document.createElement('canvas');

    var elem = find_elem(e);

    props.elem = elem;

    elem.appendChild(props.canvas);

    props.canvas.width = props.width;

    props.canvas.height = props.height;

    props.canvas.getContext('2d').drawImage(props.img, 0, 0, props.width, props.height);

    elem.removeChild(props.img);

    return props;
}

function read(e, props) {

    props.blob = new Blob([new Uint8Array([].map.call(atob(props.canvas.toDataURL('image/jpeg').split(',')[1]), function (b, i, binary) {
        return binary.charCodeAt(i);
    }))], { type: 'image/jpeg' });

    props.canvas.parentElement.removeChild(props.canvas);

    return props;
}

function upload(e, props) {

    var elem = props.elem,
        indicator = elem.querySelector('.progress'),
        xhr = new XMLHttpRequest();

    xhr.open('PUT', '/upload', true);

    xhr.upload.addEventListener('progress', progress);

    xhr.addEventListener('load', function (e) {
        return load(props, 0, e);
    });

    xhr.send(props.blob);

    function load(props, count, e) {

        if (!xhr.responseText) return;

        root.send({
            request: 'set_course',
            set: { key: elem.dataset.key, thumbnail: JSON.parse(xhr.responseText).url }
        }, function (res) {

            var course = root.courses.memory[elem.dataset.key];

            elem.style.backgroundImage = 'url(' + course.thumbnail + ')';
        });
    }

    function progress(e) {

        component.uploads[props.url] = {
            loaded: e.loaded,
            total: e.total
        };

        var uploads = Object.keys(component.uploads);

        if (!uploads.length) return setTimeout(function () {

            indicator.style.display = 'none';
        }, 500);

        var aggregate = uploads.reduce(function (memo, url) {

            memo.total += component.uploads[url].total;

            memo.loaded += component.uploads[url].loaded;

            return memo;
        }, { loaded: 1, total: 1 });

        var percentage = Math.floor(100 * aggregate.loaded / aggregate.total);

        indicator.innerHTML = '<span style="width:' + percentage + '%;"></span>' + percentage + '%';

        if (percentage != 100) {

            component.busy = true;

            indicator.style.display = 'block';
        } else component.busy = false;
    }
}
});

;require.register("source/scripts/listeners.js", function(exports, require, module) {
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

window.AOS = require('./components/aos.js');

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

  upload: require('./components/upload.js'),

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
  }var ws = new WebSocket(DEV_MODE ? 'ws://localhost:443/' + query : 'wss://vitalityone.fearless-apps.com/' + query);

  ws.addEventListener('message', function listener(e) {

    incoming(JSON.parse(e.data), callbacks);

    ws.removeEventListener('message', listener);

    ws.addEventListener('message', function (e) {
      return incoming(JSON.parse(e.data), callbacks);
    });
  });

  root.send = Send(ws, callbacks);
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

  if (history.state.page == 'home') root.sessions.url('/courses');

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