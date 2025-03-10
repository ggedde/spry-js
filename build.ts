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
const spryModuleFile = Bun.file('dist/spry.mjs');
await Bun.write('docs/spry.mjs', spryModuleFile);

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
const spryFile = Bun.file('dist/spry.js');
await Bun.write('docs/spry.js', spryFile);

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

console.log('\x1b[34mspry.js: \x1b[33m'+Math.round((new Blob([Bun.gzipSync(await spryFile.text())])).size / 10) / 100 + '\x1b[0m KB');
console.log('\x1b[34mspry.mjs: \x1b[33m'+Math.round((new Blob([Bun.gzipSync(await spryModuleFile.text())])).size / 10) / 100 + '\x1b[0m KB');

const spryDocsFile = Bun.file('docs/docs.min.js');
console.log('\x1b[34mdocs.min.js: \x1b[33m'+Math.round((new Blob([Bun.gzipSync(await spryDocsFile.text())])).size / 10) / 100 + '\x1b[0m KB');