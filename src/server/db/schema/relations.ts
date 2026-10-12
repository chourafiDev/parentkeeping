import { relations } from "drizzle-orm";
import { accounts, sessions, users } from "./auth";
import { files, productFiles, productImages, products } from "./catalog";
import { downloadTokens, downloads, orderEvents, orderItems, orders } from "./orders";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  files: many(productFiles),
  images: many(productImages),
  orderItems: many(orderItems),
}));

export const filesRelations = relations(files, ({ many }) => ({
  products: many(productFiles),
  downloads: many(downloads),
}));

export const productFilesRelations = relations(productFiles, ({ one }) => ({
  product: one(products, { fields: [productFiles.productId], references: [products.id] }),
  file: one(files, { fields: [productFiles.fileId], references: [files.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  events: many(orderEvents),
  tokens: many(downloadTokens),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, { fields: [orderEvents.orderId], references: [orders.id] }),
  actor: one(users, { fields: [orderEvents.actorId], references: [users.id] }),
}));

export const downloadTokensRelations = relations(downloadTokens, ({ one, many }) => ({
  order: one(orders, { fields: [downloadTokens.orderId], references: [orders.id] }),
  downloads: many(downloads),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  token: one(downloadTokens, { fields: [downloads.tokenId], references: [downloadTokens.id] }),
  file: one(files, { fields: [downloads.fileId], references: [files.id] }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));
