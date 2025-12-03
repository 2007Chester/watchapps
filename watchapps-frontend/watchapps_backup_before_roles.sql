/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.22-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: watchapps
-- ------------------------------------------------------
-- Server version	10.6.22-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Analog','analog',1,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(2,'Digital','digital',2,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(3,'Premium','premium',3,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(4,'Animated','animated',4,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(5,'Classic','classic',5,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(6,'Sport','sport',6,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(7,'AOD Friendly','aod-friendly',7,'2025-11-21 08:46:16','2025-11-21 08:46:16'),(8,'Free','free',8,'2025-11-21 08:46:16','2025-11-21 08:46:16');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `developer_payouts`
--

DROP TABLE IF EXISTS `developer_payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `developer_payouts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `developer_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `developer_payouts_developer_id_foreign` (`developer_id`),
  CONSTRAINT `developer_payouts_developer_id_foreign` FOREIGN KEY (`developer_id`) REFERENCES `developers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `developer_payouts`
--

LOCK TABLES `developer_payouts` WRITE;
/*!40000 ALTER TABLE `developer_payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `developer_payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `developers`
--

DROP TABLE IF EXISTS `developers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `developers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `total_earnings` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `developers_user_id_foreign` (`user_id`),
  CONSTRAINT `developers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `developers`
--

LOCK TABLES `developers` WRITE;
/*!40000 ALTER TABLE `developers` DISABLE KEYS */;
/*!40000 ALTER TABLE `developers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (4,'0001_01_01_000000_create_users_table',1),(5,'0001_01_01_000001_create_cache_table',1),(6,'0001_01_01_000002_create_jobs_table',1),(7,'2025_01_01_000100_create_developers_table',1),(8,'2025_01_01_000200_create_user_devices_table',1),(9,'2025_01_01_000300_create_watchfaces_table',1),(10,'2025_01_01_000400_create_watchface_versions_table',1),(11,'2025_01_01_000500_create_watchface_screenshots_table',1),(12,'2025_01_01_000600_create_purchases_table',1),(13,'2025_01_01_000700_create_payments_table',1),(14,'2025_01_01_000800_create_developer_payouts_table',1),(15,'2025_01_01_000900_create_uploads_table',1),(16,'2025_11_19_064633_create_personal_access_tokens_table',2),(17,'2025_11_19_104032_create_uploads_table',3),(18,'2025_11_21_000001_create_watchfaces_table',4),(19,'2025_11_21_000002_create_categories_table',4),(20,'2025_11_21_000003_create_watchface_category_table',4),(21,'2025_11_21_000004_create_watchface_files_table',4),(22,'2025_11_21_185422_add_discounts_to_watchfaces_table',5),(23,'XXXX_add_discounts_to_watchfaces_table',5),(24,'2025_11_22_105712_add_role_to_users_table',6),(25,'2025_11_25_163713_create_watchface_views_table',7),(26,'2025_11_25_163939_create_watchface_clicks_table',7),(27,'2025_11_25_164113_create_watchface_sales_table',7),(28,'xxxx_add_role_to_users_table',7),(29,'2025_11_25_231034_update_users_unique_email_role',8);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_user_id_foreign` (`user_id`),
  CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',3,'app','160961e036e13542f2e93b3a2b98acdb8275c624a3fb456198ca8aa000c64f56','[\"*\"]',NULL,NULL,'2025-11-19 05:39:48','2025-11-19 05:39:48'),(2,'App\\Models\\User',5,'app','69201a042b402cd81abe2a568e409e7e002d7769f4d6652dbb74b5a708b98b55','[\"*\"]',NULL,NULL,'2025-11-19 05:40:03','2025-11-19 05:40:03'),(3,'App\\Models\\User',5,'app','bd9ef174387d3d825f4399ae45af250e71ffb00fe86f759b2f6f92edf78261f0','[\"*\"]',NULL,NULL,'2025-11-19 05:40:17','2025-11-19 05:40:17'),(4,'App\\Models\\User',5,'app','a359d180ca5f6be826f25d510a08d59152fbc8c83e847385e18af8fd5cdd609d','[\"*\"]','2025-11-19 16:37:29',NULL,'2025-11-19 06:08:00','2025-11-19 16:37:29'),(5,'App\\Models\\User',5,'app','9bf5544ab509c23e0ac9d39111f61eeb0e8500818c1ea8d5ba2821f155e0dec2','[\"*\"]',NULL,NULL,'2025-11-19 06:11:45','2025-11-19 06:11:45'),(6,'App\\Models\\User',5,'app','051edbbed947d9e7f934ed5ce7ac25de7a7dddb8ce0bcede292f5c8a964b8562','[\"*\"]',NULL,NULL,'2025-11-19 06:12:03','2025-11-19 06:12:03'),(7,'App\\Models\\User',5,'app','5efa623116f8354526b75bb14b327c444c5c0e151b51b09613d991a71cbe993a','[\"*\"]',NULL,NULL,'2025-11-19 06:12:13','2025-11-19 06:12:13'),(8,'App\\Models\\User',6,'auth_token','baa5cd91bfcc5fedc217a0f9b09bb74767b424a6256337907e67319f11118425','[\"*\"]',NULL,NULL,'2025-11-25 15:08:53','2025-11-25 15:08:53'),(9,'App\\Models\\User',6,'auth_token','bca90242d5abb912897c707ce2d1c42910ebfee4142eec3a6053fb5ab72cee20','[\"*\"]',NULL,NULL,'2025-11-25 15:09:06','2025-11-25 15:09:06'),(10,'App\\Models\\User',6,'auth_token','21ab3efd6b1f0d9b1d3fe912d5be2204e3b204108333be066bbd8cfeded034a4','[\"*\"]',NULL,NULL,'2025-11-25 15:09:20','2025-11-25 15:09:20'),(11,'App\\Models\\User',6,'auth_token','8cd506ed384a3b475ce6fe27da34745862c6acf4eabf98fa2cbdc3aa1546f8f5','[\"*\"]',NULL,NULL,'2025-11-25 15:09:43','2025-11-25 15:09:43'),(12,'App\\Models\\User',6,'auth_token','534ba096eb9c46f553266b7f7ab6f5c13d9b6d6387956e0ae96b096258fae1a6','[\"*\"]',NULL,NULL,'2025-11-25 17:53:23','2025-11-25 17:53:23'),(13,'App\\Models\\User',10,'auth_token','5803897fb29af6ea61e2b575b136287e39f3b043a5934815b76f68f5f1e31321','[\"*\"]',NULL,NULL,'2025-11-25 20:14:03','2025-11-25 20:14:03'),(14,'App\\Models\\User',11,'auth_token','a7d583da8e90e71d33890525d3f99568dd6f989bce0a446f5b7001495db0095a','[\"*\"]',NULL,NULL,'2025-11-25 20:14:52','2025-11-25 20:14:52'),(15,'App\\Models\\User',12,'auth_token','6ecd74dbb21c1e59c0bd11a9cb5994964b66dc2075ca58930db8ba3e451e7287','[\"*\"]',NULL,NULL,'2025-11-25 20:38:46','2025-11-25 20:38:46'),(16,'App\\Models\\User',13,'auth_token','720e6fc460e910c685b93a9ceee130e6cd0ccab4676de6d16c1fe621b9b0135b','[\"*\"]',NULL,NULL,'2025-11-25 20:48:18','2025-11-25 20:48:18'),(17,'App\\Models\\User',12,'auth_token','060b26ea4d621bb1a2e29d90245ab79174f9cf71d67b13657e6fcfd0bd0d70e4','[\"*\"]',NULL,NULL,'2025-11-25 20:55:11','2025-11-25 20:55:11'),(18,'App\\Models\\User',14,'auth_token','68284f3510d4263c7314b69c1ddb875cbac9609cf1ff34d75dd1380c363c83e7','[\"*\"]',NULL,NULL,'2025-11-26 06:37:03','2025-11-26 06:37:03'),(19,'App\\Models\\User',14,'auth_token','3ef021df027e9caa91e3b5c85031c2870412bc626c1189ac92b0b07433cea0c9','[\"*\"]',NULL,NULL,'2025-11-26 06:37:09','2025-11-26 06:37:09'),(20,'App\\Models\\User',15,'auth_token','b0eee454f5725b548147c5b59b1705cf90e4a42ec3a47624b19b2baf3f484922','[\"*\"]',NULL,NULL,'2025-11-26 07:43:44','2025-11-26 07:43:44'),(21,'App\\Models\\User',15,'auth_token','7db352524b7499c44c64af644dd216ec8c3dac8c0c3cd4bbb368f0450d6932e4','[\"*\"]',NULL,NULL,'2025-11-26 07:44:00','2025-11-26 07:44:00');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  `payment_method` varchar(255) NOT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `purchases_user_id_foreign` (`user_id`),
  KEY `purchases_watchface_id_foreign` (`watchface_id`),
  CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchases_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('0Gs7ckx55KMyVYxAxbwruvXMvf1sVVv8WWuqq1lV',NULL,'172.236.228.208','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaVJtZ1hycEpMWlVlalZXWmRWMEJmNlVyamZFcWdSNGIzY0ZPbTFNeiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764139000),('1jOqRMR8LgvUEpyTm11c9G9SMw6ehKLAZU7wlVQU',NULL,'45.156.128.49','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0FWaWp4ZXRwUHpSY3dPZjR2R1NRMjJRZU9sMXJZcVNhTXEyWGFrYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764093265),('1T1BDfJfcSLSobPxhNP7M4NIp8wzWpPT325pzdg0',NULL,'64.23.242.109','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoicXpvOVR2NXhZdmEySGlOVnlGaXJsSm5KSTR4ZEVZeTRXUGo3VVZ4TSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764126427),('3JYbMqFs0arOWGjT4sdtvRXkbLK6FM1VNlgBTdg9',NULL,'3.137.73.221','cypex.ai/scanning Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoicm9iUTI3NzJSTGw5RUNWMzcwRUNLRkNjak1FMWo4SndVMUxVb0NuVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764155894),('50x79rTCqIWc7jIr4xoQp76wO4N4ydbONqaqETRG',NULL,'43.131.26.226','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSjhERFdLNHEzV1poV1lVOGYyRFFWVlptVUZkUGZOSkxhZEh0bUxjdiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764075561),('6BmsD8Jfxh3vb0NDcufI8VC2Cob5E8cdk1gz8j97',NULL,'89.110.127.224','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiS0dWT0o1SFp0OW5Ea1g0S1NVSE9ZWjVTVDNpU3ZyY3NvY0tVaVY2bCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764088578),('72z18nwTDBLXo4gikPkWJr5BbSCybFEpKgdrwBdj',NULL,'172.178.115.83','Mozilla/5.0 zgrab/0.x','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMDgzV3VDQ3pNZGQ1ekRod0RQRnE2ZkdLVVN6VGxSdTRPQTVvOVJHeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764082052),('7BFTzI2IBiJ7zuBBwaEUB3P8FV1iONCewtyKZBYw',NULL,'64.15.129.116','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiM0Q3VG5Xc2R2S0RnTDRIUXYyTklxbEJwVlhrelhydkJNeXpNczN2WSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764082238),('7mhpjJ12wSSJj6pM1qhQja0ux0e978PJ6hCKOpC5',NULL,'170.106.107.87','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVVQ5akE2QWF3dWRVZHMycXYwUThySXNtb2Y3NTI1NTVZWUVRZTdiTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764109906),('7z0PBYkiziBFcHM42u404WWflsHZ6LYCmRVPpyk3',NULL,'152.32.219.77','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWHdXV3ZyVGg0cG1IRlpIN1hwTVFJM1FvQmZ1d2NGcjJPQ3ZsZmp3aiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764144922),('9v8eZx9tn8Te2eRt1lUcIgg8FYJQY9wcSA8yQBKQ',NULL,'150.129.92.197','Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUnBoMFB1aUdzUjV6dEQ4MXRlQTJFdVdEYUduZEpXR0o3ODU4dUMwZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764078809),('a1LgRtgQUulXRoUmNs2UUiKRSDe5ZIZZ6O1ZSjfi',NULL,'157.143.30.12','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZjIzM2dQckZ2TDB1RnMwMnV4ZWJRWFRvTXZXT29sckJqUzZaREVDbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764084153),('Ac9GobOVAA4f311iVw6dkJi5eBrk9nyr5QzhWwkB',NULL,'35.88.244.249','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoicVdjQ2FHcVJ4cE9NOEw0ZGp1ak9MaTU1MjJIVjQ0cUNxQVlXcTJncyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764090267),('AYytEPR0b5vKXRKwuaX20y9aQXpFdV6MkEIW3uZO',NULL,'81.177.139.192','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVVl4YXZ2NVNzNmw3aWxPMkdCZUdTeUFVa1NUc1NrdXBhRUJHWlVGaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydS9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764094146),('bI4lT7sJFxSUWAfdvcedsTjLERTPlvGm99K4odDV',NULL,'164.90.208.56','Mozilla/5.0 (l9scan/2.0.239313e2933313e2737313e21383; +https://leakix.net)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRmJDQjdBMk5FSjh5SzlBV1NNSExCdDNGcTVLMGZnUFVRN1l3SlFqZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NTg6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydS8/cmVzdF9yb3V0ZT0lMkZ3cCUyRnYyJTJGdXNlcnMlMkYiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764078732),('bpRjp0LV3VndwTmW191njGd2d078Quha0ChQ88BP',NULL,'164.90.208.56','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVWtwS3ZWT3loSUlxd2xacHB6NTBUUm9wZVV4SWtrUkpuaENyMVBPaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764078727),('C4WL0mTpy3ol4AiKeCi6su6EnskYEWne1g9UmjFW',NULL,'34.57.102.198','Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.17 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoia3VyMnpiMGo5emlMc25JTXpubFhzNTZTMUdrYWRYSWszb2hKNXljdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764083944),('c7fenbokWqi1hL3OMaHNVcxbaIMtHdYfBpMXjuPv',NULL,'43.166.129.247','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZktMNVplMDBjbjNQOTNOM2RXZVBNV0d3WW5vNmVXRmRqcHg4WnZkaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764130275),('CxA31ux4oM6nbsP1PBq3aRkJ55GO2mMKJWLwAlQD',NULL,'89.110.97.157','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNWhSSjhPbnE2NmtqNzZqR3BTUlVUZk5RWjdOWVJ4Q0hDRDFPaDg2dCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764153614),('d82eGKcaAXvtAm2ZYd0HfpsSClvH1XQKfVxv1pqV',NULL,'43.167.245.18','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWVQ1bGhOcDlPM1RPYkZqN0RXV0VnRnlBOHl5MXRMc1hGM1RrVGZsOSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764131518),('D9uLlZ1lR7spdlZ3LtwjeqjKPy8NzjJbsuRgwtcW',NULL,'35.203.210.22','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiR1M3MjNHc25BYXhIcjFjUkdaNG5FMlVId2hzRVhRRDNBM0J2M3Z2RCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764143781),('Dcg86GGztM9EkAWATJ8BFuoHqoShf0QqZ5bvuOr6',NULL,'47.91.125.252','Go-http-client/1.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV1N4OTdQaUthZXlLd0JKOWtjUERJNlNGaHk3c2JSSlVHdWhranNBUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Njc6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIvP2Rucz1MWE1CQUFBQkFBQUFBQUFBQjJWNFlXMXdiR1VEWTI5dEFBQUJBQUUiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764128127),('ddPPB00RtWutRckGu8qm6m3Dlm82MIhKOeTDyWa0',NULL,'162.216.150.56','Hello from Palo Alto Networks, find out more about our scans in https://docs-cortex.paloaltonetworks.com/r/1/Cortex-Xpanse/Scanning-activity','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVGlBNzc1RUpxNUFnd3JuVlBLNFZQOFpHcDZlTlN0cTlkV3hmaG5BNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764148852),('e9cvK4hCS4yA6ddaUj8Q85P4UNvrUXeMxPR03DUp',NULL,'34.78.183.19','python-requests/2.32.5','YTozOntzOjY6Il90b2tlbiI7czo0MDoibFBWcmNDQUtWeXI2MnVUSkJSejUxcmdyaWZER3JIMFVObUowYmd4NSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764122215),('EpCZCPJsGh5cHOwn2Xik4OAizEkmzyXNVbicULsh',NULL,'149.57.180.43','Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoieTFpMmgxdnFtWmVxVXJvaWNHTWw4SEREZnF2emU0dXNNRUVSVU1qUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764096678),('FCRwrO3fNfds8TidjlzFDaUxIM6sdp3gRGR7sO7U',NULL,'34.248.137.227','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUElMMlgwNTk3Vnc3Wk5zUDdVMjhYTjVmVzZrUXZDbms0TThhOFprQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764089607),('Fk6sccBAF44Rqd1ZvMYOLECWEgexxeq2RApwgc39',NULL,'35.187.232.99','Mozilla/5.0 (Linux; Android 12) Chrome/111.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQmx4ZFI0MXh6RFJzUThINW1hSmVCZDlJNWw1RE8yWWhvbW8zS29ZTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764127129),('fTReiu2orysUsSUUDHS3OUimyenZQ1AIs8eQTXtT',NULL,'91.184.244.208','Mozilla/5.0 (iPhone; CPU iPhone OS 5_0 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9A334 Safari/7534.48.3','YTozOntzOjY6Il90b2tlbiI7czo0MDoibElPaGhkQTZSNWZXNDdHM3hPWFlxTHJiQjJBcVZncGM5WkZLWTBoRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764079820),('g5SHNJXD8iryP1KdJVXiJdMszuhBtPsYJHRgkpHe',NULL,'152.32.131.118','Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFV2Rjk1RTBPQ1I5R1BVVEJLSnl6bk9LMXFHSk5PTmtYOGdNQ2RGVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764089082),('G8JlHLbxAdKQ3eWnjbkdJy1iy1CfQNhazQ1BNIJP',NULL,'85.142.100.141','Mozilla/5.0 (compatible; CyberOKInspect/1.0; +https://www.cyberok.ru/policy.html)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRWJqb3BPOUNsTGFXSGY0aDJHR1B1T1ZZcTh6alJmWHhNMUJieGFKMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764089199),('GQFtr7lXXwZfHbRq7YvgZSrT9pw7LwMCKcxuBbkh',NULL,'188.191.23.93','Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiT3o2WU9rb3RJWEluTnVDZFVHRkN1S2d1SjE4bm1Jam5WU0huNWtCUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764127126),('HBAq1zTnHMTRCzRw2zZki3cwKUx29He2N4AedD9Y',NULL,'54.86.115.253','','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSjN6ejZabjlrODNmYzZWZUdZQVBOQ3JkQVJ1R3BvbFN4ajZpeEpPdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764079462),('HhakIi14wkft3UcZGnKvA43NeM6A1Y2Gz4J3F3Gs',NULL,'64.15.129.120','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkZqc3ZCTFI2Qk56UEJLcGo2NTFWQjlBUjJIZWl1cEE0ZmtPSFRrVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764082239),('iitacb3Wi2Oh1PhH7PNe91VPq32iKOdXxR1OIkF3',NULL,'43.159.152.4','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoibGR5RFB4ZlBDSkRmbkpielpMY3hWQWNaek9rNHkwYUVwYW1HNnZjeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764084937),('J12P4LCLeEsN98JLQ3f2slTpsstqNvulzSGYHZ6a',NULL,'170.106.148.137','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMVpoQXBabUFsWG9lZEFoQ0prVmJnWERkb084emVScTNPSldqZkJEYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764102984),('JTMIMBI4LwuoLyJDP1kNp439VMQMdXZsDqQSVbNf',NULL,'142.111.108.99','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVW1wcnB3N21KN0poRnlFcWZDZ3dYUEtMWnJOeGF2eXJpV2lMWkloRiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764109664),('kEgyLnIYDgVfCbuIna3c54hIbhQhT5SgIGtr86LN',NULL,'54.234.155.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoib3I2U3BwZjJQc0J3TlBlVHFpWUV2MVMweFFEcHpGelQ1bEdhd2NnWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764102967),('kyovPSAcrrYfbtjAAA1NWZ8JAwmUuI42Iyhiw4TF',NULL,'172.236.228.224','Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoidmdFbVpLam9hblJzTGZWb3piZnpubHpTbnQ0RzQzODdqa2JiVzF4OSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764153193),('Lpyv2MhluSiWEa4Ax5rCcANKvLqCdN0NKXmxhSKb',NULL,'91.184.244.208','Mozilla/4.0(compatible;MSIE8.0;WindowsNT5.1;Trident/4.0;chromeframe/30.0.1599.101;.NETCLR2.0.50727;.NET4.0C;.NET4.0E;.NETCLR3.0.4506.2152;.NETCLR3.5.30729;.NETCLR1.1.4322)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ0Z1WGRQbTJnS2laV1JZUlJSaHJWNldpcmhwN2xheVR5YnB4UXR0dCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764092838),('lqCzip2cZrvGUUiqeSXDlaSlJNmIt8mqN152jurh',NULL,'170.106.11.141','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGFNWk5rYlRPd1NpSjZTd1JneE1HR0c4ZG1JZEQ0WkRyMWFrSUw4eCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764155386),('m8xDwxJQKZls70WTCQjSlu12TJawAYjpSjDlaZU0',NULL,'185.226.197.74','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiU1NIUnNzZlByelNuWkJxNmthSDR6czBxc1BUTnd2bnJ5eHZmcms4UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764099675),('n0mCHcn4p81E1J1UCQstrtbILQGC48QC7j1GVpr5',NULL,'81.177.139.192','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoianZtWVJVYTM1TWRwM2NEdW4zUVZiUXFpMGpXS211YXdiZElBQUVyYyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydS9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764104002),('n5ETYGE6V4aTshI7f9boggI4TdsHIqDljbXFNao1',NULL,'89.110.97.157','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSjlvZjZaZ2dIcTRoVUpNVEU3NTBKTldsZW42NXFjYm1qRUR0bUZTaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764137872),('n9dCA8IBWWnr8hV2dM0rh5KA6F4x3yPNXfrnoHVi',NULL,'35.88.244.249','Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQmZQTm5pUDNNQlBaRkNVNmpha3lSc2F6RVpEVzFocVd0Tm5NR2pDVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764090271),('NAe91ofz7ZImLkhshtbkMsvznYTKenocDLCBD7n8',NULL,'157.143.30.12','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTEJvcHFDQ1VxVFFPVmtsNU9uSGZSNDFnRzU2WW1XVHhUMUtqcFg5YyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764123895),('NFDAj9TZKB37nokr4DVPx4Bn56uPaVMEhft2MrAW',NULL,'84.32.70.10','HTC_Dream Mozilla/5.0 (Linux; U; Android 1.5; en-ca; Build/CUPCAKE) AppleWebKit/528.5  (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNEpGeWhrb0NOdHl5bkFQMU1sQmVxTGdiVzN3bEVzSm5Vd0kzbnZ2ayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764151007),('NR2GG1F6PBM4ZHM1L70pTEBD93wGeUTZVm3noESK',NULL,'170.106.180.246','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoialdIMXdaUzJRWTNGUEgwYU1aWVpobXc2WjU5RFFmRHNUcGgyaXlNZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764104015),('Od13KH32W1UrwyjajLeZtv8NCBb9q5Hovly1gY9E',NULL,'91.184.244.208','Mozilla/5.0(compatible;MSIE9.0;WindowsNT6.1;WOW64;Trident/5.0;SLCC2;.NETCLR2.0.50727;.NETCLR3.5.30729;.NETCLR3.0.30729;MediaCenterPC6.0;.NET4.0C)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaXJEdHR3UTluWHEzZUpXVUdTa1JxOWQ2b3VVa2Y4dlBSa090N2hEWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764100809),('Of807Q5oI9e2Rzw9tS6PVb8vgWcR6qqfKBHnrgvb',NULL,'192.175.111.249','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVHQ4UEtUdEFyV0o1bEJKRDdIM3pjWkxSZW45MHFtUk1TT2poSjZFMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764082234),('ofF0bjYudxqANYwcXXw8JxgFvIcI0sVi2hvyTIlr',NULL,'34.90.118.162','Scrapy/2.13.3 (+https://scrapy.org)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNE5adlNqanoxYWlWazFFa1BPMXlVRFdQRXhDMWdYdlloYTdEUjZhbCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764143304),('oNcjgMnUIYMdLIpCHzbdvqBEqDABMXHmMuqlSb8f',NULL,'74.7.227.2','Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)','YTozOntzOjY6Il90b2tlbiI7czo0MDoicndDMkFzcUJnSEg3ZmZSV01wV1JwNkpPeWJIOXNWbTJickJ4ZExUSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764081594),('OTTMiUW34jvJX9BS7oH0L8dbkQ2YYzayfu1AP7TZ',NULL,'81.177.139.192','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ2VuQU5zcEZ0TzY3b2lpN1pjSzN5ZjRZMEpUaHJxWTJMSWhuWld2cSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydS9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764094160),('pqJF7ld2DVUSYpkZ57dCQN1dINcS211vKvU5EWFN',NULL,'34.211.228.217','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoicHdhaGlvWVAwR3luNGw1bEd4WlBBMUZiR1VRdFUwOGc3U1Iwa1BqaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764088917),('qbN5crIKmMHfmorFxEqaq4n0XVDoNqo5wU8gXHOt',NULL,'89.110.127.224','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoidTg4NlBHVTlwTHh2Nk9JdTNoeVByNzlkOTBLVnlQVjExbGIyMk1GciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764099229),('QnG6mu06or01ruXaoEwCxyLlDqeDDhYxvVZWZuJG',NULL,'164.90.208.56','Mozilla/5.0 (l9scan/2.0.239313e2933313e2737313e21383; +https://leakix.net)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRHBmRHVJMk5JZDNMZTVKSFpjem9aTGdNUU5IRmVwY09wN0M2c0o2ViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764078728),('rdQXz6qXgMFlFEsHVvJIYsMxR0hrat63hfwFedBP',NULL,'81.177.139.192','node','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZXdoUUxwRXJSeWVTT21idDRZMnE1NlJzSHJsZUNCVzg1cE9VRXpoSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydS9zYW5jdHVtL2NzcmYtY29va2llIjtzOjU6InJvdXRlIjtzOjE5OiJzYW5jdHVtLmNzcmYtY29va2llIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764094183),('rXIJL3RqJtM0XnJAltDeQWjx0vwfVpftxBWJBBBE',NULL,'152.39.213.199','Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/138.0.7204.156 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoick1XODRsenVTcjVwS2NGUjlQR3hBT2JKeUNvUnJlWURNZHVYZjVoZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764078795),('s7lUqgLDuTsBdm0gz69T62OHodsPfUUAlGDeP7BR',NULL,'15.168.154.160','Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124','YTozOntzOjY6Il90b2tlbiI7czo0MDoiR1FIVTRSY3hMTUVYVW9OTk9wcXNpRnY5VVVFNzJHVUt1R0R0UDZ0SyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764152239),('Sd4TBRTzKECn05LDYsFPQGdfb6kwTFZ1rXJxuJDp',NULL,'34.248.137.227','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMVMwVWJibkNnTWc5S2lRZHhFemdLSXpSQXFGZjlBbDQzYzdzYldxViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764089608),('taQKSFH1U8iX9kXn861yvAq1lhVoinVElTujTDO7',NULL,'71.6.134.232','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSXpPZDlaOUVsb2t1aGxsaXYxZnBJZFd5RWlSczJBNXVOOXI5c2ozVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764146495),('taXbBusdo9sCwPQOWhstA3gp6EdY6d1DzZPyxavM',NULL,'34.248.137.227','Mozilla/5.0 (X11; Linux x86_64; rv:83.0) Gecko/20100101 Firefox/83.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMUFCS3ljdmdwaUxkdE5nQjJSaUREdUk2Wk1VRmdZOGY5TjhJR3pXUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764089607),('TkWOTR4SiGpYg1HXw2xCq8bwQ27f7ptPetABBGLA',NULL,'89.104.110.165','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVGxWbnpXOFcyelBCaFE0a1hKMEdhMG9PQWtDTEZKNU1FeFVLY2NLUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764133590),('TkyjFoCfNjsr5YSrmYT52uVhOXpCqKNZhQmgGWBa',NULL,'192.175.111.249','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRXUxcnU5YnVTdmoyS2g4NGZybVQ3dDlSV2Z3Q0hyaWlXSHAxVUMweSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764082236),('Uca4UBIkO1fpZKZvbfI8u8f66c3jn8tuk9TQ3RJk',NULL,'170.106.163.48','Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYkpQUHk5dW1UaTFGbEJkRVpkQk9zZ3ZKb2xPSDUwVUt3SDBJVjVuMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764136580),('uDFAiqo55RpgpyEwYdN12ZEqSqiZbhaIEfh2Wq5S',NULL,'98.93.171.79','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiQzlNOFFzWnF4OEllclNKODBSSUg5WHZCV1JCdUlmSHBLVEx4dkhuZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764093694),('ul5Baqsxwsc4uPpP40qyZtlalWB3Cm0Zw289Kbmw',NULL,'91.184.244.208','Mozilla/4.0(compatible;MSIE8.0;WindowsNT5.1;Trident/4.0;.NETCLR1.1.4322;.NETCLR2.0.50727;.NETCLR3.0.4506.2152;.NETCLR3.5.30729;.NET4.0C;InfoPath.1)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMzlrQjNrc2xzOTVuZUh0Q1laQnpIdXhiMGU5SDBIODhlckVTblpkWSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764122408),('UoCHSHizHPASopDbSe3tILIWVL8sWXVb2fv4Pe7v',NULL,'176.53.220.140','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMHg5TFhVRzRZN2pER000anZ0VHhxUmtsc1NVcXMwdDNQU3doVDJqYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764148079),('UsKBmP9nxg0QmM79bJRPTK0c8A5VmCndhU0SXEIw',NULL,'23.27.145.31','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV3NLT0xXcE1zMVRHNUd3dnkxTE81ZlhWa3FySDd6VGVXVnY5RVVBRiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764103483),('V9C91EGoPiQ2na2hesJSw1YO9KnWgcWgj1WqCxZY',NULL,'64.15.129.122','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ29jbmtqdkpnRGdhUGJPQ2xxdkR5UVpPemkwTUpSV2hpMUQzNW50MSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764082238),('viP5QhsVqfQPCpkGH00ONuyCURn9P7M4dSNhwDMh',NULL,'84.37.212.23','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYmtTOGJCVzk0OXJ1WVBZR2E5ZkI2ejFyWk04RW5IUE5QbEJIY0IyRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764109783),('VuH9acjRaWO5CLJTkaPJMoBXmM70qC0Y3tVsRZLE',NULL,'161.35.194.166','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3JNNGNBYWIzcXZyTkZ5NW80ZlowaU9JTW5zdlUyODFnRFh2bURLMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjI6Imh0dHBzOi8vODEuMTc3LjEzOS4xOTIiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1764107559),('WuRkFECelniBo12DuN66tY7zHqK1XdtdptGymIeW',NULL,'87.236.176.10','Mozilla/5.0 (compatible; InternetMeasurement/1.0; +https://internet-measurement.com/)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMWJ6QXF3QTlrN2FXZjlKeXBuRFVWQTQzbVFNNFRGYTluOTBuRGVHViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764135190),('WxUdPmdgrcZTnjoDc1s0pKhcl8Oh7PtshenFzsNA',NULL,'34.211.228.217','Mozilla/5.0 (Linux; Android 8.0.0; SM-G965U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.111 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNzg2a0Z2bGtkaGxibmRBd0s5OWFVbjVoM21GS1B5OGxXZExoRlRiMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764088917),('x55O84WqPJGRoQMBebgWyuP6iMkq0cuxF41JBgSG',NULL,'167.99.203.116','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNnRna2w4bjRjS1V6Z0V0bFVCbUtlUEpnWTE1cHBlTEZLc1BuUTZIYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764121040),('xDPaxUXTOWXcxsXMNQ2JxH7tKx7GxVlJAQSQV1z6',NULL,'176.53.223.97','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSHJNZklIaFIwSDh5ZzA2VnA5VzdJSnNUUkRrNW5FWENSNGhqTFVUUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764104428),('xMQKfHpBGzYWBDP0GBx5pU2ZpfjPzhBkrJMh4zYk',NULL,'15.168.154.160','Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124','YTozOntzOjY6Il90b2tlbiI7czo0MDoibkc4U0RjQ1o3NUFWV1RrUXl6TU1GVzB0Um1RU21OTlZ3U01keEh2ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764147059),('YkbCCpAJ1iWYK6yrJNS2yhMR0v7SdVg5Eoi8UpzM',NULL,'142.111.108.123','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUXdhNkVPeGdOeGVUZENhbzRzZkpwWTE5NzBVTkYzaDZabnhZb1o0TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764108716),('YXtn9VwO3yXIz3odBoHWzNw9MkgQd6cA9DFX47Zs',NULL,'157.143.30.12','Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNjAyZklWUlM2WE1iaWJ2cTV0TzBUVWRoTGYxb01yOFE4aUgyaTl0ZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764111332),('yz56ooptB9ewV1bpBOoIXiz6BkGratX617Oz2P6m',NULL,'176.53.219.254','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiemtvbkVrVXB0cW5JcTRXUHlid3NlRDc1c1lCenptR2tJbjJSOUtzaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764119306),('ZIX9dAi56cbvoLn579TehrowvL31Q6NhIjJLZZwO',NULL,'91.184.244.208','Mozilla/5.0(Linux;Android5.0.2;SAMSUNGSM-T800Build/LRX22G)AppleWebKit/537.36(KHTML,likeGecko)SamsungBrowser/3.0Chrome/38.0.2125.102Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVnlFT0dWNTlNN3VKY2g0Rmc4ZkkxeEFQeEVhNms4OFhuS0phZ08xayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764083494),('ZyysBYkanJnBtqwz9iZPNpFl7ejqLvhE1cZ4IVfA',NULL,'176.53.221.146','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUjl4ZmtRTGpmR0ZWbFB6b2pSNnFsbkd1am52WDFZTWF1SWpIRzZQRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjQ6Imh0dHBzOi8vYXBpLndhdGNoYXBwcy5ydSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1764090011);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploads`
--

DROP TABLE IF EXISTS `uploads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploads` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime` varchar(255) NOT NULL,
  `size` bigint(20) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploads`
--

LOCK TABLES `uploads` WRITE;
/*!40000 ALTER TABLE `uploads` DISABLE KEYS */;
INSERT INTO `uploads` VALUES (1,'1763581003_app.apk','app.apk','application/zip',5156797,5,'2025-11-19 16:36:43','2025-11-19 16:36:43'),(2,'1763581049_app.apk','app.apk','application/zip',5156797,5,'2025-11-19 16:37:29','2025-11-19 16:37:29');
/*!40000 ALTER TABLE `uploads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_devices`
--

DROP TABLE IF EXISTS `user_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_devices` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `device_type` varchar(255) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `platform` varchar(255) NOT NULL DEFAULT 'android',
  `device_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_devices_user_id_foreign` (`user_id`),
  CONSTRAINT `user_devices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_devices`
--

LOCK TABLES `user_devices` WRITE;
/*!40000 ALTER TABLE `user_devices` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_role_unique` (`email`,`role`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test','test@mail.com','user',NULL,'$2y$12$xGYOFP4eCv3oO.k382RcfuZABqi.LfelDG25nM/vFM/4qPv8Noska',NULL,'2025-11-19 04:48:12','2025-11-19 04:48:12'),(2,'Test','test@test.com','user',NULL,'$2y$12$bJN8QAk7MWSudf3qrZrFleP.axNXJhM2UK9/CDGhqk4JQJI7zBOzW',NULL,'2025-11-19 04:55:15','2025-11-19 04:55:15'),(3,'Tester','test2@test.com','user',NULL,'$2y$12$RuNSeQxP5asG5nsl7HhM5embyEtQz4DOw4pYUHiUPWHP.Rx7ZHJGu',NULL,'2025-11-19 05:20:25','2025-11-19 05:20:25'),(4,'Tester','test100@test.com','user',NULL,'$2y$12$MvyoNykG5Afe6Wunq560Bu5lyh87yYxjTa9/7w8UvDDA6gOFt8uEy',NULL,'2025-11-19 05:36:19','2025-11-19 05:36:19'),(5,'NewUser','newuser1@test.com','user',NULL,'$2y$12$w0pAUq/Ktd3z6LwneEVFOuMkDQTIpICcpEBb1HkaMZVxNjxmt7X3G',NULL,'2025-11-19 05:40:03','2025-11-19 05:40:03'),(6,'Максим','2007Chester@mail.ru','developer',NULL,'$2y$12$UwWY9ZIJDPFW77lfvk9ypejHxGeDONosUb5UeqoGCgZTaRTcvZ5Aa',NULL,'2025-11-25 15:08:53','2025-11-25 15:08:53'),(11,'','2007Chester@mail.ru','user',NULL,'$2y$12$g.wKwVH8S8..oeEqmHlxrO5lEzmQBK.T5h8crPLEpltuTk0TUBFLy',NULL,'2025-11-25 20:14:52','2025-11-25 20:14:52'),(12,'Максим','2007chester@1mail.ru','user',NULL,'$2y$12$epCECPhr1Y5SzmhKr77LtO40r.sY4wW4Aw/4G0XzITwt0BUExRBoO',NULL,'2025-11-25 20:38:46','2025-11-25 20:38:46'),(13,'Максим','2007chester@mai4l.ru','developer',NULL,'$2y$12$OFh0x2KXnBFOhqjnSxU6PukikT9G3vSwOzU4egO1gdtedfEYwVD.W',NULL,'2025-11-25 20:48:18','2025-11-25 20:48:18'),(14,'Alexandr','kovalew1989@yandex.ru','developer',NULL,'$2y$12$EMcXK6TFCQlFA7DxYOB/tOik3Sz..y7tFlZ52tJCsjuuRDkQqwouq',NULL,'2025-11-26 06:37:03','2025-11-26 06:37:03'),(15,'Максим','2007ghizn@mail.ru','developer',NULL,'$2y$12$AaNUihU8sxXMYcELMoSBHOrUjKGwRhLwnu3X9etLxrwhQ5y..DQ3G',NULL,'2025-11-26 07:43:44','2025-11-26 07:43:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchface_category`
--

DROP TABLE IF EXISTS `watchface_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchface_category` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `watchface_category_watchface_id_foreign` (`watchface_id`),
  KEY `watchface_category_category_id_foreign` (`category_id`),
  CONSTRAINT `watchface_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watchface_category_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchface_category`
--

LOCK TABLES `watchface_category` WRITE;
/*!40000 ALTER TABLE `watchface_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchface_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchface_clicks`
--

DROP TABLE IF EXISTS `watchface_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchface_clicks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `watchface_clicks_watchface_id_foreign` (`watchface_id`),
  KEY `watchface_clicks_user_id_foreign` (`user_id`),
  CONSTRAINT `watchface_clicks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `watchface_clicks_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchface_clicks`
--

LOCK TABLES `watchface_clicks` WRITE;
/*!40000 ALTER TABLE `watchface_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchface_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchface_files`
--

DROP TABLE IF EXISTS `watchface_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchface_files` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `upload_id` bigint(20) unsigned NOT NULL,
  `type` enum('icon','banner','screenshot','apk') NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `watchface_files_watchface_id_foreign` (`watchface_id`),
  KEY `watchface_files_upload_id_foreign` (`upload_id`),
  CONSTRAINT `watchface_files_upload_id_foreign` FOREIGN KEY (`upload_id`) REFERENCES `uploads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watchface_files_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchface_files`
--

LOCK TABLES `watchface_files` WRITE;
/*!40000 ALTER TABLE `watchface_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchface_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchface_sales`
--

DROP TABLE IF EXISTS `watchface_sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchface_sales` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(10) NOT NULL DEFAULT 'USD',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `watchface_sales_watchface_id_foreign` (`watchface_id`),
  KEY `watchface_sales_user_id_foreign` (`user_id`),
  CONSTRAINT `watchface_sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `watchface_sales_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchface_sales`
--

LOCK TABLES `watchface_sales` WRITE;
/*!40000 ALTER TABLE `watchface_sales` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchface_sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchface_views`
--

DROP TABLE IF EXISTS `watchface_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchface_views` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `watchface_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `watchface_views_watchface_id_foreign` (`watchface_id`),
  KEY `watchface_views_user_id_foreign` (`user_id`),
  CONSTRAINT `watchface_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `watchface_views_watchface_id_foreign` FOREIGN KEY (`watchface_id`) REFERENCES `watchfaces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchface_views`
--

LOCK TABLES `watchface_views` WRITE;
/*!40000 ALTER TABLE `watchface_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchface_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `watchfaces`
--

DROP TABLE IF EXISTS `watchfaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchfaces` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `developer_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `price` int(11) NOT NULL DEFAULT 0,
  `discount_price` int(11) DEFAULT NULL,
  `discount_end_at` datetime DEFAULT NULL,
  `is_free` tinyint(1) NOT NULL DEFAULT 0,
  `version` varchar(255) DEFAULT NULL,
  `type` enum('watchface','app') NOT NULL DEFAULT 'watchface',
  `status` enum('draft','published','hidden') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `watchfaces_slug_unique` (`slug`),
  KEY `watchfaces_developer_id_foreign` (`developer_id`),
  CONSTRAINT `watchfaces_developer_id_foreign` FOREIGN KEY (`developer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchfaces`
--

LOCK TABLES `watchfaces` WRITE;
/*!40000 ALTER TABLE `watchfaces` DISABLE KEYS */;
/*!40000 ALTER TABLE `watchfaces` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-26 15:16:09
