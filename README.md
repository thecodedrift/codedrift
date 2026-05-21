# Codedrift [Posts](https://github.com/jakobo/codedrift/discussions/categories/thunked) | [TIL](https://github.com/jakobo/codedrift/discussions/categories/til) | [AMA](https://github.com/jakobo/codedrift/discussions/categories/ask-me-anything-ama)

Personal Website of Jakob Heuser, available at https://www.codedrift.com

# Stack

- [React Router 7](https://reactrouter.com/) (framework mode, SSR) on [Cloudflare Workers](https://workers.cloudflare.com/)
- [Sanity](https://www.sanity.io/) as the CMS for `/blog` (long-form posts) and `/til` (short notes), with Studio embedded at `/_/studio`
- [Tailwind CSS v4](https://tailwindcss.com/) with the typography plugin
- [`remix-themes`](https://github.com/abereghici/remix-themes) for cookie-based SSR dark/light mode

# Developing

1. `pnpm dev`

# Planned

The Sanity-backed `/blog` and `/til` reader surfaces ship deliberately small. The following are planned as separate, future changes:

- **RSS / Atom feed** at `/feed.xml` covering posts (and optionally TILs).
- **`sitemap.xml`** sourced from Sanity.
- **Tag filter pages** at `/blog/tag/:slug` and `/til/tag/:slug`. The `tag` schema and references are already in place, so these become a route + query addition, not a content migration.
- **Comments**, likely via a social layer on top of the existing surfaces.
- **Port of historical content** from the GitHub Discussions "Thunked" and "TIL" categories into Sanity (one-time migration). The Sanity surfaces work without it.
- **Surface `/blog` and `/til` in the header nav** once there's content worth pointing at. The "writing" link in the header currently still points at GH Discussions.

# Outstanding Issues

- Eventually, I'd like to return to hosting the blog content as dynamic pages. For now, I wanted to get on Astro and off of Ghost. It's probably a big post all its own, but let's just say when you type `pnpm start` and it doesn't because _checks notes_ sqlite3 is missing on a local install that runs differently from your production install, but you just wanted to edit your theme which needs to be a zip file and your dev cycle was to zip everything up, upload it, change the theme live and pray... yeah, I wanted to get off that.

# Bugs? Probably

You could file bugs. They'll be triaged. I file bugs against myself, if only so I remember something's broken.
