let editor = module.exports = {

  course: null,

  load_course: (element) => {

    let key = history.state.course,
        course = root.courses.memory[key];

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
        <div class="block-options">
          <a data-click="editor.update" class="control-btn fa fa-arrow-up"></a>
          <a data-click="editor.update" class="control-btn fa fa-arrow-down"></a>
          <a data-click="editor.update" class="control-btn fa fa-cog"></a>
          <a data-click="editor.update" class="control-btn fa fa-trash"></a>
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