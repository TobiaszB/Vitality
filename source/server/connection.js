let bcrypt = require('bcryptjs'),
    qs = require('querystring'),
    ws = require('ws'),
    server, db;

module.exports = (wss) => {

  server = wss;

  return Connection;

};

require('./database.js')((database) => db = database);

function handler(request) {

  return {

    broadcast: (ws, msg, session) => {

      server.clients.forEach(function each(client) {

        if (client !== ws && client.readyState === ws.OPEN) {

          client.send(JSON.stringify(msg));

        }

      });

    },

    load_ticket: (ws, msg, session) => {

      db.collection('tickets').findOne({ code: msg.code }, (err, ticket) => {

        if(err || !ticket) return console.log(err || 'no ticket');

        ticket.callback = msg.callback;

        ws.send(JSON.stringify(ticket));

      });
      
    },

    create_ticket: (ws, msg, session) => {

      db.collection('courses').findOne({ key: msg.course }, (err, course) => {

        if(err) return console.log(err);

        let ticket = Object.assign(course, {
          client: msg.client || '',
          manager: session.user,
          course: course.key,
          code: 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          })
        });

        delete ticket.key;

        delete ticket._id;

        db.collection('tickets').findAndModify({
          key: `tickets_${ Math.floor(Math.random() * 99999999) }`
        }, [], {
          $set: ticket
        }, {
          upsert: true,
          new: true
        }, (err, updated) => {
          
          if(err) return console.log(err);

          updated.value.callback = msg.callback;
      
          ws.send(JSON.stringify(updated.value));

        });

      });

    },

    sign_in: (ws, msg, session, callback) => {

      db.collection('users').findOne({ email: String(msg.email).toLowerCase() }, (err, user) => {

        if(err || !user) return ws.send(JSON.stringify({
          error: err || 'user not found',
          callback: msg.callback
        }));

        if(!user.password && !msg.password) return compared(null, true);

        bcrypt.compare(msg.password || '', user.password, compared);

        function compared(err, equal) {
           
          if(err || !equal) return ws.send(JSON.stringify({
            error: err || 'password incorrect',
            callback: msg.callback
          }));

          db.collection('sessions').findAndModify({
            key: `sessions_${ Math.floor(Math.random() * 99999999) }`
          }, [], {
            $set: {
              token: `t${ Math.floor(Math.random() * 9999999999999) }`,
              user: user.key,
              tasks: user.tasks,
              add_permission: true,
              archive_permission: true,
              sort_attribute: 'arrival',
              sort_direction: -1
            }
          }, { upsert: true, new: true }, (err, updated) => {

            if(err || !updated) return console.log(err);

            delete user.password;

            updated.value.callback = msg.callback;

            ws.send(JSON.stringify(updated.value));

            ws.send(JSON.stringify(user));

            callback(updated.value);

            handler('load_courses')(ws, msg, updated.value);

          });

        }

      });

    },

    sign_out: (ws, msg, session) => {

      ws.send(JSON.stringify({
        callback: msg.callback,
        token: false
      }));

    },

    edit: (ws, msg, session) => {

      let collection = msg.key.split('_')[0];
      
      db.collection(collection).findAndModify({ key: msg.key }, [], { $set: msg }, { new: true }, (err, updated) => {

        let res = Object.assign({ callback: msg.callback }, updated.value || {});
        
        ws.send(JSON.stringify(res));

        delete res.callback;

        handler('broadcast')(ws, res, session);

      });

    },

    new_course: (ws, msg, session) => {

      db.collection('courses').findAndModify({
        key: `courses_${ Math.floor(Math.random() * 99999999) }`
      }, [], {
        $set: {
          name: '',
          admin: session.user,
          thumbnail: '/default-course.jpg',
          created_at: new Date(),
          language: 'nl'
        }
      }, { upsert: true, new: true }, (err, updated) => {

        updated.value.callback = msg.callback;
        
        ws.send(JSON.stringify(updated.value));

        handler('broadcast')(ws, updated.value, session);

      });

    },
    
    set_course: (ws, msg, session) => {

      let key = msg.set.key;

      delete msg.set.key;

      delete msg.set._id;
      
      db.collection('courses').findAndModify({
        key: key
      }, [], {
        $set: msg.set
      }, { upsert: true, new: true }, (err, updated) => {

        if(err) console.log(err);

        handler('broadcast')(ws, updated.value, session);

        updated.value.callback = msg.callback;
        
        ws.send(JSON.stringify(updated.value));

      });

    },

    new_ticket: (ws, msg, session) => {

      if(!session.add_permission)
        return ws.send(JSON.stringify({ error: 'geen permissie' }));

      db.collection('tickets').findAndModify({
        key: `tickets_${ Math.floor(Math.random() * 99999999) }`
      }, [], {
        $set: {
          name: '',
          address: '',
          created_at: new Date()
        }
      }, { upsert: true, new: true }, (err, updated) => {

        handler('broadcast')(ws, [updated.value], session);
  
        updated.value.callback = msg.callback || '';

        ws.send(JSON.stringify(updated.value));

      });

    },

    archive: (ws, msg, session) => {

      let collection = msg.key.split('_')[0];

      db.collection(collection).findAndModify({ key: msg.key }, [], { $set: { archived: true } }, { new: true }, (err, updated) => {

        if(!updated.value) return ws.send(JSON.stringify({ callback: msg.callback }));

        handler('broadcast')(ws, [updated.value], session);
  
        updated.value.callback = msg.callback || '';
        
        ws.send(JSON.stringify(updated.value));

      });
      
    },

    new_user: (ws, msg, session) => {

      if(!session.add_permission)
        return ws.send(JSON.stringify({ error: 'geen permissie' }));

      db.collection('users').findAndModify({
        key: `users_${ Math.floor(Math.random() * 99999999) }`
      }, [], {
        $set: {
          name: '',
          email: '',
          role: 'intern', 
          created_at: new Date()
        }
      }, { upsert: true, new: true }, (err, updated) => {

        handler('broadcast')(ws, [updated.value], session);
  
        updated.value.callback = msg.callback || '';
        
        ws.send(JSON.stringify(updated.value));

      });

    },

    load_courses: (ws, msg, session) => {

      let sort = {};

      sort[session.sort_attribute] = session.sort_direction;

      db.collection('courses').find({}).sort(sort).limit(1000).toArray((err, courses) => {

        if(err) console.log(err);

        ws.send(JSON.stringify(courses));

      });

    },

    load_users: (ws, msg, session) => {

      db.collection('users').find().toArray((err, users) => {

        if(err) console.log(err);

        ws.send(JSON.stringify(users));

      });

    },

    load_blocks: (ws, msg, session) => {

      db.collection('blocks').find().toArray((err, blocks) => {

        if(err) console.log(err);

        ws.send(JSON.stringify(blocks));

      });

    },

    load_tickets: (ws, msg, session) => {

      db.collection('tickets').find().toArray((err, tickets) => {

        if(err) console.log(err);

        ws.send(JSON.stringify(tickets));

      });

    },

    update_tasks: (ws, msg, session) => {

      db.collection('users').findAndModify({ key: session.user }, [], {
        $set: { tasks: msg.tasks }
      }, { new: true }, (err, updated) => {

        if(msg.callback) updated.value.callback = msg.callback;

        delete updated.value.password;
        
        ws.send(JSON.stringify(updated.value));

      });

    },

    update_permission: (ws, msg, session) => {

      let $set = {};

      if(msg.tasks) $set.tasks = msg.tasks;

      if(typeof msg.archive_permission == 'boolean') $set.archive_permission = msg.archive_permission;

      if(typeof msg.add_permission == 'boolean') $set.add_permission = msg.add_permission;

      db.collection('sessions').findAndModify({ key: session.key }, [],
        { $set: $set }, { new: true }, (err, updated) => {

        if(msg.callback) updated.value.callback = msg.callback;

        ws.send(JSON.stringify(updated.value));

      });


    },

    set_password: (ws, msg, session) => {

      db.collection('users').findOne({ key: session.user }, (err, user) => {

        if(err || !user) return ws.send(JSON.stringify({
          error: err || 'user not found',
          callback: msg.callback
        }));

        if(!user.password &&
         !msg.old_password) return compared(null, true);

        bcrypt.compare(msg.old_password, user.password, compared);

        function compared(err, equal) {
           
          if(err || !equal) return ws.send(JSON.stringify({
            error: err || 'password incorrect',
            callback: msg.callback
          }));

          bcrypt.hash(msg.password || '', 8, function(err, hash) {

            if(err) console.log(err);

            db.collection('users').findAndModify({ key: session.user }, [], {
              $set: { password: hash || '' }
            }, { new: true }, (err, updated)=>{

              if(err) return console.log(err);

              let user = updated.value;

              delete user.password;

              user.callback = msg.callback;

              ws.send(JSON.stringify(user));

            });

          });

        }

      });

    }

  }[request];

}

function Connection(ws) {

  if(!db) return setTimeout(Connection, 1000, ws);

  let session = {};

  if(!ws.upgradeReq) return console.log('no upgrade req');

  session.storage = qs.parse(ws.upgradeReq.url.slice(2));

  ws.on('message', (message) => {

    let msg = JSON.parse(message),
        func = handler(msg.request);

    if(!func) return console.log(msg, session);

    func(ws, msg, session, (new_session) => {

      session = new_session;

    });;

  });

  if(!session.storage.authenticated) return ws.send(JSON.stringify({
    connected: true,
    token: false
  }));

  db.collection('sessions').findOne({ token: session.storage.authenticated }, (err, sess) => {

    session = sess;

    if(err || !session) return ws.send(JSON.stringify({ token: false }));

    db.collection('users').findOne({ key: session.user }, (err, user) => {
      
      if(user) ws.send(JSON.stringify(user));

      ws.send(JSON.stringify(session));

      handler('load_tickets')(ws, {}, session);

      if(!user || user.role != 'admin') return;

      handler('load_courses')(ws, {}, session);

      handler('load_users')(ws, {}, session);
      
      handler('load_blocks')(ws, {}, session);

    });

  });

}