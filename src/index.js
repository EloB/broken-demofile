import demoAnalyze from './demoAnalyze';
import example1 from 'file-loader!./example1.dem';
import example2 from 'file-loader!./example2.dem';
import example3 from 'file-loader!./example3.dem';

const examples = { example1, example2, example3 };

(async () => {
  for (const [name, url] of Object.entries(examples)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(await demoAnalyze(name, buffer));
  }
})();
