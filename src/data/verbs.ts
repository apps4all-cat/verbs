/**
 * Els 99 verbs de la «List of irregular verbs» de 2n d'ESO (IMO20ESO01). Cada forma és una llista:
 * la primera és la que surt al full i les altres també es donen per bones (was/were, burnt/burned…).
 */
export interface Verb {
  id: string;
  base: string;
  past: string[];
  pp: string[];
  /** traducció del full */
  ca: string;
  /** traducció al castellà (l'usuari tria l'idioma a les opcions) */
  es: string;
  emoji: string;
  /** frase amb ___ per al past simple i per al past participle (mode «En context») */
  ctx: [string, string];
  /** com es pronuncia diferent tot i escriure's igual (read /red/) */
  note?: string;
}

export type FormKey = 'base' | 'past' | 'pp';
export type Family = 'AAA' | 'ABB' | 'ABA' | 'AAB' | 'ABC';

/** Idioma de les traduccions: el del full (català) o el castellà. */
export type Lang = 'ca' | 'es';

export const LANG_NAME: Record<Lang, string> = { ca: 'català', es: 'castellà' };

let lang: Lang = 'ca';

/** L'estableix ProgressProvider a partir de les opcions; la resta de l'app només llegeix meaning(). */
export function setLang(l: Lang) {
  lang = l;
}

export function currentLang(): Lang {
  return lang;
}

/** Traducció del verb en l'idioma triat. */
export function meaning(v: Verb): string {
  return lang === 'es' ? v.es : v.ca;
}

/** «En català» o «En castellà». */
export function meaningLabel(): string {
  return `En ${LANG_NAME[lang]}`;
}

export const FORM_LABEL: Record<FormKey, string> = { base: 'Base form', past: 'Past simple', pp: 'Past participle' };

/** Traduccions al castellà, amb el mateix sentit que les del full. */
const ES: Record<string, string> = {
  be: 'ser, estar',
  beat: 'golpear, ganar',
  begin: 'empezar, comenzar',
  bend: 'doblar',
  bet: 'apostar',
  bite: 'morder',
  bleed: 'sangrar',
  blow: 'soplar',
  break: 'romper',
  bring: 'traer',
  build: 'construir',
  burn: 'quemar',
  buy: 'comprar',
  catch: 'coger, atrapar',
  choose: 'elegir, escoger',
  come: 'venir',
  cost: 'costar',
  cut: 'cortar',
  dig: 'cavar',
  do: 'hacer',
  draw: 'dibujar',
  dream: 'soñar',
  drink: 'beber',
  drive: 'conducir',
  eat: 'comer',
  fall: 'caer(se)',
  feed: 'alimentar, dar de comer',
  feel: 'sentir(se)',
  fight: 'luchar, pelear',
  find: 'encontrar',
  fly: 'volar',
  forget: 'olvidar',
  forgive: 'perdonar',
  freeze: 'congelar(se)',
  get: 'conseguir, llegar',
  give: 'dar',
  go: 'ir',
  grow: 'crecer, cultivar',
  hang: 'colgar',
  have: 'tener',
  hear: 'oír',
  hide: 'esconder(se)',
  hit: 'golpear, pegar',
  hold: 'sujetar, sostener',
  hurt: 'herir, hacer daño',
  keep: 'guardar, mantener',
  know: 'saber, conocer',
  lay: 'poner, extender',
  lead: 'dirigir, guiar',
  learn: 'aprender',
  leave: 'dejar, irse',
  lend: 'prestar',
  let: 'permitir, dejar',
  lie: 'tumbarse',
  light: 'encender',
  lose: 'perder',
  make: 'hacer, fabricar',
  mean: 'significar, querer decir',
  meet: 'conocer, quedar',
  pay: 'pagar',
  put: 'poner',
  read: 'leer',
  ride: 'montar',
  ring: 'llamar, sonar',
  rise: 'elevarse, levantarse',
  run: 'correr',
  say: 'decir',
  see: 'ver',
  sell: 'vender',
  send: 'enviar, mandar',
  set: 'colocar',
  shake: 'sacudir, agitar',
  shine: 'brillar',
  shoot: 'disparar, chutar',
  show: 'mostrar, enseñar',
  shut: 'cerrar, callar',
  sing: 'cantar',
  sink: 'hundir(se)',
  sit: 'sentarse',
  sleep: 'dormir',
  smell: 'oler',
  speak: 'hablar',
  spell: 'deletrear',
  spend: 'gastar, pasar tiempo',
  stand: 'estar de pie',
  steal: 'robar',
  stick: 'pegar, enganchar',
  sweep: 'barrer',
  swim: 'nadar',
  take: 'coger, llevar',
  teach: 'enseñar',
  tear: 'rasgar, romper',
  tell: 'contar, decir',
  think: 'pensar',
  throw: 'lanzar, tirar',
  understand: 'entender',
  wear: 'llevar puesto',
  win: 'ganar',
  write: 'escribir',
};

const V = (
  base: string,
  past: string,
  pp: string,
  ca: string,
  emoji: string,
  ctx: [string, string],
  note?: string,
): Verb => ({ id: base, base, past: past.split('/'), pp: pp.split('/'), ca, es: ES[base], emoji, ctx, note });

export const VERBS: Verb[] = [
  V('be', 'was/were', 'been', 'ser, estar', '🙋', ['I ___ at home all day yesterday.', 'Have you ever ___ to Italy?']),
  V('beat', 'beat', 'beaten', 'donar cops, guanyar', '🥊', ['Barça ___ Madrid 3–0 last night.', 'Nobody has ever ___ me at chess.']),
  V('begin', 'began', 'begun', 'començar', '🏁', ['The film ___ at nine o’clock.', 'Hurry up! The class has already ___.']),
  V('bend', 'bent', 'bent', 'doblegar', '🧘', ['He ___ down to pick up the coin.', 'Someone has ___ my ruler!']),
  V('bet', 'bet', 'bet', 'apostar', '🎰', ['I ___ you five euros that we would win.', 'Have you ever ___ money on a game?']),
  V('bite', 'bit', 'bitten', 'mossegar', '🦈', ['A mosquito ___ me last night.', 'Has the dog ever ___ anyone?']),
  V('bleed', 'bled', 'bled', 'sagnar', '🩸', ['His nose ___ after the accident.', 'The cut has ___ a lot.']),
  V('blow', 'blew', 'blown', 'bufar', '🌬️', ['The wind ___ very hard last night.', 'She has ___ out all the candles.']),
  V('break', 'broke', 'broken', 'trencar', '💔', ['I ___ my arm when I was seven.', 'Who has ___ the window?']),
  V('bring', 'brought', 'brought', 'portar', '🎁', ['She ___ a cake to the party yesterday.', 'Have you ___ your PE kit today?']),
  V('build', 'built', 'built', 'construir', '🏗️', ['The Romans ___ roads all over Europe.', 'They have ___ a new sports centre in our town.']),
  V('burn', 'burned/burnt', 'burned/burnt', 'cremar', '🔥', ['I ___ the toast this morning.', 'Ouch! I have ___ my hand.']),
  V('buy', 'bought', 'bought', 'comprar', '🛒', ['We ___ a new TV last week.', 'I have just ___ tickets for the concert!']),
  V('catch', 'caught', 'caught', 'agafar', '🧤', ['The goalkeeper ___ the ball easily.', 'The police have ___ the thief!']),
  V('choose', 'chose', 'chosen', 'triar', '👉', ['I ___ the blue T-shirt.', 'Have you ___ a costume for the party?']),
  V('come', 'came', 'come', 'venir', '🚶', ['My cousins ___ to visit us last weekend.', 'Spring has ___!']),
  V('cost', 'cost', 'cost', 'costar', '💶', ['My new trainers ___ 80 euros.', 'The trip has ___ more than we expected.']),
  V('cut', 'cut', 'cut', 'tallar', '✂️', ['Yesterday I ___ my finger with a knife.', 'Have you ever ___ your own hair?']),
  V('dig', 'dug', 'dug', 'cavar', '⛏️', ['The dog ___ a hole in the garden.', 'They have ___ a big hole for the pool.']),
  V('do', 'did', 'done', 'fer', '✅', ['I ___ my homework after dinner.', 'Have you ___ the exercises?']),
  V('draw', 'drew', 'drawn', 'dibuixar', '🎨', ['She ___ a beautiful horse.', 'I have ___ a map of the island.']),
  V('dream', 'dreamed/dreamt', 'dreamed/dreamt', 'somiar', '💭', ['Last night I ___ about dinosaurs.', 'I have always ___ of visiting Japan.']),
  V('drink', 'drank', 'drunk', 'beure', '🥤', ['I ___ a big glass of water after the match.', 'Have you ___ all the milk?']),
  V('drive', 'drove', 'driven', 'conduir', '🚗', ['Dad ___ us to the airport.', 'Have you ever ___ a go-kart?']),
  V('eat', 'ate', 'eaten', 'menjar', '🍕', ['We ___ paella on Sunday.', 'Have you ever ___ sushi?']),
  V('fall', 'fell', 'fallen', 'caure', '🍂', ['I ___ off my bike yesterday.', 'Oh no, my phone has ___ into the water!']),
  V('feed', 'fed', 'fed', 'alimentar', '🐟', ['I ___ the cat before school.', 'Have you ___ the fish today?']),
  V('feel', 'felt', 'felt', 'sentir-se', '😊', ['I ___ nervous before the exam.', 'I have never ___ so happy!']),
  V('fight', 'fought', 'fought', 'lluitar', '⚔️', ['The two cats ___ in the garden last night.', 'They have ___ about the same thing for years.']),
  V('find', 'found', 'found', 'trobar', '🔍', ['I ___ ten euros in the street!', 'Have you ___ your glasses?']),
  V('fly', 'flew', 'flown', 'volar', '✈️', ['We ___ to London last summer.', 'Have you ever ___ in a helicopter?']),
  V('forget', 'forgot', 'forgotten', 'oblidar', '🤦', ['I ___ my homework at home.', 'Have you ___ my birthday again?']),
  V('forgive', 'forgave', 'forgiven', 'perdonar', '🤝', ['She ___ me for breaking her phone.', 'Have you ___ him?']),
  V('freeze', 'froze', 'frozen', 'congelar(-se)', '🥶', ['It was so cold that the lake ___.', 'The water in the pipes has ___.']),
  V('get', 'got', 'got/gotten', 'aconseguir, arribar', '📦', ['I ___ a new phone for my birthday.', 'Have you ___ my message?']),
  V('give', 'gave', 'given', 'donar', '🫴', ['My aunt ___ me a book for Christmas.', 'Have you ___ the teacher your homework?']),
  V('go', 'went', 'gone', 'anar', '🏃', ['We ___ to the beach last Sunday.', 'Where is Anna? She has ___ home.']),
  V('grow', 'grew', 'grown', 'créixer, cultivar', '🌱', ['These tomatoes ___ in our garden.', 'Wow, you have ___ a lot!']),
  V('hang', 'hanged/hung', 'hanged/hung', 'penjar', '🧥', ['She ___ her coat behind the door.', 'Have you ___ the washing outside?']),
  V('have', 'had', 'had', 'tenir', '🎒', ['We ___ pizza for dinner last night.', 'I have ___ a cold all week.']),
  V('hear', 'heard', 'heard', 'sentir', '👂', ['I ___ a strange noise in the night.', 'Have you ___ the news?']),
  V('hide', 'hid', 'hidden', 'amagar(-se)', '🙈', ['The kids ___ behind the sofa.', 'Where have you ___ the chocolate?']),
  V('hit', 'hit', 'hit', 'colpejar, pegar', '🏏', ['The ball ___ the window last night.', 'Ouch! I have ___ my head on the door.']),
  V('hold', 'held', 'held', 'subjectar', '✊', ['The baby ___ my finger.', 'I have never ___ a snake.']),
  V('hurt', 'hurt', 'hurt', 'ferir, fer mal', '🤕', ['I fell off my bike and ___ my knee.', 'Have you ___ yourself?']),
  V('keep', 'kept', 'kept', 'guardar, mantenir', '🔐', ['He ___ the secret for years.', 'I have ___ all my old toys.']),
  V('know', 'knew', 'known', 'saber, conèixer', '🧠', ['I ___ the answer, but I forgot it!', 'I have ___ Marc since primary school.']),
  V('lay', 'laid', 'laid', 'posar, estendre', '🥚', ['She ___ the baby on the bed.', 'The hen has ___ three eggs today.']),
  V('lead', 'led', 'led', 'dirigir', '🧭', ['Our captain ___ the team to victory.', 'She has ___ the group since September.']),
  V('learn', 'learnt/learned', 'learnt/learned', 'aprendre', '📚', ['I ___ to swim when I was five.', 'We have ___ a lot of new words this week.']),
  V('leave', 'left', 'left', 'deixar, marxar', '🚪', ['We ___ home at eight o’clock.', 'The train has already ___.']),
  V('lend', 'lent', 'lent', 'prestar', '🤲', ['My friend ___ me his bike yesterday.', 'I have ___ my notes to Laura.']),
  V('let', 'let', 'let', 'permetre, deixar', '🚦', ['My parents ___ me go to the party last Saturday.', 'The teacher has ___ us use our phones today.']),
  V('lie', 'lay', 'lain', 'estirar-se', '🛌', ['I ___ on the beach all afternoon.', 'The dog has ___ in front of the fire all day.']),
  V('light', 'lit', 'lit', 'encendre', '🕯️', ['Dad ___ the candles on my birthday cake.', 'Have you ___ the fire?']),
  V('lose', 'lost', 'lost', 'perdre', '😩', ['Our team ___ the match on Sunday.', 'I have ___ my keys again!']),
  V('make', 'made', 'made', 'fer, fabricar', '🧁', ['We ___ a cake for Mum’s birthday.', 'Have you ___ your bed?']),
  V('mean', 'meant', 'meant', 'significar, voler dir', '💡', ['Sorry, I ___ Tuesday, not Thursday.', 'I have always ___ to learn the guitar.']),
  V('meet', 'met', 'met', 'conèixer, reunir-se', '👋', ['I ___ my best friend at primary school.', 'Have you ___ the new student?']),
  V('pay', 'paid', 'paid', 'pagar', '💳', ['I ___ for the pizzas last time.', 'Have you ___ for the school trip?']),
  V('put', 'put', 'put', 'posar', '📥', ['She ___ her keys on the table an hour ago.', 'Where have you ___ my phone?']),
  V('read', 'read', 'read', 'llegir', '📖', ['I ___ a great book last summer.', 'Have you ever ___ Harry Potter?'], 'S’escriu igual però es pronuncia /riːd/ – /red/ – /red/.'),
  V('ride', 'rode', 'ridden', 'muntar, pujar', '🚲', ['I ___ my bike to school yesterday.', 'Have you ever ___ a horse?']),
  V('ring', 'rang', 'rung', 'trucar, sonar', '🔔', ['The phone ___ in the middle of the night.', 'Has the bell ___ yet?']),
  V('rise', 'rose', 'risen', 'enlairar, aixecar-se', '🌅', ['The sun ___ at seven this morning.', 'Prices have ___ a lot this year.']),
  V('run', 'ran', 'run', 'córrer', '🏃‍♀️', ['I ___ five kilometres yesterday.', 'Have you ever ___ a marathon?']),
  V('say', 'said', 'said', 'dir', '💬', ['She ___ “hello” and smiled.', 'I have ___ it a hundred times!']),
  V('see', 'saw', 'seen', 'veure', '👀', ['I ___ a great film last night.', 'Have you ever ___ a ghost?']),
  V('sell', 'sold', 'sold', 'vendre', '🏷️', ['They ___ their old car last month.', 'The shop has ___ all the tickets.']),
  V('send', 'sent', 'sent', 'enviar', '📨', ['I ___ you a message last night.', 'Have you ___ the email yet?']),
  V('set', 'set', 'set', 'col·locar', '⏰', ['We ___ the table for dinner at eight.', 'Have you ___ your alarm for tomorrow?']),
  V('shake', 'shook', 'shaken', 'sacsejar', '🫨', ['He ___ my hand and smiled.', 'Have you ___ the bottle?']),
  V('shine', 'shone', 'shone', 'brillar', '☀️', ['The sun ___ all day yesterday.', 'The sun has ___ all week.']),
  V('shoot', 'shot', 'shot', 'disparar, xutar', '⚽', ['He ___ and scored a great goal!', 'They have ___ a new film in Barcelona.']),
  V('show', 'showed', 'shown', 'mostrar', '📸', ['He ___ me his new skateboard.', 'Have you ___ the photos to Grandma?']),
  V('shut', 'shut', 'shut', 'tancar, callar', '🔒', ['He ___ the door and left.', 'The shop has ___ for the holidays.']),
  V('sing', 'sang', 'sung', 'cantar', '🎤', ['We ___ “Happy Birthday” to Joan.', 'Have you ever ___ karaoke?']),
  V('sink', 'sank', 'sunk', 'enfonsar-se', '🚢', ['The Titanic ___ in 1912.', 'The boat has ___ to the bottom of the lake.']),
  V('sit', 'sat', 'sat', 'seure', '🪑', ['We ___ next to the window.', 'I have ___ here for hours.']),
  V('sleep', 'slept', 'slept', 'dormir', '😴', ['I ___ ten hours last night!', 'Have you ___ well?']),
  V('smell', 'smelt/smelled', 'smelt/smelled', 'olorar', '👃', ['The kitchen ___ of chocolate all afternoon.', 'I have never ___ anything so bad!']),
  V('speak', 'spoke', 'spoken', 'parlar', '🗣️', ['I ___ to the head teacher this morning.', 'Have you ever ___ to a famous person?']),
  V('spell', 'spelt/spelled', 'spelt/spelled', 'lletrejar', '🔤', ['He ___ my name wrong on the card.', 'Have you ___ all the words correctly?']),
  V('spend', 'spent', 'spent', 'gastar, passar temps', '💸', ['We ___ the summer in Menorca.', 'I have ___ all my money on video games.']),
  V('stand', 'stood', 'stood', 'estar dret', '🧍', ['We ___ in the queue for an hour.', 'I have ___ here all morning!']),
  V('steal', 'stole', 'stolen', 'robar', '🦹', ['Someone ___ my bike last week.', 'The thieves have ___ a famous painting.']),
  V('stick', 'stuck', 'stuck', 'enganxar', '🩹', ['I ___ a poster on my bedroom wall.', 'Someone has ___ chewing gum under my desk!']),
  V('sweep', 'swept', 'swept', 'escombrar', '🧹', ['She ___ the floor after the party.', 'I have already ___ the kitchen.']),
  V('swim', 'swam', 'swum', 'nedar', '🏊', ['We ___ in the sea every day last summer.', 'Have you ever ___ with dolphins?']),
  V('take', 'took', 'taken', 'agafar, portar', '📷', ['I ___ a lot of photos in Paris.', 'Who has ___ my pen?']),
  V('teach', 'taught', 'taught', 'ensenyar', '👩‍🏫', ['Mr Smith ___ us English last year.', 'My grandma has ___ me how to cook.']),
  V('tear', 'tore', 'torn', 'estripar', '📄', ['I ___ my jeans on a fence.', 'Oh no! The dog has ___ my homework!']),
  V('tell', 'told', 'told', 'explicar, dir', '🗨️', ['My brother ___ me a funny joke.', 'Have you ___ your parents about the exam?']),
  V('think', 'thought', 'thought', 'pensar', '🤔', ['I ___ the exam was easy.', 'Have you ___ about my question?']),
  V('throw', 'threw', 'thrown', 'llençar', '🏀', ['He ___ the ball to me.', 'Who has ___ paper on the floor?']),
  V('understand', 'understood', 'understood', 'entendre', '🤓', ['Finally I ___ the problem.', 'Have you ___ the instructions?']),
  V('wear', 'wore', 'worn', 'portar posat', '👕', ['She ___ a red dress to the party.', 'I have never ___ a tie.']),
  V('win', 'won', 'won', 'guanyar', '🏆', ['Spain ___ the World Cup in 2010.', 'Have you ever ___ a prize?']),
  V('write', 'wrote', 'written', 'escriure', '✍️', ['Shakespeare ___ Romeo and Juliet.', 'Have you ___ your essay yet?']),
];

export const VERB_BY_ID: Record<string, Verb> = Object.fromEntries(VERBS.map((v) => [v.id, v]));

/**
 * Grups de 5 ordenats per famílies de formes, de les fàcils a les difícils: primer els que no canvien
 * (cut-cut-cut), després els que repeteixen el past i el participle (buy-bought-bought) i al final els
 * que tenen tres formes diferents (sing-sang-sung). Els verbs d'un mateix grup s'assemblen.
 */
export const GROUPS: { title: string; hint: string; ids: string[] }[] = [
  { title: 'No canvien mai (1)', hint: 'cut – cut – cut', ids: ['cut', 'put', 'hit', 'let', 'shut'] },
  { title: 'No canvien mai (2)', hint: 'cost – cost – cost (compte amb read!)', ids: ['bet', 'cost', 'hurt', 'set', 'read'] },
  { title: 'La família -ought / -aught', hint: 'buy – bought – bought', ids: ['bring', 'buy', 'fight', 'think', 'catch'] },
  { title: 'Acaben en -t (1)', hint: 'sleep – slept – slept', ids: ['teach', 'keep', 'sleep', 'sweep', 'feel'] },
  { title: 'Acaben en -t (2)', hint: 'send – sent – sent', ids: ['bend', 'lend', 'send', 'spend', 'build'] },
  { title: '-t o -ed, totes dues valen', hint: 'learn – learnt – learnt', ids: ['burn', 'dream', 'learn', 'smell', 'spell'] },
  { title: 'Es fan curts', hint: 'meet – met – met', ids: ['mean', 'leave', 'lose', 'light', 'meet'] },
  { title: 'Acaben en -d (1)', hint: 'pay – paid – paid', ids: ['lay', 'pay', 'say', 'make', 'have'] },
  { title: 'Acaben en -d (2)', hint: 'tell – told – told', ids: ['hear', 'sell', 'tell', 'hold', 'stand'] },
  { title: 'Acaben en -d (3)', hint: 'feed – fed – fed', ids: ['understand', 'bleed', 'feed', 'lead', 'find'] },
  { title: 'Canvia la vocal', hint: 'sit – sat – sat', ids: ['get', 'sit', 'win', 'shoot', 'shine'] },
  { title: 'Sona «u» i els que tornen', hint: 'dig – dug – dug · come – came – come', ids: ['dig', 'stick', 'hang', 'come', 'run'] },
  { title: 'La família -ew / -own', hint: 'grow – grew – grown', ids: ['blow', 'grow', 'know', 'throw', 'fly'] },
  { title: 'Participi en -n', hint: 'wear – wore – worn', ids: ['draw', 'show', 'wear', 'tear', 'beat'] },
  { title: 'i – a – u', hint: 'sing – sang – sung', ids: ['drink', 'ring', 'sing', 'sink', 'swim'] },
  { title: 'Participi en -en (1)', hint: 'speak – spoke – spoken', ids: ['begin', 'speak', 'break', 'steal', 'freeze'] },
  { title: 'Participi en -en (2)', hint: 'write – wrote – written', ids: ['choose', 'drive', 'ride', 'rise', 'write'] },
  { title: 'Participi en -en (3)', hint: 'eat – ate – eaten', ids: ['bite', 'hide', 'eat', 'fall', 'shake'] },
  { title: 'Participi en -en (4)', hint: 'give – gave – given', ids: ['forget', 'forgive', 'give', 'take', 'see'] },
  { title: 'Els imprescindibles', hint: 'go – went – gone', ids: ['be', 'do', 'go', 'lie'] },
];

export const TOTAL_GROUPS = GROUPS.length;

export function verbsInGroup(group: number): Verb[] {
  return GROUPS[group - 1].ids.map((id) => VERB_BY_ID[id]);
}

export function groupOfVerb(id: string): number {
  return GROUPS.findIndex((g) => g.ids.includes(id)) + 1;
}

export function family(v: Verb): Family {
  const b = v.base;
  const p = v.past[0];
  const pp = v.pp[0];
  if (b === p && p === pp) return 'AAA';
  if (p === pp) return 'ABB';
  if (b === pp) return 'ABA';
  if (b === p) return 'AAB';
  return 'ABC';
}

export const FAMILY_INFO: Record<Family, { label: string; example: string }> = {
  AAA: { label: 'Les tres iguals', example: 'cut – cut – cut' },
  ABB: { label: 'Past = participle', example: 'buy – bought – bought' },
  ABA: { label: 'Participle = base', example: 'come – came – come' },
  AAB: { label: 'Past = base', example: 'beat – beat – beaten' },
  ABC: { label: 'Les tres diferents', example: 'sing – sang – sung' },
};

export type Rarity = 'comú' | 'rar' | 'èpic' | 'llegendari';

/** Els que més es confonen o més costen tenen la carta més valuosa. */
const LEGENDARY = new Set(['be', 'lie', 'lay', 'rise', 'tear', 'hang', 'read', 'bring', 'swim', 'forgive']);

export function rarity(v: Verb): Rarity {
  if (LEGENDARY.has(v.id)) return 'llegendari';
  const f = family(v);
  if (f === 'AAA') return 'comú';
  if (f === 'ABC') return 'èpic';
  return 'rar';
}

export const RARITY_COLOR: Record<Rarity, string> = {
  comú: '#94A3B8',
  rar: '#38BDF8',
  èpic: '#C084FC',
  llegendari: '#FBBF24',
};

export function forms(v: Verb, key: FormKey): string[] {
  return key === 'base' ? [v.base] : v[key];
}

/** Com es mostra una forma: «was / were». */
export function display(v: Verb, key: FormKey): string {
  return forms(v, key).join(' / ');
}

export function triple(v: Verb): string {
  return `${v.base} – ${display(v, 'past')} – ${display(v, 'pp')}`;
}

function meanings(v: Verb): string[] {
  return meaning(v).split(',').map((t) => t.trim().replace(/\(.*?\)|-se$/g, '').trim());
}

/**
 * Quan et donen la traducció, alguns verbs comparteixen traducció (agafar: catch / take; fer: do / make).
 * Aleshores es dona la primera lletra perquè la pregunta tingui una sola resposta.
 */
export function meaningPrompt(v: Verb): string {
  const mine = meanings(v);
  const clash = VERBS.some((o) => o.id !== v.id && meanings(o).some((m) => mine.includes(m)));
  return clash ? `${meaning(v)} (${v.base[0]}…)` : meaning(v);
}

/**
 * Àudios gravats (public/audio, els genera scripts/generate_audio.py amb una veu Piper).
 * Cada forma té un fitxer pel seu nom; read en past i participle en té un de propi perquè sona /red/.
 */
export function formClip(v: Verb, key: FormKey, form: string): string {
  return v.id === 'read' && key !== 'base' ? 'read-red' : form;
}

/** Com s'ha de llegir cada clip quan s'escriu diferent de com sona (només per generar l'àudio). */
export const CLIP_SPEECH: Record<string, string> = { 'read-red': 'red', tear: 'tare' };

/** Frase d'exemple completa (mode En context): la primera forma vàlida al lloc del buit. */
export function sentence(v: Verb, key: 'past' | 'pp'): string {
  return v.ctx[key === 'past' ? 0 : 1].replace('___', v[key][0]);
}

export function sentenceClip(v: Verb, key: 'past' | 'pp'): string {
  return `${v.id}-${key}`;
}

/** Tots els clips: [carpeta/nom, text que s'ha de llegir]. */
export function allClips(): [string, string][] {
  const out = new Map<string, string>();
  for (const v of VERBS) {
    for (const key of ['base', 'past', 'pp'] as FormKey[]) {
      for (const f of forms(v, key)) {
        const id = formClip(v, key, f);
        out.set(`w/${id}`, CLIP_SPEECH[id] ?? f);
      }
    }
    for (const key of ['past', 'pp'] as const) {
      const text = sentence(v, key);
      out.set(`s/${sentenceClip(v, key)}`, v.id === 'read' ? text.replace(/\bread\b/, 'red') : text);
    }
  }
  return [...out];
}
