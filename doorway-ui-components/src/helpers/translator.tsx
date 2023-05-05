// Pass the doorway-uic polyglot implementation through to the one that is
// located within Bloom UIC. This is because:
//
// 1. it is not ldeal to implement two separate translators, and,
// 2. favor Bloom over Doorway UIC because the majority of components will
// continue to come from Bloom UIC.
import { t, locale, addTranslation } from "@bloom-housing/ui-components"

export { t as default, t, locale, addTranslation }
