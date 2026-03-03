# Datasets

## Question sources

- **General catalog (300 questions)**: official Leben in Deutschland question set from the Bundesamt für Migration und Flüchtlinge (BAMF). The questions are mirrored as JSON files under `public/questions/`.
- **Bundesland-specific (160 questions)**: each German state contributes 10 municipality questions; those JSON files live in `public/bundesland/` and are keyed by state code + city data.
- **Static storage**: because the data is static JSON, the client fetches the relevant files on demand (general vs. state-specific) and indexes them in memory.

## JSON structure

Each question entry follows this shape:

```json
{
  "id": "string",
  "question": "text",
  "answers": ["option A", "option B", "option C", "option D"],
  "correct": [0, 2],
  "explanation": "optional",
  "lang": "de|en|bn",
  "bundesland": "optional"
}
```

- `correct` is an array of zero-based indexes (some questions allow multiple correct answers).
- `lang` enables multilingual variants (German, English, Bengali) when provided.
- `bundesland` signals which state the question belongs to; omit for general questions.

## Adding new languages or states

1. **Languages**: add localized copies of each question object, adjust `languages.js` with the new label, and ensure the UI can switch to that locale.
2. **States**: add the new state JSON under `public/bundesland/`, update `bundeslaender.js` metadata, and ensure the dropdown in the UI includes the new entry.
3. **Sync**: if the BAMF catalog updates, download the latest JSON, replace the static files, and verify the question count (currently 460 total).
