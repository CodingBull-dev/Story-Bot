const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const eleventyGoogleFonts = require("eleventy-google-fonts");

module.exports = config => {
    const w3DateFilter = require('./src/filters/w3-date-filter.js');
    const postcssFilter = require('./src/filters/postcssFilter.js');
    config.addNunjucksAsyncFilter('postcss', postcssFilter);
    config.addWatchTarget('styles/**/*.css');

    // Plugins
    config.addPlugin(syntaxHighlight);
    // config.addPlugin(eleventyGoogleFonts);
    config.addPlugin(rssPlugin);

    config.addCollection('blog', collection => {
        return [...collection.getFilteredByGlob('./src/blog/*.md')].reverse();
    });


    config.addNunjucksGlobal('isOneDayOld', (startDate) => {
        const postDate = new Date(startDate);
        const today = new Date();
        return postDate.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0);
        // return ((new Date().getTime() - new Date(startDate).getTime()) / 1000) > 604800
    });

    config.addFilter("excerpt", (post) => {
        const content = post.replace(/(<([^>]+)>)/gi, "");
        return content.substr(0, content.lastIndexOf(" ", 200)) + "...";
    });

    config.addFilter("limit", function (array, limit) {
        return array.slice(0, limit);
    });

    config.addFilter("shorten", function (text, limit) {
        if (text.length > limit) {
            return text.slice(0, limit) + "...";
        }
        return text;
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
