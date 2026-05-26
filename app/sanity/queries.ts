export const POST_INDEX_QUERY = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  "tags": tags[]->{ _id, name, slug, type } | order(select(type == "category" => 0, type == "topic" => 1, type == "era" => 2, 3) asc, name asc),
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  updatedAt,
  excerpt,
  heroImage,
  body,
  "tags": tags[]->{ _id, name, slug, type } | order(select(type == "category" => 0, type == "topic" => 1, type == "era" => 2, 3) asc, name asc),
}`;

export const POSTS_BY_TAG_QUERY = `{
  "tag": *[_type == "tag" && slug.current == $slug][0] { _id, name, "slug": slug.current, type },
  "posts": *[_type == "post" && defined(publishedAt) && $slug in tags[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    "tags": tags[]->{ _id, name, slug, type } | order(select(type == "category" => 0, type == "topic" => 1, type == "era" => 2, 3) asc, name asc),
  }
}`;

export const TIL_INDEX_QUERY = `*[_type == "til" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  "tags": tags[]->{ _id, name, slug, type } | order(select(type == "category" => 0, type == "topic" => 1, type == "era" => 2, 3) asc, name asc),
}`;

export const SITEMAP_QUERY = `{
  "posts": *[_type == "post" && defined(publishedAt) && defined(slug.current)] | order(publishedAt desc) { "slug": slug.current, publishedAt, _updatedAt },
  "tils": *[_type == "til" && defined(publishedAt) && defined(slug.current)] | order(publishedAt desc) { "slug": slug.current, publishedAt, _updatedAt },
  "tags": *[_type == "tag" && defined(slug.current)] | order(name asc) { "slug": slug.current, _updatedAt }
}`;

export const TIL_BY_SLUG_QUERY = `*[_type == "til" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  body,
  howToSteps[]{ name, text },
  faq[]{ question, answer },
  "tags": tags[]->{ _id, name, slug, type } | order(select(type == "category" => 0, type == "topic" => 1, type == "era" => 2, 3) asc, name asc),
}`;
