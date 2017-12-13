let editor = module.exports = {

  load_course: (element) => {

    let key = history.state.course,
        course = root.courses.memory[key];

    console.log(course);

    if(course.blocks) element.innerHTML = course.blocks.reduce((html, block, index)=> {

      let options = Object.keys(block.options).reduce((html, option)=>
        `${ html } data-${ option }="${ block.options[option] }"`, '');

      return `${ html }<div ${ options } data-index="${ index }" data-key="${ block.key }">${ block.html }</div>`;

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

    element.innerHTML = element.dataset.element;
    
  }

};