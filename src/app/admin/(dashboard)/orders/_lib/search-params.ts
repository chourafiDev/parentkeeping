import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

// URL state of the orders list: ?status=refunded&q=jane@&page=2
export const ORDER_TABS = ["all", "paid", "refunded", "flagged_non_us"] as const;

export const ordersSearchParams = {
	status: parseAsStringLiteral(ORDER_TABS).withDefault("all"),
	q: parseAsString.withDefault(""),
	page: parseAsInteger.withDefault(1),
};

export const ordersSearchParamsCache = createSearchParamsCache(ordersSearchParams);
