export function searchPortfolio(query, { applications = {}, projects = [], skills = [], semesters = [], subjects = [], assessments = [], achievements = [] } = {}) {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return [];
  const items = [
    ...Object.values(applications).map(app => ({ title: app.name, kind: 'Application', id: app.id, appId: app.id, text: app.name })),
    ...projects.map(project => ({ title: project.name, kind: 'Project', id: project.id, appId: 'projects', text: `${project.name} ${project.category ?? ''} ${project.description ?? ''} ${(project.stack ?? []).join(' ')}` })),
    ...skills.flatMap(group => (group.items ?? []).map(([name, note]) => ({ title: name, kind: 'Technology', id: name, appId: 'skills', text: `${name} ${note}` }))),
    ...semesters.map(semester => ({ title: semester.label, kind: 'Semester', id: semester.id, appId: 'academics', text: `${semester.label} ${semester.period ?? ''}` })),
    ...subjects.map(subject => ({ title: subject.name, kind: 'Subject', id: subject.id, appId: 'academics', text: `${subject.name} ${subject.code} ${subject.kind}` })),
    ...assessments.filter(assessment => assessment.category === 'coding-lab').map(assessment => ({ title: assessment.name, kind: 'Coding lab', id: assessment.id, appId: 'academics', text: `${assessment.name} ${assessment.category} ${assessment.semesterId}` })),
    ...achievements.map((achievement, index) => {
      const title = achievement.title ?? achievement.name ?? `Achievement ${index + 1}`;
      return { title, kind: 'Achievement', id: achievement.id ?? title, appId: 'achievements', text: `${title} ${achievement.description ?? ''} ${achievement.organization ?? ''} ${achievement.date ?? ''}` };
    })
  ];
  return items.filter(item => item.text.toLowerCase().includes(q)).slice(0, 16);
}
