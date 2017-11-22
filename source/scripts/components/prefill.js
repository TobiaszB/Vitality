let prefill = module.exports = {

  memory: {},

  load: (element) => {

    element.dataset.input = 'prefill.edit';

    if(!element.dataset.key) return;

    let key = element.dataset.key,
        collection = key.split('_')[0],
        item = root[collection].memory[key];

    if(!item[element.dataset.property]) return;

    let property_key = item[element.dataset.property],
        property_collection = property_key.split('_')[0];

    if(!root[property_collection]) return;

    let property = root[property_collection].memory[property_key];

    element.value = property.name;

  },

  select: (element) => {

    let key = element.dataset.key,
        collection = key.split('_')[0],
        item = root[collection].memory[key];
    
    let input = element.parentElement.parentElement.querySelector('input');

    input.value = item.name;

    let input_collection = input.dataset.key.split('_')[0];

    element.parentElement.innerHTML = '';

    let request = {
       request: 'edit',
       key: input.dataset.key
     };

     request[input.dataset.property] = item.key;

     root.send(request);

  },

  submit: (element) => {

    let selection = element.querySelector('li');

    if(selection) prefill.select(selection);

  },

  edit: function search(element, keys) {

    let ul = element.parentElement.querySelector('ul');

    if(!keys) ul.innerHTML = '';

    keys = keys || Object.keys(root[element.dataset.collection].memory);

    if(prefill.loop && prefill.loop > keys.length) return; // new loop started, this one stops

    prefill.loop = keys.length - 1;

    if(!keys.length || !element.value) return; // done looping

    let key = keys.shift(),
        collection = key.split('_')[0],
        item = root[collection].memory[key];

    if(String(item.name || '').toLowerCase().indexOf(String(element.value).toLowerCase()) == -1)
      return search(element, keys);

    requestAnimationFrame(()=>search(element, keys));

    ul.innerHTML += `<li data-click="prefill.select" data-key="${ item.key }">${ item.name }</li>`

  }

};