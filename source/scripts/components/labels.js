const LANGS = ['nl', 'en'];

let index = LANGS.indexOf(localStorage.getItem('language'));

if (index == -1) index = 0;

let labels = {
    home: ['Home', 'Home'],
    home_text: ['De enige echte privéstudio!', 'The only real private studio!'],
    home_intake_button: ['Gratis intake', 'Free intake'],
    home_nutrition: ['Voeding', 'Nutrition'],
    home_nutrition_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_training: ['Training', 'Training'],
    home_training_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_lifestyle: ['Lifestyle', 'Lifestyle'],
    home_lifestyle_description: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
    home_share_page: ['Deel deze pagina', 'Share this page'],
    home_joris_merel: ['Joris Boon en Merel Witkamp', 'Joris Boon and Merel Witkamp'],
    home_joris_merel_description: ["Mogen we ons even aan u voorstellen. Wij zijn Joris Boon en Merel Witkamp. We zijn beiden fanatieke sporttrainers waarbij we weten dat individuele training allereerst tot resultaat moet leiden bijvoorbeeld afvallen, vitaler of gewoon \'je beter voelen\'. Maar we weten ook dat training alleen vaak niet voldoende is. Vandaar dat we een uniek coachingprogramma hebben geïntroduceerd onder de noemer \'Managers Vitality: for a work - life balance that boosts your management performance'. Het gaat dan om een programma om een betere werk - privé balans te vinden (ook in relatie tot fitness) alsmede omveel betere resultaten op het werk te behalen. Het focust zich op de '7th habit' van managementgoeroe Stephan Covey waar hij heeft over 'het scherp houden van de zaag'. Inmiddels hebben al vele managers zich voor dit programma ingeschreven.", "May we introduce ourselves to you, we are Joris Boon and Merel Witkamp We are both fanatical sports trainers where we know that individual training should lead to results first, for example losing weight, being more vital or just 'feeling better'. also that training alone is often not sufficient, which is why we have introduced a unique coaching program under the heading 'Managers Vitality: for a work - life balance that boosts your management performance' - a program for a better work - private life. To find a balance (also in relation to fitness) as well as to achieve much better results at work, it focuses on the '7th habit' of management guru Stephan Covey, who talks about 'keeping the saw sharp'. managers registered for this program."],
    team_text: ['Mogen wij uw personal trainer of personal coach zijn?', 'Can we be your personal trainer or personal coach?'],
    team_joris: ["Onder andere samen met een collega een sportschool gehad, een sportschool waar ik overigens nog steeds met veel plezier training geef. Maar nu, na zoveel jaren les te hebben gegeven, merk ik ook waar mijn echte persoonlijke voorkeur ligt: personal training, trainen met kleine groepen en personal coaching. Ik merk daarbij dat kickboksen – een sport die ik al 27 jaar heb beoefend, en waar ik al 20 jaar les in geef – nu door grote groepen wordt gebruikt om zich vitaler te voelen, waarbij fysiek contact uiteraard vermeden wordt. Omdat ik dit vooral met ondernemers doe, heb ik de speciale vorm 'business boksen' bedacht: je lekker even op een bijzondere manier afreageren... heerlijk! Overigens gaat het niet alleen om business boksen, ook andere trainingsvormen bied ik als personal trainer aan. Het is juist de combinatie van verschillende vormen die de mensen zo aanspreekt.", "Together with a colleague I had a gym, a gym where I still enjoy training. But now, after having taught for so many years, I also notice my true personal preference: personal training, training with small groups and personal coaching. I notice that kick boxing - a sport that I have practiced for 27 years, and for which I have been teaching for 20 years - is now being used by large groups to feel more vital, whereby physical contact is naturally avoided. Because I mainly do this with entrepreneurs, I have come up with the special form of 'business boxing': you can have a nice chat in a special way ... delicious! Incidentally, it is not only about business boxing, other forms of training I offer as a personal trainer. It is precisely the combination of different forms that appeal to people in this way."],
    team_merel: ["Ook mijn leven is door sport bepaald. Ik ben begonnen met een dansopleiding en vanuit de dans ben ik overgestapt naar Yoga en vandaar uit ben ik met heel veel trainingsvormen bezig geweest. Omdat professionaliteit bij mij hoog in het vaandel staat, heb ik waar mogelijk diploma\'s behaald. Naast de CIOS-opleiding heb ik diploma\'s in Personal Hormonal Profiling (alles wat te maken heeft met hormonen en hoe die beïnvloed kunnen worden door voeding en training), Fitness diploma A en B, diploma Perfect Pilates en het diploma in Oncologische Revalidatie. Daarnaast ben ik me gaan verdiepen in personal coaching om beter om mensen te kunnen coachen om beter om te kunnen gaan met de balans werk - privé. Veel drukke managers weten hoe belangrijk fysieke training is om dagelijks fit te kunnen blijven. Maar er is meer en met ons speciale coachingprogramma zult u al snel merken hoeveel voordeel u hiervan kunt hebben. Het belangrijkste voor mij is mensen te motiveren om in beweging te blijven.", "My life has been determined by sport, I started a dance education and from dance I switched to Yoga and from there I have been busy with a lot of training forms. Because professionalism is of paramount importance to me, I have, wherever possible, I have diplomas in Personal Hormonal Profiling (everything that has to do with hormones and how they can be influenced by nutrition and training), Fitness diploma A and B, diploma Perfect Pilates. and the diploma in Oncological Rehabilitation, I also went into personal coaching in order to better coach people in order to better deal with the work-life balance.Many busy managers know how important physical training is to be able to get fit every day But there is more and with our special coaching program you will soon see how much benefit you can have of this, the most important thing for me is to motivate people to keep moving."],
    add: ['Toevoegen', 'Add'],
    invite: ['Uitnodigen', 'Invite'],
    team: ['Team', 'Team'],
    sign_in: [value('Inloggen'), value('Sign in')],
    sign_in_link: ['Inloggen', 'Sign in'],
    sign_in_input: [value('Inloggen', value('Sign in'))],
    sign_out: ['Uitloggen', 'Sign out'],
    courses: ['Cursussen', 'Courses'],
    invitations: ['Uitnodigingen', 'Invitations'],
    stats: ['Statistieken', 'Statistics'],
    confirm_delete: ['Bevestig verwijdering', 'Confirm deletion'],
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
    login_password: ['WACHTWOORD', 'PASSWORD'],
    edit_password: ['WACHTWOORD WIJZIGEN', 'CHANGE PASSWORD'],
    old_password: [placeholder('oud wachtwoord'), placeholder('old password')],
    new_password: [placeholder('nieuw wachtwoord'), placeholder('new password')],
    placeholder_search: [placeholder('Zoeken'), placeholder('Search')],
    save_profile: [value('Sla profiel op'), value('Save profile')],
    clients: ['Klanten', 'Clients'],
    app_settings: ['App instellingen', 'App settings'],
    name: [placeholder('Naam'), placeholder('Name')],
    password: [placeholder('Wachtwoord'), placeholder('Password')],
    send_invite: ['Verstuur uitnodiging', 'Send invite'],
    events: ['Evenementen', 'Events'],
    show_title: ['Show Title', 'Show Title'],
    show_text: ['Show Text', 'Show Text'],
    show_buttons: ['Show Buttons', 'Show Buttons'],
    show_arrow: ['Show Arrow', 'Show Arrow'],
    content_align: ['Content Align', 'Content Align'],
    background_image: ['Background Image', 'Background Image'],
    parallax: ['Parallax', 'Parallax'],
    background_color: ['Background Color', 'Background Color'],
    background_video: ['Background Video', 'Background Video'],
    overlay: ['Overlay', 'Overlay'],
    services: ['Diensten', 'Services'],
    contact_name: ['Naam', 'Name'],
    contact_email: ['Email', 'Email'],
    contact_message: ['Bericht', 'Message'],
    send: ['Verstuur', 'Send']
};

for (let n in labels) {

    if (!labels.hasOwnProperty(n)) continue;

    if (labels[n] == false) labels[n] = n;

    else labels[n] = labels[n][index];

}

module.exports = labels;

function placeholder(label) {

    return (el) => el.setAttribute('placeholder', label);

}

function title(label) {

    return (el) => el.setAttribute('data-title', label);

}

function value(label) {

    return (el) => { el.value = label; };

}