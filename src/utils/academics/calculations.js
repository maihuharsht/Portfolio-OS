export function percentage(obtained, max, digits = 1) {
  if (obtained == null || max == null || !Number.isFinite(obtained) || !Number.isFinite(max) || max <= 0 || obtained < 0) return null;
  return Number(((obtained / max) * 100).toFixed(digits));
}
export function aggregate(records) {
  const valid = records.filter(r => percentage(r.obtained, r.max) !== null);
  if (!valid.length) return { obtained: null, max: null, percentage: null, count: 0 };
  const obtained = valid.reduce((sum, r) => sum + r.obtained, 0), max = valid.reduce((sum, r) => sum + r.max, 0);
  return { obtained, max, percentage: percentage(obtained, max), count: valid.length };
}
export function subjectAggregates(subjects, assessments, semesterId) {
  return subjects.filter(s => s.semesterId === semesterId).map(subject => ({ subject, ...aggregate(assessments.filter(a => a.subjectId === subject.id && a.semesterId === semesterId)) }));
}
export function semesterAggregate(assessments, semesterId) { return aggregate(assessments.filter(a => a.semesterId === semesterId)); }
export function codingLabSummary(records) {
  const summary = aggregate(records);
  return { ...summary, completed: summary.count, pending: records.filter(r => r.obtained == null).length };
}
export function difference(current, previous) {
  if (current?.percentage == null || previous?.percentage == null) return null;
  return Number((current.percentage - previous.percentage).toFixed(1));
}
export function scoreExtremes(records) {
  const valid = records.map(record => ({ record, score: percentage(record.obtained,record.max) })).filter(x => x.score !== null);
  if (!valid.length) return { highest: null, lowest: null };
  return { highest: valid.reduce((a,b) => b.score > a.score ? b : a), lowest: valid.reduce((a,b) => b.score < a.score ? b : a) };
}
export function countAbove(records, threshold) {
  if (!Number.isFinite(threshold)) throw new TypeError('Threshold must be finite');
  return records.filter(r => { const score = percentage(r.obtained,r.max); return score !== null && score >= threshold; }).length;
}
