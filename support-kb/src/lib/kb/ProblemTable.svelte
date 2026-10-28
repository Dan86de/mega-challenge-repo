<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { problemsOf } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  // One row per problem the ticket's reports actually describe; each report counts once.
  // `tickets` maps a problem key to the ticket filed for it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const problems = $derived(problemsOf(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(problems.reduce((n, p) => n + p.reports.length, 0));
  const tags = (p: { taggedAs: Record<string, number> }) =>
    Object.entries(p.taggedAs)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{problems.length}</strong>
  {problems.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th>ticket filed</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.key)}
      <tr>
        <td><code>{p.key}</code></td>
        <td>{p.reports.length}</td>
        <td class="tags">{tags(p)}</td>
        <td>{p.tenants}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>
          {#if tickets[p.key]}<a href={tickets[p.key]}>{tickets[p.key].split('/').slice(-2).join('/')}</a>{:else}none{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
</style>
