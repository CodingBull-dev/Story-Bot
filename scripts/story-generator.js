const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
var string = require("string-sanitizer");
const yaml = require("json2yaml");
const Image = require("@11ty/eleventy-img");

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

class StoryGenerator {
    constructor(apiKey) {
        const configuration = new Configuration({
            apiKey
        });

        this.openai = new OpenAIApi(configuration);

        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();

        // generate today's date to order files
        this.today = `${yyyy}-${mm}-${dd}`;
    }

    async generateStory(prompt) {

        const story = {};

        const temperature = Number(Math.random().toFixed(2));

        console.log("Requesting story.", "Temperature for the story is:", temperature);

        const systemInfo = `You are Story Bot, a language model that helps users create stories, scripts and more. 
        Follow the user's instructions carefully and generate the content they requested.
        When writing a post, story or script, try to extend the text as much as possible without making it boring.`

        const storyMessages = [
            { "role": "system", "content": systemInfo },
            { "role": "user", "content": prompt }
        ];
        const response = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: temperature,
            messages: storyMessages
        });

        story.prompt = prompt;
        story.content = response.data.choices[0].message.content;
        story.temperature = temperature;

        console.log("Got the story!", `It is ${story.content.split(" ").length} words long!`);

        console.log("Requesting story title");

        const titleQuestion = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ...storyMessages,
                response.data.choices[0].message,
                { "role": "user", "content": "What would you call the story (or post)? Respond only with the name, no other text is needed." }
            ]
        });

        let title = titleQuestion.data.choices[0].message.content

        // Remove dots at the end of the title
        if (title[title.length - 1] === ".") {
            title = title.slice(0, -1);
        }

        story.title = title;

        console.log("Got the story title:", story.title);

        const imgPrompt = `Based on the previous story, write a prompt for an image generation service. It is intended to be the cover of the blog post.
Respond only with the prompt. No other text is needed`

        const promptQuestion = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                ...storyMessages,
                response.data.choices[0].message,
                { "role": "user", "content": "What would you call the story? Respond only with the name, no other text is needed." },
                titleQuestion.data.choices[0].message,
                { "role": "user", "content": imgPrompt }
            ]
        });

        const imagePrompt = promptQuestion.data.choices[0].message.content;

        story.imagePrompt = imagePrompt;

        return story;
    }

    async generateMarkdownFile(story, img, helper) {
        console.log("Generating markdown file");

        const promptData = "```markdown\n" + story.prompt.trim() + "\n```";

        const data = {
            layout: "layouts/blog.html",
            title: story.title,
            date: this.today,
            categories: "blog",
            tags: 'gpt',
            generation: {
                temperature: story.temperature
            }
        };
        if (img) {
            data.image = img;
        }
        if (helper) {
            data.generation.helper = { name: helper.name, avatar: helper.avatar };
        }

        const ymlData = yaml.stringify(data).trim();


        console.log("Configuration for the markdown file\n", ymlData);

        const markdown = `${ymlData}
---
${story.content}
\n
## Prompt
${promptData}
`;

        const fileName = `./src/blog/${this.today}-${string.sanitize.addDash(story.title)}.md`.toLowerCase();
        return new Promise((res, rej) => {
            fs.writeFile(fileName, markdown, err => {
                if (err) {
                    console.error(err);
                    rej(err);
                } else {
                    console.log(`Finished writing to ${fileName}`);
                    res(fileName);
                }
            });
        });
    }

    async generateStoryPhoto(story) {
        const imageName = `${this.today}-${string.sanitize.addDash(story.title)}`.toLowerCase();

        console.log('Generating image for the story with the following prompt:', story.imagePrompt);

        try {
            const response = await this.openai.createImage({
                prompt: story.imagePrompt,
                size: "512x512",
            });

            console.log('Got the image.', 'Downloading file now!');

            for (let i = 0; i < response.data.data.length; i++) {
                const { url } = response.data.data[i];
                // this lib downloads the image and compress it as a webp
                const stats = await Image(url, {
                    formats: ["webp"],
                    outputDir: "./src/img/blog/",
                    filenameFormat: (id, src, width, format, options) => {
                        return `${imageName}.${format}`;
                    }
                });
                console.log("Finished saving file", stats);
                return stats.webp[0].filename;
            }
        } catch (e) {
            console.error(e.message);
            throw new Error(`Failed while fetching the image for ${story.imagePrompt}`);
        }
    }

    async generateBlogPost(prompt, helper) {
        const story = await this.generateStory(prompt);
        const photo = await this.generateStoryPhoto(story);
        const file = await this.generateMarkdownFile(story, photo, helper);
        return story;
    }
}

module.exports = StoryGenerator;
