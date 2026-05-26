## ADDED Requirements

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
