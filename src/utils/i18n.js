// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
  return this.$te('route.' + title)
    ? this.$t('route.' + title)
    : title
}
