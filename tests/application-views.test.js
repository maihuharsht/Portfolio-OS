import test from 'node:test';
import assert from 'node:assert/strict';
import { applications } from '../src/apps/registry.js';
import { semesters, suppliedCgpa } from '../src/data/academics/semesters.js';
import { subjects } from '../src/data/academics/subjects.js';
import { academicMetrics, standoutSubjects, semesterSubjects, gpaSeries, validScore } from '../src/utils/academics/analytics.js';
import { profile } from '../src/data/profile.js';
import { projects } from '../src/data/projects.js';
import { skills } from '../src/data/skills.js';
import { github } from '../src/data/github.js';
import { shortcuts, pins, applications as registry } from '../src/apps/registry.js';
import { readFile } from 'node:fs/promises';

test('every registered application renders content from the shared application registry',()=>{
  for(const app of Object.values(applications)){
    const html=app.render({appState:{},preferences:{}});
    assert.equal(typeof html,'string',`${app.id} should return markup`);
    assert.ok(html.length>80,`${app.id} should have substantive content`);
  }
});

test('academic app renders the five data-driven sections and semester records',()=>{
  const academic=applications.academics.render;
  for(const section of ['overview','semesters','standout','subjects','insights']) assert.match(academic({appState:{section,semesterId:'sem-1'},preferences:{}}),/Academic Center/);
  assert.match(academic({appState:{section:'semesters',semesterId:'sem-4'},preferences:{}}),/CFOC692M/);
  assert.match(academic({appState:{section:'overview'},preferences:{}}),/Semester GPA progression/);
});

test('supplied GPAs, CGPA, and all 44 subject rows are retained',()=>{
 assert.deepEqual(semesters.map(x=>x.gpa),[8.48,8.61,9.04,9]); assert.equal(suppliedCgpa,8.82);assert.equal(subjects.length,44);assert.equal(gpaSeries()[2].gpa,9.04);
});

test('technical subjects are filtered and sorted by marks without misclassifying Wildlife Ecology',()=>{
 const scores=standoutSubjects();assert.equal(scores[0].code,'BITE201P');assert.equal(scores.find(x=>x.code==='BCSE101E').marks,96);assert.equal(scores.find(x=>x.code==='BITE302P').marks,95);assert.equal(scores.find(x=>x.code==='BITE307P').marks,94);assert.ok(!scores.some(x=>x.code==='CFOC575M'));
 assert.equal(standoutSubjects(subjects,{query:'no such course'}).length,0);assert.equal(standoutSubjects(subjects,{semester:'sem-4'}).every(x=>x.semesterId==='sem-4'),true);
});

test('summary metrics use supplied records and highest overall subject accurately',()=>{
 const m=academicMetrics();assert.equal(m.bestSemester.id,'sem-3');assert.equal(m.bestTechnical.marks,98);assert.equal(m.highestOverall.name,'Wildlife Ecology');assert.equal(m.technical90Count,6);assert.equal(semesterSubjects('sem-2').length,11);
});

test('academic detail view and filters keep unknown fields honest',()=>{
 const view=applications.academics.render({appState:{section:'subjects',subjectDetail:'bite201p'},preferences:{}});
 assert.match(view,/Data Structures and Algorithms Lab/);assert.doesNotMatch(view,/Assessment breakdowns|attendance data/);assert.equal(validScore(null),false);assert.equal(validScore(101),false);assert.equal(validScore(0),true);
 assert.doesNotMatch(view,/Course type|Credits|credit/i);
 const semestersView=applications.academics.render({appState:{section:'semesters',semesterId:'sem-1'},preferences:{}});
 assert.doesNotMatch(semestersView,/Course type|Credits|credit/i);
 assert.deepEqual(standoutSubjects(subjects,{semester:'sem-4'}).map(x=>x.code),['BITE302P','BITE307P','BITE304P']);
});

test('resume facts populate profile, projects, skills, and the resume download view',()=>{
 assert.match(profile.education,/CGPA 8\.82\/10/);assert.equal(profile.email,'singhharshit9900@gmail.com');
 assert.equal(projects.length,3);assert.ok(projects.some(x=>x.name==='PlasticPath'));assert.ok(projects.some(x=>x.name==='Suraj Engineering Works Website'));
 assert.ok(skills.some(group=>group.items.some(([name])=>name==='C++')));
 const resume=applications.resume.render({appState:{},preferences:{}});assert.match(resume,/Download PDF/);assert.match(resume,/Artificial Intelligence/);
});

test('academic app contains no class-ranking section',()=>{
 const html=applications.academics.render({appState:{section:'insights'},preferences:{}});
 assert.doesNotMatch(html,/leaderboard|class rank|percentile/i);
});

test('GitHub shortcut and all in-app profile links use the configured profile',()=>{
 const url='https://github.com/maihuharsht';
 assert.equal(github.profileUrl,url);assert.equal(profile.githubUsername,'maihuharsht');
 assert.equal(registry.github.name,'GitHub Profile');assert.ok(shortcuts.includes('github'));assert.ok(pins.includes('github'));
 for(const id of ['github','resume','contact']) assert.ok(registry[id].render({appState:{},preferences:{}}).includes(url));
});

test('lock-screen copy removes the explanatory theme label and uses the shared type scale',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const tokens=await readFile(new URL('../src/styles/tokens.css',import.meta.url),'utf8');
 const styles=await readFile(new URL('../src/styles/shell.css',import.meta.url),'utf8');
 assert.doesNotMatch(html,/RCB-inspired/i);assert.match(tokens,/--font-body:17px/);assert.match(styles,/font-weight:450/);assert.match(styles,/\.lock-unlock-button:focus-visible/);
 assert.match(html,/<div class="lock-center"><p id="lock-date"><\/p><time id="lock-clock">/);
 assert.match(html,/<div class="lock-profile"><img class="lock-avatar" src="\/public\/assets\/harshit-avatar\.webp" alt=""><p class="lock-profile-name">Harshit Singh<\/p><p class="unlock-hint">Press Enter to unlock<\/p>/);
 assert.match(html,/<link rel="icon" href="\/public\/assets\/favicon\.ico"/);assert.match(html,/<link rel="apple-touch-icon"/);assert.match(styles,/\.lock-avatar,.avatar-large,.personal-mark\{object-fit:cover/);
 assert.doesNotMatch(html,/class="lock-brand"|class="lock-status"/);
 assert.match(styles,/\.lock-wallpaper::before/);assert.match(styles,/\.lock-wallpaper::after/);assert.match(styles,/prefers-reduced-motion:reduce/);
});


