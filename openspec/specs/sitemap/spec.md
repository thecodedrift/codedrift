# sitemap Specification

## Purpose

Defines the XML sitemap codedrift serves to crawlers: a well-formed `/sitemap.xml` that enumerates every indexable URL, excludes internal and unpublished routes, carries last-modified timestamps for content, and is cacheable at the edge.

## Requirements

### Requirement: Sitemap route

The system SHALL serve a valid XML sitemap at `/sitemap.xml` with `Content-Type: application/xml`.

#### Scenario: Sitemap is reachable and well-formed

- **WHEN** a crawler requests `/sitemap.xml`
- **THEN** the system returns HTTP 200 with `Content-Type: application/xml` and a well-formed `<urlset>` document

### Requirement: Sitemap enumerates indexable URLs

The sitemap SHALL include every published post, every published TIL, every tag page, and the static marketing routes (`/`, `/about`, `/talks`, `/social`, `/help`, `/blog`, `/til`).

#### Scenario: Published content appears in the sitemap

- **WHEN** a `post` or `til` document has a defined `publishedAt`
- **THEN** its canonical URL appears as a `<loc>` in the sitemap

#### Scenario: Tag and static pages appear

- **WHEN** the sitemap is generated
- **THEN** it contains a `<loc>` for each tag page and for each static marketing route

### Requirement: Sitemap excludes non-indexable URLs

The sitemap SHALL NOT include the Studio route, action/resource routes, or unpublished content.

#### Scenario: Unpublished and internal routes are excluded

- **WHEN** a `post` or `til` has no `publishedAt`, or the route is `/_/studio/*`, `/action/*`, or `/sitemap.xml` itself
- **THEN** that URL does not appear in the sitemap

### Requirement: Sitemap last-modified timestamps

Each sitemap entry for a content document SHALL carry a `<lastmod>` derived from the document's most recent update timestamp.

#### Scenario: Entry carries lastmod

- **WHEN** a post or TIL is included in the sitemap
- **THEN** its `<url>` entry contains a `<lastmod>` value based on the document's `_updatedAt` (or `publishedAt` when no update exists)

### Requirement: Sitemap caching

The sitemap response SHALL include a cache header so it can be served from the edge without querying Sanity on every request.

#### Scenario: Response is cacheable

- **WHEN** `/sitemap.xml` is requested
- **THEN** the response includes a `Cache-Control` header permitting public caching with a non-zero max-age
