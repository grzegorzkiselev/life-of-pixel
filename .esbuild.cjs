const esbuild = require('esbuild');

esbuild.context({
  entryPoints: ['./script.ts', './worker.ts'],
  outdir: "./",
  bundle: true,
  platform: "browser",
  target: "esnext",
  // outfile: './script.js',
  minify: true,
  sourcemap: "linked",
})
.then((ctx) => {
  return ctx.serve({
    servedir: "./",
    host: "localhost",
    port: 8080,
  })
})
.then(({host, port}) => {
  console.log(`Server running at http://${host}:${port}`);
})