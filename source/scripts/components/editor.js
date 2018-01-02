let editor = module.exports = {

  course: null,

  ticket: null,

  load_button_primary: ()=>{},

  load_button_secondary: ()=>{},

  load_overlay: ()=>{},

  load_background: ()=>{},

  toggle_publish: (element) => {

    editor.course.published_at = editor.course.published_at ? '' : new Date();

    editor.update();

  },

  load_course: (element)=>{

    let key = history.state.course,
        course = root.courses.memory[key],
        colors = ['7ac673','1abc9c','27aae0','2c82c9','9365b8','4c6972','ffffff','41a85f','00a885','3d8eb9',
                  '2969b0','553982','475577','efefef','f7da64','faaf40','eb6b56','e25041','a38f84','28324e',
                  'cccccc','fac51c','f97352','d14841','b8312f','7c706b','000000','c1c1c1'];


    if(editor.ticket) root.main.classList.add('ticket-mode');
    
    editor.looping = Math.random();

    editor.tooltip(editor.looping);

    editor.course = course;

    editor.element = element;

    element.dataset.published = course.published_at ? 'yes' : 'no';

    element.dataset.device = 'desktop';

    if (!course.blocks) course.blocks = [];

    element.innerHTML = course.blocks.reduce((html,block,index)=>{

      let options = Object.keys(block.options).reduce((html,option)=>`${html} data-${option}="${block.options[option].value}"`, '');

      return `${html}<div class="block" ${options} data-key="${block.key}" data-index="${index}">
        ${block.html}
        <div class="block-tooltip" data-index="${index}" data-load="editor.load_tooltip">
          <div class="inner">
           <div class="color-picker">${
             colors.map((c)=>`<b style="background-color:#${ c };"></b>`).join('')
           }</div>
           <div class="set-link"><button>set link</button></div>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="link" class="fa fa-link"></i>
           <span data-click="editor.toggle_tooltip_submenu" data-tab="color" class="color"><i class="fa fa-paint-brush"></i></span>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="align" class="fa fa-align-left"></i>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="add" class="fa fa-plus"></i>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="delete" class="fa fa-trash"></i>
          </div>
        </div>
        <div class="block-options">
          <a data-index="${ index }" data-action="move-up" data-load="labels.title_move_up" data-click="editor.update" class="control-btn fa fa-arrow-up"></a>
          <a data-index="${ index }" data-action="move-down" data-load="labels.title_move_down" data-click="editor.update" class="control-btn fa fa-arrow-down"></a>
          <a data-load="labels.title_options" class="control-btn fa fa-cog"></a>
          <div class="block-config">${Object.keys(block.options).reduce((html,option,id)=>{

        let element = `<label for="input-${id}" data-load="labels.${option}"></label><br>`;

        if (block.options[option].type == 'boolean') element = `<input data-option="${ option }" data-index="${ index }" data-change="editor.input_save" ${block.options[option].value ? 'checked' : ''} id="input-${id}" type="checkbox">${element}`;

        return `${html}${element}`;

      }
      , '')}</div>
          <a data-action="delete" data-index="${ index }" data-load="labels.title_delete" data-click="editor.update" class="control-btn fa fa-trash"></a>
        </div>
      </div>`;

    }
    , `
      <div class="control-editor">
        <a data-load="labels.title_save" data-click="editor.update" class="control-btn fa fa-save"></a>
        <a data-load="labels.title_online" data-click="editor.toggle_publish" class="control-btn fa fa-cloud-upload"></a>
        <a data-load="labels.title_offline" data-click="editor.toggle_publish" class="control-btn fa fa-cloud-download"></a>
        <a data-load="labels.title_preview" data-click="editor.preview" class="control-btn fa fa-eye"></a>
        <a data-load="labels.title_mobile_view" data-click="editor.toggle_view" class="control-btn fa fa-mobile"></a>
        <a data-load="labels.title_desktop_view" data-click="editor.toggle_view" class="control-btn fa fa-desktop"></a>
        <div data-load="blocks.load"></div>
      </div>
    `);

  },

  toggle_tooltip_submenu: (element) => {

    let data = editor.focus.dataset,
        index = parseInt(data.index, 10),
        count = parseInt(data.count, 10),
        options;

    element.parentElement.dataset.tab = element.dataset.tab;

    switch(element.dataset.tab) {

      case 'add':

        options = editor.course.blocks[index].options[data.element];

        options.content.splice(count + 1, 0, '');

        root.main.dataset.load = root.main.dataset.load;

        break;

      case 'delete':

        options = editor.course.blocks[index].options[data.element];

        if(options.content.length < 2) options.value = false;

        else options.content.splice(count, 1);
console.log(options)
        root.main.dataset.load = root.main.dataset.load;

        break;
        
    }
    
  },

  tooltip_list: [],

  load_tooltip: (element)=>{

    editor.tooltip_list[parseInt(element.dataset.index, 10)] = element;

  },

  input_save: (element) => {

    let block = editor.course.blocks[parseInt(element.dataset.index, 10)],
        option = block.options[element.dataset.option];

    if(option.type == 'boolean') option.value = !option.value;
    
    root.main.dataset.load = root.main.dataset.load;

  },

  tooltip: (iteration, block)=>{

    if (history.state.page != 'edit' || editor.looping != iteration) return;

    let focus = document.activeElement;

    if (!focus || focus.tagName.toLowerCase() != 'textarea') {

      setTimeout(editor.tooltip, 500, iteration);

      return editor.tooltip_list.map(close);
      
    }

    editor.focus = focus;

    block = block || focus.parentElement;

    if(!block.parentElement) return setTimeout(editor.tooltip, 500, iteration);

    if(!block.classList.contains('block')) {

      block = block.parentElement;

      return editor.tooltip(iteration, block);

    }
   
    setTimeout(editor.tooltip, 500, iteration);

    let index = block.dataset.index;

    if (typeof index == 'undefined') return editor.tooltip_list.map(close);
      
    editor.tooltip_list[index].style.bottom = `${ block.offsetHeight - focus.offsetTop }px`;

    editor.tooltip_list[index].style.left = `${ focus.offsetLeft }px`;

    editor.tooltip_list[index].querySelector('.block-tooltip .inner').dataset.tab = '';

    let is_array = Array.isArray(editor.course.blocks[index].options[focus.dataset.element].content);

    editor.tooltip_list[index].classList[is_array ? 'add' : 'remove']('is-array');

    if (editor.tooltip_list[index].classList.contains('fade-in')) return;
    
    editor.tooltip_list.map(close);
    
    editor.tooltip_list[index].style.display = 'block';

    requestAnimationFrame(()=>{

      editor.tooltip_list[index].classList.add('fade-in');

    });

    function close(element){

      element.style.display = 'none';

      element.classList.remove('fade-in');

    }

  },

  add_block: (key)=>{

    let course = root.courses.memory[history.state.course]
      , block = root.blocks.memory[key];

    course.blocks = course.blocks || [];

    let demo = [
      { page: 'Introduction', tab: 'Part I', index: 0 },
      { progress: 5 },
      { tab: 'Part II', index: 2, progress: 5 },
      { tab: 'Part III', index: 3, progress: 5 },
      { page: 'Learning the basics', tab: 'Module A', index: 4, progress: 15 },
      { progress: 15 },
      { progress: 15 },
      { tab: 'Module B', index: 7, progress: 10 },
      { page: 'Questions', index: 8, progress: 10 },
      { progress: 10 },
      { progress: 10 },
      { page: 'Conclusion', index: 11 }
    ];

    block = Object.assign(demo[course.blocks.length] || {}, block);

    course.blocks.push(block);

    block.options = Object.keys(block.options).reduce((options,key)=>{

      options[key] = editor.set_option(block.options[key], key);

      return options;

    }
    , {});

    root.courses.updated = true;

  },

  scroll_trigger: (element) =>  {
    
  },

  set_option: (config,property)=>{

    config.property = property;

    if (config.type == 'boolean') config.value = true;

    if (config.type == 'number') config.value = 2;

    return config;

  },

  load_element: (element, parent)=>{

    parent = parent || element.parentElement;

    if(!parent.classList.contains('block'))
      return editor.load_element(element, parent.parentElement);

    let index = parent.dataset.index;

    if(typeof index == 'undefined') return element.dataset.load = `editor.load_${ key }`;

    index = parseInt(index, 10);

    let block = editor.course.blocks[index],
        key = element.dataset.element;

    element.dataset.input = 'editor.save';

    element.addEventListener('mouseenter', ()=>{ element.focus(); });

    if(!block.options[key]) return console.log(key, editor.course.key, index, block);

    if(!block.options[key].value) return element.style.display = 'none';

    if(!block.options[key].content) block.options[key].content = key;

    if(element.tagName.toLowerCase() == 'textarea') {

      element.value = block.options[key].content;

      if(editor.ticket) element.disabled = true;

    }

    element.dataset.index = index;

    element.dataset.load = `editor.load_${ key }`;

  },

  load_button_group: (element) => {

    let index = parseInt(element.dataset.index, 10),
        block = editor.course.blocks[index],
        options = block.options[element.dataset.element];

    element.innerHTML = options.content.map((string, count) => {
      return `<textarea ${ editor.ticket ? 'disabled' : ''} data-input="editor.save" data-count="${ count }" data-element="button_group" data-index="${ index }">${ string }</textarea>`
    }).join('');
    
  },

  load_title: (element) => {

  },

  load_text: (element) => {

  },

  load_video: (element) => {
  
    let html = `
      <img src="/placeholder-video.png"><!--

   --><input type="text" data-load="labels.youtube_placeholder"><!--

   --><button data-click="editor.insert_video"></button>

      <div class="player"></div>
    `;
  
    element.innerHTML = html;

  },

  insert_video: (element) => {

    let input = element.previousElementSibling,
        container = element.nextElementSibling,
        iframe = document.createElement("iframe");

    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("src", `https://www.youtube.com/embed/${ input.value }`);    
    container.innerHTML = '';
    container.appendChild(iframe);

  },

  // only locally
  save: (element)=>{

    let index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index];

     if(typeof element.dataset.count == 'undefined') 
      return  block.options[element.dataset.element].content = element.value;

     let count = parseInt(element.dataset.count, 10);

     block.options[element.dataset.element].content[count] = element.value;

  },

  // updates course in server
  update: (element)=>{

    let index = parseInt(element.dataset.index, 10),
        temp_index,
        moved;

    switch(element.dataset.action) {

      case 'delete':
        editor.course.blocks.splice(index, 1);
        break;

      case 'move-down':
        if(index + 2 > editor.course.blocks.length) return;
        moved = editor.course.blocks.splice(index, 2).reverse();
        temp_index = moved[1].index;
        moved[1].index = moved[0].index;
        moved[0].index = temp_index;
        editor.course.blocks.splice(index, 0, moved[0], moved[1]);
        break;

      case 'move-up':
        if(index < 1) return;
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
    }, ()=>{

      editor.element.classList.remove('saving');

      root.main.dataset.load = root.main.dataset.load;

    });

  }

};
