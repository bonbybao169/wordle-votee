import fs from "node:fs";

const BASE_URL = "https://wordle.votee.dev:8000";
const WORD_SIZE = 5;
const seed = process.argv[2] ?? Math.floor(Math.random() * 1e6);

const TILES = { c: "🟩", p: "🟨", a: "⬛" };

const dicts = fs
  .readFileSync("dicts.txt", "utf-8")
  .split("\n")
  .map((word) => word.trim())
  .filter((word) => word.length === WORD_SIZE);

const guessSecret = async (guessWord) => {
  const res = await fetch(
    `${BASE_URL}/random?guess=${guessWord}&&seed=${seed}`,
  );

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status}`);
  }

  const data = await res.json();

  return data.map((e) => e.result[0]).join("");
};

const matchSecret = (secretWord, guessWord) => {
  return [...guessWord]
    .map((ch, i) =>
      ch === secretWord[i] ? "c" : secretWord.includes(ch) ? "p" : "a",
    )
    .join("");
};

const pickWord = (list) => {
  const freq = {};

  for (const word of list) {
    for (const ch of new Set(word)) {
      freq[ch] = (freq[ch] || 0) + 1;
    }
  }

  const value = (word) => {
    return [...new Set(word)].reduce((sum, ch) => sum + freq[ch], 0);
  };

  return list.reduce((best, w) => (value(w) > value(best) ? w : best));
};

// example pickWord:
// car
// cat
// toy
// freq: {c: 2, a: 2, r: 1, t:2, o: 1, y: 1}
// value car: c(2) + a(2) + r(1) = 5
// value cat: c(2) + a(2) + t(2) = 6 -> best
// value toy: t(2) + o(1) + y(1) = 4

async function main() {
  let candidates = dicts;
  const known = Array(WORD_SIZE).fill(null); // contatin character correct
  const present = new Set(); // contain character is present but not correct
  const absent = new Set(); // contain character is absent
  const probed = new Set(); // contain character that will process word out of dictionary
  const ORDER = [..."abcdefghijklmnopqrstuvwxyz"];

  for (let turn = 1; turn < 41; turn++) {
    let guess;

    if (candidates.length) {
      guess = pickWord(candidates);
    } else if (known.every(Boolean)) {
      guess = known.join("");
    } else {
      const unknown = ORDER.filter((ch) => !absent.has(ch) && !present.has(ch));

      if (unknown.length) {
        guess = Array.from(
          { length: WORD_SIZE },
          (_, i) => unknown[i % unknown.length],
        ).join("");
      } else {
        const letter = [...present].find((ch) => !probed.has(ch));
        probed.add(letter);
        guess = letter.repeat(SIZE);
      }
    }

    const feedback = await guessSecret(guess);

    const tiles = [...feedback].map((r) => TILES[r]).join("");
    console.log(`Turn ${turn}: ${guess} -> ${tiles}`);

    if (feedback === "ccccc") {
      return console.log(`Solved! The answer is ${guess}`);
    }

    candidates = candidates.filter(
      (word) => matchSecret(word, guess) === feedback,
    );

    [...guess].forEach((ch, i) => {
      if (feedback[i] === "c") {
        known[i] = ch;
      }

      if (feedback[i] === "p") {
        present.add(ch);
      }

      if (feedback[i] === "a") {
        absent.add(ch);
      }
    });
  }

  console.log("Solve failed!");
}

main();
