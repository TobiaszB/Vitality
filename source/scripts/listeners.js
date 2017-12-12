let updates = [];

module.exports = init;

function init() {

  bind();

  document.documentElement.addEventListener('click', listener);

  document.documentElement.addEventListener('change', listener);

  document.documentElement.addEventListener('input', listener);

  document.documentElement.addEventListener('submit', listener);

}

function listener(e, element) {

  element = element || e.target;

  if(e.type.toLowerCase() == 'submit') e.preventDefault();

  if (!element.dataset || !element.dataset[e.type]) {

    if(!element.parentElement) return;

    return listener(e, element.parentElement);

  }

  let target = root;

  for (let i = 0, parts = element.dataset[e.type].split('.'); i < parts.length; i++) {

    if (!target) return console.error(element.dataset[e.type] || e.type, 'does not exist');

    target = target[parts[i]];

  }

  if(typeof target != 'function') return console.error(element.dataset[e.type] || e.type, 'does not exist');

  target(element);

}

function bind() {

  (function loop(){

    if(!updates.length) return requestAnimationFrame(loop);

    let elements = updates.splice(0, updates.length);

    for(let i = 0; i < elements.length; i++) {

      [].map.call(elements[i].querySelectorAll('[data-bind], [data-load]'), bind_one);

    }

    requestAnimationFrame(loop);

  }());

  new MutationObserver(observer).observe(
    document.documentElement,
    {
      attributes: true,
      subtree: true,
      childList: true,
      characterData: true
    }
  );

}

function observer(mutations) {

  for(let i = 0; i < mutations.length; i++) {

    if(mutations[i].type == 'attributes') {

       if(mutations[i].attributeName == 'data-load') load(mutations[i].target);

       continue;

    }

    if(mutations[i].type != 'childList') return;

    if(updates.indexOf(mutations[i].target) == -1) updates.push(mutations[i].target);

  }

}

function bind_one(element) {

  let d = element.dataset,
      key = d.bind == 'me' ? root.config.user : d.bind,
      collection;

  if(d.load) return load(element);

  if(!key) return collection.error(d);

  collection = root[key.split('_').slice(0, -1).join('_')];

  if (!collection || !collection.memory[key]) return console.error(key);

  let prop = d.value || d.text || d.bg || d.html,
      obj = collection.memory[key];

  if(d.value) element.value = obj[d.value] || '';

  if(d.html) element.innerHTML = obj[d.html] || '';

  if(d.text) element.innerHTML = (obj[d.text] || '').replace(/(>|<)/g, escape);

  if(d.bg) element.style.backgroundImage = `url("${ obj[d.bg] || '' }`;

}

function load(element) {

  let target = root;

  for (let i = 0, parts = element.dataset.load.split('.'); i < parts.length; i++) {

    target = target[parts[i]];

    if (!target) {

      if(element.dataset.load.indexOf('.html') != -1) return load_file(element);

      return console.error(element.dataset.load, 'does not exist');

    }

  }

  if(element.dataset.load.substring(0, 11) == 'labels.user') {

    let user = root.users.memory[root.config.user],
        str = element.dataset.load;
    
    str = str.substring(12);

    if(user && typeof(str) == 'string' && user[str]) return element.value = user[str];

  }

  if(typeof target == 'string') return element.innerHTML = target;

  if(typeof target == 'function') return target(element);

}

function load_file(element) {

  let xhr = new XMLHttpRequest();

  xhr.open('GET', element.dataset.load, true);

  xhr.onreadystatechange = function(e) {

    if (this.readyState != 4 || this.status != 200) return;

    root.templates = root.templates || {};

    let target = root.templates;

    for (let i = 0, parts = element.dataset.load.split('.'); i + 1 < parts.length; i++) {

      if (!target) return;

      target[parts[i]] = target[parts[i]] || {};

      target = target[parts[i]];

    }

    element.innerHTML = target.html = this.responseText;

  }

  xhr.send();


}

function escape(match) {

  return match == '>' ? '&gt;' : '&lt;';

}