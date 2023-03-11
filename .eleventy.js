const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const eleventyGoogleFonts = require("eleventy-google-fonts");

module.exports = config => {
    const w3DateFilter = require('./src/filters/w3-date-filter.js');
    const postcssFilter = require('./src/filters/postcssFilter.js');
    config.addNunjucksAsyncFilter('postcss', postcssFilter);
      config.addWatchTarget('styles/**/*.css'); 

    // Plugins
    config.addPlugin(syntaxHighlight);
    config.addPlugin(eleventyGoogleFonts);

    config.addCollection('blog', collection => {
        return [...collection.getFilteredByGlob('./src/blog/*.md')].reverse();
    });

    config.addFilter("excerpt", (post) => {
        const content = post.replace(/(<([^>]+)>)/gi, "");
        return content.substr(0, content.lastIndexOf(" ", 200)) + "...";
    });

    config.addFilter("limit", function (array, limit) {
        return array.slice(0, limit);
    });

    // Add filters
    config.addFilter('w3DateFilter', w3DateFilter);

    config.addPassthroughCopy('./src/img/');

    return {
        markdownTemplateEngine: 'njk',
        dataTemplateEngine: 'njk',
        htmlTemplateEngine: 'njk',

        dir: {
            input: 'src',
            output: 'dist'
        }
    };
}
