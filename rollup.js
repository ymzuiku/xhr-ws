#!/usr/bin/env node

const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript2');
const { uglify } = require('rollup-plugin-uglify');
const { resolve } = require('path');
const pwd = (...args) => resolve(process.cwd(), ...args);
const fs = require('fs-extra');
const argv = process.argv.splice(2);

function clearDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      fs.remove(`$\{dir}/$\{file}`);
    });
  }
}
function haveArgv(...args) {
  let isHave = false;
  args.forEach(str => {
    argv.forEach(v => {
      if (v === str) {
        isHave = true;
      }
    });
  });

  return isHave;
}

clearDir(pwd('umd'));

const watchOptions = {
  external: ['node-rsa', 'axios', '@nuage/jsencrypt'],
  input: './lib/index.ts',
  output: {
    file: './umd/xhr-ws.js',
    format: 'umd',
    name: 'HttpWs',
    sourcemap: true,
    globals: {
      '@nuage/jsencrypt': 'JSEncrypt',
      axios: 'Axios',
      'node-rsa': 'NodeRSA',
    },
  },
  plugins: [
    rollupTypescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: false,
    }),
    uglify({
      sourcemap: true,
    }),
  ],
};
const watcher = rollup.watch(watchOptions);

// event.code can be one of:
//   START        — the watcher is (re)starting
//   BUNDLE_START — building an individual bundle
//   BUNDLE_END   — finished building a bundle
//   END          — finished building all bundles
//   ERROR        — encountered an error while bundling
//   FATAL        — encountered an unrecoverable error
watcher.on('event', event => {
  if (event.code === 'ERROR') {
    console.log(event);
  } else if (event.code === 'BUNDLE_END') {
    // console.log(event);
    console.log('BUNDLE_END');
  } else if (event.code === 'END') {
    if (!haveArgv('--watch', '-w')) {
      watcher.close();
    }
  }
});
