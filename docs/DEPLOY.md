# Enable GitHub Pages (required — 30 seconds)

Your build **already succeeded** and files are on the `gh-pages` branch.
The site is 404 only because Pages is not turned on for this repo.

## Steps

1. Open: https://github.com/eswarchandravidyasagar/ai-fitness/settings/pages
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `gh-pages` → folder **`/ (root)`** → **Save**
4. Wait ~1 minute
5. Open: https://eswarchandravidyasagar.github.io/ai-fitness/

## Verify

- `gh-pages` branch exists with `index.html` (already done)
- Latest workflow run: green check on "Deploy to GitHub Pages"

## Alternative: deploy via your portfolio repo

If you prefer not to enable Pages on this repo, add the bundled deploy steps
from `docs/portfolio-deploy-snippet.yml` to your portfolio workflow at
`eswarchandravidyasagar.github.io/.github/workflows/deploy.yml` and push.
That serves the app at the same URL using your existing portfolio Pages setup.
