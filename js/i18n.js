/* =====================================================================
   Language. English pages live in the site root, Dutch pages in /nl/.
   <html lang="en"> or <html lang="nl" data-root="../"> tells the scripts
   which texts to use and where the images are.
   ===================================================================== */
const LANG = (document.documentElement.lang || 'en').slice(0, 2) === 'nl' ? 'nl' : 'en';
const LOCALE = LANG === 'nl' ? 'nl-NL' : 'en-GB';
const ROOT = document.documentElement.dataset.root || '';

const STRINGS = {
  en: {
    // general
    close: 'Close', send: 'Sending…', retry: 'Try again', anywhere: 'Anywhere', allRoutes: 'All routes',
    sendFailed: 'Sending failed. Please try again or email us at {email}.',
    passenger: 'passenger', passengers: 'passengers', paxCount: '{n} {word}', upTo: 'Up to {n}',
    upToPax: 'up to {n} passengers', choose: 'Choose', pax12: '12+',
    // sign-up
    signedUp: 'Signed up ✓',
    // cards
    moreInfo: 'MORE INFO ›', photo: 'photo', prevPhoto: 'Previous photo', nextPhoto: 'Next photo',
    cardLabel: '{from} to {to}, {when}, {price}. More info',
    window: 'Available between {a} and {b}', flexible: 'FLEXIBLE',
    // new flight request
    newRequest: 'NEW FLIGHT REQUEST', buildOwn: 'Plan your <em>own flight</em>',
    buildOwnLead: 'Complete your trip and leave your details. We will send you a tailored proposal.',
    yourTrip: 'YOUR TRIP', yourDetails: 'YOUR DETAILS', yourFlight: 'YOUR FLIGHT',
    fFrom: 'FROM', fTo: 'TO', fDeparture: 'DEPARTURE DATE', fReturn: 'RETURN DATE', fPax: 'PASSENGERS',
    fName: 'NAME', fEmail: 'EMAIL', fPhone: 'PHONE', fNote: 'MESSAGE',
    phFrom: 'Departure', phTo: 'Destination', phName: 'First and last name', phEmail: 'you@example.com',
    phPhone: '+44 7700 900123', phNote: 'For example preferred departure time, luggage or pets',
    wantReturn: 'I also want a return flight', sendRequest: 'Send request',
    requestNote: 'Your request is without obligation. You receive a proposal first; the flight is only booked once you agree.',
    requestSent: 'Request sent', oneWay: 'One way', roundTrip: 'Return', out: 'out', back: 'back',
    requestDone: '{route} · {trip} · {pax}. We will send you a proposal as soon as possible at {email}.',
    // empty leg reservation
    emptyLeg: 'EMPTY LEG', anyDate: 'Any date', legsFound: '{n} EMPTY LEGS FOUND',
    noLegFound: 'No empty leg found',
    noLegText: 'There is currently no empty flight that matches your search. We can request a new flight for you instead.',
    requestNew: 'Request a new flight', reserveLeg: 'Reserve this empty leg',
    reserveNote: 'Your reservation is only final once the operator confirms it. Routes and times can change until shortly before departure.',
    tooMany: 'This aircraft seats up to {n} passengers.',
    reservationSent: 'Reservation sent',
    reservationDone: '{route} · {details}. We will confirm your reservation as soon as possible at {email}.',
    // detail pop-up
    share: 'Share', shareLabel: 'Share this flight', departure: 'DEPARTURE', paxLabel: 'PASSENGERS',
    aboutFlight: 'ABOUT THIS FLIGHT', aircraft: 'Aircraft', cls: 'Class', duration: 'Flight time', distance: 'Distance',
    normalPrice: 'Regular price', youSave: 'You save', perPerson: 'Price per person', withPax: 'with {n} passengers',
    perPersonShort: '{price} per person', terms: 'TERMS',
    term1Title: 'Confirmed by the operator.', term1: 'An empty leg is only final once the operator has confirmed it.',
    term2Title: 'Depends on the original flight.', term2: 'If the original flight changes, this flight may change or be cancelled too.',
    reserve: 'RESERVE ›', mapFailed: 'The map could not be loaded.', photos: 'Photos',
    normally: 'normally {price}', shareWhatsApp: 'Share via WhatsApp', copyLink: 'Copy link', linkCopied: 'Link copied ✓',
    moreOptions: 'More options', copyThisLink: 'Copy this link:',
    // trip card
    searchLegs: 'Search empty legs', requestFlight: 'Request this flight',
    // empty legs page
    on: 'On {date}', flight1: '1 flight', flightsN: '{n} flights',
    noLegsOnDay: 'No empty legs on {date}. These fly in the week around it.',
    weekAround: 'A week around your date', legs1: 'empty leg', legsN: 'empty legs', ofTotal: ' of {n}',
    noLegsAround: 'No empty legs around {date}', noLegsRoute: 'No empty legs on this route',
    noLegsLead: 'Request a new flight and we will send you a tailored proposal.', requestAFlight: 'Request a flight',
    // contact
    messageSent: 'Message sent', thanks: 'Thank you, {name}. We will get back to you as soon as possible at {email}.',
    // popular destinations in the search bar
    popularFrom: 'Amsterdam', popularTo: ['London', 'Nice', 'Ibiza', 'Cannes', 'Geneva', 'Mykonos']
  },
  nl: {
    close: 'Sluiten', send: 'Versturen…', retry: 'Opnieuw proberen', anywhere: 'Overal', allRoutes: 'Alle routes',
    sendFailed: 'Versturen is niet gelukt. Probeer het opnieuw of mail ons via {email}.',
    passenger: 'passagier', passengers: 'passagiers', paxCount: '{n} {word}', upTo: 'Tot {n}',
    upToPax: 'tot {n} passagiers', choose: 'Kies', pax12: '12+',
    signedUp: 'Aangemeld ✓',
    moreInfo: 'MEER INFORMATIE ›', photo: 'foto', prevPhoto: 'Vorige foto', nextPhoto: 'Volgende foto',
    cardLabel: '{from} naar {to}, {when}, {price}. Meer informatie',
    window: 'Beschikbaar tussen {a} en {b}', flexible: 'FLEXIBEL',
    newRequest: 'NIEUWE VLUCHTAANVRAAG', buildOwn: 'Stel je <em>eigen vlucht</em> samen',
    buildOwnLead: 'Vul je reis aan en laat je gegevens achter. We sturen je een voorstel op maat.',
    yourTrip: 'JE REIS', yourDetails: 'JE GEGEVENS', yourFlight: 'JE VLUCHT',
    fFrom: 'VAN', fTo: 'NAAR', fDeparture: 'VERTREKDATUM', fReturn: 'RETOURDATUM', fPax: 'PASSAGIERS',
    fName: 'NAAM', fEmail: 'E-MAIL', fPhone: 'TELEFOON', fNote: 'OPMERKING',
    phFrom: 'Vertrekplaats', phTo: 'Bestemming', phName: 'Voor- en achternaam', phEmail: 'jij@voorbeeld.nl',
    phPhone: '+31 6 12345678', phNote: 'Bijvoorbeeld gewenste vertrektijd, bagage of huisdieren',
    wantReturn: 'Ik wil ook een retourvlucht', sendRequest: 'Verstuur aanvraag',
    requestNote: 'Je aanvraag is vrijblijvend. Je ontvangt eerst een voorstel; pas na jouw akkoord wordt de vlucht geboekt.',
    requestSent: 'Aanvraag verstuurd', oneWay: 'Enkele reis', roundTrip: 'Retour', out: 'heen', back: 'terug',
    requestDone: '{route} · {trip} · {pax}. We sturen je zo snel mogelijk een voorstel via {email}.',
    emptyLeg: 'EMPTY LEG', anyDate: 'Elke datum', legsFound: '{n} EMPTY LEGS GEVONDEN',
    noLegFound: 'Geen empty leg gevonden',
    noLegText: 'Er vliegt op dit moment geen lege vlucht die bij je zoekopdracht past. We kunnen wel een nieuwe vlucht voor je aanvragen.',
    requestNew: 'Vraag een nieuwe vlucht aan', reserveLeg: 'Reserveer deze empty leg',
    reserveNote: 'Je reservering is pas definitief na bevestiging door de operator. Routes en tijden kunnen tot vlak voor vertrek wijzigen.',
    tooMany: 'Dit toestel heeft plaats voor maximaal {n} passagiers.',
    reservationSent: 'Reservering verstuurd',
    reservationDone: '{route} · {details}. We bevestigen je reservering zo snel mogelijk via {email}.',
    share: 'Delen', shareLabel: 'Deel deze vlucht', departure: 'VERTREK', paxLabel: 'PASSAGIERS',
    aboutFlight: 'OVER DEZE VLUCHT', aircraft: 'Toestel', cls: 'Klasse', duration: 'Vluchtduur', distance: 'Afstand',
    normalPrice: 'Normale prijs', youSave: 'Je bespaart', perPerson: 'Prijs per persoon', withPax: 'bij {n} passagiers',
    perPersonShort: '{price} per persoon', terms: 'VOORWAARDEN',
    term1Title: 'Bevestiging door de operator.', term1: 'Een empty leg is pas definitief na bevestiging door de operator.',
    term2Title: 'Afhankelijk van de oorspronkelijke vlucht.', term2: 'Als de oorspronkelijke vlucht wijzigt, kan ook deze vlucht veranderen of vervallen.',
    reserve: 'RESERVEER ›', mapFailed: 'De kaart kon niet worden geladen.', photos: "Foto's",
    normally: 'normaal {price}', shareWhatsApp: 'Deel via WhatsApp', copyLink: 'Kopieer link', linkCopied: 'Link gekopieerd ✓',
    moreOptions: 'Meer opties', copyThisLink: 'Kopieer deze link:',
    searchLegs: 'Zoek empty legs', requestFlight: 'Vraag deze vlucht aan',
    on: 'Op {date}', flight1: '1 vlucht', flightsN: '{n} vluchten',
    noLegsOnDay: 'Geen empty legs op {date}. Deze vliegen in de week eromheen.',
    weekAround: 'Een week rondom je datum', legs1: 'empty leg', legsN: 'empty legs', ofTotal: ' van de {n}',
    noLegsAround: 'Geen empty legs rond {date}', noLegsRoute: 'Geen empty legs op deze route',
    noLegsLead: 'Vraag een nieuwe vlucht aan, dan sturen we je een voorstel op maat.', requestAFlight: 'Vraag een vlucht aan',
    messageSent: 'Bericht verstuurd', thanks: 'Bedankt, {name}. We reageren zo snel mogelijk via {email}.',
    popularFrom: 'Amsterdam', popularTo: ['Londen', 'Nice', 'Ibiza', 'Cannes', 'Genève', 'Mykonos']
  }
};

function t(key, vars){
  let s = STRINGS[LANG][key];
  if (s === undefined) s = STRINGS.en[key];
  if (s === undefined) return key;
  if (vars && typeof s === 'string') s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
  return s;
}
// "1 passenger", "4 passengers"
function paxText(n){ n = +n || 1; return t('paxCount', { n: n === 12 ? '12+' : n, word: t(n === 1 ? 'passenger' : 'passengers') }); }
// "€6,500" in English, "€6.500" in Dutch
function euro(n){ return '€' + Math.round(n).toLocaleString(LOCALE); }
