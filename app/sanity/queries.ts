export const POST_INDEX_QUERY = `*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  excerpt,
  "tags": tags[]->{ _id, name, slug },
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  excerpt,
  heroImage,
  body,
  "tags": tags[]->{ _id, name, slug },
}`;

export const TIL_INDEX_QUERY = `*[_type == "til" && defined(publishedAt)] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  "tags": tags[]->{ _id, name, slug },
}`;

export const TIL_BY_SLUG_QUERY = `*[_type == "til" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  body,
  "tags": tags[]->{ _id, name, slug },
}`;
