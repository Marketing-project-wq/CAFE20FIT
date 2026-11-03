/*
 * 20FIT Cafe landing story — one place for the copy, the chapters and which menu items show where.
 * Menu items are matched by name (case-insensitive) against the live menu (cafe_get_web_menu); items that are
 * missing or sold out are hidden automatically, prices always come from the menu. Edit this file to change
 * the story without touching the page.
 */
window.StoryConfig = {
  // Chapters in page order. `el` is the element id; chapters whose element is not on the page are skipped.
  chapters: [
    { id: '01_hero', el: 'ch-hero', label: 'Hero' },
    { id: '02_made', el: 'process', label: 'Made by hand' },
    { id: '03_day', el: 'day', label: 'Your day' },
    { id: '04_quiz', el: 'quiz', label: 'Find your fuel' },
    { id: '05_care', el: 'care', label: 'Made with care' },
    { id: '06_turn', el: 'order', label: 'Your turn' },
    { id: '07_see', el: 'finale', label: 'See you' }
  ],
  needs: ['Fresh', 'Fueling', 'Light energy'],   // same order as the hero chips

  // CH 03 — A day, fueled. One stop per time of day.
  stops: [
    { time: '06:00', hour: 6, kicker: 'Before you train', title: 'Wake up, warm up', copy: 'A clean lift before your first set. Light enough to train on.',
      items: ['Espresso', 'Long Black Iced', 'Coconut Hydrate'], need: 'Fresh' },
    { time: '08:00', hour: 8, kicker: 'After the last set', title: 'Refuel right away', copy: 'Your muscles just did the work. Give them something back.',
      items: ['Protein Brew', 'Almond Endurance', 'Choco Peanut Butter + Whey'], need: 'Fueling' },
    { time: '12:00', hour: 12, kicker: 'Midday reset', title: 'Eat like you trained', copy: 'Real food between meetings and the next session.',
      items: ['Rendang Sandwich', 'Tuna Mayo', 'Acai Bowl'], need: 'Fueling' },
    { time: '15:00', hour: 15, kicker: 'The 3 PM dip', title: 'Light energy, no crash', copy: 'Coffee made slow, for the part of the day that drags.',
      items: ['20FIT Signature Aren Latte', 'Honey Oat Macchiato', 'Shakerato'], need: 'Light energy' },
    { time: '19:00', hour: 19, kicker: 'Evening session', title: 'Cool down, hydrate', copy: 'Fresh and cold after the last class of the day.',
      items: ['Tropical Recovery', 'Hydrococo', 'Watermelon Mix'], need: 'Fresh' }
  ],
  // Background through the day (dawn -> morning -> midday -> afternoon -> night), one colour per stop
  sky: ['#dfe2ea', '#f4f4f2', '#ffffff', '#f7e3cf', '#141012'],

  // Teasers that close each chapter (click = smooth scroll to the next chapter)
  teasers: {
    made: "That's one cup. Here's how it fits into your day",
    madePick: 'Your {need} moment is at {time}',
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
    // First rule whose `when` matches wins. items = [main, alt, alt] by menu name (sold out / missing are skipped).
    rules: [
      { when: { feel: 'fresh' }, items: ['Coconut Hydrate', 'Hydrococo', 'Tropical Recovery'], need: 'Fresh', reason: 'Cold and light, easy on the body at any time of day.' },
      { when: { train: 'after', feel: 'filling' }, items: ['Protein Brew', 'Almond Endurance', 'Choco Peanut Butter + Whey'], need: 'Fueling', reason: 'You just did the work. Something to refuel right after your session.' },
      { when: { train: 'before', feel: 'coffee' }, items: ['Espresso', 'Long Black Iced', 'Shakerato'], need: 'Light energy', reason: 'A clean coffee lift, light enough to train on.' },
      { when: { train: 'rest', time: 'afternoon', feel: 'coffee' }, items: ['20FIT Signature Aren Latte', 'Honey Oat Macchiato', 'Shakerato'], need: 'Light energy', reason: 'Coffee made slow, for the part of the day that drags.' },
      { when: { feel: 'coffee' }, items: ['20FIT Signature Aren Latte', 'Honey Oat Macchiato', 'Long Black Iced'], need: 'Light energy', reason: 'Our signature, made by hand for a steady lift.' },
      { when: { time: 'midday', feel: 'filling' }, items: ['Rendang Sandwich', 'Tuna Mayo', 'Acai Bowl'], need: 'Fueling', reason: 'Real food between meetings and your next session.' },
      { when: { feel: 'filling' }, items: ['Protein Brew', 'Acai Bowl', 'Almond Endurance'], need: 'Fueling', reason: 'Something filling to keep you going.' }
    ],
    fallbackCategory: 'Signature', fallbackReason: 'A good place to start: one of our signatures.'
  },

  // CH 07 — See you at the bar. Never invent details: fields left as 'TODO…' are hidden on the page until filled in.
  finale: {
    place: '20FIT Arena',
    address: 'TODO: street address',
    hours: 'TODO: opening hours',
    instagram: '20fit.cafe',
    photo: '20fit signature aren latte'
  },

  // CH 05 — Made with care
  care: {
    headline: 'All of our drinks and pastry are prepared with care to help fuel your day,',
    headlineRed: 'or even your workout.',
    pillars: [
      { need: 'Fresh', line: 'Fruit, coconut and cold drinks for a clean, light lift.', photo: 'Coconut Hydrate', category: 'Juice' },
      { need: 'Fueling', line: 'Coffee and protein drinks for before or after training.', photo: 'Protein Brew', category: 'Signature' },
      { need: 'Light energy', line: 'Easy on the body, still giving you energy, like Tropical Recovery.', photo: 'Tropical Recovery', category: 'Hybrid' }
    ],
    video: 'https://media.20fit.id/wp-content/uploads/2026/11/1793607194111.publer.com_.mp4'
  }
};
