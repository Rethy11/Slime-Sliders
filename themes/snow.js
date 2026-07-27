// Snow stage theme.
// Also referenced directly by id ("Snow") elsewhere for the Glacier ("ice") skin's
// ground-frosting overlay — see snowTheme in index.html, SECTION 2.
window.StageThemes = window.StageThemes || [];
window.StageThemes.push({
    name: "Snow",
    bg: "#caf0f8",
    grid: "#ade8f4",
    treeBase: "#5c4033",
    treeTop: "#ffffff",
    rock: "#8d99ae",
    decorColors: ['#ffffff', '#ade8f4', '#e0f7fa'],
    hazard: { type: 'ice', color: '#0a2e44', edge: '#bfe9f7' }
});
