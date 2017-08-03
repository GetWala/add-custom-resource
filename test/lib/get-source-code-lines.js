'use strict';

const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

test('reads, splits and escapes source', t => {
  const escapeJsonNode = sinon.mock().exactly(2).onCall(0).returns('foo').onCall(1).returns('bar');
  const readFileSync = sinon.mock().returns(Buffer.from(`asdf\r\nqwerty`));

  const getSourceCodeLines = proxyquire('../../lib/get-source-code-lines', {
    'escape-json-node': escapeJsonNode,
    'fs': {
      readFileSync
    }
  });

  const sourceCodeLines = getSourceCodeLines();

  readFileSync.verify();
  escapeJsonNode.verify();

  t.true(sourceCodeLines[0] === 'foo');
  t.true(sourceCodeLines[1] === 'bar');
});
