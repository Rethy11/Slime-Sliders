// Glacier ("ice") rare skin — its only ambient/background stage effect is forcing the
// whole level to render with the Snow stage theme, regardless of which theme the level
// would normally use. Everything else about this skin (frost trail particles, and
// permanently freezing a tree once the player actually touches it) is a specific
// interaction and stays in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.ice = { forcedThemeIndex: 2 }; // themes[2] === Snow
