# Curio — Content-Based Recommendation System

Curio is a professional recommendation application created for CodSoft Artificial Intelligence Internship Task 4. It recommends movies, books, and products from a local catalog of 90 items.

## Recommendation logic

Each item is converted into a weighted keyword vector. Category, creator or brand, language, tags, and description receive category-aware weights. Inverse document frequency reduces the impact of common terms. Curio then measures cosine similarity between items and the user's liked items, combines that score with selected preferences, rating, recent activity, and dislikes, and provides a plain-language explanation.

## Features

- 30 movies, 30 books, and 30 products in a local JSON dataset
- Search, category filters, sorting, match percentages, and recommendation reasons
- Like/dislike preference learning and manual profile interests
- Favourites, recently viewed items, and recommendation history
- Responsive cards with item-specific movie posters, book covers, product photography, metadata, ratings, and descriptions
- Dark and light modes, loading states, refresh controls, and local persistence
- No paid API, account, or server database required

## Run locally

Install Node.js 22 or newer, run `npm install`, then `npm run dev`. Open the local URL displayed in the terminal.
