let templates = module.exports = {

  ticket: {},

  select_course: (element) =>{

  	templates.ticket.course = element.id;

  	templates.validate_invite();

  },

  validate_invite: (element) => {

	if(templates.ticket.course && templates.ticket.client) root.main.classList.add('validated');

  },

  check_side: (element) => {

	element.setAttribute('src', root.main.classList.contains('open') ? '/icon-left.png' : 'icon-right.png');

  },

  toggle_side: (element) => {

	let main = root.main;

	main.classList.toggle('open');

	element.children[0].setAttribute('src', `/icon-${ main.classList.contains('open') ? 'left.png' : 'right.png' }`);

  },

  save_name: (element) =>{

  	templates.ticket.client = element.value;

  	templates.validate_invite();

  },

  scroll_down: (element) => {

	window.scrollTo(0,document.body.scrollHeight);

  },

  send_ticket: (element) => {

	if(!templates.ticket.client || !templates.ticket.course) return;

	root.send({
		request: 'create_ticket',
		client: templates.ticket.client,
		course: templates.ticket.course
	}, (res)=>{

		console.log(res);

		templates.ticket = {};

        root.main.dataset.load = root.main.dataset.load;

        root.main.classList.remove('validated');

	});

  },

  load_client: (element) => {

	templates.client_element = element;

  },

  load_courses: (element) => {

	let html = '',
		keys = Object.keys(root.courses.memory);

	for(var i = 0; i < keys.length; i++) {
	
		let course = root.courses.memory[keys[i]];

		if(!course.published_at) continue;

		html += `
      		<img src="icon-course.png">
		    <input data-change="templates.select_course" id="${ course.key }" type="radio" name="course_list" value="${course.key}">
			<div class="invite-course" data-key="${ keys[i] }">

				<div class="thumbnail-container"><img src="${ course.thumbnail }"></div>

				<span>${ course.name }</span>

				<small class="lang ${ course.language }"></small>

				<label for="${ course.key }"></label>

			</div>
		`;

	};

	element.innerHTML = html;

  },

  load_calender: (element) => {

	element.innerHTML = `
		
		
		
	`;

  },

  change_language: (element) => {

	localStorage.setItem('language', element.dataset.language);

	location.reload();

  },

  highlight_lang: (element) => {

  	if(!element.classList.contains(localStorage.getItem('language') || 'nl')) return;

  	element.classList.add('active');
  	
  },

  format_date: (element) => {

  	let date = new Date(element.dataset.date),
		months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

	if (!date || String(date).toLowerCase() == 'invalid date') return;

	element.innerHTML = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  },

  format_time: (element) => {

  	let date = new Date(element.dataset.date);

	if (!date || String(date).toLowerCase() == 'invalid date') return;

  	element.innerHTML = `${ date.getHours() }:${ String(date.getMinutes()).length > 1 ? '' : 0 }${ date.getMinutes() }`;

  },

  start: (element) => {

	console.log('e', element);
  	
  },

  hide_notification: (element) => {
  	
  	document.querySelector('body').classList.remove('notified');

  }

};