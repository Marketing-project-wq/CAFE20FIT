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
    dayFallback: 'Your cup is waiting. Choose how to get it'
  }
};
