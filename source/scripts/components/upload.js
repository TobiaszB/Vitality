let component = {
    render: render,
    uploads: {},
    busy: false
};

module.exports = component;

function render(elem) {

    elem.addEventListener('dragover', hover);

    elem.addEventListener('dragleave', hover);

    elem.addEventListener('click', clicked);

    elem.addEventListener('change', changed);

    elem.innerHTML = `<input type="file" multiple="multiple"><div class="progress"><span></span></div>`;

}

function clicked(e) {

    if (e.target.dataset.action != 'select') return e;

    e.stopPropagation();

    find_elem(e).firstElementChild.click();

}

function hover(e) {

    e.stopPropagation();

    find_elem(e).classList[e.type == 'dragover' ? 'add' : 'remove']
        ('input-hover');

}

function find_elem(e, elem) {

    elem = elem || e.target;

    if (!elem.parentElement) return;

    if (elem.dataset.load) return elem;

    return find_elem(e, elem.parentElement);

}

function changed(e) {

    extract(e);

    return e;

}

function extract(e) {

    e.stopPropagation();
        
    let files = e.target.files,
        elem = find_elem(e);
        
    for (let i = 0; i < files.length; i++) {

        let img = new Image();

        elem.appendChild(img);

        img.onload = loaded;

        img.src = URL.createObjectURL(files[i]);

    }

}

function loaded(e) {

    let props = {
        img: e.target,
        width: e.target.clientWidth,
        height: e.target.clientHeight,
        ratio: e.target.clientWidth / e.target.clientHeight
    };

    upload(e, read(e, paint(e, scale(props))));

}

function scale(props) {

    let w = props.width,
        h = props.height,
        r = props.ratio;

    if (w < 800) {
        props.height = Math.floor(800 / r);
        props.width = 800;
    }

    if (h < 300) {
        props.width = Math.floor(300 * r);
        props.height = 300;
    }

    if (h > 1080) {
        props.width = Math.floor(1080 * r);
        props.height = 1080;
    }

    if (w > 1920) {
        props.height = Math.floor(1920 / r);
        props.width = 1920;
    }

    return props;

}

function paint(e, props) {

    props.canvas = document.createElement('canvas');

    let elem = find_elem(e);

    props.elem = elem;

    elem.appendChild(props.canvas);

    props.canvas.width = props.width;

    props.canvas.height = props.height;

    props.canvas.getContext('2d').drawImage(
        props.img,
        0,
        0,
        props.width,
        props.height
    );

    elem.removeChild(props.img);

    return props;

}

function read(e, props) {

    props.blob = new Blob([new Uint8Array(
        [].map.call(
            atob(props.canvas.toDataURL('image/jpeg').split(',')[1]),
            (b, i, binary) => binary.charCodeAt(i)
        )
    )], { type: 'image/jpeg' });

    props.canvas.parentElement.removeChild(props.canvas);

    return props;

}

function upload(e, props) {

    let elem = props.elem,
        indicator = elem.querySelector('.progress'),
        xhr = new XMLHttpRequest();

    xhr.open('PUT', '/upload', true);

    xhr.upload.addEventListener('progress', progress);

    xhr.addEventListener('load', (e) => load(props, 0, e));

    xhr.send(props.blob);

    function load(props, count, e) {

        if(!xhr.responseText) return;
        
        root.send({
          request: `set_course`,
          key: elem.dataset.key,
          thumbnail: JSON.parse(xhr.responseText).url
        }, (res)=> {

          let course = root.courses.memory[elem.dataset.key];
          
          elem.style.backgroundImage = `url(${ course.thumbnail })`;

        });

    }

    function progress(e) {

        component.uploads[props.url] = {
            loaded: e.loaded,
            total: e.total
        };

        let uploads = Object.keys(component.uploads);

        if (!uploads.length) return setTimeout(() => {

            indicator.style.display = 'none';

        }, 500);

        let aggregate = uploads.reduce((memo, url) => {

            memo.total += component.uploads[url].total;

            memo.loaded += component.uploads[url].loaded;

            return memo;

        }, { loaded: 1, total: 1 });

        let percentage = Math.floor(100 * aggregate.loaded / aggregate.total);

        indicator.innerHTML =
            `<span style="width:${ percentage }%;"></span>${ percentage }%`;

        if (percentage != 100) {

            component.busy = true;

            indicator.style.display = 'block';

        } else component.busy = false;

    }

}