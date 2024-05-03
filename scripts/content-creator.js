const fs = require('fs');
const StoryGenerator = require("./story-generator");
const core = require('@actions/core');

const USER_NAME = process.env.USER_NAME;
const AVATAR = process.env.USER_AVATAR;
const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const generator = new StoryGenerator(key);

// We have the prompt to read available in a text file
fs.readFile('./prompt.txt', 'utf8', async function (err, data) {
    if (err) {
        throw err;
    }
    let helper;
    if (USER_NAME && AVATAR) {
        helper = { name: USER_NAME, avatar: AVATAR }
    }

    // We create the blog post with the data of the prompt
    const story = await generator.generateBlogPost(data, helper);
    core.setOutput('title', story.title.replace(/\"/g, ""));
});
