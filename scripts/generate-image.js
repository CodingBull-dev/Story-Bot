const { Configuration, OpenAIApi } = require("openai");

const key = process.env.OPEN_AI_KEY;
if (!key) {
    throw new Error("Missing key OPEN_AI_KEY");
}

async function generateImage(prompt) {
    console.log(`Generating image with the prompt '${prompt}'`);
    const configuration = new Configuration({
        apiKey: key
    });

    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
        prompt: prompt,
        size: "1024x1024",
    });

    console.log(response.data)
}

process.argv.splice(0, 2);

const prompt = process.argv.join(' ');

generateImage(prompt);
