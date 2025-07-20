const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optimizaciones para reducir el tamaño del bundle
config.resolver.platforms = ['native', 'android', 'ios'];

// Configuración de minificación
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
};

module.exports = config; 