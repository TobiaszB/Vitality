let ws = require('ws'),
    fs = require('fs'),
    qs = require('querystring'),
    http = require('http'),
    https = require('https'),
    path = require('path'),
    mime = require('mime'),
    url = require('url'),
    Connection = require('./connection');

module.exports = Server;

function Server(config, callback) {

  let folder = path.resolve(__dirname, '../../ssl'),
      port = 443;
  
  if(!fs.existsSync(folder)) folder = '';

  let server = folder ? https.createServer({
    key: fs.readFileSync(folder + '/privkey.pem', 'utf8'),
    cert: fs.readFileSync(folder + '/cert.pem', 'utf8'),
    ca: [fs.readFileSync(folder + '/chain.pem', 'utf8')]
  }, handler) : http.createServer(handler);

  server.listen(port);

  console.log(new Date().toJSON().slice(11, 19), '-', '\x1b[32minfo\x1b[0m:', 'Hosting server at http://localhost:' + port);

  if(folder) http.createServer((req, res) => {

    res.writeHead(302, { Location: 'https://vitalityone.fearless-apps.com' + req.url });

    res.end();

  }).listen(80);

  callback();

  let wss = new ws.Server({ server: server });

  wss.on('connection', Connection(wss));

  return server;

}

function handler(req, res) {

  let file = url.parse(`../../dist${ req.url }`).pathname;

  fs.readFile(path.resolve(__dirname, file), function cb(err, body) {

    if(err) {

      if(file.indexOf('.html') > -1) return cb(null, `<div data-message="No file ${ file.replace('"', '\\"') }" data-load="config.error"></div>`);

      return fs.readFile(file = path.resolve(__dirname, '../../dist/index.html'), cb);
    }

    res.writeHead(200, { 'Content-Type': mime.lookup(file) });

    res.end(body);

  });

}

function upload(req, res) {

  let data = [];

  req.on('data', (d)=> data.push(d));

  req.on('end', ()=>{

    let url = `/uploads/${ Math.round(Math.random() * 9999999) }.jpg`;
    
    fs.writeFile(path.resolve(__dirname, `../../dist${ url }`), Buffer.concat(data), (err)=>{
      
      if(err) console.log(err);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });

      res.end(JSON.stringify({ url: `${ url }` }));

    });

  });
