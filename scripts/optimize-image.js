const Image = require("@11ty/eleventy-img");

process.argv.splice(0, 2);

const image = process.argv.join(' ');

(async () => {
    let url = image;
    let stats = await Image(url, {
        formats: ["webp"],
        outputDir: './img/',
    }
  );

    console.log(stats);
})();
