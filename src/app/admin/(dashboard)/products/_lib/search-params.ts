import { createSearchParamsCache, parseAsString, parseAsStringLiteral } from "nuqs/server";

// URL state of the products list: ?status=draft&q=binder&sort=sales
export const PRODUCT_TABS = ["active", "draft", "archived", "all"] as const;
export const PRODUCT_SORTS = ["sales", "downloads", "title", "created"] as const;

export const productsSearchParams = {
	status: parseAsStringLiteral(PRODUCT_TABS).withDefault("active"),
	q: parseAsString.withDefault(""),
	sort: parseAsStringLiteral(PRODUCT_SORTS).withDefault("sales"),
};

export const productsSearchParamsCache = createSearchParamsCache(productsSearchParams);
