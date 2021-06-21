import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import {terser} from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import svg from "rollup-plugin-svg";
import importResolver from "rollup-plugin-import-resolver";
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

const production = !process.env.ROLLUP_WATCH;
const GLOBALS = {
  '@zindex/canvas-engine': 'Zindex.CanvasEngine',
};
const EXTERNAL = Object.keys(GLOBALS);

const CONFIG = [
  {
    input: 'src/index.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: 'dist/expressive-animator.js',
      globals: GLOBALS,
    },
    external: EXTERNAL,
    plugins: [
      importResolver({
        extensions: ['.js', '.mjs', '.ts', '.css', '.pcss', '.svelte'],
        packageJson: true,
      }),
      svelte({
        preprocess: sveltePreprocess({
          sourceMap: true
        }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: true
        }
      }),
      svg(),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      // css({output: 'bundle.css'}),
      postcss({
        extract: 'expressive-animator.css',
        plugins: [
          postcssImport,
        ],
      }),
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      typescript({
        sourceMap: false,
        inlineSources: false
      }),
    ],
    watch: {
      clearScreen: false
    }
  }
];

if (production) {
  CONFIG.push({
    input: 'src/index.ts',
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'app',
      file: 'dist/expressive-animator.min.js',
      globals: GLOBALS,
    },
    external: EXTERNAL,
    plugins: [
      importResolver({
        extensions: ['.js', '.mjs', '.ts', '.css', '.pcss', '.svelte'],
        packageJson: true,
      }),
      svelte({
        preprocess: sveltePreprocess({
          sourceMap: false
        }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: false
        }
      }),
      svg(),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      // css({output: 'bundle.css'}),
      postcss({
        extract: 'expressive-animator.min.css',
        plugins: [
          postcssImport,
          // postcssVarFallback,
          cssnano,
        ],
      }),
      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration -
      // consult the documentation for details:
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      commonjs(),
      typescript({
        sourceMap: false,
        inlineSources: false
      }),
      terser()
    ],
    watch: {
      clearScreen: false
    }
  });
}

export default CONFIG;
