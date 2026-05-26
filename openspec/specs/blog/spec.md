# blog Specification

## Purpose

Defines the Sanity-backed reading surfaces (`/blog` and `/til`) and the authoring infrastructure (embedded Sanity Studio, schemas, Portable Text rendering, image pipeline) that power codedrift's CMS-backed content. Posts and TILs live in two distinct URL namespaces sharing a single rendering pipeline. Studio is mounted same-origin under `/_/studio/*` for single-login content management.

## Requirements

### Requirement: Posts reading surface

The system SHALL expose a reader surface for long-form posts under `/blog`, sourced from Sanity `post` documents.

#### Scenario: Visitor opens the post index

- **WHEN** a visitor navigates to `/blog`
- **THEN** the system returns an HTML page listing all `post` documents that have a defined `publishedAt`, ordered by `publishedAt` descending, each linking to `/blog/<slug>`

#### Scenario: Visitor opens a published post

- **WHEN** a visitor navigates to `/blog/<slug>` and a `post` document exists with `slug.current == <slug>` and a defined `publishedAt`
- **THEN** the system returns an HTML page rendering the post's title, publication date, hero image (if any), and body as Portable Text

#### Scenario: Visitor opens a slug that does not match any post

- **WHEN** a visitor navigates to `/blog/<slug>` and no `post` document matches
- **THEN** the system returns an HTTP 404 response

#### Scenario: Unpublished post is not readable

- **WHEN** a `post` document exists but has no `publishedAt` set
- **THEN** the system SHALL NOT include it in `/blog` listings and SHALL return 404 for `/blog/<slug>` requests targeting it

### Requirement: TIL reading surface

The system SHALL expose a reader surface for short notes under `/til`, sourced from Sanity `til` documents and addressed in a URL namespace distinct from posts.

#### Scenario: Visitor opens the TIL index

- **WHEN** a visitor navigates to `/til`
- **THEN** the system returns an HTML page listing all `til` documents that have a defined `publishedAt`, ordered by `publishedAt` descending, each linking to `/til/<slug>`

#### Scenario: Visitor opens a published TIL

- **WHEN** a visitor navigates to `/til/<slug>` and a `til` document exists with `slug.current == <slug>` and a defined `publishedAt`
- **THEN** the system returns an HTML page rendering the TIL's title, publication date, and body as Portable Text

#### Scenario: TIL slug collision with a post slug is permitted

- **WHEN** a `post` document and a `til` document share the same slug value
- **THEN** `/blog/<slug>` resolves to the post and `/til/<slug>` resolves to the TIL independently, with no validation conflict between the two types

#### Scenario: Visitor opens a slug that does not match any TIL

- **WHEN** a visitor navigates to `/til/<slug>` and no `til` document matches
- **THEN** the system returns an HTTP 404 response

### Requirement: Portable Text rendering

The system SHALL render the `body` field of `post` and `til` documents as Portable Text, producing semantic HTML for headings, paragraphs, lists, links, blockquotes, inline images, and code blocks.

#### Scenario: Code block is rendered with syntax highlighting

- **WHEN** a Portable Text body contains a `code` block with a populated `language` field
- **THEN** the system renders the code with Prism-based syntax highlighting appropriate to the declared language

#### Scenario: Inline image resolves through Sanity's image CDN

- **WHEN** a Portable Text body contains an `image` block referencing a Sanity asset
- **THEN** the system renders an `<img>` whose `src` is built by `@sanity/image-url` against the configured project and dataset

#### Scenario: Unknown block type is rendered as a no-op

- **WHEN** a Portable Text body contains a block type the renderer has no serializer for
- **THEN** the system SHALL omit the block from output rather than throw

### Requirement: Tag taxonomy

The system SHALL model tags as a `tag` document type with `name` and `slug` fields. Both `post.tags` and `til.tags` SHALL be arrays of references to `tag` documents.

#### Scenario: Editor creates a tag

- **WHEN** an editor creates a `tag` document with a unique slug
- **THEN** the tag becomes available for reference from both `post.tags` and `til.tags`

#### Scenario: Tag reference is broken

- **WHEN** a `post` or `til` references a `tag` document that has been deleted
- **THEN** the system SHALL omit the missing reference from rendered output without throwing

### Requirement: Embedded Sanity Studio at `/_/studio`

The system SHALL mount a same-origin instance of Sanity Studio at `/_/studio/*`, code-split so the Studio bundle is not delivered to visitors of any other route.

#### Scenario: Editor opens Studio

- **WHEN** an editor navigates to `/_/studio`
- **THEN** the system serves an HTML shell that lazily loads Studio and signs the editor in against the configured Sanity project

#### Scenario: Visitor opens a non-Studio route

- **WHEN** a visitor navigates to any route outside `/_/studio/*`
- **THEN** the response payload SHALL NOT include the Studio bundle

#### Scenario: Studio is excluded from search engines

- **WHEN** any `/_/studio/*` URL is requested
- **THEN** the response includes a `noindex, nofollow` robots directive

### Requirement: Sanity client uses published perspective by default

The system SHALL read Sanity content using `perspective: 'published'`. The system SHALL NOT serve draft content to public reader routes.

#### Scenario: Loader reads a draft

- **WHEN** a `post` or `til` exists only as a draft in Sanity
- **THEN** the public `/blog`, `/blog/:slug`, `/til`, and `/til/:slug` routes SHALL behave as though the document does not exist

### Requirement: Sanity configuration is environment-driven

The system SHALL read `SANITY_PROJECT_ID` and `SANITY_DATASET` from worker `vars` and `SANITY_API_READ_TOKEN` from worker secrets. The system SHALL NOT hard-code project or dataset identifiers in source.

#### Scenario: Required environment value is missing at runtime

- **WHEN** the worker starts and any of `SANITY_PROJECT_ID`, `SANITY_DATASET`, or `SANITY_API_READ_TOKEN` is missing
- **THEN** requests to any Sanity-backed route SHALL fail loudly (5xx) rather than silently fall back to a default project

### Requirement: Header navigation is unchanged at launch

The system SHALL ship the `/blog` and `/til` reader surfaces without adding header navigation links to them. The existing "writing" link in `codedrift-layout` SHALL continue to point to GitHub Discussions until manually updated.

#### Scenario: Visitor inspects the header nav after the change ships

- **WHEN** a visitor loads any page rendered through `codedrift-layout`
- **THEN** the header nav links SHALL be identical to the pre-change set, with no `/blog` or `/til` entry added

### Requirement: Image alternative text

The reading surfaces SHALL render meaningful `alt` text for content imagery rather than silently emitting empty `alt` attributes. Hero images SHALL use an author-provided alt value when present, falling back to the document title; in-body Portable Text images SHALL use their author-provided alt value, and a missing value SHALL be treated as an authoring gap rather than a permanent empty string.

#### Scenario: Hero image has descriptive alt

- **WHEN** a post with a `heroImage` is rendered and the hero has no explicit alt set
- **THEN** the rendered `<img>` uses the post title as its `alt` text rather than an empty string

#### Scenario: In-body image carries author alt

- **WHEN** a Portable Text image block defines an `alt` value
- **THEN** the rendered `<img>` uses that value as its `alt` attribute

### Requirement: Visible content revision date

The post reading surface SHALL display a visible "Updated" date only when the author has explicitly set a revision date (`updatedAt`), in addition to the publication date. The Sanity system timestamp (`_updatedAt`) SHALL NOT drive the visible date, because bulk imports/migrations set it on every document. Structured-data `dateModified` MAY still fall back to `_updatedAt`.

#### Scenario: Author-revised post shows an updated date

- **WHEN** a post has an author-set `updatedAt` value
- **THEN** the post page displays both the original publication date and a visible "Updated" date reflecting `updatedAt`

#### Scenario: Post without an explicit revision date shows only publication date

- **WHEN** a post has no author-set `updatedAt` value (even if its `_updatedAt` system timestamp is later than `publishedAt`)
- **THEN** the post page displays only the publication date and no visible "Updated" date
