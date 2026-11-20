// Configuración de svgo para los íconos de skills (assets/img/skills/*.svg):
//
//   npx svgo --config scripts/svgo.config.mjs assets/img/skills/<nuevo>.svg
//   node scripts/build-i18n.mjs   # regenera el sprite assets/img/skills.svg
//
// Cada archivo es <svg style="display:none"><symbol id="iconX">…: hay que
// conservar los ids (los usa <use href="…skills.svg#iconX">) y no borrar
// elementos "ocultos", o los íconos desaparecen.
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
