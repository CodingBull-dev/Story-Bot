const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = config => {

    // Plugins
    config.addPlugin(syntaxHighlight);

    config.addCollection('blog', collection => {
        return [...collection.getFilteredByGlob('./src/blog/*.md')].reverse();
    });

    config.addFilter("excerpt", (post) => {
        const content = post.replace(/(<([^>]+)>)/gi, "");
        return content.substr(0, content.lastIndexOf(" ", 200)) + "...";
    });

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
