// Runs every reference solution against the sample data to make sure each one
// executes and returns a sane, non-empty result. Run with: npm test
import { collections } from "../src/data.js";
import { topics } from "../src/challenges.js";
import { runQuery } from "../src/engine.js";

let total = 0, failures = 0, empties = 0;

for (const topic of topics) {
  if (topic.challenges.length !== 10) {
    console.error(`✗ ${topic.id} has ${topic.challenges.length} challenges (expected 10)`);
    failures++;
  }
  for (const ch of topic.challenges) {
    total++;
    const res = runQuery(ch.solution, collections);
    if (!res.ok) {
      failures++;
      console.error(`✗ [${topic.id}/${ch.id}] ERROR: ${res.error}\n    ${ch.solution}`);
      continue;
    }
    const v = res.value;
    const isEmpty =
      v == null ||
      (Array.isArray(v) && v.length === 0);
    if (isEmpty) {
      empties++;
      console.warn(`⚠ [${topic.id}/${ch.id}] returned empty/null result\n    ${ch.solution}`);
    }
  }
}

console.log(`\n${total} challenges checked · ${failures} errors · ${empties} empty results`);
process.exit(failures ? 1 : 0);
