# component-migration Specification

## Purpose

Defines the set of React (TSX) components, page routes, and styles that replace the existing Astro components and pages during the migration to React Router. Ensures visual and functional parity between the Astro site and the React Router site so that the user-facing experience does not regress.

## Requirements

### Requirement: Icon components as React TSX

The system SHALL provide React components for all 6 icons (chevron-left, chevron-right, chat, heart, sun, moon) in `app/components/icons/`. Each component SHALL accept a `className` prop, render inline SVG with `fill="currentColor"`, and produce identical SVG output to the current Astro icon components.

#### Scenario: Icon renders with custom className

- **WHEN** an icon component is rendered with `className="h-6 w-6 text-gray-500"`
- **THEN** the SVG element receives those classes and renders identically to the Astro version

### Requirement: Content prose wrapper component

The system SHALL provide a `app/components/content.tsx` React component that wraps children in an `<article>` element with the full set of Tailwind Typography prose classes (including dark mode variants) matching the current `Content.astro` component.

#### Scenario: Content component wraps children in prose styling

- **WHEN** the Content component renders with child HTML content
- **THEN** the content is wrapped in an article with prose classes including `prose-lg`, `prose-stone`, `dark:prose-invert`, and all the current dark mode overrides

### Requirement: Home page route

The system SHALL provide a home route at `/` rendering the introduction text ("Hey, I'm Jakob"), the Taskless link, and the writing links about code and people. The content SHALL be identical to the current `index.astro`.

#### Scenario: Home page renders at root path

- **WHEN** a user navigates to `/`
- **THEN** the page displays the greeting, Taskless link, and writing topic links within the codedrift layout

### Requirement: Talks page route

The system SHALL provide a route at `/talks` with the title "Talks and Speaking", rendering the full list of talks with slide/video/example links and the "Microphone Optional" section. Content SHALL be identical to the current `talks.astro`.

#### Scenario: Talks page renders talk archive

- **WHEN** a user navigates to `/talks`
- **THEN** the page displays all talks with their associated links (slides, videos, examples) and the speaker policy text, wrapped in the Content prose component

### Requirement: Social page route

The system SHALL provide a route at `/social` with the title "Jakob Elsewhere on the Web", rendering the active and inactive social profile lists. Content SHALL be identical to the current `social.astro`.

#### Scenario: Social page renders profile lists

- **WHEN** a user navigates to `/social`
- **THEN** the page displays "Active Profiles" and "Inactive Profiles" sections with all social links

### Requirement: Help page route

The system SHALL provide a route at `/help` with the title "Here to Help", rendering the networking, investing, advising, interview prep, and mentoring sections. Content SHALL be identical to the current `help.astro`.

#### Scenario: Help page renders all support sections

- **WHEN** a user navigates to `/help`
- **THEN** the page displays all help sections (Network, Investing, Advising, Interview Prep, Mentoring) wrapped in the Content prose component

### Requirement: About page route

The system SHALL provide a route at `/about` with the title "About Jakob", rendering the colophon text including licensing, design philosophy, typography details, and previous versions section. Content SHALL be identical to the current `about.astro`.

#### Scenario: About page renders colophon

- **WHEN** a user navigates to `/about`
- **THEN** the page displays the licensing info, design philosophy, font details, and site history

### Requirement: Page titles follow consistent pattern

Each page route SHALL set a title via the layout. Pages with a title prop SHALL render as `"{title} - The CodeDrift - Jakob Heuser"`. The home page (no title prop) SHALL render as `"The CodeDrift - Jakob Heuser"`.

#### Scenario: Page with title renders suffixed title

- **WHEN** a user navigates to `/talks`
- **THEN** the document title is "Talks and Speaking - The CodeDrift - Jakob Heuser"

#### Scenario: Home page renders default title

- **WHEN** a user navigates to `/`
- **THEN** the document title is "The CodeDrift - Jakob Heuser"

### Requirement: Global CSS migration

The system SHALL carry over `global.css` to `app/styles/global.css` with the `@source` directive updated to scan `.tsx` files instead of `.astro` files. All theme tokens, texture backgrounds, the `.as-link` utility, and the smooth scroll rule SHALL be preserved.

#### Scenario: Tailwind scans TSX source files

- **WHEN** the build processes CSS
- **THEN** Tailwind detects all utility classes used in `.tsx` files and generates the corresponding CSS
