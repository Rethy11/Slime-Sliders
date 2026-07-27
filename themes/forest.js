// Forest stage theme — the default/first theme in the rotation.
// Registers itself onto window.StageThemes in load order, which the main game script
// reads directly as `themes` (see index.html, SECTION 2).
window.StageThemes = window.StageThemes || [];
window.StageThemes.push({
    name: "Forest",
    bg: "#6cce75",
    grid: "#5eb867",
    treeBase: "#795548",
    treeTop: "#2d7a31",
    rock: "#95a5a6",
    decorColors: ['#5eb867', '#4da956', '#a2d149'],
    hazard: { type: 'water', color: '#1ca3ec', edge: '#7fd8ff' }
});
