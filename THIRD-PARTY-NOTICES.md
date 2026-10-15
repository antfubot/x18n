# Third-party notices

x18n adapts code and ideas from [i18n-ally](https://github.com/lokalise/i18n-ally). Each adapted file starts with a line `Adapted from i18n-ally (MIT), <original path>`.

## Adapted files

| x18n file | i18n-ally source |
| --- | --- |
| `packages/builtins/src/finders/pattern.ts` | `src/utils/PathMatcher.ts`, `src/core/loaders/LocaleLoader.ts` (`guessDirStructure`, `findLocaleDirs`) |
| `packages/builtins/src/scanners/regex.ts` | `src/utils/Regex.ts` |
| `packages/builtins/src/manifests/index.ts` | `src/packagesParsers/*` |
| `packages/builtins/src/presets/index.ts` | `src/frameworks/*` |
| `packages/builtins/src/extractors/index.ts` | `src/extraction/*`, `src/core/Extract.ts` |

## i18n-ally license

MIT License

Copyright (c) 2020 Lokalise Inc., Anthony Fu, think2011

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
