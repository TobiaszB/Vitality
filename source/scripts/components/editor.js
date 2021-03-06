let editor = module.exports = {

  course: null,

  ticket: null,

  load_button_primary: ()=>{},

  load_button_secondary: ()=>{},

  load_overlay: ()=>{},

  load_background: ()=>{},

  toggle_publish: (element) => {

    editor.course.published_at = editor.course.published_at ? '' : new Date();

    editor.update(element);

  },

  load_ticket: (element) => {

    root.send({
      request: 'load_ticket',
      code: history.state.code
    }, (res) => {

      root.editor.ticket = res;

      history.state.course = res.course;

      editor.load_course(element);

    });
    
  },

  upload: (element) => {

    element.addEventListener('change', (e)=>{

      e.stopPropagation();

      let reader = new FileReader();

      reader.onloadend = loaded;

      if(!e.target.files[0]) return;

      reader.readAsBinaryString(e.target.files[0]);

      function loaded() {

        let xhr = new XMLHttpRequest();

        xhr.open('PUT', `/upload/${ e.target.files[0].name }`, true);

        xhr.addEventListener('load', (e) => {

          if(!xhr.responseText) return;

          let res = JSON.parse(xhr.responseText);

          editor.set_link({ value: res.url });

        });

        xhr.send(reader.result);

      }

    });

  },

  save_block_element: (element) => {
    
    let key = history.state.course,
        index = parseInt(element.dataset.index, 10),
        course = editor.ticket || root.courses.memory[key],
        block = course.blocks[index],
        colors = ['7ac673','1abc9c','27aae0','2c82c9','9365b8','4c6972','ffffff','41a85f','00a885','3d8eb9',
                  '2969b0','553982','475577','efefef','f7da64','faaf40','eb6b56','e25041','a38f84','28324e',
                  'cccccc','fac51c','f97352','d14841','b8312f','7c706b','000000','c1c1c1'];

    editor.block_elements[index] = element;
   
    element.innerHTML = `
      ${block.html}
      <div class="block-tooltip" data-index="${index}" data-load="editor.load_tooltip">
        <div class="inner">
         <div class="color-picker">${
           colors.map((c)=>`<b data-click="editor.save_color" data-color="${ c }" style="background-color:#${ c };"></b>`).join('')
         }</div>
         <div class="set-link"><input data-input="editor.set_link" type="url" placeholder="https://"></div>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="link" class="fa fa-link"></i>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="upload" class="fa fa-upload"><input data-load="editor.upload" type="file"></i>
         <span data-click="editor.toggle_tooltip_submenu" data-tab="color" class="color"><i class="fa fa-paint-brush"></i></span>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="align" class="fa fa-align-left"></i>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="add" class="fa fa-plus"></i>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="correct" class="fa fa-check"></i>
         <i data-click="editor.toggle_tooltip_submenu" data-tab="delete" class="fa fa-trash"></i>
        </div>
      </div>
      <div class="block-options">
        <a data-index="${ index }" data-action="move-up" data-load="labels.title_move_up" data-click="editor.update" class="control-btn fa fa-arrow-up"></a>
        <a data-index="${ index }" data-action="move-down" data-load="labels.title_move_down" data-click="editor.update" class="control-btn fa fa-arrow-down"></a>
        <a data-load="labels.title_options" class="control-btn fa fa-cog"></a>
        <div data-load="editor.clear_style" class="block-config"${ editor.ticket ? '' : ` style="max-height: 1000px;"` }>${Object.keys(block.options).reduce((html,option,id)=>{

      let element = `<label for="input-${id}" data-load="labels.${option}"></label><br>`;

      if (block.options[option].type == 'boolean') element = `<input data-option="${ option }" data-index="${ index }" data-change="editor.input_save" ${block.options[option].value ? 'checked' : ''} id="input-${id}" type="checkbox">${element}`;

      return `${html}${element}`;

    }
    , '')}</div>
        <a data-action="delete" data-index="${ index }" data-load="labels.title_delete" data-click="editor.update" class="control-btn fa fa-trash"></a>
      </div>
    `;

  },

  save_color: (element) => {

    let index = parseInt(editor.focus.dataset.index, 10);

    editor.course.blocks[index].options[editor.focus.dataset.element].color = `#${ element.dataset.color }`;

    editor.reload_block();

  },

  set_link: (element) => {
    
    if(!editor.focus) return;

    let index = parseInt(editor.focus.dataset.index, 10),
        options = editor.course.blocks[index].options[editor.focus.dataset.element];

    options.link = element.value;

    console.log(options);

  },

  reload_block: () => {

    if(!editor.focus) return;

    let index = parseInt(editor.focus.dataset.index, 10);

    let selector = `[data-index="${ index }"][data-element="${ editor.focus.dataset.element }"]`;

    editor.block_elements[index].dataset.load = editor.block_elements[index].dataset.load;

    setTimeout(()=>{ document.querySelector(selector).focus(); }, 100);
   
  },

  load_course: (element)=>{

    if(history.state.page != 'ticket') editor.ticket = false;
    
    else if(!history.state.course) return editor.load_ticket(element);

    let key = history.state.course,
        course = editor.ticket || root.courses.memory[key];

    if(editor.ticket) {

      root.main.classList.add('ticket-mode');

      root.templates.client_element.dataset.load = 'editor.ticket.client';

    }
    
    editor.looping = Math.random();

    editor.tooltip(editor.looping);

    editor.course = course;

    editor.element = element;

    element.dataset.published = course.published_at ? 'yes' : 'no';

    element.dataset.device = 'desktop';

    if (!course.blocks) course.blocks = [];

    editor.block_elements = [];

    element.innerHTML = course.blocks.reduce((html,block,index)=>{

      let options = Object.keys(block.options).reduce((html,option)=>`${html} data-${option}="${block.options[option].value}"`, '');

      return `${html}<div data-load="editor.save_block_element" data-answer="${ block.answer || '' }" class="block" ${options} data-key="${block.key}" data-index="${index}"></div>`;

    }, `
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

  clear_style: (element) => {

    setTimeout(()=>{

      element.setAttribute('style', '');
      
    }, 500);

  },

  toggle_tooltip_submenu: (element) => {

    let data = editor.focus.dataset,
        index = parseInt(data.index, 10),
        count = parseInt(data.count, 10),
        options;
        
    let opt = editor.course.blocks[index].options[data.element];

    element.parentElement.dataset.tab = element.dataset.tab;

    switch(element.dataset.tab) {

      case 'link':
        
        options = editor.course.blocks[index].options[data.element];

        if(options.link) element.parentNode.querySelector('[data-input="editor.set_link"]').value = options.link;

        break;        

      case 'add':

        options = editor.course.blocks[index].options[data.element];

        options.content.splice(count + 1, 0, '');

        root.main.dataset.load = root.main.dataset.load;

        break;

      case 'delete':

        options = editor.course.blocks[index].options[data.element];

        if(options.content.length < 2) options.value = false;

        else options.content.splice(count, 1);

        root.main.dataset.load = root.main.dataset.load;

        break;

      case 'align':

        opt.align = opt.align || 'left';

        let aligns = ['left', 'center', 'right'];

        opt.align = aligns[(aligns.indexOf(opt.align) + 1) % aligns.length];

        editor.focus.style.textAlign = opt.align;

        element.className = `fa fa-align-${ opt.align }`;

        break;

      case 'correct':

        if(opt.correct == count) count = null;

        opt.correct = count;

        document.querySelector(`[data-load="editor.load_button_group"][data-index="${ index }"]`).dataset.correct = count;

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
      
    let top = block.offsetHeight - focus.offsetTop,
        left = focus.offsetLeft;

    if(focus.parentNode.classList.contains('option')) {

      left += focus.parentNode.offsetLeft;

      top -= focus.parentNode.offsetTop;

    }
      
    editor.tooltip_list[index].style.bottom = `${ top }px`;

    editor.tooltip_list[index].style.left = `${ left }px`;

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

    if(block.options[key].color) element.style.color = block.options[key].color;

    if(block.options[key].align) element.style.textAlign = block.options[key].align;

    if(element.tagName.toLowerCase() == 'textarea') {

      element.value = block.options[key].content;

      if(editor.ticket) element.disabled = true;

    }

    element.dataset.index = index;

    element.dataset.load = `editor.load_${ key }`;

  },

  give_answer: (element) => {

    let index = parseInt(element.dataset.index, 10),
        count = parseInt(element.dataset.count, 10);

    editor.block_elements[index].dataset.answer = count;

    editor.ticket.blocks[index].answer = count;

    root.send({
      request: 'save_ticket',
      ticket: editor.ticket
    });

  },

  load_button_group: (element) => {

    let index = parseInt(element.dataset.index, 10),
        block = editor.course.blocks[index],
        options = block.options[element.dataset.element];

    element.dataset.correct = block.options.button_group.correct;

    element.innerHTML = options.content.map((string, count) => {

      let options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      return `
      <div class="option" ${ editor.ticket ? `data-index="${ index }" data-count="${ count }" data-click="editor.give_answer"` : ''} data-option="${string}">
        <label>${ options[count] }</label><br>
        <textarea ${ editor.ticket ? 'disabled' : ''} data-input="editor.save" data-count="${ count }" data-element="button_group" data-index="${ index }">${ string }</textarea>
      </div>
      `
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
