const tailwind = require('tailwindcss');
const postCss = require('postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = (cssCode, done) => {
    // we call PostCSS here.
    postCss([tailwind(require('../../tailwind.config')), autoprefixer(), cssnano({ preset: 'default' })])
        .process(cssCode, {
            // path to our CSS file
            from: './src/_includes/styles/tailwind.css'
        })
        .then(
            (r) => done(null, r.css),
            (e) => done(e, null)
        );
};
