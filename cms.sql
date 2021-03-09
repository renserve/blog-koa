/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 100413
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 100413
 File Encoding         : 65001

 Date: 02/09/2020 19:52:29
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cms_group
-- ----------------------------
DROP TABLE IF EXISTS `cms_group`;
CREATE TABLE `cms_group`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分组名称，例如：搬砖者',
  `model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `menuIds` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分组信息：例如：搬砖的人',
  `authIds` varchar(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分组信息：例如：搬砖的人',
  `info` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分组信息：例如：搬砖的人',
  `level` int(2) DEFAULT 3 COMMENT '分组级别 1：root 2：guest 3：user（root、guest分组只能存在一个)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_group
-- ----------------------------
INSERT INTO `cms_group` VALUES (1, 'root', 'article,other', NULL, NULL, '超级管理员', 1);
INSERT INTO `cms_group` VALUES (2, 'guest', 'article,other', NULL, NULL, '游客组', 2);

-- ----------------------------
-- Table structure for cms_menu
-- ----------------------------
DROP TABLE IF EXISTS `cms_menu`;
CREATE TABLE `cms_menu`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `parentId` int(11) NOT NULL DEFAULT 0 COMMENT '父级路由ID',
  `title` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '权限按钮' COMMENT '路由名称，例如：网站设置',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '路由唯一NAME，例如：Home',
  `path` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '路由路径',
  `method` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '请求方式',
  `icon` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '图标',
  `type` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0' COMMENT 'top：顶部菜单 left：左侧菜单  button:按钮',
  `permissionCode` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '权限CODE，例如：图书',
  `sort` int(11) DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `cms_menu_model`(`model`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_menu
-- ----------------------------
INSERT INTO `cms_menu` VALUES (1, 'article', 0, '权限管理', NULL, '/cms', NULL, NULL, 'left', NULL, 0);
INSERT INTO `cms_menu` VALUES (2, 'article', 1, '用户管理', NULL, '/cms/user/index', NULL, NULL, 'left', 'cms_user', 0);
INSERT INTO `cms_menu` VALUES (3, 'article', 1, '分组管理', NULL, '/cms/group/index', NULL, NULL, 'left', 'cms_group', 0);
INSERT INTO `cms_menu` VALUES (4, 'article', 1, '模块管理', NULL, '/cms/model/index', NULL, NULL, 'left', 'cms_model', 0);
INSERT INTO `cms_menu` VALUES (5, 'article', 1, '菜单管理', NULL, '/cms/menu/index', NULL, NULL, 'left', 'cms_menu', 0);
INSERT INTO `cms_menu` VALUES (6, 'article', 1, '操作日志', NULL, '/cms/log/index', NULL, NULL, 'left', 'cms_log', 0);
INSERT INTO `cms_menu` VALUES (7, 'article', 2, '添加操作', NULL, 'cms_user_add', 'post', NULL, 'button', 'cms_user_add', NULL);
INSERT INTO `cms_menu` VALUES (8, 'article', 2, '修改操作', NULL, 'cms_user_edit', 'put', NULL, 'button', 'cms_user_edit', NULL);
INSERT INTO `cms_menu` VALUES (9, 'article', 2, '删除操作', NULL, 'cms_user_del', 'delete', NULL, 'button', 'cms_user_del', NULL);
INSERT INTO `cms_menu` VALUES (10, 'article', 3, '添加操作', NULL, 'cms_group_add', 'post', NULL, 'button', 'cms_group_add', NULL);
INSERT INTO `cms_menu` VALUES (11, 'article', 3, '删除操作', NULL, 'cms_group_del', 'delete', NULL, 'button', 'cms_group_del', NULL);
INSERT INTO `cms_menu` VALUES (12, 'article', 3, '修改操作', NULL, 'cms_group_edit', 'put', NULL, 'button', 'cms_group_edit', NULL);
INSERT INTO `cms_menu` VALUES (13, 'article', 4, '添加操作', NULL, 'cms_model_add', 'post', NULL, 'button', 'cms_model_add', NULL);
INSERT INTO `cms_menu` VALUES (14, 'article', 4, '修改操作', NULL, 'cms_model_edit', 'put', NULL, 'button', 'cms_model_edit', NULL);
INSERT INTO `cms_menu` VALUES (15, 'article', 4, '删除操作', NULL, 'cms_model_del', 'delete', NULL, 'button', 'cms_model_del', NULL);
INSERT INTO `cms_menu` VALUES (16, 'article', 5, '添加操作', NULL, 'cms_menu_add', 'post', NULL, 'button', 'cms_menu_add', NULL);
INSERT INTO `cms_menu` VALUES (17, 'article', 5, '修改操作', NULL, 'cms_menu_edit', 'put', NULL, 'button', 'cms_menu_edit', NULL);
INSERT INTO `cms_menu` VALUES (18, 'article', 5, '删除操作', NULL, 'cms_menu_del', 'delete', NULL, 'button', 'cms_menu_del', NULL);
INSERT INTO `cms_menu` VALUES (19, 'article', 6, '修改操作', NULL, 'cms_log_edit', 'put', NULL, 'button', 'cms_log_edit', NULL);
INSERT INTO `cms_menu` VALUES (20, 'article', 6, '添加操作', NULL, 'cms_log_add', 'post', NULL, 'button', 'cms_log_add', NULL);
INSERT INTO `cms_menu` VALUES (21, 'article', 6, '删除操作', NULL, 'cms_log_del', 'delete', NULL, 'button', 'cms_log_del', NULL);
INSERT INTO `cms_menu` VALUES (22, 'article', 0, '分类管理', NULL, '/admin/category/index', NULL, NULL, 'left', 'cms_category', 0);
INSERT INTO `cms_menu` VALUES (23, 'article', 22, '添加操作', NULL, 'cms_category_add', 'post', NULL, 'button', 'cms_category_add', NULL);
INSERT INTO `cms_menu` VALUES (24, 'article', 22, '修改操作', NULL, 'cms_category_edit', 'put', NULL, 'button', 'cms_category_edit', NULL);
INSERT INTO `cms_menu` VALUES (25, 'article', 22, '删除操作', NULL, 'cms_category_del', 'delete', NULL, 'button', 'cms_category_del', NULL);
INSERT INTO `cms_menu` VALUES (26, 'article', 0, '标签管理', NULL, '/admin/tag/index', NULL, NULL, 'left', 'cms_tag', 0);
INSERT INTO `cms_menu` VALUES (27, 'article', 26, '添加操作', NULL, 'cms_tag_add', 'post', NULL, 'button', 'cms_tag_add', NULL);
INSERT INTO `cms_menu` VALUES (28, 'article', 26, '修改操作', NULL, 'cms_tag_edit', 'put', NULL, 'button', 'cms_tag_edit', NULL);
INSERT INTO `cms_menu` VALUES (29, 'article', 26, '删除操作', NULL, 'cms_tag_del', 'delete', NULL, 'button', 'cms_tag_del', NULL);
INSERT INTO `cms_menu` VALUES (30, 'article', 0, '留言管理', NULL, '/admin/message/index', NULL, NULL, 'left', 'cms_message', 0);
INSERT INTO `cms_menu` VALUES (31, 'article', 30, '添加操作', NULL, 'cms_message_add', 'post', NULL, 'button', 'cms_message_add', NULL);
INSERT INTO `cms_menu` VALUES (32, 'article', 30, '修改操作', NULL, 'cms_message_edit', 'put', NULL, 'button', 'cms_message_edit', NULL);
INSERT INTO `cms_menu` VALUES (33, 'article', 30, '删除操作', NULL, 'cms_message_del', 'delete', NULL, 'button', 'cms_message_del', NULL);
INSERT INTO `cms_menu` VALUES (34, 'article', 0, '文章管理', NULL, '/article/list/index', NULL, NULL, 'left', 'cms_article', 0);
INSERT INTO `cms_menu` VALUES (35, 'article', 34, '添加操作', NULL, 'cms_article_add', 'post', NULL, 'button', 'cms_article_add', NULL);
INSERT INTO `cms_menu` VALUES (36, 'article', 34, '修改操作', NULL, 'cms_article_edit', 'put', NULL, 'button', 'cms_article_edit', NULL);
INSERT INTO `cms_menu` VALUES (37, 'article', 34, '删除操作', NULL, 'cms_article_del', 'delete', NULL, 'button', 'cms_article_del', NULL);
INSERT INTO `cms_menu` VALUES (38, 'article', 0, '友链管理', NULL, '/cms/friend/index', NULL, NULL, 'left', 'cms_friend', 0);
INSERT INTO `cms_menu` VALUES (39, 'article', 38, '添加操作', NULL, 'cms_friend_add', 'post', NULL, 'button', 'cms_friend_add', NULL);
INSERT INTO `cms_menu` VALUES (40, 'article', 38, '修改操作', NULL, 'cms_friend_edit', 'put', NULL, 'button', 'cms_friend_edit', NULL);
INSERT INTO `cms_menu` VALUES (41, 'article', 38, '删除操作', NULL, 'cms_friend_del', 'delete', NULL, 'button', 'cms_friend_del', NULL);
INSERT INTO `cms_menu` VALUES (42, 'article', 0, '黑名单', NULL, '/admin/blacklist/index', NULL, NULL, 'left', 'cms_blacklist', 0);
INSERT INTO `cms_menu` VALUES (43, 'article', 42, '添加操作', NULL, 'cms_blacklist_add', 'post', NULL, 'button', 'cms_blacklist_add', NULL);
INSERT INTO `cms_menu` VALUES (44, 'article', 42, '修改操作', NULL, 'cms_blacklist_edit', 'put', NULL, 'button', 'cms_blacklist_edit', NULL);
INSERT INTO `cms_menu` VALUES (45, 'article', 42, '删除操作', NULL, 'cms_blacklist_del', 'delete', NULL, 'button', 'cms_blacklist_del', NULL);
INSERT INTO `cms_menu` VALUES (46, 'article', 0, '入驻审核', NULL, '/admin/apply/index', NULL, NULL, 'left', 'cms_apply', 0);
INSERT INTO `cms_menu` VALUES (47, 'article', 46, '修改操作', NULL, 'cms_apply_edit', 'put', NULL, 'button', 'cms_apply_edit', NULL);
INSERT INTO `cms_menu` VALUES (48, 'article', 46, '添加操作', NULL, 'cms_apply_add', 'post', NULL, 'button', 'cms_apply_add', NULL);
INSERT INTO `cms_menu` VALUES (49, 'article', 46, '删除操作', NULL, 'cms_apply_del', 'delete', NULL, 'button', 'cms_apply_del', NULL);

-- ----------------------------
-- Table structure for cms_model
-- ----------------------------
DROP TABLE IF EXISTS `cms_model`;
CREATE TABLE `cms_model`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` int(2) NOT NULL DEFAULT 2 COMMENT '模块级别 1：root 2：guest',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '描述',
  `model` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_model
-- ----------------------------
INSERT INTO `cms_model` VALUES (1, 1, '文章模块', NULL, 'article');
INSERT INTO `cms_model` VALUES (2, 1, '其它模块', NULL, 'other');

-- ----------------------------
-- Table structure for cms_user
-- ----------------------------
DROP TABLE IF EXISTS `cms_user`;
CREATE TABLE `cms_user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `isLock` int(2) NOT NULL DEFAULT 1 COMMENT '是否受制约',
  `usermodel` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户所属模块',
  `username` varchar(24) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名，唯一',
  `nickname` varchar(24) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '用户昵称',
  `signature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '个性签名',
  `avatar` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '头像url',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `create_time` datetime(0) NOT NULL,
  `update_time` datetime(0) NOT NULL,
  `delete_time` datetime(0) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_user
-- ----------------------------
INSERT INTO `cms_user` VALUES (1, 0, 'article,other', 'root', 'root', NULL, NULL, NULL, '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);

-- ----------------------------
-- Table structure for cms_user_group
-- ----------------------------
DROP TABLE IF EXISTS `cms_user_group`;
CREATE TABLE `cms_user_group`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL COMMENT '分组id',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id_group_id`(`user_id`, `group_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_user_group
-- ----------------------------
INSERT INTO `cms_user_group` VALUES (1, 1, 1);

-- ----------------------------
-- Table structure for cms_user_identity
-- ----------------------------
DROP TABLE IF EXISTS `cms_user_identity`;
CREATE TABLE `cms_user_identity`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `identity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '登录类型（手机号 邮箱 用户名）或第三方应用名称（微信 微博等）',
  `identifier` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '标识（手机号 邮箱 用户名或第三方应用的唯一标识）',
  `credential` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '密码凭证（站内的保存密码，站外的不保存或保存token）',
  `create_time` datetime(0) NOT NULL,
  `update_time` datetime(0) NOT NULL,
  `delete_time` datetime(0) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cms_user_identity
-- ----------------------------
INSERT INTO `cms_user_identity` VALUES (1, 1, 'USERNAME_PASSWORD', 'root', 'sha1$c419e500$1$84869e5560ebf3de26b6690386484929456d6c07', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL);

SET FOREIGN_KEY_CHECKS = 1;
