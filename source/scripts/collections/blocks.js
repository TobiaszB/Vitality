let blocks = module.exports = {

  memory: [],

  load: (element) => {

    element.innerHTML = Object.keys(blocks.memory).reduce((html, key) => `${ html }
      <div><a data-key="${ key }" data-load="blocks.render_one"></a></div>`, '');
      
  },

  render_one: (element) => {

    element.innerHTML = `${ element.dataset.key }`;

    element.style.backgroundImage = `url(/${ element.dataset.key }.jpg)`;

    element.addEventListener('mousedown', (e)=>{

      blocks.drag_x = e.clientX;

      blocks.drag_y = e.clientY;

      blocks.drag_block = element;

    });

  }

};

document.body.addEventListener('mousemove', (e)=>{

  if(!blocks.drag_block) return e;

  blocks.drag_block.style.right = `${ blocks.drag_x - e.clientX }px`;

  blocks.drag_block.style.top = `${ e.clientY - blocks.drag_y }px`;

  root.main.classList[blocks.drag_x - e.clientX > 190 ? 'add' : 'remove']('dropzone');

});

document.body.addEventListener('mouseup', (e)=>{

  if(!blocks.drag_block) return e;

  let key = blocks.drag_block.dataset.key;

  blocks.drag_block.setAttribute('style', `background-image:url(/${ key }.jpg);`);

  blocks.drag_block = null;

  if(!root.main.classList.contains('dropzone')) return e;

  root.main.classList.remove('dropzone');

  root.editor.add_block(key);

});