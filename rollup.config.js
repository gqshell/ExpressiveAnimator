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

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

export default [
  {
    input: 'src/index.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: 'public/build/bundle.js',
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
          sourceMap: !production
        }),
        compilerOptions: {
          // enable run-time checks when not in production
          dev: !production
        }
      }),
      svg(),
      // we'll extract any component CSS out into
      // a separate file - better for performance
      // css({output: 'bundle.css'}),
      postcss({
        extract: 'bundle.css',
        plugins: [
          postcssImport,
          // postcssVarFallback,
          production && cssnano,
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
      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `public` directory and refresh the
      // browser on changes when not in production
      !production && livereload('public'),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser()
    ],
    watch: {
      clearScreen: false
    }
  }
];
