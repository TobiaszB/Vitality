module.exports = init([
  '151622309174-ufqkb0shfhmm3k263pb6j4ma8ril9j7v.apps.googleusercontent.com',
  'PQ_B5r3Gvp4_BbAe4YXxl8Jr',
  // 'https://api.fearless-apps.com/gmail/success'
  'http://localhost:8443/gmail/success'
]);

function init(config) {

  let tokens = {
    access_token: 'ya29.GltDBc8wa7Xd8k4pulrEWMdyYoR1wTg355Izxup5c0eDaqm2RITJ5h5KK69SJfCkMN0peNUgXaRpXtHdfnthHx9rh2MSuEe8XXHA9rnjK9e2FHLbR6hGQddV0F6v',
    refresh_token: '1/oOcGuR9S50HAuQZlInzszxhvp673oqbHMtWaLKyJMOk',
    token_type: 'Bearer',
    expiry_date: true
  };

  let mailer = {
    load: load,
    write: write
  };

  let google = require('googleapis'),
      gmail = google.gmail('v1'),
      url = require('url');

  let auth_set = false,
      auth = new google.auth.OAuth2(config[0], config[1], config[2]);

  if(!tokens) return console.log('allow gmail access -', auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  })) || mailer;

  auth.setCredentials(tokens);

  auth_set = true;

  write('info@fearless-apps.com', 'VitalityOne connected', 'successfully');

  return mailer;

  function load(req, res) {

    var query = url.parse(req.url, true).query;

    auth.getToken(query.code, function(err, tokens) {

      console.log(tokens);

      if(err) return console.log(err);

      auth.setCredentials(tokens);

      auth_set = true;

      res.writeHead(200, { 'content-type': 'text/plain' });

      res.end('done! :D');

      write('info@fearless-apps.com', 'VitalityOne connected', 'successfully');

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