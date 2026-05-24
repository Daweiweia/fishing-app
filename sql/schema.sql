-- =====================================================
-- 去哪钓 微信小程序 - 数据库初始化脚本
-- 数据库: fishing_db
-- 说明: 执行顺序：1. schema.sql → 2. seed.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS `fishing_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `fishing_db`;

-- -------------------------------------------------------
-- 1. users 用户表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `openid`      VARCHAR(64)  NOT NULL COMMENT '微信openid',
  `nickname`    VARCHAR(50)   NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar`      VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '头像',
  `bio`         VARCHAR(200)  NOT NULL DEFAULT '' COMMENT '简介',
  `fish_count`  INT           NOT NULL DEFAULT 0 COMMENT '鱼种数',
  `catch_count` INT           NOT NULL DEFAULT 0 COMMENT '鱼获数',
  `spot_count`  INT           NOT NULL DEFAULT 0 COMMENT '钓点数',
  `created_at`  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 2. spots 钓点表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `spots` (
  `id`            INT            NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(100)   NOT NULL COMMENT '钓点名称',
  `latitude`       DECIMAL(10,6)  NULL COMMENT '纬度',
  `longitude`      DECIMAL(10,6)  NULL COMMENT '经度',
  `address`       VARCHAR(255)   NOT NULL DEFAULT '' COMMENT '地址',
  `type`          ENUM('free','pond','wild','lure','boat') NOT NULL DEFAULT 'free' COMMENT '类型',
  `tags`          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT '标签，多个用逗号分隔',
  `rating`        DECIMAL(2,1)   NOT NULL DEFAULT '0.0' COMMENT '评分',
  `checkin_count` INT            NOT NULL DEFAULT 0 COMMENT '去过人数',
  `fish_types`    VARCHAR(255)   NOT NULL DEFAULT '' COMMENT '鱼种',
  `bait`          VARCHAR(255)   NOT NULL DEFAULT '' COMMENT '饵料',
  `open_hours`    VARCHAR(100)   NOT NULL DEFAULT '' COMMENT '开放时间',
  `price`         VARCHAR(50)    NOT NULL DEFAULT '' COMMENT '价格',
  `created_at`    TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 3. catch_logs 鱼获记录表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `catch_logs` (
  `id`           INT            NOT NULL AUTO_INCREMENT,
  `user_id`      INT            NOT NULL COMMENT '用户ID',
  `fish_type_id` INT            NULL COMMENT '鱼种ID',
  `fish_name`    VARCHAR(50)    NOT NULL COMMENT '鱼名',
  `size`         INT            NULL COMMENT '尺寸cm',
  `weight`       DECIMAL(5,2)  NULL COMMENT '重量kg',
  `spot_id`      INT            NULL COMMENT '钓点ID',
  `spot_name`    VARCHAR(100)  NOT NULL DEFAULT '' COMMENT '钓点名称',
  `image`        VARCHAR(255)  NOT NULL DEFAULT '' COMMENT '图片URL',
  `description`  VARCHAR(500)  NOT NULL DEFAULT '' COMMENT '备注描述',
  `created_at`   TIMESTAMP      NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id`  (`user_id`),
  KEY `spot_id`  (`spot_id`),
  CONSTRAINT `catch_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `catch_logs_ibfk_2` FOREIGN KEY (`spot_id`) REFERENCES `spots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 4. posts 帖子表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `posts` (
  `id`            INT      NOT NULL AUTO_INCREMENT,
  `user_id`       INT      NOT NULL COMMENT '用户ID',
  `content`       TEXT     NOT NULL COMMENT '内容',
  `images`        VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '图片URL，多张用逗号分隔',
  `topic`         VARCHAR(50) NOT NULL DEFAULT 'all' COMMENT '话题：skill/gear/spot/fish/all',
  `likes`         INT      NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT      NOT NULL DEFAULT 0 COMMENT '评论数',
  `created_at`    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id`   (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 5. post_likes 帖子点赞表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `post_likes` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `post_id`    INT      NOT NULL COMMENT '帖子ID',
  `user_id`    INT      NOT NULL COMMENT '用户ID',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_user` (`post_id`, `user_id`),
  KEY `idx_post_id` (`post_id`),
  CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 6. comments 评论表（含回复）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `comments` (
  `id`           INT      NOT NULL AUTO_INCREMENT,
  `post_id`      INT      NOT NULL COMMENT '帖子ID',
  `user_id`      INT      NOT NULL COMMENT '用户ID',
  `content`      VARCHAR(500) NOT NULL COMMENT '评论内容',
  `created_at`   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `parent_id`    INT      NULL COMMENT '回复目标评论ID，NULL表示一级评论',
  `reply_to_name` VARCHAR(50) NULL COMMENT '回复目标用户名',
  PRIMARY KEY (`id`),
  KEY `post_id`    (`post_id`),
  KEY `user_id`    (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 7. spot_reviews 钓点点评表
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `spot_reviews` (
  `id`           INT       NOT NULL AUTO_INCREMENT,
  `spot_id`      INT       NOT NULL COMMENT '钓点ID',
  `user_id`      INT       NOT NULL COMMENT '用户ID',
  `user_name`    VARCHAR(50) NOT NULL DEFAULT '匿名用户' COMMENT '评论用户名',
  `user_avatar`  VARCHAR(255) NOT NULL DEFAULT '' COMMENT '评论用户头像',
  `rating`       TINYINT   NOT NULL DEFAULT 5 COMMENT '评分1-5',
  `content`       TEXT      NOT NULL COMMENT '点评内容',
  `fish_result`   VARCHAR(100) NOT NULL DEFAULT '' COMMENT '渔获描述',
  `created_at`   TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_spot_id` (`spot_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `spot_reviews_ibfk_1` FOREIGN KEY (`spot_id`) REFERENCES `spots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 8. fish_types 鱼种表（预留）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fish_types` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50) NOT NULL COMMENT '鱼名',
  `image`       VARCHAR(255) NOT NULL DEFAULT '' COMMENT '图片',
  `description` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '描述',
  `habitat`     VARCHAR(255) NOT NULL DEFAULT '' COMMENT '栖息地',
  `size_range`  VARCHAR(50) NOT NULL DEFAULT '' COMMENT '尺寸范围',
  `created_at`  TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- 9. weather 天气缓存表（预留，暂用实时API）
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weather` (
  `id`             INT       NOT NULL AUTO_INCREMENT,
  `city`           VARCHAR(50) NOT NULL COMMENT '城市',
  `temperature`   INT       NULL COMMENT '温度℃',
  `pressure`       INT       NULL COMMENT '气压hPa',
  `humidity`       INT       NULL COMMENT '湿度%',
  `wind`           VARCHAR(20) NULL COMMENT '风力',
  `water_temp`     INT       NULL COMMENT '水温℃',
  `fishing_index`  TINYINT   NOT NULL DEFAULT 3 COMMENT '钓鱼指数1-5',
  `fishing_advice` VARCHAR(255) NOT NULL DEFAULT '' COMMENT '钓鱼建议',
  `sunrise`        TIME      NULL COMMENT '日出',
  `sunset`         TIME      NULL COMMENT '日落',
  `tide_data`      JSON      NULL COMMENT '潮汐数据',
  `record_date`    DATE      NOT NULL COMMENT '记录日期',
  `created_at`    TIMESTAMP  NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;