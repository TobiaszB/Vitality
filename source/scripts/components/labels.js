const LANGS = ['nl', 'en'];

let index = LANGS.indexOf(localStorage.getItem('language'));

if(index == -1) index = 0;

let labels = {
  landing: ['Welkom', 'Landing'],
  introduction_text: ['Persoonlijke Training & Persoonlijke Coaching', 'Personal Training & Personal Coaching'],
  introduction_description: ['voor het programma Managers Vitality (for a life - work balance that boosts management performance)', 'Program Managers Vitality (for a life - work balance that boosts management performance.)'],
  about_text: ['Mogen wij uw personal trainer of personal coach zijn?', 'Can we be your personal trainer or personal coach?'],
  add: ['Toevoegen', 'Add'],
  invite: ['Uitnodigen', 'Invite'],
  about: ['Over ons', 'About'],
  sign_in: ['Inloggen', 'Sign in'],
  sign_in_input: [value('Inloggen', value('Sign in'))],
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
  archive: ['Archiveer', 'Archive'],
  view: ['Bekijk', 'View'],
  view_mode: ['VIEW MODE', 'VIEW MODE'],
  search: ['ZOEKEN', 'SEARCH'],
  managers: ['MANAGERS', 'MANAGERS'],
  edit: ['Aanpassen', 'Edit'],
  stats_short: ['Stats', 'Stats'],
  copy: ['Kopi&#xEB;ren', 'Copy'],
  viewed: ['Bekeken:', 'Viewed:'],
  published: ['Gepubliceerd', 'Published'],
  unpublished: ['Niet Gepubliceerd', 'Unpublished'],
  password: ['WACHTWOORD', 'PASSWORD'],
  edit_password: ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD'],
  old_password: [placeholder('oud wachtwoord'), placeholder('old password')],
  new_password: [placeholder('nieuw wachtwoord'), placeholder('new password')],
  placeholder_search: [placeholder('Zoeken'), placeholder('Search')]
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

function value(label){

  return (el) => el.setAttribute('data-value', label);

}