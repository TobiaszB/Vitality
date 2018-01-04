module.exports = (provide) => {

  require('mongodb').MongoClient.connect(`mongodb://127.0.0.1:27017/vitalityone`, (err, database) => {

    if(err) throw err;

    let db = database;

    provide(db);

    db.collection('users').findAndModify({ key: 'users_joris' }, [], {
      $set: {
        name: 'Joris Boon',
        avatar: '/avatar-joris.jpg',
        email: 'joris@vitalityone.nl',
        password: '',
        role: 'admin'
      }
    }, { upsert: true }, ()=>{});

    db.collection('users').findAndModify({ key: 'users_merel' }, [], {
      $set: {
        name: 'Merel Witkamp',
        avatar: '/avatar-merel.jpg',
        email: 'merel@vitalityone.nl',
        password: '',
        role: 'admin'
      }
    }, { upsert: true }, ()=>{});

    db.collection('courses').findAndModify({ key: 'courses_test' }, [], {
      $set: {
        name: 'Test',
        thumbnail: '/default-course.jpg',
        admin: 'users_joris',
        language: 'nl',
        published_at: new Date(),
        created_at: new Date()
      }
    }, { upsert: true }, ()=>{});

    db.collection('tickets').findAndModify({ key: 'tickets_test' }, [], {
      $set: {
        course: 'courses_test',
        user: 'users_peter',
        admin: 'users_joris'
      }
    }, { upsert: true }, ()=>{});

    db.collection('blocks').findAndModify({ key: 'blocks_test' }, [], {
      $set: {
        html: `
          <textarea data-load="editor.load_element" data-element="title"></textarea>
          <textarea data-load="editor.load_element" data-element="text"></textarea>
          <textarea data-load="editor.load_element" data-element="button_primary"></textarea>
          <textarea data-load="editor.load_element" data-element="button_secondary"></textarea>
          <div data-load="editor.load_element" data-element="overlay"></div>
          <div data-load="editor.load_element" data-element="background"></div>
        `,
        created_at: new Date(),
        options: {
          progress: { type: 'progress', trigger: 'editor.scroll_trigger' },
          title: { type: 'boolean' },
          text: { type: 'boolean' },
          button_primary: { type: 'boolean' },
          button_secondary: { type: 'boolean' },
          arrow: { type: 'boolean' },
          background: { type: 'boolean' },
          parallax: { type: 'boolean' },
          overlay: { type: 'overlay' }
        }
      }
    }, { upsert: true }, ()=>{});

    db.collection('blocks').findAndModify({ key: 'blocks_video' }, [], {
      $set: {
        html: `
          <textarea data-load="editor.load_element" data-element="title"></textarea>
          <textarea data-load="editor.load_element" data-element="text"></textarea>
          <div data-load="editor.load_element" data-element="video"></div>
        `,
        created_at: new Date(),
        options: {
          progress: { type: 'progress', trigger: 'editor.scroll_trigger' },
          title: { type: 'boolean' },
          text: { type: 'boolean' },
          buttons: { type: 'boolean' },
          content_align: { type: 'align' },
          background_color: { type: 'color' },
          video: { type: 'video', fullscreen: 'boolean', url: 'string' },
        }
      }
    }, { upsert: true }, ()=>{});

    db.collection('blocks').findAndModify({ key: 'blocks_points' }, [], {
      $set: {
        html: `
          <section data-index="0">
              <img src="/point-nutrition.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
          <section data-index="1">
              <img src="/point-training.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
          <section data-index="2">
              <img src="/point-lifestyle.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
          <section data-index="3">
              <img src="/point-lifestyle.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
          <section data-index="4">
              <img src="/point-lifestyle.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
          <section data-index="5">
              <img src="/point-lifestyle.png"><br>
              <textarea data-load="editor.load_element" data-element="title"></textarea><br>
              <textarea data-load="editor.load_element" data-element="text"></textarea>
          </section>
        `,
        created_at: new Date(),
        options: {
          points: { type: 'number' },
          progress: { type: 'progress', trigger: 'editor.scroll_trigger' },
          title: { type: 'boolean' },
          text: { type: 'boolean' },
          buttons: { type: 'boolean' },
          content_align: { type: 'align' },
          background_color: { type: 'color' },
          video: { type: 'video', fullscreen: 'boolean', url: 'string' },
        }
      }
    }, { upsert: true }, ()=>{});
    
    db.collection('blocks').findAndModify({ key: 'blocks_multiplechoice' }, [], {
      $set: {
        html: `
          <textarea data-load="editor.load_element" data-element="title"></textarea>
          <textarea data-load="editor.load_element" data-element="text"></textarea>
          <div class="divider"></div>
          <div data-load="editor.load_element" data-element="button_group"></div>
        `,
        created_at: new Date(),
        options: {
          progress: { type: 'progress', trigger: 'editor.scroll_trigger' },
          title: { type: 'boolean' },
          text: {
              type: 'boolean',
              content: 'hello'
          },
          button_group: {
            type: 'boolean',
            content: ['De content voor optie A', 'De content voor optie B',  'De content voor optie C',  'De content voor optie D'],
            value: ['A', 'B', 'C', 'D']
          }
        }
      }
    }, { upsert: true }, ()=>{});


  });

};