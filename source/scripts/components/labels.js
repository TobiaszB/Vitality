const LANGS = ['nl', 'en'];

let index = LANGS.indexOf(localStorage.getItem('language'));

if(index == -1) index = 0;

let labels = {
  landing: ['Welkom', 'Landing'],
  add: ['Toevoegen', 'Add'],
  about: ['Over Ons', 'About'],
  sign_in: ['Inloggen', 'Sign in'],
  sign_out: ['Uitloggen', 'Sign out'],
  courses: ['Cursussen', 'Courses'],
  profile: ['Profiel', 'Profile'],
  invitations: ['Uitnodigingen', 'Invitations'],
  stats: ['Statistieken', 'Statistics'],
  no_results: [
    title('Geen resultaten'),
    title('No results')
  ],
  loading: [
    title('Laden...'),
    title('Loading...')
  ],
  placeholder_search: [placeholder('zoeken'), placeholder('search')],
  password: ['WACHTWOORD', 'PASSWORD'],
  permissions: ['PERMISSIES', 'PERMISSIONS'],
  configure_ipad: ['CONFIGUREER DEZE IPAD', 'CONFIGURE THIS IPAD'],
  save: ['START DE APP', 'LAUNCH THE APP'],
  password: ['WACHTWOORD', 'PASSWORD'],
  edit_password: ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD'],
  old_password: [placeholder('oud wachtwoord'), placeholder('old password')],
  new_password: [placeholder('nieuw wachtwoord'), placeholder('new password')]
};

for(let n in labels) {

  if(!labels.hasOwnProperty(n)) continue;

  if(labels[n] == false) labels[n] = n;

  else labels[n] = labels[n][index];

}

module.exports = labels;

function placeholder(label){

  return (el) => el.setAttribute('placeholder', label);

}

function title(label){

  return (el) => el.setAttribute('data-title', label);

}