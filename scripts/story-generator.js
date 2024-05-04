import fs from 'fs';
import string from 'string-sanitizer';
import yaml from 'json2yaml';
import Image from '@11ty/eleventy-img';
import moment from 'moment';


// generate today's date to order files
export const today = moment().format("YYYY-MM-DD");


export async function writeFiles(story, imgUrl, helper) {
    console.log("Writing file for the following object", story);
    const imageName = `${today}-${string.sanitize.addDash(story.title)}`.toLowerCase();
    const stats = await Image(imgUrl, {
        formats: ["webp"],
        outputDir: "./src/img/blog/",
        filenameFormat: (id, src, width, format, options) => {
            return `${imageName}.${format}`;
        }
    });
    console.log("Finished saving image", stats);
    const img = stats.webp[0].filename;

    console.log("Generating markdown file");

    const data = {
        layout: "layouts/blog.html",
        title: story.title,
        date: moment().toISOString(),
        categories: "blog",
        tags: 'gpt',
        prompt: story.prompt,
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
`;

    const fileName = `./src/blog/${today}-${string.sanitize.addDash(story.title)}.md`.toLowerCase();
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
