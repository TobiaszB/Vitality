let editor = module.exports = {

  course: null,

  load_course: (element) => {

    let key = history.state.course,
        course = root.courses.memory[key];

    editor.looping = Math.random();

    editor.tooltip(editor.looping);

    editor.course = course;

    editor.element = element;

    element.dataset.published = 'yes';

    element.dataset.device = 'desktop';

    if(!course.blocks) course.blocks = [];

    element.innerHTML = course.blocks.reduce((html, block, index)=> {

      let options = Object.keys(block.options).reduce((html, option)=>
        `${ html } data-${ option }="${ block.options[option] }"`, '');

      return `${ html }<div class="block" ${ options } data-key="${ block.key }" data-index="${ index }">
        ${ block.html }
        <div data-index="${ index }" data-load="editor.load_tooltip" class="block-tooltip">
          <i class="fa fa-align-left"></i>
        </div>
        <div class="block-options">
          <a data-click="editor.update" class="control-btn fa fa-arrow-up"></a>
          <a data-click="editor.update" class="control-btn fa fa-arrow-down"></a>
          <a class="control-btn fa fa-cog"></a>
          <a data-click="editor.update" class="control-btn fa fa-trash"></a>
          <div class="block-config">${
            Object.keys(block.options).reduce((html, option, id) => {

              let element = `<label for="input-${ id }" data-load="labels.${ option }"></label><br>`;

              if(block.options[option] == 'boolean') element = `
                <input id="input-${ id }" type="checkbox">${ element }
              `;

              return `${ html }${ element }`;


            }, '')
          }</div>
        </div>
      </div>`;

    }, `
      <div class="control-editor">
        <a data-click="editor.update" class="control-btn fa fa-save"></a>
        <a data-click="editor.toggle_publish" class="control-btn fa fa-cloud-upload"></a>
        <a data-click="editor.toggle_publish" class="control-btn fa fa-cloud-download"></a>
        <a data-click="editor.preview" class="control-btn fa fa-eye"></a>
        <a data-click="editor.toggle_view" class="control-btn fa fa-mobile"></a>
        <a data-click="editor.toggle_view" class="control-btn fa fa-desktop"></a>
        <div data-load="blocks.load"></div>
      </div>
    `);

  },

  tooltip_list: [],

  load_tooltip: (element) => {

    editor.tooltip_list[parseInt(element.dataset.index, 10)] = element;

  },

  tooltip: (iteration) => {

    if(history.state.page != 'edit' || editor.looping != iteration) return;

    setTimeout(editor.tooltip, 2000, iteration);

    if(document.activeElement.dataset.load != 'editor.load_element') return editor.tooltip_list.map((element) => {

        element.style.display = 'none';

        element.classList.remove('fade-in');
        
    });

    let index = document.activeElement.parentElement.dataset.index;

    editor.tooltip_list[index].style.bottom = `${ 3 + document.activeElement.parentElement.clientHeight - document.activeElement.offsetTop }px`;

    editor.tooltip_list[index].style.left = `${ document.activeElement.offsetLeft }px`;

    if(editor.tooltip_list[index].classList.contains('fade-in')) return;

    editor.tooltip_list[index].classList.remove('fade-in');

    editor.tooltip_list[index].style.display = 'block';

    requestAnimationFrame(()=> {

      editor.tooltip_list[index].classList.add('fade-in');

    });

  },

  add_block: (key) => {

    let course = root.courses.memory[history.state.course],
        block = root.blocks.memory[key];

    course.blocks = course.blocks || [];

    course.blocks.push(block);

    console.log(course);

    root.courses.updated = true;

  },

  load_element: (element) => {

    let index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index],
        key = element.dataset.element;

    element.dataset.input = 'editor.save';

    element.addEventListener('mouseenter', ()=>{

      element.focus();

    });

    if(!block.content) block.content = {};

    if(!block.content[key]) block.content[key] = key;

    element.innerHTML = block.content[key];
    
  },

  // only locally
  save: (element) => {

    let index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index];

    block.content[element.dataset.element] = element.value;

    console.log(JSON.stringify(editor.course, null, 2));

  },

  // updates course in server
  update: (element) => {
  
    editor.element.classList.add('saving');

    root.send({ request: 'save_course', set: editor.course }, 
    () => {

      editor.element.classList.remove('saving');

    });

  }

};