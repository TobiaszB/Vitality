let contact = module.exports = {

  render: (element) => {

    element.innerHTML = '';

    let form = document.createElement('form'),

    html = `
      <label data-load="labels.contact_name"></label>
      <input type="text"><br>

      <label data-load="labels.contact_email"></label>
      <input type="text"><br>

      <label data-load="labels.contact_message"></label>
      <textarea type="text"></textarea><br>

      <button data-click="contact.send" data-load="labels.send"></button>
    `;

    form.innerHTML = html;

    element.appendChild(form);

  },

  send: (element) => {

    console.log('send', element);
    
  }

};