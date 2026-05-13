-- CreateIndex
CREATE INDEX `backlog_items_user_id_idx` ON `backlog_items`(`user_id`);

-- CreateIndex
CREATE INDEX `reviews_user_id_idx` ON `reviews`(`user_id`);

-- CreateIndex
CREATE INDEX `reviews_backlog_item_id_idx` ON `reviews`(`backlog_item_id`);

-- CreateIndex
CREATE INDEX `follows_follower_id_idx` ON `follows`(`follower_id`);

-- CreateIndex
CREATE INDEX `follows_following_id_idx` ON `follows`(`following_id`);
