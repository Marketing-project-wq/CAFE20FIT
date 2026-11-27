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
  // Chapters in page order. `el` is the element id; chapters whose element is not on the page are skipped.
  chapters: [
    { id: '01_hero', el: 'ch-hero', label: 'Hero' },
    { id: '02_made', el: 'process', label: 'Made by hand' },
    { id: '03_day', el: 'day', label: 'Your day' },
    { id: '05_care', el: 'care', label: 'Made with care' },
    { id: '06_turn', el: 'order', label: 'Your turn' },
    { id: '07_see', el: 'finale', label: 'See you' }
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

  // CH 03 — A day, fueled. One stop per time of day.
  stops: [
    { time: '06:00', hour: 6, kicker: 'Before you train', title: 'Wake up, warm up', copy: 'A clean lift before your first set. Light enough to train on.',
      items: [P.espresso, P.longBlack, P.coconutHydrate], need: 'Fresh' },
    { time: '08:00', hour: 8, kicker: 'After the last set', title: 'Refuel right away', copy: 'Your muscles just did the work. Give them something back.',
      items: [P.proteinBrew, P.almondEndurance, P.chocoPbWhey], need: 'Fueling' },
    // Rendang Sandwich / Tuna Mayo / Acai Bowl are not on the POS menu: add their ids here once they are.
    { time: '12:00', hour: 12, kicker: 'Midday reset', title: 'Eat like you trained', copy: 'Real food between meetings and the next session.',
      items: [], need: 'Fueling' },
    { time: '15:00', hour: 15, kicker: 'The 3 PM dip', title: 'Light energy, no crash', copy: 'Coffee made slow, for the part of the day that drags.',
      items: [P.signatureAren, P.honeyOatMacchiato, P.shakerato], need: 'Light energy' },
    { time: '19:00', hour: 19, kicker: 'Evening session', title: 'Cool down, hydrate', copy: 'Fresh and cold after the last class of the day.',
      items: [P.tropicalRecovery], need: 'Fresh' }   // Hydrococo / Watermelon Mix are not on the POS menu
  ],
  // Background through the day (dawn -> morning -> midday -> afternoon -> night), one colour per stop
  sky: ['#dfe2ea', '#f4f4f2', '#ffffff', '#f7e3cf', '#141012'],

  // Teasers that close each chapter (click = smooth scroll to the next chapter)
  teasers: {
    day: 'Not sure which one is yours? Answer 3 questions',
    dayFallback: 'Your cup is waiting. Choose how to get it',
    quiz: 'Why it tastes like this: made with care',
    care: 'Your cup is waiting. Choose how to get it',
    turn: 'See you at the bar'
  },

  // CH 04 — Find your fuel. One question per screen; answers auto-advance.
  quiz: {
    questions: [
      { id: 'train', q: 'Training today?', options: [['before', 'Yes, before'], ['after', 'Yes, just finished'], ['rest', 'Rest day']] },
      { id: 'time', q: 'What time is it for you?', options: [['morning', 'Morning'], ['midday', 'Midday'], ['afternoon', 'Afternoon'], ['evening', 'Evening']] },
      { id: 'feel', q: 'What do you feel like?', options: [['coffee', 'Coffee'], ['fresh', 'Something fresh'], ['filling', 'Something filling']] }
    ],
    // First rule whose `when` matches wins. items = [main, alt, alt] by menu id (sold out / missing are skipped).
    rules: [
      { when: { feel: 'fresh' }, items: [P.coconutHydrate, P.tropicalRecovery], need: 'Fresh', reason: 'Cold and light, easy on the body at any time of day.' },
      { when: { train: 'after', feel: 'filling' }, items: [P.proteinBrew, P.almondEndurance, P.chocoPbWhey], need: 'Fueling', reason: 'You just did the work. Something to refuel right after your session.' },
      { when: { train: 'before', feel: 'coffee' }, items: [P.espresso, P.longBlack, P.shakerato], need: 'Light energy', reason: 'A clean coffee lift, light enough to train on.' },
      { when: { train: 'rest', time: 'afternoon', feel: 'coffee' }, items: [P.signatureAren, P.honeyOatMacchiato, P.shakerato], need: 'Light energy', reason: 'Coffee made slow, for the part of the day that drags.' },
      { when: { feel: 'coffee' }, items: [P.signatureAren, P.honeyOatMacchiato, P.longBlack], need: 'Light energy', reason: 'Our signature, made by hand for a steady lift.' },
      { when: { feel: 'filling' }, items: [P.proteinBrew, P.almondEndurance], need: 'Fueling', reason: 'Something filling to keep you going.' }
    ],
    fallbackCategory: 'Signature', fallbackReason: 'A good place to start: one of our signatures.'
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
    headline: 'Every drink and pastry is made by hand to fuel your day,',
    headlineRed: 'or even your workout.',
    pillars: [
      { need: 'Fresh', line: 'Fruit, coconut and cold drinks for a clean, light lift.', category: 'Juice' },
      { need: 'Fueling', line: 'Coffee and protein drinks for before or after training.', category: 'Signature' },
      { need: 'Light energy', line: 'Easy on the body, still giving you energy, like Tropical Recovery.', category: 'Hybrid' }
    ],
    video: 'https://media.20fit.id/wp-content/uploads/2026/11/1793607194111.publer.com_.mp4'
  }
};
})();
