# tools/data

## title-hashes.json

The official-title denylist for the IP rule (design doc D3): skills never quote an official control or clause title of a copyrighted framework.

- The file holds only sha256 digests of normalized titles. No title is ever committed to this public repository.
- `tools/validate.mjs` loads it unconditionally from its own directory (never from the checkout it validates), so the check runs on every pull request, including fork PRs validated by the trusted base copy.
- Matching: titles and skill text are normalized the same way (NFKD, diacritics removed, lowercase, every run of characters outside `[a-z0-9]` becomes one space). Every window of 3 to 8 consecutive words of a skill, across line breaks, is hashed and looked up. A title longer than 8 words is hashed on its first 8 words.
- Scope: titles of 4 words or more. Shorter titles are mostly terms of art ("segregation of duties", "business impact analysis") that a practitioner skill must be free to use; the generic names of management systems are excluded for the same reason (see `TERMS_OF_ART` in `tools/build-title-hashes.mjs`).
- Source: populated from licensed internal framework data (the ISMS Copilot framework knowledge modules, frameworks marked copyrighted), held off-repo. Populate or refresh only from licensed internal data, never from the web.

Refresh (maintainers):

```
node tools/build-title-hashes.mjs <off-repo titles.txt> --source "<label>"
node tools/validate.mjs && node --test tools/*.test.mjs
```

A maintainer can add extra titles for a local run without committing them: `GRCSKILLS_TITLE_DENYLIST=<file> node tools/validate.mjs` hashes the file's lines and adds them to the committed list.
