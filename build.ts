const packageJson = Bun.file('./package.json', { type: "application/json" });
const pJson = JSON.parse(await packageJson.text());

await Bun.build({
    entrypoints: ['./src/spry.mts'],
    outdir: './dist',
    naming: "spry.mjs",
    banner: "/*\n* SpryJs "+pJson.version+"\n* https://ggedde.github.io/spry-js\n*/",
    minify: {
        whitespace: true,
        identifiers: true,
        syntax: true,
    },
});

await Bun.build({
    entrypoints: ['./src/spry.ts'],
    outdir: './dist',
    naming: "spry.js",
    format: "iife",
    banner: "/*\n* SpryJs "+pJson.version+"\n* https://ggedde.github.io/spry-js\n*/",
    minify: {
        whitespace: true,
        identifiers: true,
        syntax: true,
    },
});

await Bun.build({
    entrypoints: ['./src/docs.ts'],
    outdir: './docs',
    naming: "docs.min.js",
    minify: {
        whitespace: true,
        identifiers: false,
        syntax: true,
    },
});

const prism = Bun.file('./src/prism.js');
const docs = Bun.file('./docs/docs.min.js');
if (docs && prism) {
    Bun.write('docs/docs.min.js', await docs.text() + await prism.text());
}

const docsCss = Bun.file('./src/docs.css');
if (docsCss) {
    Bun.write('docs/docs.min.css', (await docsCss.text()).replaceAll("\n", '').replaceAll("\t", '').replaceAll(/[\ ]{2,}/g, ' ').replaceAll(/\ :/g, ':').replaceAll(';}', '}').replaceAll(': ', ':').replaceAll(' {', '{'));
}