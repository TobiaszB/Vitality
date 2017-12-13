let users = module.exports = {

  memory: {},

  add: (element) => {

    root.send({ request: 'new_user' });

  },

  load_profile: (element) => {

    let user = root.users.memory[root.me.user];

    element.innerHTML = `

        <img class="avatar" src="${ user.avatar }"><br>

        <div class="divider horizontal grey"></div>

        <input type="input" value="${ user.name }"><br>

        <a data-load="labels.sign_out" data-click="sessions.sign_out"></a>

    `;

  },

  load_profile_link: (element) => {
    
    if(!root.me) return setTimeout(users.load_profile_link, 200, element);

    if(!root.me.user) return console.log('not logged in');

    let user = users.memory[root.me.user];

    if(!user) return;

    element.innerHTML = `

      <div class="img-container"><img src="${ user.avatar }"></div>
      <span>${ user.name }</span>
      
    `;

  },
  
  load_permissions: (element) => {

    element.innerHTML = `
      <label class="dark-grey" data-load="labels.permissions"></label><br>

      <div class="row">
        <input id="add" data-load="users.load_permission" data-change="users.update_permission" type="checkbox">
        <label for="add" class="task fa fa-user-plus"></label>
        <input disabled type="text" value="ADMIN">
      </div>

     ${ users.render_tasks() }
      `;
    
  },

  render_tasks: () => {

    let user = users.memory[root.me.user];

    return user.tasks.reduce((memo, task, index) => {

      memo += `
      <div class="row">
        ${ task ? `<input id="task-${ index }" data-load="users.load_permission" data-change="users.update_permission" type="checkbox">` : '' }
        <label for="task-${ index + 1 }" class="task task-${ index + 1 }">${ index + 1 }</label>
        <input placeholder="NIEUW" data-index="${ index }" data-input="users.update_task" type="text" value="${ task }">
      </div>`;

      return memo;

    }, '');

  },

  load_permission: (input) => {

    if(
    (input.id == 'add' && root.me.add_permission) ||
    (input.id == 'archive' && root.me.archive_permission) ||
    root.me.tasks[parseInt(input.id.replace('task-', ''), 10)]
    ) input.setAttribute('checked', true);

  },

  update_permission: (input) => {

    if(input.id == 'add') return root.send({ request: 'update_permission', add_permission: input.checked });

    if(input.id == 'archive') return root.send({ request: 'update_permission', archive_permission: input.checked });

    let tasks = users.memory[root.me.user].tasks.map((task, index) => {

      if(index == parseInt(input.id.replace('task-', ''), 10)) return input.checked ? task : '';

      return root.me.tasks[index] ? task : '';

    });

    tasks.pop();

    root.send({ request: 'update_permission', tasks: tasks });

  },

  update_task: (element) => {

   let index = element.dataset.index,
       tasks = users.memory.users_admin.tasks.slice();

    tasks[parseInt(element.dataset.index, 10)] = element.value;

    let update = tasks.reduce((memo, task) => {

      if(!task) return memo;

      memo.push(String(task).toUpperCase());

      return memo;

    }, []);

    update.push('');

    root.send({ request: 'update_tasks', tasks: update }, (user) => {

      if(tasks.length == update.length) return;
      
      let elem = document.querySelector('[data-load="users.load_permissions"]');

      users.load_permissions(elem);

        let input = document.querySelector(`[data-index="${ index }"]`)

        input.focus();
        
        input.selectionStart = input.selectionEnd = input.value.length;

    });

  },

  save_email: (input) => {

    localStorage.setItem('remember_email', input.value);

  },

  load_email: (input) => {

    input.value = localStorage.getItem('remember_email') || '';

    input.focus();

  },


  list: (element) => {

    if(!element) return;

    element.innerHTML = ``;

    root.labels.loading(element);

    requestAnimationFrame(()=> {

      let search = String(localStorage.getItem('search') || '').toLowerCase();

      users.render(element, search);

    });

  },


  render: (element, search, keys, iteration) => {

    if(!element) return;

    if(!iteration) iteration = element.dataset.iteration = 'i' + Math.floor(Math.random() * 1000);

    if(element.dataset.iteration != iteration) return;

    keys = keys || Object.keys(users.memory);

    if(!keys.length) {

        if(!element.children.length) return root.labels.no_results(element);

        return element.dataset.title = '';

    }

    let user = users.memory[keys.shift()];

    if(!user || user.archived ||
       (search && String(user.name).toLowerCase().indexOf(search) == -1)
     ) {

       if(keys.length % 100 == 0) return requestAnimationFrame(()=> {

         users.render(element, search, keys, iteration);

       });

       return users.render(element, search, keys, iteration);

     }

     requestAnimationFrame(()=> {

      users.render(element, search, keys, iteration);

    });

    let elem = document.createElement('div');

    elem.dataset.load = 'users.render_one';

    elem.dataset.user = user.key;

    element.appendChild(elem);

  },

  edit: (element, options) => {

    let request = {
       request: 'edit',
       key: element.dataset.user
     };

     let v = options ? options.value : element.value;

     request[element.dataset.property] = v;

     root.send(request, options ? options.callback : null);

  },
  
  archive: (element) => {

    let user = users.memory[element.dataset.key];

    root.send({ request: 'archive', key: user.key }, () => {

      users.updated = true;
      
    });

  },

  render_one: (element) => {

    let user = users.memory[element.dataset.user];

    let tasks = users.memory[root.me.user].tasks.reduce((html, task, index) => {

      if(task) html += `<div data-index="${ index }" data-user="${ user.key }" data-click="users.toggle_task" class="small">${ task }</div>`;

      return html;

    }, '');

    element.innerHTML = `
      <div>
        <input placeholder="Name" data-property="name" data-user="${ user.key }" data-input="users.edit" type="text" value="${ user.name || '' }">
      </div>
      <div>
        <input placeholder="example@email.com" data-property="email" data-user="${ user.key }" data-input="users.edit" type="text" value="${ user.email || '' }">
      </div>
      <div>
        <input placeholder="Password" data-property="password" data-user="${ user.key }" data-input="users.edit" type="password">
      </div>
      <div>
        <select data-property="role" value="${ user.role }" data-user="${ user.key }" data-change="users.edit">
          <option${ user.role == 'intern' ? ' selected' : '' } value="intern">Intern</option>
          <option${ user.role == 'driver' ? ' selected' : '' } value="driver">Chauffeur</option>
          <option${ user.role == 'admin' ? ' selected' : '' } value="admin">Admin</option>
        </select>
      </div>
      <div>
        <button data-click="users.archive" data-key="${ user.key }">ARCHIVEER</button>
      </div>
    `;

    if(!user.name) element.querySelector('input').focus();

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

  save_search: (element) => {

	localStorage.setItem('search', element.value);

	users.updated = true;

  }

  
};

(function updater(){

  if(!users.updated) return setTimeout(updater, 300);

  users.updated = false;

  // updater();

}());