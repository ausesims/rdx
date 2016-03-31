import Command from '../Base/Command';
import Config from '../Config/WebPack/Compile';
import WebPack from 'webpack';
import Glob from 'glob';
import Path from 'path';

export default class Compile extends Command {
  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a src/index.app.js'.yellow)
    });
  }

  async run(args) {
    const target = typeof args.a === 'string' ?
      [args.a] : Glob.sync('./src/**/*.app.js') || [];
    const entryMap = {};

    await super.run(args);

    if (!target instanceof Array || !target.length) {
      throw new Error('No application(s) specified.');
    }

    target.forEach(path => {
      const pathRelativeToSrc = Path.relative('./src', path);
      const pathWithoutJsExt = pathRelativeToSrc.replace('.js', '');

      entryMap[pathWithoutJsExt] = path;
    });

    const webPackConfig = Config(entryMap);
    const compiler = WebPack(webPackConfig);

    this.log('Start', 'Compiling:', `${target.join(', ')}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        if (error) {
          rej(error);
          return;
        }

        this.log('Finished', 'Compiled:', `${target.join(', ')}`);

        const jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
          rej(jsonStats.errors.join('\n\n'));
          return;
        }

        if (jsonStats.warnings.length > 0) {
          const formattedWarnings = jsonStats.warnings.map(function (warning) {
            let lines = warning ? String(warning).split('\n') : [''];

            return '\t\t' + lines.join('\n\t\t');
          }).join('\n\n').yellow;
          this.log('Warnings:', formattedWarnings);
        }

        res();
      });
    });
  }
}
