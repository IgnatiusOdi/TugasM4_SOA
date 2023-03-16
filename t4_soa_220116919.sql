/*
SQLyog Community v13.2.0 (64 bit)
MySQL - 8.0.30 : Database - t4_soa_220116919
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`t4_soa_220116919` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `t4_soa_220116919`;

/*Table structure for table `hticket` */

DROP TABLE IF EXISTS `hticket`;

CREATE TABLE `hticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `konser_id` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `users_id` varchar(7) COLLATE utf8mb4_general_ci NOT NULL,
  `jumlah` int NOT NULL,
  `total` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `hticket` */

insert  into `hticket`(`id`,`konser_id`,`users_id`,`jumlah`,`total`) values 
(1,'KR002','2303002',27,31050000),
(2,'KR002','2303003',19,26450000),
(3,'KR001','2303003',1,1770000);

/*Table structure for table `konser` */

DROP TABLE IF EXISTS `konser`;

CREATE TABLE `konser` (
  `id` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_konser` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_artis` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tempat` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tanggal` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `harga` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `konser` */

insert  into `konser`(`id`,`nama_konser`,`nama_artis`,`tempat`,`tanggal`,`harga`) values 
('KR001','So Happy It Hurts 2023','Bryan Adams','The Star Theatre','16 April 2023 20:00',1770000),
('KR002','Head in The Clouds Jakarta 2023','88 Rising','Community Park PIK2','03 Desember 2023 11:00',1150000);

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` varchar(7) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `NIK` varchar(16) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `no_telpon` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `tanggal_lahir` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `saldo` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Data for the table `users` */

insert  into `users`(`id`,`email`,`NIK`,`nama_lengkap`,`no_telpon`,`tanggal_lahir`,`saldo`) values 
('2302067','lawrence@gmail.com','3579801234567890','Lawrence Patrick','08212345678','02/01/2001',60000),
('2303001','nicoletta@gmail.com','3578070601020006','Nicoletta Valencia','08212345678','02/01/2001',0),
('2303002','kevin@gmail.com','3579012345678492','Alexander Kevin','08212345678','02/01/2002',0),
('2303003','ignatiusodi@gmail.com','3579080521052002','Ignatius Odi','08212345678','21/05/2002',79990000);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
