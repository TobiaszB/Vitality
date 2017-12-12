const LANGS = ['nl', 'en'];

let index = LANGS.indexOf(localStorage.getItem('language'));

if(index == -1) index = 0;

let labels = {
  landing: ['Welkom', 'Landing'],
  landing_text: ['Persoonlijke Training & Persoonlijke Coaching', 'Personal Training & Personal Coaching'],
  landing_description: ['voor het programma Managers Vitality (voor een leef - werkbalans die de managementprestaties verbetert)', 'Program Managers Vitality (for a life - work balance that boosts management performance)'],
  landing_feel_good: ['Goed in je vel zitten', 'Just feel great'],
  landing_feel_good_description: ['Wil jij een gezondere levensstijl hebben, maar vind je het moeilijk om de juiste motivatie te vinden? Wil jij eindelijk eens echt een doel bereiken!!! Fitter zijn, afvallen, resultaat boeken!!. Dan ben je bij ons aan het juiste adres. We bieden zowel specifieke trainingsprogramma\'s aan als programma\'s met coaching. Daarbij gaat het vooral om het vinden van een goede werk - privé - balans. Zeker voor de drukke manager een geweldige mogelijkheid! Op deze site tref je meer informatie aan.', 'Do you want a healthier lifestyle, but do you find it difficult to find the right motivation? Do you finally really want to achieve a goal !!! Fitter, lose weight, book books !! Then you have come to the right place. We indicate specific training programs as programs with coaching. This mainly involves finding a good work - private balance. Especially for the busy manager a great opportunity! You will find more information on this site.'],
  landing_share_page: ['Deel deze pagina', 'Share this page'],
  landing_joris_merel: ['Joris Boon en Merel Witkamp', 'Joris Boon and Merel Witkamp'],
  landing_joris_merel_description: ["Mogen we ons even aan u voorstellen. Wij zijn Joris Boon en Merel Witkamp. We zijn beiden fanatieke sporttrainers waarbij we weten dat individuele training allereerst tot resultaat moet leiden bijvoorbeeld afvallen, vitaler of gewoon \'je beter voelen\'. Maar we weten ook dat training alleen vaak niet voldoende is. Vandaar dat we een uniek coachingprogramma hebben geïntroduceerd onder de noemer \'Managers Vitality: for a work - life balance that boosts your management performance'. Het gaat dan om een programma om een betere werk - privé balans te vinden (ook in relatie tot fitness) alsmede omveel betere resultaten op het werk te behalen. Het focust zich op de '7th habit' van managementgoeroe Stephan Covey waar hij heeft over 'het scherp houden van de zaag'. Inmiddels hebben al vele managers zich voor dit programma ingeschreven.", "May we introduce ourselves to you, we are Joris Boon and Merel Witkamp We are both fanatical sports trainers where we know that individual training should lead to results first, for example losing weight, being more vital or just 'feeling better'. also that training alone is often not sufficient, which is why we have introduced a unique coaching program under the heading 'Managers Vitality: for a work - life balance that boosts your management performance' - a program for a better work - private life. To find a balance (also in relation to fitness) as well as to achieve much better results at work, it focuses on the '7th habit' of management guru Stephan Covey, who talks about 'keeping the saw sharp'. managers registered for this program."],
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