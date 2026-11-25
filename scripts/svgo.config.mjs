// svgo configuration for the skill icons (assets/img/skills/*.svg):
//
//   npx svgo --config scripts/svgo.config.mjs assets/img/skills/<new>.svg
//   node scripts/build-i18n.mjs   # regenerates the sprite assets/img/skills.svg
//
// Each file is <svg style="display:none"><symbol id="iconX">…: the ids must
// be kept (<use href="…skills.svg#iconX"> relies on them) and "hidden"
// elements must not be removed, or the icons disappear.
export default {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          removeHiddenElems: false,
          removeUselessDefs: false,
          collapseGroups: false,
        },
      },
    },
  ],
};
