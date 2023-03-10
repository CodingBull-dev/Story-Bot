const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
var string = require("string-sanitizer");

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const configuration = new Configuration({
    apiKey: key
});

const openai = new OpenAIApi(configuration);

const prompt = `
The story must be one of the following genres (or a combination of them): Fantasy, Fiction, Horror, or Humor.

Extra points if the story ends with an unexpected twist.
`;

const fullPrompt = `
Write a story. Has to be at least 5 paragraphs long.

${prompt}

Don't write the title of the story. I'll ask you about it in a follow up question`;

const getDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
}

async function generateStory() {
    const story = {};

    const storyMessages = [
        { "role": "system", "content": "You write short stories for a blog." },
        { "role": "user", "content": fullPrompt }
    ];
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: storyMessages
    });

    story.prompt = prompt;
    story.content = response.data.choices[0].message.content;

    const titleQuestion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            ...storyMessages,
            response.data.choices[0].message,
            { "role": "user", "content": "What is the title of the story? Respond only with the name, no other text is needed." }
        ]
    });

    story.title = titleQuestion.data.choices[0].message.content;

    console.log(story);

    const promptData = "```markdown" + prompt + "\n```";

    const today = getDate();

    const markdown = `---
layout: "layouts/blog.html"
title: ${story.title}
date: ${today}
categories: blog
---
${story.content}
\n
## Prompt
${promptData}
`;

const fileName = `./src/blog/${today}-${string.sanitize.addDash(story.title)}.md`.toLowerCase();

    console.log(markdown);
    fs.writeFile(fileName, markdown, err => {
        if (err) {
            console.error(err);
            throw err;
        } else {
            console.log(`Finished writing to ${fileName}`);
        }
    });
}

generateStory();
