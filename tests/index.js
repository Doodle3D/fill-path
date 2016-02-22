import test from 'tape';
import fillPath from '../lib/index.js';

test('one closed path', (assert) => {
  const path = rect();
  const actual = fillPath(path, { x: 5, y: 5 });
  const expected = [[{ x: 1, y: 1 }, { x: 1, y: 9 }, { x: 9, y: 9 }, { x: 9, y: 1 }]];
  assert.ok(actual.length === 1, 'should generate one path')
  assert.deepEqual(actual, expected, 'should generate inner path');
  assert.end();
});

function rect(x = 0, y = 0, w = 10, h = 10) {
  return [[
    { x, y },
    { x: w + x, y },
    { x: w + x, y: h + y },
    { x, y: h + y },
    { x, y }
  ]];
}
