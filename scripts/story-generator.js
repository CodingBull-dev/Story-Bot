const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
var string = require("string-sanitizer");
const client = require('https');
const yaml = require("json2yaml");

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
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
        // add the instruction for the prompt
        const fullPrompt = `
Write a story. Has to be at least 5 paragraphs long.

${prompt}

Don't write the title of the story. I'll ask you about it in a follow up question`;

        const story = {};

        const temperature = Number(Math.random().toFixed(2));

        console.log("Requesting story.", "Temperature for the story is:", temperature);

        const storyMessages = [
            { "role": "system", "content": "You write short stories for a blog." },
            { "role": "user", "content": fullPrompt }
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
                { "role": "user", "content": "What would you call the story? Respond only with the name, no other text is needed." }
            ]
        });

        let title = titleQuestion.data.choices[0].message.content

        // Remove dots at the end of the title
        if (title[title.length - 1] === ".") {
            title = title.slice(0, -1);
        }

        story.title = title;

        console.log("Got the story title:", story.title);

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
        const prompt = `Create the cover image for a story called '${story.title}'`;

        const imageName = `${this.today}-${string.sanitize.addDash(story.title)}.png`.toLowerCase();

        console.log('Generating image for the story with the following prompt:', prompt);

        try {
            const response = await this.openai.createImage({
                prompt,
                size: "512x512",
            });

            console.log('Got the image.', 'Downloading file now!');

            const fileName = `./src/img/blog/${imageName}`;

            for (let i = 0; i < response.data.data.length; i++) {
                const data = response.data.data[i];
                await downloadImage(data.url, fileName);
                console.log("Finished saving file", fileName);
                return imageName;
            }
        } catch (e) {
            console.error(e.message);
            throw new Error(`Failed while fetching the image for ${prompt.title}`);
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
