export function normalizeIconPositions(ids, saved = {}, columns = 1, rows = ids.length) {
  const cols = Math.max(1, Math.floor(columns));
  const rowCount = Math.max(1, Math.floor(rows), Math.ceil(ids.length / cols));
  const occupied = new Set();
  const positions = {};
  const key = ({ col, row }) => `${col}:${row}`;
  for (const id of ids) {
    const candidate = saved?.[id];
    if (Number.isInteger(candidate?.col) && Number.isInteger(candidate?.row) && candidate.col >= 0 && candidate.col < cols && candidate.row >= 0 && candidate.row < rowCount && !occupied.has(key(candidate))) {
      positions[id] = { col: candidate.col, row: candidate.row };
      occupied.add(key(candidate));
      continue;
    }
    let index = 0;
    let next;
    do {
      next = { col: Math.floor(index / rowCount), row: index % rowCount };
      index++;
    } while (occupied.has(key(next)));
    positions[id] = next;
    occupied.add(key(next));
  }
  return positions;
}

export function moveIconPosition(ids, saved, id, col, row, columns, rows) {
  const positions = normalizeIconPositions(ids, saved, columns, rows);
  if (!positions[id]) return positions;
  const target = {
    col: Math.max(0, Math.min(Math.floor(columns) - 1, Math.floor(col))),
    row: Math.max(0, Math.min(Math.max(Math.floor(rows), Math.ceil(ids.length / Math.max(1, Math.floor(columns)))) - 1, Math.floor(row)))
  };
  const displaced = ids.find(other => other !== id && positions[other].col === target.col && positions[other].row === target.row);
  if (displaced) positions[displaced] = positions[id];
  positions[id] = target;
  return positions;
}
