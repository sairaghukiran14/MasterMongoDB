# 🍃 Master MongoDB

An interactive app to **learn and master MongoDB fast** — 10 challenges per topic,
beginner → advanced, **100 hands-on exercises** that run **real MongoDB queries in your browser**.

You type actual query syntax (`db.movies.find(...)`, `db.reviews.aggregate([...])`),
the app executes it against a sample database using an in-browser MongoDB engine
([mingo](https://github.com/kofrasa/mingo)), and checks your result against the
expected answer — instantly, no server or Atlas account needed.

## Getting started

```bash
npm install
npm run dev      # open the printed localhost URL
```

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build
npm test         # runs every reference solution against the data (sanity check)
```

## The 10 topics (10 challenges each)

1. **Find & Read Basics** — `find`, `findOne`, equality, `countDocuments`
2. **Query Operators** — `$gt/$lt/$in/$nin/$ne`, `$or`, implicit AND, nested fields
3. **Projection** — include/exclude fields, drop `_id`, dot-notation projection
4. **Sorting & Pagination** — `sort`, `limit`, `skip`, compound sorts, top-k
5. **Array Queries** — `$all`, `$size`, `$in`, `$elemMatch`, membership matching
6. **Aggregation: Match & Shape** — `$match`, `$project`, computed fields, `$count`
7. **Aggregation: Grouping** — `$group` + `$sum/$avg/$min/$max/$push`
8. **Aggregation: Unwinding Arrays** — `$unwind`, per-element grouping, two-level group
9. **Aggregation: Joins** — `$lookup` (incl. array joins), multi-join, orphan detection
10. **Advanced Aggregation** — `$addFields`, `$bucket`, `$facet`, `$switch`, `$replaceRoot`, `$slice`

## Features

- **Real query execution** — not multiple choice; you write and run genuine MongoDB syntax.
- **Instant checking** — order-aware where it matters; shows *your result* vs *expected* on a miss.
- **Progressive hints** and a reveal-able **reference solution** with a one-click "load into editor".
- **Plain-English explanation** shown on every correct answer to cement the concept.
- **Progress tracking** saved in `localStorage`, with per-topic and overall progress bars.
- **Database browser** — inspect the `movies`, `users`, and `reviews` sample collections and their schemas any time.
- Keyboard shortcut: **⌘/Ctrl + Enter** to check.

## How answer-checking works

For each challenge the app runs *your* query and the *reference* query against the same
freshly-cloned data, then deep-compares the results (as a set, or order-sensitive for
sorting challenges). This means many equivalent phrasings of a query are accepted — as
long as the output matches.

## Project structure

```
src/
  data.js         # sample collections (movies, users, reviews) + schema notes
  challenges.js   # all 100 challenges (prompt, hints, solution, explanation)
  engine.js       # in-browser MongoDB runtime + result comparison
  main.js         # UI, routing, progress
  style.css
scripts/
  validate-challenges.mjs   # `npm test` — verifies all 100 solutions execute
```

Add your own challenges by extending the arrays in `src/challenges.js`, then run
`npm test` to confirm every reference solution still executes.
