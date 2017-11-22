// See http://brunch.io for documentation.
exports.files = {
    javascripts: {
        joinTo: {
            'script.js': /^source/
        }
    },
    stylesheets: {

      joinTo: {
        'style.css': /source\/styles\/main\.scss/
      }

    }
};

exports.conventions = {
    ignored: /(source\/server\/.*)|(source\/.+_\w+\.scss$)/,
};

exports.paths = {
    watched: ['source'],
    public: 'dist'
};

exports.plugins = {
    babel: { presets: ['latest'] },
    postcss: { processors: [require('autoprefixer')] },
    sass: {
        allowCache: true,
        sourceMapEmbed: true
    }
};

exports.modules = {
    autoRequire: {
        'script.js': ['source/scripts/root.js'],
    }
};

exports.server = { hostname: '0.0.0.0' };