// The three-way split of a big ticket: causes.ts groups by cause, desk-notes.json names the
// reports the desk read differently. Here each report counts once, under the problem it is.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'one-day move' | 'unplaced';

export type Problem = {
  key: ProblemKey;
  reports: Report[];
  taggedAs: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function problemsOf(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[]
): Problem[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const keyOf = (r: Report): ProblemKey =>
    oneDayMove.includes(r.id) ? 'one-day move' : (causeOf(r, tenantOf(r)) ?? 'unplaced');

  const byKey = new Map<ProblemKey, Report[]>();
  for (const r of merged) {
    const key = keyOf(r);
    byKey.set(key, [...(byKey.get(key) ?? []), r]);
  }

  return [...byKey.entries()]
    .map(([key, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        key,
        reports: rs,
        taggedAs: rs.reduce<Record<string, number>>(
          (n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }),
          {}
        ),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
