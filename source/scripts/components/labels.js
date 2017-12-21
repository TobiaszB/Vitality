const LANGS = ['nl', 'en'];

let index = LANGS.indexOf(localStorage.getItem('language'));

if (index == -1) index = 0;

let labels = {
    title_move_up: [title('Omhoog'), title('Move up')],
    title_move_down: [title('Omlaag'), title('Move down')],
    title_options: [title('Opties'), title('Options')],
    title_delete: [title('Verwijder'), title('Delete')],
    title_save: [title('Opslaan'), title('Save')],
    title_online: [title('Online'), title('Online')],
    title_offline: [title('Offline'), title('Offline')],
    title_preview: [title('Preview'), title('Preview')],
    title_mobile_view: [title('Mobile'), title('Mobile')],
    title_desktop_view: [title('Desktop'), title('Desktop')],
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
    team_intro_1: ["Joris Boon en Merel Witkamp, beiden met een jarenlange ervaring in de sportbranche, bundelen hun krachten om jou een training op maat te kunnen bieden. Joris Boon is een zeer ervaren trainer op het gebied van vechtsport en krachttraining. Met zijn 25 jaar ervaring als sportinstructeur weet hij deze technieken perfect toe te passen bij personal training. Merel Witkamp is thuis in de wereld van personal training, yoga en pilates. Daarnaast is ze gespecialiseerd in revalidatietraining en revalidatietraining voor ex-kankerpatiënten.", "Joris Boon and Merel Witkamp, both with years of experience in the sports industry, join forces to offer you a tailor-made training. Joris Boon is a very experienced trainer in the field of martial arts and strength training. With his 25 years of experience as a sports instructor he knows how to perfectly apply these techniques to personal training. Merel Witkamp is at home in the world of personal training, yoga and pilates. She is also specialized in rehabilitation training and rehabilitation training for ex-cancer patients."],
    team_intro_2: ["Afgelopen jaar besloten wij om samen een privéstudio te openen in een eigen luxe stijl. Een privéstudio waar je in alle rust ook echt privé traint! Jij alleen samen met een van ons. We willen jou door onze persoonlijke begeleiding helpen om op een snelle en effectieve wijze je doelen te verwezenlijken. Door het brede aanbod van krachttraining, conditietraining, revalidatietraining, bokstraining, yoga en pilates kunnen we jou de training bieden die op je lijf geschreven is. Durf jij nu de stap te nemen?", "Last year we decided to open a private studio together in our own luxury style. A private studio where you can practice private training in peace! You alone with one of us. We want to help you through our personal guidance to realize your goals in a fast and effective way. Through the wide range of strength training, fitness training, rehabilitation training, boxing training, yoga and pilates we can offer you the training that is right for you. Do you dare to take the step now?"],
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
    send: ['Verstuur', 'Send'],
    progress: ['Progressie', 'Progress'],
    video: ['Video', 'Video']
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