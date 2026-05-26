## ADDED Requirements

### Requirement: Site-wide Person/Organization entity

The system SHALL emit a JSON-LD `Person` (and/or `Organization`) entity on every page, including a stable `@id`, `name`, `url`, and a `sameAs` array sourced from the shared social profile list.

#### Scenario: Person entity present on every page

- **WHEN** any route is server-rendered
- **THEN** the `<head>` contains a valid `application/ld+json` script declaring a `Person`/`Organization` with `name`, `url`, a stable `@id`, and a `sameAs` array listing the site's identity URLs

### Requirement: BlogPosting structured data on posts

The system SHALL emit `BlogPosting` (Article) JSON-LD on each post page, including `headline`, `datePublished`, `dateModified`, `author` referencing the site `Person` `@id`, and `image` when a hero image exists.

#### Scenario: Post emits BlogPosting

- **WHEN** a visitor opens `/blog/<slug>` for a published post
- **THEN** the `<head>` contains `application/ld+json` of type `BlogPosting` with `headline` matching the post title, `datePublished` from `publishedAt`, `dateModified` from `_updatedAt`, and `author` referencing the site `Person`

### Requirement: Breadcrumb structured data on tag pages

The system SHALL emit `BreadcrumbList` JSON-LD on tag pages reflecting the Blog → Tag hierarchy.

#### Scenario: Tag page emits breadcrumbs

- **WHEN** a visitor opens `/blog/tag/<slug>`
- **THEN** the `<head>` contains `application/ld+json` of type `BreadcrumbList` with an ordered list whose items are Blog (`/blog`) then the tag name (`/blog/tag/<slug>`)

### Requirement: HowTo structured data on eligible TIL entries

The system SHALL emit `HowTo` JSON-LD for a TIL only when the TIL document provides author-supplied structured how-to steps, and the markup SHALL match the steps shown on the page.

#### Scenario: TIL with how-to steps emits HowTo

- **WHEN** a TIL document defines structured how-to steps and a visitor opens `/til/<slug>`
- **THEN** the `<head>` contains `application/ld+json` of type `HowTo` whose steps correspond to the steps rendered in the page body

#### Scenario: TIL without how-to steps emits no HowTo

- **WHEN** a TIL document defines no structured how-to steps
- **THEN** the page emits no `HowTo` JSON-LD

### Requirement: FAQ structured data on eligible content

The system SHALL emit `FAQPage` JSON-LD only when a document provides author-supplied question/answer pairs, and the markup SHALL match the Q&A shown on the page.

#### Scenario: Content with FAQ pairs emits FAQPage

- **WHEN** a document defines structured question/answer pairs and the page is rendered
- **THEN** the `<head>` contains `application/ld+json` of type `FAQPage` whose questions and answers match those displayed on the page

### Requirement: Structured data validity

All emitted JSON-LD SHALL be syntactically valid and SHALL only describe content present on the page.

#### Scenario: Emitted JSON-LD parses

- **WHEN** any page's `application/ld+json` blocks are parsed as JSON
- **THEN** each block parses without error and contains a recognized `@type`

#### Scenario: Markup matches visible content

- **WHEN** a page emits `HowTo` or `FAQPage` markup
- **THEN** every step/question described in the markup is also visible in the rendered page body
