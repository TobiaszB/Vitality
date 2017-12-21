let editor = module.exports = {

  course: null,

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
           <div class="confirm-delete"><button data-load="labels.confirm_delete"></button></div>
           <div class="set-link"><button>set link</button></div>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="link" class="fa fa-link"></i>
           <span data-click="editor.toggle_tooltip_submenu" data-tab="color" class="color"><i class="fa fa-paint-brush"></i></span>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="align" class="fa fa-align-left"></i>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="add" class="fa fa-plus"></i>
           <i data-click="editor.toggle_tooltip_submenu" data-tab="delete" class="fa fa-trash"></i>
          </div>
        </div>
        <div class="block-options">
          <a data-load="labels.title_move_up" data-click="editor.update" class="control-btn fa fa-arrow-up"></a>
          <a data-load="labels.title_move_down" data-click="editor.update" class="control-btn fa fa-arrow-down"></a>
          <a data-load="labels.title_options" class="control-btn fa fa-cog"></a>
          <div class="block-config">${Object.keys(block.options).reduce((html,option,id)=>{

        let element = `<label for="input-${id}" data-load="labels.${option}"></label><br>`;

        if (block.options[option].type == 'boolean') element = `<input data-option="${ option }" data-index="${ index }" data-change="editor.input_save" ${block.options[option].value ? 'checked' : ''} id="input-${id}" type="checkbox">${element}`;

        return `${html}${element}`;

      }
      , '')}</div>
          <a data-load="labels.title_delete" data-click="editor.update" class="control-btn fa fa-trash"></a>
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

    element.parentElement.dataset.tab = element.dataset.tab;
    
  },

  tooltip_list: [],

  load_tooltip: (element)=>{

    editor.tooltip_list[parseInt(element.dataset.index, 10)] = element;

  },

  input_save: (element) => {

    let block = editor.course.blocks[parseInt(element.dataset.index, 10)],
        option = block.options[element.dataset.option];

    if(option.type == 'boolean') option.value = !option.value;

  },

  tooltip: (iteration)=>{

    if (history.state.page != 'edit' || editor.looping != iteration)
      return;

    setTimeout(editor.tooltip, 1000, iteration);

    if (document.activeElement.tagName.toLowerCase() != 'textarea')
      return editor.tooltip_list.map(close);

    let index = document.activeElement.parentElement.dataset.index;

    editor.tooltip_list[index].style.bottom = `${ document.activeElement.parentElement.clientHeight - document.activeElement.offsetTop}px`;

    editor.tooltip_list[index].style.left = `${document.activeElement.offsetLeft}px`;

    editor.tooltip_list[index].querySelector('.block-tooltip .inner').dataset.tab = '';

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

    return config;

  },

  load_element: (element)=>{

    let index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index],
        key = element.dataset.element;

    element.dataset.input = 'editor.save';

    element.addEventListener('mouseenter', ()=>{

      element.focus();

    });

    if(!block.content) block.content = {};

    if(!block.content[key]) block.content[key] = key;

    if(key !== 'video') element.innerHTML = key;

    element.dataset.load = `editor.load_${ key }`;

  },

  load_title: (element) => {

  },

  load_text: (element) => {

  },

  load_video: (element) => {

    //if(block.options.progress && block.options.progress.trigger) progress = `data-load="${ block.options.progress.trigger }"`;

    let source = "https://img.youtube.com/vi/T7Mm392tY1k/sddefault.jpg",
        iframe = document.createElement( "iframe" );
 
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("src", `https://www.youtube.com/embed/T7Mm392tY1k`);

        element.appendChild(iframe);

  },

  // only locally
  save: (element)=>{

    let index = parseInt(element.parentElement.dataset.index, 10)
      , block = editor.course.blocks[index];

    block.content[element.dataset.element] = element.value;

  }
  ,

  // updates course in server
  update: ()=>{

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
