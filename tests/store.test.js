import test from 'node:test';
import assert from 'node:assert/strict';

const entries = new Map();
globalThis.localStorage = {
  getItem: key => entries.get(key) ?? null,
  setItem: (key, value) => entries.set(key, String(value))
};
globalThis.innerWidth = 1280;
globalThis.innerHeight = 800;
const { state, rememberRecentItem, openWindow, updatePreferences } = await import('../src/core/store.js');
const { applications } = await import('../src/apps/registry.js');

test('recent portfolio items are deduplicated and persisted in local preferences', () => {
  state.preferences = {};
  rememberRecentItem('Project', 'plasticpath', 'PlasticPath', 'projects');
  rememberRecentItem('Subject', 'math', 'Applied Mathematics', 'academics');
  rememberRecentItem('Project', 'plasticpath', 'PlasticPath', 'projects');
  assert.deepEqual(state.preferences.recentItems.map(item => [item.kind, item.id]), [['Project', 'plasticpath'], ['Subject', 'math']]);
  assert.deepEqual(JSON.parse(entries.get('harshit-os')).recentItems, state.preferences.recentItems);
});

test('opening an application persists a typed recent entry', () => {
  state.preferences = {};
  state.windows = [];
  openWindow('about', applications);
  assert.deepEqual(state.preferences.recentItems[0], { kind: 'Application', id: 'about', title: 'About Harshit', appId: 'about' });
  assert.deepEqual(JSON.parse(entries.get('harshit-os')).recentItems, state.preferences.recentItems);
});

test('grid icon positions are persisted as preferences', () => {
  state.preferences = {};
  updatePreferences({ iconPositions: { academics: { col: 2, row: 1 } } });
  assert.deepEqual(JSON.parse(entries.get('harshit-os')).iconPositions, { academics: { col: 2, row: 1 } });
});
