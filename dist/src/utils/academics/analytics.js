import { semesters, suppliedCgpa } from '../../data/academics/semesters.js';
import { subjects } from '../../data/academics/subjects.js';

export const gpaSeries = (data=semesters) => data.map(({id,label,gpa,number})=>({id,label,gpa,number}));
export const validScore = value => Number.isFinite(value) && value >= 0 && value <= 100;
export const standoutCourseCodes = Object.freeze(['BITE201P','BCSE101E','BITE302P','BITE307P','BCSE103E','BITE202P','BCSE102P','BITE304P']);
const standoutCourseSet = new Set(standoutCourseCodes);
export const isTechnical = subject => standoutCourseSet.has(subject.code);
export function standoutSubjects(data=subjects,{query='',semester='all',sort='score',includeBelow80=false}={}) {
  const q=query.trim().toLocaleLowerCase();
  return data.filter(s=>isTechnical(s)&&(validScore(s.marks)||s.marks==null)&&(includeBelow80||s.marks>=80)&&(semester==='all'||s.semesterId===semester)&&(!q||`${s.name} ${s.code}`.toLocaleLowerCase().includes(q)))
    .sort((a,b)=>sort==='semester'?a.semesterId.localeCompare(b.semesterId)||b.marks-a.marks||a.name.localeCompare(b.name):b.marks-a.marks||a.name.localeCompare(b.name));
}
export const semesterSubjects = (id,data=subjects) => data.filter(s=>s.semesterId===id);
export function academicMetrics(data=subjects,terms=semesters) {
 const bestSemester=[...terms].sort((a,b)=>b.gpa-a.gpa)[0]??null;
 const technical=standoutSubjects(data,{includeBelow80:true}),bestTechnical=technical[0]??null;
 const highestOverall=data.filter(s=>validScore(s.marks)).sort((a,b)=>b.marks-a.marks||a.name.localeCompare(b.name))[0]??null;
 return {cgpa:suppliedCgpa,bestSemester,semesterCount:terms.length,bestTechnical,technical90Count:technical.filter(s=>s.marks>=90).length,highestOverall,currentSemester:[...terms].sort((a,b)=>b.number-a.number)[0]??null};
}
