# RDX
**(Warning: DON'T USE THIS YET! The `compile` command works but nothing is stable.)**

An HTML, ES2016, JSX compiler.

## Usage

Compile modern web applications that include **ES6+** JavaScript and **JSX** code.

## Installation

1. Requires:
    - NodeJS 4+
    - NPM 3+
1. Run: `npm i -g @resistdesign/rdx`

## Commands

1. `-h`: Usage/Help (All Commands).
1. `-v`: Display the current RDX version.
1. `init`: Initialize a package with the default RDX structure.
1. `serve`: Serve an HTML application for live development.
    - WebPack Dev Server: https://webpack.github.io/docs/webpack-dev-server.html
1. `compile`: Compile an HTML application for deployment.

## Configure

Command flag values may be pre-configured by declaring them in the `package.json` file for a given project.

Example:

```json
{
    "name": "example-app",
    ...
    "rdx": {
        "serve": {
            "proxy": "http://example.com:80"
        }    
    }
}
```

**NOTE:** Flag values passed in the command line will supersede any pre-configured values.

## Supported Features

1. Multiple HTML Apps Per Project
1. Multiple JS Apps Per HTML App
1. Images (PNG, JPG, SVG, ICO)
1. Fonts (WOFF, TTF, EOT, SVG, OTF)
1. CSS/LESS (Auto-Prefixed)
1. ES6+ (Stage 0)
1. JSX

## Tech

1. WebPack: https://webpack.github.io
1. Babel: https://babeljs.io
1. React Hot Loader: https://gaearon.github.io/react-hot-loader

## License

The MIT License (MIT)

Copyright (c) 2016 Ryan T. Graff

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
