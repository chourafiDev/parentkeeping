import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

// URL state of the subscribers list: ?status=newsletter&q=gmail&source=…&country=US&page=2
export const SUBSCRIBER_TABS = ["all", "newsletter", "file_only", "unsubscribed"] as const;

export const subscribersSearchParams = {
	status: parseAsStringLiteral(SUBSCRIBER_TABS).withDefault("all"),
	q: parseAsString.withDefault(""),
	source: parseAsString.withDefault(""),
	country: parseAsString.withDefault(""),
	page: parseAsInteger.withDefault(1),
};

export const subscribersSearchParamsCache = createSearchParamsCache(subscribersSearchParams);
