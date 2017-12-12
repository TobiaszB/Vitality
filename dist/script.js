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
require.register("source/scripts/collections/customers.js", function(exports, require, module) {
'use strict';

var customers = module.exports = {

    memory: {},

    add: function add(element) {

        root.send({ request: 'new_customer' });
    },

    save_search: function save_search(element) {

        localStorage.setItem('search', element.value);

        customers.updated = true;
    },

    edit: function edit(element, options) {

        var request = {
            request: 'edit',
            key: element.dataset.customer
        };

        var v = options ? options.value : element.value;

        request[element.dataset.property] = v;

        root.send(request, options ? options.callback : null);
    },

    list: function list(element) {

        if (!element) return;

        element.innerHTML = '';

        root.labels.loading(element);

        requestAnimationFrame(function () {

            var search = String(localStorage.getItem('search') || '').toLowerCase();

            customers.render(element, search);
        });
    },

    render: function render(element, search, keys, iteration) {

        if (!element) return;

        if (!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

        if (element.dataset.iteration != iteration) return;

        keys = keys || Object.keys(customers.memory);

        if (!keys.length) {

            if (!element.children.length) return root.labels.no_results(element);

            return element.dataset.title = '';
        }

        var customer = customers.memory[keys.shift()];

        if (!customer || customer.archived || search && String(customer.name).toLowerCase().indexOf(search) == -1) {

            if (keys.length % 100 == 0) return requestAnimationFrame(function () {

                customers.render(element, search, keys, iteration);
            });

            return customers.render(element, search, keys, iteration);
        }

        requestAnimationFrame(function () {

            customers.render(element, search, keys, iteration);
        });

        var elem = document.createElement('div');

        elem.dataset.load = 'customers.render_one';

        elem.dataset.customer = customer.key;

        element.appendChild(elem);
    },

    archive: function archive(element) {

        var customer = customers.memory[element.dataset.key];

        root.send({ request: 'archive', key: customer.key }, function () {

            customers.updated = true;
        });
    },

    render_one: function render_one(element) {

        var customer = customers.memory[element.dataset.customer];

        element.innerHTML = '\n      <div class="customer-container">\n        <input placeholder="Naam" data-property="name" data-customer="' + customer.key + '" data-input="customers.edit" type="text" value="' + customer.name + '">\n      </div>\n      <div class="customer-container">\n        <input placeholder="Adres" data-property="address" data-customer="' + customer.key + '" data-input="customers.edit" type="text" value="' + customer.address + '">\n      </div>\n      <div>\n        <button data-key="' + customer.key + '" data-click="customers.archive">ARCHIVEER</button>\n      </div>\n    ';

        if (!customer.name) element.querySelector('input').focus();

        function format(date) {

            date = new Date(date);

            var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

            if (!date || String(date).toLowerCase() == 'invalid date') return '';

            return '\n        ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + '\n        ' + date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes() + '\n      ';
        }
    }

};

(function updater() {

    if (!customers.updated) return setTimeout(updater, 300);

    if (root.me.launched) customers.list(document.querySelector('[data-load="customers.list"]'));

    customers.updated = false;

    updater();
})();
});

require.register("source/scripts/collections/orders.js", function(exports, require, module) {
'use strict';

var tmp = void 0;

var orders = module.exports = {

  add: function add(element) {

    root.ws.send(JSON.stringify({ request: 'new_order' }));
  },

  save_search: function save_search(element) {

    localStorage.setItem('search', element.value);

    orders.updated = true;
  },

  list: function list(element) {

    if (!element) return;

    element.innerHTML = '';

    root.labels.loading(element);

    requestAnimationFrame(function () {

      var search = String(localStorage.getItem('search') || '').toLowerCase();

      orders.render(element, search);
    });
  },

  render: function render(element, search, keys, iteration) {

    if (!element) return;

    if (!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    if (element.dataset.iteration != iteration) return;

    keys = keys || Object.keys(orders.memory);

    if (!keys.length) {

      if (!element.children.length) return root.labels.no_results(element);

      return element.dataset.title = '';
    }

    var order = orders.memory[keys.shift()];

    if (!order || search && String(order.customer).toLowerCase().indexOf(search) == -1) {

      if (keys.length % 100 == 0) return requestAnimationFrame(function () {

        orders.render(element, search, keys, iteration);
      });

      return orders.render(element, search, keys, iteration);
    }

    requestAnimationFrame(function () {

      orders.render(element, search, keys, iteration);
    });

    var elem = document.createElement('div');

    elem.dataset.load = 'orders.render_one';

    elem.dataset.order = order.key;

    element.appendChild(elem);
  },

  save_date: function save_date(element) {

    var data = element.parentElement.dataset;

    orders.edit(element.parentElement, {
      value: element.parentElement.querySelector('input').value,
      callback: function callback() {
        orders.render_one(document.querySelector('[data-order="' + data.order + '"][data-load="orders.render_one"]'));
      }
    });
  },

  edit_date: function edit_date(element) {

    if (!element || element.dataset.clicked) return;

    var order = orders.memory[element.dataset.order],
        value = order[element.dataset.property],
        date = value ? new Date(value) : new Date();

    element.dataset.clicked = true;

    element.innerHTML = '\n      <input type="datetime-local" value="' + date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + 'T' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '">\n      <button class="blue" data-click="orders.save_date">opslaan</button>\n    ';
  },

  edit: function edit(element, options) {

    var request = {
      request: 'edit',
      key: element.dataset.order
    };

    var v = options ? options.value : element.value;

    if (['arrival', 'departure'].indexOf(element.dataset.property) > -1) {

      v = new Date(v).toJSON();
    }

    request[element.dataset.property] = v;

    root.send(request, options ? options.callback : null);
  },

  toggle_status: function toggle_status(element) {

    var order = orders.memory[element.dataset.order],
        index = order.tasks.indexOf(order.status);

    element.dataset.index = index;

    orders.toggle_task(element);
  },

  render_one: function render_one(element) {

    var order = orders.memory[element.dataset.order];

    var tasks = root.users.memory[root.me.user].tasks.reduce(function (html, task, index) {

      if (task) html += '<div data-index="' + index + '" data-order="' + order.key + '" data-click="orders.toggle_task" class="small tag' + (order.tasks[index] ? ' active' : '') + '">' + task + '</div>';

      return html;
    }, '');

    element.innerHTML = '\n      <div class="customer-container">\n        <form class="prefiller" data-submit="prefill.submit">\n          <ul></ul>\n          <input data-property="customer" data-collection="customers" data-key="' + order.key + '" data-load="prefill.load" type="text">\n          <input type="submit">\n        </form>\n      </div>\n      <div class="customer-container">\n        <form class="prefiller" data-submit="prefill.submit">\n          <ul></ul>\n          <input data-property="driver" data-collection="users" data-key="' + order.key + '" data-load="prefill.load" type="text">\n          <input type="submit">\n        </form>\n      </div>\n      <div class="task-container">\n        <div data-order="' + order.key + '" data-click="orders.toggle_status" data-index="' + order.tasks.indexOf(order.status) + '" class="tag active">' + order.status + '</div>\n      </div>\n      <div class="date-container" data-property="arrival" data-order="' + order.key + '" data-click="orders.edit_date">' + format(order.arrival) + '</div>\n      <div class="date-container" data-property="departure" data-order="' + order.key + '" data-click="orders.edit_date">' + format(order.departure) + '</div>\n      <div class="task-container grouped">' + tasks + '</div>\n      <div><input data-property="cargo" data-order="' + order.key + '" data-input="orders.edit" type="text" value="' + (order.cargo || '') + '"></div>\n      <div><input data-property="contents" data-order="' + order.key + '" data-input="orders.edit" type="text" value="' + (order.contents || '') + '"></div>\n      <div><input data-property="extra" data-order="' + order.key + '" data-input="orders.edit" type="text" value="' + (order.extra || '') + '"></div>\n      <div><select data-property="repeat" data-order="' + order.key + '" data-change="orders.edit">\n        <option' + (order.repeat == '' ? ' selected' : '') + ' value="">Niet</option>\n        <option' + (order.repeat == 'week' ? ' selected' : '') + ' value="week">Week</option>\n        <option' + (order.repeat == 'month' ? ' selected' : '') + ' value="month">Maand</option>\n      </select></div>\n    ';

    if (!order.customer) element.querySelector('input').focus();

    function format(date) {

      date = new Date(date);

      var months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

      if (!date || String(date).toLowerCase() == 'invalid date') return '';

      return '\n        ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + '\n        ' + date.getHours() + ':' + (String(date.getMinutes()).length > 1 ? '' : 0) + date.getMinutes() + '\n      ';
    }
  },

  toggle_task: function toggle_task(element) {

    var index = parseInt(element.dataset.index, 10),
        order = orders.memory[element.dataset.order],
        tasks = order.tasks.slice(),
        status = 'AFGEHANDELD';

    tasks[index] = tasks[index] ? '' : root.users.memory[root.me.user].tasks[index];

    for (var i = 0; i < tasks.length; i++) {

      if (tasks[i] == '') continue;

      status = tasks[i];

      break;
    }

    root.send({ request: 'edit', key: order.key, status: status, tasks: tasks }, function () {

      orders.render_one(document.querySelector('[data-order="' + order.key + '"][data-load="orders.render_one"]'));
    });
  },

  memory: {}

};

(function updater() {

  if (!orders.updated) return setTimeout(updater, 300);

  if (root.me.launched) orders.list(document.querySelector('[data-load="orders.list"]'));

  orders.updated = false;

  updater();
})();
});

require.register("source/scripts/collections/sessions.js", function(exports, require, module) {
'use strict';

module.exports = {

    memory: {},

    load: function load() {

        root.main = document.querySelector('main');

        if (!root.main) return setTimeout(load, 0);
    },

    sign_in: function sign_in(element) {

        root.send({
            request: 'sign_in',
            email: element.parentElement.querySelector('[type="email"]').value || '',
            password: element.parentElement.querySelector('[type="password"]').value || ''
        });
    },

    sign_out: function sign_out(element) {

        root.ws.send(JSON.stringify({ request: 'sign_out' }));
    },

    check_passwords: function check_passwords(element) {

        var inputs = root.main.querySelectorAll('input[type="password"]');

        if (!inputs[0].value && !inputs[2].value) return root.sessions.launch();

        if (inputs[0].value != inputs[1].value) return alert('not equal');

        root.send({
            request: 'set_password',
            old_password: inputs[0].value,
            password: inputs[2].value || ''
        }, function (res) {

            root.sessions.launch();
        });
    },

    launch: function launch() {

        root.send({ request: 'launch' });
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

        if (!options || !options.prevent_url) root.sessions.url('/' + page);

        window.scrollTo(0, 0);
    },

    url: function url(state, options) {

        var defaulted = 'landing';

        var operation = options && options.replace ? 'replaceState' : 'pushState';

        var url = typeof state == 'string' ? decode() : location.pathname;

        return history[operation](state ? state : decode(), options ? options.title : document.title, state ? encode() : pathname);

        function encode() {

            var page = state ? state.page || defaulted : defaulted;

            return Object.keys(state).reduce(function (url, key) {

                if (key == 'page') return url;

                return url + '/' + key + '/' + state[key];
            }, '/' + (page == defaulted ? '' : page));
        }

        function decode() {

            var parts = (state || location.pathname).split(/\//g);

            state = {};

            for (var i = 0; i < parts.length; i += 2) {

                state[parts[i] || 'page'] = parts[i + 1];
            }

            state.page = state.page || 'landing';

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

require.register("source/scripts/collections/users.js", function(exports, require, module) {
'use strict';

var users = module.exports = {

    memory: {},

    add: function add(element) {

        root.ws.send(JSON.stringify({ request: 'new_user' }));
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

    if (root.me.launched) users.list(document.querySelector('[data-load="users.list"]'));

    users.updated = false;

    updater();
})();
});

require.register("source/scripts/components/labels.js", function(exports, require, module) {
'use strict';

var _labels;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LANGS = ['nl', 'en'];

var index = LANGS.indexOf(localStorage.getItem('language'));

if (index == -1) index = 0;

var labels = (_labels = {
  landing: ['Welkom', 'Landing'],
  add: ['Toevoegen', 'Add'],
  about: ['Over Ons', 'About'],
  sign_in: ['Inloggen', 'Sign in'],
  sign_out: ['Uitloggen', 'Sign out'],
  courses: ['Cursussen', 'Courses'],
  profile: ['Profiel', 'Profile'],
  invitations: ['Uitnodigingen', 'Invitations'],
  stats: ['Statistieken', 'Statistics'],
  no_results: [title('Geen resultaten'), title('No results')],
  loading: [title('Laden...'), title('Loading...')],
  placeholder_search: [placeholder('zoeken'), placeholder('search')],
  password: ['WACHTWOORD', 'PASSWORD'],
  permissions: ['PERMISSIES', 'PERMISSIONS'],
  configure_ipad: ['CONFIGUREER DEZE IPAD', 'CONFIGURE THIS IPAD'],
  save: ['START DE APP', 'LAUNCH THE APP']
}, _defineProperty(_labels, 'password', ['WACHTWOORD', 'PASSWORD']), _defineProperty(_labels, 'edit_password', ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD']), _defineProperty(_labels, 'old_password', [placeholder('oud wachtwoord'), placeholder('old password')]), _defineProperty(_labels, 'new_password', [placeholder('nieuw wachtwoord'), placeholder('new password')]), _labels);

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
});

;require.register("source/scripts/components/prefill.js", function(exports, require, module) {
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

    if (!target) {

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

  xhr.open('GET', element.dataset.load, true);

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

  customers: require('./collections/customers.js'),

  sessions: require('./collections/sessions.js'),

  labels: require('./components/labels.js'),

  prefill: require('./components/prefill.js'),

  orders: require('./collections/orders.js'),

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
  }new WebSocket(DEV_MODE ? 'ws://localhost:443/' + query : 'wss://tsr.fearless-apps.com/' + query).addEventListener('message', function listener(e) {

    root.ws = e.target;

    root.send = Send(e.target, callbacks);

    incoming(JSON.parse(e.data), callbacks);

    root.ws.removeEventListener('message', listener);

    root.ws.addEventListener('message', function (e) {
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

    callbacks[cb] = callback;

    ws.send(JSON.stringify(data));
  };
}

function incoming(message, callbacks) {

  if (message instanceof Array) {

    if (Object.keys(root.orders.memory).length) root.updated = true;

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

  if (!message.token) root.sessions.url('/');else if (localStorage.getItem('authenticated') && !message.launched) root.sessions.url('/');else if (history.state && history.state.page == 'admin') root.sessions.url('/');

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