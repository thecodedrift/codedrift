# seo-metadata Specification

## Purpose

Defines the per-route HTML head metadata and on-page semantics that make codedrift discoverable and shareable: unique titles, meta descriptions, viewport configuration, canonical URLs, Open Graph and Twitter Card tags, a single source of truth for identity links, correct heading structure, an author identity surface, and site icons.

## Requirements

### Requirement: Unique document title per route

The system SHALL render a unique, descriptive `<title>` for every reachable route.

#### Scenario: Each route has a distinct title

- **WHEN** any route (homepage, `/about`, `/talks`, `/social`, `/help`, `/blog`, `/blog/<slug>`, `/blog/tag/<slug>`, `/til`, `/til/<slug>`) is server-rendered
- **THEN** the response `<head>` contains exactly one `<title>` whose text describes that specific page and is not identical to an unrelated page's title

### Requirement: Meta description on every indexable route

The system SHALL emit a `<meta name="description">` on every indexable route, including routes that currently lack one (homepage, `/about`, `/talks`, `/social`, `/help`, and every `/til/<slug>` entry).

#### Scenario: Static route renders a description

- **WHEN** a visitor or crawler requests `/`, `/about`, `/talks`, `/social`, or `/help`
- **THEN** the response `<head>` contains a `<meta name="description">` with non-empty content describing the page

#### Scenario: TIL entry renders a description

- **WHEN** a crawler requests `/til/<slug>` for a published TIL
- **THEN** the response `<head>` contains a `<meta name="description">` derived from the TIL's content

### Requirement: Mobile viewport configuration

The system SHALL declare a viewport that enables responsive scaling.

#### Scenario: Viewport includes initial scale

- **WHEN** any page is server-rendered
- **THEN** the `<head>` contains `<meta name="viewport" content="width=device-width, initial-scale=1">`

### Requirement: Self-referencing canonical URL

The system SHALL emit a self-referencing canonical link pointing to the absolute `https://www.codedrift.com` URL for the current path.

#### Scenario: Canonical matches the requested path on the canonical host

- **WHEN** a page is requested at path `<path>`
- **THEN** the `<head>` contains `<link rel="canonical" href="https://www.codedrift.com<path>">`

### Requirement: Open Graph metadata

The system SHALL emit Open Graph metadata on every indexable route, including `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, and `og:image`.

#### Scenario: Route without its own imagery uses the default share image

- **WHEN** a route that has no associated image (e.g. `/about`) is rendered
- **THEN** the `<head>` contains `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, and an `og:image` pointing to the site default share image

#### Scenario: Post with a hero image uses it as the share image

- **WHEN** a post at `/blog/<slug>` that has a `heroImage` is rendered
- **THEN** `og:image` points to a rendered version of that hero image and `og:type` is `article`

### Requirement: Twitter Card metadata

The system SHALL emit Twitter Card metadata on every indexable route.

#### Scenario: Twitter card tags present

- **WHEN** any indexable route is rendered
- **THEN** the `<head>` contains `twitter:card` set to `summary_large_image`, plus `twitter:title`, `twitter:description`, and `twitter:image`

### Requirement: Single source of truth for social identity links

The system SHALL define the list of social/identity profile URLs once and render both the `<link rel="me">` head links and the structured-data `sameAs` array from that single list.

#### Scenario: Identity links and sameAs stay in sync

- **WHEN** the shared social profile list is modified
- **THEN** both the rendered `<link rel="me">` tags and the `Person`/`Organization` `sameAs` array reflect the same set of URLs without separate edits

### Requirement: Exactly one accurate H1 per page

The system SHALL render exactly one `<h1>` element per page whose text accurately describes that page's purpose.

#### Scenario: Help page H1 describes the help page

- **WHEN** a visitor opens `/help`
- **THEN** the page contains exactly one `<h1>` and its text describes the help/offers content (not "Elsewhere on the Web")

#### Scenario: Talks page has a single H1

- **WHEN** a visitor opens `/talks`
- **THEN** the page contains exactly one `<h1>` element; any subsequent section headings use `<h2>` or lower

### Requirement: Author identity surface

The system SHALL provide an `/about` page that presents Jakob Heuser's biography and professional credentials, serving as the human-readable counterpart to the site's `Person` entity.

#### Scenario: About page presents a bio

- **WHEN** a visitor opens `/about`
- **THEN** the page presents biographical and credential content identifying the author (not solely a site colophon)

### Requirement: Site icons

The system SHALL provide a favicon and an apple-touch-icon.

#### Scenario: Apple touch icon is declared

- **WHEN** any page is server-rendered
- **THEN** the `<head>` contains a `<link rel="apple-touch-icon">` referencing an existing asset, in addition to the existing favicon link
