# Product Intent

## Purpose
Travel-Dating is a memory-first trip archive for two operators.
The product is not a generic social app or public planner.
It exists to capture places, reviews, photos, and lightweight shared trip context.

## Primary Users
- Two operators maintaining the site and its content
- Read-only visitors who may browse existing memories

## Product Priorities
1. Stable read experience
2. Safe content editing for authenticated users
3. Clear trip summaries, highlights, and review flows
4. Small, reversible improvements over large rewrites

## Non-Goals
- Multi-tenant collaboration for many users
- Full autonomous deployment
- Schema churn without explicit approval
- Feature work that weakens existing review, auth, or Supabase flows

## Quality Bar
- No broken home/detail/review flow
- No unsafe HTML rendering or unsafe external links
- Empty states must render cleanly
- Authenticated actions must fail safely
- Mobile detail navigation must stay usable
