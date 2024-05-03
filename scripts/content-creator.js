const fs = require('fs');
const StoryGenerator = require("./story-generator");
const core = require('@actions/core');

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const generator = new StoryGenerator(key);

// We have the prompt to read available in a text file
fs.readFile('./prompt.txt', 'utf8', function (err, data) {
    if (err) {
        throw err;
    }
    // We create the blog post with the data of the prompt
    const story = generator.generateBlogPost(data);
    core.setOutput('title', story.title);
});
