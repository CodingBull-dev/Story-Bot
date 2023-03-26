const fs = require('fs');
const StoryGenerator = require("./story-generator");
const core = require('@actions/core');

const USER_NAME = process.env.USER_NAME;
const AVATAR = process.env.USER_AVATAR;

function setOutputs(fileName, story) {
    core.setOutput('file', fileName);
    core.setOutput('url', fileName.replace(/^.*[\\\/]/, '').replace(".md", ""));
    core.setOutput('title', story.title);
}

async function generateStoryFromIssue() {
    const generator = new StoryGenerator(null);
    let helper;
    if (USER_NAME && AVATAR) {
        helper = { name: USER_NAME, avatar: AVATAR }
    }
    // We have the prompt to read available in a text file
    fs.readFile('./story.json', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }

        const story = JSON.parse(data);

        generator.writeFiles(story, story.image, helper).then(file => {
            setOutputs(file.replace(`${generator.today}-`, ""), story);
        });
    });
}

generateStoryFromIssue();
