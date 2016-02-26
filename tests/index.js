import test from 'tape';
import fillPath from '../src/index.js';

test('hit one closed path', (assert) => {
  const paths = [rect()];
  const actual = fillPath(paths, { x: 5, y: 5 });
  const expected = [ [ { x: 9, y: 1 }, { x: 9, y: 9 }, { x: 1, y: 9 }, { x: 1, y: 1 } ] ];
  assert.ok(actual.length === 1, 'should generate one path')
  assert.deepEqual(actual, expected, 'should generate inner path');
  assert.end();
});

test('miss one closed path', (assert) => {
  const paths = [rect()];
  const actual = fillPath(paths, { x: 15, y: 15 });
  const expected = [];
  assert.ok(actual.length === 0, 'should generate no paths')
  assert.deepEqual(actual, expected, 'should generate empty path');
  assert.end();
});

test('hit one closed path with hole', (assert) => {
  const paths = [rect(0, 0, 30, 30), rect(10, 10, 10, 10)];
  const actual = fillPath(paths, { x: 5, y: 5 });
  const expected = [ [ { x: 29, y: 1 }, { x: 29, y: 29 }, { x: 1, y: 29 }, { x: 1, y: 1 } ], [ { x: 20, y: 9 }, { x: 10, y: 9 }, { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 9, y: 20 }, { x: 10, y: 21 }, { x: 20, y: 21 }, { x: 21, y: 20 }, { x: 21, y: 10 } ] ];
  assert.ok(actual.length === 2, 'should generate two paths')
  assert.deepEqual(actual, expected, 'should generate path with hole');
  assert.end();
});

function rect(x = 0, y = 0, w = 10, h = 10) {
  return [
    { x, y },
    { x: w + x, y },
    { x: w + x, y: h + y },
    { x, y: h + y },
    { x, y }
  ];
}
