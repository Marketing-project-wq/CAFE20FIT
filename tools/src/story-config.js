/*
 * 20FIT Cafe landing story — one place for the copy, the chapters and which menu items show where.
 *
 * Products are referenced by their web menu id (cf_menu.id, the `id` of cafe_get_web_menu, linked 1:1 to a POS
 * product). Photo, name and price always come from the POS through that menu — the site keeps no menu photos of its
 * own; a POS product without a photo shows its 2D 20FIT illustration (same as FULL MENU). A product that is no longer
 * on the menu, hidden from the web or sold out is simply left out of its section. `name` is only a note for whoever
 * edits this file; it is never shown. Edit this file to change the story without touching the page.
 */
(function () {
// Web menu ids (cafe_get_web_menu, 2026-11-27) of the products used below.
var P = {
  espresso: { id: '2684d571-e267-42f9-9a9c-4c46d02001b7', name: 'Espresso' },
  longBlack: { id: '25fb7945-6bbb-41fd-ba78-f4d2c7c5ab1e', name: 'Long Black' },
  coconutHydrate: { id: 'fec7bbd9-8144-40b3-9ea0-815f00e6ff01', name: 'Coconut Hydrate' },
  proteinBrew: { id: 'ddd0e42c-b813-4903-8956-97bd919c8446', name: 'Protein Brew' },
  almondEndurance: { id: '3f5c6991-1477-4676-9a31-ceeaf5810af0', name: 'Almond Endurance' },
  chocoPbWhey: { id: '9ab37a54-ac56-47b8-8083-640b4ab084aa', name: 'Choco Peanut Butter + Whey' },
  signatureAren: { id: '4752c687-fd57-4cc4-948b-4a381c75cef3', name: '20Fit Signature Aren*' },
  honeyOatMacchiato: { id: 'e767e409-5cc5-45a4-bc5a-9e2786e52dd4', name: 'Honey Oat Macchiato' },
  shakerato: { id: '91814796-f6a5-4890-921e-59fa6e28a9ea', name: 'Shakerato' },
  tropicalRecovery: { id: '789370b8-fb4b-4fc8-8b51-2a20b36f7f78', name: 'Tropical Recovery' }
};
window.StoryConfig = {
  // Texts are { en, id } (English default, Indonesian when the visitor picks ID — tools/src/i18n.js); a plain string is
  // used for both languages.
  // Chapters in page order. `el` is the element id; chapters whose element is not on the page are skipped.
  chapters: [
    { id: '01_hero', el: 'ch-hero', label: { en: 'Hero', id: 'Pembuka' } },
    { id: '02_made', el: 'process', label: { en: 'Made by hand', id: 'Dibuat dengan tangan' } },
    { id: '03_day', el: 'day', label: { en: 'Your day', id: 'Harimu' } },
    { id: '05_care', el: 'care', label: { en: 'Made with care', id: 'Sepenuh hati' } },
    { id: '06_turn', el: 'order', label: { en: 'Your turn', id: 'Giliranmu' } },
    { id: '07_see', el: 'finale', label: { en: 'See you', id: 'Sampai jumpa' } }
  ],
  needs: ['Fresh', 'Fueling', 'Light energy'],   // same order as the hero chips
  // CH 01 — the product card under the hero, one per chip (same order as `needs`)
  heroPicks: [P.coconutHydrate, P.signatureAren, P.tropicalRecovery],

  // Menu (filter chips, FULL MENU and the home menu rail). Categories come from the POS; `merge` shows a POS category
  // under another name, `order` sets the order of the groups ('*' = every category not listed). Drinks first.
  menu: {
    merge: { Chia: 'Food' },
    order: ['Coffee', 'Signature', 'Hybrid', 'Smoothies', 'Tea', 'Chocolate', '*', 'Food']
  },

  // CH 03 — A day, fueled. One stop per time of day. items = products by id (in this order), categories = POS categories
  // that top the stop up to 3 products. A stop without any product on the menu is hidden.
  stops: [
    { time: '06:00', hour: 6, kicker: { en: 'Before you train', id: 'Sebelum latihan' }, title: { en: 'Wake up, warm up', id: 'Bangun, pemanasan' }, copy: { en: 'A clean lift before your first set. Light enough to train on.', id: 'Dorongan energi sebelum set pertama. Cukup ringan untuk dibawa latihan.' },
      items: [P.espresso, P.longBlack, P.coconutHydrate], need: 'Fresh' },
    { time: '08:00', hour: 8, kicker: { en: 'After the last set', id: 'Setelah set terakhir' }, title: { en: 'Refuel right away', id: 'Langsung isi energi' }, copy: { en: 'Your muscles just did the work. Give them something back.', id: 'Ototmu baru saja bekerja keras. Beri mereka asupan.' },
      items: [P.proteinBrew, P.almondEndurance, P.chocoPbWhey], need: 'Fueling' },
    // Real food: the POS Food category (croissants, danish…) — set by POS category, so new food products show up here.
    { time: '12:00', hour: 12, kicker: { en: 'Midday reset', id: 'Rehat siang' }, title: { en: 'Eat like you trained', id: 'Makan seperti habis latihan' }, copy: { en: 'Real food between meetings and the next session.', id: 'Makanan sungguhan di sela meeting dan sesi berikutnya.' },
      items: [], categories: ['Food'], need: 'Fueling' },
    { time: '15:00', hour: 15, kicker: { en: 'The 3 PM dip', id: 'Lesu jam 3 sore' }, title: { en: 'Light energy, no crash', id: 'Energi ringan, tanpa drop' }, copy: { en: 'Coffee made slow, for the part of the day that drags.', id: 'Kopi yang diseduh pelan, untuk jam-jam yang terasa lambat.' },
      items: [P.signatureAren, P.honeyOatMacchiato, P.shakerato], need: 'Light energy' },
    { time: '19:00', hour: 19, kicker: { en: 'Evening session', id: 'Sesi malam' }, title: { en: 'Cool down, hydrate', id: 'Pendinginan, hidrasi' }, copy: { en: 'Fresh and cold after the last class of the day.', id: 'Segar dan dingin setelah kelas terakhir hari ini.' },
      items: [P.tropicalRecovery], categories: ['Tea'], need: 'Fresh' }   // + cold teas / lemonade from the POS Tea category
  ],
  // Background through the day (dawn -> morning -> midday -> afternoon -> night), one colour per stop
  sky: ['#dfe2ea', '#f4f4f2', '#ffffff', '#f7e3cf', '#141012'],

  // Teasers that close each chapter (click = smooth scroll to the next chapter)
  teasers: {
    day: { en: 'Not sure which one is yours? Answer 3 questions', id: 'Belum tahu mana yang cocok? Jawab 3 pertanyaan' },
    dayFallback: { en: 'Your cup is waiting. Choose how to get it', id: 'Cup kamu menunggu. Pilih cara ambilnya' },
    quiz: { en: 'Why it tastes like this: made with care', id: 'Kenapa rasanya begini: dibuat sepenuh hati' },
    care: { en: 'Your cup is waiting. Choose how to get it', id: 'Cup kamu menunggu. Pilih cara ambilnya' },
    turn: { en: 'See you at the bar', id: 'Sampai jumpa di bar' }
  },

  // CH 04 — Find your fuel. One question per screen; answers auto-advance.
  quiz: {
    questions: [
      { id: 'train', q: { en: 'Training today?', id: 'Latihan hari ini?' }, options: [['before', { en: 'Yes, before', id: 'Ya, sebelum latihan' }], ['after', { en: 'Yes, just finished', id: 'Ya, baru selesai' }], ['rest', { en: 'Rest day', id: 'Hari istirahat' }]] },
      { id: 'time', q: { en: 'What time is it for you?', id: 'Sekarang jam berapa buatmu?' }, options: [['morning', { en: 'Morning', id: 'Pagi' }], ['midday', { en: 'Midday', id: 'Siang' }], ['afternoon', { en: 'Afternoon', id: 'Sore' }], ['evening', { en: 'Evening', id: 'Malam' }]] },
      { id: 'feel', q: { en: 'What do you feel like?', id: 'Lagi pengin apa?' }, options: [['coffee', { en: 'Coffee', id: 'Kopi' }], ['fresh', { en: 'Something fresh', id: 'Yang segar' }], ['filling', { en: 'Something filling', id: 'Yang mengenyangkan' }]] }
    ],
    // First rule whose `when` matches wins. items = [main, alt, alt] by menu id (sold out / missing are skipped).
    rules: [
      { when: { feel: 'fresh' }, items: [P.coconutHydrate, P.tropicalRecovery], need: 'Fresh', reason: { en: 'Cold and light, easy on the body at any time of day.', id: 'Dingin dan ringan, enak di badan kapan saja.' } },
      { when: { train: 'after', feel: 'filling' }, items: [P.proteinBrew, P.almondEndurance, P.chocoPbWhey], need: 'Fueling', reason: { en: 'You just did the work. Something to refuel right after your session.', id: 'Kamu baru saja kerja keras. Ini untuk isi energi setelah sesi.' } },
      { when: { train: 'before', feel: 'coffee' }, items: [P.espresso, P.longBlack, P.shakerato], need: 'Light energy', reason: { en: 'A clean coffee lift, light enough to train on.', id: 'Dorongan kopi yang bersih, cukup ringan untuk latihan.' } },
      { when: { train: 'rest', time: 'afternoon', feel: 'coffee' }, items: [P.signatureAren, P.honeyOatMacchiato, P.shakerato], need: 'Light energy', reason: { en: 'Coffee made slow, for the part of the day that drags.', id: 'Kopi yang diseduh pelan, untuk jam-jam yang terasa lambat.' } },
      { when: { feel: 'coffee' }, items: [P.signatureAren, P.honeyOatMacchiato, P.longBlack], need: 'Light energy', reason: { en: 'Our signature, made by hand for a steady lift.', id: 'Signature kami, dibuat dengan tangan untuk energi yang stabil.' } },
      { when: { feel: 'filling' }, items: [P.proteinBrew, P.almondEndurance], need: 'Fueling', reason: { en: 'Something filling to keep you going.', id: 'Yang mengenyangkan supaya kamu tetap jalan.' } }
    ],
    fallbackCategory: 'Signature', fallbackReason: { en: 'A good place to start: one of our signatures.', id: 'Awal yang pas: salah satu signature kami.' }
  },

  // CH 07 — See you at the bar. Never invent details: fields left as 'TODO…' are hidden on the page until filled in.
  finale: {
    place: '20FIT Arena',
    address: 'TODO: street address',
    hours: 'TODO: opening hours',
    instagram: '20fit.cafe'
  },

  // CH 05 — Made with care
  care: {
    headline: { en: 'Every drink and pastry is made by hand to fuel your day,', id: 'Setiap minuman dan pastry dibuat dengan tangan untuk mengisi energi harimu,' },
    headlineRed: { en: 'or even your workout.', id: 'bahkan latihanmu.' },
    pillars: [
      { need: 'Fresh', line: 'Fruit, coconut and cold drinks for a clean, light lift.', category: 'Juice' },
      { need: 'Fueling', line: 'Coffee and protein drinks for before or after training.', category: 'Signature' },
      { need: 'Light energy', line: 'Easy on the body, still giving you energy, like Tropical Recovery.', category: 'Hybrid' }
    ],
    video: 'https://media.20fit.id/wp-content/uploads/2026/11/1793607194111.publer.com_.mp4'
  }
};
})();
