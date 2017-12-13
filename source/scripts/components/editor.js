let editor = module.exports = {

  course: null,

  load_course: (element) => {

    let key = history.state.course,
        course = root.courses.memory[key];

    editor.course = course;

    if(course.blocks) element.innerHTML = course.blocks.reduce((html, block, index)=> {

      let options = Object.keys(block.options).reduce((html, option)=>
        `${ html } data-${ option }="${ block.options[option] }"`, '');

      return `${ html }<div ${ options } data-index="${ index }">${ block.html }</div>`;

    }, '');

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

  save: (element) => {

    let index = parseInt(element.parentElement.dataset.index, 10),
        block = editor.course.blocks[index];

    block.content[element.dataset.element] = element.value;

    console.log(JSON.stringify(editor.course, null, 2));

  }

};