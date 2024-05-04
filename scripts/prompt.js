import { readFile } from 'fs';
import { writeFiles } from "./story-generator.js";
import { setOutput } from '@actions/core';
import { OpenAI } from 'openai';
import * as storyGPT from "story-gpt";


const USER_NAME = process.env.USER_NAME;
const AVATAR = process.env.USER_AVATAR;
const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const openai = new OpenAI({ apiKey: key });

// We have the prompt to read available in a text file
readFile('./prompt.txt', 'utf8', async function (err, data) {
    if (err) {
        throw err;
    }
    let helper;
    if (USER_NAME && AVATAR) {
        helper = { name: USER_NAME, avatar: AVATAR }
    }

    const story = await storyGPT.createStory(data, openai)

    // We create the blog post with the data of the prompt
    const files = await writeFiles(story, story.image, helper);
    setOutput('title', story.title.replace(/\"/g, ""));
});
