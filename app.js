/* =========================================================================
   SUPABASE-ASETUKSET
   URL = projektin perus-URL (ilman /rest/v1/-osaa).
   KEY = uusi julkinen "publishable"-avain (korvaa deprekoidun anon-avaimen).
         Tämä avain on tarkoitettu client-koodiin; RLS-säännöt suojaavat datan.
   EMAIL_DOMAIN = sisäinen domain käyttäjänimille (käyttäjä ei näe tätä).
   ========================================================================= */
const SUPABASE_URL = 'https://ozfjybzmuwbibolnpajq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AjmNg1eclnnQSBGlgTHE-A_Ou7w3y16';
const EMAIL_DOMAIN = 'treeni.local';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const usernameToEmail = u => `${u.toLowerCase()}@${EMAIL_DOMAIN}`;

/* =========================================================================
   DATAKERROS – kirjaukset ja tavoitteet Supabasesta.
   user_id täyttyy automaattisesti (sarakkeen oletus auth.uid()), ja
   RLS rajaa rivit kirjautuneelle käyttäjälle.
   ========================================================================= */
const store = {
  async getEntries() {
    const { data, error } = await sb.from('training_logs')
      .select('id, date, category, duration, note')
      .order('date', { ascending: false });
    if (error) { console.error(error); return []; }
    return data.map(r => ({ ...r, note: r.note || '' }));
  },
  async addEntry(entry) {
    const { data, error } = await sb.from('training_logs')
      .insert({ date: entry.date, category: entry.category, duration: entry.duration, note: entry.note || null })
      .select().single();
    if (error) { console.error(error); return null; }
    return data;
  },
  async deleteEntry(id) {
    const { error } = await sb.from('training_logs').delete().eq('id', id);
    if (error) console.error(error);
  }
};

const goalStore = {
  async get() {
    const { data, error } = await sb.from('goals')
      .select('id, category, hours').order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data.map(g => ({ ...g, hours: Number(g.hours) }));
  },
  async add(goal) {
    const { error } = await sb.from('goals').insert({ category: goal.category, hours: goal.hours });
    if (error) console.error(error);
  },
  async remove(category) {
    const { error } = await sb.from('goals').delete().eq('category', category);
    if (error) console.error(error);
  }
};

/* ---- Kategoriat (muokkaa vapaasti) ---- */
const CATEGORIES = [
  { id: 'laukaukset',  label: 'Laukaukset',  group: 'Tekniset', color: 'var(--cat-laukaukset)' },
  { id: 'syottely',    label: 'Syöttely',    group: 'Tekniset', color: 'var(--cat-syottely)' },
  { id: 'kuljetus',    label: 'Kuljetus',    group: 'Tekniset', color: 'var(--cat-kuljetus)' },
  { id: 'pallotaito',  label: 'Pallotaito',  group: 'Tekniset', color: 'var(--cat-pallotaito)' },
  { id: 'nopeus',      label: 'Nopeus',      group: 'Fyysiset', color: 'var(--cat-nopeus)' },
  { id: 'voima',       label: 'Voima',       group: 'Fyysiset', color: 'var(--cat-voima)' },
  { id: 'kestavyys',   label: 'Kestävyys',   group: 'Fyysiset', color: 'var(--cat-kestavyys)' },
  { id: 'liikkuvuus',  label: 'Liikkuvuus',  group: 'Fyysiset', color: 'var(--cat-liikkuvuus)' },
  { id: 'muu',         label: 'Muu',         group: 'Muu',      color: 'var(--cat-muu)' },
];
const catById = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

/* ---- Harjoitepankki (oletuskestoa ei ole – käyttäjä syöttää keston itse) ---- */
const EXERCISES = [
  {
    "category": "laukaukset",
    "name": "Seinälaukaukset",
    "desc": "Lauko seinään molemmilla jaloilla; tarkkuus ja ensikosketus paluupallosta.",
    "level": "Helppo",
    "equipment": "Pallo + seinä",
    "duration": 20,
    "steps": [
      "Asetu 8–12 m päähän seinästä.",
      "Lauko napakasti seinään ja ota paluupallo haltuun.",
      "Vuorottele oikea ja vasen jalka."
    ],
    "cues": [
      "Tukijalka pallon viereen.",
      "Nilkka lukossa, osu pallon keskelle."
    ],
    "video": "soccer shooting against wall drill"
  },
  {
    "category": "laukaukset",
    "name": "Tarkkuuslaukaukset kohteisiin",
    "desc": "Kohteet maalin kulmiin, laukaukset eri etäisyyksiltä.",
    "level": "Keskitaso",
    "equipment": "Pallo + maali/kohteet",
    "duration": 25,
    "steps": [
      "Aseta kohteet maalin kulmiin (esim. pullot).",
      "Lauko eri etäisyyksiltä kohti kohdetta.",
      "Laske osumat ja tavoittele ennätystä."
    ],
    "cues": [
      "Valitse kulma ennen laukausta.",
      "Laatu ennen voimaa."
    ],
    "video": "soccer shooting accuracy target drill"
  },
  {
    "category": "laukaukset",
    "name": "Ensikosketus + laukaus",
    "desc": "Ota syöttö haltuun ja laukaise nopeasti; vaihtele kulmaa.",
    "level": "Keskitaso",
    "equipment": "Pallo + seinä",
    "duration": 20,
    "steps": [
      "Ohjaa tuleva pallo ensikosketuksella maalia kohti.",
      "Laukaise heti toisella kosketuksella.",
      "Toista molemmilla jaloilla."
    ],
    "cues": [
      "Suuntaa ensikosketus eteenpäin.",
      "Nopea toinen kosketus."
    ],
    "video": "first touch and shoot soccer drill"
  },
  {
    "category": "laukaukset",
    "name": "Ilmalaukaukset (volley)",
    "desc": "Pudota pallo ja laukaise ilmasta keskeltä palloa.",
    "level": "Haastava",
    "equipment": "Pallo",
    "duration": 15,
    "steps": [
      "Pudota pallo kädestä.",
      "Lauko ilmasta osuen pallon keskelle.",
      "Aloita matalalla, nosta korkeutta hallinnan myötä."
    ],
    "cues": [
      "Nilkka lukossa.",
      "Pidä vartalo pallon päällä."
    ],
    "video": "soccer volley technique tutorial"
  },
  {
    "category": "syottely",
    "name": "Seinäsyötöt",
    "desc": "Matalat, napakat syötöt seinään molemmilla jaloilla.",
    "level": "Helppo",
    "equipment": "Pallo + seinä",
    "duration": 15,
    "steps": [
      "Syötä matalia, napakoita syöttöjä seinään.",
      "Ota paluupallo haltuun ja syötä uudelleen.",
      "Vuorottele jalat ja sisä-/ulkoterä."
    ],
    "cues": [
      "Osu pallon keskelle sisäterällä.",
      "Tukijalka osoittaa kohteeseen."
    ],
    "video": "soccer wall passing drill"
  },
  {
    "category": "syottely",
    "name": "Pitkän syötön tarkkuus",
    "desc": "Pitkä syöttö kohteeseen kentän poikki.",
    "level": "Keskitaso",
    "equipment": "Pallo + kohde",
    "duration": 20,
    "steps": [
      "Valitse kohde 20–30 m päästä.",
      "Lyö pitkä syöttö kohteeseen.",
      "Vaihtele matalat ja ilmasyötöt."
    ],
    "cues": [
      "Osu pallon alaosaan nostoon.",
      "Seuraa liikettä loppuun."
    ],
    "video": "long pass accuracy soccer drill"
  },
  {
    "category": "syottely",
    "name": "Yhden kosketuksen syötöt",
    "desc": "Haltuunotto ja syöttö yhdellä kosketuksella.",
    "level": "Keskitaso",
    "equipment": "Pallo + seinä",
    "duration": 15,
    "steps": [
      "Syötä seinään ja palauta yhdellä kosketuksella.",
      "Pidä rytmi tasaisena.",
      "Lisää tahtia hallinnan myötä."
    ],
    "cues": [
      "Valmista jalka ajoissa.",
      "Pieni, tarkka kosketus."
    ],
    "video": "one touch passing wall soccer"
  },
  {
    "category": "syottely",
    "name": "Kartioporttisyötöt",
    "desc": "Syötä kartioiden väleistä eri etäisyyksiltä.",
    "level": "Helppo",
    "equipment": "Pallo + 4 kartiota",
    "duration": 15,
    "steps": [
      "Tee kartioista pieniä portteja.",
      "Syötä pallo portin läpi eri etäisyyksiltä.",
      "Tavoittele osumia putkeen."
    ],
    "cues": [
      "Tähtää portin keskelle.",
      "Säädä voimaa etäisyyden mukaan."
    ],
    "video": "passing gates accuracy soccer drill"
  },
  {
    "category": "kuljetus",
    "name": "Kartiopujottelu",
    "desc": "Tiukka rata molemmilla jaloilla, pallo lähellä.",
    "level": "Helppo",
    "equipment": "Pallo + 5–6 kartiota",
    "duration": 15,
    "steps": [
      "Aseta kartiot riviin n. 1 m välein.",
      "Pujottele pallo läpi pieni kosketus kerrallaan.",
      "Käytä molempia jalkateriä, lisää vauhtia."
    ],
    "cues": [
      "Pallo lähellä jalkaa.",
      "Nosta katse välillä ylös."
    ],
    "video": "cone dribbling drill soccer"
  },
  {
    "category": "kuljetus",
    "name": "1v1-harhautukset",
    "desc": "Veto-työntö, kroketti yms. kartiota vastaan + kiihdytys ohi.",
    "level": "Keskitaso",
    "equipment": "Pallo + kartio",
    "duration": 20,
    "steps": [
      "Lähesty kartiota kuin vastustajaa.",
      "Tee harhautus (veto-työntö, kroketti).",
      "Kiihdytä terävästi ohi.",
      "Harjoittele 2–3 eri liikettä."
    ],
    "cues": [
      "Myy harhautus vartalolla.",
      "Räjähtävä lähtö liikkeen jälkeen."
    ],
    "video": "soccer 1v1 moves tutorial"
  },
  {
    "category": "kuljetus",
    "name": "Suunnanmuutoskuljetus",
    "desc": "Nopeat suunnanvaihdot merkeillä, molemmat jalkaterät.",
    "level": "Keskitaso",
    "equipment": "Pallo + merkit",
    "duration": 15,
    "steps": [
      "Kuljeta merkille ja tee terävä suunnanvaihto.",
      "Käytä sisä- ja ulkoterää.",
      "Pidä matala painopiste käännöksissä."
    ],
    "cues": [
      "Kosketus ja käännös samalla.",
      "Kiihdytä ulos käännöksestä."
    ],
    "video": "change of direction dribbling soccer"
  },
  {
    "category": "kuljetus",
    "name": "Vauhtikuljetus halliten",
    "desc": "Pitkä matka maksimivauhtia pallo hallinnassa.",
    "level": "Keskitaso",
    "equipment": "Pallo + tila",
    "duration": 15,
    "steps": [
      "Kuljeta pitkä matka kovaa vauhtia.",
      "Pidä pallo hallinnassa isommilla työnnöillä.",
      "Lopeta hallittuun pysäytykseen."
    ],
    "cues": [
      "Työnnä pallo askelten tahtiin.",
      "Katse ylhäällä."
    ],
    "video": "speed dribbling soccer drill"
  },
  {
    "category": "pallotaito",
    "name": "Pallottelu (jonglöörays)",
    "desc": "Pallo ilmassa eri kehonosilla; tavoittele toistoennätyksiä.",
    "level": "Helppo",
    "equipment": "Pallo",
    "duration": 10,
    "steps": [
      "Pidä pallo ilmassa jaloilla, reisillä ja päällä.",
      "Tavoittele toistoennätyksiä.",
      "Kokeile sarjoja: jalka–reisi–jalka."
    ],
    "cues": [
      "Osu pallon alle, nilkka lukossa.",
      "Pienet, pehmeät kosketukset."
    ],
    "video": "football juggling tutorial beginner"
  },
  {
    "category": "pallotaito",
    "name": "Jalkapohjarullaukset & toe taps",
    "desc": "Nopeat kosketukset ja rullaukset paikallaan.",
    "level": "Helppo",
    "equipment": "Pallo",
    "duration": 10,
    "steps": [
      "Napauta pallon päältä jalkapohjilla vuorotellen (toe taps).",
      "Tee rullauksia jalkapohjalla puolelta toiselle.",
      "Pidä tiheä rytmi 20–30 s sarjoissa."
    ],
    "cues": [
      "Kevyet kosketukset päkiällä.",
      "Katse ylös välillä."
    ],
    "video": "toe taps rolls soccer footwork drill"
  },
  {
    "category": "pallotaito",
    "name": "Kosketusyhdistelmät",
    "desc": "Sisä-ulko, V-veto yms. molemmilla jaloilla.",
    "level": "Keskitaso",
    "equipment": "Pallo",
    "duration": 12,
    "steps": [
      "Harjoittele sisä-ulko-kosketuksia liikkeessä.",
      "Lisää V-veto ja käännökset.",
      "Tee molemmilla jaloilla."
    ],
    "cues": [
      "Pallo lähellä.",
      "Rytmi tasaiseksi ennen vauhtia."
    ],
    "video": "ball mastery drills soccer"
  },
  {
    "category": "pallotaito",
    "name": "Pallonhallinta paikallaan",
    "desc": "Kosketukset sisä-, ulko- ja jalkapohjalla.",
    "level": "Helppo",
    "equipment": "Pallo",
    "duration": 10,
    "steps": [
      "Liikuttele palloa sisä-, ulko- ja jalkapohjakosketuksin paikallaan.",
      "Pidä pallo jalkojen lähellä.",
      "Vaihtele rytmiä."
    ],
    "cues": [
      "Matala asento.",
      "Pehmeät kosketukset."
    ],
    "video": "close control stationary soccer drill"
  },
  {
    "category": "nopeus",
    "name": "Kiihdytykset 10–30 m",
    "desc": "Täysi teho, täysi palautus välissä.",
    "level": "Keskitaso",
    "equipment": "Merkit + tila",
    "duration": 15,
    "steps": [
      "Merkitse 10–30 m matka.",
      "Kiihdytä täydellä teholla.",
      "Kävele takaisin täydeksi palautukseksi.",
      "Tee 6–10 vetoa."
    ],
    "cues": [
      "Voimakas käsivarsien työ.",
      "Matala lähtö, nouse vähitellen."
    ],
    "video": "sprint acceleration drills football"
  },
  {
    "category": "nopeus",
    "name": "Ketteryystikkaat",
    "desc": "Askelkuviot nopeudella ja rytmillä.",
    "level": "Keskitaso",
    "equipment": "Ketteryystikkaat tai merkit",
    "duration": 12,
    "steps": [
      "Tee askelkuvioita tikkaiden läpi (1 ja 2 jalkaa/ruutu).",
      "Pidä rytmi nopeana ja siistinä.",
      "Lisää käsien työ mukaan."
    ],
    "cues": [
      "Päkiöillä, kevyet askeleet.",
      "Katse eteen, ei alas."
    ],
    "video": "agility ladder drills football"
  },
  {
    "category": "nopeus",
    "name": "Suunnanmuutos 5-10-5",
    "desc": "Kartioiden välillä nopeat käännökset.",
    "level": "Haastava",
    "equipment": "3 kartiota",
    "duration": 12,
    "steps": [
      "Aseta kartiot 5 m välein.",
      "Lähde keskeltä, kosketa toinen pää, toinen pää, takaisin.",
      "Tee terävät käännökset matalana."
    ],
    "cues": [
      "Painopiste alas käännöksessä.",
      "Räjähdä ulos käännöksestä."
    ],
    "video": "5-10-5 agility shuttle drill"
  },
  {
    "category": "nopeus",
    "name": "Reaktiolähdöt",
    "desc": "Lähtö merkistä eri asennoista.",
    "level": "Keskitaso",
    "equipment": "Merkki tai kaveri",
    "duration": 10,
    "steps": [
      "Lähde sprinttiin merkistä (ääni tai käsi).",
      "Vaihtele alkuasentoja (seisten, istuen).",
      "Tee lyhyitä, teräviä lähtöjä."
    ],
    "cues": [
      "Reagoi heti, älä ennakoi.",
      "Ensiaskeleet lyhyitä ja nopeita."
    ],
    "video": "reaction sprint start drills"
  },
  {
    "category": "voima",
    "name": "Kyykyt & askelkyykyt",
    "desc": "Kehonpaino tai lisäpaino, jalkojen voima.",
    "level": "Helppo",
    "equipment": "Kehonpaino (tai lisäpaino)",
    "duration": 20,
    "steps": [
      "Tee kyykkyjä hallitusti täydellä liikeradalla.",
      "Lisää askelkyykyt eteen ja taakse.",
      "3×10–12 toistoa."
    ],
    "cues": [
      "Polvet varpaiden suuntaan.",
      "Selkä neutraali."
    ],
    "video": "bodyweight squat lunge form"
  },
  {
    "category": "voima",
    "name": "Ponnistushypyt (plyometria)",
    "desc": "Loikat ja hypyt räjähtävyyteen.",
    "level": "Haastava",
    "equipment": "Tila (matala koroke)",
    "duration": 15,
    "steps": [
      "Tee räjähtäviä hyppyjä: tasajalkahypyt, loikat.",
      "Laskeudu pehmeästi polvet joustaen.",
      "3×6–8 toistoa, täysi palautus."
    ],
    "cues": [
      "Pehmeä, hiljainen alastulo.",
      "Laatu ennen määrää."
    ],
    "video": "plyometric jumps beginner football"
  },
  {
    "category": "voima",
    "name": "Keskivartalo (core)",
    "desc": "Lankku, sivulankku, vatsaliikkeet.",
    "level": "Helppo",
    "equipment": "Alusta",
    "duration": 12,
    "steps": [
      "Lankku 30–45 s.",
      "Sivulankut molemmin puolin.",
      "Vatsarutistukset ja saksaukset.",
      "2–3 kierrosta."
    ],
    "cues": [
      "Keho suorana, ei notkolle.",
      "Hengitä tasaisesti."
    ],
    "video": "core workout football players"
  },
  {
    "category": "voima",
    "name": "Takaketju: lantionnostot & sillat",
    "desc": "Pakara- ja takareisivoima, vammojen ehkäisy.",
    "level": "Helppo",
    "equipment": "Alusta",
    "duration": 12,
    "steps": [
      "Lantionnostot selinmakuulla, purista pakaroita ylhäällä.",
      "Yhden jalan sillat.",
      "3×10–12 toistoa."
    ],
    "cues": [
      "Purista pakaroita, älä notkista selkää.",
      "Hidas, hallittu liike."
    ],
    "video": "glute bridge hamstring exercise"
  },
  {
    "category": "kestavyys",
    "name": "Intervallijuoksu 4×4 min",
    "desc": "Kovaa, palautus välissä.",
    "level": "Haastava",
    "equipment": "Lenkkireitti",
    "duration": 30,
    "steps": [
      "Lämmittele 10 min.",
      "Juokse 4 min kovaa (n. 90 %), 3 min kevyttä välissä.",
      "Toista 4 kertaa."
    ],
    "cues": [
      "Pidä vauhti tasaisena koko 4 min.",
      "Palautus rauhalliseksi."
    ],
    "video": "4x4 interval running training"
  },
  {
    "category": "kestavyys",
    "name": "Peruskestävyyslenkki",
    "desc": "Rauhallinen tasavauhtinen lenkki.",
    "level": "Helppo",
    "equipment": "Lenkkireitti",
    "duration": 35,
    "steps": [
      "Juokse rauhallista, tasaista vauhtia.",
      "Pysy puhekuntoisella sykkeellä.",
      "30–45 min."
    ],
    "cues": [
      "Vauhti, jossa jaksat jutella.",
      "Rento juoksuasento."
    ],
    "video": "easy aerobic base run training"
  },
  {
    "category": "kestavyys",
    "name": "Mäkivedot",
    "desc": "Lyhyet kovat ylämäkivedot.",
    "level": "Haastava",
    "equipment": "Mäki",
    "duration": 20,
    "steps": [
      "Etsi n. 30–60 m mäki.",
      "Juokse ylös kovaa, kävele alas palautukseksi.",
      "6–10 vetoa."
    ],
    "cues": [
      "Voimakas käsien työ.",
      "Ryhdikäs asento, katse eteen."
    ],
    "video": "hill sprint training"
  },
  {
    "category": "kestavyys",
    "name": "Pallolliset vetointervallit",
    "desc": "Kuljetusvedot kovaa + palautuskävely.",
    "level": "Keskitaso",
    "equipment": "Pallo + tila",
    "duration": 20,
    "steps": [
      "Kuljeta palloa kovaa 20–30 m.",
      "Kävele palloa kuljettaen takaisin.",
      "Tee 8–10 vetoa."
    ],
    "cues": [
      "Pidä pallo hallinnassa vauhdissa.",
      "Täysi teho vedoissa."
    ],
    "video": "dribbling sprint intervals soccer"
  },
  {
    "category": "liikkuvuus",
    "name": "Dynaaminen alkulämmittely",
    "desc": "Jalan heilautukset, lonkka-avaukset ennen treeniä.",
    "level": "Helppo",
    "equipment": "Tila",
    "duration": 10,
    "steps": [
      "Jalan heilautukset eteen-taakse ja sivuille.",
      "Lonkka-avaukset, polvennostot, kantapotkut.",
      "Kevyet kiihdytykset lopuksi."
    ],
    "cues": [
      "Hallitut liikkeet, ei nykäisyjä.",
      "Tee aina ennen treeniä."
    ],
    "video": "dynamic warm up football"
  },
  {
    "category": "liikkuvuus",
    "name": "Staattinen venyttely",
    "desc": "Päälihasryhmät treenin jälkeen.",
    "level": "Helppo",
    "equipment": "Alusta",
    "duration": 10,
    "steps": [
      "Venytä takareisi, etureisi, pohje ja lonkka.",
      "Pidä jokainen venytys 20–30 s.",
      "Tee treenin jälkeen."
    ],
    "cues": [
      "Venytä mukavuusrajalle, ei kipuun.",
      "Hengitä rauhallisesti."
    ],
    "video": "static stretching routine football"
  },
  {
    "category": "liikkuvuus",
    "name": "Lonkan & nilkan liikkuvuus",
    "desc": "Kohdennetut liikkeet jalkapalloilijan niveliin.",
    "level": "Helppo",
    "equipment": "Alusta",
    "duration": 10,
    "steps": [
      "Lonkan avaukset (90/90).",
      "Nilkan liikkuvuus seinää vasten.",
      "Tee molemmin puolin."
    ],
    "cues": [
      "Liiku hallitusti koko liikeradalla.",
      "Säännöllisyys ratkaisee."
    ],
    "video": "hip ankle mobility drills football"
  }
];

/* ---- Apurit ---- */
const pad = n => String(n).padStart(2, '0');
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fmtHours = min => {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
};
const monthKey = iso => iso.slice(0, 7);
const dayFmt = new Intl.DateTimeFormat('fi-FI', { weekday: 'short' });
const dateFmt = new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric' });
const monthName = new Intl.DateTimeFormat('fi-FI', { month: 'long', year: 'numeric' });

/* ---- Lomakkeen tila ---- */
let selectedCat = CATEGORIES[0].id;

/* ---- Tavoitteiden tila ---- */
let currentGoals = [];               // [{ category, hours }]
let myChallenges = [];               // joukkueen haasteet (valmentajan asettamat)
let calEvents = [];                  // joukkueen kalenteritapahtumat (iCal-tilaus)
let questDefs = [];                  // kuluvan viikon viikkotehtävät
let challengeDoneCount = 0;          // suoritetut haasteet yhteensä (saavutukset)
let questClaimCount = 0;             // lunastetut viikkotehtävät yhteensä (saavutukset)
let activeEvent = null;              // käynnissä oleva kausitapahtuma
let myCompletions = new Set();       // tällä viikolla suoritetut kertasuoritus-haasteet
let myEncouragements = [];           // valmentajan kannustukset
let goalSetupCat = null;             // lisäyslomakkeessa valittu kategoria

/* ---- Valittu jakso: 'all' tai 'YYYY-MM' ---- */
let selectedPeriod = monthKey(todayISO());

/* ---- Näkymä ja kalenteri ---- */
let currentView = 'dash';
const _now = new Date();
let calY = _now.getFullYear();
let calM = _now.getMonth();          // 0–11
let selectedDay = todayISO();        // ISO-päivä kalenterissa
let lastAll = [];                    // viimeksi haettu data (kalenterin navigointia varten)
let teamWeek = null;                 // joukkueen yhteisen viikkotavoitteen tila
let myReactions = {};                // logId -> [emoji] valmentajan reaktiot omiin treeneihin
let myFootballs = { total: 0, session: 0, challenge: 0 };  // pysyvä jalkapallosaldo
let footballCfg = { threshold: 30, cap: 400 };             // joukkueen kynnys + päiväkatto
let boostPeriods = [];               // joukkueen tehostejaksot (tupla XP & pallot)
let teamGoalXpRows = [];             // pelaajan yhteistavoite-bonus-XP (rivit)

/* ---- Lomakkeen päivämäärä (oma suomenkielinen valitsin) ---- */
let formDate = todayISO();
let dpY, dpM;                        // valitsimessa näkyvä kuukausi
const btnDateFmt = new Intl.DateTimeFormat('fi-FI', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });

/* ---- Renderöinti ---- */
function renderChips() {
  const box = document.getElementById('chipGroups');
  box.innerHTML = '';
  const groups = [...new Set(CATEGORIES.map(c => c.group))];
  groups.forEach(g => {
    const wrap = document.createElement('div');
    wrap.className = 'chip-group';
    const lbl = document.createElement('div');
    lbl.className = 'chip-group-label';
    lbl.textContent = g;
    const row = document.createElement('div');
    row.className = 'chips';
    CATEGORIES.filter(c => c.group === g).forEach(c => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c.id === selectedCat));
      b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${c.label}`;
      b.onclick = () => { selectedCat = c.id; renderChips(); };
      row.appendChild(b);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(row);
    box.appendChild(wrap);
  });
}

/* ---- Jaksot ---- */
function labelForMonth(key) {
  const [y, m] = key.split('-').map(Number);
  const s = new Intl.DateTimeFormat('fi-FI', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function periodLabel(p) { return p === 'all' ? 'Kaikki ajat' : labelForMonth(p); }

function monthsWithData(all) {
  return [...new Set(all.map(e => monthKey(e.date)))].sort().reverse();
}
function availableMonths(all) {
  const set = new Set(all.map(e => monthKey(e.date)));
  set.add(monthKey(todayISO()));            // nykyinen kuukausi aina valittavissa
  return [...set].sort().reverse();
}
function renderPeriodSelect(all) {
  const sel = document.getElementById('periodSelect');
  const months = availableMonths(all);
  if (selectedPeriod !== 'all' && !months.includes(selectedPeriod)) selectedPeriod = monthKey(todayISO());
  sel.innerHTML = '';
  sel.add(new Option('Kaikki ajat', 'all'));
  months.forEach(m => sel.add(new Option(labelForMonth(m), m)));
  sel.value = selectedPeriod;
}

async function renderAll() {
  const [all, goals, tw, reactions, footballs, fcfg, boosts, tgxp, quests, evt, chDone, qClaims] = await Promise.all([
    store.getEntries(),
    goalStore.get(),
    loadTeamWeek(),
    loadMyReactions(),
    loadFootballEvents(),
    loadFootballCfg(),
    loadBoostPeriods(),
    loadTeamGoalXp(),
    loadQuests(),
    loadActiveEvent(),
    loadChallengeDoneCount(),
    loadQuestClaimCount(),
    refreshShopState(),
  ]);
  lastAll = all;
  currentGoals = goals;
  teamWeek = tw;
  myReactions = reactions;
  myFootballs = footballs;
  footballCfg = fcfg;
  boostPeriods = boosts;
  teamGoalXpRows = tgxp;
  questDefs = quests;
  activeEvent = evt;
  challengeDoneCount = chDone;
  questClaimCount = qClaims;
  renderPeriodSelect(all);
  const isAll = selectedPeriod === 'all';
  const periodEntries = isAll ? all : all.filter(e => monthKey(e.date) === selectedPeriod);

  /* Hero */
  const totalMin = periodEntries.reduce((s, e) => s + e.duration, 0);
  const totalH = (totalMin / 60);
  document.getElementById('heroMonth').textContent = isAll ? 'Kaikkien aikojen yhteensä' : 'Harjoitusaikaa';
  document.getElementById('heroHours').textContent =
    totalMin === 0 ? '0' : (Number.isInteger(totalH) ? totalH : totalH.toFixed(1).replace('.', ','));
  document.getElementById('heroSub').textContent =
    totalMin === 0 ? 'Ei kirjauksia tällä jaksolla' : `Yhteensä ${fmtHours(totalMin)}`;
  document.getElementById('statSessions').textContent = periodEntries.length;

  /* Per-kategoria summat valitulla jaksolla */
  const byCat = {};
  periodEntries.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.duration; });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('statTop').textContent = topCat ? catById(topCat[0]).label : '–';

  /* Palkit */
  document.getElementById('barsPeriod').textContent = periodLabel(selectedPeriod).toLowerCase();
  const maxMin = Math.max(1, ...Object.values(byCat));
  const bars = document.getElementById('bars');
  if (periodEntries.length === 0) {
    bars.innerHTML = '<div class="empty-note">Ei kirjauksia tällä jaksolla.</div>';
  } else {
    bars.innerHTML = '';
    CATEGORIES.forEach(c => {
      const min = byCat[c.id] || 0;
      if (min === 0) return;
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <div class="bar-label"><span class="dot" style="background:${c.color}"></span>${c.label}</div>
        <div class="bar-track"><div class="bar-fill" style="background:${c.color}"></div></div>
        <div class="bar-val">${fmtHours(min)}</div>`;
      bars.appendChild(row);
      requestAnimationFrame(() => {
        row.querySelector('.bar-fill').style.width = (min / maxMin * 100) + '%';
      });
    });
  }

  renderMonthBars(all);
  renderGoal();
  renderChallenges();
  renderEncouragements();
  renderAchievements();
  renderProgress();
  renderLevel();
  renderProfileHeader();
  renderFootballs();
  refreshLeaderboard();
  renderStatusStrip();
  renderQuests();
  renderDrill();
  renderSettings();
  renderTeamGoal();
  updateZoneHeaders();
  renderCalendar();
  renderDayPanel();

  /* Lista (vain 10 viimeisintä) */
  const log = document.getElementById('log');
  const recent = all.slice(0, 10);
  document.getElementById('listCount').textContent =
    all.length === 0 ? '' : (all.length > 10 ? `uusimmat 10 / ${all.length}` : `${all.length} kpl`);
  if (all.length === 0) {
    log.innerHTML = '<div class="log-empty">Ei vielä harjoituksia. Lisää ensimmäinen yllä.</div>';
    return;
  }
  log.innerHTML = '';
  recent.forEach(e => {
    const c = catById(e.category);
    const d = new Date(e.date + 'T00:00:00');
    const item = document.createElement('div');
    item.className = 'log-item';
    item.innerHTML = `
      <div class="log-date">${dayFmt.format(d)}<small>${dateFmt.format(d)}</small></div>
      <div>
        <div class="log-cat"><span class="dot" style="background:${c.color}"></span>${c.label}</div>
        ${e.note ? `<div class="log-note">${escapeHtml(e.note)}</div>` : ''}
        ${reactionChipsHtml(e.id)}
      </div>
      <div class="log-dur">${e.duration}<small>min</small></div>
      <div class="del-area"></div>`;
    setupDelete(item.querySelector('.del-area'), e);
    log.appendChild(item);
  });
}

/* Poisto kahdessa vaiheessa: × → "Poista / Peru" */
function setupDelete(area, entry) {
  area.innerHTML = '<button class="del" title="Poista" aria-label="Poista kirjaus">×</button>';
  area.querySelector('.del').onclick = () => {
    area.innerHTML = `
      <span class="confirm">
        <button class="confirm-yes" type="button">Poista</button>
        <button class="confirm-no" type="button">Peru</button>
      </span>`;
    area.querySelector('.confirm-yes').onclick = async () => { await store.deleteEntry(entry.id); renderAll(); };
    area.querySelector('.confirm-no').onclick = () => setupDelete(area, entry);
  };
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[ch]));
}

/* ---- Kuukausittain (koko historia, klikattava) ---- */
function renderMonthBars(all) {
  const card = document.getElementById('monthsCard');
  const months = monthsWithData(all);
  if (months.length <= 1) { card.style.display = 'none'; return; }
  card.style.display = '';

  const totals = months.map(m => ({
    key: m,
    min: all.filter(e => monthKey(e.date) === m).reduce((s, e) => s + e.duration, 0)
  }));
  const max = Math.max(1, ...totals.map(t => t.min));
  const box = document.getElementById('monthBars');
  box.innerHTML = '';
  totals.forEach(t => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'bar-row month-row' + (selectedPeriod === t.key ? ' active' : '');
    row.innerHTML = `
      <div class="bar-label">${labelForMonth(t.key)}</div>
      <div class="bar-track"><div class="bar-fill" style="background:var(--brand)"></div></div>
      <div class="bar-val">${fmtHours(t.min)}</div>`;
    row.onclick = () => { selectedPeriod = t.key; renderAll(); };
    box.appendChild(row);
    requestAnimationFrame(() => {
      row.querySelector('.bar-fill').style.width = (t.min / max * 100) + '%';
    });
  });
}

/* ---- Näkymänvaihto ---- */
function switchView(v) {
  currentView = v;
  document.getElementById('viewDash').hidden = (v !== 'dash');
  document.getElementById('viewCalendar').hidden = (v !== 'cal');
  document.getElementById('viewBank').hidden = (v !== 'bank');
  document.getElementById('viewProfile').hidden = (v !== 'profile');
  document.getElementById('viewShop').hidden = (v !== 'shop');
  document.getElementById('tabDash').classList.toggle('active', v === 'dash');
  document.getElementById('tabCal').classList.toggle('active', v === 'cal');
  document.getElementById('tabBank').classList.toggle('active', v === 'bank');
  document.getElementById('playerWrap').classList.toggle('wide', v === 'cal');
  if (v === 'cal') { renderCalendar(); renderDayPanel(); }
  if (v === 'bank') renderBank();
  if (v === 'shop') { renderShop(); window.scrollTo(0, 0); }
  if (v === 'profile') window.scrollTo(0, 0);
}

/* ---- Harjoitepankki ---- */
const LEVEL_CLASS = { 'Helppo': 'easy', 'Keskitaso': 'mid', 'Haastava': 'hard' };
function bankVideoUrl(ex) {
  const q = (ex.video || ex.name) + ' football drill';
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
}
function renderBank() {
  const box = document.getElementById('bankList');
  box.innerHTML = '';
  const search = document.createElement('input');
  search.type = 'text';
  search.id = 'bankSearch';
  search.className = 'ics-input bank-search';
  search.placeholder = 'Hae harjoitetta…';
  search.autocapitalize = 'none';
  search.spellcheck = false;
  box.appendChild(search);

  CATEGORIES.forEach(c => {
    const exs = EXERCISES.filter(e => e.category === c.id);
    if (!exs.length) return;
    const group = document.createElement('div');
    group.className = 'bank-group';
    const ghead = document.createElement('div');
    ghead.className = 'bank-group-head';
    ghead.innerHTML = `<span class="dot" style="background:${c.color}"></span>${c.label}`;
    group.appendChild(ghead);
    const list = document.createElement('div');
    list.className = 'bank-items';
    exs.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'bank-item collapsible';
      item.dataset.name = ex.name.toLowerCase();
      const lvl = LEVEL_CLASS[ex.level] || 'mid';
      item.innerHTML = `
        <button class="bank-head" type="button" aria-expanded="false">
          <span class="bank-head-main">
            <span class="bank-name">${escapeHtml(ex.name)}</span>
            <span class="bank-desc">${escapeHtml(ex.desc)}</span>
          </span>
          <span class="bank-head-side">
            <span class="bank-level ${lvl}">${ex.level}</span>
            <span class="bank-chevron">▾</span>
          </span>
        </button>
        <div class="bank-detail" hidden>
          <div class="bank-meta">
            <span class="bank-meta-item">⏱ ${ex.duration} min</span>
            <span class="bank-meta-item">🎒 ${escapeHtml(ex.equipment)}</span>
          </div>
          <div class="bank-section-label">Suoritus</div>
          <ol class="bank-steps">${ex.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
          <div class="bank-section-label">Muista</div>
          <ul class="bank-cues">${ex.cues.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
          <div class="bank-actions">
            <button class="btn bank-log-btn" type="button">Kirjaa tämä</button>
            <a class="bank-video-btn" href="${bankVideoUrl(ex)}" target="_blank" rel="noopener noreferrer">Katso video ▸</a>
          </div>
        </div>`;
      const headBtn = item.querySelector('.bank-head');
      headBtn.onclick = () => {
        const exp = headBtn.getAttribute('aria-expanded') === 'true';
        headBtn.setAttribute('aria-expanded', String(!exp));
        item.querySelector('.bank-detail').hidden = exp;
      };
      item.querySelector('.bank-log-btn').onclick = () => selectExercise(ex);
      list.appendChild(item);
    });
    group.appendChild(list);
    box.appendChild(group);
  });

  search.oninput = () => {
    const q = search.value.trim().toLowerCase();
    box.querySelectorAll('.bank-group').forEach(group => {
      let visible = 0;
      group.querySelectorAll('.bank-item').forEach(item => {
        const match = !q || item.dataset.name.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      group.style.display = visible ? '' : 'none';
    });
  };
}

function selectExercise(ex) {
  selectedCat = ex.category;
  renderChips();
  document.getElementById('inNote').value = ex.name;
  document.getElementById('inDuration').value = ex.duration || '';
  switchView('dash');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('inDuration').focus();
}

/* ---- Tavoitteet (useita per viikko) ---- */
function weekRangeISO(d = new Date()) {
  const day = (d.getDay() + 6) % 7;                 // ma=0 … su=6
  const mon = new Date(d); mon.setDate(d.getDate() - day);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const iso = x => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  return { mondayISO: iso(mon), sundayISO: iso(sun) };
}
function hoursShort(h) {
  const s = Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',');
  return `${s} h`;
}
function goalProgress(goal) {
  const { mondayISO, sundayISO } = weekRangeISO();
  const doneMin = lastAll
    .filter(e => e.category === goal.category && e.date >= mondayISO && e.date <= sundayISO)
    .reduce((s, e) => s + e.duration, 0);
  const targetMin = Math.round(goal.hours * 60);
  const pct = targetMin ? Math.min(1, doneMin / targetMin) : 0;
  return { doneMin, targetMin, pct, achieved: doneMin >= targetMin };
}

/* Kannustuslauseet edistymisen mukaan */
const GOAL_PHRASES = {
  start: [
    'Uusi viikko, uusi mahdollisuus – aloita tästä!',
    'Hyvä hetki aloittaa. Sinä pystyt tähän!',
    'Ensimmäinen treeni vie jo kohti tavoitetta.'
  ],
  early: [
    'Hyvä alku! Pidä vauhti yllä.',
    'Hienoa, olet liikkeellä – jatka samaan malliin!',
    'Hyvää työtä, tavoite lähestyy askel kerrallaan.'
  ],
  mid: [
    'Puoliväli ylitetty – loistavaa!',
    'Hieno suoritus, olet jo pitkällä!',
    'Vauhti on hyvä, pidä se yllä!'
  ],
  almost: [
    'Enää vähän! Tavoite on käden ulottuvilla.',
    'Melkein perillä – viimeinen rutistus!',
    'Niin lähellä! Yksi treeni vielä.'
  ],
  achieved: [
    'Tavoite saavutettu – hienoa työtä!',
    'Mahtavaa, viikkotavoite täynnä!',
    'Loistavaa – sinä teit sen!'
  ],
  exceeded: [
    'Tavoite ylitetty – uskomatonta sisua!',
    'Yli tavoitteen, olet tulessa!',
    'Huippusuoritus – ylitit tavoitteesi!'
  ]
};
function pickPhrase(arr, seed) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}
function goalMessage(g, p) {
  const seed = g.category + weekRangeISO().mondayISO;
  const raw = p.targetMin ? p.doneMin / p.targetMin : 0;
  let arr;
  if (p.doneMin === 0) arr = GOAL_PHRASES.start;
  else if (p.doneMin > p.targetMin) arr = GOAL_PHRASES.exceeded;
  else if (p.achieved) arr = GOAL_PHRASES.achieved;
  else if (raw >= 0.85) arr = GOAL_PHRASES.almost;
  else if (raw >= 0.5) arr = GOAL_PHRASES.mid;
  else arr = GOAL_PHRASES.early;
  return pickPhrase(arr, seed);
}
function goalNudge(g, p) {
  if (p.achieved) return '';
  const remMin = p.targetMin - p.doneMin;
  if (remMin <= 0) return '';
  const dow = (new Date().getDay() + 6) % 7;   // ma=0 … su=6
  const remDays = 7 - dow;                       // tämä päivä mukaan luettuna
  if (remDays <= 0) return '';
  const perDay = Math.ceil(remMin / remDays);
  return `Noin ${perDay} min päivässä loppuviikon ajan riittää tavoitteeseen.`;
}
function goalStreak(goal) {
  const targetMin = Math.round(goal.hours * 60);
  let streak = 0;
  for (let i = 0; i < 104; i++) {
    const ref = new Date(); ref.setDate(ref.getDate() - i * 7);
    const { mondayISO, sundayISO } = weekRangeISO(ref);
    const min = lastAll
      .filter(e => e.category === goal.category && e.date >= mondayISO && e.date <= sundayISO)
      .reduce((s, e) => s + e.duration, 0);
    if (i === 0) { if (min >= targetMin) streak++; }   // kesken oleva viikko ei katkaise putkea
    else { if (min >= targetMin) streak++; else break; }
  }
  return streak;
}

function renderGoal() {
  const card = document.getElementById('goalCard');
  card.className = 'card';
  const usedIds = currentGoals.map(g => g.category);
  const remaining = CATEGORIES.filter(c => c.id !== 'muu' && !usedIds.includes(c.id));
  const allAchieved = currentGoals.length > 0 && currentGoals.every(g => goalProgress(g).achieved);

  let html = `<div class="sec-head"><h2>Viikkotavoitteet</h2>${currentGoals.length ? `<span class="hint">${currentGoals.filter(g => goalProgress(g).achieved).length} / ${currentGoals.length} saavutettu</span>` : ''}</div>`;

  if (!currentGoals.length) {
    html += `<p class="goal-intro">Aseta yksi tai useampi viikkotavoite (ma–su): valitse kategoria ja kuinka monta tuntia haluat sitä treenata. Voit lisätä useita tavoitteita eri kategorioille.</p>`;
  } else {
    html += `<div class="goal-list">`;
    currentGoals.forEach((g, i) => {
      const c = catById(g.category);
      const p = goalProgress(g);
      const rawPct = p.targetMin ? Math.round(p.doneMin / p.targetMin * 100) : 0;
      const streak = goalStreak(g);
      const nudge = goalNudge(g, p);
      html += `
        <div class="goal-row${p.achieved ? ' achieved' : ''}">
          <div class="goal-row-top">
            <span class="goal-row-label">
              <span class="dot" style="background:${c.color}"></span>${c.label}
              <span class="goal-row-target">${hoursShort(g.hours)} / vko</span>
              ${streak >= 2 ? `<span class="goal-streak">${streak} vko putkeen</span>` : ''}
              ${p.achieved ? `<span class="goal-badge" title="Saavutettu">✓</span>` : ''}
            </span>
            <button class="goal-remove" data-i="${i}" type="button" aria-label="Poista tavoite">×</button>
          </div>
          <div class="goal-bar"><div class="goal-bar-fill" data-pct="${p.pct}" style="width:0; background:${p.achieved ? 'var(--accent)' : c.color}"></div></div>
          <div class="goal-nums">${fmtHours(p.doneMin)} / ${fmtHours(p.targetMin)} · ${rawPct} %</div>
          <div class="goal-encour">${goalMessage(g, p)}</div>
          ${nudge ? `<div class="goal-nudge">${nudge}</div>` : ''}
        </div>`;
    });
    html += `</div>`;
    if (allAchieved) html += `<div class="goal-msg achieved-msg">Kaikki viikkotavoitteet saavutettu – mahtavaa työtä!</div>`;
  }

  if (remaining.length) {
    if (!goalSetupCat || !remaining.some(c => c.id === goalSetupCat)) goalSetupCat = remaining[0].id;
    if (currentGoals.length === 0) {
      html += `
        <div class="goal-add goal-add-first">
          <div class="goal-add-label">Valitse kategoria</div>
          <div class="chip-groups goal-setup-cats" id="goalChips"></div>
          <label class="fld goal-hours-fld"><span>Tuntia viikossa</span>
            <input type="number" id="goalHours" min="0.5" max="40" step="0.5" placeholder="esim. 3">
          </label>
          <button class="btn" id="goalAddBtn" type="button">Aseta tavoite</button>
        </div>`;
    } else {
      html += `
        <div class="goal-add">
          <div class="goal-add-label">Lisää tavoite</div>
          <div class="chip-groups goal-setup-cats" id="goalChips"></div>
          <div class="goal-add-row">
            <input type="number" id="goalHours" min="0.5" max="40" step="0.5" placeholder="tuntia / viikko">
            <button class="btn goal-add-btn" id="goalAddBtn" type="button">Lisää</button>
          </div>
        </div>`;
    }
  }

  card.innerHTML = html;

  card.querySelectorAll('.goal-bar-fill').forEach(f => {
    const pct = parseFloat(f.dataset.pct);
    requestAnimationFrame(() => { f.style.width = (pct * 100) + '%'; });
  });
  card.querySelectorAll('.goal-remove').forEach(btn => {
    btn.onclick = async () => {
      const i = parseInt(btn.dataset.i, 10);
      await goalStore.remove(currentGoals[i].category);
      renderAll();
    };
  });
  const chipBox = card.querySelector('#goalChips');
  if (chipBox) {
    const setPressed = () => chipBox.querySelectorAll('.goal-chip').forEach(x =>
      x.setAttribute('aria-pressed', String(x.dataset.cat === goalSetupCat)));
    const groups = [...new Set(remaining.map(c => c.group))];
    groups.forEach(g => {
      const wrap = document.createElement('div');
      wrap.className = 'chip-group';
      const lbl = document.createElement('div');
      lbl.className = 'chip-group-label';
      lbl.textContent = g;
      const row = document.createElement('div');
      row.className = 'chips';
      remaining.filter(c => c.group === g).forEach(c => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip goal-chip';
        b.dataset.cat = c.id;
        b.setAttribute('aria-pressed', String(c.id === goalSetupCat));
        b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${c.label}`;
        b.onclick = () => { goalSetupCat = c.id; setPressed(); };
        row.appendChild(b);
      });
      wrap.appendChild(lbl);
      wrap.appendChild(row);
      chipBox.appendChild(wrap);
    });
    card.querySelector('#goalAddBtn').onclick = async () => {
      const hrs = parseFloat(card.querySelector('#goalHours').value);
      if (!hrs || hrs <= 0) { card.querySelector('#goalHours').focus(); return; }
      await goalStore.add({ category: goalSetupCat, hours: hrs });
      goalSetupCat = null;
      renderAll();
      showToast('Tavoite tallennettu');
    };
  }
}

/* ---- Joukkueen haasteet (pelaajan näkymä) ---- */
async function loadMyChallenges() {
  const { data, error } = await sb.from('challenges').select('id, category, hours, description, user_id, due_date, created_at, football_reward');
  if (error) { console.error(error); return []; }
  return data.map(c => ({ ...c, hours: c.hours == null ? null : Number(c.hours) }));
}

// Suorituksen avain: määräpäivähaasteella due_date, viikkohaasteella kuluvan viikon maanantai.
function challengeKey(ch) { return ch.due_date ? ch.due_date : weekRangeISO().mondayISO; }
function isChallengeDone(ch) { return myCompletions.has(ch.id + '|' + challengeKey(ch)); }
function challengePastDue(ch) { return !!ch.due_date && ch.due_date < todayISO(); }

// Aikatavoitteen edistyminen: viikkohaaste = kuluva viikko; määräpäivähaaste = kertymä luonnista tähän päivään.
function challengeProgress(ch) {
  if (!ch.due_date) return goalProgress(ch);
  const startISO = (ch.created_at || '').slice(0, 10);
  const today = todayISO();
  const doneMin = lastAll
    .filter(e => e.category === ch.category && (!startISO || e.date >= startISO) && e.date <= today)
    .reduce((s, e) => s + e.duration, 0);
  const targetMin = Math.round((ch.hours || 0) * 60);
  return { doneMin, targetMin, pct: targetMin ? Math.min(1, doneMin / targetMin) : 0, achieved: doneMin >= targetMin };
}

async function loadMyCompletions() {
  const { mondayISO } = weekRangeISO();
  const keys = [...new Set([mondayISO, ...myChallenges.filter(c => c.due_date).map(c => c.due_date)])];
  const { data, error } = await sb.from('challenge_completions').select('challenge_id, week_start').in('week_start', keys);
  if (error) { console.error(error); return new Set(); }
  return new Set(data.map(r => r.challenge_id + '|' + r.week_start));
}

const completionStore = {
  async complete(ch) {
    return await sb.from('challenge_completions').insert({ challenge_id: ch.id, week_start: challengeKey(ch) });
  },
  async uncomplete(ch) {
    return await sb.from('challenge_completions').delete().eq('challenge_id', ch.id).eq('week_start', challengeKey(ch));
  }
};

/* ---- Joukkueen kalenteritapahtumat (iCal-tilaus Edge Functionin kautta) ---- */
async function loadCalEvents() {
  try {
    const { data, error } = await sb.functions.invoke('calendar');
    if (error) { console.error(error); return []; }
    return (data && data.events) || [];
  } catch (e) { console.error(e); return []; }
}

/* ---- Valmentajan kannustukset (pelaajan näkymä) ---- */
async function loadMyEncouragements() {
  const { data, error } = await sb.from('encouragements').select('id, text, created_at').order('created_at', { ascending: false }).limit(5);
  if (error) { console.error(error); return []; }
  return data;
}
function timeAgo(iso) {
  const days = Math.floor((new Date() - new Date(iso)) / 86400000);
  if (days <= 0) return 'tänään';
  if (days === 1) return 'eilen';
  if (days < 7) return `${days} pv sitten`;
  return fmtDateShort(iso.slice(0, 10));
}
function renderEncouragements() {
  const card = document.getElementById('coachMsgCard');
  if (!card) return;
  if (!myEncouragements.length) { card.hidden = true; return; }
  card.hidden = false;
  card.innerHTML = `<div class="sec-head"><h2>Valmentajalta</h2></div>`
    + `<div class="msg-list">` + myEncouragements.map(m => `
      <div class="msg-row">
        <span class="msg-icon">💬</span>
        <div class="msg-body"><div class="msg-text">${escapeHtml(m.text)}</div><div class="msg-date">${timeAgo(m.created_at)}</div></div>
      </div>`).join('') + `</div>`;
}

/* ---- Putki ja virstanpylväät (lasketaan kirjauksista) ---- */
function addDaysISO(iso, n) { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function mondayOfISO(iso) { return weekRangeISO(new Date(iso + 'T00:00:00')).mondayISO; }

function streakInfo() {
  if (!lastAll.length) return { streak: 0, shieldUsed: false };
  const active = new Set(lastAll.map(e => mondayOfISO(e.date)));
  const earliest = [...active].sort()[0];
  const currentMon = weekRangeISO().mondayISO;
  let streak = 0, shieldUsed = false, first = true, cursor = currentMon;
  while (cursor >= earliest) {
    if (active.has(cursor)) {
      streak++;
    } else if (first) {
      // kuluva viikko vielä kesken — armonaika, ei katkaise eikä kuluta suojaa
    } else if (!shieldUsed) {
      shieldUsed = true;            // yksi väliin jäänyt viikko suojataan
    } else {
      break;                       // toinen peräkkäinen aukko katkaisee putken
    }
    first = false;
    cursor = addDaysISO(cursor, -7);
  }
  return { streak, shieldUsed };
}
function weeklyStreak() { return streakInfo().streak; }

const ACH_TRACKS = [
  { key: 'count',  icon: '🎯',  unit: 'treeniä',      tiers: [10, 25, 50, 100, 200, 365] },
  { key: 'hours',  icon: '⏱️', unit: 'tuntia',       tiers: [10, 25, 50, 100, 200] },
  { key: 'streak', icon: '🔥',  unit: 'vko putkeen',  tiers: [2, 4, 8, 12, 26, 52] },
  { key: 'challenges', icon: '🏆', unit: 'haastetta',       tiers: [1, 5, 10, 25, 50, 100] },
  { key: 'quests',     icon: '📋', unit: 'viikkotehtävää',  tiers: [1, 5, 10, 25, 50] },
  { key: 'footballs',  icon: '⚽', unit: 'jalkapalloa',     tiers: [500, 1000, 2500, 5000, 10000, 25000] },
  { key: 'categories', icon: '🧩', unit: 'lajitaitoa',      tiers: [3, 5, 7, 9] },
  { key: 'longest',    icon: '💪', unit: 'min kerralla',    tiers: [60, 90, 120, 180, 240] },
  { key: 'beststreak', icon: '⚡', unit: 'vko paras putki', tiers: [2, 4, 8, 12, 26, 52] },
  { key: 'weeks',      icon: '🗓️', unit: 'aktiivista viikkoa', tiers: [4, 12, 26, 52, 104] },
];
function renderAchievements() {
  const card = document.getElementById('achieveCard');
  if (!card) return;
  const vals = {
    count: lastAll.length,
    hours: lastAll.reduce((s, e) => s + e.duration, 0) / 60,
    streak: weeklyStreak(),
    challenges: challengeDoneCount,
    quests: questClaimCount,
    footballs: myFootballs ? (myFootballs.total || 0) : 0,
    categories: new Set(lastAll.map(e => e.category)).size,
    longest: lastAll.reduce((m, e) => Math.max(m, e.duration), 0),
    beststreak: longestStreak(),
    weeks: new Set(lastAll.map(e => mondayOfISO(e.date))).size,
  };
  const fmtVal = (key, v) => key === 'hours' ? hoursShort(Math.round(v * 10) / 10) : key === 'footballs' ? fmtBalls(Math.round(v)) : String(Math.round(v));
  const fmtT = (key, t) => key === 'footballs' ? fmtBalls(t) : String(t);
  const streak = vals.streak;
  const streakHero = streak >= 1
    ? `<div class="streak-hero"><span class="streak-flame">🔥</span><span class="streak-num">${streak}</span><span class="streak-label">${streak === 1 ? 'viikko' : 'viikkoa'} putkeen</span></div>`
    : `<div class="streak-hero streak-zero"><span class="streak-flame">✨</span><span class="streak-label">Aloita uusi putki — kirjaa treeni tällä viikolla!</span></div>`;
  const tracks = ACH_TRACKS.map(tr => {
    const v = vals[tr.key];
    const earned = [...tr.tiers].reverse().find(t => v >= t) || null;
    const next = tr.tiers.find(t => t > v) || null;
    const pct = next ? Math.min(100, Math.round(v / next * 100)) : 100;
    return `
      <div class="ach-track">
        <div class="ach-track-top">
          <span class="ach-icon">${tr.icon}</span>
          <span class="ach-track-label">${fmtVal(tr.key, v)} ${tr.unit}</span>
          ${earned ? `<span class="ach-earned">🏅 ${fmtT(tr.key, earned)}</span>` : ''}
        </div>
        ${next
          ? `<div class="ach-bar"><div class="ach-bar-fill" style="width:${pct}%"></div></div><div class="ach-next">Seuraava merkki: ${fmtT(tr.key, next)} ${tr.unit}</div>`
          : `<div class="ach-next ach-max">Kaikki merkit ansaittu! 🎉</div>`}
      </div>`;
  }).join('');
  card.innerHTML = `<div class="sec-head"><h2>Saavutukset</h2></div>${streakHero}<div class="ach-tracks">${tracks}</div>`;
}

/* ---- Kehitys: viikkotuntien käyrä + ennätykset ---- */
function weeklyTotals(nWeeks) {
  const thisMon = weekRangeISO().mondayISO;
  const weeks = [];
  for (let i = nWeeks - 1; i >= 0; i--) weeks.push({ mon: addDaysISO(thisMon, -7 * i), min: 0 });
  const idx = {}; weeks.forEach((w, i) => { idx[w.mon] = i; });
  lastAll.forEach(e => { const m = mondayOfISO(e.date); if (m in idx) weeks[idx[m]].min += e.duration; });
  return weeks;
}
function longestStreak() {
  if (!lastAll.length) return 0;
  const weeks = [...new Set(lastAll.map(e => mondayOfISO(e.date)))].sort();
  let best = 1, run = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === addDaysISO(weeks[i - 1], 7)) { run++; best = Math.max(best, run); }
    else run = 1;
  }
  return best;
}
function bestWeekMin() {
  const map = {};
  lastAll.forEach(e => { const m = mondayOfISO(e.date); map[m] = (map[m] || 0) + e.duration; });
  const vals = Object.values(map);
  return vals.length ? Math.max(...vals) : 0;
}
function trendChartSVG(data) {
  const W = 340, H = 150, padL = 6, padR = 6, padT = 16, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const hrs = data.map(w => w.min / 60);
  const maxH = Math.max(1, ...hrs);
  const n = data.length;
  const x = i => padL + (n === 1 ? innerW / 2 : i * (innerW / (n - 1)));
  const y = v => padT + innerH - (v / maxH) * innerH;
  const base = padT + innerH;
  const pts = hrs.map((v, i) => [x(i), y(v)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `M${x(0).toFixed(1)} ${base.toFixed(1)} ` + pts.map(p => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ` L${x(n - 1).toFixed(1)} ${base.toFixed(1)} Z`;
  const dm = iso => { const d = new Date(iso + 'T00:00:00'); return `${d.getDate()}.${d.getMonth() + 1}.`; };
  const labels = data.map((w, i) => (i % 2 === 0 || i === n - 1)
    ? `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="trend-x">${dm(w.mon)}</text>` : '').join('');
  const dots = pts.map((p, i) => {
    const last = i === n - 1;
    return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${last ? 4.5 : 3}" class="${last ? 'trend-dot-last' : 'trend-dot'}"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" class="trend-svg" role="img" aria-label="Viikkotuntien kehitys">
    <line x1="${padL}" y1="${base}" x2="${W - padR}" y2="${base}" class="trend-base"/>
    <path d="${area}" class="trend-area"/>
    <path d="${line}" class="trend-line"/>
    ${dots}${labels}
  </svg>`;
}
function renderProgress() {
  const card = document.getElementById('progressCard');
  if (!card) return;
  if (!lastAll.length) { card.hidden = true; return; }
  card.hidden = false;
  const data = weeklyTotals(10);
  const cur = data[data.length - 1].min;
  const prev = data[data.length - 2] ? data[data.length - 2].min : 0;
  const diff = cur - prev;
  let delta;
  if (cur === 0 && prev === 0) delta = `<span class="trend-delta">Kirjaa treeni tällä viikolla</span>`;
  else if (diff > 0) delta = `<span class="trend-delta up">▲ +${fmtHours(diff)} vs. viime viikko</span>`;
  else if (diff < 0) delta = `<span class="trend-delta down">▼ ${fmtHours(-diff)} vs. viime viikko</span>`;
  else delta = `<span class="trend-delta even">– sama kuin viime viikko</span>`;

  const totalMin = lastAll.reduce((s, e) => s + e.duration, 0);
  const longest = longestStreak();
  const recs = [
    { icon: '🔥', val: `${longest} vko`, label: 'Pisin putki' },
    { icon: '🏆', val: hoursShort(Math.round(bestWeekMin() / 60 * 10) / 10), label: 'Paras viikko' },
    { icon: '⏱️', val: hoursShort(Math.round(totalMin / 60 * 10) / 10), label: 'Tunnit yhteensä' },
    { icon: '📅', val: String(lastAll.length), label: 'Treenejä' },
  ];
  const recGrid = recs.map(r => `
    <div class="rec-tile">
      <span class="rec-icon">${r.icon}</span>
      <span class="rec-val">${r.val}</span>
      <span class="rec-label">${r.label}</span>
    </div>`).join('');

  card.innerHTML = `
    <div class="sec-head"><h2>Kehitys</h2><span class="hint">viikkotunnit</span></div>
    <div class="trend-head">
      <div class="trend-now"><span class="trend-now-val">${fmtHours(cur)}</span><span class="trend-now-lbl">tällä viikolla</span></div>
      ${delta}
    </div>
    <div class="trend-chart">${trendChartSVG(data)}</div>
    <div class="rec-grid">${recGrid}</div>`;
}

/* ---- Taso / XP (kausittain nollautuva) ---- */
const LEVELS = [
  { lvl: 1,  xp: 0,    name: 'Aloittelija' },
  { lvl: 2,  xp: 150,  name: 'Innokas' },
  { lvl: 3,  xp: 400,  name: 'Ahkera' },
  { lvl: 4,  xp: 800,  name: 'Sinnikäs' },
  { lvl: 5,  xp: 1400, name: 'Omistautunut' },
  { lvl: 6,  xp: 2200, name: 'Tähtipelaaja' },
  { lvl: 7,  xp: 3200, name: 'Mestarikokelas' },
  { lvl: 8,  xp: 4500, name: 'Huippu' },
  { lvl: 9,  xp: 6000, name: 'Mestari' },
  { lvl: 10, xp: 8000, name: 'Legenda' },
];
function levelBadgeImg(lvl) {
  return `<img class="level-badge-img" src="icons/levels/level${lvl}.png" alt="Taso ${lvl}" loading="lazy">`;
}
// XP: jokainen treeni 10 XP + 1 XP / minuutti (palkitsee sekä säännöllisyyttä että kestoa).
function sessionXp(min) { return 10 + min; }
/* Tehostejaksot: suurin voimassa oleva kerroin annettuna päivänä (oletus 1). */
function boostMultIn(periods, dateISO, teamId) {
  let m = 1;
  if (!periods || !dateISO) return m;
  for (const b of periods) {
    if (teamId && b.team_id !== teamId) continue;
    if (dateISO >= b.starts_on && dateISO <= b.ends_on && b.multiplier > m) m = b.multiplier;
  }
  return m;
}
function boostMult(dateISO) { return boostMultIn(boostPeriods, dateISO, null); }
async function loadBoostPeriods() {
  const { data, error } = await sb.from('boost_periods')
    .select('id, team_id, label, starts_on, ends_on, multiplier').order('starts_on', { ascending: true });
  if (error) { console.error(error); return []; }
  return data || [];
}
async function loadTeamGoalXp() {
  const { data, error } = await sb.from('team_goal_xp_events').select('week_start, xp');
  if (error) { console.error(error); return []; }
  return data || [];
}
function teamGoalXpTotal(seasonStart) {
  return teamGoalXpRows.reduce((s, r) =>
    (!seasonStart || r.week_start >= seasonStart) ? s + (Number(r.xp) || 0) : s, 0);
}
function activeBoost(periods) {
  const today = todayISO();
  let best = null;
  (periods || []).forEach(b => {
    if (today >= b.starts_on && today <= b.ends_on) {
      if (!best || b.multiplier > best.multiplier) best = b;
    }
  });
  return best;
}
/* Lähin tehostejakso joka alkaa seuraavan N päivän sisällä (ei vielä käynnissä). */
function upcomingBoost(periods, withinDays) {
  const today = todayISO();
  const limit = addDaysISO(today, withinDays);
  let best = null;
  (periods || []).forEach(b => {
    if (b.starts_on > today && b.starts_on <= limit) {
      if (!best || b.starts_on < best.starts_on) best = b;
    }
  });
  return best;
}
/* Hohtava ×N-merkki kun tehostejakso on voimassa (tyhjä jos ei). */
function boostBadgeHtml() {
  const b = activeBoost(boostPeriods);
  if (!b) return '';
  return `<span class="boost-badge" title="Tehostejakso käynnissä — tupla palkinto">×${b.multiplier}</span>`;
}
function levelInfo(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find(l => l.xp > xp) || null;
  const pct = next ? Math.round((xp - cur.xp) / (next.xp - cur.xp) * 100) : 100;
  return { cur, next, pct };
}
function renderLevel() {
  const card = document.getElementById('levelCard');
  if (!card) return;
  card.hidden = false;
  const seasonStart = teamWeek && teamWeek.seasonStart ? teamWeek.seasonStart : null;
  const seasonName = teamWeek && teamWeek.seasonName ? teamWeek.seasonName : null;
  const logs = seasonStart ? lastAll.filter(e => e.date >= seasonStart) : lastAll;
  const xp = logs.reduce((s, e) => s + sessionXp(e.duration) * boostMult(e.date), 0) + teamGoalXpTotal(seasonStart);
  const info = levelInfo(xp);
  checkLevelUp(xp);
  const seasonLabel = seasonName
    ? `Kausi: ${escapeHtml(seasonName)}`
    : (seasonStart ? `Kausi alkoi ${fmtDateShort(seasonStart)}` : 'Kaikkien aikojen');
  const nextLine = info.next
    ? `<div class="lvl-bar"><div class="lvl-bar-fill" data-pct="${info.pct / 100}" style="width:0"></div></div>
       <div class="lvl-next">${xp} / ${info.next.xp} XP · seuraava taso: ${info.next.name}</div>`
    : `<div class="lvl-bar"><div class="lvl-bar-fill" data-pct="1" style="width:0"></div></div>
       <div class="lvl-next lvl-max">Korkein taso saavutettu! ${xp} XP 🎉</div>`;
  card.innerHTML = `
    <div class="sec-head"><h2>Taso</h2><span class="hint">${seasonLabel}</span></div>
    <div class="lvl-hero">
      <span class="lvl-badge">${levelBadgeImg(info.cur.lvl)}</span>
      <div class="lvl-hero-text"><span class="lvl-name">${info.cur.name}</span><span class="lvl-xp">${xp} XP</span></div>
    </div>
    ${nextLine}
    <div class="lvl-hint">10 XP / treeni + 1 XP / minuutti</div>`;
  const fill = card.querySelector('.lvl-bar-fill');
  const pct = parseFloat(fill.dataset.pct);
  requestAnimationFrame(() => { fill.style.width = (pct * 100) + '%'; });
  [...card.classList].forEach(c => { if (c.indexOf('pbg-') === 0) card.classList.remove(c); });
  const bgId = currentUser ? currentUser.cos_profile_bg : null;
  const bg = bgId ? cosItem(bgId) : null;
  if (bg && bg.type === 'profile_bg') card.classList.add('pbg-' + bg.value);
}

/* Kiiltävät premium-koristeet (metalli/jalokivi) — tunnistetaan id:n perusteella */
const SHINY = {
  name_gold: 'gold',         frame_gold: 'gold',
  name_silver: 'silver',     frame_silver: 'silver',
  name_bronze: 'bronze',     frame_bronze: 'bronze',
  name_platinum: 'platinum', frame_platinum: 'platinum',
  name_red: 'ruby',          frame_ruby: 'ruby',
  frame_sapphire: 'sapphire'
};
function shinyMat(id) { return id && SHINY[id] ? SHINY[id] : null; }
function nameEffectClass(itemId) {
  const it = itemId ? cosItem(itemId) : null;
  if (!it || it.type !== 'name_effect') return null;
  return 'fx-' + (it.value || 'holo');
}
function cosNameSpan(itemId, safeText, cls, effectId) {
  const fx = effectId ? nameEffectClass(effectId) : null;
  if (fx) return `<span class="${cls} name-fx ${fx}">${safeText}</span>`;
  const mat = shinyMat(itemId);
  if (mat) return `<span class="${cls} shiny-text shiny-${mat}">${safeText}</span>`;
  const col = itemId ? cosValue(itemId) : null;
  return `<span class="${cls}"${col ? ` style="color:${col}"` : ''}>${safeText}</span>`;
}
function frameAttrs(itemId, px) {
  const mat = shinyMat(itemId);
  if (mat) return { cls: ` shiny-frame shiny-${mat}`, style: '' };
  const col = itemId ? cosValue(itemId) : null;
  return { cls: '', style: col ? ` style="box-shadow:0 0 0 ${px}px ${col}"` : '' };
}

/* Titteleiden ikonit ja harvinaisuustaso (johdetaan hinnasta) */
const TITLE_ICON = {
  title_tyomyyra: '🐜', title_pommittaja: '💣', title_maestro: '🎼', title_kapteeni: '🧢', title_legenda: '🏆',
  title_sisukas: '💪', title_joukkuepelaaja: '🤝', title_pallovelho: '🪄', title_salama: '⚡', title_muuri: '🧱',
  title_maalikone: '🎯', title_taituri: '✨', title_tahti: '⭐', title_vauhtihirmu: '💨', title_pelintekija: '🧠',
  title_putkimestari: '🔥', title_ilmaherra: '🦅', title_kotikuningas: '🏠', title_kultajalka: '🦶',
  title_huipputekija: '🚀', title_mestari: '👑'
};
function titleTier(price) {
  if (price >= 5500) return 'gold';
  if (price >= 4000) return 'silver';
  if (price >= 3000) return 'bronze';
  if (price >= 1400) return 'epic';
  if (price >= 700)  return 'rare';
  return 'common';
}
function cosTitleHtml(itemId) {
  const it = cosItem(itemId);
  if (!it) return '';
  const icon = TITLE_ICON[itemId];
  return `<span class="cos-title tier-${titleTier(it.price)}">`
    + (icon ? `<span class="cos-title-ic">${icon}</span>` : '')
    + escapeHtml(it.value) + `</span>`;
}
/* Nimikyltti: pelaajan oma nimi + pelinumero, koko 'md' (profiili) tai 'sm' (tulostaulu) */
function nameplateHtml(itemId, username, jersey, size) {
  const it = cosItem(itemId);
  if (!it) return '';
  const parts = (it.value || 'portugal').split(':');
  const theme = parts[0];
  const shine = parts[1] === 'shine';
  const name = escapeHtml(String(username || '').toUpperCase());
  const hasNum = jersey !== null && jersey !== undefined && jersey !== '';
  const num = hasNum ? escapeHtml(String(jersey)) : '';
  return `<span class="plate np-${theme} ${size}${shine ? ' shine' : ''}">`
    + `<span class="plate-inner">`
    + `<span class="plate-name"><b>${name}</b></span>`
    + (hasNum ? `<span class="plate-num"><b>${num}</b></span>` : '')
    + `</span></span>`;
}
/* Avatar: pieni emoji-ikoni nimen vasemmalle puolelle. size 'sm' = tulostaulu. */
function avatarHtml(itemId, size) {
  const it = cosItem(itemId);
  if (!it) return '';
  return `<span class="cos-avatar${size === 'sm' ? ' sm' : ''}">${it.value}</span>`;
}

/* Profiiliotsikko etusivulla: nimi + taso + ohut XP-palkki */
function renderProfileHeader() {
  const nameEl = document.getElementById('phName');
  if (!nameEl) return;
  const titleHtml = currentUser ? cosTitleHtml(currentUser.cos_title) : '';
  const ncId = currentUser ? currentUser.cos_name_color : null;
  const uname = currentUser ? escapeHtml(currentUser.username) : '';
  const npId = currentUser ? currentUser.cos_nameplate : null;
  const avId = currentUser ? currentUser.cos_avatar : null;
  const fxId = currentUser ? currentUser.cos_name_effect : null;
  const av = avId ? avatarHtml(avId, '') : '';
  if (npId && cosItem(npId)) {
    nameEl.innerHTML = av + nameplateHtml(npId, currentUser.plate_name || currentUser.username, currentUser.jersey_number, 'md')
      + (titleHtml ? ' ' + titleHtml : '');
  } else {
    nameEl.innerHTML = av + cosNameSpan(ncId, uname, 'cos-name', fxId)
      + (titleHtml ? ' ' + titleHtml : '');
  }
  nameEl.style.color = '';
  const ph = document.getElementById('profileHeader');
  if (ph) {
    [...ph.classList].forEach(c => { if (c.indexOf('pbg-') === 0) ph.classList.remove(c); });
    const bgId = currentUser ? currentUser.cos_profile_bg : null;
    const bg = bgId ? cosItem(bgId) : null;
    if (bg && bg.type === 'profile_bg') ph.classList.add('pbg-' + bg.value);
  }
  const badgeEl = document.getElementById('phBadge');
  if (badgeEl) {
    badgeEl.classList.remove('shiny-frame', 'shiny-gold', 'shiny-silver', 'shiny-bronze', 'shiny-platinum', 'shiny-ruby', 'shiny-sapphire');
    const fmat = currentUser ? shinyMat(currentUser.cos_frame) : null;
    if (fmat) { badgeEl.classList.add('shiny-frame', 'shiny-' + fmat); badgeEl.style.boxShadow = ''; }
    else {
      const frameCol = currentUser && currentUser.cos_frame ? cosValue(currentUser.cos_frame) : null;
      badgeEl.style.boxShadow = frameCol ? `0 0 0 3px ${frameCol}` : '';
    }
  }
  const seasonStart = teamWeek && teamWeek.seasonStart ? teamWeek.seasonStart : null;
  const logs = seasonStart ? lastAll.filter(e => e.date >= seasonStart) : lastAll;
  const xp = logs.reduce((s, e) => s + sessionXp(e.duration) * boostMult(e.date), 0) + teamGoalXpTotal(seasonStart);
  const info = levelInfo(xp);
  document.getElementById('phBadge').innerHTML = levelBadgeImg(info.cur.lvl);
  document.getElementById('phLevel').textContent = info.next
    ? `Taso ${info.cur.lvl} · ${info.cur.name} · ${xp} / ${info.next.xp} XP`
    : `Taso ${info.cur.lvl} · ${info.cur.name} · ${xp} XP`;
  const fill = document.getElementById('phBarFill');
  const pct = info.next ? info.pct : 100;
  requestAnimationFrame(() => { fill.style.width = pct + '%'; });
}

/* Jalkapallot: laskuri profiiliotsikossa + kortti profiilinäkymässä */
function renderFootballs() {
  const pill = document.getElementById('phBalls');
  if (pill) pill.innerHTML = `<span class="ph-balls-ic">⚽</span><span class="ph-balls-num">${fmtBalls(footballBalance())}</span>`;

  const card = document.getElementById('footballCard');
  if (!card) return;
  card.hidden = false;
  const T = footballCfg.threshold;
  const bal = footballBalance();
  const spentLine = cosSpent > 0 ? `<div class="ball-chip"><span>Käytetty kauppaan</span><b>${fmtBalls(cosSpent)}</b></div>` : '';
  card.innerHTML = `
    <div class="sec-head"><h2>Jalkapallot</h2><span class="hint">pysyvät — eivät nollaudu</span></div>
    <div class="ball-hero">
      <span class="ball-emoji">⚽</span>
      <div class="ball-hero-text">
        <span class="ball-total">${fmtBalls(bal)}</span>
        <span class="ball-cap-text">käytettävissä · ansaittu ${fmtBalls(myFootballs.total)}</span>
      </div>
    </div>
    <div class="ball-breakdown">
      <div class="ball-chip"><span>Harjoituksista</span><b>${fmtBalls(myFootballs.session)}</b></div>
      <div class="ball-chip"><span>Haasteista</span><b>${fmtBalls(myFootballs.challenge)}</b></div>
      ${myFootballs.quest > 0 ? `<div class="ball-chip"><span>Viikkotehtävistä</span><b>${fmtBalls(myFootballs.quest)}</b></div>` : ''}
      ${spentLine}
    </div>
    <button class="btn ball-shop-btn" id="ballShopBtn" type="button">Avaa kauppa — käytä jalkapallosi →</button>
    <div class="ball-how">
      <div class="ball-how-title">Näin keräät lisää</div>
      <div class="ball-how-row"><span>Harjoitus väh. ${Math.floor(T / 2)} min</span><b>+25 ⚽</b></div>
      <div class="ball-how-row"><span>Harjoitus väh. ${T} min</span><b>+50 ⚽</b></div>
      <div class="ball-how-row"><span>Harjoitus väh. ${2 * T} min</span><b>+120 ⚽</b></div>
      <div class="ball-how-row"><span>Harjoitus väh. ${3 * T} min</span><b>+200 ⚽</b></div>
      <div class="ball-how-row"><span>Valmentajan haaste suoritettu</span><b>+250 ⚽</b></div>
      <div class="ball-how-note">Enintään ${fmtBalls(footballCfg.cap)} ⚽ / päivä harjoituksista — lepokin kuuluu kehitykseen.</div>
    </div>`;
  const shopBtn = document.getElementById('ballShopBtn');
  if (shopBtn) shopBtn.onclick = () => switchView('shop');
}

/* ---- Jalkapallot (pysyvä valuutta) ---- */
const fmtBalls = n => (n || 0).toLocaleString('fi-FI');
async function loadFootballEvents() {
  const { data, error } = await sb.from('football_events').select('amount, source');
  if (error) { console.error(error); return { total: 0, session: 0, challenge: 0, quest: 0 }; }
  let session = 0, challenge = 0, quest = 0;
  data.forEach(r => {
    if (r.source === 'challenge') challenge += r.amount;
    else if (r.source === 'quest') quest += r.amount;
    else session += r.amount;
  });
  return { total: session + challenge + quest, session, challenge, quest };
}
async function loadFootballCfg() {
  if (!currentUser || !currentUser.team_id) return { threshold: 30, cap: 400 };
  const { data, error } = await sb.from('teams')
    .select('football_threshold_min, football_daily_cap').eq('id', currentUser.team_id).single();
  if (error || !data) return { threshold: 30, cap: 400 };
  return {
    threshold: data.football_threshold_min == null ? 30 : data.football_threshold_min,
    cap: data.football_daily_cap == null ? 400 : data.football_daily_cap,
  };
}
async function refreshFootballs() { myFootballs = await loadFootballEvents(); renderFootballs(); refreshLeaderboard(); }

/* ---- Joukkueen tulostaulu (vapaaehtoinen) ---- */
let leaderboard = [];
let shopCatalog = [];                // kaupan tuotteet
let shopTab = null;                  // valittu kaupan välilehti (tyyppi)
let ownedCosmetics = new Set();      // omistetut tuote-id:t
let cosSpent = 0;                    // jalkapalloja käytetty kauppaan
async function loadLeaderboard() {
  const { data, error } = await sb.rpc('team_football_board');
  if (error) { console.error(error); return []; }
  return (data || []).map(r => ({
    user_id: r.user_id,
    username: r.username,
    footballs: Number(r.footballs) || 0,
    xp: Number(r.xp) || 0,
    cos_name_color: r.cos_name_color || null,
    cos_title: r.cos_title || null,
    cos_frame: r.cos_frame || null,
    cos_nameplate: r.cos_nameplate || null,
    jersey_number: (r.jersey_number === null || r.jersey_number === undefined) ? null : Number(r.jersey_number),
    cos_avatar: r.cos_avatar || null,
    cos_name_effect: r.cos_name_effect || null,
    plate_name: r.plate_name || null,
  }));
}
async function refreshLeaderboard() {
  leaderboard = (currentUser && currentUser.leaderboard_opt_in) ? await loadLeaderboard() : [];
  renderLeaderboard();
}
async function setLeaderboardOptIn(value) {
  const { data, error } = await sb.rpc('set_leaderboard_opt_in', { p_value: value });
  if (error) { console.error(error); alert('Ei onnistunut: ' + error.message); return false; }
  if (currentUser) currentUser.leaderboard_opt_in = (data === undefined ? value : !!data);
  return true;
}

function renderLeaderboard() {
  const card = document.getElementById('leaderboardCard');
  if (!card) return;
  if (!currentUser || !currentUser.team_id) { card.hidden = true; return; }
  card.hidden = false;

  if (!currentUser.leaderboard_opt_in) {
    card.innerHTML = `
      <div class="sec-head"><h2>Tulostaulu</h2><span class="hint">vapaaehtoinen</span></div>
      <div class="lb-intro">Liity joukkueen tulostauluun, niin näet miten jalkapallosi vertautuvat joukkuekavereihin.</div>
      <div class="lb-intro-sub">Tulostaulussa näkyvät vain liittyneet pelaajat. Kun liityt, sinun nimesi, tasosi ja jalkapallosi tulevat näkyviin muille liittyneille — ja sinä näet heidät.</div>
      <button class="btn lb-join-btn" type="button">Liity tulostauluun</button>`;
    card.querySelector('.lb-join-btn').onclick = async () => {
      const btn = card.querySelector('.lb-join-btn'); btn.disabled = true;
      if (await setLeaderboardOptIn(true)) await refreshLeaderboard();
      else btn.disabled = false;
    };
    return;
  }

  const rows = [...leaderboard].sort((a, b) => b.footballs - a.footballs || a.username.localeCompare(b.username, 'fi'));
  const list = rows.map((r, i) => {
    const lvl = levelInfo(r.xp).cur;
    const me = r.user_id === currentUser.id;
    const titleHtml = cosTitleHtml(r.cos_title);
    const fr = frameAttrs(r.cos_frame, 2);
    const nameInner = r.cos_nameplate && cosItem(r.cos_nameplate)
      ? nameplateHtml(r.cos_nameplate, r.plate_name || r.username, r.jersey_number, 'sm')
      : cosNameSpan(r.cos_name_color, escapeHtml(r.username), 'lb-name-text', r.cos_name_effect);
    const av = r.cos_avatar ? avatarHtml(r.cos_avatar, 'sm') : '';
    return `
      <div class="lb-row${me ? ' lb-me' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-badge${fr.cls}"${fr.style}>${levelBadgeImg(lvl.lvl)}</span>
        <span class="lb-info">
          <span class="lb-name">${av}${nameInner}${titleHtml ? ' ' + titleHtml : ''}${me ? ' <span class="lb-you">sinä</span>' : ''}</span>
          <span class="lb-lvl">Taso ${lvl.lvl} · ${lvl.name}</span>
        </span>
        <span class="lb-balls">⚽ ${fmtBalls(r.footballs)}</span>
      </div>`;
  }).join('');
  const note = rows.length <= 1
    ? '<div class="lb-note">Olet toistaiseksi ainoa mukana — kun joukkuekaverit liittyvät, he ilmestyvät tähän.</div>'
    : '';

  card.innerHTML = `
    <div class="sec-head"><h2>Tulostaulu</h2><span class="hint">${rows.length} mukana</span></div>
    <div class="lb-list">${list}</div>
    ${note}
    <button class="lb-leave-btn" type="button">Poistu tulostaulusta</button>`;
  card.querySelector('.lb-leave-btn').onclick = async () => {
    const btn = card.querySelector('.lb-leave-btn'); btn.disabled = true;
    if (await setLeaderboardOptIn(false)) { leaderboard = []; renderLeaderboard(); }
    else btn.disabled = false;
  };
}

/* ---- Kauppa (jalkapallojen käyttö koristeisiin) ---- */
async function loadShopCatalog() {
  const { data, error } = await sb.from('shop_items').select('id, type, label, value, price, sort, available_from, available_to').order('sort', { ascending: true });
  if (error) { console.error(error); return []; }
  return data;
}
async function loadOwnedCosmetics() {
  const { data, error } = await sb.from('player_cosmetics').select('item_id, price_paid');
  if (error) { console.error(error); return { owned: new Set(), spent: 0 }; }
  let spent = 0; const owned = new Set();
  data.forEach(r => { owned.add(r.item_id); spent += r.price_paid; });
  return { owned, spent };
}
function cosItem(id) { return id ? shopCatalog.find(i => i.id === id) || null : null; }
function cosValue(id) { const it = cosItem(id); return it ? it.value : null; }
function cosLimited(it) { return !!(it && (it.available_from || it.available_to)); }
function cosAvailable(it) {
  if (!it) return false;
  const t = todayISO();
  if (it.available_from && t < it.available_from) return false;
  if (it.available_to && t > it.available_to) return false;
  return true;
}
function footballBalance() { return Math.max(0, (myFootballs.total || 0) - cosSpent); }
async function refreshShopState() {
  if (!shopCatalog.length) shopCatalog = await loadShopCatalog();
  const oc = await loadOwnedCosmetics();
  ownedCosmetics = oc.owned; cosSpent = oc.spent;
}
async function buyCosmetic(itemId) {
  const { data, error } = await sb.rpc('buy_cosmetic', { p_item_id: itemId });
  if (error || (data && data.ok === false)) {
    alert((data && data.error) || (error && error.message) || 'Osto ei onnistunut'); return false;
  }
  await refreshShopState();
  return true;
}
async function equipCosmetic(itemId) {
  const { data, error } = await sb.rpc('equip_cosmetic', { p_item_id: itemId });
  if (error || (data && data.ok === false)) { alert((data && data.error) || 'Ei onnistunut'); return false; }
  const it = cosItem(itemId);
  if (it && currentUser) currentUser['cos_' + it.type] = itemId;
  return true;
}
async function unequipCosmetic(type) {
  const { data, error } = await sb.rpc('unequip_cosmetic', { p_type: type });
  if (error || (data && data.ok === false)) { alert((data && data.error) || 'Ei onnistunut'); return false; }
  if (currentUser) currentUser['cos_' + type] = null;
  return true;
}
async function setJersey(num) {
  const { data, error } = await sb.rpc('set_jersey_number', { p_num: num });
  if (error || (data && data.ok === false)) { return { error: (data && data.error) || 'Ei onnistunut' }; }
  if (currentUser) currentUser.jersey_number = num;
  return {};
}
async function setPlateName(name) {
  const { data, error } = await sb.rpc('set_plate_name', { p_name: name });
  if (error || (data && data.ok === false)) { return { error: (data && data.error) || 'Ei onnistunut' }; }
  if (currentUser) currentUser.plate_name = (data && data.plate_name) || null;
  return {};
}

const SHOP_SECTIONS = [
  { key: 'nameplate',  label: 'Nimikyltit' },
  { key: 'avatar',     label: 'Avatarit' },
  { key: 'name_color', label: 'Nimen värit' },
  { key: 'name_effect', label: 'Nimiefektit' },
  { key: 'title',      label: 'Tittelit' },
  { key: 'frame',      label: 'Tasomerkin kehykset' },
  { key: 'profile_bg', label: 'Profiilitaustat' },
];
function shopItemHtml(i, bal) {
  const owned = ownedCosmetics.has(i.id);
  const equipped = currentUser && currentUser['cos_' + i.type] === i.id;
  let preview;
  const mat = shinyMat(i.id);
  if (i.type === 'name_color') preview = mat
    ? `<span class="shop-prev-name shiny-text shiny-${mat}">Nimesi</span>`
    : `<span class="shop-prev-name" style="color:${i.value}">Nimesi</span>`;
  else if (i.type === 'title')  preview = cosTitleHtml(i.id);
  else if (i.type === 'nameplate') preview = nameplateHtml(i.id, currentUser ? (currentUser.plate_name || currentUser.username) : 'NIMI', currentUser ? currentUser.jersey_number : null, 'sm');
  else if (i.type === 'avatar') preview = avatarHtml(i.id, '');
  else if (i.type === 'name_effect') preview = `<span class="shop-prev-name name-fx fx-${i.value}">${escapeHtml(currentUser ? currentUser.username : 'Nimesi')}</span>`;
  else if (i.type === 'profile_bg') preview = `<span class="shop-prev-bg pbg-${i.value}"></span>`;
  else preview = mat
    ? `<span class="shop-prev-frame shiny-frame shiny-${mat}"></span>`
    : `<span class="shop-prev-frame" style="box-shadow:0 0 0 3px ${i.value}"></span>`;
  let action;
  if (equipped) action = `<button class="shop-btn equipped" data-act="unequip" data-type="${i.type}" type="button">Käytössä ✓</button>`;
  else if (owned) action = `<button class="shop-btn own" data-act="equip" data-id="${i.id}" type="button">Ota käyttöön</button>`;
  else if (bal >= i.price) action = `<button class="btn shop-btn buy" data-act="buy" data-id="${i.id}" type="button">Osta · ⚽ ${fmtBalls(i.price)}</button>`;
  else action = `<button class="shop-btn locked" type="button" disabled>⚽ ${fmtBalls(i.price)}</button>`;
  return `<div class="shop-item${equipped ? ' is-equipped' : ''}${cosLimited(i) ? ' is-season' : ''}">
    ${cosLimited(i) ? '<span class="shop-season-badge">⏳ kausi</span>' : ''}
    <div class="shop-prev">${preview}</div>
    <div class="shop-label">${escapeHtml(i.label)}</div>
    ${action}
  </div>`;
}
function renderShop() {
  const view = document.getElementById('viewShop');
  if (!view) return;
  const bal = footballBalance();
  const balanceCard = `
    <div class="card shop-balance-card">
      <span class="shop-bal-label">Käytettävissä</span>
      <span class="shop-bal"><span class="shop-bal-ic">⚽</span> ${fmtBalls(bal)}</span>
    </div>`;
  const available = SHOP_SECTIONS.filter(s => shopCatalog.some(i => i.type === s.key));
  if (!available.length) {
    view.innerHTML = `
      <button class="back-btn" id="shopBack" type="button">‹ Takaisin profiiliin</button>
      ${balanceCard}
      <div class="card"><div class="coach-empty">Kauppa ei ole vielä käytettävissä.</div></div>`;
    wireShop();
    return;
  }
  if (!shopTab || !available.some(s => s.key === shopTab)) shopTab = available[0].key;
  const tabs = available.map(s =>
    `<button class="vtab shop-tab${s.key === shopTab ? ' active' : ''}" data-tab="${s.key}" type="button">${s.label}</button>`).join('');
  const s = available.find(x => x.key === shopTab);
  const items = shopCatalog.filter(i => i.type === s.key && (cosAvailable(i) || ownedCosmetics.has(i.id)));
  let extra = '';
  if (s.key === 'nameplate') {
    const jn = (currentUser && currentUser.jersey_number != null) ? currentUser.jersey_number : '';
    const pn = (currentUser && currentUser.plate_name) ? escapeHtml(currentUser.plate_name) : '';
    extra = `<div class="np-jersey">
        <label for="plateNameInput">Kyltin nimi (valinnainen, max 20)</label>
        <div class="np-name-row">
          <input type="text" id="plateNameInput" maxlength="20" value="${pn}" placeholder="oletus: käyttäjänimesi">
          <button class="btn" id="plateNameSave" type="button">Tallenna</button>
        </div>
        <label for="jerseyInput" class="np-jersey-label2">Pelinumerosi (0–99)</label>
        <div class="np-jersey-row">
          <input type="number" id="jerseyInput" min="0" max="99" value="${jn}" placeholder="esim. 7" inputmode="numeric">
          <button class="btn" id="jerseySave" type="button">Tallenna</button>
        </div>
      </div>`;
  }
  const section = `<div class="card shop-section">
      <div class="sec-head"><h2>${s.label}</h2></div>
      ${extra}
      <div class="shop-grid">${items.map(i => shopItemHtml(i, bal)).join('')}</div>
    </div>`;
  view.innerHTML = `
    <button class="back-btn" id="shopBack" type="button">‹ Takaisin profiiliin</button>
    ${balanceCard}
    <div class="shop-tabs">${tabs}</div>
    ${section}`;
  wireShop();
}
function wireShop() {
  const back = document.getElementById('shopBack');
  if (back) back.onclick = () => switchView('profile');
  document.querySelectorAll('#viewShop .shop-tab').forEach(btn => {
    btn.onclick = () => { shopTab = btn.dataset.tab; renderShop(); };
  });
  const jsBtn = document.getElementById('jerseySave');
  if (jsBtn) jsBtn.onclick = async () => {
    const inp = document.getElementById('jerseyInput');
    const v = inp.value.trim();
    let num = v === '' ? null : parseInt(v, 10);
    if (num !== null && (isNaN(num) || num < 0 || num > 99)) { alert('Anna numero 0–99.'); return; }
    jsBtn.disabled = true;
    const { error } = await setJersey(num);
    jsBtn.disabled = false;
    if (error) { alert(error); return; }
    showToast('Pelinumero tallennettu');
    renderShop(); renderProfileHeader(); refreshLeaderboard();
  };
  const pnBtn = document.getElementById('plateNameSave');
  if (pnBtn) pnBtn.onclick = async () => {
    const inp = document.getElementById('plateNameInput');
    const v = inp.value.trim();
    if (v.length > 20) { alert('Nimi voi olla enintään 20 merkkiä.'); return; }
    pnBtn.disabled = true;
    const { error } = await setPlateName(v);
    pnBtn.disabled = false;
    if (error) { alert(error); return; }
    showToast(v ? 'Kyltin nimi tallennettu' : 'Kyltin nimi tyhjennetty');
    renderShop(); renderProfileHeader(); refreshLeaderboard();
  };
  document.querySelectorAll('#viewShop .shop-btn').forEach(btn => {
    const act = btn.dataset.act;
    if (!act) return;
    btn.onclick = async () => {
      btn.disabled = true;
      let ok = true;
      if (act === 'buy') { ok = await buyCosmetic(btn.dataset.id); if (ok) await equipCosmetic(btn.dataset.id); }
      else if (act === 'equip') ok = await equipCosmetic(btn.dataset.id);
      else if (act === 'unequip') ok = await unequipCosmetic(btn.dataset.type);
      if (act === 'buy' && ok) showToast('Ostettu ja otettu käyttöön');
      renderShop(); renderFootballs(); renderProfileHeader(); refreshLeaderboard();
    };
  });
}

/* =========================================================================
   SITOUTUMINEN — putki, juhlinta, ilmoitukset
   ========================================================================= */

/* ---- Konfetti (omavarainen, kunnioittaa reduced motion) ---- */
function celebrate(opts = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const count = opts.big ? 150 : 90;
  const colors = ['#0E5E3A', '#C5F23E', '#2563B0', '#DD5A1E', '#6A4BD6', '#C9A227'];
  let canvas = document.getElementById('confettiCanvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confettiCanvas';
    canvas.className = 'confetti-canvas';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.width = window.innerWidth * dpr;
  const H = canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: W / 2 + (Math.random() - 0.5) * 140 * dpr,
      y: H * 0.30 + (Math.random() - 0.5) * 40 * dpr,
      vx: (Math.random() - 0.5) * 13 * dpr,
      vy: (Math.random() * -9 - 4) * dpr,
      g: 0.34 * dpr,
      size: (6 + Math.random() * 6) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.32,
      color: colors[(Math.random() * colors.length) | 0],
    });
  }
  const start = performance.now();
  function frame(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of parts) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const alpha = Math.max(0, 1 - t / 1600);
      if (alpha > 0 && p.y < H + 40) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        ctx.restore();
      }
    }
    if (alive && t < 1900) requestAnimationFrame(frame);
    else { ctx.clearRect(0, 0, W, H); canvas.remove(); }
  }
  requestAnimationFrame(frame);
}

/* ---- Putki: peräkkäiset viikot, joilla on vähintään yksi treeni.
       Käyttää samaa weeklyStreak()-laskuria kuin ennätyskortti. ---- */
function computeStreak() {
  const trainedThisWeek = lastAll.some(e => mondayOfISO(e.date) === weekRangeISO().mondayISO);
  const { streak, shieldUsed } = streakInfo();
  return { streak, trainedThisWeek, shieldUsed };
}
function renderStatusStrip() {
  const el = document.getElementById('statusStrip');
  if (!el) return;
  const detail = document.getElementById('statusDetail');
  if (detail) { detail.hidden = true; detail.textContent = ''; }
  const chips = [];
  const { streak, trainedThisWeek, shieldUsed } = computeStreak();
  if (streak >= 2) {
    const cls = trainedThisWeek ? 's-fire' : 's-fire s-risk';
    const txt = trainedThisWeek ? `${streak} vk putkeen` : `${streak} vk — treenaa!`;
    const sh = shieldUsed ? ' 🛡️' : '';
    const info = `Treeniputki: ${streak} viikkoa peräkkäin, joina olet treenannut vähintään kerran.`
      + (shieldUsed ? ' 🛡️ Yksi väliin jäänyt viikko on suojattu — putki säilyi.' : ' Yksi väliin jäänyt viikko ei katkaise putkea.')
      + (trainedThisWeek ? '' : ' Muista treenata vielä tällä viikolla, ettei putki katkea!');
    chips.push(`<button type="button" class="s-chip ${cls}" data-info="${escapeHtml(info)}">🔥 ${txt}${sh}</button>`);
  }
  const ab = activeBoost(boostPeriods);
  if (ab) {
    const info = `Tehostejakso käynnissä: saat treeneistä ja haasteista ${ab.multiplier}× XP ja jalkapallot ${fmtDateShort(ab.ends_on)} asti.`;
    chips.push(`<button type="button" class="s-chip s-boost" data-info="${escapeHtml(info)}">⚡ ${ab.multiplier}× käynnissä</button>`);
  } else {
    const up = upcomingBoost(boostPeriods, 3);
    if (up) {
      const days = Math.round((new Date(up.starts_on + 'T00:00:00') - new Date(todayISO() + 'T00:00:00')) / 86400000);
      const when = days <= 1 ? 'huom.' : `${days} pv`;
      const whenLong = days <= 1 ? 'huomenna' : `${days} päivän päästä`;
      const info = `Tehostejakso alkaa ${whenLong} (${fmtDateShort(up.starts_on)}): silloin saat ${up.multiplier}× XP ja jalkapallot. Säästä haasteet siihen!`;
      chips.push(`<button type="button" class="s-chip s-boost s-soon" data-info="${escapeHtml(info)}">⚡ ${up.multiplier}× tulossa ${when}</button>`);
    }
  }
  if (activeEvent) {
    const info = `Kausitapahtuma${activeEvent.blurb ? ': ' + activeEvent.blurb : '.'} Kaupassa on rajoitetun ajan kausikosmetiikkaa. Päättyy ${fmtDateShort(activeEvent.ends_on)}.`;
    chips.push(`<button type="button" class="s-chip s-evt" data-info="${escapeHtml(info)}">${escapeHtml(activeEvent.emoji || '🎉')} ${escapeHtml(activeEvent.label)}</button>`);
  }
  if (!chips.length) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false;
  el.innerHTML = chips.join('');
  el.querySelectorAll('.s-chip').forEach(btn => {
    btn.onclick = () => {
      if (!detail) return;
      const wasOpen = btn.classList.contains('open');
      el.querySelectorAll('.s-chip').forEach(b => b.classList.remove('open'));
      if (wasOpen) { detail.hidden = true; detail.textContent = ''; return; }
      btn.classList.add('open');
      detail.textContent = btn.getAttribute('data-info') || '';
      detail.hidden = false;
    };
  });
}
function updateZoneHeaders() {
  const z = document.getElementById('zoneTeam');
  if (!z) return;
  const any = ['coachMsgCard', 'challengeCard', 'teamGoalCard'].some(id => {
    const c = document.getElementById(id);
    return c && !c.hidden;
  });
  z.hidden = !any;
}
async function loadQuests() {
  const { data, error } = await sb.rpc('weekly_quests');
  if (error) { console.error(error); return []; }
  return data || [];
}
async function loadChallengeDoneCount() {
  const { data, error } = await sb.from('challenge_completions').select('challenge_id');
  if (error) { console.error(error); return 0; }
  return (data || []).length;
}
async function loadQuestClaimCount() {
  const { data, error } = await sb.from('quest_claims').select('quest_id');
  if (error) { console.error(error); return 0; }
  return (data || []).length;
}
function questProgress(q) {
  const { mondayISO, sundayISO } = weekRangeISO();
  const wk = lastAll.filter(e => e.date >= mondayISO && e.date <= sundayISO);
  if (q.kind === 'sessions') return wk.length;
  if (q.kind === 'total_min') return wk.reduce((s, e) => s + e.duration, 0);
  if (q.kind === 'category_min') return wk.filter(e => e.category === q.category).reduce((s, e) => s + e.duration, 0);
  if (q.kind === 'single_min') return wk.reduce((m, e) => Math.max(m, e.duration), 0);
  return 0;
}
function renderQuests() {
  const card = document.getElementById('questCard');
  if (!card) return;
  if (!questDefs.length) { card.hidden = true; return; }
  card.hidden = false;
  const rows = questDefs.map(q => {
    const prog = questProgress(q);
    const done = prog >= q.target;
    const pct = Math.max(0, Math.min(1, prog / q.target));
    const unit = q.kind === 'sessions' ? '' : ' min';
    const progText = `${Math.min(prog, q.target)}${unit} / ${q.target}${unit}`;
    let action;
    if (q.claimed) {
      action = `<span class="quest-done">✓ Lunastettu</span>`;
    } else if (done) {
      action = `<button class="btn quest-claim" data-quest="${q.id}" type="button">Lunasta +${fmtBalls(q.reward)} ⚽</button>`;
    } else {
      action = `<span class="quest-reward">+${fmtBalls(q.reward)} ⚽</span>`;
    }
    return `
      <div class="quest-row${done ? ' is-done' : ''}">
        <div class="quest-top"><span class="quest-label">${escapeHtml(q.label)}</span>${action}</div>
        <div class="quest-bar"><div class="quest-bar-fill" style="width:${pct * 100}%"></div></div>
        <div class="quest-prog">${progText}</div>
      </div>`;
  }).join('');
  card.innerHTML = `
    <div class="sec-head"><h2>Viikkotehtävät</h2><span class="hint">vaihtuvat viikoittain</span></div>
    <div class="quest-list">${rows}</div>`;
  card.querySelectorAll('.quest-claim').forEach(b => {
    b.onclick = () => claimQuest(b.dataset.quest, b);
  });
}
async function claimQuest(id, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Lunastetaan…'; }
  const { data, error } = await sb.rpc('claim_quest', { p_quest_id: id });
  if (error || !data || data.ok === false) {
    alert((data && data.error) || (error && error.message) || 'Lunastus ei onnistunut');
    if (btn) { btn.disabled = false; }
    questDefs = await loadQuests();
    renderQuests();
    return;
  }
  if (typeof celebrate === 'function') celebrate();
  questDefs = await loadQuests();
  myFootballs = await loadFootballEvents();
  renderQuests();
  renderFootballs();
  refreshLeaderboard();
}
async function loadActiveEvent() {
  const t = todayISO();
  const { data, error } = await sb.from('season_events')
    .select('id, label, emoji, blurb, starts_on, ends_on')
    .lte('starts_on', t).gte('ends_on', t)
    .order('ends_on', { ascending: true }).limit(1);
  if (error) { console.error(error); return null; }
  return (data && data[0]) || null;
}
function weeklyDrill() {
  if (!EXERCISES.length) return null;
  const mon = weekRangeISO().mondayISO;
  const idx = Math.floor(new Date(mon + 'T00:00:00').getTime() / 604800000);
  const n = EXERCISES.length;
  return EXERCISES[((idx % n) + n) % n];
}
function drillDoneThisWeek(dr) {
  if (!dr) return false;
  const { mondayISO, sundayISO } = weekRangeISO();
  return lastAll.some(e => e.date >= mondayISO && e.date <= sundayISO && e.category === dr.category);
}
function drillXp(min) { return Math.round(sessionXp(min) * boostMult(todayISO())); }
function drillFootballs(min) {
  const T = (footballCfg && footballCfg.threshold) || 30;
  let base = 0;
  if (min >= 3 * T) base = 200;
  else if (min >= 2 * T) base = 120;
  else if (min >= T) base = 50;
  else if (min >= Math.floor(T / 2)) base = 25;
  return base * boostMult(todayISO());
}
function renderDrill() {
  const card = document.getElementById('drillCard');
  if (!card) return;
  const dr = weeklyDrill();
  if (!dr) { card.hidden = true; return; }
  card.hidden = false;
  const dur = dr.duration || 30;
  const cat = CATEGORIES.find(c => c.id === dr.category);
  const done = drillDoneThisWeek(dr);
  const xp = drillXp(dur);
  const balls = drillFootballs(dur);
  const boosted = boostMult(todayISO()) > 1;
  const catChip = cat ? `<span class="drill-cat"><span class="dot" style="background:${cat.color}"></span>${escapeHtml(cat.label)}</span>` : '';
  const rewardLine = done
    ? `<div class="drill-reward drill-reward-done">✓ Tehty tällä viikolla — hienoa työtä!</div>`
    : `<div class="drill-reward">Kun kirjaat tämän (~${dur} min): <b>+${xp} XP</b> ja <b>⚽ ${fmtBalls(balls)}</b>${boosted ? ' ' + boostBadgeHtml() : ''}</div>`;
  card.innerHTML = `
    <div class="sec-head"><h2>Viikon harjoite</h2>${done ? '<span class="drill-done">✓ Tehty</span>' : '<span class="hint">vaihtuu viikoittain</span>'}</div>
    <div class="drill-name">${escapeHtml(dr.name)}</div>
    <div class="drill-meta">${catChip}<span class="drill-dur">~${dur} min</span></div>
    <div class="drill-desc">${escapeHtml(dr.desc)}</div>
    ${rewardLine}`;
}
/* ---- Ilmoitukset ---- */
let notifPref = false;
try { notifPref = (localStorage.getItem('notifPref') === 'on'); } catch (e) {}
function notifAvailable() { return typeof window !== 'undefined' && 'Notification' in window; }
async function enableNotifications() {
  if (!notifAvailable()) { alert('Selaimesi ei tue ilmoituksia.'); return false; }
  let perm = Notification.permission;
  if (perm === 'default') perm = await Notification.requestPermission();
  if (perm === 'granted') { notifPref = true; try { localStorage.setItem('notifPref', 'on'); } catch (e) {} return true; }
  notifPref = false; try { localStorage.setItem('notifPref', 'off'); } catch (e) {}
  if (perm === 'denied') alert('Ilmoitukset on estetty selaimen asetuksissa. Salli ne sieltä, jos haluat ottaa ne käyttöön.');
  return false;
}
function disableNotifications() { notifPref = false; try { localStorage.setItem('notifPref', 'off'); } catch (e) {} }
function notify(title, body) {
  if (!notifPref || !notifAvailable() || Notification.permission !== 'granted') return;
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/favicon-32.png' };
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification(title, opts)).catch(() => { try { new Notification(title, opts); } catch (e) {} });
    } else { new Notification(title, opts); }
  } catch (e) {}
}
function renderSettings() {
  const card = document.getElementById('settingsCard');
  if (!card) return;
  const supported = notifAvailable();
  const on = supported && Notification.permission === 'granted' && notifPref;
  card.innerHTML = `
    <div class="sec-head"><h2>Ilmoitukset</h2></div>
    <div class="set-row">
      <div class="set-text">
        <b>Tason ja haasteiden ilmoitukset</b>
        <span>Ilmoitus kun nouset tasolle tai suoritat haasteen.</span>
      </div>
      <button class="set-toggle${on ? ' on' : ''}" id="notifToggle" type="button" role="switch" aria-checked="${on}">
        <span class="set-knob"></span>
      </button>
    </div>
    ${!supported ? '<div class="set-note">Selaimesi ei tue ilmoituksia.</div>' : ''}
    <div class="set-note">Ajastetut muistutukset (esim. iltaisin, kun sovellus on kiinni) vaativat erillisen push-palvelun — kerro jos haluat sen käyttöön.</div>`;
  const t = document.getElementById('notifToggle');
  if (t) t.onclick = async () => {
    if (on) { disableNotifications(); renderSettings(); }
    else { await enableNotifications(); renderSettings(); }
  };
}

/* ---- Tason nousun tunnistus (paikallinen muisti) ---- */
function checkLevelUp(xp) {
  let prev = null;
  try { const r = localStorage.getItem('lastLevel'); prev = r == null ? null : parseInt(r, 10); } catch (e) {}
  const info = levelInfo(xp).cur;
  const lvl = info.lvl;
  if (prev != null && !isNaN(prev) && lvl > prev) {
    celebrate({ big: true });
    showToast(`Taso ${lvl} – ${info.name}! 🎉`);
    notify('Uusi taso! 🎉', `Nousit tasolle ${lvl} – ${info.name}. Hienoa työtä!`);
  }
  if (prev == null || isNaN(prev) || lvl !== prev) {
    try { localStorage.setItem('lastLevel', String(lvl)); } catch (e) {}
  }
}

/* ---- Valmentajan reaktiot omiin treeneihin (pelaajan näkymä) ---- */
async function loadMyReactions() {
  const { data, error } = await sb.from('log_reactions').select('log_id, emoji');
  if (error) { console.error(error); return {}; }
  const map = {};
  data.forEach(r => { (map[r.log_id] = map[r.log_id] || []).push(r.emoji); });
  return map;
}
function reactionChipsHtml(logId) {
  const r = myReactions[logId];
  if (!r || !r.length) return '';
  return `<div class="log-reactions" title="Valmentajan palaute">${r.map(em => `<span class="log-react">${em}</span>`).join('')}</div>`;
}

/* ---- Joukkueen yhteinen viikkotavoite ---- */
async function loadTeamWeek() {
  if (!currentUser || !currentUser.team_id) return null;
  const { mondayISO } = weekRangeISO();
  const { data, error } = await sb.rpc('team_week_progress', { week_start: mondayISO });
  if (error) { console.error(error); return null; }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  let goalReward = 150, goalXp = 100;
  const { data: ri } = await sb.rpc('team_goal_reward_info');
  const rr = Array.isArray(ri) ? ri[0] : ri;
  if (rr) { goalReward = Number(rr.reward); goalXp = Number(rr.xp); }
  return {
    totalMin: Number(row.total_min) || 0,
    activePlayers: Number(row.active_players) || 0,
    teamSize: Number(row.team_size) || 0,
    goalHours: row.goal_hours == null ? null : Number(row.goal_hours),
    seasonStart: row.season_start || null,
    seasonName: row.season_name || null,
    goalReward: isFinite(goalReward) ? goalReward : 150,
    goalXp: isFinite(goalXp) ? goalXp : 100,
  };
}
function renderTeamGoal() {
  const cards = [document.getElementById('teamGoalCard'), document.getElementById('calTeamGoalCard')].filter(Boolean);
  if (!teamWeek || teamWeek.goalHours == null) { cards.forEach(c => { c.hidden = true; }); return; }
  const targetMin = Math.round(teamWeek.goalHours * 60);
  const doneMin = teamWeek.totalMin;
  const pct = targetMin ? Math.min(100, Math.round(doneMin / targetMin * 100)) : 0;
  const achieved = doneMin >= targetMin && targetMin > 0;
  const remaining = Math.max(0, targetMin - doneMin);
  const { mondayISO } = weekRangeISO();
  const participated = lastAll.some(e => e.date >= mondayISO);
  const msg = achieved
    ? (participated
        ? 'Tavoite saavutettu — sait palkinnon yhteistavoitteesta! 🎉⚽'
        : 'Tavoite saavutettu! 🎉 Kirjaa treeni tällä viikolla, niin saat sinäkin palkinnon.')
    : `Jäljellä ${fmtHours(remaining)} — sinunkin treenisi vie joukkuetta eteenpäin!`;
  const players = teamWeek.teamSize
    ? `${teamWeek.activePlayers}/${teamWeek.teamSize} pelaajaa treenannut tällä viikolla`
    : `${teamWeek.activePlayers} pelaajaa treenannut tällä viikolla`;
  const rewardBits = [];
  if (teamWeek.goalReward > 0) rewardBits.push(`⚽ ${fmtBalls(teamWeek.goalReward)}`);
  if (teamWeek.goalXp > 0) rewardBits.push(`+${teamWeek.goalXp} XP`);
  const rewardLine = rewardBits.length
    ? `<div class="team-goal-reward">Osallistujille tavoitteen täyttyessä: ${rewardBits.join(' ja ')}</div>`
    : '';
  const inner = `
    <div class="sec-head"><h2>Joukkueen viikkotavoite</h2><span class="hint">yhdessä</span>${boostBadgeHtml()}</div>
    <div class="team-goal-nums"><span class="team-goal-done">${fmtHours(doneMin)}</span><span class="team-goal-target">/ ${fmtHours(targetMin)}</span></div>
    <div class="goal-bar"><div class="goal-bar-fill team-goal-fill" data-pct="${pct / 100}" style="width:0; background:${achieved ? 'var(--accent)' : 'var(--brand)'}"></div></div>
    <div class="team-goal-players">${players}</div>
    ${rewardLine}
    <div class="goal-encour">${msg}</div>`;
  cards.forEach(card => {
    card.hidden = false;
    card.innerHTML = inner;
    const fill = card.querySelector('.team-goal-fill');
    const p = parseFloat(fill.dataset.pct);
    requestAnimationFrame(() => { fill.style.width = (p * 100) + '%'; });
  });
}

function challengeRowHtml(ch) {
  const c = catById(ch.category);
  const dueLabel = ch.due_date ? `${fmtDateShort(ch.due_date)} mennessä` : null;
  const pastDue = challengePastDue(ch);
  const personalTag = ch.user_id ? '<span class="personal-tag">henkilökohtainen</span>' : '';
  const rewardTag = `<span class="ch-reward-tag">⚽ ${ch.football_reward == null ? 250 : ch.football_reward}</span>${boostBadgeHtml()}`;
  if (ch.hours == null) {
    const done = isChallengeDone(ch);
    let action;
    if (done) {
      action = `<span class="done-label">${ch.due_date ? 'Suoritettu' : 'Suoritettu tällä viikolla'}</span><button class="ch-undo" data-id="${ch.id}" type="button">Peru</button>`;
    } else if (pastDue) {
      action = `<span class="past-due">Määräaika mennyt</span>`;
    } else {
      action = `<button class="btn ch-done-btn" data-id="${ch.id}" type="button">Merkitse tehdyksi</button>`;
    }
    return `
      <div class="goal-row${done ? ' achieved' : ''}">
        <div class="goal-row-top">
          <span class="goal-row-label">
            <span class="dot" style="background:${c.color}"></span>${c.label}
            <span class="goal-row-target">${dueLabel || 'Kertasuoritus'}</span>
            ${personalTag}
            ${rewardTag}
            ${done ? `<span class="goal-badge" title="Suoritettu">✓</span>` : ''}
          </span>
        </div>
        ${ch.description ? `<div class="challenge-desc">${escapeHtml(ch.description)}</div>` : ''}
        <div class="challenge-action">${action}</div>
      </div>`;
  }
  const p = challengeProgress(ch);
  const rawPct = p.targetMin ? Math.round(p.doneMin / p.targetMin * 100) : 0;
  const targetLabel = ch.due_date ? `${hoursShort(ch.hours)} · ${dueLabel}` : `${hoursShort(ch.hours)} / vko`;
  const footer = ch.due_date
    ? `<div class="goal-encour">${p.achieved ? 'Tavoite saavutettu! 🎉' : (pastDue ? 'Määräaika mennyt' : `Jäljellä ${fmtHours(Math.max(0, p.targetMin - p.doneMin))}`)}</div>`
    : `<div class="goal-encour">${goalMessage(ch, p)}</div>`;
  return `
    <div class="goal-row${p.achieved ? ' achieved' : ''}">
      <div class="goal-row-top">
        <span class="goal-row-label">
          <span class="dot" style="background:${c.color}"></span>${c.label}
          <span class="goal-row-target">${targetLabel}</span>
          ${personalTag}
          ${rewardTag}
          ${p.achieved ? `<span class="goal-badge" title="Saavutettu">✓</span>` : ''}
        </span>
      </div>
      ${ch.description ? `<div class="challenge-desc">${escapeHtml(ch.description)}</div>` : ''}
      <div class="goal-bar"><div class="goal-bar-fill" data-pct="${p.pct}" style="width:0; background:${p.achieved ? 'var(--accent)' : c.color}"></div></div>
      <div class="goal-nums">${fmtHours(p.doneMin)} / ${fmtHours(p.targetMin)} · ${rawPct} %</div>
      ${footer}
    </div>`;
}

function wireChallengeCard(card) {
  card.querySelectorAll('.goal-bar-fill').forEach(f => {
    const pct = parseFloat(f.dataset.pct);
    requestAnimationFrame(() => { f.style.width = (pct * 100) + '%'; });
  });
  card.querySelectorAll('.ch-done-btn').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      const ch = myChallenges.find(x => x.id === Number(btn.dataset.id));
      if (!ch) return;
      const { error } = await completionStore.complete(ch);
      if (error && !/duplicate|unique/i.test(error.message || '')) { btn.disabled = false; alert('Ei onnistunut: ' + error.message); return; }
      myCompletions.add(ch.id + '|' + challengeKey(ch));
      renderChallenges();
      refreshFootballs();
      const reward = ch.football_reward == null ? 250 : ch.football_reward;
      celebrate();
      showToast(`Haaste suoritettu! +${fmtBalls(reward)} ⚽`);
      notify('Haaste suoritettu! 🎉', `Hyvää työtä — ansaitsit ${fmtBalls(reward)} jalkapalloa.`);
    };
  });
  card.querySelectorAll('.ch-undo').forEach(btn => {
    btn.onclick = async () => {
      btn.disabled = true;
      const ch = myChallenges.find(x => x.id === Number(btn.dataset.id));
      if (!ch) return;
      const { error } = await completionStore.uncomplete(ch);
      if (error) { btn.disabled = false; alert('Ei onnistunut: ' + error.message); return; }
      myCompletions.delete(ch.id + '|' + challengeKey(ch));
      renderChallenges();
      refreshFootballs();
    };
  });
}

function renderChallenges() {
  const cards = [document.getElementById('challengeCard'), document.getElementById('calChallengeCard')].filter(Boolean);
  if (!myChallenges.length) { cards.forEach(c => { c.hidden = true; }); return; }
  const inner = `<div class="sec-head"><h2>Haasteet</h2><span class="hint">valmentajalta</span></div>`
    + `<div class="goal-list">${myChallenges.map(challengeRowHtml).join('')}</div>`;
  cards.forEach(card => { card.hidden = false; card.innerHTML = inner; wireChallengeCard(card); });
}

/* Tämän viikon tavoitteet kalenterinäkymässä */
function renderCalGoals() {
  const card = document.getElementById('calGoals');
  const box = document.getElementById('calGoalList');
  if (!currentGoals.length) { card.hidden = true; return; }
  card.hidden = false;
  document.getElementById('calGoalsHint').textContent =
    `${currentGoals.filter(g => goalProgress(g).achieved).length} / ${currentGoals.length} saavutettu`;
  box.innerHTML = '';
  currentGoals.forEach(g => {
    const c = catById(g.category);
    const p = goalProgress(g);
    const rawPct = p.targetMin ? Math.round(p.doneMin / p.targetMin * 100) : 0;
    const streak = goalStreak(g);
    const nudge = goalNudge(g, p);
    const row = document.createElement('div');
    row.className = 'cal-goal-item' + (p.achieved ? ' achieved' : '');
    row.innerHTML = `
      <div class="cal-goal-head">
        <span class="cal-goal-label">
          <span class="dot" style="background:${c.color}"></span>${c.label}
          ${streak >= 2 ? `<span class="goal-streak">${streak} vko putkeen</span>` : ''}
          ${p.achieved ? `<span class="goal-badge" title="Saavutettu">✓</span>` : ''}
        </span>
        <span class="cal-goal-val">${fmtHours(p.doneMin)} / ${fmtHours(p.targetMin)} · ${rawPct} %</span>
      </div>
      <div class="bar-track"><div class="bar-fill" data-pct="${p.pct}" style="width:0; background:${p.achieved ? 'var(--accent)' : c.color}"></div></div>
      <div class="goal-encour">${goalMessage(g, p)}</div>
      ${nudge ? `<div class="goal-nudge">${nudge}</div>` : ''}`;
    box.appendChild(row);
    const f = row.querySelector('.bar-fill');
    requestAnimationFrame(() => { f.style.width = (p.pct * 100) + '%'; });
  });
  if (currentGoals.every(g => goalProgress(g).achieved)) {
    const msg = document.createElement('div');
    msg.className = 'goal-msg achieved-msg cal-goal-allmsg';
    msg.textContent = 'Kaikki viikkotavoitteet saavutettu – mahtavaa työtä!';
    box.appendChild(msg);
  }
}

/* ---- Kalenteri ---- */
const longDateFmt = new Intl.DateTimeFormat('fi-FI', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

function renderCalendar() {
  renderCalGoals();
  document.getElementById('calTitle').textContent = labelForMonth(`${calY}-${pad(calM + 1)}`);
  const grid = document.getElementById('calDays');
  grid.innerHTML = '';

  const firstDow = (new Date(calY, calM, 1).getDay() + 6) % 7;   // ma=0 … su=6
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const today = todayISO();
  const { mondayISO, sundayISO } = weekRangeISO();

  for (let i = 0; i < firstDow; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-day empty';
    grid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${calY}-${pad(calM + 1)}-${pad(day)}`;
    const dayEntries = lastAll.filter(e => e.date === iso);
    const cats = CATEGORIES.filter(c => dayEntries.some(e => e.category === c.id));
    const dayEvents = calEvents.filter(ev => ev.date === iso);

    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cal-day'
      + (iso >= mondayISO && iso <= sundayISO ? ' thisweek' : '')
      + (iso === today ? ' today' : '')
      + (iso === selectedDay ? ' sel' : '');

    const shown = cats.slice(0, 5);
    const extra = cats.length - shown.length;
    const evtCap = 4;
    const evtShown = dayEvents.slice(0, evtCap);
    const evtExtra = dayEvents.length - evtShown.length;
    const evtMark = evtShown.map(ev =>
      `<span class="evt-dot" title="${escapeHtml(ev.title || 'Kalenteritapahtuma')}"></span>`).join('')
      + (evtExtra > 0 ? `<span class="cal-more cal-more-evt">+${evtExtra}</span>` : '');
    const dotsHtml = evtMark
      + shown.map(c => `<span class="dot" style="background:${c.color}"></span>`).join('')
      + (extra > 0 ? `<span class="cal-more">+${extra}</span>` : '');

    cell.innerHTML = `<span class="dnum">${day}</span><span class="cal-dots">${dotsHtml}</span>`;
    cell.onclick = () => { selectedDay = iso; renderCalendar(); renderDayPanel(); };
    grid.appendChild(cell);
  }
}

function renderDayPanel() {
  const titleEl = document.getElementById('dayTitle');
  const totalEl = document.getElementById('dayTotal');
  const box = document.getElementById('daySessions');

  if (!selectedDay) {
    titleEl.textContent = 'Valitse päivä';
    totalEl.textContent = '';
    box.innerHTML = '<div class="day-empty">Napauta kalenterista päivää nähdäksesi sen harjoitukset.</div>';
    return;
  }

  const d = new Date(selectedDay + 'T00:00:00');
  let label = longDateFmt.format(d);
  label = label.charAt(0).toUpperCase() + label.slice(1);
  titleEl.textContent = label;

  const dayEntries = lastAll.filter(e => e.date === selectedDay);
  const dayEvents = calEvents.filter(ev => ev.date === selectedDay);
  const totalMin = dayEntries.reduce((s, e) => s + e.duration, 0);
  totalEl.textContent = dayEntries.length ? fmtHours(totalMin) : '';

  if (dayEntries.length === 0 && dayEvents.length === 0) {
    box.innerHTML = '<div class="day-empty">Ei harjoituksia tai tapahtumia tänä päivänä.</div>';
    return;
  }

  // Joukkueen kalenteritapahtumat (iCal)
  let html = '';
  if (dayEvents.length) {
    html += '<div class="day-events">';
    dayEvents.forEach(ev => {
      const timeLabel = ev.time ? (ev.end ? `${ev.time}–${ev.end}` : ev.time) : 'Koko päivä';
      html += `
        <div class="evt-row">
          <span class="evt-time">${timeLabel}</span>
          <div class="evt-main">
            <div class="evt-title">${escapeHtml(ev.title)}</div>
            ${ev.location ? `<div class="evt-loc">${escapeHtml(ev.location)}</div>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }
  box.innerHTML = html;

  // Omat harjoituskirjaukset
  dayEntries.forEach(e => {
    const c = catById(e.category);
    const row = document.createElement('div');
    row.className = 'day-row';
    row.innerHTML = `
      <div>
        <div class="day-cat"><span class="dot" style="background:${c.color}"></span>${c.label}</div>
        ${e.note ? `<div class="day-note">${escapeHtml(e.note)}</div>` : ''}
        ${reactionChipsHtml(e.id)}
      </div>
      <div class="day-dur">${e.duration}<small>min</small></div>
      <div class="del-area"></div>`;
    setupDelete(row.querySelector('.del-area'), e);
    box.appendChild(row);
  });
}

function calStep(delta) {
  calM += delta;
  if (calM < 0) { calM = 11; calY--; }
  else if (calM > 11) { calM = 0; calY++; }
  renderCalendar();
}

/* ---- Päivämäärävalitsin (lomake) ---- */
function updateDateBtn() {
  const d = new Date(formDate + 'T00:00:00');
  const s = btnDateFmt.format(d);
  document.getElementById('dateBtn').textContent = s.charAt(0).toUpperCase() + s.slice(1);
}
function renderDatePicker() {
  document.getElementById('dpTitle').textContent = labelForMonth(`${dpY}-${pad(dpM + 1)}`);
  const grid = document.getElementById('dpDays');
  grid.innerHTML = '';
  const firstDow = (new Date(dpY, dpM, 1).getDay() + 6) % 7;
  const dim = new Date(dpY, dpM + 1, 0).getDate();
  const today = todayISO();
  for (let i = 0; i < firstDow; i++) {
    const b = document.createElement('div');
    b.className = 'dp-cell empty';
    grid.appendChild(b);
  }
  for (let day = 1; day <= dim; day++) {
    const iso = `${dpY}-${pad(dpM + 1)}-${pad(day)}`;
    const future = iso > today;
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'dp-cell' + (iso === today ? ' today' : '') + (iso === formDate ? ' sel' : '') + (future ? ' disabled' : '');
    cell.textContent = day;
    if (future) { cell.disabled = true; }
    else { cell.onclick = () => { formDate = iso; updateDateBtn(); closeDatePicker(); }; }
    grid.appendChild(cell);
  }
}
function openDatePicker() {
  const [y, m] = formDate.split('-').map(Number);
  dpY = y; dpM = m - 1;
  renderDatePicker();
  document.getElementById('datePop').hidden = false;
}
function closeDatePicker() { document.getElementById('datePop').hidden = true; }
function dpStep(delta) {
  if (delta > 0) {
    const now = new Date();
    if (dpY > now.getFullYear() || (dpY === now.getFullYear() && dpM >= now.getMonth())) return;
  }
  dpM += delta;
  if (dpM < 0) { dpM = 11; dpY--; }
  else if (dpM > 11) { dpM = 0; dpY++; }
  renderDatePicker();
}

/* ---- Tallennus ---- */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.innerHTML = `<span class="toast-check">✓</span><span>${msg}</span>`;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { el.hidden = true; }, 280);
  }, 2200);
}

async function save() {
  const date = formDate;
  const duration = parseInt(document.getElementById('inDuration').value, 10);
  const note = document.getElementById('inNote').value.trim();
  if (!date) { return; }
  if (date > todayISO()) { showToast('Päivää ei voi asettaa tulevaisuuteen'); return; }
  if (!duration || duration < 1) { document.getElementById('inDuration').focus(); return; }
  if (duration > 240) { showToast('Kesto voi olla enintään 240 min (4 t)'); document.getElementById('inDuration').focus(); return; }
  await store.addEntry({ date, category: selectedCat, duration, note });
  document.getElementById('inDuration').value = '';
  document.getElementById('inNote').value = '';
  renderAll();
  showToast('Harjoitus tallennettu');
}

/* ---- Pelaajasovelluksen kytkennät ---- */
function wirePlayerApp() {
  updateDateBtn();
  document.getElementById('saveBtn').onclick = save;
  const histT = document.getElementById('histToggle');
  if (histT) histT.onclick = () => {
    const body = document.getElementById('histBody');
    const willOpen = body.hidden;
    body.hidden = !willOpen;
    histT.setAttribute('aria-expanded', String(willOpen));
    histT.classList.toggle('open', willOpen);
  };
  document.getElementById('dateBtn').onclick = e => {
    e.stopPropagation();
    const pop = document.getElementById('datePop');
    if (pop.hidden) openDatePicker(); else closeDatePicker();
  };
  document.getElementById('dpPrev').onclick = () => dpStep(-1);
  document.getElementById('dpNext').onclick = () => dpStep(1);
  document.addEventListener('click', e => {
    const fld = document.getElementById('dateBtn').closest('.date-fld');
    if (!document.getElementById('datePop').hidden && !fld.contains(e.target)) closeDatePicker();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDatePicker(); });
  document.getElementById('periodSelect').onchange = e => { selectedPeriod = e.target.value; renderAll(); };
  document.getElementById('tabDash').onclick = () => switchView('dash');
  document.getElementById('tabCal').onclick = () => switchView('cal');
  document.getElementById('tabBank').onclick = () => switchView('bank');
  document.getElementById('profileHeader').onclick = () => switchView('profile');
  document.getElementById('profileBack').onclick = () => switchView('dash');
  document.getElementById('calPrev').onclick = () => calStep(-1);
  document.getElementById('calNext').onclick = () => calStep(1);
  renderChips();
}

/* =========================================================================
   KIRJAUTUMINEN JA ROOLITUS
   ========================================================================= */
let currentUser = null;          // { id, username, role, team_id }
let authMode = 'login';          // 'login' | 'register'
let playerWired = false;

async function loadProfile(authUser) {
  let user = authUser;
  if (!user) { const r = await sb.auth.getUser(); user = r.data && r.data.user; }
  if (!user) return null;
  const { data, error } = await sb.from('profiles')
    .select('id, username, role, team_id, is_admin, leaderboard_opt_in, cos_name_color, cos_title, cos_frame, cos_nameplate, jersey_number, cos_avatar, cos_profile_bg, cos_name_effect, plate_name').eq('id', user.id).single();
  if (error) { console.error(error); return null; }
  return data;
}

function showAuth() {
  document.getElementById('playerWrap').hidden = true;
  document.getElementById('coachWrap').hidden = true;
  document.getElementById('authScreen').hidden = false;
}

async function startPlayer() {
  document.getElementById('authScreen').hidden = true;
  document.getElementById('coachWrap').hidden = true;
  document.getElementById('playerWrap').hidden = false;
  if (!playerWired) { wirePlayerApp(); playerWired = true; }
  const [mc, cp, en] = await Promise.all([
    loadMyChallenges(),
    loadMyCompletions(),
    loadMyEncouragements(),
  ]);
  myChallenges = mc;
  myCompletions = cp;
  myEncouragements = en;
  await renderAll();
  // Kalenteritilaus (ICS) on usein hidas — haetaan taustalla, ei viivytetä etusivua
  loadCalEvents().then(ev => { calEvents = ev; renderCalendar(); renderDayPanel(); });
}

function setAuthMode(m) {
  authMode = m;
  document.getElementById('authTitle').textContent = m === 'login' ? 'Kirjaudu sisään' : 'Luo tili';
  document.getElementById('authSubmit').textContent = m === 'login' ? 'Kirjaudu' : 'Rekisteröidy';
  document.getElementById('authToggle').textContent = m === 'login' ? 'Ei tiliä? Rekisteröidy' : 'Onko jo tili? Kirjaudu';
  document.getElementById('authPass').placeholder = m === 'login' ? 'salasana' : 'vähintään 6 merkkiä';
  const confirmFld = document.getElementById('authConfirmFld');
  if (confirmFld) confirmFld.style.display = (m === 'register') ? 'block' : 'none';
  const confirmInput = document.getElementById('authConfirm');
  if (confirmInput && m !== 'register') confirmInput.value = '';
  authError('');
}
function authError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
}
function authMsg(error) {
  const m = (error && error.message) || '';
  if (/already registered|already been registered/i.test(m)) return 'Käyttäjänimi on jo varattu.';
  if (/invalid login credentials/i.test(m)) return 'Väärä käyttäjänimi tai salasana.';
  if (/email not confirmed/i.test(m)) return 'Sähköpostivahvistus on päällä Supabasessa – ota se pois päältä Authentication-asetuksista.';
  return m || 'Tapahtui virhe. Yritä uudelleen.';
}

async function submitAuth() {
  const username = document.getElementById('authUser').value.trim().toLowerCase();
  const password = document.getElementById('authPass').value;
  if (!/^[a-z0-9_.-]{3,}$/.test(username)) {
    authError('Käyttäjänimi: vähintään 3 merkkiä (kirjaimet, numerot, _ . -).'); return;
  }
  if (password.length < 6) { authError('Salasanan on oltava vähintään 6 merkkiä.'); return; }
  if (authMode === 'register') {
    const confirmEl = document.getElementById('authConfirm');
    if (confirmEl && password !== confirmEl.value) { authError('Salasanat eivät täsmää.'); return; }
  }
  const btn = document.getElementById('authSubmit');
  btn.disabled = true; authError('');
  try {
    if (authMode === 'register') {
      const { error } = await sb.auth.signUp({
        email: usernameToEmail(username), password, options: { data: { username } }
      });
      if (error) { authError(authMsg(error)); return; }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: usernameToEmail(username), password });
      if (error) { authError(authMsg(error)); return; }
    }
    currentUser = await loadProfile();
    if (!currentUser) { authError('Profiilin lataus epäonnistui.'); return; }
    if (currentUser.role === 'coach' || currentUser.is_admin) startCoach(); else startPlayer();
  } catch (e) {
    authError('Yhteysvirhe. Tarkista Supabase-asetukset.');
  } finally {
    btn.disabled = false;
  }
}

async function doSignOut() {
  await sb.auth.signOut();
  location.reload();
}

/* =========================================================================
   VALMENTAJANÄKYMÄ
   ========================================================================= */
const coachStore = {
  async getTeams() {
    const { data, error } = await sb.from('teams').select('id, name, created_at, ics_url, ics_filter, weekly_goal_hours, season_start, season_name, football_threshold_min, football_daily_cap, team_goal_reward').order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
  },
  async setTeamSeason(teamId, name, start) {
    return await sb.from('teams').update({ season_name: name || null, season_start: start || null }).eq('id', teamId);
  },
  async setTeamCalendar(teamId, url, filter) {
    return await sb.from('teams').update({
      ics_url: url || null,
      ics_filter: (filter && filter.trim()) ? filter.trim() : null
    }).eq('id', teamId);
  },
  async setTeamGoal(teamId, hours) {
    return await sb.from('teams').update({ weekly_goal_hours: hours }).eq('id', teamId);
  },
  async setTeamGoalReward(teamId, reward) {
    return await sb.from('teams').update({ team_goal_reward: reward }).eq('id', teamId);
  },
  async setTeamFootball(teamId, threshold, cap) {
    return await sb.from('teams').update({ football_threshold_min: threshold, football_daily_cap: cap }).eq('id', teamId);
  },
  async createTeam(name) {
    const { data, error } = await sb.rpc('admin_create_team', { p_name: name });
    if (error) return { error };
    if (data && data.ok === false) return { error: { message: data.error } };
    return { data };
  },
  async getTeamCoaches() {
    const { data, error } = await sb.from('team_coaches').select('team_id, coach_id');
    if (error) { console.error(error); return []; }
    return data;
  },
  async getCoachAccounts() {
    const { data, error } = await sb.from('profiles').select('id, username, role');
    if (error) { console.error(error); return []; }
    return data.filter(p => p.role === 'coach');
  },
  async assignCoach(username, teamId) {
    const { data, error } = await sb.rpc('assign_coach_to_team', { p_username: username, p_team_id: teamId });
    if (error) return { error };
    if (data && data.ok === false) return { error: { message: data.error } };
    return { data };
  },
  async removeCoach(coachId, teamId) {
    const { data, error } = await sb.rpc('remove_coach_from_team', { p_coach_id: coachId, p_team_id: teamId });
    if (error) return { error };
    if (data && data.ok === false) return { error: { message: data.error } };
    return { data };
  },
  async getPlayers() {
    const { data, error } = await sb.from('profiles').select('id, username, team_id, role');
    if (error) { console.error(error); return []; }
    return data.filter(p => p.role === 'player' && p.team_id);
  },
  async getLogs() {
    const { data, error } = await sb.from('training_logs').select('id, user_id, date, category, duration, note');
    if (error) { console.error(error); return []; }
    return data;
  },
  async getFootballs() {
    const { data, error } = await sb.from('football_events').select('user_id, amount');
    if (error) { console.error(error); return {}; }
    const map = {};
    data.forEach(r => { map[r.user_id] = (map[r.user_id] || 0) + r.amount; });
    return map;
  },
  async getReactions() {
    const { data, error } = await sb.from('log_reactions').select('log_id, emoji, coach_id');
    if (error) { console.error(error); return []; }
    return data;
  },
  async setReaction(logId, emoji) {
    return await sb.from('log_reactions').upsert({ log_id: logId, coach_id: currentUser.id, emoji }, { onConflict: 'log_id,coach_id' });
  },
  async removeReaction(logId) {
    return await sb.from('log_reactions').delete().eq('log_id', logId).eq('coach_id', currentUser.id);
  },
  async getGoals() {
    const { data, error } = await sb.from('goals').select('user_id, category, hours');
    if (error) { console.error(error); return []; }
    return data.map(g => ({ ...g, hours: Number(g.hours) }));
  },
  async getChallenges() {
    const { data, error } = await sb.from('challenges').select('id, team_id, category, hours, description, user_id, due_date, created_at, football_reward').order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data.map(c => ({ ...c, hours: c.hours == null ? null : Number(c.hours) }));
  },
  async getCompletions() {
    const { mondayISO } = weekRangeISO();
    const keys = [...new Set([mondayISO, ...coachChallenges.filter(c => c.due_date).map(c => c.due_date)])];
    const { data, error } = await sb.from('challenge_completions').select('challenge_id, user_id, week_start').in('week_start', keys);
    if (error) { console.error(error); return []; }
    return data;
  },
  async addPlayer(username, teamId) {
    const { data, error } = await sb.rpc('add_player_to_team', { p_username: username, p_team_id: teamId });
    if (error) return { ok: false, error: error.message };
    return data;
  },
  async removePlayer(userId) {
    const { data, error } = await sb.rpc('remove_player_from_team', { p_user_id: userId });
    if (error) return { ok: false, error: error.message };
    return data;
  },
  async createChallenge(teamId, category, hours, description, userId, dueDate, reward) {
    const row = { team_id: teamId, category, hours, description: description || null, user_id: userId || null, due_date: dueDate || null };
    if (reward != null && isFinite(reward) && reward >= 0) row.football_reward = reward;
    return await sb.from('challenges').insert(row).select().single();
  },
  async deleteChallenge(id) {
    return await sb.from('challenges').delete().eq('id', id);
  },
  async getBoosts() {
    const { data, error } = await sb.from('boost_periods')
      .select('id, team_id, label, starts_on, ends_on, multiplier').order('starts_on', { ascending: true });
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async getTeamGoalXp() {
    const { data, error } = await sb.from('team_goal_xp_events').select('user_id, week_start, xp');
    if (error) { console.error(error); return []; }
    return data || [];
  },
  async createBoost(teamId, label, startsOn, endsOn, multiplier) {
    const row = { team_id: teamId, label: label || null, starts_on: startsOn, ends_on: endsOn, multiplier };
    return await sb.from('boost_periods').insert(row).select().single();
  },
  async deleteBoost(id) {
    return await sb.from('boost_periods').delete().eq('id', id);
  },
  async getEncouragements() {
    const { data, error } = await sb.from('encouragements').select('id, user_id, text, created_at').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
  },
  async sendEncouragement(userId, text) {
    return await sb.from('encouragements').insert({ user_id: userId, text });
  }
};

let coachTeams = [], coachPlayers = [], coachLogs = [], coachGoals = [], coachChallenges = [], coachCompletions = [], coachEncouragements = [], coachReactions = [], coachFootballs = {};
let coachTeamLinks = [], coachAccounts = [];   // admin: valmentaja↔joukkue-liitokset ja valmentajatilit
let coachBoosts = [];                          // joukkueiden tehostejaksot
let coachTeamGoalXpRows = [];                   // pelaajien yhteistavoite-bonus-XP
let coachTab = 'players';
let challengeSetupCat = {};
let challengeKind = {};   // per-team: 'time' | 'once'
let challengeTargets = {}; // per-team: 'team' | Set(user_id)

async function startCoach() {
  document.getElementById('authScreen').hidden = true;
  document.getElementById('playerWrap').hidden = true;
  document.getElementById('coachWrap').hidden = false;
  document.getElementById('coachUserChip').textContent = currentUser.username + (currentUser.is_admin ? ' · admin' : '');
  document.getElementById('ctabPlayers').onclick = () => coachSwitch('players');
  document.getElementById('ctabTeams').onclick = () => coachSwitch('teams');
  document.getElementById('ctabChallenges').onclick = () => coachSwitch('challenges');
  await coachRefresh();
}

function coachSwitch(t) {
  coachTab = t;
  document.getElementById('coachPlayers').hidden = (t !== 'players');
  document.getElementById('coachTeamsView').hidden = (t !== 'teams');
  document.getElementById('coachChallengesView').hidden = (t !== 'challenges');
  document.getElementById('ctabPlayers').classList.toggle('active', t === 'players');
  document.getElementById('ctabTeams').classList.toggle('active', t === 'teams');
  document.getElementById('ctabChallenges').classList.toggle('active', t === 'challenges');
}

async function coachRefresh() {
  coachTeams      = await coachStore.getTeams();
  coachPlayers    = await coachStore.getPlayers();
  coachLogs       = await coachStore.getLogs();
  coachFootballs  = await coachStore.getFootballs();
  coachGoals      = await coachStore.getGoals();
  coachChallenges = await coachStore.getChallenges();
  coachCompletions = await coachStore.getCompletions();  coachEncouragements = await coachStore.getEncouragements();
  coachReactions = await coachStore.getReactions();
  coachBoosts = await coachStore.getBoosts();
  coachTeamGoalXpRows = await coachStore.getTeamGoalXp();
  if (currentUser.is_admin) {
    coachTeamLinks = await coachStore.getTeamCoaches();
    coachAccounts = await coachStore.getCoachAccounts();
  }
  renderCoachPlayers();
  renderCoachTeams();
  renderCoachChallenges();
}

const shortDateFmt = new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });
function fmtDateShort(iso) { return shortDateFmt.format(new Date(iso + 'T00:00:00')); }

function playerStats(userId) {
  const logs = coachLogs.filter(l => l.user_id === userId);
  const { mondayISO, sundayISO } = weekRangeISO();
  const tm = monthKey(todayISO());
  let weekMin = 0, monthMin = 0, monthCount = 0, last = null;
  const byCat = {};
  logs.forEach(l => {
    if (l.date >= mondayISO && l.date <= sundayISO) weekMin += l.duration;
    if (monthKey(l.date) === tm) { monthMin += l.duration; monthCount++; byCat[l.category] = (byCat[l.category] || 0) + l.duration; }
    if (!last || l.date > last) last = l.date;
  });
  return { weekMin, monthMin, monthCount, last, byCat, count: logs.length };
}
function userWeekMin(userId, category) {
  const { mondayISO, sundayISO } = weekRangeISO();
  return coachLogs.filter(l => l.user_id === userId && l.category === category && l.date >= mondayISO && l.date <= sundayISO)
    .reduce((s, l) => s + l.duration, 0);
}
function userCumulativeMin(userId, category, startISO, endISO) {
  return coachLogs.filter(l => l.user_id === userId && l.category === category && (!startISO || l.date >= startISO) && l.date <= endISO)
    .reduce((s, l) => s + l.duration, 0);
}
function coachTeamWeekMin(teamId) {
  const ids = new Set(coachPlayers.filter(p => p.team_id === teamId).map(p => p.id));
  const { mondayISO, sundayISO } = weekRangeISO();
  return coachLogs.filter(l => ids.has(l.user_id) && l.date >= mondayISO && l.date <= sundayISO)
    .reduce((s, l) => s + l.duration, 0);
}
function repChallengeLine(p, ch) {
  const c = catById(ch.category);
  const due = ch.due_date ? ` <span class="rep-due">${fmtDateShort(ch.due_date)} mennessä</span>` : '';
  if (ch.hours == null) {
    const done = coachCompletions.some(cc => cc.challenge_id === ch.id && cc.user_id === p.id && cc.week_start === challengeKey(ch));
    return `<div class="rep-goal"><span class="dot" style="background:${c.color}"></span><span class="rep-goal-name">${c.label}${due}</span>
      <span class="rep-goal-val">${done ? '✓ Tehty' : 'Ei tehty'}</span></div>`;
  }
  const target = Math.round(ch.hours * 60);
  const done = ch.due_date
    ? userCumulativeMin(p.id, ch.category, (ch.created_at || '').slice(0, 10), todayISO())
    : userWeekMin(p.id, ch.category);
  const pct = target ? Math.min(100, Math.round(done / target * 100)) : 0;
  return `<div class="rep-goal"><span class="dot" style="background:${c.color}"></span><span class="rep-goal-name">${c.label}${due}</span>
    <span class="rep-goal-val">${fmtHours(done)} / ${fmtHours(target)} · ${pct} %${done >= target ? ' ✓' : ''}</span></div>`;
}
function repProgressLine(userId, category, hours) {
  const c = catById(category);
  const done = userWeekMin(userId, category);
  const target = Math.round(hours * 60);
  const pct = target ? Math.min(100, Math.round(done / target * 100)) : 0;
  return `<div class="rep-goal"><span class="dot" style="background:${c.color}"></span><span class="rep-goal-name">${c.label}</span>
      <span class="rep-goal-val">${fmtHours(done)} / ${fmtHours(target)} · ${pct} %${done >= target ? ' ✓' : ''}</span></div>`;
}

/* ---- 1) PELAAJAT (raportit) ---- */
const PRESET_KUDOS = ['👏 Hienoa työtä!', '💪 Jatka samaan malliin!', '🔥 Hyvä putki!', '⭐️ Loistavaa!'];
const REACTION_EMOJIS = ['👏', '🔥', '💪', '⭐️', '👍'];
function coachReactionFor(logId) {
  const r = coachReactions.find(x => x.log_id === logId && x.coach_id === currentUser.id);
  return r ? r.emoji : null;
}
function recentSessionsSection(p) {
  const logs = coachLogs.filter(l => l.user_id === p.id)
    .slice().sort((a, b) => b.date < a.date ? -1 : b.date > a.date ? 1 : (b.id - a.id)).slice(0, 6);
  if (!logs.length) return '';
  const rows = logs.map(l => {
    const c = catById(l.category);
    const mine = coachReactionFor(l.id);
    const chips = REACTION_EMOJIS.map(em =>
      `<button class="react-chip${mine === em ? ' active' : ''}" type="button" data-log="${l.id}" data-emoji="${em}">${em}</button>`).join('');
    return `
      <div class="rep-session" data-log="${l.id}">
        <div class="rep-session-top">
          <span class="rep-session-cat"><span class="dot" style="background:${c.color}"></span>${c.label}</span>
          <span class="rep-session-meta">${fmtDateShort(l.date)} · ${l.duration} min</span>
        </div>
        ${l.note ? `<div class="rep-session-note">${escapeHtml(l.note)}</div>` : ''}
        <div class="react-row" data-log="${l.id}">${chips}</div>
      </div>`;
  }).join('');
  return `<div class="rep-section-label">Viimeisimmät treenit — anna palaute</div>${rows}`;
}
function kudosSection(p) {
  const last = coachEncouragements.find(e => e.user_id === p.id);
  return `
    <div class="rep-section-label">Kannusta pelaajaa</div>
    <div class="kudos" data-user="${p.id}">
      <div class="kudos-presets">
        ${PRESET_KUDOS.map(t => `<button class="kudos-preset" type="button" data-user="${p.id}" data-text="${escapeHtml(t)}">${t}</button>`).join('')}
      </div>
      <div class="kudos-send-row">
        <input type="text" class="kudos-input" data-user="${p.id}" maxlength="120" placeholder="Oma viesti…">
        <button class="btn kudos-send" type="button" data-user="${p.id}">Lähetä</button>
      </div>
      <div class="kudos-last">${last ? `Viimeksi: "${escapeHtml(last.text)}" (${timeAgo(last.created_at)})` : ''}</div>
    </div>`;
}
const CHEAT = { dayMaxMin: 300, maxDur: 240, manySessions: 5 };
/* Etsii pelaajan epätavalliset kirjauspäivät (mahdollinen liioittelu/huijaus). */
function playerAnomalies(userId) {
  const byDate = {};
  coachLogs.filter(l => l.user_id === userId).forEach(l => {
    (byDate[l.date] = byDate[l.date] || []).push(l);
  });
  const flags = [];
  Object.keys(byDate).forEach(date => {
    const logs = byDate[date];
    const total = logs.reduce((s, l) => s + l.duration, 0);
    const maxCount = logs.filter(l => l.duration >= CHEAT.maxDur).length;
    const reasons = [];
    if (maxCount >= 2) reasons.push(`${maxCount} × ${CHEAT.maxDur} min samana päivänä`);
    if (total > CHEAT.dayMaxMin) reasons.push(`yhteensä ${fmtHours(total)} yhtenä päivänä`);
    if (logs.length >= CHEAT.manySessions) reasons.push(`${logs.length} kirjausta samana päivänä`);
    if (reasons.length) flags.push({ date, total, count: logs.length, reasons });
  });
  flags.sort((a, b) => b.date.localeCompare(a.date));
  return flags;
}
function flaggedPlayers() {
  return coachPlayers.filter(p => coachTeams.some(t => t.id === p.team_id) && playerAnomalies(p.id).length);
}
function cheatSummaryCard() {
  const flagged = flaggedPlayers();
  if (!flagged.length) return '';
  const chips = flagged.map(p => `<span class="cheat-chip">⚠️ ${escapeHtml(p.username)}</span>`).join('');
  return `<div class="card cheat-card">
    <div class="sec-head"><h2>⚠️ Tarkista kirjaukset</h2><span class="hint">${flagged.length} ${flagged.length === 1 ? 'pelaaja' : 'pelaajaa'}</span></div>
    <div class="cheat-note">Näillä pelaajilla on epätavallisen suuria tai toistuvia kirjauksia (esim. useita maksimikestoisia treenejä samana päivänä). Kyse voi olla virheestä tai liioittelusta — avaa pelaajan tiedot nähdäksesi päivät ja jutelkaa tarvittaessa.</div>
    <div class="cheat-players">${chips}</div>
  </div>`;
}
function richPlayerReport(p) {
  const s = playerStats(p.id);
  const cats = CATEGORIES.filter(c => s.byCat[c.id]);
  const maxCat = Math.max(1, ...cats.map(c => s.byCat[c.id]));
  const catBars = cats.map(c => `
    <div class="rep-cat">
      <div class="rep-cat-label"><span class="dot" style="background:${c.color}"></span>${c.label}</div>
      <div class="rep-bar-track"><div class="rep-bar-fill" style="width:${Math.round(s.byCat[c.id] / maxCat * 100)}%; background:${c.color}"></div></div>
      <div class="rep-cat-val">${fmtHours(s.byCat[c.id])}</div>
    </div>`).join('');

  const goalLines = coachGoals.filter(g => g.user_id === p.id).map(g => repProgressLine(p.id, g.category, g.hours)).join('');
  const chLines = coachChallenges.filter(ch => ch.team_id === p.team_id && (ch.user_id == null || ch.user_id === p.id)).map(ch => repChallengeLine(p, ch)).join('');

  const statsLine = s.count
    ? `Viikko ${fmtHours(s.weekMin)} · Kuukausi ${fmtHours(s.monthMin)} · Viimeksi ${fmtDateShort(s.last)}`
    : 'Ei vielä kirjauksia';
  const team = coachTeams.find(t => t.id === p.team_id);
  const seasonStart = team && team.season_start ? team.season_start : null;
  const seasonXp = coachLogs.filter(l => l.user_id === p.id && (!seasonStart || l.date >= seasonStart))
    .reduce((sum, l) => sum + sessionXp(l.duration) * boostMultIn(coachBoosts, l.date, p.team_id), 0)
    + coachTeamGoalXpRows.filter(r => r.user_id === p.id && (!seasonStart || r.week_start >= seasonStart))
        .reduce((s, r) => s + (Number(r.xp) || 0), 0);
  const lvl = levelInfo(seasonXp);
  const balls = coachFootballs[p.id] || 0;
  const levelLine = `<div class="rep-level"><span class="rep-level-badge">${levelBadgeImg(lvl.cur.lvl)}</span><span class="rep-level-text">Taso ${lvl.cur.lvl} · ${lvl.cur.name} · ${seasonXp} XP${seasonStart ? '' : ' (kaikkien aikojen)'}</span><span class="rep-balls">⚽ ${fmtBalls(balls)}</span></div>`;
  const anomalies = playerAnomalies(p.id);
  const cheatSection = anomalies.length ? `<div class="rep-section-label rep-flag-label">⚠️ Tarkista nämä kirjaukset</div>`
    + `<div class="rep-flags">${anomalies.slice(0, 8).map(a => `<div class="rep-flag"><b>${fmtDateShort(a.date)}</b> — ${a.reasons.map(escapeHtml).join('; ')}</div>`).join('')}</div>` : '';
  const detail = levelLine
    + cheatSection
    + (catBars ? `<div class="rep-section-label">Kuukauden jakauma</div>${catBars}` : '')
    + (goalLines ? `<div class="rep-section-label">Tavoitteet (tällä viikolla)</div>${goalLines}` : '')
    + (chLines ? `<div class="rep-section-label">Haasteet</div>${chLines}` : '')
    + recentSessionsSection(p)
    + kudosSection(p);
  return `
    <div class="player-row collapsible" data-name="${escapeHtml(p.username.toLowerCase())}">
      <button class="player-head" type="button" aria-expanded="false">
        <span class="player-head-main">
          <span class="player-name">${escapeHtml(p.username)}</span>
          <span class="player-stats">${statsLine}</span>
        </span>
        <span class="player-head-side">
          ${anomalies.length ? '<span class="player-flag" title="Epätavallisia kirjauksia">⚠️</span>' : ''}
          <span class="player-count">${s.monthCount} / kk</span>
          <span class="player-chevron">▾</span>
        </span>
      </button>
      <div class="player-detail" hidden>${detail || '<div class="coach-empty">Ei lisätietoja.</div>'}</div>
    </div>`;
}
function daysBetweenISO(aISO, bISO) {
  return Math.round((new Date(bISO + 'T00:00:00') - new Date(aISO + 'T00:00:00')) / 86400000);
}
function attentionList() {
  const today = todayISO();
  const thisMon = weekRangeISO().mondayISO;
  const lastMon = addDaysISO(thisMon, -7);
  const teamIds = new Set(coachTeams.map(t => t.id));
  const out = [];
  coachPlayers.filter(p => teamIds.has(p.team_id)).forEach(p => {
    const myLogs = coachLogs.filter(l => l.user_id === p.id);
    const thisWeek = myLogs.filter(l => l.date >= thisMon).length;
    if (thisWeek > 0) return; // treenannut tällä viikolla -> ei huomiota
    const lastWeek = myLogs.filter(l => l.date >= lastMon && l.date < thisMon).length;
    let lastDate = null;
    myLogs.forEach(l => { if (!lastDate || l.date > lastDate) lastDate = l.date; });
    const daysSince = lastDate ? daysBetweenISO(lastDate, today) : Infinity;
    let tag, sev, sortKey = daysSince;
    if (!lastDate)            { tag = 'Ei kirjauksia';   sev = 'high'; sortKey = 1e9; }
    else if (daysSince >= 14) { tag = 'Yli 2 viikkoa';   sev = 'high'; }
    else if (lastWeek >= 1)   { tag = 'Putki katkesi';   sev = 'med'; }
    else                      { tag = 'Ei tällä viikolla'; sev = 'med'; }
    const team = coachTeams.find(t => t.id === p.team_id);
    out.push({ p, tag, sev, sortKey, daysSince, lastDate, teamName: team ? team.name : '' });
  });
  out.sort((a, b) => b.sortKey - a.sortKey);
  return out;
}
function attentionCardHtml() {
  const totalPlayers = coachPlayers.filter(p => coachTeams.some(t => t.id === p.team_id)).length;
  if (!totalPlayers) return '';
  const list = attentionList();
  if (!list.length) {
    return `<div class="card attention-card">
      <div class="sec-head"><h2>Vaatii huomiota</h2></div>
      <div class="attention-ok">Kaikki pelaajat ovat treenanneet tällä viikolla 💪</div></div>`;
  }
  const rows = list.map(a => {
    const sub = a.lastDate
      ? `${escapeHtml(a.teamName)} · viimeksi ${a.daysSince} pv sitten`
      : `${escapeHtml(a.teamName)} · ei yhtään kirjausta`;
    return `
      <div class="attention-item">
        <div class="attention-row">
          <div class="attention-info">
            <div class="attention-name">${escapeHtml(a.p.username)}</div>
            <div class="attention-sub">${sub}</div>
          </div>
          <div class="attention-right">
            <span class="attention-tag ${a.sev}">${a.tag}</span>
            <button class="att-toggle" data-user="${a.p.id}" type="button">Kannusta</button>
          </div>
        </div>
        <div class="attention-kudos" data-user="${a.p.id}" hidden>${kudosSection(a.p)}</div>
      </div>`;
  }).join('');
  return `<div class="card attention-card">
    <div class="sec-head"><h2>Vaatii huomiota</h2><span class="hint">${list.length} ${list.length === 1 ? 'pelaaja' : 'pelaajaa'}</span></div>
    <div class="attention-list">${rows}</div>
  </div>`;
}
function renderCoachPlayers() {
  const view = document.getElementById('coachPlayers');
  if (!coachTeams.length) {
    view.innerHTML = '<div class="card"><div class="coach-empty">Ei vielä joukkueita. Luo joukkue "Joukkueet"-välilehdellä.</div></div>';
    return;
  }
  const totalPlayers = coachPlayers.filter(p => coachTeams.some(t => t.id === p.team_id)).length;
  let html = attentionCardHtml() + cheatSummaryCard();
  if (totalPlayers > 8) {
    html += `<div class="card rep-search-card"><input type="text" id="repSearch" class="ics-input" placeholder="Hae pelaajaa nimellä…" autocapitalize="none" spellcheck="false"></div>`;
  }
  coachTeams.forEach(t => {
    const players = coachPlayers.filter(p => p.team_id === t.id);
    html += `
      <div class="card coach-report-team">
        <div class="sec-head"><h2>${escapeHtml(t.name)}</h2><span class="hint">${players.length} ${players.length === 1 ? 'pelaaja' : 'pelaajaa'}</span></div>
        <div class="player-list">
          ${players.length ? players.map(richPlayerReport).join('') : '<div class="coach-empty">Ei pelaajia.</div>'}
        </div>
      </div>`;
  });
  view.innerHTML = html;
  wireCoachReports();
}
function wireCoachReports() {
  document.querySelectorAll('#coachPlayers .player-head').forEach(head => {
    head.onclick = () => {
      const expanded = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!expanded));
      const detail = head.parentElement.querySelector('.player-detail');
      if (detail) detail.hidden = expanded;
    };
  });
  const search = document.getElementById('repSearch');
  if (search) {
    search.oninput = () => {
      const q = search.value.trim().toLowerCase();
      document.querySelectorAll('#coachPlayers .coach-report-team').forEach(card => {
        let visible = 0;
        card.querySelectorAll('.player-row').forEach(row => {
          const match = !q || (row.dataset.name || '').includes(q);
          row.style.display = match ? '' : 'none';
          if (match) visible++;
        });
        card.style.display = visible ? '' : 'none';
      });
    };
  }
  document.querySelectorAll('#coachPlayers .kudos-preset').forEach(btn => {
    btn.onclick = () => sendKudos(btn.dataset.user, btn.dataset.text, btn.closest('.kudos'), btn);
  });
  document.querySelectorAll('#coachPlayers .kudos-send').forEach(btn => {
    btn.onclick = () => {
      const kudosEl = btn.closest('.kudos');
      const inp = kudosEl ? kudosEl.querySelector('.kudos-input') : null;
      sendKudos(btn.dataset.user, inp ? inp.value : '', kudosEl, btn, inp);
    };
  });
  document.querySelectorAll('#coachPlayers .att-toggle').forEach(btn => {
    btn.onclick = () => {
      const wrap = document.querySelector(`#coachPlayers .attention-kudos[data-user="${btn.dataset.user}"]`);
      if (!wrap) return;
      wrap.hidden = !wrap.hidden;
      btn.classList.toggle('open', !wrap.hidden);
    };
  });
  document.querySelectorAll('#coachPlayers .react-chip').forEach(chip => {
    chip.onclick = () => reactToLog(Number(chip.dataset.log), chip.dataset.emoji, chip.closest('.react-row'));
  });
}

async function reactToLog(logId, emoji, rowEl) {
  const current = coachReactionFor(logId);
  const remove = current === emoji;
  if (rowEl) rowEl.querySelectorAll('.react-chip').forEach(c => { c.disabled = true; });
  const { error } = remove ? await coachStore.removeReaction(logId) : await coachStore.setReaction(logId, emoji);
  if (rowEl) rowEl.querySelectorAll('.react-chip').forEach(c => { c.disabled = false; });
  if (error) { alert('Reaktio epäonnistui: ' + error.message); return; }
  coachReactions = coachReactions.filter(r => !(r.log_id === logId && r.coach_id === currentUser.id));
  if (!remove) coachReactions.push({ log_id: logId, emoji, coach_id: currentUser.id });
  if (rowEl) rowEl.querySelectorAll('.react-chip').forEach(c => {
    c.classList.toggle('active', !remove && c.dataset.emoji === emoji);
  });
}

async function sendKudos(userId, text, kudosEl, btn, inp) {
  const msg = (text || '').trim();
  if (!msg) { if (inp) inp.focus(); return; }
  if (btn) btn.disabled = true;
  const { error } = await coachStore.sendEncouragement(userId, msg);
  if (btn) btn.disabled = false;
  if (error) { alert('Lähetys epäonnistui: ' + error.message); return; }
  coachEncouragements.unshift({ id: Date.now(), user_id: userId, text: msg, created_at: new Date().toISOString() });
  if (kudosEl) {
    const last = kudosEl.querySelector('.kudos-last');
    if (last) last.textContent = `Viimeksi: "${msg}" (tänään)`;
  }
  if (inp) inp.value = '';
  showToast('Kannustus lähetetty');
}

/* ---- 2) JOUKKUEET (hallinta) ---- */
function boostBlockHtml(t) {
  const today = todayISO();
  const list = coachBoosts.filter(b => b.team_id === t.id);
  const rows = list.length ? list.map(b => {
    const active = today >= b.starts_on && today <= b.ends_on;
    const upcoming = b.starts_on > today;
    const tag = active ? '<span class="boost-tag live">Käynnissä</span>'
      : (upcoming ? '<span class="boost-tag soon">Tulossa</span>' : '<span class="boost-tag past">Päättynyt</span>');
    const label = b.label ? escapeHtml(b.label) : 'Tehostejakso';
    return `<div class="boost-row">
      <span class="boost-row-mult">${b.multiplier}×</span>
      <span class="boost-row-info"><b>${label}</b><span>${fmtDateShort(b.starts_on)} – ${fmtDateShort(b.ends_on)}</span></span>
      ${tag}
      <button class="boost-del" data-boost="${b.id}" type="button">Poista</button>
    </div>`;
  }).join('') : '<div class="coach-empty">Ei tehostejaksoja.</div>';
  return `
    <div class="boost-block">
      <div class="ch-form-label">Tehostejaksot (tupla XP & ⚽)</div>
      <div class="boost-list">${rows}</div>
      <div class="ch-sub-label">Lisää jakso — jakson päivinä (mukaan lukien) treeneistä ja haasteista saa kertoimen verran XP:tä ja jalkapalloja:</div>
      <input type="text" class="boost-label-input" data-team="${t.id}" maxlength="40" placeholder="Nimi, esim. Tuplaviikonloppu">
      <div class="coach-add-row boost-dates">
        <input type="date" class="boost-start-input" data-team="${t.id}">
        <input type="date" class="boost-end-input" data-team="${t.id}">
        <select class="boost-mult-input" data-team="${t.id}">
          <option value="2">2×</option>
          <option value="3">3×</option>
        </select>
        <button class="btn boost-add-btn" data-team="${t.id}" type="button">Lisää</button>
      </div>
      <div class="coach-msg boost-msg" data-team="${t.id}"></div>
    </div>`;
}
function renderCoachTeams() {  const view = document.getElementById('coachTeamsView');
  const isAdmin = !!currentUser.is_admin;
  let html = `
    <div class="card">
      <div class="sec-head"><h2>Joukkueet</h2>${isAdmin ? '<span class="hint">admin</span>' : ''}</div>
      ${isAdmin ? `
      <div class="coach-add-row">
        <input type="text" id="newTeamName" placeholder="Joukkueen nimi">
        <button class="btn coach-add-btn" id="createTeamBtn" type="button">Luo joukkue</button>
      </div>
      <div class="coach-msg" id="createTeamMsg"></div>` : ''}
      ${coachTeams.length ? '' : `<div class="coach-empty">${isAdmin ? 'Ei vielä joukkueita. Luo ensimmäinen yllä.' : 'Sinua ei ole vielä liitetty yhteenkään joukkueeseen. Pyydä admin liittämään sinut valmentajaksi.'}</div>`}
    </div>`;
  coachTeams.forEach(t => {
    const players = coachPlayers.filter(p => p.team_id === t.id);
    const coachRows = isAdmin ? (() => {
      const linked = coachTeamLinks.filter(l => l.team_id === t.id);
      const items = linked.map(l => {
        const acc = coachAccounts.find(a => a.id === l.coach_id);
        const name = acc ? acc.username : l.coach_id.slice(0, 8);
        return `<div class="coach-link-row"><span class="coach-link-name">${escapeHtml(name)}</span><button class="coach-link-del" data-team="${t.id}" data-coach="${l.coach_id}" type="button">Poista</button></div>`;
      }).join('');
      return `
        <div class="team-coaches-block">
          <div class="ch-form-label">Valmentajat</div>
          <div class="coach-link-list">${items || '<div class="coach-empty">Ei valmentajia. Liitä alla.</div>'}</div>
          <div class="coach-add-row">
            <input type="text" class="add-coach-input" data-team="${t.id}" placeholder="Valmentajan käyttäjänimi" autocapitalize="none" spellcheck="false">
            <button class="btn add-coach-btn" data-team="${t.id}" type="button">Liitä valmentaja</button>
          </div>
          <div class="coach-msg coach-link-msg" data-team="${t.id}"></div>
        </div>`;
    })() : '';
    html += `
      <div class="card">
        <div class="sec-head"><h2>${escapeHtml(t.name)}</h2><span class="hint">${players.length} ${players.length === 1 ? 'pelaaja' : 'pelaajaa'}</span></div>
        ${coachRows}
        <div class="coach-add-row">
          <input type="text" class="add-player-input" data-team="${t.id}" placeholder="Pelaajan käyttäjänimi" autocapitalize="none" spellcheck="false">
          <button class="btn add-player-btn" data-team="${t.id}" type="button">Lisää pelaaja</button>
        </div>
        <div class="coach-msg add-player-msg" data-team="${t.id}"></div>
        <div class="player-list">
          ${players.length ? players.map(p => `
            <div class="player-row"><div class="player-top">
              <span class="player-name">${escapeHtml(p.username)}</span>
              <span class="player-del-area" data-user="${p.id}"></span>
            </div></div>`).join('') : '<div class="coach-empty">Ei vielä pelaajia tässä joukkueessa.</div>'}
        </div>
        <div class="team-goal-block">
          <div class="ch-form-label">Joukkueen viikkotavoite</div>
          <div class="team-goal-status">Tällä viikolla yhteensä ${fmtHours(coachTeamWeekMin(t.id))}${t.weekly_goal_hours != null ? ` / ${fmtHours(Math.round(t.weekly_goal_hours * 60))}` : ' (ei tavoitetta)'}</div>
          <div class="coach-add-row">
            <input type="number" class="team-goal-input" data-team="${t.id}" min="0" step="0.5" placeholder="tuntia / viikko (tyhjä = poista)" value="${t.weekly_goal_hours != null ? t.weekly_goal_hours : ''}">
            <button class="btn team-goal-btn" data-team="${t.id}" type="button">Tallenna</button>
          </div>
          <div class="ch-sub-label">Jalkapallopalkinto (⚽) kun tavoite täyttyy — jokaiselle viikon osallistujalle (≥1 treeni). Oletus 150 ⚽. Lisäksi kiinteä +100 XP.</div>
          <div class="coach-add-row">
            <input type="number" class="team-goal-reward-input" data-team="${t.id}" min="0" step="10" placeholder="jalkapalloa / pelaaja (oletus 150)" value="${t.team_goal_reward != null ? t.team_goal_reward : 150}">
            <button class="btn team-goal-reward-btn" data-team="${t.id}" type="button">Tallenna palkinto</button>
          </div>
          <div class="coach-msg team-goal-msg" data-team="${t.id}"></div>
        </div>
        <div class="season-block">
          <div class="ch-form-label">Kausi (tasot/XP)</div>
          <div class="season-status">${t.season_start ? `Nykyinen kausi: ${t.season_name ? escapeHtml(t.season_name) + ' · ' : ''}alkanut ${fmtDateShort(t.season_start)}` : 'Ei kautta — XP lasketaan kaikkien aikojen treeneistä.'}</div>
          <input type="text" class="season-name-input" data-team="${t.id}" maxlength="40" placeholder="Kauden nimi, esim. Kevät 2026" value="${t.season_name ? escapeHtml(t.season_name) : ''}">
          <div class="ch-sub-label">Kauden alkupäivä (XP lasketaan tästä eteenpäin):</div>
          <input type="date" class="season-start-input" data-team="${t.id}" value="${t.season_start || ''}">
          <div class="coach-add-row season-btns">
            <button class="btn season-save-btn" data-team="${t.id}" type="button">Tallenna kausi</button>
            <button class="season-today-btn" data-team="${t.id}" type="button">Aloita tänään</button>
            <button class="season-clear-btn" data-team="${t.id}" type="button">Poista kausi</button>
          </div>
          <div class="coach-msg season-msg" data-team="${t.id}"></div>
        </div>
        <div class="football-block">
          <div class="ch-form-label">Jalkapallot (palkinnot)</div>
          <div class="football-status">Kynnys ${t.football_threshold_min != null ? t.football_threshold_min : 30} min · porras 50 / 120 / 200 ⚽ · päiväkatto ${t.football_daily_cap != null ? t.football_daily_cap : 400} ⚽</div>
          <div class="ch-sub-label">Kynnys (min) — yli kynnyksen 50, yli 2× 120, yli 3× 200 ⚽:</div>
          <div class="coach-add-row">
            <input type="number" class="fb-threshold-input" data-team="${t.id}" min="1" step="1" placeholder="esim. 30" value="${t.football_threshold_min != null ? t.football_threshold_min : 30}">
            <input type="number" class="fb-cap-input" data-team="${t.id}" min="0" step="50" placeholder="päiväkatto" value="${t.football_daily_cap != null ? t.football_daily_cap : 400}">
            <button class="btn fb-save-btn" data-team="${t.id}" type="button">Tallenna</button>
          </div>
          <div class="coach-msg fb-msg" data-team="${t.id}"></div>
        </div>
        ${boostBlockHtml(t)}
        <div class="ics-row">
          <div class="ch-form-label">Kalenteritilaus</div>
          <input type="text" class="ics-input" data-team="${t.id}" placeholder="iCal-osoite: https://… tai webcal://…" value="${t.ics_url ? escapeHtml(t.ics_url) : ''}" autocapitalize="none" spellcheck="false">
          <div class="ics-sub-label">Näytä vain tapahtumat, joiden otsikko sisältää (yksi per rivi — tyhjä tuo kaikki):</div>
          <textarea class="ch-desc ics-filter" data-team="${t.id}" rows="3" placeholder="P12 Ykkönen&#10;P12 Kakkonen&#10;Harjoitus">${t.ics_filter ? escapeHtml(t.ics_filter) : ''}</textarea>
          <div class="coach-add-row"><button class="btn ics-save-btn" data-team="${t.id}" type="button">Tallenna</button></div>
          <div class="coach-msg ics-msg" data-team="${t.id}"></div>
        </div>
      </div>`;
  });
  view.innerHTML = html;
  wireCoachTeams();
}
function wireCoachTeams() {
  const createBtn = document.getElementById('createTeamBtn');
  if (createBtn) createBtn.onclick = async () => {
    const input = document.getElementById('newTeamName');
    const msg = document.getElementById('createTeamMsg');
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    const { error } = await coachStore.createTeam(name);
    if (error) { if (msg) { msg.textContent = 'Joukkueen luonti epäonnistui: ' + error.message; msg.className = 'coach-msg error'; } return; }
    coachRefresh();
  };
  document.querySelectorAll('#coachTeamsView .add-coach-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const input = document.querySelector(`#coachTeamsView .add-coach-input[data-team="${teamId}"]`);
      const msg = document.querySelector(`#coachTeamsView .coach-link-msg[data-team="${teamId}"]`);
      const username = input.value.trim().toLowerCase();
      if (!username) { input.focus(); return; }
      btn.disabled = true;
      const { error } = await coachStore.assignCoach(username, teamId);
      btn.disabled = false;
      if (error) { msg.textContent = error.message; msg.className = 'coach-msg coach-link-msg error'; return; }
      coachRefresh();
    };
  });
  document.querySelectorAll('#coachTeamsView .coach-link-del').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team, coachId = btn.dataset.coach;
      if (!confirm('Poistetaanko valmentaja tästä joukkueesta?')) return;
      btn.disabled = true;
      const { error } = await coachStore.removeCoach(coachId, teamId);
      if (error) { btn.disabled = false; alert('Poisto epäonnistui: ' + error.message); return; }
      coachRefresh();
    };
  });
  document.querySelectorAll('#coachTeamsView .add-player-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const input = document.querySelector(`#coachTeamsView .add-player-input[data-team="${teamId}"]`);
      const msg = document.querySelector(`#coachTeamsView .add-player-msg[data-team="${teamId}"]`);
      const username = input.value.trim().toLowerCase();
      if (!username) { input.focus(); return; }
      const res = await coachStore.addPlayer(username, teamId);
      if (!res || !res.ok) { msg.textContent = (res && res.error) || 'Lisäys epäonnistui.'; msg.className = 'coach-msg add-player-msg error'; return; }
      coachRefresh();
    };
  });
  document.querySelectorAll('#coachTeamsView .player-del-area').forEach(setupPlayerRemove);
  document.querySelectorAll('#coachTeamsView .ics-save-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const input = document.querySelector(`#coachTeamsView .ics-input[data-team="${teamId}"]`);
      const msg = document.querySelector(`#coachTeamsView .ics-msg[data-team="${teamId}"]`);
      const url = input.value.trim();
      const filter = document.querySelector(`#coachTeamsView .ics-filter[data-team="${teamId}"]`).value;
      if (url && !/^(https?|webcal):\/\//i.test(url)) {
        msg.textContent = 'Osoitteen tulee alkaa https:// tai webcal://'; msg.className = 'coach-msg ics-msg error'; return;
      }
      const { error } = await coachStore.setTeamCalendar(teamId, url, filter);
      if (error) { msg.textContent = 'Tallennus epäonnistui: ' + error.message; msg.className = 'coach-msg ics-msg error'; return; }
      msg.textContent = url ? 'Kalenteritilaus tallennettu.' : 'Kalenteritilaus poistettu.';
      msg.className = 'coach-msg ics-msg ok';
    };
  });
  document.querySelectorAll('#coachTeamsView .team-goal-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const input = document.querySelector(`#coachTeamsView .team-goal-input[data-team="${teamId}"]`);
      const msg = document.querySelector(`#coachTeamsView .team-goal-msg[data-team="${teamId}"]`);
      const raw = input.value.trim();
      let hours = null;
      if (raw !== '') {
        hours = Number(raw.replace(',', '.'));
        if (!isFinite(hours) || hours < 0) { msg.textContent = 'Anna tuntimäärä numerona.'; msg.className = 'coach-msg team-goal-msg error'; return; }
      }
      btn.disabled = true;
      const { error } = await coachStore.setTeamGoal(teamId, hours);
      btn.disabled = false;
      if (error) { msg.textContent = 'Tallennus epäonnistui: ' + error.message; msg.className = 'coach-msg team-goal-msg error'; return; }
      const tt = coachTeams.find(t => t.id === teamId); if (tt) tt.weekly_goal_hours = hours;
      msg.textContent = hours == null ? 'Tavoite poistettu.' : `Tavoite asetettu: ${hoursShort(hours)} / viikko.`;
      msg.className = 'coach-msg team-goal-msg ok';
    };
  });
  document.querySelectorAll('#coachTeamsView .team-goal-reward-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const input = document.querySelector(`#coachTeamsView .team-goal-reward-input[data-team="${teamId}"]`);
      const msg = document.querySelector(`#coachTeamsView .team-goal-msg[data-team="${teamId}"]`);
      const reward = parseInt(input.value, 10);
      if (!isFinite(reward) || reward < 0) { msg.textContent = 'Anna palkinto numerona (0 = ei jalkapalloja).'; msg.className = 'coach-msg team-goal-msg error'; return; }
      btn.disabled = true;
      const { error } = await coachStore.setTeamGoalReward(teamId, reward);
      btn.disabled = false;
      if (error) { msg.textContent = 'Tallennus epäonnistui: ' + error.message; msg.className = 'coach-msg team-goal-msg error'; return; }
      const tt = coachTeams.find(t => t.id === teamId); if (tt) tt.team_goal_reward = reward;
      msg.textContent = `Palkinto asetettu: ${reward} ⚽ / osallistuja.`;
      msg.className = 'coach-msg team-goal-msg ok';
    };
  });
  document.querySelectorAll('#coachTeamsView .fb-save-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const msg = document.querySelector(`#coachTeamsView .fb-msg[data-team="${teamId}"]`);
      const threshold = parseInt(document.querySelector(`#coachTeamsView .fb-threshold-input[data-team="${teamId}"]`).value, 10);
      const cap = parseInt(document.querySelector(`#coachTeamsView .fb-cap-input[data-team="${teamId}"]`).value, 10);
      if (!isFinite(threshold) || threshold < 1) { msg.textContent = 'Kynnyksen pitää olla vähintään 1 min.'; msg.className = 'coach-msg fb-msg error'; return; }
      if (!isFinite(cap) || cap < 0) { msg.textContent = 'Päiväkaton pitää olla 0 tai suurempi.'; msg.className = 'coach-msg fb-msg error'; return; }
      const { error } = await coachStore.setTeamFootball(teamId, threshold, cap);
      if (error) { msg.textContent = 'Tallennus epäonnistui: ' + error.message; msg.className = 'coach-msg fb-msg error'; return; }
      const tt = coachTeams.find(t => t.id === teamId);
      if (tt) { tt.football_threshold_min = threshold; tt.football_daily_cap = cap; }
      msg.textContent = `Tallennettu: kynnys ${threshold} min, päiväkatto ${cap} ⚽.`;
      msg.className = 'coach-msg fb-msg ok';
    };
  });

  document.querySelectorAll('#coachTeamsView .boost-add-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const wrap = btn.closest('.boost-block');
      const msg = wrap.querySelector('.boost-msg');
      const label = wrap.querySelector('.boost-label-input').value.trim();
      const starts = wrap.querySelector('.boost-start-input').value;
      const ends = wrap.querySelector('.boost-end-input').value;
      const mult = parseInt(wrap.querySelector('.boost-mult-input').value, 10) || 2;
      if (!starts || !ends) { msg.textContent = 'Valitse alku- ja loppupäivä.'; msg.className = 'coach-msg boost-msg error'; return; }
      if (ends < starts) { msg.textContent = 'Loppupäivä ei voi olla ennen alkupäivää.'; msg.className = 'coach-msg boost-msg error'; return; }
      const { error } = await coachStore.createBoost(teamId, label, starts, ends, mult);
      if (error) { msg.textContent = 'Lisäys epäonnistui: ' + error.message; msg.className = 'coach-msg boost-msg error'; return; }
      coachRefresh();
    };
  });
  document.querySelectorAll('#coachTeamsView .boost-del').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Poistetaanko tehostejakso?')) return;
      const { error } = await coachStore.deleteBoost(btn.dataset.boost);
      if (error) { alert('Poisto epäonnistui: ' + error.message); return; }
      coachRefresh();
    };
  });

  const saveSeason = async (teamId, name, start, msg) => {
    const { error } = await coachStore.setTeamSeason(teamId, name, start);
    if (error) { msg.textContent = 'Tallennus epäonnistui: ' + error.message; msg.className = 'coach-msg season-msg error'; return; }
    const tt = coachTeams.find(t => t.id === teamId); if (tt) { tt.season_name = name || null; tt.season_start = start || null; }
    msg.textContent = start ? `Kausi tallennettu${name ? ' — ' + name : ''}.` : 'Kausi poistettu.';
    msg.className = 'coach-msg season-msg ok';
  };
  document.querySelectorAll('#coachTeamsView .season-save-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const name = document.querySelector(`#coachTeamsView .season-name-input[data-team="${teamId}"]`).value.trim();
      const start = document.querySelector(`#coachTeamsView .season-start-input[data-team="${teamId}"]`).value || null;
      const msg = document.querySelector(`#coachTeamsView .season-msg[data-team="${teamId}"]`);
      if (!start) { msg.textContent = 'Valitse kauden alkupäivä (tai poista kausi).'; msg.className = 'coach-msg season-msg error'; return; }
      await saveSeason(teamId, name, start, msg);
    };
  });
  document.querySelectorAll('#coachTeamsView .season-today-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const name = document.querySelector(`#coachTeamsView .season-name-input[data-team="${teamId}"]`).value.trim();
      const startEl = document.querySelector(`#coachTeamsView .season-start-input[data-team="${teamId}"]`);
      startEl.value = todayISO();
      const msg = document.querySelector(`#coachTeamsView .season-msg[data-team="${teamId}"]`);
      if (!confirm('Aloitetaanko uusi kausi tästä päivästä? Pelaajien XP lasketaan tästä eteenpäin.')) return;
      await saveSeason(teamId, name, todayISO(), msg);
    };
  });
  document.querySelectorAll('#coachTeamsView .season-clear-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const msg = document.querySelector(`#coachTeamsView .season-msg[data-team="${teamId}"]`);
      document.querySelector(`#coachTeamsView .season-start-input[data-team="${teamId}"]`).value = '';
      await saveSeason(teamId, '', null, msg);
    };
  });
}
function setupPlayerRemove(area) {
  const userId = area.dataset.user;
  area.innerHTML = '<button class="del" title="Poista joukkueesta" aria-label="Poista pelaaja joukkueesta">×</button>';
  area.querySelector('.del').onclick = () => {
    area.innerHTML = '<span class="confirm"><button class="confirm-yes" type="button">Poista</button><button class="confirm-no" type="button">Peru</button></span>';
    area.querySelector('.confirm-yes').onclick = async () => {
      const res = await coachStore.removePlayer(userId);
      if (!res || !res.ok) { alert((res && res.error) || 'Poisto epäonnistui.'); return; }
      coachRefresh();
    };
    area.querySelector('.confirm-no').onclick = () => setupPlayerRemove(area);
  };
}

/* ---- 3) HAASTEET ---- */
function renderCoachChallenges() {
  const view = document.getElementById('coachChallengesView');
  if (!coachTeams.length) {
    view.innerHTML = '<div class="card"><div class="coach-empty">Luo ensin joukkue "Joukkueet"-välilehdellä.</div></div>';
    return;
  }
  let html = '';
  coachTeams.forEach(t => {
    const chs = coachChallenges.filter(ch => ch.team_id === t.id);
    const players = coachPlayers.filter(p => p.team_id === t.id);
    const cur = chs.map(ch => {
      const c = catById(ch.category);
      const isOnce = ch.hours == null;
      const targetPlayer = ch.user_id ? players.find(p => p.id === ch.user_id) : null;
      const scope = ch.user_id
        ? `Henkilökohtainen — ${targetPlayer ? escapeHtml(targetPlayer.username) : 'poistettu pelaaja'}`
        : 'Koko joukkue';
      const dueText = ch.due_date ? `${fmtDateShort(ch.due_date)} mennessä` : null;
      let metaLabel = isOnce ? (dueText || 'Kertasuoritus') : (ch.due_date ? `${hoursShort(ch.hours)} · ${dueText}` : `${hoursShort(ch.hours)} / vko`);
      let doneLine = '';
      if (isOnce) {
        if (ch.user_id) {
          const done = coachCompletions.some(cc => cc.challenge_id === ch.id && cc.user_id === ch.user_id && cc.week_start === challengeKey(ch));
          doneLine = `<div class="ch-done-list">${done ? 'Suoritettu' : 'Ei vielä suoritettu'}</div>`;
        } else {
          const doneUsers = players.filter(p => coachCompletions.some(cc => cc.challenge_id === ch.id && cc.user_id === p.id && cc.week_start === challengeKey(ch)));
          metaLabel = `${dueText || 'Kertasuoritus'} · ${doneUsers.length}/${players.length} tehnyt`;
          doneLine = `<div class="ch-done-list">${doneUsers.length ? 'Tehnyt: ' + doneUsers.map(u => escapeHtml(u.username)).join(', ') : 'Ei vielä suorituksia'}</div>`;
        }
      }
      return `
        <div class="ch-item">
          <div class="ch-item-top">
            <span class="goal-row-label"><span class="dot" style="background:${c.color}"></span>${c.label}<span class="goal-row-target">${metaLabel}</span><span class="ch-reward-tag">⚽ ${ch.football_reward == null ? 250 : ch.football_reward}</span></span>
            <span class="ch-del-area" data-id="${ch.id}"></span>
          </div>
          <div class="ch-scope">${scope}</div>
          ${ch.description ? `<div class="challenge-desc">${escapeHtml(ch.description)}</div>` : ''}
          ${doneLine}
        </div>`;
    }).join('');
    const targetChips = `<button class="chip ch-target-chip" data-team="${t.id}" data-target="team" type="button" aria-pressed="true">Koko joukkue</button>`
      + players.map(p => `<button class="chip ch-target-chip" data-team="${t.id}" data-target="${p.id}" data-name="${escapeHtml(p.username.toLowerCase())}" type="button" aria-pressed="false">${escapeHtml(p.username)}</button>`).join('');
    html += `
      <div class="card">
        <div class="sec-head"><h2>${escapeHtml(t.name)}</h2><span class="hint">${chs.length} ${chs.length === 1 ? 'haaste' : 'haastetta'}</span></div>
        ${cur ? `<div class="ch-list">${cur}</div>` : '<div class="coach-empty">Ei haasteita. Aseta ensimmäinen alla.</div>'}
        <div class="ch-form" data-team="${t.id}">
          <div class="ch-form-label">Uusi haaste</div>
          <div class="ch-type" data-team="${t.id}">
            <button class="ch-type-btn active" data-team="${t.id}" data-kind="time" type="button">Aikatavoite</button>
            <button class="ch-type-btn" data-team="${t.id}" data-kind="once" type="button">Kertasuoritus</button>
          </div>
          <div class="ch-sub-label">Kenelle?</div>
          <button class="ch-target-summary" data-team="${t.id}" type="button">Koko joukkue</button>
          <div class="ch-target-panel" data-team="${t.id}" hidden>
            ${players.length > 8 ? `<input type="text" class="ch-target-search" data-team="${t.id}" placeholder="Hae pelaajaa…" autocapitalize="none" spellcheck="false">` : ''}
            <div class="ch-targets chips" data-team="${t.id}">${targetChips}</div>
          </div>
          <div class="chip-groups ch-cats" data-team="${t.id}"></div>
          <textarea class="ch-desc" data-team="${t.id}" rows="2" maxlength="160" placeholder="Lisätietoja, esim. pompottele palloa 100 kertaa jaloilla"></textarea>
          <input type="number" class="ch-hours" data-team="${t.id}" min="0.25" step="0.25" placeholder="tuntia / viikko (mikä tahansa määrä)">
          <div class="ch-sub-label">Määräpäivä (valinnainen — tyhjä = viikoittainen haaste):</div>
          <input type="date" class="ch-due" data-team="${t.id}">
          <div class="ch-sub-label">Palkinto ⚽ (tyhjä = oletus 250):</div>
          <input type="number" class="ch-reward" data-team="${t.id}" min="0" step="10" placeholder="250">
          <div class="coach-add-row"><button class="btn ch-add-btn" data-team="${t.id}" type="button">Aseta haaste</button></div>
        </div>
      </div>`;
  });
  view.innerHTML = html;
  wireCoachChallenges();
}
function wireCoachChallenges() {
  document.querySelectorAll('#coachChallengesView .ch-cats').forEach(box => {
    const teamId = box.dataset.team;
    const cats = CATEGORIES.filter(c => c.id !== 'muu');
    if (!challengeSetupCat[teamId]) challengeSetupCat[teamId] = cats[0].id;
    const setPressed = () => box.querySelectorAll('.ch-chip').forEach(x =>
      x.setAttribute('aria-pressed', String(x.dataset.cat === challengeSetupCat[teamId])));
    [...new Set(cats.map(c => c.group))].forEach(g => {
      const wrap = document.createElement('div'); wrap.className = 'chip-group';
      const lbl = document.createElement('div'); lbl.className = 'chip-group-label'; lbl.textContent = g;
      const row = document.createElement('div'); row.className = 'chips';
      cats.filter(c => c.group === g).forEach(c => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip ch-chip'; b.dataset.cat = c.id;
        b.setAttribute('aria-pressed', String(c.id === challengeSetupCat[teamId]));
        b.innerHTML = `<span class="dot" style="background:${c.color}"></span>${c.label}`;
        b.onclick = () => { challengeSetupCat[teamId] = c.id; setPressed(); };
        row.appendChild(b);
      });
      wrap.appendChild(lbl); wrap.appendChild(row); box.appendChild(wrap);
    });
  });
  document.querySelectorAll('#coachChallengesView .ch-type').forEach(box => {
    const teamId = box.dataset.team;
    if (!challengeKind[teamId]) challengeKind[teamId] = 'time';
    const hoursInput = document.querySelector(`#coachChallengesView .ch-hours[data-team="${teamId}"]`);
    const apply = () => {
      box.querySelectorAll('.ch-type-btn').forEach(b => b.classList.toggle('active', b.dataset.kind === challengeKind[teamId]));
      hoursInput.style.display = challengeKind[teamId] === 'once' ? 'none' : '';
    };
    box.querySelectorAll('.ch-type-btn').forEach(b => {
      b.onclick = () => { challengeKind[teamId] = b.dataset.kind; apply(); };
    });
    apply();
  });
  document.querySelectorAll('#coachChallengesView .ch-target-summary').forEach(btn => {
    const teamId = btn.dataset.team;
    const panel = document.querySelector(`#coachChallengesView .ch-target-panel[data-team="${teamId}"]`);
    btn.onclick = () => { panel.hidden = !panel.hidden; btn.classList.toggle('open', !panel.hidden); };
  });
  document.querySelectorAll('#coachChallengesView .ch-target-search').forEach(inp => {
    const teamId = inp.dataset.team;
    inp.oninput = () => {
      const q = inp.value.trim().toLowerCase();
      document.querySelectorAll(`#coachChallengesView .ch-targets[data-team="${teamId}"] .ch-target-chip[data-name]`).forEach(chip => {
        chip.style.display = (!q || chip.dataset.name.includes(q)) ? '' : 'none';
      });
    };
  });
  document.querySelectorAll('#coachChallengesView .ch-targets').forEach(box => {
    const teamId = box.dataset.team;
    if (!challengeTargets[teamId]) challengeTargets[teamId] = 'team';
    const summary = document.querySelector(`#coachChallengesView .ch-target-summary[data-team="${teamId}"]`);
    const apply = () => {
      box.querySelectorAll('.ch-target-chip').forEach(chip => {
        const tg = chip.dataset.target;
        const sel = challengeTargets[teamId] === 'team'
          ? (tg === 'team')
          : (tg !== 'team' && challengeTargets[teamId].has(tg));
        chip.setAttribute('aria-pressed', String(sel));
      });
      if (summary) summary.textContent = challengeTargets[teamId] === 'team'
        ? 'Koko joukkue'
        : `${challengeTargets[teamId].size} ${challengeTargets[teamId].size === 1 ? 'pelaaja' : 'pelaajaa'} valittu`;
    };
    box.querySelectorAll('.ch-target-chip').forEach(chip => {
      chip.onclick = () => {
        const tg = chip.dataset.target;
        if (tg === 'team') {
          challengeTargets[teamId] = 'team';
        } else {
          if (!(challengeTargets[teamId] instanceof Set)) challengeTargets[teamId] = new Set();
          const set = challengeTargets[teamId];
          if (set.has(tg)) set.delete(tg); else set.add(tg);
          if (set.size === 0) challengeTargets[teamId] = 'team';
        }
        apply();
      };
    });
    apply();
  });
  document.querySelectorAll('#coachChallengesView .ch-add-btn').forEach(btn => {
    btn.onclick = async () => {
      const teamId = btn.dataset.team;
      const kind = challengeKind[teamId] || 'time';
      const descEl = document.querySelector(`#coachChallengesView .ch-desc[data-team="${teamId}"]`);
      const desc = descEl.value.trim();
      let hours = null;
      if (kind === 'time') {
        const hoursInput = document.querySelector(`#coachChallengesView .ch-hours[data-team="${teamId}"]`);
        const hrs = parseFloat(hoursInput.value);
        if (!hrs || hrs <= 0) { hoursInput.focus(); return; }
        hours = hrs;
      } else if (!desc) {
        descEl.focus(); return;   // kertasuoritus tarvitsee ohjeen
      }
      const dueDate = document.querySelector(`#coachChallengesView .ch-due[data-team="${teamId}"]`).value || null;
      const rewardEl = document.querySelector(`#coachChallengesView .ch-reward[data-team="${teamId}"]`);
      let reward = rewardEl ? parseInt(rewardEl.value, 10) : NaN;
      if (!isFinite(reward) || reward < 0) reward = undefined;  // tyhjä → DB-oletus 250
      const target = challengeTargets[teamId] || 'team';
      const targets = target === 'team' ? [null] : [...target];
      for (const uid of targets) {
        const { error } = await coachStore.createChallenge(teamId, challengeSetupCat[teamId], hours, desc, uid, dueDate, reward);
        if (error) { alert('Haasteen luonti epäonnistui: ' + error.message); return; }
      }
      challengeTargets[teamId] = 'team';
      coachRefresh();
    };
  });
  document.querySelectorAll('#coachChallengesView .ch-del-area').forEach(setupChallengeRemove);
}
function setupChallengeRemove(area) {
  const id = area.dataset.id;
  area.innerHTML = '<button class="del" title="Poista haaste" aria-label="Poista haaste">×</button>';
  area.querySelector('.del').onclick = () => {
    area.innerHTML = '<span class="confirm"><button class="confirm-yes" type="button">Poista</button><button class="confirm-no" type="button">Peru</button></span>';
    area.querySelector('.confirm-yes').onclick = async () => {
      const { error } = await coachStore.deleteChallenge(Number(id));
      if (error) { alert('Poisto epäonnistui: ' + error.message); return; }
      coachRefresh();
    };
    area.querySelector('.confirm-no').onclick = () => setupChallengeRemove(area);
  };
}

/* ---- Käynnistys ---- */
async function boot() {
  document.getElementById('authSubmit').onclick = submitAuth;
  document.getElementById('authToggle').onclick = () => setAuthMode(authMode === 'login' ? 'register' : 'login');
  document.getElementById('authPass').addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); });
  const authConfirmEl = document.getElementById('authConfirm');
  if (authConfirmEl) authConfirmEl.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); });
  document.getElementById('logoutBtn').onclick = doSignOut;
  document.getElementById('coachLogoutBtn').onclick = doSignOut;

  const { data: { session } } = await sb.auth.getSession();
  if (!session) { showAuth(); return; }
  currentUser = await loadProfile(session.user);
  if (!currentUser) { showAuth(); return; }
  if (currentUser.role === 'coach' || currentUser.is_admin) startCoach(); else startPlayer();
}

boot();

/* ---- Teema (vaalea / tumma) ---- */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('theme', t); } catch (e) {}
  document.querySelectorAll('[data-theme-toggle]').forEach(b => { b.textContent = (t === 'dark' ? '☀️' : '🌙'); });
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'dark' ? '#0F1512' : '#F1F3EF');
}
function currentTheme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
document.querySelectorAll('[data-theme-toggle]').forEach(b => {
  b.textContent = (currentTheme() === 'dark' ? '☀️' : '🌙');
  b.onclick = () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
});
