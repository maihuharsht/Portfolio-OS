import test from 'node:test';
import assert from 'node:assert/strict';
import { searchPortfolio } from '../src/utils/portfolio-search.js';

const data = {
  applications: { projects: { id: 'projects', name: 'Projects' }, academics: { id: 'academics', name: 'Academic Center' } },
  projects: [{ id: 'alpha', name: 'Alpha', category: 'Web', description: 'Tracking platform', stack: ['JavaScript'] }],
  skills: [{ items: [['JavaScript', 'Browser development']] }],
  semesters: [{ id: 'sem-1', label: 'Semester One', period: '2025' }],
  subjects: [{ id: 'math', name: 'Applied Mathematics', code: 'MTH101', kind: 'theory' }],
  assessments: [{ id: 'lab-1', name: 'Arrays', category: 'coding-lab' }, { id: 'quiz-1', name: 'Quiz', category: 'quiz' }],
  achievements: [{ id: 'award-1', title: 'Hackathon finalist', description: 'Finalist in a student event' }]
};

test('global search covers configured projects, subjects, coding labs and achievements', () => {
  assert.equal(searchPortfolio('tracking', data)[0].kind, 'Project');
  assert.equal(searchPortfolio('mth101', data)[0].id, 'math');
  assert.equal(searchPortfolio('arrays', data)[0].id, 'lab-1');
  assert.equal(searchPortfolio('finalist', data)[0].kind, 'Achievement');
  assert.deepEqual(searchPortfolio('', data), []);
});
