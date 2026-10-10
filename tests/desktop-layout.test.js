import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIconPositions, moveIconPosition } from '../src/utils/desktop-layout.js';

test('desktop icon positions fill a grid and repair invalid or colliding saved positions', () => {
  const positions = normalizeIconPositions(['a', 'b', 'c'], { a: { col: 1, row: 1 }, b: { col: 1, row: 1 }, c: { col: -1, row: 0 } }, 2, 2);
  assert.deepEqual(positions, { a: { col: 1, row: 1 }, b: { col: 0, row: 0 }, c: { col: 0, row: 1 } });
});

test('moving an icon snaps to a grid cell and swaps occupied icons without overlap', () => {
  const positions = moveIconPosition(['a', 'b'], { a: { col: 0, row: 0 }, b: { col: 1, row: 0 } }, 'a', 1.8, 0, 2, 2);
  assert.deepEqual(positions, { a: { col: 1, row: 0 }, b: { col: 0, row: 0 } });
});
