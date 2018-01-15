let mailer = init([
  '151622309174-ufqkb0shfhmm3k263pb6j4ma8ril9j7v.apps.googleusercontent.com',
  'PQ_B5r3Gvp4_BbAe4YXxl8Jr',
  // 'https://api.fearless-apps.com/gmail/success'
  'http://localhost:8443/gmail/success'
]);

require('http').createServer((req, res) => {

  if(req.url.indexOf('/gmail/') == 0) return mailer.load(req, res);

  res.writeHead(200);

  res.end('hi');

}).listen(8443);

function init(config) {

  let google = require('googleapis'),
      gmail = google.gmail('v1'),
      url = require('url'),
      auth_set = false,
      auth = new google.auth.OAuth2(config[0], config[1], config[2]);

  console.log('allow gmail access -', auth.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send']
  }));

  return {
    load: load,
    write: write
  };

  function load(req, res) {

    var query = url.parse(req.url, true).query;

    auth.getToken(query.code, function(err, tokens) {

      console.log(tokens);

      if(err) return console.log(err);

      auth.setCredentials(tokens);

      auth_set = true;

      res.writeHead(200, { 'content-type': 'text/plain' });

      res.end('done! :D');

      write('info@fearless-apps.com', 'fearless-apps.com connected', 'successfully');

    });

  }

  function write(to, subject, body) {

    if(!auth_set) return console.log(`OAuth2 not set, mail is not sent to ${ to }`, body);

    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        format: 'raw',
        resource: {
            raw: new Buffer(
`Content-Type: text/plain; charset=\"UTF-8\"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
to: ${ to }
from: info@fearless-apps.com
subject: ${ subject }

${ body }`).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
        }
    }, function(err, response) {

        if(err) return console.log(err);

    });

  }

};