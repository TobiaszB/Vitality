let modal = module.exports = {

  load: (element) => {

	root.modal_element = element;

  },

  open: (element, load) => {

	let modal = root.modal_element;

	if(modal.dataset.key) modal.dataset.key = element.dataset.key;

	if(!document.body.classList.contains('modal-open'))
		root.main.style.transform = `translateY(-${ window.scrollY || document.body.scrollTop }px)`;

	scroll(0,0);

	modal.dataset.load = element.dataset.modal;

	requestAnimationFrame(()=>document.body.classList.add('modal-open'))

  },

  close: (element) => {

	let scrolltop = parseInt(root.main.style.transform.replace('translateY(', ''), 10);

	document.body.classList.remove('modal-open');

	root.main.removeAttribute('style');

	root.modal_element.load = "modal.empty";

	window.scroll(0, -1 * scrolltop);

  },

  empty: ''

};