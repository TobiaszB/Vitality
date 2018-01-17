let courses = module.exports = {

  // here we save all courses in client memory
  // { [key]: OBJECT }
  memory: {},

  // button is placed to the right of the title of the page
  add: (element) => {

    // root.send is used to talk to the server
    root.send({ request: 'new_course' });

  },

  load_courses: (element) => {

    let keys = Object.keys(root.users.memory),
        html = '';

    element.innerHTML = Object.keys(root.courses.memory).reduce((html, key) => {

      let course = root.courses.memory[key];

      if(course.published_at) html += `

        <div data-key="${ course.key }">
          <img src="${ course.thumbnail }">
          <span>${ course.name }</span>
        </div>

      `;

      return html;

    }, '');

  },

  // view mode can be cards or list, it has a button in the left top of the interface
  view_mode: (element) => {

    courses.mode = element.dataset.mode;

    // we put the mode also in the main, to support CSS styling
    root.main.dataset.mode = element.dataset.mode;

    // see update loop at the bottom of this file
	courses.updated = true;
    
  },
  
  // anytime the user triggers the data-input of the search field, we execute this
  save_search: (element) => {

    // used inside of courses.render()
	courses.search_query = String(element.value || '').toLowerCase();

    // see update loop at the bottom of this file
	courses.updated = true;

  },

  // goes off anytime course-related data-input is fired
  edit: (element, options) => {

    // we always need to provide a request string and the key of the object we are editing
    let request = {
       request: 'edit',
       key: element.dataset.course
     };

     // but the value we are changing shall be added dynamically,
     // so we can use this edit function straight from the HTML
     // <input data-input="courses.edit" data-key="[KEY]">
     let v = options ? options.value : element.value;

     request[element.dataset.property] = v;

     // options.callback can only be used when this function is fired manually in Javascript
     // since we cannot write a function inside of the HTML tag
     root.send(request, options ? options.callback : null);

  },

  list: (element) => {

    // we are lazy developers that do not want to select the list over and over
    // whenever we use this list function manually
    if(!element) element = document.querySelector('[data-load="courses.list"]');

    // element still not found?! we must stop this madness
    if(!element) return;

    if(history.state.course) return courses.load_course(element);
    
    // we clean out the old HTML should this function be fired after the list already rendered
    element.innerHTML = ``;

    // we show a loading text
    root.labels.loading(element);

    // and start the render loop!
    courses.render(element);

  },

  load_course: (element) => {

    element.innerHTML = `<div data-load="courses.render_one" data-course="${ history.state.course }"></div>`;

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
    if(!keys) keys = Object.keys(courses.memory);

    // the loop has finished
    if(!keys.length) {

        // sadly, no children are found inside of the element
        // this can only mean there were no results
        if(!element.children.length) return root.labels.no_results(element);

        // we had results, and are no longer loading, so lets clear that loading message
        return element.dataset.message = '';

    }

    let search = courses.search_query, // search value is changed by courses.save_search()
        course = courses.memory[keys.shift()];

    if(!course || course.archived ||
      (search && String(course.name).toLowerCase().indexOf(search) == -1) ||
      (courses.manager_filter.length && courses.manager_filter.indexOf(course.admin) == -1)
    ) {

       if(keys.length % 100 == 0) return requestAnimationFrame(()=> {

         courses.render(element, keys, iteration);

       });

       return courses.render(element, keys, iteration);

     }

     requestAnimationFrame(()=> {

      courses.render(element, keys, iteration);

    });

    let elem = document.createElement('div');

    elem.dataset.load = 'courses.render_one';

    elem.dataset.course = course.key;

    element.appendChild(elem);

  },

  archive: (element) => {

    let course = courses.memory[element.dataset.key];

    root.send({ request: 'archive', key: course.key }, () => {

      // see update loop at the bottom of this file
      courses.updated = true;
      
    });

  },

  manager_filter: [],

  toggle_manager: (element) => {

    let key = element.dataset.key,
        filter = courses.manager_filter,
        index = filter.indexOf(key);

    element.classList.toggle('active');

    if(index > -1) filter.splice(index, 1);

    else filter.push(key);

    courses.updated = true;

  },

  load_managers: (element) => {

    element.innerHTML = Object.keys(root.users.memory).reduce((html, key) => {

      let user = root.users.memory[key];

      if(user.role == 'admin') html += `<div data-click="courses.toggle_manager" data-key="${ user.key }">
        <img src="${ user.avatar }">
        <span data-load="users.memory.${ user.key }.name"></span>
      </div>`;

      return html;

    }, '');

  },

  render_one: (element) => {
    
    let course = courses.memory[element.dataset.course];

    element.dataset.key = element.dataset.course;

    element.innerHTML = courses.mode == 'list' ? `
      <input placeholder="Naam" data-property="name" data-course="${ course.key }" data-input="courses.edit" type="text" value="${ course.name }">
      <pre>${ JSON.stringify(course, null, 2) }</pre>
    ` : `
      <div data-key="${ course.key }" data-load="upload.render" class="upload thumbnail" style="background-image:url(${ course.thumbnail })"></div>
      ${ courses.course_nav(element) }
      <img src="${ root.users.memory[course.admin].avatar }">
      <input data-load="labels.name" data-property="name" data-course="${ course.key }" data-input="courses.edit" type="text" value="${ course.name }">
    `;

    if(!course.name) element.querySelector('input').focus();

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

  course_nav: (element) => {

   let course = root.courses.memory[element.dataset.key];

   return `<div class="course-nav">
        ${ course.published_at ? '<span class="published">PUBLISHED</span>' : '<span class="unpublished">UNPUBLISHED</span>' }<br>
        <a data-key="${ element.dataset.key }" data-click="courses.view" data-load="labels.view"></a>
      </div>`;
      
  },

  view: (element) => {

    root.sessions.url({ page: 'edit', course: element.dataset.key });

    root.sessions.load_page(null, { prevent_url: true });

  },


  invite: (element) => {

    let course = root.courses.memory[element.dataset.key];

    element.innerHTML = `<div class="modal">
      <i class="fa fa-times close-modal" data-click="modal.close"></i>
      <div class="content">
        <div class="thumbnail" style="background-image:url(${ course.thumbnail })"></div>
        <h3 data-load="labels.invite"></h3>
        ${ courses.course_nav(element) }
        <input placeholder="Naam" data-property="name" data-course="${ course.key }" data-input="courses.edit" type="text" value="${ course.name }">
        <span data-load="users.memory.${ course.admin }.name"></span>
      </div>
    </div>`;

  },
  
  stats: (element) => {
    
    let course = root.courses.memory[element.dataset.key];

    element.innerHTML = `<div class="modal">
      <i class="fa fa-times close-modal" data-click="modal.close"></i>
      <div class="content">
        <div class="thumbnail" style="background-image:url(${ course.thumbnail })"></div>
        <h3 data-load="labels.stats"></h3>
        ${ courses.course_nav(element) }
        <input placeholder="Naam" data-property="name" data-course="${ course.key }" data-input="courses.edit" type="text" value="${ course.name }">
        <span data-load="users.memory.${ course.admin }.name"></span>
      </div>
    </div>`;
    
  }
  
};

(function updater(){

  if(!courses.updated) return setTimeout(updater, 300);

  courses.updated = false;

  if(root.main.dataset.load == 'edit.html') root.main.dataset.load = 'edit.html'; // this correctly triggers the mutationobserver in listeners.js

  else courses.list();

  updater();

}());