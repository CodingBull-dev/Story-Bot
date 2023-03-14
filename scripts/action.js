const fs = require('fs');
const StoryGenerator = require("./story-generator");
const core = require('@actions/core');

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const USER_NAME = process.env.USER_NAME;
const AVATAR = process.env.USER_AVATAR;

async function generateStoryFromIssue() {
    const generator = new StoryGenerator(key);
    let helper;
    if (USER_NAME && AVATAR) {
        helper = { name: USER_NAME, avatar: AVATAR }
    }
    // We have the prompt to read available in a text file
    fs.readFile('./prompt.txt', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }

        // We create the blog post with the data of the prompt
        generator.generateBlogPost(data, helper)
            .then(story => core.setOutput("title", story.title));
    });
}

generateStoryFromIssue();
