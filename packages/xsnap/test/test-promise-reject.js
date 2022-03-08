// JavaScript correctness tests

import '@endo/init';

// @ts-check
// eslint-disable-next-line import/no-extraneous-dependencies
import test from 'ava';
import * as proc from 'child_process';
import * as os from 'os';
import { xsnap } from '../src/xsnap.js';
import { options } from './message-tools.js';

const io = { spawn: proc.spawn, os: os.type() }; // WARNING: ambient

async function makeWorker() {
  const opts = options(io);
  const vat = xsnap(opts);

  await vat.evaluate(`
    globalThis.handleCommand = bytes => {
      const report = {};
      Promise.reject(new Error('lose'));
      gc();
      report.result = ArrayBuffer.fromString(JSON.stringify(true));
      return report;
    };
  `);

  return {
    /** @param { string } src */
    async run(src) {
      const { reply } = await vat.issueStringCommand(src);
      return JSON.parse(reply);
    },
    async gc() {
      return vat.issueCommand('gc');
    },
  };
}

test('XS unhandled promise rejection', async t => {
  const w = await makeWorker();

  const x = await w.run('2+3');
  t.is(x, true);
  /* const y = await w.run(code);
  t.is(y, true); 
  await w.gc(); */
});
