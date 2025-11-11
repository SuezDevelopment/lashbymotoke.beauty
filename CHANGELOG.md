# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-11-11

### Added
- Resources feature: public listing (/resources) and detail pages (/resources/[slug]) with SSR and SEO.
- Admin Resources portal: /admin/resources with list, filters, pagination, create/edit modal, publish/unpublish, preview, and delete.
- CRUD APIs: /api/admin/resources (secured) and /api/resources (public) supporting filters and pagination.
- Documentation: docs/resources.md covering model, workflows, APIs, and SEO guidelines.

### Changed
- Rebrand "Trainings" to "LashByMotoke Academy": new routes /academy and /academy/apply, navigation labels updated.
- Navigation: header and mobile menus now include "Academy" and "Resources"; footer includes "Resources" link.
- Redirects: /trainings and /trainings/* now redirect to /academy and /academy/*.

### Audit & Logs
- Extended audit logging across admin views (users, services, training programs, email templates, applications).
- Audit Logs UI upgraded with pagination, filters, CSV export, and retention pruning control.

### Notes
- Ensure environment variables for MongoDB are set: MONGODB_URI and MONGO_DB_NAME.
- Start dev server on an available port if 3000 is used; e.g., `npm run dev -- -p 3002`.