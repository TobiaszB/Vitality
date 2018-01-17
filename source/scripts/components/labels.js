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
    home_joris_merel: ['Joris Boon en Merel Witkamp', 'Joris Boon and Merel Witkamp'],
    home_joris_merel_description: ["Mogen we ons even aan u voorstellen. Wij zijn Joris Boon en Merel Witkamp. We zijn beiden fanatieke sporttrainers waarbij we weten dat individuele training allereerst tot resultaat moet leiden bijvoorbeeld afvallen, vitaler of gewoon \'je beter voelen\'. Maar we weten ook dat training alleen vaak niet voldoende is. Vandaar dat we een uniek coachingprogramma hebben geïntroduceerd onder de noemer \'Managers Vitality: for a work - life balance that boosts your management performance'. Het gaat dan om een programma om een betere werk - privé balans te vinden (ook in relatie tot fitness) alsmede omveel betere resultaten op het werk te behalen. Het focust zich op de '7th habit' van managementgoeroe Stephan Covey waar hij heeft over 'het scherp houden van de zaag'. Inmiddels hebben al vele managers zich voor dit programma ingeschreven.", "May we introduce ourselves to you, we are Joris Boon and Merel Witkamp We are both fanatical sports trainers where we know that individual training should lead to results first, for example losing weight, being more vital or just 'feeling better'. also that training alone is often not sufficient, which is why we have introduced a unique coaching program under the heading 'Managers Vitality: for a work - life balance that boosts your management performance' - a program for a better work - private life. To find a balance (also in relation to fitness) as well as to achieve much better results at work, it focuses on the '7th habit' of management guru Stephan Covey, who talks about 'keeping the saw sharp'. managers registered for this program."],
   
    team_text: ['Mogen wij uw personal trainer of personal coach zijn?', 'Can we be your personal trainer or personal coach?'],
    team_intro_1: ["Joris Boon en Merel Witkamp, beiden met een jarenlange ervaring in de sportbranche, bundelen hun krachten om jou een training op maat te kunnen bieden. Joris Boon is een zeer ervaren trainer op het gebied van vechtsport en krachttraining. Met zijn 25 jaar ervaring als sportinstructeur weet hij deze technieken perfect toe te passen bij personal training. Merel Witkamp is thuis in de wereld van personal training, yoga en pilates. Daarnaast is ze gespecialiseerd in revalidatietraining en revalidatietraining voor ex-kankerpatiënten.", "Joris Boon and Merel Witkamp, both with years of experience in the sports industry, join forces to offer you a tailor-made training. Joris Boon is a very experienced trainer in the field of martial arts and strength training. With his 25 years of experience as a sports instructor he knows how to perfectly apply these techniques to personal training. Merel Witkamp is at home in the world of personal training, yoga and pilates. She is also specialized in rehabilitation training and rehabilitation training for ex-cancer patients."],
    team_intro_2: ["Afgelopen jaar besloten wij om samen een privéstudio te openen in een eigen luxe stijl. Een privéstudio waar je in alle rust ook echt privé traint! Jij alleen samen met een van ons. We willen jou door onze persoonlijke begeleiding helpen om op een snelle en effectieve wijze je doelen te verwezenlijken. Door het brede aanbod van krachttraining, conditietraining, revalidatietraining, bokstraining, yoga en pilates kunnen we jou de training bieden die op je lijf geschreven is. Durf jij nu de stap te nemen?", "Last year we decided to open a private studio together in our own luxury style. A private studio where you can practice private training in peace! You alone with one of us. We want to help you through our personal guidance to realize your goals in a fast and effective way. Through the wide range of strength training, fitness training, rehabilitation training, boxing training, yoga and pilates we can offer you the training that is right for you. Do you dare to take the step now?"],
    
    services_personal_training_title: ['Personal training', 'Personal training'],
    services_personal_training_text_1: ['We weten allemaal dat gezonde voeding en beweging goed voor ons is. Maar hoe ga je dat aanpakken? Waar begin je en wat moet je doen om het juiste resultaat te behalen? Daar zijn wij voor!', 'We all know that healthy food and exercise is good for us. But how are you going to deal with that? Where do you start and what do you have to do to achieve the right result? That is what we are for!'],
    services_personal_training_text_2: ['Door het geven van persoonlijke aandacht en de juiste fysieke training zijn wij een stok achter de deur en helpen wij je bij het behalen van jouw doelstellingen. Meer energie, een fitter en sterker lichaam, meer zelfvertrouwen en minder stress.', 'By giving personal attention and the right physical training, we are behind the door and we help you achieve your goals. More energy, a fitter and stronger body, more self-confidence and less stress.'],
    services_personal_training_text_3: ['VitalityOne geeft je resultaat, een fysieke basis. Kortom: fit,sterk en in balans.', 'VitalityOne geeft je resultaat, een fysieke basis. Kortom: fit,sterk en in balans.'],
    services_personal_training_text_4: ['Daarnaast train je in een luxe omgeving waar je in alle rust en privacy aan je doelen kunt werken. Door de individuele begeleiding kun je de training afstemmen op jouw wensen, in de tijd die jou uitkomt.', 'By giving personal attention and the right physical training, we are behind the door and we help you achieve your goals. More energy, a fitter and stronger body, more self-confidence and less stress.'],
  
    services_personal_boxing_title: ['Personal boxing', 'Personal boxing'],
    services_personal_boxing_text_1: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque blandit varius risus, eu egestas dolor congue aliquam. In ac aliquet leo. Nam porttitor bibendum nunc ut faucibus.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque blandit varius risus, eu egestas dolor congue aliquam. In ac aliquet leo. Nam porttitor bibendum nunc ut faucibus. Ut eu dictum orci.'],
    services_personal_boxing_text_2: ['Ut eu dictum orci. Proin a neque commodo mi pulvinar dictum a non turpis. Quisque nec molestie arcu, imperdiet faucibus enim. Integer fermentum elit ipsum. Integer consectetur mauris volutpat neque tempor malesuada. Nunc finibus odio eros, in aliquet nulla bibendum a.', 'Ut eu dictum orci. Proin a neque commodo mi pulvinar dictum a non turpis. Quisque nec molestie arcu, imperdiet faucibus enim. Integer fermentum elit ipsum. Integer consectetur mauris volutpat neque tempor malesuada. Nunc finibus odio eros, in aliquet nulla bibendum a.'],
    
    services_personal_yoga_and_pilates_title: ['Personal yoga en Pilates', 'Personal yoga and Pilates'],
    services_personal_yoga_and_pilates_text_1: ['Met personal yoga en pilates laat ik u ervaren wat deze techniek met je lijf en je gedachten doen. Ik creëer rust juist in deze tijd waarin we het al zo druk hebben. Het een kan niet zonder het ander.', 'With personal yoga and pilates I let you experience what this technique does to your body and your thoughts. I create peace in this time where we are already so busy. The one can not do without the other.'],
    services_personal_yoga_and_pilates_text_2: ['Aenean arcu mi, facilisis quis neque nec, pulvinar congue ipsum. In aliquam dictum maximus. Sed ipsum metus, vulputate maximus porta ac, convallis vitae mi.', 'Aenean arcu mi, facilisis quis neque nec, pulvinar congue ipsum. In aliquam dictum maximus. Sed ipsum metus, vulputate maximus porta ac, convallis vitae mi.'],

    services_duo_training_title: ['Duo training', 'Duo training'],
    services_duo_training_text_1: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque blandit varius risus, eu egestas dolor congue aliquam. In ac aliquet leo. Nam porttitor bibendum nunc ut faucibus.', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque blandit varius risus, eu egestas dolor congue aliquam. In ac aliquet leo. Nam porttitor bibendum nunc ut faucibus. Ut eu dictum orci.'],
    services_duo_training_text_2: ['Ut eu dictum orci. Proin a neque commodo mi pulvinar dictum a non turpis. Quisque nec molestie arcu, imperdiet faucibus enim. Integer fermentum elit ipsum. Integer consectetur mauris volutpat neque tempor malesuada. Nunc finibus odio eros, in aliquet nulla bibendum a.', 'Ut eu dictum orci. Proin a neque commodo mi pulvinar dictum a non turpis. Quisque nec molestie arcu, imperdiet faucibus enim. Integer fermentum elit ipsum. Integer consectetur mauris volutpat neque tempor malesuada. Nunc finibus odio eros, in aliquet nulla bibendum a.'],
    
    onco_personal_training_title: ['Onco Personal Training', 'Onco Personal Training'],
    onco_personal_training_sub: ['Persoonlijke Fysieke training na kanker.', 'Personal Physical training after cancer.'],
    onco_personal_training_text_1: ['Onco Personal Training is erop gericht om de kwaliteit van leven van ex kankerpatiënten te verbeteren.', 'Onco Personal Training is aimed at improving the quality of life of ex cancer patients.'],
    onco_personal_training_text_2: ['Als u te maken krijgt met kanker is dit zeer ingrijpend. Tijdens maar ook nog na de behandeling kunt u allerlei klachten krijgen. Dat maakt het dagelijkse leven er niet makkelijker op. Lichamelijke beweging kan helpen om uw klachten te voorkomen en/of te verminderen. Door te bewegen voelt u zich lichamelijk en psychisch fitter en zit lekkerder in uw vel.', 'If you have to deal with cancer this is very drastic. During and after the treatment you can get all sorts of complaints. That does not make everyday life easier. Physical movement can help to prevent and / or reduce your symptoms. By moving you will feel physically and psychically fitter and feel better in your skin.'],
    onco_personal_training_text_3: ['VitalityOne biedt patiënten die hun behandeling al hebben afgerond een trainingsprogramma aan: persoonlijke fysieke training na kanker. Door deel te nemen aan een Onco Personal trainingstraject kunt u in een rustige en veilige omgeving en onder deskundige begeleiding van Merel Witkamp in beweging blijven of (weer) beginnen met bewegen. Tijdens het trainen leert u op een verantwoorde en veilige manier uw fysieke grenzen kennen en verleggen, zodat u ook thuis beter in beweging kunt blijven en uw dagelijkse bezigheden kunt voortzetten.', 'VitalityOne offers patients who have already completed their treatment a training program: personal physical training after cancer. By participating in an Onco Personal training program, you can keep moving or start moving again in a quiet and safe environment and under the expert guidance of Merel Witkamp. During training you will learn to know and shift your physical limits in a responsible and safe way, so that you can keep moving at home and continue your daily activities.'],

    contact_name: ['Naam', 'Name'],
    contact_email: ['Email', 'Email'],

    like_fb_page: ['Like onze pagina', 'Like our page'],

    add: ['Toevoegen', 'Add'],
    delete: ['Verwijder', 'Delete'],
    invite: ['Maak een ticket aan', 'Create a ticket'],
    team: ['Team', 'Team'],
    sign_in: [value('Inloggen'), value('Sign in')],
    sign_in_link: ['Inloggen', 'Sign in'],
    sign_in_input: [value('Inloggen', value('Sign in'))],
    sign_out: ['Uitloggen', 'Sign out'],
    courses: ['Cursussen', 'Courses'],
    add_course: ['Maak een cursus aan', 'Create a course'],
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
    title: ['Show Title', 'Show Title'],
    text: ['Show Text', 'Show Text'],
    button_primary: ['Show Primary Button', 'Show Primary Button'],
    button_secondary: ['Show Secondary Button', 'Show Secondary Button'],
    buttons: ['Show Buttons', 'Show Buttons'],
    button_group: ['Show Buttons', 'Show Buttons'],
    arrow: ['Show Arrow', 'Show Arrow'],
    content_align: ['Content Align', 'Content Align'],
    background: ['Background', 'Background'],
    parallax: ['Parallax', 'Parallax'],
    background_color: ['Background Color', 'Background Color'],
    background_video: ['Background Video', 'Background Video'],
    overlay: ['Overlay', 'Overlay'],
    services: ['Diensten', 'Services'],
    contact_message: ['Bericht', 'Message'],
    send: ['Verstuur', 'Send'],
    progress: ['Progressie', 'Progress'],
    video: ['Video', 'Video'],
    youtube_placeholder: [placeholder('mXq8SekC5Qg'), placeholder('mXq8SekC5Qg')],
    points: ['Punten', 'Points']
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