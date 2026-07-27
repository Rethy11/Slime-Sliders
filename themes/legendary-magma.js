// Magma ("lava") rare skin — its only ambient/background stage effect is forcing the
// whole level to render with the Volcano stage theme, regardless of which theme the
// level would normally use. Everything else about this skin (ember trail particles,
// and permanently scorching a rock/tree once the player actually touches it) is a
// specific interaction and stays in the main game script.
window.LegendaryStageEffects = window.LegendaryStageEffects || {};
window.LegendaryStageEffects.lava = { forcedThemeIndex: 3 }; // themes[3] === Volcano
