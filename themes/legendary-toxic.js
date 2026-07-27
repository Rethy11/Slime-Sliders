// Toxic Sludge rare skin — its only ambient/background stage effect is forcing the
// whole level to render with the Swamp stage theme, regardless of which theme the level
// would normally use. Everything else about this skin (acid trail particles, wilting a
// flower or tree once the player actually touches it) is a specific interaction and
// stays in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.toxic = { forcedThemeIndex: 4 }; // themes[4] === Swamp
