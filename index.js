const { readFile } = require('fs');
const demoAnalyze = require('./src/demoAnalyze');

const promise = method => (...args) => new Promise(
  (resolve, reject) => method(...args, (e, ...result) => e ? reject(e) : resolve(result))
);

const examples = {
  example1: './src/example1.dem',
  example2: './src/example2.dem',
  example3: './src/example3.dem',
};

(async () => {
  for (const [name, path] of Object.entries(examples)) {
    const [buffer] = await promise(readFile)(path);
    console.log(await demoAnalyze(name, buffer));
  }
})();
