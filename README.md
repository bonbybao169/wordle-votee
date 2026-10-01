# wordle-votee

A Node.js solver for the [Votee Wordle API](https://wordle.votee.dev:8000). It guesses 5-letter words from `dicts.txt` against a seeded random puzzle and prints each turn until it solves the word (or gives up after 40 guesses).

## Credits and Reference

I use dictionary file from this git account:
https://gist.github.com/dracos/dd0668f281e685bad51479e5acaadb93

## Requirements

- [Node.js](https://nodejs.org/) 18 or later (`fetch` is used with no extra packages)
- Network access to `https://wordle.votee.dev:8000`
- Run commands from the repo root so `dicts.txt` can be read

There is nothing to install. This project has no npm dependencies.

## Run

```bash
node index.js
```

That uses a random seed, so each run is a different puzzle.

To replay or share a specific puzzle, pass a seed:

```bash
node index.js 42
```

The same seed always maps to the same secret word on the API.

## Output

Each guess is logged as:

```text
Turn 1: arise -> 🟩⬛🟨⬛⬛
```

Tiles match the API result for that letter:

| Tile | Meaning                                |
| ---- | -------------------------------------- |
| 🟩   | correct letter in the correct position |
| 🟨   | letter is in the word, wrong position  |
| ⬛   | letter is not in the word              |

On success:

```text
Solved! The answer is <word>
```

If it cannot solve within 40 turns:

```text
Solve failed!
```
