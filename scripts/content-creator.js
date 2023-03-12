const StoryGenerator = require("./story-generator");

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

const generator = new StoryGenerator(key);
generator.generateBlogPost();
