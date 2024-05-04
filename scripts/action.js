import { readFile } from 'fs';
import { writeFiles, today } from "./story-generator.js";
import { setOutput } from '@actions/core';

const USER_NAME = process.env.USER_NAME;
const AVATAR = process.env.USER_AVATAR;

function setOutputs(fileName, story) {
    setOutput('file', fileName);
    setOutput('url', fileName.replace(/^.*[\\\/]/, '').replace(".md", ""));
    setOutput('title', story.title);
}

async function generateStoryFromIssue() {
    let helper;
    if (USER_NAME && AVATAR) {
        helper = { name: USER_NAME, avatar: AVATAR }
    }
    // We have the prompt to read available in a text file
    readFile('./story.json', 'utf8', function (err, data) {
        if (err) {
            throw err;
        }

        const story = JSON.parse(data);

        writeFiles(story, story.image, helper).then(file => {
            setOutputs(file.replace(`${today}-`, ""), story);
        });
    });
}

generateStoryFromIssue();
