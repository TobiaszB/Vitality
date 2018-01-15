let contact = module.exports = {

  save: (element) => {

    contact.data[element.dataset.contact] = element.value;

  },

  send: () => {

    root.send({ request: 'contact', data: contact.data }, ()=>{

      root.main.dataset.load = root.main.dataset.load;
      
    });

  },

  render: (element) => {

    element.innerHTML = '';

    contact.data = {};

    let form = document.createElement('form'),

    html = `
      <label data-load="labels.contact_name"></label>
      <input data-input="contact.save" type="text" data-contact="name"><br>

      <label data-load="labels.contact_email"></label>
      <input data-input="contact.save" type="text" data-contact="email"><br>

      <label data-load="labels.contact_message"></label>
      <textarea data-input="contact.save" type="text" data-contact="message"></textarea><br>

      <button data-click="contact.send" data-click="contact.send" data-load="labels.send"></button>
    `;

    form.innerHTML = html;

    element.appendChild(form);

  }

};