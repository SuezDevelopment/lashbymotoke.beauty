# Resources Feature Guide

This document describes the Resources feature for LashByMotoke.beauty: data model, admin workflows, public pages, SEO practices, and API usage.

## Data Model

Collection: `resources`

Fields:
- `_id`: string (Mongo ObjectId as string on reads)
- `title`: string (required)
- `slug`: string (required, unique)
- `summary`: string (short description, used for meta description)
- `content`: string (HTML content; sanitize before inserting if you allow rich text)
- `heroImage`: string (optional URL)
- `category`: string (optional)
- `tags`: string[] (optional)
- `status`: `draft | published | archived`
- `ctaLabel`: string (optional)
- `ctaHref`: string (optional URL)
- `updatedAt`: string (ISO timestamp)

Indexes:
- `slug` (unique)
- Consider indexes on `status`, `category`, and `tags` for faster filtering.

## Admin Portal

Route: `/admin/resources`

Capabilities:
- List, filter (category/tag), paginate
- Create/edit resources in a modal
- Publish/unpublish by setting status
- Preview public content when published
- Delete resources
- All admin CRUD actions are protected by role-based permissions: `resources:read` and `resources:write`.

Audit logging:
- CRUD operations log events under `resources:create`, `resources:update`, `resources:delete`, and reads use `resources:list`.

## Public Pages

Routes:
- `/resources` — listing page with SSR, SEO component, CTAs, and schema enhancements.
- `/resources/[slug]` — detail page with SSR. Renders hero image, content, category/tags, and CTA.

Requirements:
- Only `status=published` are shown publicly.
- Ensure content is semantic and accessible: headings, lists, alt attributes, link text.

## APIs

Admin: `POST/PUT/DELETE/GET /api/admin/resources`
- Auth required; role permissions applied
- Supports filters: `query`, `category`, `tag`, `status`, `limit`, `offset`

Public: `GET /api/resources`
- Query params: `query`, `category`, `tag`, `limit`, `offset`
- Results include only `status=published`

Examples:
- `GET /api/resources?category=aftercare&limit=12`
- `GET /api/admin/resources?status=draft&tag=lashes`

## SEO Guidelines

Titles and descriptions:
- Title: include the resource topic and brand (e.g., "Lash Extension Aftercare — LashByMotoke Academy")
- Description: concise 140–160 characters from `summary` or curated content

Keywords:
- Use natural keyword variants in headings and content; avoid stuffing
- Include relevant tags (e.g., lashes, brows, aftercare, training)

Structured data:
- Consider `Article` or `HowTo` schema for applicable resources
- Include `BreadcrumbList` on detail pages

Internal linking:
- Link related resources by tag/category
- Include CTAs to services and academy application where relevant

## Publishing Workflow

1. Create resource in admin portal as `draft`
2. Add title, summary, content, hero image, category, and tags
3. Add CTA label/link if applicable
4. Preview in admin; verify formatting and accessibility
5. Publish (set `status=published`)
6. Confirm public listing and detail page render correctly

## Maintenance

- Archive outdated content (`status=archived`) to remove from public while retaining history
- Use audit logs to monitor view patterns and editorial actions
- Prune old audit logs from `/admin/audit` when retention requires

## Notes

- SSR ensures resources are indexable and performant for search engines
- Keep images optimized and add descriptive alt text
- Redirects configured: `/trainings` → `/academy` (including nested paths)