const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const configuration = new Configuration({
    apiKey: key
});

const openai = new OpenAIApi(configuration);

const prompt = `
Write a story. Has to be at least 5 paragraphs long.

The story must be one of the following genres (or a combination of them): Fantasy, Fiction, Horror, or Humor.

Extra points if the story ends with an unexpected twist.

Don't write the title of the story. I'll ask you about it in a follow up question`;

const today = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    return dd + '/' + mm + '/' + yyyy;
}

async function generateStory() {
    const story = {};
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You write short stories for a blog. Your readers are people interested in technology" },
            { "role": "user", "content": prompt }
        ]
    });

    story.prompt = prompt;
    story.content = response.data.choices[0].message.content;

    const titleQuestion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "system", "content": "You write short stories for a blog. Your readers are people interested in technology, programming and AI" },
            { "role": "user", "content": prompt },
            response.data.choices[0].message,
            { "role": "user", "content": "What is the title of the story? Respond only with the name, no other text is needed." }
        ]
    });

    story.title = titleQuestion.data.choices[0].message.content;

    console.log(story);

    const promptData = "```markdown" + prompt + "\n```"

    const markdown = `---
layout: "layouts/blog.html"
title: ${story.title}
date: ${today()}
categories: blog
---
${story.content}
\n
## Prompt
${promptData}
`

    console.log(markdown);
    fs.writeFile("./story.md", markdown, err => {
        if (err) {
            console.error(err);
            throw err;
        }
    });
}

generateStory();
