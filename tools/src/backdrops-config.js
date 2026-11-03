/*
 * CoffeeStory 3D backdrops: where each of the 5 steps takes place (farm -> roastery -> bar -> bar close-up ->
 * 20FIT Arena). Photos live in /story at the site root, named <location>-far[-mobile].avif|.webp and optional
 * <location>-mid[-mobile].png|.webp (cut-out with alpha). Drop a file in and it is used on the next load;
 * until then a painted placeholder in the location's colours is shown. All tuning numbers live here.
 */
window.StoryBackdrops = {
  dir: 'story/',
  // step index (0..4) -> location key; step 3 re-uses the bar with a dolly-in instead of a new photo
  steps: ['farm', 'roastery', 'bar', 'bar', 'arena'],
  zoomPerStep: [1, 1, 1, 1.15, 1],            // step 4 (Pour) = closer on the bar
  crossfadeFrom: 0.75,                        // a step hands over to the next location in its last 25%
  enterZoom: 1.06,                            // incoming far layer eases from this scale to 1
  farDepth: 12, midDepth: 4,                  // distance behind the cup (world units)
  coverMargin: 1.15,                          // extra size so orbit / parallax never shows an edge
  parallax: { far: 0.35, mid: 1.4 },          // how far each layer drifts with the camera orbit
  lightsOn: { from: 0.6, ms: 600 },           // 20FIT Arena: lights switched on once the location is in
  locations: {
    farm: {
      label: 'Origin · Coffee farm', focal: { x: 0.62, y: 0.45 },
      light: { key: '#ffe2b8', keyI: 2.3, keyPos: [6, 5, 2], sky: '#cfe8c4', ground: '#2a3a1e', hemiI: 0.9, rimI: 8, exposure: 1.05 },
      paint: { sky: ['#f6d9a8', '#cfe2c0', '#6f8f55'], accent: '#c8142f' }
    },
    roastery: {
      label: 'Roastery', focal: { x: 0.6, y: 0.5 },
      light: { key: '#ffb070', keyI: 2.0, keyPos: [4, 6, 3], sky: '#5a3a22', ground: '#140a05', hemiI: 0.7, rimI: 18, exposure: 0.9 },
      paint: { sky: ['#2a170c', '#5a321a', '#1a0d06'], accent: '#ff8a3a' }
    },
    bar: {
      label: 'The bar · 20FIT Cafe', focal: { x: 0.64, y: 0.48 },
      light: { key: '#fff1de', keyI: 2.4, keyPos: [3, 7, 4], sky: '#e8e2da', ground: '#1a1414', hemiI: 0.8, rimI: 22, exposure: 1.0 },
      paint: { sky: ['#cfc4b6', '#8c7b6a', '#2a2220'], accent: '#e30a2e' }
    },
    arena: {
      label: '20FIT Arena · Jakarta', focal: { x: 0.6, y: 0.4 },
      light: { key: '#eef3ff', keyI: 2.7, keyPos: [1, 9, 3], sky: '#dfe6f2', ground: '#141414', hemiI: 0.9, rimI: 40, exposure: 1.1 },
      paint: { sky: ['#0f1218', '#1c2230', '#0a0b0e'], accent: '#e30a2e' }
    }
  }
};
