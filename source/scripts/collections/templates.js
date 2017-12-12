module.exports = {

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