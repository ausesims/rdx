import Path from 'path';
import FS from 'fs';
import HTMLEntrypoint from './Utils/HTMLEntrypoint';
import WebPack from 'webpack';
import CleanWebPackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import LoadMultiConfig from './Utils/LoadMultiConfig';

const COMMON_TYPE = 'Common';

export default class WebPackConfigBuilder {
  static getBaseConfig(htmlFilePath, contextPath, outputPath, serve = false) {
    const htmlEntry = new HTMLEntrypoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }));
    const htmlEntryMap = htmlEntry.getEntrypoints();
    const entry = {};
    const htmlContextPath = Path.dirname(htmlFilePath);
    const type = serve ? 'Serve' : 'Compile';
    const baseConfigPath = __dirname;
    const absOutputPath = Path.resolve(outputPath);

    const pluginTypePath = Path.join(baseConfigPath, 'Plugins', type);
    const pluginCommonPath = Path.join(baseConfigPath, 'Plugins', COMMON_TYPE);
    const loadersTypePath = Path.join(baseConfigPath, 'Loaders', type);
    const loadersCommonPath = Path.join(baseConfigPath, 'Loaders', COMMON_TYPE);
    const otherTypePath = Path.join(baseConfigPath, 'Other', type);
    const otherCommonPath = Path.join(baseConfigPath, 'Other', COMMON_TYPE);

    const typePlugins = LoadMultiConfig(pluginTypePath, contextPath, outputPath);
    const commonPlugins = LoadMultiConfig(pluginCommonPath, contextPath, outputPath);
    const typeLoaders = LoadMultiConfig(loadersTypePath, contextPath, outputPath);
    const commonLoaders = LoadMultiConfig(loadersCommonPath, contextPath, outputPath);
    const typeOther = LoadMultiConfig(otherTypePath, contextPath, outputPath, true);
    const commonOther = LoadMultiConfig(otherCommonPath, contextPath, outputPath, true);

    const cssPlugins = [];
    const cssLoaders = [];

    for (const k in htmlEntryMap) {
      if (htmlEntryMap.hasOwnProperty(k)) {
        const destinationPath = `${k}.output`;
        const ext = Path.extname(k);

        let sourcePath = Path.resolve(Path.join(htmlContextPath, htmlEntryMap[k]));

        if (ext === '.css' || ext === '.less') {
          sourcePath += '?input';

          const extractCSS = new ExtractTextPlugin(Path.join(
            Path.relative(contextPath, htmlContextPath),
            k
          ));
          const loadCSS = {
            test: sourcePath,
            loader: extractCSS.extract([
              require.resolve('css-loader'),
              require.resolve('less-loader'),
              require.resolve('postcss-loader')
            ])
          };

          cssPlugins.push(extractCSS);
          cssLoaders.push(loadCSS);
        }

        entry[destinationPath] = sourcePath;
      }
    }

    return {
      entry,
      output: {
        path: absOutputPath,
        filename: Path.join(
          Path.relative(contextPath, htmlContextPath),
          '[name]?[hash]'
        ),
        publicPath: '/'
      },
      target: 'web',
      resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
      },
      plugins: [
        ...(serve ? [
          new WebPack.HotModuleReplacementPlugin(),
          new WebPack.NoErrorsPlugin()
        ] : []),
        new CleanWebPackPlugin(
          [absOutputPath],
          {
            root: Path.resolve('./'),
            verbose: false
          }
        ),
        ...(typePlugins || []),
        ...(commonPlugins || []),
        ...cssPlugins,
        function SecretWeapon() {
          let compilerRef;

          this.plugin('emit', function (compilation, callback) {
            const assets = compilation.assets;

            for (const k in assets) {
              if (assets.hasOwnProperty(k)) {
                const fullExt = Path.extname(k) || '';
                const fullExtParts = fullExt.split('?');
                const normalExt = fullExtParts[0];

                if (normalExt === '.output') {
                  const base = Path.join(Path.dirname(k), Path.basename(k, fullExt));
                  const ext = Path.extname(base);

                  if (ext === '.js' || ext === '.jsx') {
                    const newBase = fullExtParts.length > 1 ? `${base}?${fullExtParts[1]}` : base;

                    assets[newBase] = assets[k];
                  }

                  delete assets[k];
                }
              }
            }

            callback();
          });

          this.plugin('done', function (stats) {
            const { compilation } = stats;
            const { hash } = compilation;
            const compFS = ( compilerRef && compilerRef.outputFileSystem ) || FS;
            const htmlPath = Path.join(absOutputPath, Path.relative(contextPath, htmlFilePath));
            const htmlDir = Path.dirname(htmlPath);

            try {
              compFS.mkdirSync(htmlDir);
            } catch (error) {
              // Ignore.
            }

            compFS.writeFileSync(
              htmlPath,
              htmlEntry.toHTML(
                htmlEntry.nodes,
                hash
              )
            );
          });

          return {
            apply: function (compiler) {
              compilerRef = compiler;
            }
          };
        }
      ],
      module: {
        loaders: [
          {
            test: /\.(less|css)$/,
            loader: [
              require.resolve('css-loader'),
              require.resolve('less-loader'),
              require.resolve('postcss-loader')
            ].join('!')
          },
          ...cssLoaders,
          ...(typeLoaders || []),
          ...(commonLoaders || [])
        ]
      },
      ...typeOther,
      ...commonOther
    };
  }
}
