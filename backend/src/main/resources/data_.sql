use `cinema_booking_system`;

-- ticket unique key migration:
-- keep historical tickets for expired orders, but still prevent duplicate seat in same order
SET @has_old_ticket_uq := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'ticket'
      AND index_name = 'uq_ticket_show_seat'
);
SET @sql_ticket_drop_uq := IF(
    @has_old_ticket_uq > 0,
    'ALTER TABLE ticket DROP INDEX uq_ticket_show_seat',
    'SELECT 1'
);
PREPARE stmt_ticket_drop_uq FROM @sql_ticket_drop_uq;
EXECUTE stmt_ticket_drop_uq;
DEALLOCATE PREPARE stmt_ticket_drop_uq;

SET @has_new_ticket_uq := (
    SELECT COUNT(1)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'ticket'
      AND index_name = 'uq_ticket_order_show_seat'
);
SET @sql_ticket_add_uq := IF(
    @has_new_ticket_uq = 0,
    'ALTER TABLE ticket ADD CONSTRAINT uq_ticket_order_show_seat UNIQUE (order_id, show_id, seat_id)',
    'SELECT 1'
);
PREPARE stmt_ticket_add_uq FROM @sql_ticket_add_uq;
EXECUTE stmt_ticket_add_uq;
DEALLOCATE PREPARE stmt_ticket_add_uq;



-- DROP TABLE IF EXISTS order_detail;

-- DROP TABLE IF EXISTS order_combo;
-- DROP TABLE IF EXISTS combo_detail;
-- DROP TABLE IF EXISTS combo;

-- DROP TABLE IF EXISTS ticket;
-- DROP TABLE IF EXISTS price_ticket;
-- DROP TABLE IF EXISTS show_time;
-- DROP TABLE IF EXISTS show_time_seat;
-- DROP TABLE IF EXISTS seat;
-- DROP TABLE IF EXISTS room;
-- DROP TABLE IF EXISTS cinema;
-- DROP TABLE IF EXISTS movie;

-- DROP TABLE IF EXISTS product;
-- DROP TABLE IF EXISTS product_type;
-- DROP TABLE IF EXISTS movie_type;
-- DROP TABLE IF EXISTS room_type;
-- DROP TABLE IF EXISTS seat_type;
-- DROP TABLE IF EXISTS province;
-- DROP TABLE IF EXISTS payment;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS users;

SET SQL_SAFE_UPDATES = 0;
DELETE FROM order_combo;
DELETE FROM payment;
DELETE FROM ticket;
DELETE FROM show_time_seat;
DELETE FROM orders;
DELETE FROM combo;
DELETE FROM show_time;
DELETE FROM seat;
DELETE FROM room;
DELETE FROM movie;
DELETE FROM cinema;
DELETE FROM price_ticket;
DELETE FROM movie_type;
DELETE FROM room_type;
DELETE FROM seat_type;
DELETE FROM province;

DELETE FROM otp_token;
DELETE FROM users;

SET FOREIGN_KEY_CHECKS = 0;


TRUNCATE TABLE order_combo;
-- TRUNCATE TABLE combo_detail;
TRUNCATE TABLE combo;
TRUNCATE TABLE ticket;
TRUNCATE TABLE price_ticket;
TRUNCATE TABLE show_time_seat;
TRUNCATE TABLE show_time;
TRUNCATE TABLE seat;
TRUNCATE TABLE room;
TRUNCATE TABLE cinema;
TRUNCATE TABLE movie;
-- TRUNCATE TABLE product;
-- TRUNCATE TABLE product_type;
TRUNCATE TABLE movie_type;
TRUNCATE TABLE room_type;
TRUNCATE TABLE seat_type;
TRUNCATE TABLE province;
TRUNCATE TABLE payment;
TRUNCATE TABLE orders;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;
-- movie_type
INSERT INTO movie_type (movie_type_name, description, status) VALUES
('Hành động',           'Phim hành động, võ thuật, bắn súng',      'ACTIVE'),
('Kinh dị',             'Phim kinh dị, ma quái, giật gân',         'ACTIVE'),
('Hài hước',            'Phim hài, giải trí nhẹ nhàng',            'ACTIVE'),
('Hoạt hình',           'Phim hoạt hình cho mọi lứa tuổi',         'ACTIVE'),
('Tình cảm',            'Phim tình cảm, lãng mạn',                 'INACTIVE'),
('Khoa học viễn tưởng', 'Phim sci-fi, vũ trụ, tương lai',          'INACTIVE');

-- room_type
INSERT INTO room_type (room_type_name, description, status) VALUES
('2D',   'Phòng chiếu phim 2D tiêu chuẩn',        'ACTIVE'),
('3D',   'Phòng chiếu phim 3D',                    'ACTIVE'),
('IMAX', 'Phòng chiếu IMAX màn hình lớn',         'INACTIVE');

-- seat_type
INSERT INTO seat_type (seat_type_name, description, status) VALUES
('Thường',   'Ghế ngồi tiêu chuẩn',               'ACTIVE'),
('VIP',      'Ghế VIP rộng hơn, êm hơn',           'ACTIVE'),
('Đôi',      'Ghế đôi dành cho cặp đôi',           'INACTIVE');

INSERT INTO province (province_name, status) VALUES
('TP.HCM',  'ACTIVE'),
('Hà Nội',  'ACTIVE'),
('Đà Nẵng', 'ACTIVE');


-- user (password = bcrypt hash of "Password@123")
INSERT INTO users (full_name, phone_number, date_of_birth, sex, password_hash, email, role, created_at, updated_at, status) VALUES
-- ('Nguyễn Văn Admin',  '0901000001', '1985-03-15', 'MALE',         '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'admin@cinema.vn',        'ADMIN', NOW(), NOW(), 'ACTIVE'),
('Trần Thị Staff',    '0901000002', '1995-07-20', 'FEMALE',       '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'staff01@cinema.vn',      'STAFF', NOW(), NOW(), 'ACTIVE'),
('Lê Minh Tuấn',      '0901000003', '1998-01-10', 'MALE',    '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'leminhtuán@gmail.com',   'USER',  NOW(), NOW(), 'ACTIVE'),
('Phạm Thị Hoa',      '0901000004', '2000-05-25', 'FEMALE',    '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'phamthihoa@gmail.com',   'USER',  NOW(), NOW(), 'ACTIVE'),
('Hoàng Đức Mạnh',    '0901000005', '1997-09-30', 'MALE',  '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'hoangeucmanh@gmail.com', 'USER',  NOW(), NOW(), 'LOCKED'),
('Vũ Thị Lan',        '0901000006', '2001-12-05', 'FEMALE',      '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'vuthilan@gmail.com',     'USER',  NOW(), NOW(), 'SUSPENDED'),
('Đặng Văn Hùng',     '0901000007', '1993-04-18', 'MALE',   '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'dangvanhung@gmail.com',  'USER',  NOW(), NOW(), 'DELETED'),
('Bùi Thị Mai',       '0901000008', '1999-08-22', 'FEMALE',     '$2a$10$6N.77r.YdmDx/FtNGnojXu24ALzHxNpHA8eJ2dfAytM68XLZbis9i', 'buithimai@gmail.com',    'USER',  NOW(), NOW(), 'DELETED');

-- cinema
-- cinema (Galaxy)
INSERT INTO cinema (cinema_name, province_id, address, status) VALUES
('Galaxy Nguyễn Du',        (SELECT province_id FROM province WHERE province_name = 'TP.HCM' LIMIT 1),  '116 Nguyễn Du, Q.1',                       'ACTIVE'),
('Galaxy Tân Bình',         (SELECT province_id FROM province WHERE province_name = 'TP.HCM' LIMIT 1),  '246 Nguyễn Hồng Đào, Q.Tân Bình',          'ACTIVE'),
('Galaxy Kinh Dương Vương', (SELECT province_id FROM province WHERE province_name = 'TP.HCM' LIMIT 1),  '950 Kinh Dương Vương, Q.Bình Tân',         'ACTIVE'),
('Galaxy Mipec Long Biên',  (SELECT province_id FROM province WHERE province_name = 'Hà Nội' LIMIT 1),  'Mipec Long Biên, 2 Long Biên, Q.Long Biên', 'INACTIVE'),
('Galaxy Đà Nẵng',          (SELECT province_id FROM province WHERE province_name = 'Đà Nẵng' LIMIT 1), '05 Hoàng Văn Thụ, Q.Hải Châu',             'INACTIVE');

-- room
-- cinema 1 - Galaxy Nguyễn Du (6 phòng)
INSERT INTO room (room_type_id, room_name, cinema_id, capacity, status) VALUES
(1, 'Phòng 1 - 2D',   1, 120, 'ACTIVE'),
(1, 'Phòng 2 - 2D',   1, 110, 'ACTIVE'),
(1, 'Phòng 3 - 2D',   1, 100, 'ACTIVE'),
(2, 'Phòng 4 - 3D',   1, 100, 'ACTIVE'),
(2, 'Phòng 5 - 3D',   1,  90, 'INACTIVE'),
(3, 'Phòng 6 - IMAX', 1,  80, 'INACTIVE'),

-- cinema 2 - Galaxy Tân Bình (5 phòng)
(1, 'Phòng 1 - 2D',   2, 120, 'ACTIVE'),
(1, 'Phòng 2 - 2D',   2, 110, 'ACTIVE'),
(2, 'Phòng 3 - 3D',   2, 100, 'ACTIVE'),
(2, 'Phòng 4 - 3D',   2,  90, 'ACTIVE'),
(3, 'Phòng 5 - IMAX', 2,  80, 'INACTIVE'),

-- cinema 3 - Galaxy Kinh Dương Vương (4 phòng)
(1, 'Phòng 1 - 2D',   3, 120, 'ACTIVE'),
(1, 'Phòng 2 - 2D',   3, 110, 'ACTIVE'),
(2, 'Phòng 3 - 3D',   3, 100, 'ACTIVE'),
(3, 'Phòng 4 - IMAX', 3,  80, 'ACTIVE'),

-- cinema 4 - Galaxy Mipec Long Biên (6 phòng)
(1, 'Phòng 1 - 2D',   4, 130, 'INACTIVE'),
(1, 'Phòng 2 - 2D',   4, 120, 'INACTIVE'),
(1, 'Phòng 3 - 2D',   4, 110, 'ACTIVE'),
(2, 'Phòng 4 - 3D',   4, 100, 'ACTIVE'),
(2, 'Phòng 5 - 3D',   4,  90, 'ACTIVE'),
(3, 'Phòng 6 - IMAX', 4,  80, 'ACTIVE'),

-- cinema 5 - Galaxy Đà Nẵng (5 phòng)
(1, 'Phòng 1 - 2D',   5, 115, 'INACTIVE'),
(1, 'Phòng 2 - 2D',   5, 105, 'INACTIVE'),
(2, 'Phòng 3 - 3D',   5,  95, 'ACTIVE'),
(2, 'Phòng 4 - 3D',   5,  85, 'ACTIVE'),
(3, 'Phòng 5 - IMAX', 5,  75, 'ACTIVE');
-- =============================================
-- SEAT DATA CHO 26 PHÒNG
-- room_id 1-6:   cinema 1 (Galaxy Nguyễn Du)
-- room_id 7-11:  cinema 2 (Galaxy Tân Bình)
-- room_id 12-15: cinema 3 (Galaxy Kinh Dương Vương)
-- room_id 16-21: cinema 4 (Galaxy Mipec Long Biên)
-- room_id 22-26: cinema 5 (Galaxy Đà Nẵng)
-- =============================================
-- Quy tắc:
-- 2D  (120 ghế): 12 cột | A-G Thường(84), H-I VIP(24), J Đôi(6 cặp=12ghế)
-- 2D  (110 ghế): 11 cột | A-G Thường(77), H-I VIP(22), J Đôi(6 cặp=11ghế) → dùng 10 cột J
-- 2D  (100 ghế): 10 cột | A-F Thường(60), G-H VIP(20), I Đôi(10 cặp=20ghế)  → 5 cặp=10ghế
-- 3D  (100 ghế): 10 cột | A-F Thường(60), G-H VIP(20), I Đôi(5 cặp=10ghế) → wait, 90+10
-- 3D  ( 90 ghế): 10 cột | A-F Thường(60), G-H VIP(20), I Đôi(5 cặp=10ghế)
-- IMAX( 80 ghế): 10 cột | A-E Thường(50), F-G VIP(20), H Đôi(5 cặp=10ghế)
-- =============================================

-- ====================
-- ROOM 1 | 2D | 120 ghế | cinema 1
-- A-G Thường (7 hàng x 12 cột = 84), H-I VIP (2 x 12 = 24), J Đôi (6 cặp = 12)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,1,'A',1,'ACTIVE'),(1,1,'A',2,'ACTIVE'),(1,1,'A',3,'ACTIVE'),(1,1,'A',4,'ACTIVE'),(1,1,'A',5,'ACTIVE'),(1,1,'A',6,'ACTIVE'),(1,1,'A',7,'ACTIVE'),(1,1,'A',8,'ACTIVE'),(1,1,'A',9,'ACTIVE'),(1,1,'A',10,'ACTIVE'),(1,1,'A',11,'ACTIVE'),(1,1,'A',12,'ACTIVE'),
(1,1,'B',1,'ACTIVE'),(1,1,'B',2,'ACTIVE'),(1,1,'B',3,'ACTIVE'),(1,1,'B',4,'ACTIVE'),(1,1,'B',5,'ACTIVE'),(1,1,'B',6,'ACTIVE'),(1,1,'B',7,'ACTIVE'),(1,1,'B',8,'ACTIVE'),(1,1,'B',9,'ACTIVE'),(1,1,'B',10,'ACTIVE'),(1,1,'B',11,'ACTIVE'),(1,1,'B',12,'ACTIVE'),
(1,1,'C',1,'ACTIVE'),(1,1,'C',2,'ACTIVE'),(1,1,'C',3,'ACTIVE'),(1,1,'C',4,'ACTIVE'),(1,1,'C',5,'ACTIVE'),(1,1,'C',6,'ACTIVE'),(1,1,'C',7,'ACTIVE'),(1,1,'C',8,'ACTIVE'),(1,1,'C',9,'ACTIVE'),(1,1,'C',10,'ACTIVE'),(1,1,'C',11,'ACTIVE'),(1,1,'C',12,'ACTIVE'),
(1,1,'D',1,'ACTIVE'),(1,1,'D',2,'ACTIVE'),(1,1,'D',3,'ACTIVE'),(1,1,'D',4,'ACTIVE'),(1,1,'D',5,'ACTIVE'),(1,1,'D',6,'ACTIVE'),(1,1,'D',7,'ACTIVE'),(1,1,'D',8,'ACTIVE'),(1,1,'D',9,'ACTIVE'),(1,1,'D',10,'ACTIVE'),(1,1,'D',11,'ACTIVE'),(1,1,'D',12,'ACTIVE'),
(1,1,'E',1,'ACTIVE'),(1,1,'E',2,'ACTIVE'),(1,1,'E',3,'ACTIVE'),(1,1,'E',4,'ACTIVE'),(1,1,'E',5,'ACTIVE'),(1,1,'E',6,'ACTIVE'),(1,1,'E',7,'ACTIVE'),(1,1,'E',8,'ACTIVE'),(1,1,'E',9,'ACTIVE'),(1,1,'E',10,'ACTIVE'),(1,1,'E',11,'ACTIVE'),(1,1,'E',12,'ACTIVE'),
(1,1,'F',1,'ACTIVE'),(1,1,'F',2,'ACTIVE'),(1,1,'F',3,'ACTIVE'),(1,1,'F',4,'ACTIVE'),(1,1,'F',5,'ACTIVE'),(1,1,'F',6,'ACTIVE'),(1,1,'F',7,'ACTIVE'),(1,1,'F',8,'ACTIVE'),(1,1,'F',9,'ACTIVE'),(1,1,'F',10,'ACTIVE'),(1,1,'F',11,'ACTIVE'),(1,1,'F',12,'ACTIVE'),
(1,1,'G',1,'ACTIVE'),(1,1,'G',2,'ACTIVE'),(1,1,'G',3,'ACTIVE'),(1,1,'G',4,'ACTIVE'),(1,1,'G',5,'ACTIVE'),(1,1,'G',6,'ACTIVE'),(1,1,'G',7,'ACTIVE'),(1,1,'G',8,'ACTIVE'),(1,1,'G',9,'ACTIVE'),(1,1,'G',10,'ACTIVE'),(1,1,'G',11,'ACTIVE'),(1,1,'G',12,'ACTIVE'),
(2,1,'H',1,'ACTIVE'),(2,1,'H',2,'ACTIVE'),(2,1,'H',3,'ACTIVE'),(2,1,'H',4,'ACTIVE'),(2,1,'H',5,'ACTIVE'),(2,1,'H',6,'ACTIVE'),(2,1,'H',7,'ACTIVE'),(2,1,'H',8,'ACTIVE'),(2,1,'H',9,'ACTIVE'),(2,1,'H',10,'ACTIVE'),(2,1,'H',11,'ACTIVE'),(2,1,'H',12,'ACTIVE'),
(2,1,'I',1,'ACTIVE'),(2,1,'I',2,'ACTIVE'),(2,1,'I',3,'ACTIVE'),(2,1,'I',4,'ACTIVE'),(2,1,'I',5,'ACTIVE'),(2,1,'I',6,'ACTIVE'),(2,1,'I',7,'ACTIVE'),(2,1,'I',8,'ACTIVE'),(2,1,'I',9,'ACTIVE'),(2,1,'I',10,'ACTIVE'),(2,1,'I',11,'ACTIVE'),(2,1,'I',12,'ACTIVE'),
(3,1,'J',1,'ACTIVE'),(3,1,'J',2,'ACTIVE'),(3,1,'J',3,'ACTIVE'),(3,1,'J',4,'ACTIVE'),(3,1,'J',5,'ACTIVE'),(3,1,'J',6,'ACTIVE'),(3,1,'J',7,'ACTIVE'),(3,1,'J',8,'ACTIVE'),(3,1,'J',9,'ACTIVE'),(3,1,'J',10,'ACTIVE'),(3,1,'J',11,'ACTIVE'),(3,1,'J',12,'ACTIVE');

-- ====================
-- ROOM 2 | 2D | 110 ghế | cinema 1
-- A-G Thường (7 x 11 = 77), H-I VIP (2 x 11 = 22), J Đôi (11 ghế)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,2,'A',1,'ACTIVE'),(1,2,'A',2,'ACTIVE'),(1,2,'A',3,'ACTIVE'),(1,2,'A',4,'ACTIVE'),(1,2,'A',5,'ACTIVE'),(1,2,'A',6,'ACTIVE'),(1,2,'A',7,'ACTIVE'),(1,2,'A',8,'ACTIVE'),(1,2,'A',9,'ACTIVE'),(1,2,'A',10,'ACTIVE'),(1,2,'A',11,'ACTIVE'),
(1,2,'B',1,'ACTIVE'),(1,2,'B',2,'ACTIVE'),(1,2,'B',3,'ACTIVE'),(1,2,'B',4,'ACTIVE'),(1,2,'B',5,'ACTIVE'),(1,2,'B',6,'ACTIVE'),(1,2,'B',7,'ACTIVE'),(1,2,'B',8,'ACTIVE'),(1,2,'B',9,'ACTIVE'),(1,2,'B',10,'ACTIVE'),(1,2,'B',11,'ACTIVE'),
(1,2,'C',1,'ACTIVE'),(1,2,'C',2,'ACTIVE'),(1,2,'C',3,'ACTIVE'),(1,2,'C',4,'ACTIVE'),(1,2,'C',5,'ACTIVE'),(1,2,'C',6,'ACTIVE'),(1,2,'C',7,'ACTIVE'),(1,2,'C',8,'ACTIVE'),(1,2,'C',9,'ACTIVE'),(1,2,'C',10,'ACTIVE'),(1,2,'C',11,'ACTIVE'),
(1,2,'D',1,'ACTIVE'),(1,2,'D',2,'ACTIVE'),(1,2,'D',3,'ACTIVE'),(1,2,'D',4,'ACTIVE'),(1,2,'D',5,'ACTIVE'),(1,2,'D',6,'ACTIVE'),(1,2,'D',7,'ACTIVE'),(1,2,'D',8,'ACTIVE'),(1,2,'D',9,'ACTIVE'),(1,2,'D',10,'ACTIVE'),(1,2,'D',11,'ACTIVE'),
(1,2,'E',1,'ACTIVE'),(1,2,'E',2,'ACTIVE'),(1,2,'E',3,'ACTIVE'),(1,2,'E',4,'ACTIVE'),(1,2,'E',5,'ACTIVE'),(1,2,'E',6,'ACTIVE'),(1,2,'E',7,'ACTIVE'),(1,2,'E',8,'ACTIVE'),(1,2,'E',9,'ACTIVE'),(1,2,'E',10,'ACTIVE'),(1,2,'E',11,'ACTIVE'),
(1,2,'F',1,'ACTIVE'),(1,2,'F',2,'ACTIVE'),(1,2,'F',3,'ACTIVE'),(1,2,'F',4,'ACTIVE'),(1,2,'F',5,'ACTIVE'),(1,2,'F',6,'ACTIVE'),(1,2,'F',7,'ACTIVE'),(1,2,'F',8,'ACTIVE'),(1,2,'F',9,'ACTIVE'),(1,2,'F',10,'ACTIVE'),(1,2,'F',11,'ACTIVE'),
(1,2,'G',1,'ACTIVE'),(1,2,'G',2,'ACTIVE'),(1,2,'G',3,'ACTIVE'),(1,2,'G',4,'ACTIVE'),(1,2,'G',5,'ACTIVE'),(1,2,'G',6,'ACTIVE'),(1,2,'G',7,'ACTIVE'),(1,2,'G',8,'ACTIVE'),(1,2,'G',9,'ACTIVE'),(1,2,'G',10,'ACTIVE'),(1,2,'G',11,'ACTIVE'),
(2,2,'H',1,'ACTIVE'),(2,2,'H',2,'ACTIVE'),(2,2,'H',3,'ACTIVE'),(2,2,'H',4,'ACTIVE'),(2,2,'H',5,'ACTIVE'),(2,2,'H',6,'ACTIVE'),(2,2,'H',7,'ACTIVE'),(2,2,'H',8,'ACTIVE'),(2,2,'H',9,'ACTIVE'),(2,2,'H',10,'ACTIVE'),(2,2,'H',11,'ACTIVE'),
(2,2,'I',1,'ACTIVE'),(2,2,'I',2,'ACTIVE'),(2,2,'I',3,'ACTIVE'),(2,2,'I',4,'ACTIVE'),(2,2,'I',5,'ACTIVE'),(2,2,'I',6,'ACTIVE'),(2,2,'I',7,'ACTIVE'),(2,2,'I',8,'ACTIVE'),(2,2,'I',9,'ACTIVE'),(2,2,'I',10,'ACTIVE'),(2,2,'I',11,'ACTIVE'),
(3,2,'J',1,'ACTIVE'),(3,2,'J',2,'ACTIVE'),(3,2,'J',3,'ACTIVE'),(3,2,'J',4,'ACTIVE'),(3,2,'J',5,'ACTIVE'),(3,2,'J',6,'ACTIVE'),(3,2,'J',7,'ACTIVE'),(3,2,'J',8,'ACTIVE'),(3,2,'J',9,'ACTIVE'),(3,2,'J',10,'ACTIVE'),(3,2,'J',11,'ACTIVE');

-- ====================
-- ROOM 3 | 2D | 100 ghế | cinema 1
-- A-F Thường (6 x 10 = 60), G-H VIP (2 x 10 = 20), I Đôi (10 ghế)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,3,'A',1,'ACTIVE'),(1,3,'A',2,'ACTIVE'),(1,3,'A',3,'ACTIVE'),(1,3,'A',4,'ACTIVE'),(1,3,'A',5,'ACTIVE'),(1,3,'A',6,'ACTIVE'),(1,3,'A',7,'ACTIVE'),(1,3,'A',8,'ACTIVE'),(1,3,'A',9,'ACTIVE'),(1,3,'A',10,'ACTIVE'),
(1,3,'B',1,'ACTIVE'),(1,3,'B',2,'ACTIVE'),(1,3,'B',3,'ACTIVE'),(1,3,'B',4,'ACTIVE'),(1,3,'B',5,'ACTIVE'),(1,3,'B',6,'ACTIVE'),(1,3,'B',7,'ACTIVE'),(1,3,'B',8,'ACTIVE'),(1,3,'B',9,'ACTIVE'),(1,3,'B',10,'ACTIVE'),
(1,3,'C',1,'ACTIVE'),(1,3,'C',2,'ACTIVE'),(1,3,'C',3,'ACTIVE'),(1,3,'C',4,'ACTIVE'),(1,3,'C',5,'ACTIVE'),(1,3,'C',6,'ACTIVE'),(1,3,'C',7,'ACTIVE'),(1,3,'C',8,'ACTIVE'),(1,3,'C',9,'ACTIVE'),(1,3,'C',10,'ACTIVE'),
(1,3,'D',1,'ACTIVE'),(1,3,'D',2,'ACTIVE'),(1,3,'D',3,'ACTIVE'),(1,3,'D',4,'ACTIVE'),(1,3,'D',5,'ACTIVE'),(1,3,'D',6,'ACTIVE'),(1,3,'D',7,'ACTIVE'),(1,3,'D',8,'ACTIVE'),(1,3,'D',9,'ACTIVE'),(1,3,'D',10,'ACTIVE'),
(1,3,'E',1,'ACTIVE'),(1,3,'E',2,'ACTIVE'),(1,3,'E',3,'ACTIVE'),(1,3,'E',4,'ACTIVE'),(1,3,'E',5,'ACTIVE'),(1,3,'E',6,'ACTIVE'),(1,3,'E',7,'ACTIVE'),(1,3,'E',8,'ACTIVE'),(1,3,'E',9,'ACTIVE'),(1,3,'E',10,'ACTIVE'),
(1,3,'F',1,'ACTIVE'),(1,3,'F',2,'ACTIVE'),(1,3,'F',3,'ACTIVE'),(1,3,'F',4,'ACTIVE'),(1,3,'F',5,'ACTIVE'),(1,3,'F',6,'ACTIVE'),(1,3,'F',7,'ACTIVE'),(1,3,'F',8,'ACTIVE'),(1,3,'F',9,'ACTIVE'),(1,3,'F',10,'ACTIVE'),
(2,3,'G',1,'ACTIVE'),(2,3,'G',2,'ACTIVE'),(2,3,'G',3,'ACTIVE'),(2,3,'G',4,'ACTIVE'),(2,3,'G',5,'ACTIVE'),(2,3,'G',6,'ACTIVE'),(2,3,'G',7,'ACTIVE'),(2,3,'G',8,'ACTIVE'),(2,3,'G',9,'ACTIVE'),(2,3,'G',10,'ACTIVE'),
(2,3,'H',1,'ACTIVE'),(2,3,'H',2,'ACTIVE'),(2,3,'H',3,'ACTIVE'),(2,3,'H',4,'ACTIVE'),(2,3,'H',5,'ACTIVE'),(2,3,'H',6,'ACTIVE'),(2,3,'H',7,'ACTIVE'),(2,3,'H',8,'ACTIVE'),(2,3,'H',9,'ACTIVE'),(2,3,'H',10,'ACTIVE'),
(3,3,'I',1,'ACTIVE'),(3,3,'I',2,'ACTIVE'),(3,3,'I',3,'ACTIVE'),(3,3,'I',4,'ACTIVE'),(3,3,'I',5,'ACTIVE'),(3,3,'I',6,'ACTIVE'),(3,3,'I',7,'ACTIVE'),(3,3,'I',8,'ACTIVE'),(3,3,'I',9,'ACTIVE'),(3,3,'I',10,'ACTIVE');

-- ====================
-- ROOM 4 | 3D | 100 ghế | cinema 1
-- A-F Thường (60), G-H VIP (20), I Đôi (10)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,4,'A',1,'ACTIVE'),(1,4,'A',2,'ACTIVE'),(1,4,'A',3,'ACTIVE'),(1,4,'A',4,'ACTIVE'),(1,4,'A',5,'ACTIVE'),(1,4,'A',6,'ACTIVE'),(1,4,'A',7,'ACTIVE'),(1,4,'A',8,'ACTIVE'),(1,4,'A',9,'ACTIVE'),(1,4,'A',10,'ACTIVE'),
(1,4,'B',1,'ACTIVE'),(1,4,'B',2,'ACTIVE'),(1,4,'B',3,'ACTIVE'),(1,4,'B',4,'ACTIVE'),(1,4,'B',5,'ACTIVE'),(1,4,'B',6,'ACTIVE'),(1,4,'B',7,'ACTIVE'),(1,4,'B',8,'ACTIVE'),(1,4,'B',9,'ACTIVE'),(1,4,'B',10,'ACTIVE'),
(1,4,'C',1,'ACTIVE'),(1,4,'C',2,'ACTIVE'),(1,4,'C',3,'ACTIVE'),(1,4,'C',4,'ACTIVE'),(1,4,'C',5,'ACTIVE'),(1,4,'C',6,'ACTIVE'),(1,4,'C',7,'ACTIVE'),(1,4,'C',8,'ACTIVE'),(1,4,'C',9,'ACTIVE'),(1,4,'C',10,'ACTIVE'),
(1,4,'D',1,'ACTIVE'),(1,4,'D',2,'ACTIVE'),(1,4,'D',3,'ACTIVE'),(1,4,'D',4,'ACTIVE'),(1,4,'D',5,'ACTIVE'),(1,4,'D',6,'ACTIVE'),(1,4,'D',7,'ACTIVE'),(1,4,'D',8,'ACTIVE'),(1,4,'D',9,'ACTIVE'),(1,4,'D',10,'ACTIVE'),
(1,4,'E',1,'ACTIVE'),(1,4,'E',2,'ACTIVE'),(1,4,'E',3,'ACTIVE'),(1,4,'E',4,'ACTIVE'),(1,4,'E',5,'ACTIVE'),(1,4,'E',6,'ACTIVE'),(1,4,'E',7,'ACTIVE'),(1,4,'E',8,'ACTIVE'),(1,4,'E',9,'ACTIVE'),(1,4,'E',10,'ACTIVE'),
(1,4,'F',1,'ACTIVE'),(1,4,'F',2,'ACTIVE'),(1,4,'F',3,'ACTIVE'),(1,4,'F',4,'ACTIVE'),(1,4,'F',5,'ACTIVE'),(1,4,'F',6,'ACTIVE'),(1,4,'F',7,'ACTIVE'),(1,4,'F',8,'ACTIVE'),(1,4,'F',9,'ACTIVE'),(1,4,'F',10,'ACTIVE'),
(2,4,'G',1,'ACTIVE'),(2,4,'G',2,'ACTIVE'),(2,4,'G',3,'ACTIVE'),(2,4,'G',4,'ACTIVE'),(2,4,'G',5,'ACTIVE'),(2,4,'G',6,'ACTIVE'),(2,4,'G',7,'ACTIVE'),(2,4,'G',8,'ACTIVE'),(2,4,'G',9,'ACTIVE'),(2,4,'G',10,'ACTIVE'),
(2,4,'H',1,'ACTIVE'),(2,4,'H',2,'ACTIVE'),(2,4,'H',3,'ACTIVE'),(2,4,'H',4,'ACTIVE'),(2,4,'H',5,'ACTIVE'),(2,4,'H',6,'ACTIVE'),(2,4,'H',7,'ACTIVE'),(2,4,'H',8,'ACTIVE'),(2,4,'H',9,'ACTIVE'),(2,4,'H',10,'ACTIVE'),
(3,4,'I',1,'ACTIVE'),(3,4,'I',2,'ACTIVE'),(3,4,'I',3,'ACTIVE'),(3,4,'I',4,'ACTIVE'),(3,4,'I',5,'ACTIVE'),(3,4,'I',6,'ACTIVE'),(3,4,'I',7,'ACTIVE'),(3,4,'I',8,'ACTIVE'),(3,4,'I',9,'ACTIVE'),(3,4,'I',10,'ACTIVE');

-- ====================
-- ROOM 5 | 3D | 90 ghế | cinema 1
-- A-E Thường (5 x 10 = 50), F-G VIP (2 x 10 = 20), H Đôi (10 ghế)  → wait 80, thêm 1 hàng Thường
-- A-F Thường (60), G-H VIP (20), I Đôi (10) → 90
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,5,'A',1,'ACTIVE'),(1,5,'A',2,'ACTIVE'),(1,5,'A',3,'ACTIVE'),(1,5,'A',4,'ACTIVE'),(1,5,'A',5,'ACTIVE'),(1,5,'A',6,'ACTIVE'),(1,5,'A',7,'ACTIVE'),(1,5,'A',8,'ACTIVE'),(1,5,'A',9,'ACTIVE'),(1,5,'A',10,'ACTIVE'),
(1,5,'B',1,'ACTIVE'),(1,5,'B',2,'ACTIVE'),(1,5,'B',3,'ACTIVE'),(1,5,'B',4,'ACTIVE'),(1,5,'B',5,'ACTIVE'),(1,5,'B',6,'ACTIVE'),(1,5,'B',7,'ACTIVE'),(1,5,'B',8,'ACTIVE'),(1,5,'B',9,'ACTIVE'),(1,5,'B',10,'ACTIVE'),
(1,5,'C',1,'ACTIVE'),(1,5,'C',2,'ACTIVE'),(1,5,'C',3,'ACTIVE'),(1,5,'C',4,'ACTIVE'),(1,5,'C',5,'ACTIVE'),(1,5,'C',6,'ACTIVE'),(1,5,'C',7,'ACTIVE'),(1,5,'C',8,'ACTIVE'),(1,5,'C',9,'ACTIVE'),(1,5,'C',10,'ACTIVE'),
(1,5,'D',1,'ACTIVE'),(1,5,'D',2,'ACTIVE'),(1,5,'D',3,'ACTIVE'),(1,5,'D',4,'ACTIVE'),(1,5,'D',5,'ACTIVE'),(1,5,'D',6,'ACTIVE'),(1,5,'D',7,'ACTIVE'),(1,5,'D',8,'ACTIVE'),(1,5,'D',9,'ACTIVE'),(1,5,'D',10,'ACTIVE'),
(1,5,'E',1,'ACTIVE'),(1,5,'E',2,'ACTIVE'),(1,5,'E',3,'ACTIVE'),(1,5,'E',4,'ACTIVE'),(1,5,'E',5,'ACTIVE'),(1,5,'E',6,'ACTIVE'),(1,5,'E',7,'ACTIVE'),(1,5,'E',8,'ACTIVE'),(1,5,'E',9,'ACTIVE'),(1,5,'E',10,'ACTIVE'),
(1,5,'F',1,'ACTIVE'),(1,5,'F',2,'ACTIVE'),(1,5,'F',3,'ACTIVE'),(1,5,'F',4,'ACTIVE'),(1,5,'F',5,'ACTIVE'),(1,5,'F',6,'ACTIVE'),(1,5,'F',7,'ACTIVE'),(1,5,'F',8,'ACTIVE'),(1,5,'F',9,'ACTIVE'),(1,5,'F',10,'ACTIVE'),
(2,5,'G',1,'ACTIVE'),(2,5,'G',2,'ACTIVE'),(2,5,'G',3,'ACTIVE'),(2,5,'G',4,'ACTIVE'),(2,5,'G',5,'ACTIVE'),(2,5,'G',6,'ACTIVE'),(2,5,'G',7,'ACTIVE'),(2,5,'G',8,'ACTIVE'),(2,5,'G',9,'ACTIVE'),(2,5,'G',10,'ACTIVE'),
(2,5,'H',1,'ACTIVE'),(2,5,'H',2,'ACTIVE'),(2,5,'H',3,'ACTIVE'),(2,5,'H',4,'ACTIVE'),(2,5,'H',5,'ACTIVE'),(2,5,'H',6,'ACTIVE'),(2,5,'H',7,'ACTIVE'),(2,5,'H',8,'ACTIVE'),(2,5,'H',9,'ACTIVE'),(2,5,'H',10,'ACTIVE'),
(3,5,'I',1,'ACTIVE'),(3,5,'I',2,'ACTIVE'),(3,5,'I',3,'ACTIVE'),(3,5,'I',4,'ACTIVE'),(3,5,'I',5,'ACTIVE'),(3,5,'I',6,'ACTIVE'),(3,5,'I',7,'ACTIVE'),(3,5,'I',8,'ACTIVE'),(3,5,'I',9,'ACTIVE'),(3,5,'I',10,'ACTIVE');

-- ====================
-- ROOM 6 | IMAX | 80 ghế | cinema 1
-- A-E Thường (5 x 10 = 50), F-G VIP (2 x 10 = 20), H Đôi (10 ghế)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,6,'A',1,'ACTIVE'),(1,6,'A',2,'ACTIVE'),(1,6,'A',3,'ACTIVE'),(1,6,'A',4,'ACTIVE'),(1,6,'A',5,'ACTIVE'),(1,6,'A',6,'ACTIVE'),(1,6,'A',7,'ACTIVE'),(1,6,'A',8,'ACTIVE'),(1,6,'A',9,'ACTIVE'),(1,6,'A',10,'ACTIVE'),
(1,6,'B',1,'ACTIVE'),(1,6,'B',2,'ACTIVE'),(1,6,'B',3,'ACTIVE'),(1,6,'B',4,'ACTIVE'),(1,6,'B',5,'ACTIVE'),(1,6,'B',6,'ACTIVE'),(1,6,'B',7,'ACTIVE'),(1,6,'B',8,'ACTIVE'),(1,6,'B',9,'ACTIVE'),(1,6,'B',10,'ACTIVE'),
(1,6,'C',1,'ACTIVE'),(1,6,'C',2,'ACTIVE'),(1,6,'C',3,'ACTIVE'),(1,6,'C',4,'ACTIVE'),(1,6,'C',5,'ACTIVE'),(1,6,'C',6,'ACTIVE'),(1,6,'C',7,'ACTIVE'),(1,6,'C',8,'ACTIVE'),(1,6,'C',9,'ACTIVE'),(1,6,'C',10,'ACTIVE'),
(1,6,'D',1,'ACTIVE'),(1,6,'D',2,'ACTIVE'),(1,6,'D',3,'ACTIVE'),(1,6,'D',4,'ACTIVE'),(1,6,'D',5,'ACTIVE'),(1,6,'D',6,'ACTIVE'),(1,6,'D',7,'ACTIVE'),(1,6,'D',8,'ACTIVE'),(1,6,'D',9,'ACTIVE'),(1,6,'D',10,'ACTIVE'),
(1,6,'E',1,'ACTIVE'),(1,6,'E',2,'ACTIVE'),(1,6,'E',3,'ACTIVE'),(1,6,'E',4,'ACTIVE'),(1,6,'E',5,'ACTIVE'),(1,6,'E',6,'ACTIVE'),(1,6,'E',7,'ACTIVE'),(1,6,'E',8,'ACTIVE'),(1,6,'E',9,'ACTIVE'),(1,6,'E',10,'ACTIVE'),
(2,6,'F',1,'ACTIVE'),(2,6,'F',2,'ACTIVE'),(2,6,'F',3,'ACTIVE'),(2,6,'F',4,'ACTIVE'),(2,6,'F',5,'ACTIVE'),(2,6,'F',6,'ACTIVE'),(2,6,'F',7,'ACTIVE'),(2,6,'F',8,'ACTIVE'),(2,6,'F',9,'ACTIVE'),(2,6,'F',10,'ACTIVE'),
(2,6,'G',1,'ACTIVE'),(2,6,'G',2,'ACTIVE'),(2,6,'G',3,'ACTIVE'),(2,6,'G',4,'ACTIVE'),(2,6,'G',5,'ACTIVE'),(2,6,'G',6,'ACTIVE'),(2,6,'G',7,'ACTIVE'),(2,6,'G',8,'ACTIVE'),(2,6,'G',9,'ACTIVE'),(2,6,'G',10,'ACTIVE'),
(3,6,'H',1,'ACTIVE'),(3,6,'H',2,'ACTIVE'),(3,6,'H',3,'ACTIVE'),(3,6,'H',4,'ACTIVE'),(3,6,'H',5,'ACTIVE'),(3,6,'H',6,'ACTIVE'),(3,6,'H',7,'ACTIVE'),(3,6,'H',8,'ACTIVE'),(3,6,'H',9,'ACTIVE'),(3,6,'H',10,'ACTIVE');

-- ====================
-- ROOM 7 | 2D | 120 ghế | cinema 2
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,7,'A',1,'ACTIVE'),(1,7,'A',2,'ACTIVE'),(1,7,'A',3,'ACTIVE'),(1,7,'A',4,'ACTIVE'),(1,7,'A',5,'ACTIVE'),(1,7,'A',6,'ACTIVE'),(1,7,'A',7,'ACTIVE'),(1,7,'A',8,'ACTIVE'),(1,7,'A',9,'ACTIVE'),(1,7,'A',10,'ACTIVE'),(1,7,'A',11,'ACTIVE'),(1,7,'A',12,'ACTIVE'),
(1,7,'B',1,'ACTIVE'),(1,7,'B',2,'ACTIVE'),(1,7,'B',3,'ACTIVE'),(1,7,'B',4,'ACTIVE'),(1,7,'B',5,'ACTIVE'),(1,7,'B',6,'ACTIVE'),(1,7,'B',7,'ACTIVE'),(1,7,'B',8,'ACTIVE'),(1,7,'B',9,'ACTIVE'),(1,7,'B',10,'ACTIVE'),(1,7,'B',11,'ACTIVE'),(1,7,'B',12,'ACTIVE'),
(1,7,'C',1,'ACTIVE'),(1,7,'C',2,'ACTIVE'),(1,7,'C',3,'ACTIVE'),(1,7,'C',4,'ACTIVE'),(1,7,'C',5,'ACTIVE'),(1,7,'C',6,'ACTIVE'),(1,7,'C',7,'ACTIVE'),(1,7,'C',8,'ACTIVE'),(1,7,'C',9,'ACTIVE'),(1,7,'C',10,'ACTIVE'),(1,7,'C',11,'ACTIVE'),(1,7,'C',12,'ACTIVE'),
(1,7,'D',1,'ACTIVE'),(1,7,'D',2,'ACTIVE'),(1,7,'D',3,'ACTIVE'),(1,7,'D',4,'ACTIVE'),(1,7,'D',5,'ACTIVE'),(1,7,'D',6,'ACTIVE'),(1,7,'D',7,'ACTIVE'),(1,7,'D',8,'ACTIVE'),(1,7,'D',9,'ACTIVE'),(1,7,'D',10,'ACTIVE'),(1,7,'D',11,'ACTIVE'),(1,7,'D',12,'ACTIVE'),
(1,7,'E',1,'ACTIVE'),(1,7,'E',2,'ACTIVE'),(1,7,'E',3,'ACTIVE'),(1,7,'E',4,'ACTIVE'),(1,7,'E',5,'ACTIVE'),(1,7,'E',6,'ACTIVE'),(1,7,'E',7,'ACTIVE'),(1,7,'E',8,'ACTIVE'),(1,7,'E',9,'ACTIVE'),(1,7,'E',10,'ACTIVE'),(1,7,'E',11,'ACTIVE'),(1,7,'E',12,'ACTIVE'),
(1,7,'F',1,'ACTIVE'),(1,7,'F',2,'ACTIVE'),(1,7,'F',3,'ACTIVE'),(1,7,'F',4,'ACTIVE'),(1,7,'F',5,'ACTIVE'),(1,7,'F',6,'ACTIVE'),(1,7,'F',7,'ACTIVE'),(1,7,'F',8,'ACTIVE'),(1,7,'F',9,'ACTIVE'),(1,7,'F',10,'ACTIVE'),(1,7,'F',11,'ACTIVE'),(1,7,'F',12,'ACTIVE'),
(1,7,'G',1,'ACTIVE'),(1,7,'G',2,'ACTIVE'),(1,7,'G',3,'ACTIVE'),(1,7,'G',4,'ACTIVE'),(1,7,'G',5,'ACTIVE'),(1,7,'G',6,'ACTIVE'),(1,7,'G',7,'ACTIVE'),(1,7,'G',8,'ACTIVE'),(1,7,'G',9,'ACTIVE'),(1,7,'G',10,'ACTIVE'),(1,7,'G',11,'ACTIVE'),(1,7,'G',12,'ACTIVE'),
(2,7,'H',1,'ACTIVE'),(2,7,'H',2,'ACTIVE'),(2,7,'H',3,'ACTIVE'),(2,7,'H',4,'ACTIVE'),(2,7,'H',5,'ACTIVE'),(2,7,'H',6,'ACTIVE'),(2,7,'H',7,'ACTIVE'),(2,7,'H',8,'ACTIVE'),(2,7,'H',9,'ACTIVE'),(2,7,'H',10,'ACTIVE'),(2,7,'H',11,'ACTIVE'),(2,7,'H',12,'ACTIVE'),
(2,7,'I',1,'ACTIVE'),(2,7,'I',2,'ACTIVE'),(2,7,'I',3,'ACTIVE'),(2,7,'I',4,'ACTIVE'),(2,7,'I',5,'ACTIVE'),(2,7,'I',6,'ACTIVE'),(2,7,'I',7,'ACTIVE'),(2,7,'I',8,'ACTIVE'),(2,7,'I',9,'ACTIVE'),(2,7,'I',10,'ACTIVE'),(2,7,'I',11,'ACTIVE'),(2,7,'I',12,'ACTIVE'),
(3,7,'J',1,'ACTIVE'),(3,7,'J',2,'ACTIVE'),(3,7,'J',3,'ACTIVE'),(3,7,'J',4,'ACTIVE'),(3,7,'J',5,'ACTIVE'),(3,7,'J',6,'ACTIVE'),(3,7,'J',7,'ACTIVE'),(3,7,'J',8,'ACTIVE'),(3,7,'J',9,'ACTIVE'),(3,7,'J',10,'ACTIVE'),(3,7,'J',11,'ACTIVE'),(3,7,'J',12,'ACTIVE');

-- ====================
-- ROOM 8 | 2D | 110 ghế | cinema 2
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,8,'A',1,'ACTIVE'),(1,8,'A',2,'ACTIVE'),(1,8,'A',3,'ACTIVE'),(1,8,'A',4,'ACTIVE'),(1,8,'A',5,'ACTIVE'),(1,8,'A',6,'ACTIVE'),(1,8,'A',7,'ACTIVE'),(1,8,'A',8,'ACTIVE'),(1,8,'A',9,'ACTIVE'),(1,8,'A',10,'ACTIVE'),(1,8,'A',11,'ACTIVE'),
(1,8,'B',1,'ACTIVE'),(1,8,'B',2,'ACTIVE'),(1,8,'B',3,'ACTIVE'),(1,8,'B',4,'ACTIVE'),(1,8,'B',5,'ACTIVE'),(1,8,'B',6,'ACTIVE'),(1,8,'B',7,'ACTIVE'),(1,8,'B',8,'ACTIVE'),(1,8,'B',9,'ACTIVE'),(1,8,'B',10,'ACTIVE'),(1,8,'B',11,'ACTIVE'),
(1,8,'C',1,'ACTIVE'),(1,8,'C',2,'ACTIVE'),(1,8,'C',3,'ACTIVE'),(1,8,'C',4,'ACTIVE'),(1,8,'C',5,'ACTIVE'),(1,8,'C',6,'ACTIVE'),(1,8,'C',7,'ACTIVE'),(1,8,'C',8,'ACTIVE'),(1,8,'C',9,'ACTIVE'),(1,8,'C',10,'ACTIVE'),(1,8,'C',11,'ACTIVE'),
(1,8,'D',1,'ACTIVE'),(1,8,'D',2,'ACTIVE'),(1,8,'D',3,'ACTIVE'),(1,8,'D',4,'ACTIVE'),(1,8,'D',5,'ACTIVE'),(1,8,'D',6,'ACTIVE'),(1,8,'D',7,'ACTIVE'),(1,8,'D',8,'ACTIVE'),(1,8,'D',9,'ACTIVE'),(1,8,'D',10,'ACTIVE'),(1,8,'D',11,'ACTIVE'),
(1,8,'E',1,'ACTIVE'),(1,8,'E',2,'ACTIVE'),(1,8,'E',3,'ACTIVE'),(1,8,'E',4,'ACTIVE'),(1,8,'E',5,'ACTIVE'),(1,8,'E',6,'ACTIVE'),(1,8,'E',7,'ACTIVE'),(1,8,'E',8,'ACTIVE'),(1,8,'E',9,'ACTIVE'),(1,8,'E',10,'ACTIVE'),(1,8,'E',11,'ACTIVE'),
(1,8,'F',1,'ACTIVE'),(1,8,'F',2,'ACTIVE'),(1,8,'F',3,'ACTIVE'),(1,8,'F',4,'ACTIVE'),(1,8,'F',5,'ACTIVE'),(1,8,'F',6,'ACTIVE'),(1,8,'F',7,'ACTIVE'),(1,8,'F',8,'ACTIVE'),(1,8,'F',9,'ACTIVE'),(1,8,'F',10,'ACTIVE'),(1,8,'F',11,'ACTIVE'),
(1,8,'G',1,'ACTIVE'),(1,8,'G',2,'ACTIVE'),(1,8,'G',3,'ACTIVE'),(1,8,'G',4,'ACTIVE'),(1,8,'G',5,'ACTIVE'),(1,8,'G',6,'ACTIVE'),(1,8,'G',7,'ACTIVE'),(1,8,'G',8,'ACTIVE'),(1,8,'G',9,'ACTIVE'),(1,8,'G',10,'ACTIVE'),(1,8,'G',11,'ACTIVE'),
(2,8,'H',1,'ACTIVE'),(2,8,'H',2,'ACTIVE'),(2,8,'H',3,'ACTIVE'),(2,8,'H',4,'ACTIVE'),(2,8,'H',5,'ACTIVE'),(2,8,'H',6,'ACTIVE'),(2,8,'H',7,'ACTIVE'),(2,8,'H',8,'ACTIVE'),(2,8,'H',9,'ACTIVE'),(2,8,'H',10,'ACTIVE'),(2,8,'H',11,'ACTIVE'),
(2,8,'I',1,'ACTIVE'),(2,8,'I',2,'ACTIVE'),(2,8,'I',3,'ACTIVE'),(2,8,'I',4,'ACTIVE'),(2,8,'I',5,'ACTIVE'),(2,8,'I',6,'ACTIVE'),(2,8,'I',7,'ACTIVE'),(2,8,'I',8,'ACTIVE'),(2,8,'I',9,'ACTIVE'),(2,8,'I',10,'ACTIVE'),(2,8,'I',11,'ACTIVE'),
(3,8,'J',1,'ACTIVE'),(3,8,'J',2,'ACTIVE'),(3,8,'J',3,'ACTIVE'),(3,8,'J',4,'ACTIVE'),(3,8,'J',5,'ACTIVE'),(3,8,'J',6,'ACTIVE'),(3,8,'J',7,'ACTIVE'),(3,8,'J',8,'ACTIVE'),(3,8,'J',9,'ACTIVE'),(3,8,'J',10,'ACTIVE'),(3,8,'J',11,'ACTIVE');

-- ====================
-- ROOM 9 | 3D | 100 ghế | cinema 2
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,9,'A',1,'ACTIVE'),(1,9,'A',2,'ACTIVE'),(1,9,'A',3,'ACTIVE'),(1,9,'A',4,'ACTIVE'),(1,9,'A',5,'ACTIVE'),(1,9,'A',6,'ACTIVE'),(1,9,'A',7,'ACTIVE'),(1,9,'A',8,'ACTIVE'),(1,9,'A',9,'ACTIVE'),(1,9,'A',10,'ACTIVE'),
(1,9,'B',1,'ACTIVE'),(1,9,'B',2,'ACTIVE'),(1,9,'B',3,'ACTIVE'),(1,9,'B',4,'ACTIVE'),(1,9,'B',5,'ACTIVE'),(1,9,'B',6,'ACTIVE'),(1,9,'B',7,'ACTIVE'),(1,9,'B',8,'ACTIVE'),(1,9,'B',9,'ACTIVE'),(1,9,'B',10,'ACTIVE'),
(1,9,'C',1,'ACTIVE'),(1,9,'C',2,'ACTIVE'),(1,9,'C',3,'ACTIVE'),(1,9,'C',4,'ACTIVE'),(1,9,'C',5,'ACTIVE'),(1,9,'C',6,'ACTIVE'),(1,9,'C',7,'ACTIVE'),(1,9,'C',8,'ACTIVE'),(1,9,'C',9,'ACTIVE'),(1,9,'C',10,'ACTIVE'),
(1,9,'D',1,'ACTIVE'),(1,9,'D',2,'ACTIVE'),(1,9,'D',3,'ACTIVE'),(1,9,'D',4,'ACTIVE'),(1,9,'D',5,'ACTIVE'),(1,9,'D',6,'ACTIVE'),(1,9,'D',7,'ACTIVE'),(1,9,'D',8,'ACTIVE'),(1,9,'D',9,'ACTIVE'),(1,9,'D',10,'ACTIVE'),
(1,9,'E',1,'ACTIVE'),(1,9,'E',2,'ACTIVE'),(1,9,'E',3,'ACTIVE'),(1,9,'E',4,'ACTIVE'),(1,9,'E',5,'ACTIVE'),(1,9,'E',6,'ACTIVE'),(1,9,'E',7,'ACTIVE'),(1,9,'E',8,'ACTIVE'),(1,9,'E',9,'ACTIVE'),(1,9,'E',10,'ACTIVE'),
(1,9,'F',1,'ACTIVE'),(1,9,'F',2,'ACTIVE'),(1,9,'F',3,'ACTIVE'),(1,9,'F',4,'ACTIVE'),(1,9,'F',5,'ACTIVE'),(1,9,'F',6,'ACTIVE'),(1,9,'F',7,'ACTIVE'),(1,9,'F',8,'ACTIVE'),(1,9,'F',9,'ACTIVE'),(1,9,'F',10,'ACTIVE'),
(2,9,'G',1,'ACTIVE'),(2,9,'G',2,'ACTIVE'),(2,9,'G',3,'ACTIVE'),(2,9,'G',4,'ACTIVE'),(2,9,'G',5,'ACTIVE'),(2,9,'G',6,'ACTIVE'),(2,9,'G',7,'ACTIVE'),(2,9,'G',8,'ACTIVE'),(2,9,'G',9,'ACTIVE'),(2,9,'G',10,'ACTIVE'),
(2,9,'H',1,'ACTIVE'),(2,9,'H',2,'ACTIVE'),(2,9,'H',3,'ACTIVE'),(2,9,'H',4,'ACTIVE'),(2,9,'H',5,'ACTIVE'),(2,9,'H',6,'ACTIVE'),(2,9,'H',7,'ACTIVE'),(2,9,'H',8,'ACTIVE'),(2,9,'H',9,'ACTIVE'),(2,9,'H',10,'ACTIVE'),
(3,9,'I',1,'ACTIVE'),(3,9,'I',2,'ACTIVE'),(3,9,'I',3,'ACTIVE'),(3,9,'I',4,'ACTIVE'),(3,9,'I',5,'ACTIVE'),(3,9,'I',6,'ACTIVE'),(3,9,'I',7,'ACTIVE'),(3,9,'I',8,'ACTIVE'),(3,9,'I',9,'ACTIVE'),(3,9,'I',10,'ACTIVE');

-- ====================
-- ROOM 10 | 3D | 90 ghế | cinema 2
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,10,'A',1,'ACTIVE'),(1,10,'A',2,'ACTIVE'),(1,10,'A',3,'ACTIVE'),(1,10,'A',4,'ACTIVE'),(1,10,'A',5,'ACTIVE'),(1,10,'A',6,'ACTIVE'),(1,10,'A',7,'ACTIVE'),(1,10,'A',8,'ACTIVE'),(1,10,'A',9,'ACTIVE'),(1,10,'A',10,'ACTIVE'),
(1,10,'B',1,'ACTIVE'),(1,10,'B',2,'ACTIVE'),(1,10,'B',3,'ACTIVE'),(1,10,'B',4,'ACTIVE'),(1,10,'B',5,'ACTIVE'),(1,10,'B',6,'ACTIVE'),(1,10,'B',7,'ACTIVE'),(1,10,'B',8,'ACTIVE'),(1,10,'B',9,'ACTIVE'),(1,10,'B',10,'ACTIVE'),
(1,10,'C',1,'ACTIVE'),(1,10,'C',2,'ACTIVE'),(1,10,'C',3,'ACTIVE'),(1,10,'C',4,'ACTIVE'),(1,10,'C',5,'ACTIVE'),(1,10,'C',6,'ACTIVE'),(1,10,'C',7,'ACTIVE'),(1,10,'C',8,'ACTIVE'),(1,10,'C',9,'ACTIVE'),(1,10,'C',10,'ACTIVE'),
(1,10,'D',1,'ACTIVE'),(1,10,'D',2,'ACTIVE'),(1,10,'D',3,'ACTIVE'),(1,10,'D',4,'ACTIVE'),(1,10,'D',5,'ACTIVE'),(1,10,'D',6,'ACTIVE'),(1,10,'D',7,'ACTIVE'),(1,10,'D',8,'ACTIVE'),(1,10,'D',9,'ACTIVE'),(1,10,'D',10,'ACTIVE'),
(1,10,'E',1,'ACTIVE'),(1,10,'E',2,'ACTIVE'),(1,10,'E',3,'ACTIVE'),(1,10,'E',4,'ACTIVE'),(1,10,'E',5,'ACTIVE'),(1,10,'E',6,'ACTIVE'),(1,10,'E',7,'ACTIVE'),(1,10,'E',8,'ACTIVE'),(1,10,'E',9,'ACTIVE'),(1,10,'E',10,'ACTIVE'),
(1,10,'F',1,'ACTIVE'),(1,10,'F',2,'ACTIVE'),(1,10,'F',3,'ACTIVE'),(1,10,'F',4,'ACTIVE'),(1,10,'F',5,'ACTIVE'),(1,10,'F',6,'ACTIVE'),(1,10,'F',7,'ACTIVE'),(1,10,'F',8,'ACTIVE'),(1,10,'F',9,'ACTIVE'),(1,10,'F',10,'ACTIVE'),
(2,10,'G',1,'ACTIVE'),(2,10,'G',2,'ACTIVE'),(2,10,'G',3,'ACTIVE'),(2,10,'G',4,'ACTIVE'),(2,10,'G',5,'ACTIVE'),(2,10,'G',6,'ACTIVE'),(2,10,'G',7,'ACTIVE'),(2,10,'G',8,'ACTIVE'),(2,10,'G',9,'ACTIVE'),(2,10,'G',10,'ACTIVE'),
(2,10,'H',1,'ACTIVE'),(2,10,'H',2,'ACTIVE'),(2,10,'H',3,'ACTIVE'),(2,10,'H',4,'ACTIVE'),(2,10,'H',5,'ACTIVE'),(2,10,'H',6,'ACTIVE'),(2,10,'H',7,'ACTIVE'),(2,10,'H',8,'ACTIVE'),(2,10,'H',9,'ACTIVE'),(2,10,'H',10,'ACTIVE'),
(3,10,'I',1,'ACTIVE'),(3,10,'I',2,'ACTIVE'),(3,10,'I',3,'ACTIVE'),(3,10,'I',4,'ACTIVE'),(3,10,'I',5,'ACTIVE'),(3,10,'I',6,'ACTIVE'),(3,10,'I',7,'ACTIVE'),(3,10,'I',8,'ACTIVE'),(3,10,'I',9,'ACTIVE'),(3,10,'I',10,'ACTIVE');

-- ====================
-- ROOM 11 | IMAX | 80 ghế | cinema 2
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,11,'A',1,'ACTIVE'),(1,11,'A',2,'ACTIVE'),(1,11,'A',3,'ACTIVE'),(1,11,'A',4,'ACTIVE'),(1,11,'A',5,'ACTIVE'),(1,11,'A',6,'ACTIVE'),(1,11,'A',7,'ACTIVE'),(1,11,'A',8,'ACTIVE'),(1,11,'A',9,'ACTIVE'),(1,11,'A',10,'ACTIVE'),
(1,11,'B',1,'ACTIVE'),(1,11,'B',2,'ACTIVE'),(1,11,'B',3,'ACTIVE'),(1,11,'B',4,'ACTIVE'),(1,11,'B',5,'ACTIVE'),(1,11,'B',6,'ACTIVE'),(1,11,'B',7,'ACTIVE'),(1,11,'B',8,'ACTIVE'),(1,11,'B',9,'ACTIVE'),(1,11,'B',10,'ACTIVE'),
(1,11,'C',1,'ACTIVE'),(1,11,'C',2,'ACTIVE'),(1,11,'C',3,'ACTIVE'),(1,11,'C',4,'ACTIVE'),(1,11,'C',5,'ACTIVE'),(1,11,'C',6,'ACTIVE'),(1,11,'C',7,'ACTIVE'),(1,11,'C',8,'ACTIVE'),(1,11,'C',9,'ACTIVE'),(1,11,'C',10,'ACTIVE'),
(1,11,'D',1,'ACTIVE'),(1,11,'D',2,'ACTIVE'),(1,11,'D',3,'ACTIVE'),(1,11,'D',4,'ACTIVE'),(1,11,'D',5,'ACTIVE'),(1,11,'D',6,'ACTIVE'),(1,11,'D',7,'ACTIVE'),(1,11,'D',8,'ACTIVE'),(1,11,'D',9,'ACTIVE'),(1,11,'D',10,'ACTIVE'),
(1,11,'E',1,'ACTIVE'),(1,11,'E',2,'ACTIVE'),(1,11,'E',3,'ACTIVE'),(1,11,'E',4,'ACTIVE'),(1,11,'E',5,'ACTIVE'),(1,11,'E',6,'ACTIVE'),(1,11,'E',7,'ACTIVE'),(1,11,'E',8,'ACTIVE'),(1,11,'E',9,'ACTIVE'),(1,11,'E',10,'ACTIVE'),
(2,11,'F',1,'ACTIVE'),(2,11,'F',2,'ACTIVE'),(2,11,'F',3,'ACTIVE'),(2,11,'F',4,'ACTIVE'),(2,11,'F',5,'ACTIVE'),(2,11,'F',6,'ACTIVE'),(2,11,'F',7,'ACTIVE'),(2,11,'F',8,'ACTIVE'),(2,11,'F',9,'ACTIVE'),(2,11,'F',10,'ACTIVE'),
(2,11,'G',1,'ACTIVE'),(2,11,'G',2,'ACTIVE'),(2,11,'G',3,'ACTIVE'),(2,11,'G',4,'ACTIVE'),(2,11,'G',5,'ACTIVE'),(2,11,'G',6,'ACTIVE'),(2,11,'G',7,'ACTIVE'),(2,11,'G',8,'ACTIVE'),(2,11,'G',9,'ACTIVE'),(2,11,'G',10,'ACTIVE'),
(3,11,'H',1,'ACTIVE'),(3,11,'H',2,'ACTIVE'),(3,11,'H',3,'ACTIVE'),(3,11,'H',4,'ACTIVE'),(3,11,'H',5,'ACTIVE'),(3,11,'H',6,'ACTIVE'),(3,11,'H',7,'ACTIVE'),(3,11,'H',8,'ACTIVE'),(3,11,'H',9,'ACTIVE'),(3,11,'H',10,'ACTIVE');

-- ====================
-- ROOM 12 | 2D | 120 ghế | cinema 3
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,12,'A',1,'ACTIVE'),(1,12,'A',2,'ACTIVE'),(1,12,'A',3,'ACTIVE'),(1,12,'A',4,'ACTIVE'),(1,12,'A',5,'ACTIVE'),(1,12,'A',6,'ACTIVE'),(1,12,'A',7,'ACTIVE'),(1,12,'A',8,'ACTIVE'),(1,12,'A',9,'ACTIVE'),(1,12,'A',10,'ACTIVE'),(1,12,'A',11,'ACTIVE'),(1,12,'A',12,'ACTIVE'),
(1,12,'B',1,'ACTIVE'),(1,12,'B',2,'ACTIVE'),(1,12,'B',3,'ACTIVE'),(1,12,'B',4,'ACTIVE'),(1,12,'B',5,'ACTIVE'),(1,12,'B',6,'ACTIVE'),(1,12,'B',7,'ACTIVE'),(1,12,'B',8,'ACTIVE'),(1,12,'B',9,'ACTIVE'),(1,12,'B',10,'ACTIVE'),(1,12,'B',11,'ACTIVE'),(1,12,'B',12,'ACTIVE'),
(1,12,'C',1,'ACTIVE'),(1,12,'C',2,'ACTIVE'),(1,12,'C',3,'ACTIVE'),(1,12,'C',4,'ACTIVE'),(1,12,'C',5,'ACTIVE'),(1,12,'C',6,'ACTIVE'),(1,12,'C',7,'ACTIVE'),(1,12,'C',8,'ACTIVE'),(1,12,'C',9,'ACTIVE'),(1,12,'C',10,'ACTIVE'),(1,12,'C',11,'ACTIVE'),(1,12,'C',12,'ACTIVE'),
(1,12,'D',1,'ACTIVE'),(1,12,'D',2,'ACTIVE'),(1,12,'D',3,'ACTIVE'),(1,12,'D',4,'ACTIVE'),(1,12,'D',5,'ACTIVE'),(1,12,'D',6,'ACTIVE'),(1,12,'D',7,'ACTIVE'),(1,12,'D',8,'ACTIVE'),(1,12,'D',9,'ACTIVE'),(1,12,'D',10,'ACTIVE'),(1,12,'D',11,'ACTIVE'),(1,12,'D',12,'ACTIVE'),
(1,12,'E',1,'ACTIVE'),(1,12,'E',2,'ACTIVE'),(1,12,'E',3,'ACTIVE'),(1,12,'E',4,'ACTIVE'),(1,12,'E',5,'ACTIVE'),(1,12,'E',6,'ACTIVE'),(1,12,'E',7,'ACTIVE'),(1,12,'E',8,'ACTIVE'),(1,12,'E',9,'ACTIVE'),(1,12,'E',10,'ACTIVE'),(1,12,'E',11,'ACTIVE'),(1,12,'E',12,'ACTIVE'),
(1,12,'F',1,'ACTIVE'),(1,12,'F',2,'ACTIVE'),(1,12,'F',3,'ACTIVE'),(1,12,'F',4,'ACTIVE'),(1,12,'F',5,'ACTIVE'),(1,12,'F',6,'ACTIVE'),(1,12,'F',7,'ACTIVE'),(1,12,'F',8,'ACTIVE'),(1,12,'F',9,'ACTIVE'),(1,12,'F',10,'ACTIVE'),(1,12,'F',11,'ACTIVE'),(1,12,'F',12,'ACTIVE'),
(1,12,'G',1,'ACTIVE'),(1,12,'G',2,'ACTIVE'),(1,12,'G',3,'ACTIVE'),(1,12,'G',4,'ACTIVE'),(1,12,'G',5,'ACTIVE'),(1,12,'G',6,'ACTIVE'),(1,12,'G',7,'ACTIVE'),(1,12,'G',8,'ACTIVE'),(1,12,'G',9,'ACTIVE'),(1,12,'G',10,'ACTIVE'),(1,12,'G',11,'ACTIVE'),(1,12,'G',12,'ACTIVE'),
(2,12,'H',1,'ACTIVE'),(2,12,'H',2,'ACTIVE'),(2,12,'H',3,'ACTIVE'),(2,12,'H',4,'ACTIVE'),(2,12,'H',5,'ACTIVE'),(2,12,'H',6,'ACTIVE'),(2,12,'H',7,'ACTIVE'),(2,12,'H',8,'ACTIVE'),(2,12,'H',9,'ACTIVE'),(2,12,'H',10,'ACTIVE'),(2,12,'H',11,'ACTIVE'),(2,12,'H',12,'ACTIVE'),
(2,12,'I',1,'ACTIVE'),(2,12,'I',2,'ACTIVE'),(2,12,'I',3,'ACTIVE'),(2,12,'I',4,'ACTIVE'),(2,12,'I',5,'ACTIVE'),(2,12,'I',6,'ACTIVE'),(2,12,'I',7,'ACTIVE'),(2,12,'I',8,'ACTIVE'),(2,12,'I',9,'ACTIVE'),(2,12,'I',10,'ACTIVE'),(2,12,'I',11,'ACTIVE'),(2,12,'I',12,'ACTIVE'),
(3,12,'J',1,'ACTIVE'),(3,12,'J',2,'ACTIVE'),(3,12,'J',3,'ACTIVE'),(3,12,'J',4,'ACTIVE'),(3,12,'J',5,'ACTIVE'),(3,12,'J',6,'ACTIVE'),(3,12,'J',7,'ACTIVE'),(3,12,'J',8,'ACTIVE'),(3,12,'J',9,'ACTIVE'),(3,12,'J',10,'ACTIVE'),(3,12,'J',11,'ACTIVE'),(3,12,'J',12,'ACTIVE');

-- ====================
-- ROOM 13 | 2D | 110 ghế | cinema 3
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,13,'A',1,'ACTIVE'),(1,13,'A',2,'ACTIVE'),(1,13,'A',3,'ACTIVE'),(1,13,'A',4,'ACTIVE'),(1,13,'A',5,'ACTIVE'),(1,13,'A',6,'ACTIVE'),(1,13,'A',7,'ACTIVE'),(1,13,'A',8,'ACTIVE'),(1,13,'A',9,'ACTIVE'),(1,13,'A',10,'ACTIVE'),(1,13,'A',11,'ACTIVE'),
(1,13,'B',1,'ACTIVE'),(1,13,'B',2,'ACTIVE'),(1,13,'B',3,'ACTIVE'),(1,13,'B',4,'ACTIVE'),(1,13,'B',5,'ACTIVE'),(1,13,'B',6,'ACTIVE'),(1,13,'B',7,'ACTIVE'),(1,13,'B',8,'ACTIVE'),(1,13,'B',9,'ACTIVE'),(1,13,'B',10,'ACTIVE'),(1,13,'B',11,'ACTIVE'),
(1,13,'C',1,'ACTIVE'),(1,13,'C',2,'ACTIVE'),(1,13,'C',3,'ACTIVE'),(1,13,'C',4,'ACTIVE'),(1,13,'C',5,'ACTIVE'),(1,13,'C',6,'ACTIVE'),(1,13,'C',7,'ACTIVE'),(1,13,'C',8,'ACTIVE'),(1,13,'C',9,'ACTIVE'),(1,13,'C',10,'ACTIVE'),(1,13,'C',11,'ACTIVE'),
(1,13,'D',1,'ACTIVE'),(1,13,'D',2,'ACTIVE'),(1,13,'D',3,'ACTIVE'),(1,13,'D',4,'ACTIVE'),(1,13,'D',5,'ACTIVE'),(1,13,'D',6,'ACTIVE'),(1,13,'D',7,'ACTIVE'),(1,13,'D',8,'ACTIVE'),(1,13,'D',9,'ACTIVE'),(1,13,'D',10,'ACTIVE'),(1,13,'D',11,'ACTIVE'),
(1,13,'E',1,'ACTIVE'),(1,13,'E',2,'ACTIVE'),(1,13,'E',3,'ACTIVE'),(1,13,'E',4,'ACTIVE'),(1,13,'E',5,'ACTIVE'),(1,13,'E',6,'ACTIVE'),(1,13,'E',7,'ACTIVE'),(1,13,'E',8,'ACTIVE'),(1,13,'E',9,'ACTIVE'),(1,13,'E',10,'ACTIVE'),(1,13,'E',11,'ACTIVE'),
(1,13,'F',1,'ACTIVE'),(1,13,'F',2,'ACTIVE'),(1,13,'F',3,'ACTIVE'),(1,13,'F',4,'ACTIVE'),(1,13,'F',5,'ACTIVE'),(1,13,'F',6,'ACTIVE'),(1,13,'F',7,'ACTIVE'),(1,13,'F',8,'ACTIVE'),(1,13,'F',9,'ACTIVE'),(1,13,'F',10,'ACTIVE'),(1,13,'F',11,'ACTIVE'),
(1,13,'G',1,'ACTIVE'),(1,13,'G',2,'ACTIVE'),(1,13,'G',3,'ACTIVE'),(1,13,'G',4,'ACTIVE'),(1,13,'G',5,'ACTIVE'),(1,13,'G',6,'ACTIVE'),(1,13,'G',7,'ACTIVE'),(1,13,'G',8,'ACTIVE'),(1,13,'G',9,'ACTIVE'),(1,13,'G',10,'ACTIVE'),(1,13,'G',11,'ACTIVE'),
(2,13,'H',1,'ACTIVE'),(2,13,'H',2,'ACTIVE'),(2,13,'H',3,'ACTIVE'),(2,13,'H',4,'ACTIVE'),(2,13,'H',5,'ACTIVE'),(2,13,'H',6,'ACTIVE'),(2,13,'H',7,'ACTIVE'),(2,13,'H',8,'ACTIVE'),(2,13,'H',9,'ACTIVE'),(2,13,'H',10,'ACTIVE'),(2,13,'H',11,'ACTIVE'),
(2,13,'I',1,'ACTIVE'),(2,13,'I',2,'ACTIVE'),(2,13,'I',3,'ACTIVE'),(2,13,'I',4,'ACTIVE'),(2,13,'I',5,'ACTIVE'),(2,13,'I',6,'ACTIVE'),(2,13,'I',7,'ACTIVE'),(2,13,'I',8,'ACTIVE'),(2,13,'I',9,'ACTIVE'),(2,13,'I',10,'ACTIVE'),(2,13,'I',11,'ACTIVE'),
(3,13,'J',1,'ACTIVE'),(3,13,'J',2,'ACTIVE'),(3,13,'J',3,'ACTIVE'),(3,13,'J',4,'ACTIVE'),(3,13,'J',5,'ACTIVE'),(3,13,'J',6,'ACTIVE'),(3,13,'J',7,'ACTIVE'),(3,13,'J',8,'ACTIVE'),(3,13,'J',9,'ACTIVE'),(3,13,'J',10,'ACTIVE'),(3,13,'J',11,'ACTIVE');

-- ====================
-- ROOM 14 | 3D | 100 ghế | cinema 3
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,14,'A',1,'ACTIVE'),(1,14,'A',2,'ACTIVE'),(1,14,'A',3,'ACTIVE'),(1,14,'A',4,'ACTIVE'),(1,14,'A',5,'ACTIVE'),(1,14,'A',6,'ACTIVE'),(1,14,'A',7,'ACTIVE'),(1,14,'A',8,'ACTIVE'),(1,14,'A',9,'ACTIVE'),(1,14,'A',10,'ACTIVE'),
(1,14,'B',1,'ACTIVE'),(1,14,'B',2,'ACTIVE'),(1,14,'B',3,'ACTIVE'),(1,14,'B',4,'ACTIVE'),(1,14,'B',5,'ACTIVE'),(1,14,'B',6,'ACTIVE'),(1,14,'B',7,'ACTIVE'),(1,14,'B',8,'ACTIVE'),(1,14,'B',9,'ACTIVE'),(1,14,'B',10,'ACTIVE'),
(1,14,'C',1,'ACTIVE'),(1,14,'C',2,'ACTIVE'),(1,14,'C',3,'ACTIVE'),(1,14,'C',4,'ACTIVE'),(1,14,'C',5,'ACTIVE'),(1,14,'C',6,'ACTIVE'),(1,14,'C',7,'ACTIVE'),(1,14,'C',8,'ACTIVE'),(1,14,'C',9,'ACTIVE'),(1,14,'C',10,'ACTIVE'),
(1,14,'D',1,'ACTIVE'),(1,14,'D',2,'ACTIVE'),(1,14,'D',3,'ACTIVE'),(1,14,'D',4,'ACTIVE'),(1,14,'D',5,'ACTIVE'),(1,14,'D',6,'ACTIVE'),(1,14,'D',7,'ACTIVE'),(1,14,'D',8,'ACTIVE'),(1,14,'D',9,'ACTIVE'),(1,14,'D',10,'ACTIVE'),
(1,14,'E',1,'ACTIVE'),(1,14,'E',2,'ACTIVE'),(1,14,'E',3,'ACTIVE'),(1,14,'E',4,'ACTIVE'),(1,14,'E',5,'ACTIVE'),(1,14,'E',6,'ACTIVE'),(1,14,'E',7,'ACTIVE'),(1,14,'E',8,'ACTIVE'),(1,14,'E',9,'ACTIVE'),(1,14,'E',10,'ACTIVE'),
(1,14,'F',1,'ACTIVE'),(1,14,'F',2,'ACTIVE'),(1,14,'F',3,'ACTIVE'),(1,14,'F',4,'ACTIVE'),(1,14,'F',5,'ACTIVE'),(1,14,'F',6,'ACTIVE'),(1,14,'F',7,'ACTIVE'),(1,14,'F',8,'ACTIVE'),(1,14,'F',9,'ACTIVE'),(1,14,'F',10,'ACTIVE'),
(2,14,'G',1,'ACTIVE'),(2,14,'G',2,'ACTIVE'),(2,14,'G',3,'ACTIVE'),(2,14,'G',4,'ACTIVE'),(2,14,'G',5,'ACTIVE'),(2,14,'G',6,'ACTIVE'),(2,14,'G',7,'ACTIVE'),(2,14,'G',8,'ACTIVE'),(2,14,'G',9,'ACTIVE'),(2,14,'G',10,'ACTIVE'),
(2,14,'H',1,'ACTIVE'),(2,14,'H',2,'ACTIVE'),(2,14,'H',3,'ACTIVE'),(2,14,'H',4,'ACTIVE'),(2,14,'H',5,'ACTIVE'),(2,14,'H',6,'ACTIVE'),(2,14,'H',7,'ACTIVE'),(2,14,'H',8,'ACTIVE'),(2,14,'H',9,'ACTIVE'),(2,14,'H',10,'ACTIVE'),
(3,14,'I',1,'ACTIVE'),(3,14,'I',2,'ACTIVE'),(3,14,'I',3,'ACTIVE'),(3,14,'I',4,'ACTIVE'),(3,14,'I',5,'ACTIVE'),(3,14,'I',6,'ACTIVE'),(3,14,'I',7,'ACTIVE'),(3,14,'I',8,'ACTIVE'),(3,14,'I',9,'ACTIVE'),(3,14,'I',10,'ACTIVE');

-- ====================
-- ROOM 15 | IMAX | 80 ghế | cinema 3
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,15,'A',1,'ACTIVE'),(1,15,'A',2,'ACTIVE'),(1,15,'A',3,'ACTIVE'),(1,15,'A',4,'ACTIVE'),(1,15,'A',5,'ACTIVE'),(1,15,'A',6,'ACTIVE'),(1,15,'A',7,'ACTIVE'),(1,15,'A',8,'ACTIVE'),(1,15,'A',9,'ACTIVE'),(1,15,'A',10,'ACTIVE'),
(1,15,'B',1,'ACTIVE'),(1,15,'B',2,'ACTIVE'),(1,15,'B',3,'ACTIVE'),(1,15,'B',4,'ACTIVE'),(1,15,'B',5,'ACTIVE'),(1,15,'B',6,'ACTIVE'),(1,15,'B',7,'ACTIVE'),(1,15,'B',8,'ACTIVE'),(1,15,'B',9,'ACTIVE'),(1,15,'B',10,'ACTIVE'),
(1,15,'C',1,'ACTIVE'),(1,15,'C',2,'ACTIVE'),(1,15,'C',3,'ACTIVE'),(1,15,'C',4,'ACTIVE'),(1,15,'C',5,'ACTIVE'),(1,15,'C',6,'ACTIVE'),(1,15,'C',7,'ACTIVE'),(1,15,'C',8,'ACTIVE'),(1,15,'C',9,'ACTIVE'),(1,15,'C',10,'ACTIVE'),
(1,15,'D',1,'ACTIVE'),(1,15,'D',2,'ACTIVE'),(1,15,'D',3,'ACTIVE'),(1,15,'D',4,'ACTIVE'),(1,15,'D',5,'ACTIVE'),(1,15,'D',6,'ACTIVE'),(1,15,'D',7,'ACTIVE'),(1,15,'D',8,'ACTIVE'),(1,15,'D',9,'ACTIVE'),(1,15,'D',10,'ACTIVE'),
(1,15,'E',1,'ACTIVE'),(1,15,'E',2,'ACTIVE'),(1,15,'E',3,'ACTIVE'),(1,15,'E',4,'ACTIVE'),(1,15,'E',5,'ACTIVE'),(1,15,'E',6,'ACTIVE'),(1,15,'E',7,'ACTIVE'),(1,15,'E',8,'ACTIVE'),(1,15,'E',9,'ACTIVE'),(1,15,'E',10,'ACTIVE'),
(2,15,'F',1,'ACTIVE'),(2,15,'F',2,'ACTIVE'),(2,15,'F',3,'ACTIVE'),(2,15,'F',4,'ACTIVE'),(2,15,'F',5,'ACTIVE'),(2,15,'F',6,'ACTIVE'),(2,15,'F',7,'ACTIVE'),(2,15,'F',8,'ACTIVE'),(2,15,'F',9,'ACTIVE'),(2,15,'F',10,'ACTIVE'),
(2,15,'G',1,'ACTIVE'),(2,15,'G',2,'ACTIVE'),(2,15,'G',3,'ACTIVE'),(2,15,'G',4,'ACTIVE'),(2,15,'G',5,'ACTIVE'),(2,15,'G',6,'ACTIVE'),(2,15,'G',7,'ACTIVE'),(2,15,'G',8,'ACTIVE'),(2,15,'G',9,'ACTIVE'),(2,15,'G',10,'ACTIVE'),
(3,15,'H',1,'ACTIVE'),(3,15,'H',2,'ACTIVE'),(3,15,'H',3,'ACTIVE'),(3,15,'H',4,'ACTIVE'),(3,15,'H',5,'ACTIVE'),(3,15,'H',6,'ACTIVE'),(3,15,'H',7,'ACTIVE'),(3,15,'H',8,'ACTIVE'),(3,15,'H',9,'ACTIVE'),(3,15,'H',10,'ACTIVE');

-- ====================
-- ROOM 16 | 2D | 130 ghế | cinema 4
-- A-H Thường (8 x 12 = 96), I-J VIP (2 x 12 = 24), K Đôi (10 ghế)
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,16,'A',1,'ACTIVE'),(1,16,'A',2,'ACTIVE'),(1,16,'A',3,'ACTIVE'),(1,16,'A',4,'ACTIVE'),(1,16,'A',5,'ACTIVE'),(1,16,'A',6,'ACTIVE'),(1,16,'A',7,'ACTIVE'),(1,16,'A',8,'ACTIVE'),(1,16,'A',9,'ACTIVE'),(1,16,'A',10,'ACTIVE'),(1,16,'A',11,'ACTIVE'),(1,16,'A',12,'ACTIVE'),
(1,16,'B',1,'ACTIVE'),(1,16,'B',2,'ACTIVE'),(1,16,'B',3,'ACTIVE'),(1,16,'B',4,'ACTIVE'),(1,16,'B',5,'ACTIVE'),(1,16,'B',6,'ACTIVE'),(1,16,'B',7,'ACTIVE'),(1,16,'B',8,'ACTIVE'),(1,16,'B',9,'ACTIVE'),(1,16,'B',10,'ACTIVE'),(1,16,'B',11,'ACTIVE'),(1,16,'B',12,'ACTIVE'),
(1,16,'C',1,'ACTIVE'),(1,16,'C',2,'ACTIVE'),(1,16,'C',3,'ACTIVE'),(1,16,'C',4,'ACTIVE'),(1,16,'C',5,'ACTIVE'),(1,16,'C',6,'ACTIVE'),(1,16,'C',7,'ACTIVE'),(1,16,'C',8,'ACTIVE'),(1,16,'C',9,'ACTIVE'),(1,16,'C',10,'ACTIVE'),(1,16,'C',11,'ACTIVE'),(1,16,'C',12,'ACTIVE'),
(1,16,'D',1,'ACTIVE'),(1,16,'D',2,'ACTIVE'),(1,16,'D',3,'ACTIVE'),(1,16,'D',4,'ACTIVE'),(1,16,'D',5,'ACTIVE'),(1,16,'D',6,'ACTIVE'),(1,16,'D',7,'ACTIVE'),(1,16,'D',8,'ACTIVE'),(1,16,'D',9,'ACTIVE'),(1,16,'D',10,'ACTIVE'),(1,16,'D',11,'ACTIVE'),(1,16,'D',12,'ACTIVE'),
(1,16,'E',1,'ACTIVE'),(1,16,'E',2,'ACTIVE'),(1,16,'E',3,'ACTIVE'),(1,16,'E',4,'ACTIVE'),(1,16,'E',5,'ACTIVE'),(1,16,'E',6,'ACTIVE'),(1,16,'E',7,'ACTIVE'),(1,16,'E',8,'ACTIVE'),(1,16,'E',9,'ACTIVE'),(1,16,'E',10,'ACTIVE'),(1,16,'E',11,'ACTIVE'),(1,16,'E',12,'ACTIVE'),
(1,16,'F',1,'ACTIVE'),(1,16,'F',2,'ACTIVE'),(1,16,'F',3,'ACTIVE'),(1,16,'F',4,'ACTIVE'),(1,16,'F',5,'ACTIVE'),(1,16,'F',6,'ACTIVE'),(1,16,'F',7,'ACTIVE'),(1,16,'F',8,'ACTIVE'),(1,16,'F',9,'ACTIVE'),(1,16,'F',10,'ACTIVE'),(1,16,'F',11,'ACTIVE'),(1,16,'F',12,'ACTIVE'),
(1,16,'G',1,'ACTIVE'),(1,16,'G',2,'ACTIVE'),(1,16,'G',3,'ACTIVE'),(1,16,'G',4,'ACTIVE'),(1,16,'G',5,'ACTIVE'),(1,16,'G',6,'ACTIVE'),(1,16,'G',7,'ACTIVE'),(1,16,'G',8,'ACTIVE'),(1,16,'G',9,'ACTIVE'),(1,16,'G',10,'ACTIVE'),(1,16,'G',11,'ACTIVE'),(1,16,'G',12,'ACTIVE'),
(1,16,'H',1,'ACTIVE'),(1,16,'H',2,'ACTIVE'),(1,16,'H',3,'ACTIVE'),(1,16,'H',4,'ACTIVE'),(1,16,'H',5,'ACTIVE'),(1,16,'H',6,'ACTIVE'),(1,16,'H',7,'ACTIVE'),(1,16,'H',8,'ACTIVE'),(1,16,'H',9,'ACTIVE'),(1,16,'H',10,'ACTIVE'),(1,16,'H',11,'ACTIVE'),(1,16,'H',12,'ACTIVE'),
(2,16,'I',1,'ACTIVE'),(2,16,'I',2,'ACTIVE'),(2,16,'I',3,'ACTIVE'),(2,16,'I',4,'ACTIVE'),(2,16,'I',5,'ACTIVE'),(2,16,'I',6,'ACTIVE'),(2,16,'I',7,'ACTIVE'),(2,16,'I',8,'ACTIVE'),(2,16,'I',9,'ACTIVE'),(2,16,'I',10,'ACTIVE'),(2,16,'I',11,'ACTIVE'),(2,16,'I',12,'ACTIVE'),
(2,16,'J',1,'ACTIVE'),(2,16,'J',2,'ACTIVE'),(2,16,'J',3,'ACTIVE'),(2,16,'J',4,'ACTIVE'),(2,16,'J',5,'ACTIVE'),(2,16,'J',6,'ACTIVE'),(2,16,'J',7,'ACTIVE'),(2,16,'J',8,'ACTIVE'),(2,16,'J',9,'ACTIVE'),(2,16,'J',10,'ACTIVE'),(2,16,'J',11,'ACTIVE'),(2,16,'J',12,'ACTIVE'),
(3,16,'K',1,'ACTIVE'),(3,16,'K',2,'ACTIVE'),(3,16,'K',3,'ACTIVE'),(3,16,'K',4,'ACTIVE'),(3,16,'K',5,'ACTIVE'),(3,16,'K',6,'ACTIVE'),(3,16,'K',7,'ACTIVE'),(3,16,'K',8,'ACTIVE'),(3,16,'K',9,'ACTIVE'),(3,16,'K',10,'ACTIVE');

-- ====================
-- ROOM 17 | 2D | 120 ghế | cinema 4
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,17,'A',1,'ACTIVE'),(1,17,'A',2,'ACTIVE'),(1,17,'A',3,'ACTIVE'),(1,17,'A',4,'ACTIVE'),(1,17,'A',5,'ACTIVE'),(1,17,'A',6,'ACTIVE'),(1,17,'A',7,'ACTIVE'),(1,17,'A',8,'ACTIVE'),(1,17,'A',9,'ACTIVE'),(1,17,'A',10,'ACTIVE'),(1,17,'A',11,'ACTIVE'),(1,17,'A',12,'ACTIVE'),
(1,17,'B',1,'ACTIVE'),(1,17,'B',2,'ACTIVE'),(1,17,'B',3,'ACTIVE'),(1,17,'B',4,'ACTIVE'),(1,17,'B',5,'ACTIVE'),(1,17,'B',6,'ACTIVE'),(1,17,'B',7,'ACTIVE'),(1,17,'B',8,'ACTIVE'),(1,17,'B',9,'ACTIVE'),(1,17,'B',10,'ACTIVE'),(1,17,'B',11,'ACTIVE'),(1,17,'B',12,'ACTIVE'),
(1,17,'C',1,'ACTIVE'),(1,17,'C',2,'ACTIVE'),(1,17,'C',3,'ACTIVE'),(1,17,'C',4,'ACTIVE'),(1,17,'C',5,'ACTIVE'),(1,17,'C',6,'ACTIVE'),(1,17,'C',7,'ACTIVE'),(1,17,'C',8,'ACTIVE'),(1,17,'C',9,'ACTIVE'),(1,17,'C',10,'ACTIVE'),(1,17,'C',11,'ACTIVE'),(1,17,'C',12,'ACTIVE'),
(1,17,'D',1,'ACTIVE'),(1,17,'D',2,'ACTIVE'),(1,17,'D',3,'ACTIVE'),(1,17,'D',4,'ACTIVE'),(1,17,'D',5,'ACTIVE'),(1,17,'D',6,'ACTIVE'),(1,17,'D',7,'ACTIVE'),(1,17,'D',8,'ACTIVE'),(1,17,'D',9,'ACTIVE'),(1,17,'D',10,'ACTIVE'),(1,17,'D',11,'ACTIVE'),(1,17,'D',12,'ACTIVE'),
(1,17,'E',1,'ACTIVE'),(1,17,'E',2,'ACTIVE'),(1,17,'E',3,'ACTIVE'),(1,17,'E',4,'ACTIVE'),(1,17,'E',5,'ACTIVE'),(1,17,'E',6,'ACTIVE'),(1,17,'E',7,'ACTIVE'),(1,17,'E',8,'ACTIVE'),(1,17,'E',9,'ACTIVE'),(1,17,'E',10,'ACTIVE'),(1,17,'E',11,'ACTIVE'),(1,17,'E',12,'ACTIVE'),
(1,17,'F',1,'ACTIVE'),(1,17,'F',2,'ACTIVE'),(1,17,'F',3,'ACTIVE'),(1,17,'F',4,'ACTIVE'),(1,17,'F',5,'ACTIVE'),(1,17,'F',6,'ACTIVE'),(1,17,'F',7,'ACTIVE'),(1,17,'F',8,'ACTIVE'),(1,17,'F',9,'ACTIVE'),(1,17,'F',10,'ACTIVE'),(1,17,'F',11,'ACTIVE'),(1,17,'F',12,'ACTIVE'),
(1,17,'G',1,'ACTIVE'),(1,17,'G',2,'ACTIVE'),(1,17,'G',3,'ACTIVE'),(1,17,'G',4,'ACTIVE'),(1,17,'G',5,'ACTIVE'),(1,17,'G',6,'ACTIVE'),(1,17,'G',7,'ACTIVE'),(1,17,'G',8,'ACTIVE'),(1,17,'G',9,'ACTIVE'),(1,17,'G',10,'ACTIVE'),(1,17,'G',11,'ACTIVE'),(1,17,'G',12,'ACTIVE'),
(2,17,'H',1,'ACTIVE'),(2,17,'H',2,'ACTIVE'),(2,17,'H',3,'ACTIVE'),(2,17,'H',4,'ACTIVE'),(2,17,'H',5,'ACTIVE'),(2,17,'H',6,'ACTIVE'),(2,17,'H',7,'ACTIVE'),(2,17,'H',8,'ACTIVE'),(2,17,'H',9,'ACTIVE'),(2,17,'H',10,'ACTIVE'),(2,17,'H',11,'ACTIVE'),(2,17,'H',12,'ACTIVE'),
(2,17,'I',1,'ACTIVE'),(2,17,'I',2,'ACTIVE'),(2,17,'I',3,'ACTIVE'),(2,17,'I',4,'ACTIVE'),(2,17,'I',5,'ACTIVE'),(2,17,'I',6,'ACTIVE'),(2,17,'I',7,'ACTIVE'),(2,17,'I',8,'ACTIVE'),(2,17,'I',9,'ACTIVE'),(2,17,'I',10,'ACTIVE'),(2,17,'I',11,'ACTIVE'),(2,17,'I',12,'ACTIVE'),
(3,17,'J',1,'ACTIVE'),(3,17,'J',2,'ACTIVE'),(3,17,'J',3,'ACTIVE'),(3,17,'J',4,'ACTIVE'),(3,17,'J',5,'ACTIVE'),(3,17,'J',6,'ACTIVE'),(3,17,'J',7,'ACTIVE'),(3,17,'J',8,'ACTIVE'),(3,17,'J',9,'ACTIVE'),(3,17,'J',10,'ACTIVE'),(3,17,'J',11,'ACTIVE'),(3,17,'J',12,'ACTIVE');

-- ====================
-- ROOM 18 | 2D | 110 ghế | cinema 4
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,18,'A',1,'ACTIVE'),(1,18,'A',2,'ACTIVE'),(1,18,'A',3,'ACTIVE'),(1,18,'A',4,'ACTIVE'),(1,18,'A',5,'ACTIVE'),(1,18,'A',6,'ACTIVE'),(1,18,'A',7,'ACTIVE'),(1,18,'A',8,'ACTIVE'),(1,18,'A',9,'ACTIVE'),(1,18,'A',10,'ACTIVE'),(1,18,'A',11,'ACTIVE'),
(1,18,'B',1,'ACTIVE'),(1,18,'B',2,'ACTIVE'),(1,18,'B',3,'ACTIVE'),(1,18,'B',4,'ACTIVE'),(1,18,'B',5,'ACTIVE'),(1,18,'B',6,'ACTIVE'),(1,18,'B',7,'ACTIVE'),(1,18,'B',8,'ACTIVE'),(1,18,'B',9,'ACTIVE'),(1,18,'B',10,'ACTIVE'),(1,18,'B',11,'ACTIVE'),
(1,18,'C',1,'ACTIVE'),(1,18,'C',2,'ACTIVE'),(1,18,'C',3,'ACTIVE'),(1,18,'C',4,'ACTIVE'),(1,18,'C',5,'ACTIVE'),(1,18,'C',6,'ACTIVE'),(1,18,'C',7,'ACTIVE'),(1,18,'C',8,'ACTIVE'),(1,18,'C',9,'ACTIVE'),(1,18,'C',10,'ACTIVE'),(1,18,'C',11,'ACTIVE'),
(1,18,'D',1,'ACTIVE'),(1,18,'D',2,'ACTIVE'),(1,18,'D',3,'ACTIVE'),(1,18,'D',4,'ACTIVE'),(1,18,'D',5,'ACTIVE'),(1,18,'D',6,'ACTIVE'),(1,18,'D',7,'ACTIVE'),(1,18,'D',8,'ACTIVE'),(1,18,'D',9,'ACTIVE'),(1,18,'D',10,'ACTIVE'),(1,18,'D',11,'ACTIVE'),
(1,18,'E',1,'ACTIVE'),(1,18,'E',2,'ACTIVE'),(1,18,'E',3,'ACTIVE'),(1,18,'E',4,'ACTIVE'),(1,18,'E',5,'ACTIVE'),(1,18,'E',6,'ACTIVE'),(1,18,'E',7,'ACTIVE'),(1,18,'E',8,'ACTIVE'),(1,18,'E',9,'ACTIVE'),(1,18,'E',10,'ACTIVE'),(1,18,'E',11,'ACTIVE'),
(1,18,'F',1,'ACTIVE'),(1,18,'F',2,'ACTIVE'),(1,18,'F',3,'ACTIVE'),(1,18,'F',4,'ACTIVE'),(1,18,'F',5,'ACTIVE'),(1,18,'F',6,'ACTIVE'),(1,18,'F',7,'ACTIVE'),(1,18,'F',8,'ACTIVE'),(1,18,'F',9,'ACTIVE'),(1,18,'F',10,'ACTIVE'),(1,18,'F',11,'ACTIVE'),
(1,18,'G',1,'ACTIVE'),(1,18,'G',2,'ACTIVE'),(1,18,'G',3,'ACTIVE'),(1,18,'G',4,'ACTIVE'),(1,18,'G',5,'ACTIVE'),(1,18,'G',6,'ACTIVE'),(1,18,'G',7,'ACTIVE'),(1,18,'G',8,'ACTIVE'),(1,18,'G',9,'ACTIVE'),(1,18,'G',10,'ACTIVE'),(1,18,'G',11,'ACTIVE'),
(2,18,'H',1,'ACTIVE'),(2,18,'H',2,'ACTIVE'),(2,18,'H',3,'ACTIVE'),(2,18,'H',4,'ACTIVE'),(2,18,'H',5,'ACTIVE'),(2,18,'H',6,'ACTIVE'),(2,18,'H',7,'ACTIVE'),(2,18,'H',8,'ACTIVE'),(2,18,'H',9,'ACTIVE'),(2,18,'H',10,'ACTIVE'),(2,18,'H',11,'ACTIVE'),
(2,18,'I',1,'ACTIVE'),(2,18,'I',2,'ACTIVE'),(2,18,'I',3,'ACTIVE'),(2,18,'I',4,'ACTIVE'),(2,18,'I',5,'ACTIVE'),(2,18,'I',6,'ACTIVE'),(2,18,'I',7,'ACTIVE'),(2,18,'I',8,'ACTIVE'),(2,18,'I',9,'ACTIVE'),(2,18,'I',10,'ACTIVE'),(2,18,'I',11,'ACTIVE'),
(3,18,'J',1,'ACTIVE'),(3,18,'J',2,'ACTIVE'),(3,18,'J',3,'ACTIVE'),(3,18,'J',4,'ACTIVE'),(3,18,'J',5,'ACTIVE'),(3,18,'J',6,'ACTIVE'),(3,18,'J',7,'ACTIVE'),(3,18,'J',8,'ACTIVE'),(3,18,'J',9,'ACTIVE'),(3,18,'J',10,'ACTIVE'),(3,18,'J',11,'ACTIVE');

-- ====================
-- ROOM 19 | 3D | 100 ghế | cinema 4
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,19,'A',1,'ACTIVE'),(1,19,'A',2,'ACTIVE'),(1,19,'A',3,'ACTIVE'),(1,19,'A',4,'ACTIVE'),(1,19,'A',5,'ACTIVE'),(1,19,'A',6,'ACTIVE'),(1,19,'A',7,'ACTIVE'),(1,19,'A',8,'ACTIVE'),(1,19,'A',9,'ACTIVE'),(1,19,'A',10,'ACTIVE'),
(1,19,'B',1,'ACTIVE'),(1,19,'B',2,'ACTIVE'),(1,19,'B',3,'ACTIVE'),(1,19,'B',4,'ACTIVE'),(1,19,'B',5,'ACTIVE'),(1,19,'B',6,'ACTIVE'),(1,19,'B',7,'ACTIVE'),(1,19,'B',8,'ACTIVE'),(1,19,'B',9,'ACTIVE'),(1,19,'B',10,'ACTIVE'),
(1,19,'C',1,'ACTIVE'),(1,19,'C',2,'ACTIVE'),(1,19,'C',3,'ACTIVE'),(1,19,'C',4,'ACTIVE'),(1,19,'C',5,'ACTIVE'),(1,19,'C',6,'ACTIVE'),(1,19,'C',7,'ACTIVE'),(1,19,'C',8,'ACTIVE'),(1,19,'C',9,'ACTIVE'),(1,19,'C',10,'ACTIVE'),
(1,19,'D',1,'ACTIVE'),(1,19,'D',2,'ACTIVE'),(1,19,'D',3,'ACTIVE'),(1,19,'D',4,'ACTIVE'),(1,19,'D',5,'ACTIVE'),(1,19,'D',6,'ACTIVE'),(1,19,'D',7,'ACTIVE'),(1,19,'D',8,'ACTIVE'),(1,19,'D',9,'ACTIVE'),(1,19,'D',10,'ACTIVE'),
(1,19,'E',1,'ACTIVE'),(1,19,'E',2,'ACTIVE'),(1,19,'E',3,'ACTIVE'),(1,19,'E',4,'ACTIVE'),(1,19,'E',5,'ACTIVE'),(1,19,'E',6,'ACTIVE'),(1,19,'E',7,'ACTIVE'),(1,19,'E',8,'ACTIVE'),(1,19,'E',9,'ACTIVE'),(1,19,'E',10,'ACTIVE'),
(1,19,'F',1,'ACTIVE'),(1,19,'F',2,'ACTIVE'),(1,19,'F',3,'ACTIVE'),(1,19,'F',4,'ACTIVE'),(1,19,'F',5,'ACTIVE'),(1,19,'F',6,'ACTIVE'),(1,19,'F',7,'ACTIVE'),(1,19,'F',8,'ACTIVE'),(1,19,'F',9,'ACTIVE'),(1,19,'F',10,'ACTIVE'),
(2,19,'G',1,'ACTIVE'),(2,19,'G',2,'ACTIVE'),(2,19,'G',3,'ACTIVE'),(2,19,'G',4,'ACTIVE'),(2,19,'G',5,'ACTIVE'),(2,19,'G',6,'ACTIVE'),(2,19,'G',7,'ACTIVE'),(2,19,'G',8,'ACTIVE'),(2,19,'G',9,'ACTIVE'),(2,19,'G',10,'ACTIVE'),
(2,19,'H',1,'ACTIVE'),(2,19,'H',2,'ACTIVE'),(2,19,'H',3,'ACTIVE'),(2,19,'H',4,'ACTIVE'),(2,19,'H',5,'ACTIVE'),(2,19,'H',6,'ACTIVE'),(2,19,'H',7,'ACTIVE'),(2,19,'H',8,'ACTIVE'),(2,19,'H',9,'ACTIVE'),(2,19,'H',10,'ACTIVE'),
(3,19,'I',1,'ACTIVE'),(3,19,'I',2,'ACTIVE'),(3,19,'I',3,'ACTIVE'),(3,19,'I',4,'ACTIVE'),(3,19,'I',5,'ACTIVE'),(3,19,'I',6,'ACTIVE'),(3,19,'I',7,'ACTIVE'),(3,19,'I',8,'ACTIVE'),(3,19,'I',9,'ACTIVE'),(3,19,'I',10,'ACTIVE');

-- ====================
-- ROOM 20 | 3D | 90 ghế | cinema 4
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,20,'A',1,'ACTIVE'),(1,20,'A',2,'ACTIVE'),(1,20,'A',3,'ACTIVE'),(1,20,'A',4,'ACTIVE'),(1,20,'A',5,'ACTIVE'),(1,20,'A',6,'ACTIVE'),(1,20,'A',7,'ACTIVE'),(1,20,'A',8,'ACTIVE'),(1,20,'A',9,'ACTIVE'),(1,20,'A',10,'ACTIVE'),
(1,20,'B',1,'ACTIVE'),(1,20,'B',2,'ACTIVE'),(1,20,'B',3,'ACTIVE'),(1,20,'B',4,'ACTIVE'),(1,20,'B',5,'ACTIVE'),(1,20,'B',6,'ACTIVE'),(1,20,'B',7,'ACTIVE'),(1,20,'B',8,'ACTIVE'),(1,20,'B',9,'ACTIVE'),(1,20,'B',10,'ACTIVE'),
(1,20,'C',1,'ACTIVE'),(1,20,'C',2,'ACTIVE'),(1,20,'C',3,'ACTIVE'),(1,20,'C',4,'ACTIVE'),(1,20,'C',5,'ACTIVE'),(1,20,'C',6,'ACTIVE'),(1,20,'C',7,'ACTIVE'),(1,20,'C',8,'ACTIVE'),(1,20,'C',9,'ACTIVE'),(1,20,'C',10,'ACTIVE'),
(1,20,'D',1,'ACTIVE'),(1,20,'D',2,'ACTIVE'),(1,20,'D',3,'ACTIVE'),(1,20,'D',4,'ACTIVE'),(1,20,'D',5,'ACTIVE'),(1,20,'D',6,'ACTIVE'),(1,20,'D',7,'ACTIVE'),(1,20,'D',8,'ACTIVE'),(1,20,'D',9,'ACTIVE'),(1,20,'D',10,'ACTIVE'),
(1,20,'E',1,'ACTIVE'),(1,20,'E',2,'ACTIVE'),(1,20,'E',3,'ACTIVE'),(1,20,'E',4,'ACTIVE'),(1,20,'E',5,'ACTIVE'),(1,20,'E',6,'ACTIVE'),(1,20,'E',7,'ACTIVE'),(1,20,'E',8,'ACTIVE'),(1,20,'E',9,'ACTIVE'),(1,20,'E',10,'ACTIVE'),
(1,20,'F',1,'ACTIVE'),(1,20,'F',2,'ACTIVE'),(1,20,'F',3,'ACTIVE'),(1,20,'F',4,'ACTIVE'),(1,20,'F',5,'ACTIVE'),(1,20,'F',6,'ACTIVE'),(1,20,'F',7,'ACTIVE'),(1,20,'F',8,'ACTIVE'),(1,20,'F',9,'ACTIVE'),(1,20,'F',10,'ACTIVE'),
(2,20,'G',1,'ACTIVE'),(2,20,'G',2,'ACTIVE'),(2,20,'G',3,'ACTIVE'),(2,20,'G',4,'ACTIVE'),(2,20,'G',5,'ACTIVE'),(2,20,'G',6,'ACTIVE'),(2,20,'G',7,'ACTIVE'),(2,20,'G',8,'ACTIVE'),(2,20,'G',9,'ACTIVE'),(2,20,'G',10,'ACTIVE'),
(2,20,'H',1,'ACTIVE'),(2,20,'H',2,'ACTIVE'),(2,20,'H',3,'ACTIVE'),(2,20,'H',4,'ACTIVE'),(2,20,'H',5,'ACTIVE'),(2,20,'H',6,'ACTIVE'),(2,20,'H',7,'ACTIVE'),(2,20,'H',8,'ACTIVE'),(2,20,'H',9,'ACTIVE'),(2,20,'H',10,'ACTIVE'),
(3,20,'I',1,'ACTIVE'),(3,20,'I',2,'ACTIVE'),(3,20,'I',3,'ACTIVE'),(3,20,'I',4,'ACTIVE'),(3,20,'I',5,'ACTIVE'),(3,20,'I',6,'ACTIVE'),(3,20,'I',7,'ACTIVE'),(3,20,'I',8,'ACTIVE'),(3,20,'I',9,'ACTIVE'),(3,20,'I',10,'ACTIVE');

-- ====================
-- ROOM 21 | IMAX | 80 ghế | cinema 4
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,21,'A',1,'ACTIVE'),(1,21,'A',2,'ACTIVE'),(1,21,'A',3,'ACTIVE'),(1,21,'A',4,'ACTIVE'),(1,21,'A',5,'ACTIVE'),(1,21,'A',6,'ACTIVE'),(1,21,'A',7,'ACTIVE'),(1,21,'A',8,'ACTIVE'),(1,21,'A',9,'ACTIVE'),(1,21,'A',10,'ACTIVE'),
(1,21,'B',1,'ACTIVE'),(1,21,'B',2,'ACTIVE'),(1,21,'B',3,'ACTIVE'),(1,21,'B',4,'ACTIVE'),(1,21,'B',5,'ACTIVE'),(1,21,'B',6,'ACTIVE'),(1,21,'B',7,'ACTIVE'),(1,21,'B',8,'ACTIVE'),(1,21,'B',9,'ACTIVE'),(1,21,'B',10,'ACTIVE'),
(1,21,'C',1,'ACTIVE'),(1,21,'C',2,'ACTIVE'),(1,21,'C',3,'ACTIVE'),(1,21,'C',4,'ACTIVE'),(1,21,'C',5,'ACTIVE'),(1,21,'C',6,'ACTIVE'),(1,21,'C',7,'ACTIVE'),(1,21,'C',8,'ACTIVE'),(1,21,'C',9,'ACTIVE'),(1,21,'C',10,'ACTIVE'),
(1,21,'D',1,'ACTIVE'),(1,21,'D',2,'ACTIVE'),(1,21,'D',3,'ACTIVE'),(1,21,'D',4,'ACTIVE'),(1,21,'D',5,'ACTIVE'),(1,21,'D',6,'ACTIVE'),(1,21,'D',7,'ACTIVE'),(1,21,'D',8,'ACTIVE'),(1,21,'D',9,'ACTIVE'),(1,21,'D',10,'ACTIVE'),
(1,21,'E',1,'ACTIVE'),(1,21,'E',2,'ACTIVE'),(1,21,'E',3,'ACTIVE'),(1,21,'E',4,'ACTIVE'),(1,21,'E',5,'ACTIVE'),(1,21,'E',6,'ACTIVE'),(1,21,'E',7,'ACTIVE'),(1,21,'E',8,'ACTIVE'),(1,21,'E',9,'ACTIVE'),(1,21,'E',10,'ACTIVE'),
(2,21,'F',1,'ACTIVE'),(2,21,'F',2,'ACTIVE'),(2,21,'F',3,'ACTIVE'),(2,21,'F',4,'ACTIVE'),(2,21,'F',5,'ACTIVE'),(2,21,'F',6,'ACTIVE'),(2,21,'F',7,'ACTIVE'),(2,21,'F',8,'ACTIVE'),(2,21,'F',9,'ACTIVE'),(2,21,'F',10,'ACTIVE'),
(2,21,'G',1,'ACTIVE'),(2,21,'G',2,'ACTIVE'),(2,21,'G',3,'ACTIVE'),(2,21,'G',4,'ACTIVE'),(2,21,'G',5,'ACTIVE'),(2,21,'G',6,'ACTIVE'),(2,21,'G',7,'ACTIVE'),(2,21,'G',8,'ACTIVE'),(2,21,'G',9,'ACTIVE'),(2,21,'G',10,'ACTIVE'),
(3,21,'H',1,'ACTIVE'),(3,21,'H',2,'ACTIVE'),(3,21,'H',3,'ACTIVE'),(3,21,'H',4,'ACTIVE'),(3,21,'H',5,'ACTIVE'),(3,21,'H',6,'ACTIVE'),(3,21,'H',7,'ACTIVE'),(3,21,'H',8,'ACTIVE'),(3,21,'H',9,'ACTIVE'),(3,21,'H',10,'ACTIVE');

-- ====================
-- ROOM 22 | 2D | 115 ghế | cinema 5
-- A-G Thường (7 x 11 = 77), H-I VIP (2 x 11 = 22), J Đôi (11 ghế) → 110, thêm 5 → dùng 12 cột hàng A
-- A Thường 12 cột, B-G 11 cột (77-1=76+12=... ) → đơn giản: A-G 11 cột (77) + H-I 11 cột (22) + J 11 cột (1ACTIVE) + thêm 5 ghế hàng K = 115
-- Dùng: A-G Thường 11 cột (77), H-I VIP 11 cột (22), J Đôi 10 cột (10), thêm 1 hàng Thường 6 cột → phức tạp
-- Đơn giản: A-G 11 cột Thường(77) + H-I 11 cột VIP(22) + J 11 cột Đôi(1ACTIVE) + K 5 cột Thường(5) = 115
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,22,'A',1,'ACTIVE'),(1,22,'A',2,'ACTIVE'),(1,22,'A',3,'ACTIVE'),(1,22,'A',4,'ACTIVE'),(1,22,'A',5,'ACTIVE'),(1,22,'A',6,'ACTIVE'),(1,22,'A',7,'ACTIVE'),(1,22,'A',8,'ACTIVE'),(1,22,'A',9,'ACTIVE'),(1,22,'A',10,'ACTIVE'),(1,22,'A',11,'ACTIVE'),
(1,22,'B',1,'ACTIVE'),(1,22,'B',2,'ACTIVE'),(1,22,'B',3,'ACTIVE'),(1,22,'B',4,'ACTIVE'),(1,22,'B',5,'ACTIVE'),(1,22,'B',6,'ACTIVE'),(1,22,'B',7,'ACTIVE'),(1,22,'B',8,'ACTIVE'),(1,22,'B',9,'ACTIVE'),(1,22,'B',10,'ACTIVE'),(1,22,'B',11,'ACTIVE'),
(1,22,'C',1,'ACTIVE'),(1,22,'C',2,'ACTIVE'),(1,22,'C',3,'ACTIVE'),(1,22,'C',4,'ACTIVE'),(1,22,'C',5,'ACTIVE'),(1,22,'C',6,'ACTIVE'),(1,22,'C',7,'ACTIVE'),(1,22,'C',8,'ACTIVE'),(1,22,'C',9,'ACTIVE'),(1,22,'C',10,'ACTIVE'),(1,22,'C',11,'ACTIVE'),
(1,22,'D',1,'ACTIVE'),(1,22,'D',2,'ACTIVE'),(1,22,'D',3,'ACTIVE'),(1,22,'D',4,'ACTIVE'),(1,22,'D',5,'ACTIVE'),(1,22,'D',6,'ACTIVE'),(1,22,'D',7,'ACTIVE'),(1,22,'D',8,'ACTIVE'),(1,22,'D',9,'ACTIVE'),(1,22,'D',10,'ACTIVE'),(1,22,'D',11,'ACTIVE'),
(1,22,'E',1,'ACTIVE'),(1,22,'E',2,'ACTIVE'),(1,22,'E',3,'ACTIVE'),(1,22,'E',4,'ACTIVE'),(1,22,'E',5,'ACTIVE'),(1,22,'E',6,'ACTIVE'),(1,22,'E',7,'ACTIVE'),(1,22,'E',8,'ACTIVE'),(1,22,'E',9,'ACTIVE'),(1,22,'E',10,'ACTIVE'),(1,22,'E',11,'ACTIVE'),
(1,22,'F',1,'ACTIVE'),(1,22,'F',2,'ACTIVE'),(1,22,'F',3,'ACTIVE'),(1,22,'F',4,'ACTIVE'),(1,22,'F',5,'ACTIVE'),(1,22,'F',6,'ACTIVE'),(1,22,'F',7,'ACTIVE'),(1,22,'F',8,'ACTIVE'),(1,22,'F',9,'ACTIVE'),(1,22,'F',10,'ACTIVE'),(1,22,'F',11,'ACTIVE'),
(1,22,'G',1,'ACTIVE'),(1,22,'G',2,'ACTIVE'),(1,22,'G',3,'ACTIVE'),(1,22,'G',4,'ACTIVE'),(1,22,'G',5,'ACTIVE'),(1,22,'G',6,'ACTIVE'),(1,22,'G',7,'ACTIVE'),(1,22,'G',8,'ACTIVE'),(1,22,'G',9,'ACTIVE'),(1,22,'G',10,'ACTIVE'),(1,22,'G',11,'ACTIVE'),
(2,22,'H',1,'ACTIVE'),(2,22,'H',2,'ACTIVE'),(2,22,'H',3,'ACTIVE'),(2,22,'H',4,'ACTIVE'),(2,22,'H',5,'ACTIVE'),(2,22,'H',6,'ACTIVE'),(2,22,'H',7,'ACTIVE'),(2,22,'H',8,'ACTIVE'),(2,22,'H',9,'ACTIVE'),(2,22,'H',10,'ACTIVE'),(2,22,'H',11,'ACTIVE'),
(2,22,'I',1,'ACTIVE'),(2,22,'I',2,'ACTIVE'),(2,22,'I',3,'ACTIVE'),(2,22,'I',4,'ACTIVE'),(2,22,'I',5,'ACTIVE'),(2,22,'I',6,'ACTIVE'),(2,22,'I',7,'ACTIVE'),(2,22,'I',8,'ACTIVE'),(2,22,'I',9,'ACTIVE'),(2,22,'I',10,'ACTIVE'),(2,22,'I',11,'ACTIVE'),
(3,22,'J',1,'ACTIVE'),(3,22,'J',2,'ACTIVE'),(3,22,'J',3,'ACTIVE'),(3,22,'J',4,'ACTIVE'),(3,22,'J',5,'ACTIVE'),(3,22,'J',6,'ACTIVE'),(3,22,'J',7,'ACTIVE'),(3,22,'J',8,'ACTIVE'),(3,22,'J',9,'ACTIVE'),(3,22,'J',10,'ACTIVE'),(3,22,'J',11,'ACTIVE');

-- ====================
-- ROOM 23 | 2D | 105 ghế | cinema 5
-- A-F Thường (6 x 11 = 66), G-H VIP (2 x 11 = 22), I Đôi (11 ghế) → 99, thêm K 6 cột Thường = 105
-- Đơn giản: A-G 11 cột Thường(77) + H-I 11 cột VIP(22) + J 6 cột Đôi(6) = 105
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,23,'A',1,'ACTIVE'),(1,23,'A',2,'ACTIVE'),(1,23,'A',3,'ACTIVE'),(1,23,'A',4,'ACTIVE'),(1,23,'A',5,'ACTIVE'),(1,23,'A',6,'ACTIVE'),(1,23,'A',7,'ACTIVE'),(1,23,'A',8,'ACTIVE'),(1,23,'A',9,'ACTIVE'),(1,23,'A',10,'ACTIVE'),(1,23,'A',11,'ACTIVE'),
(1,23,'B',1,'ACTIVE'),(1,23,'B',2,'ACTIVE'),(1,23,'B',3,'ACTIVE'),(1,23,'B',4,'ACTIVE'),(1,23,'B',5,'ACTIVE'),(1,23,'B',6,'ACTIVE'),(1,23,'B',7,'ACTIVE'),(1,23,'B',8,'ACTIVE'),(1,23,'B',9,'ACTIVE'),(1,23,'B',10,'ACTIVE'),(1,23,'B',11,'ACTIVE'),
(1,23,'C',1,'ACTIVE'),(1,23,'C',2,'ACTIVE'),(1,23,'C',3,'ACTIVE'),(1,23,'C',4,'ACTIVE'),(1,23,'C',5,'ACTIVE'),(1,23,'C',6,'ACTIVE'),(1,23,'C',7,'ACTIVE'),(1,23,'C',8,'ACTIVE'),(1,23,'C',9,'ACTIVE'),(1,23,'C',10,'ACTIVE'),(1,23,'C',11,'ACTIVE'),
(1,23,'D',1,'ACTIVE'),(1,23,'D',2,'ACTIVE'),(1,23,'D',3,'ACTIVE'),(1,23,'D',4,'ACTIVE'),(1,23,'D',5,'ACTIVE'),(1,23,'D',6,'ACTIVE'),(1,23,'D',7,'ACTIVE'),(1,23,'D',8,'ACTIVE'),(1,23,'D',9,'ACTIVE'),(1,23,'D',10,'ACTIVE'),(1,23,'D',11,'ACTIVE'),
(1,23,'E',1,'ACTIVE'),(1,23,'E',2,'ACTIVE'),(1,23,'E',3,'ACTIVE'),(1,23,'E',4,'ACTIVE'),(1,23,'E',5,'ACTIVE'),(1,23,'E',6,'ACTIVE'),(1,23,'E',7,'ACTIVE'),(1,23,'E',8,'ACTIVE'),(1,23,'E',9,'ACTIVE'),(1,23,'E',10,'ACTIVE'),(1,23,'E',11,'ACTIVE'),
(1,23,'F',1,'ACTIVE'),(1,23,'F',2,'ACTIVE'),(1,23,'F',3,'ACTIVE'),(1,23,'F',4,'ACTIVE'),(1,23,'F',5,'ACTIVE'),(1,23,'F',6,'ACTIVE'),(1,23,'F',7,'ACTIVE'),(1,23,'F',8,'ACTIVE'),(1,23,'F',9,'ACTIVE'),(1,23,'F',10,'ACTIVE'),(1,23,'F',11,'ACTIVE'),
(1,23,'G',1,'ACTIVE'),(1,23,'G',2,'ACTIVE'),(1,23,'G',3,'ACTIVE'),(1,23,'G',4,'ACTIVE'),(1,23,'G',5,'ACTIVE'),(1,23,'G',6,'ACTIVE'),(1,23,'G',7,'ACTIVE'),(1,23,'G',8,'ACTIVE'),(1,23,'G',9,'ACTIVE'),(1,23,'G',10,'ACTIVE'),(1,23,'G',11,'ACTIVE'),
(2,23,'H',1,'ACTIVE'),(2,23,'H',2,'ACTIVE'),(2,23,'H',3,'ACTIVE'),(2,23,'H',4,'ACTIVE'),(2,23,'H',5,'ACTIVE'),(2,23,'H',6,'ACTIVE'),(2,23,'H',7,'ACTIVE'),(2,23,'H',8,'ACTIVE'),(2,23,'H',9,'ACTIVE'),(2,23,'H',10,'ACTIVE'),(2,23,'H',11,'ACTIVE'),
(2,23,'I',1,'ACTIVE'),(2,23,'I',2,'ACTIVE'),(2,23,'I',3,'ACTIVE'),(2,23,'I',4,'ACTIVE'),(2,23,'I',5,'ACTIVE'),(2,23,'I',6,'ACTIVE'),(2,23,'I',7,'ACTIVE'),(2,23,'I',8,'ACTIVE'),(2,23,'I',9,'ACTIVE'),(2,23,'I',10,'ACTIVE'),(2,23,'I',11,'ACTIVE'),
(3,23,'J',1,'ACTIVE'),(3,23,'J',2,'ACTIVE'),(3,23,'J',3,'ACTIVE'),(3,23,'J',4,'ACTIVE'),(3,23,'J',5,'ACTIVE'),(3,23,'J',6,'ACTIVE');

-- ====================
-- ROOM 24 | 3D | 95 ghế | cinema 5
-- A-F Thường (6 x 10 = 60), G-H VIP (2 x 10 = 20), I Đôi (10 ghế) → 90 + thêm 5 ghế Thường hàng J
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,24,'A',1,'ACTIVE'),(1,24,'A',2,'ACTIVE'),(1,24,'A',3,'ACTIVE'),(1,24,'A',4,'ACTIVE'),(1,24,'A',5,'ACTIVE'),(1,24,'A',6,'ACTIVE'),(1,24,'A',7,'ACTIVE'),(1,24,'A',8,'ACTIVE'),(1,24,'A',9,'ACTIVE'),(1,24,'A',10,'ACTIVE'),
(1,24,'B',1,'ACTIVE'),(1,24,'B',2,'ACTIVE'),(1,24,'B',3,'ACTIVE'),(1,24,'B',4,'ACTIVE'),(1,24,'B',5,'ACTIVE'),(1,24,'B',6,'ACTIVE'),(1,24,'B',7,'ACTIVE'),(1,24,'B',8,'ACTIVE'),(1,24,'B',9,'ACTIVE'),(1,24,'B',10,'ACTIVE'),
(1,24,'C',1,'ACTIVE'),(1,24,'C',2,'ACTIVE'),(1,24,'C',3,'ACTIVE'),(1,24,'C',4,'ACTIVE'),(1,24,'C',5,'ACTIVE'),(1,24,'C',6,'ACTIVE'),(1,24,'C',7,'ACTIVE'),(1,24,'C',8,'ACTIVE'),(1,24,'C',9,'ACTIVE'),(1,24,'C',10,'ACTIVE'),
(1,24,'D',1,'ACTIVE'),(1,24,'D',2,'ACTIVE'),(1,24,'D',3,'ACTIVE'),(1,24,'D',4,'ACTIVE'),(1,24,'D',5,'ACTIVE'),(1,24,'D',6,'ACTIVE'),(1,24,'D',7,'ACTIVE'),(1,24,'D',8,'ACTIVE'),(1,24,'D',9,'ACTIVE'),(1,24,'D',10,'ACTIVE'),
(1,24,'E',1,'ACTIVE'),(1,24,'E',2,'ACTIVE'),(1,24,'E',3,'ACTIVE'),(1,24,'E',4,'ACTIVE'),(1,24,'E',5,'ACTIVE'),(1,24,'E',6,'ACTIVE'),(1,24,'E',7,'ACTIVE'),(1,24,'E',8,'ACTIVE'),(1,24,'E',9,'ACTIVE'),(1,24,'E',10,'ACTIVE'),
(1,24,'F',1,'ACTIVE'),(1,24,'F',2,'ACTIVE'),(1,24,'F',3,'ACTIVE'),(1,24,'F',4,'ACTIVE'),(1,24,'F',5,'ACTIVE'),(1,24,'F',6,'ACTIVE'),(1,24,'F',7,'ACTIVE'),(1,24,'F',8,'ACTIVE'),(1,24,'F',9,'ACTIVE'),(1,24,'F',10,'ACTIVE'),
(2,24,'G',1,'ACTIVE'),(2,24,'G',2,'ACTIVE'),(2,24,'G',3,'ACTIVE'),(2,24,'G',4,'ACTIVE'),(2,24,'G',5,'ACTIVE'),(2,24,'G',6,'ACTIVE'),(2,24,'G',7,'ACTIVE'),(2,24,'G',8,'ACTIVE'),(2,24,'G',9,'ACTIVE'),(2,24,'G',10,'ACTIVE'),
(2,24,'H',1,'ACTIVE'),(2,24,'H',2,'ACTIVE'),(2,24,'H',3,'ACTIVE'),(2,24,'H',4,'ACTIVE'),(2,24,'H',5,'ACTIVE'),(2,24,'H',6,'ACTIVE'),(2,24,'H',7,'ACTIVE'),(2,24,'H',8,'ACTIVE'),(2,24,'H',9,'ACTIVE'),(2,24,'H',10,'ACTIVE'),
(3,24,'I',1,'ACTIVE'),(3,24,'I',2,'ACTIVE'),(3,24,'I',3,'ACTIVE'),(3,24,'I',4,'ACTIVE'),(3,24,'I',5,'ACTIVE'),(3,24,'I',6,'ACTIVE'),(3,24,'I',7,'ACTIVE'),(3,24,'I',8,'ACTIVE'),(3,24,'I',9,'ACTIVE'),(3,24,'I',10,'ACTIVE'),
(1,24,'J',1,'ACTIVE'),(1,24,'J',2,'ACTIVE'),(1,24,'J',3,'ACTIVE'),(1,24,'J',4,'ACTIVE'),(1,24,'J',5,'ACTIVE');

-- ====================
-- ROOM 25 | 3D | 85 ghế | cinema 5
-- A-E Thường (5 x 10 = 50), F-G VIP (2 x 10 = 20), H Đôi (10 ghế) → 80 + 5 ghế Thường hàng I
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,25,'A',1,'ACTIVE'),(1,25,'A',2,'ACTIVE'),(1,25,'A',3,'ACTIVE'),(1,25,'A',4,'ACTIVE'),(1,25,'A',5,'ACTIVE'),(1,25,'A',6,'ACTIVE'),(1,25,'A',7,'ACTIVE'),(1,25,'A',8,'ACTIVE'),(1,25,'A',9,'ACTIVE'),(1,25,'A',10,'ACTIVE'),
(1,25,'B',1,'ACTIVE'),(1,25,'B',2,'ACTIVE'),(1,25,'B',3,'ACTIVE'),(1,25,'B',4,'ACTIVE'),(1,25,'B',5,'ACTIVE'),(1,25,'B',6,'ACTIVE'),(1,25,'B',7,'ACTIVE'),(1,25,'B',8,'ACTIVE'),(1,25,'B',9,'ACTIVE'),(1,25,'B',10,'ACTIVE'),
(1,25,'C',1,'ACTIVE'),(1,25,'C',2,'ACTIVE'),(1,25,'C',3,'ACTIVE'),(1,25,'C',4,'ACTIVE'),(1,25,'C',5,'ACTIVE'),(1,25,'C',6,'ACTIVE'),(1,25,'C',7,'ACTIVE'),(1,25,'C',8,'ACTIVE'),(1,25,'C',9,'ACTIVE'),(1,25,'C',10,'ACTIVE'),
(1,25,'D',1,'ACTIVE'),(1,25,'D',2,'ACTIVE'),(1,25,'D',3,'ACTIVE'),(1,25,'D',4,'ACTIVE'),(1,25,'D',5,'ACTIVE'),(1,25,'D',6,'ACTIVE'),(1,25,'D',7,'ACTIVE'),(1,25,'D',8,'ACTIVE'),(1,25,'D',9,'ACTIVE'),(1,25,'D',10,'ACTIVE'),
(1,25,'E',1,'ACTIVE'),(1,25,'E',2,'ACTIVE'),(1,25,'E',3,'ACTIVE'),(1,25,'E',4,'ACTIVE'),(1,25,'E',5,'ACTIVE'),(1,25,'E',6,'ACTIVE'),(1,25,'E',7,'ACTIVE'),(1,25,'E',8,'ACTIVE'),(1,25,'E',9,'ACTIVE'),(1,25,'E',10,'ACTIVE'),
(2,25,'F',1,'ACTIVE'),(2,25,'F',2,'ACTIVE'),(2,25,'F',3,'ACTIVE'),(2,25,'F',4,'ACTIVE'),(2,25,'F',5,'ACTIVE'),(2,25,'F',6,'ACTIVE'),(2,25,'F',7,'ACTIVE'),(2,25,'F',8,'ACTIVE'),(2,25,'F',9,'ACTIVE'),(2,25,'F',10,'ACTIVE'),
(2,25,'G',1,'ACTIVE'),(2,25,'G',2,'ACTIVE'),(2,25,'G',3,'ACTIVE'),(2,25,'G',4,'ACTIVE'),(2,25,'G',5,'ACTIVE'),(2,25,'G',6,'ACTIVE'),(2,25,'G',7,'ACTIVE'),(2,25,'G',8,'ACTIVE'),(2,25,'G',9,'ACTIVE'),(2,25,'G',10,'ACTIVE'),
(3,25,'H',1,'ACTIVE'),(3,25,'H',2,'ACTIVE'),(3,25,'H',3,'ACTIVE'),(3,25,'H',4,'ACTIVE'),(3,25,'H',5,'ACTIVE'),(3,25,'H',6,'ACTIVE'),(3,25,'H',7,'ACTIVE'),(3,25,'H',8,'ACTIVE'),(3,25,'H',9,'ACTIVE'),(3,25,'H',10,'ACTIVE'),
(1,25,'I',1,'ACTIVE'),(1,25,'I',2,'ACTIVE'),(1,25,'I',3,'ACTIVE'),(1,25,'I',4,'ACTIVE'),(1,25,'I',5,'ACTIVE');

-- ====================
-- ROOM 26 | IMAX | 75 ghế | cinema 5
-- A-E Thường (5 x 10 = 50), F-G VIP (2 x 10 = 20) → 70 + H Đôi 5 ghế = 75
-- ====================
INSERT INTO seat (seat_type_id, room_id, seat_row, seat_column, status) VALUES
(1,26,'A',1,'ACTIVE'),(1,26,'A',2,'ACTIVE'),(1,26,'A',3,'ACTIVE'),(1,26,'A',4,'ACTIVE'),(1,26,'A',5,'ACTIVE'),(1,26,'A',6,'ACTIVE'),(1,26,'A',7,'ACTIVE'),(1,26,'A',8,'ACTIVE'),(1,26,'A',9,'ACTIVE'),(1,26,'A',10,'ACTIVE'),
(1,26,'B',1,'ACTIVE'),(1,26,'B',2,'ACTIVE'),(1,26,'B',3,'ACTIVE'),(1,26,'B',4,'ACTIVE'),(1,26,'B',5,'ACTIVE'),(1,26,'B',6,'ACTIVE'),(1,26,'B',7,'ACTIVE'),(1,26,'B',8,'ACTIVE'),(1,26,'B',9,'ACTIVE'),(1,26,'B',10,'ACTIVE'),
(1,26,'C',1,'ACTIVE'),(1,26,'C',2,'ACTIVE'),(1,26,'C',3,'ACTIVE'),(1,26,'C',4,'ACTIVE'),(1,26,'C',5,'ACTIVE'),(1,26,'C',6,'ACTIVE'),(1,26,'C',7,'ACTIVE'),(1,26,'C',8,'ACTIVE'),(1,26,'C',9,'ACTIVE'),(1,26,'C',10,'ACTIVE'),
(1,26,'D',1,'ACTIVE'),(1,26,'D',2,'ACTIVE'),(1,26,'D',3,'ACTIVE'),(1,26,'D',4,'ACTIVE'),(1,26,'D',5,'ACTIVE'),(1,26,'D',6,'ACTIVE'),(1,26,'D',7,'ACTIVE'),(1,26,'D',8,'ACTIVE'),(1,26,'D',9,'ACTIVE'),(1,26,'D',10,'ACTIVE'),
(1,26,'E',1,'ACTIVE'),(1,26,'E',2,'ACTIVE'),(1,26,'E',3,'ACTIVE'),(1,26,'E',4,'ACTIVE'),(1,26,'E',5,'ACTIVE'),(1,26,'E',6,'ACTIVE'),(1,26,'E',7,'ACTIVE'),(1,26,'E',8,'ACTIVE'),(1,26,'E',9,'ACTIVE'),(1,26,'E',10,'ACTIVE'),
(2,26,'F',1,'ACTIVE'),(2,26,'F',2,'ACTIVE'),(2,26,'F',3,'ACTIVE'),(2,26,'F',4,'ACTIVE'),(2,26,'F',5,'ACTIVE'),(2,26,'F',6,'ACTIVE'),(2,26,'F',7,'ACTIVE'),(2,26,'F',8,'ACTIVE'),(2,26,'F',9,'ACTIVE'),(2,26,'F',10,'ACTIVE'),
(2,26,'G',1,'ACTIVE'),(2,26,'G',2,'ACTIVE'),(2,26,'G',3,'ACTIVE'),(2,26,'G',4,'ACTIVE'),(2,26,'G',5,'ACTIVE'),(2,26,'G',6,'ACTIVE'),(2,26,'G',7,'ACTIVE'),(2,26,'G',8,'ACTIVE'),(2,26,'G',9,'ACTIVE'),(2,26,'G',10,'ACTIVE'),
(3,26,'H',1,'ACTIVE'),(3,26,'H',2,'ACTIVE'),(3,26,'H',3,'ACTIVE'),(3,26,'H',4,'ACTIVE'),(3,26,'H',5,'ACTIVE');

-- Movie
INSERT INTO movie (
    movie_type_id,
    movie_name,
    description,
    minimum_age,
    image_landscape,
    image_portrait,
    rating_average,
    total_votes,
    release_date,
    end_date,
    slug,
    trailer_url,
    duration_minutes,
    status,
    country,
    producer,
    director,
    actors,
    created_at,
    updated_at
) VALUES
(5, 'Hẹn Em Ngày Nhật Thực',
'Năm 1995, khi đang đứng trước một quyết định quan trọng của cuộc đời, Ân bất ngờ bị kéo trở lại quá khứ bởi những bức thư tình chưa từng trao tay. Hành trình tìm gặp Thiên - mối tình đầu từng khắc sâu trong tim - đưa cô về lại thôn xóm Trà Mây năm xưa, nơi những ký ức ngọt ngào xen lẫn tổn thương vẫn chưa hề nguôi ngoai. Trong khoảnh khắc định mệnh khi hai người bất ngờ chạm mặt, những bí mật bị che giấu suốt nhiều năm dần hé lộ, buộc Ân phải đối diện với sự thật và lựa chọn con đường cho riêng mình.',
16,
'https://cdn.galaxycine.vn/media/2026/3/18/hen-em-ngay-nhat-thuc-750_1773826392192.jpg',
'https://cdn.galaxycine.vn/media/2026/3/18/hen-em-ngay-nhat-thuc-500_1773826390908.jpg',
7.7, 107, '2026-03-27', '2026-05-31',
'hen-em-ngay-nhat-thuc', 'https://youtu.be/avengers_sw', 118, 'ACTIVE',
'Việt Nam', 'HK Film', 'Võ Thanh Hòa',
JSON_ARRAY('Khả Ngân', 'Anh Tú', 'Lê Bống'),
NOW(), NOW()),

(4, 'Cú Nhảy Kỳ Diệu',
'Hoppers xoay quanh Mabel, một cô gái yêu động vật, vô tình tiếp cận công nghệ cho phép chuyển ý thức của con người vào cơ thể động vật. Nhờ đó, Mabel nhảy vào thế giời tự nhiên dưới hình dạng một con hải ly và có thể giao tiếp trực tiếp với các loài khác. Trong hành trình này, cô dần khám phá ra cách các loài động vật nhìn con người, đồng thời phát hiện những mối nguy đang đe dọa môi trường sống của chúng. Tận dụng công nghệ Nhảy, Mabel đã trở thành cầu nối, mang lại cuộc sống cân bằng cho cả động vật và con người.',
0,
'https://cdn.galaxycine.vn/media/2026/2/24/hoppers-750_1771926447575.jpg',
'https://cdn.galaxycine.vn/media/2026/2/24/hoppers-500_1771926441222.jpg',
8.8, 149, '2026-03-13', '2026-05-03',
'hoppers', 'https://www.youtube.com/watch?v=n0Pl1aNis4E', 105, 'ACTIVE',
'Mỹ', 'Netflix Animation', 'Mike Rianda',
JSON_ARRAY('Maya Hawke', 'Brandon Scott Jones'),
NOW(), NOW()),

(6, 'Vùng Đất Luân Hồi',
'Lấy bối cảnh tại Cõi Ngoại – cõi trung gian giữa cái chết và sự tái sinh, Vùng Đất Luân Hồi kể về hành trình xuyên suốt ngàn năm của Tiểu Quỷ - kẻ mang nhiệm vụ dẫn dắt các linh hồn để giúp họ buông bỏ ký ức và cảm xúc còn sót lại từ kiếp trước để bước vào vòng luân hồi.',
13,
'https://cdn.galaxycine.vn/media/2026/3/24/vung-dat-luan-hoi-750_1774333764725.jpg',
'https://cdn.galaxycine.vn/media/2026/3/24/vung-dat-luan-hoi-500_1774333765706.jpg',
9.2, 13, '2026-03-26', '2026-05-31',
'another-world', 'https://www.youtube.com/watch?v=et7dJX7ys14', 111, 'ACTIVE',
'Trung Quốc', 'Light Chaser Animation', 'Liu Jian',
JSON_ARRAY('Deng Chao', 'Bai Ke'),
NOW(), NOW()),

(4, 'Cô Bé Coraline',
'Khi gia đình chuyển đến một lâu đài cổ, Coraline vô tình mở ra cánh cửa dẫn tới một thế giới song song, nơi mọi thứ rực rỡ và hoàn hảo một cách đáng ngờ. Nhưng càng đắm mình trong sự “hoàn hảo” ấy, cô càng nhận ra phía sau lớp vỏ dịu dàng là một vực sâu nguy hiểm đang chực chờ nuốt chửng tất cả. Thế giới kia không phải phép màu, mà là chiếc bẫy được giăng bằng những bí mật đen tối. Để cứu gia đình và chính mình, Coraline buộc phải đối diện với thực thể tà ác đang ẩn sau vẻ ngoài rực rỡ và đôi mắt trống rỗng vô hồn.',
13,
'https://cdn.galaxycine.vn/media/2026/3/18/coraline-750_1773804979615.jpg',
'https://cdn.galaxycine.vn/media/2026/3/18/coraline-500_1773804978447.jpg',
9.2, 12, '2026-03-27', '2026-05-31',
'coraline', 'https://www.youtube.com/watch?v=rbJOA0X-yAg', 101, 'ACTIVE',
'Mỹ', 'Laika Studios', 'Henry Selick',
JSON_ARRAY('Dakota Fanning', 'Teri Hatcher', 'Keith David'),
NOW(), NOW()),

(6, 'Thoát Khỏi Tận Thế',
'Ryland Grace một giáo viên khoa học nhận ra anh chính là hy vọng cuối cùng của Trái Đất. Nhiệm vụ của anh: cứu lấy Mặt Trời khỏi một sinh thể bí ẩn đang hút cạn năng lượng ánh sáng, đẩy cả hệ Mặt Trời vào bóng tối vĩnh viễn. Nếu thất bại, sự sống trên Trái Đất sẽ lụi tàn theo ánh sáng cuối cùng của mặt trời.
Giữa không gian vũ trụ cô độc và áp lực của thời gian đang cạn dần, mọi phép tính, mọi quyết định của anh đều gánh trên vai số phận của toàn nhân loại. Nhưng trong hành trình tưởng chừng chỉ có một mình giữa khoảng không vô tận ấy, một tình bạn bất ngờ với một sinh vật ngoài hành tinh đã xuất hiện. Và có lẽ, để cứu Trái Đất, anh sẽ không phải chiến đấu một mình.
',
13,
'https://cdn.galaxycine.vn/media/2026/3/12/project-hail-mary-750_1773302559148.jpg',
'https://cdn.galaxycine.vn/media/2026/3/12/project-hail-mary-500_1773302558076.jpg',
8.7, 74, '2026-03-19', '2026-03-29',
'project-hail-mary', 'https://www.youtube.com/watch?v=STAUpTmhx1Q', 157, 'ACTIVE',
'Mỹ', 'MGM', 'Phil Lord',
JSON_ARRAY('Ryan Gosling', 'Zach Galifianakis'),
NOW(), NOW()),

(2, 'Mặt Nạ Da Người',
'Ki Mangun Suroto là một nghệ nhân múa rối Wayang nổi tiếng và đầy tham vọng, ông khao khát nắm giữ tà thuật cổ xưa để đạt được sự giàu có và bất tử. Năm 2021, ông mời Citra làm nghệ sĩ hát Sinden trong một buổi lễ, nhưng thực chất là muốn cô trở thành vật tế cuối cùng. Trong khi cố gắng kiếm tiền chữa bệnh cho em gái, Citra dần bị cuốn vào những nghi lễ kinh hoàng và phải tìm cách thoát khỏi số phận đáng sợ của mình.',
18,
'https://cdn.galaxycine.vn/media/2026/3/2/mat-na-da-nguoi-750_1772423096779.jpg',
'https://cdn.galaxycine.vn/media/2026/3/2/mat-na-da-nguoi-500_1772423095846.jpg',
7.5, 17, '2026-03-27', '2026-05-31',
'danyang-wingit-jumat-kliwon', 'https://www.youtube.com/watch?v=JqOfZE0xa78', 86, 'ACTIVE',
'Indonesia', 'MD Pictures', 'Kimo Stamboel',
JSON_ARRAY('Faradina Mufti', 'Asmara Abigail'),
NOW(), NOW()),

(2, 'Quỷ Nhập Tràng 2',
'Quỷ Nhập Tràng 2 là tiền truyện của nhân vật Minh Như, trở về xưởng nhuộm gia đình sau nhiều năm bị xua đuổi. Tại đây, cô phải đối mặt với những hiện tượng ma quái cùng sự thật tàn khốc về cái chết của mẹ và giao ước đẫm máu năm xưa. Ác giả ác báo, liệu Minh Như có thoát khỏi vòng vây của quỷ dữ?',
18,
'https://cdn.galaxycine.vn/media/2026/2/26/quy-nhap-trang-2-750_1772097817321.jpg',
'https://cdn.galaxycine.vn/media/2026/2/26/quy-nhap-trang-2-500_1772097817869.jpg',
7.5, 455, '2026-03-11', '2026-05-03',
'quy-nhap-trang-2', 'https://www.youtube.com/watch?v=mDVmaQOOBPw', 126, 'ACTIVE',
'Việt Nam', 'Galaxy Studio', 'Lê Văn Kiệt',
JSON_ARRAY('Quang Tuấn', 'Hương Giang', 'Lâm Thanh Mỹ'),
NOW(), NOW()),

(3, 'Tứ Hổ Đại Náo',
'Trong Thế Chiến II, 9 tấn vàng của chính phủ Thái Lan đột ngột bị thất lạc - Châm ngòi cho cuộc truy lùng đẫm máu khắp cả nước. Bốn tên cướp khét tiếng, mỗi người sở hữu một năng lực tà thuật riêng, bị lôi kéo vào trò chơi tử thần. Giữa thời đại mà công lý sụp đổ và người dân không còn nơi nương tựa, một huyền thoại hùng mạnh đã ra đời: Tứ Hổ.',
18,
'https://cdn.galaxycine.vn/media/2026/2/26/tu-ho-750_1772075417333.jpg',
'https://cdn.galaxycine.vn/media/2026/2/26/tu-ho-500_1772075416156.jpg',
7.7, 17, '2026-03-27', '2026-05-31',
'4-tigers', 'https://www.youtube.com/watch?v=GVcXYQtTsJQ', 110, 'ACTIVE',
'Thái Lan', 'GDH 559', 'Pongpat Wachirabunjong',
JSON_ARRAY('Nirut Sirichanya', 'Sornram Teppitak'),
NOW(), NOW()),

(1, 'Kung Fu Quải Chưởng',
'Hai nam sinh chuyên bị bắt nạt bỗng chốc nắm giữ tuyệt kỹ công phu sau khi bái một lão ăn mày làm sư phụ. Tuyệt đỉnh võ công đó cũng kéo theo sự trỗi dậy của Ma Vương và những vụ thảm sát đẫm máu, Yuan (Kha Chấn Đông) và Ah-yi (Chu Hiên Dương) phải đối mặt với trận chiến sinh tử để tìm ra bí mật thực sự của “Kung Fu”.  Tác phẩm bom tấn của đạo diễn Cửu Bả Đao đã chiếm lĩnh top 1 doanh thu phim Tết xứ Đài!',
18,
'https://cdn.galaxycine.vn/media/2026/3/12/kungfu-750_1773297792845.jpg',
'https://cdn.galaxycine.vn/media/2026/3/12/kungfu-500_1773297791201.jpg',
7.0, 8, '2026-03-26', '2026-07-05',
'kung-fu', 'https://www.youtube.com/watch?v=IsP0FI7rdvM', 127, 'ACTIVE',
'Đài Loan', 'Greener Grass Production', 'Cửu Bả Đao',
JSON_ARRAY('Kha Chấn Đông', 'Chu Hiên Dương'),
NOW(), NOW()),

(5, 'Căn Nhà Ký Ức',
'Sentimental Value/ Căn Nhà Ký Ức xoay quanh hai chị em Nora và Agnes bất ngờ đoàn tụ với người cha xa cách là Gustav - một đạo diễn kỳ cựu, nay muốn tái xuất bằng dự án mới và mời Nora đóng vai chính. Khi bị từ chối, ông mời một ngôi sao Hollywood trẻ thế chỗ, đẩy hai chị em vào tình huống căng thẳng khi vừa phải đối mặt với , vừa ứng xử với “kẻ ngoài cuộc” xen vào mối quan hệ vốn đã phức tạp. ',
13,
'https://cdn.galaxycine.vn/media/2026/3/16/sentimental-value-3_1773649168067.jpg',
'https://cdn.galaxycine.vn/media/2026/3/16/sentimental-value-2_1773649162941.jpg',
8.4, 16, '2026-03-20', '2026-04-24',
'sentimental-value', 'https://www.youtube.com/watch?v=Ocee2LYV0Ik', 133, 'ACTIVE',
'Na Uy', 'Motlys', 'Dag Johan Haugerud',
JSON_ARRAY('Renate Reinsve', 'Anders Danielsen Lie'),
NOW(), NOW()),

(5, 'Đếm Ngày Xa Mẹ',
'Đếm Ngày Xa Mẹ xoay quanh cặp mẹ con Eun-sil (Jang Hye-jin) và Ha-min (Choi Woo-shik). Mỗi lần ăn một món do mẹ nấu, Ha-min lại nhìn thấy một con số khó lý giải. Sau mỗi bữa ăn, con số ấy giảm đi một đơn vị. Ha-min sớm nhận ra một sự thật kinh hoàng: khi con số chạm về 0, mẹ anh sẽ qua đời. Kể từ đó, cuộc sống bình thường của Ha-min bị đảo lộn hoàn toàn. Để bảo vệ quãng thời gian còn lại của mẹ, Ha-min bắt đầu tránh xa những bữa cơm nhà, viện đủ mọi lý do để không phải ngồi vào bàn ăn và dần trở nên xa cách với mẹ. Liệu thời gian để Hamin ở bên mẹ còn được bao lâu nữa?',
13,
'https://cdn.galaxycine.vn/media/2026/3/4/dem-ngay-xa-me-750_1772594866106.jpg',
'https://cdn.galaxycine.vn/media/2026/3/4/dem-ngay-xa-me-500_1772594865987.jpg',
8.5, 85, '2026-03-18', '2026-06-28',
'number-one', 'https://www.youtube.com/watch?v=_3gQeYHoGhE', 109, 'ACTIVE',
'Hàn Quốc', 'Barunson E&A', 'Lee Dong-eun',
JSON_ARRAY('Choi Woo-shik', 'Jang Hye-jin'),
NOW(), NOW()),

(3, 'Thỏ Ơi!!',
'Với tâm thế luôn mang đến những điều mới để cho khán giả của mình không nhàm chán, Thỏ Ơi!! hứa hẹn sẽ mang đến một màu sắc hoàn toàn khác biệt.',
18,
'https://cdn.galaxycine.vn/media/2026/2/10/tho-oi-750_1770696596032.jpg',
'https://cdn.galaxycine.vn/media/2026/2/10/tho-oi-500_1770696594579.jpg',
9.3, 3036, '2026-02-10', '2026-05-03',
'tho-oi', 'https://www.youtube.com/watch?v=XMv1Zhj5TQg', 127, 'ACTIVE',
'Việt Nam', 'Galaxy Studio', 'Trấn Thành',
JSON_ARRAY('Trấn Thành', 'Hari Won', 'Tuấn Trần'),
NOW(), NOW()),

(5, 'Tài',
'Tài đã trải qua hành trình đầy khó khăn, làm đủ mọi nghề, thậm chí là những phi vụ nguy hiểm phải đặt cược mạng sống để bảo vệ “tài sản” quý giá nhất đời mình. Liệu Tài có đủ nghị lực và tinh thần để vượt lên trên nghịch cảnh, trong gang tấc sự sống?',
16,
'https://cdn.galaxycine.vn/media/2025/12/23/tai-750_1766479509684.jpg',
'https://cdn.galaxycine.vn/media/2026/2/27/tai_1772174772211.jpg',
8.6, 642, '2026-03-04', '2026-05-03',
'tai', 'https://www.youtube.com/watch?v=mhgzESUI2s0', 101, 'ACTIVE',
'Việt Nam', 'HK Film', 'Võ Thanh Hòa',
JSON_ARRAY('Tuấn Trần', 'Lê Giang', 'Huỳnh Đông'),
NOW(), NOW()),

(5, 'Project Y: Gái Ngoan Đổi Đời',
'Mất hết tất cả, hai chị em Mi Sun và Do Kyung đưa ra quyết định táo bạo nhất cuộc đời: Đánh cắp số vàng của băng đảng xã hội đen lớn nhất Hàn Quốc. Giờ đây, trên con đường mà cả hai không thể quay đầu nhìn lại, bỏ chạy hay đối đầu với những kẻ xem mạng người là cỏ rác.
',
18,
'https://cdn.galaxycine.vn/media/2026/3/16/project-y-750_1773635240433.jpg',
'https://cdn.galaxycine.vn/media/2026/3/16/project-y-500_1773635239444.jpg',
7.6, 12, '2026-03-27', '2026-05-31',
'project-y', 'https://www.youtube.com/watch?v=1a3E4HSBg-Y', 109, 'ACTIVE',
'Hàn Quốc', 'Lotte Entertainment', 'Kim Tae-yoon',
JSON_ARRAY('Ko Sung-hee', 'Kim Sejeong'),
NOW(), NOW());
-- -- show_time
-- Xóa data cũ nếu cần
-- TRUNCATE TABLE show_time;
ALTER TABLE show_time
MODIFY COLUMN start_time TIME NOT NULL,
MODIFY COLUMN end_time TIME NOT NULL;
INSERT INTO show_time (movie_id, room_id, release_date, start_time, end_time, status) VALUES

-- ==================== NGÀY 31/03/2026 ====================

-- movie 1 (118 phút) - hen-em-ngay-nhat-thuc - rate 7.7
(1,1,'2026-03-31','08:00:00','09:58:00','SCHEDULED'),
(1,1,'2026-03-31','10:30:00','12:28:00','SCHEDULED'),
(1,1,'2026-03-31','13:30:00','15:28:00','SCHEDULED'),
(1,1,'2026-03-31','16:30:00','18:28:00','SCHEDULED'),
(1,2,'2026-03-31','08:30:00','10:28:00','SCHEDULED'),
(1,2,'2026-03-31','11:00:00','12:58:00','SCHEDULED'),
(1,2,'2026-03-31','14:00:00','15:58:00','SCHEDULED'),
(1,3,'2026-03-31','09:00:00','10:58:00','SCHEDULED'),
(1,3,'2026-03-31','12:00:00','13:58:00','SCHEDULED'),
(1,3,'2026-03-31','15:00:00','16:58:00','SCHEDULED'),
(1,7,'2026-03-31','08:00:00','09:58:00','SCHEDULED'),
(1,7,'2026-03-31','11:00:00','12:58:00','SCHEDULED'),
(1,7,'2026-03-31','14:30:00','16:28:00','SCHEDULED'),
(1,8,'2026-03-31','09:30:00','11:28:00','SCHEDULED'),
(1,8,'2026-03-31','13:00:00','14:58:00','SCHEDULED'),
(1,8,'2026-03-31','16:00:00','17:58:00','SCHEDULED'),

-- movie 2 (105 phút) - hoppers - rate 8.8
(2,4,'2026-03-31','08:00:00','09:45:00','SCHEDULED'),
(2,4,'2026-03-31','10:30:00','12:15:00','SCHEDULED'),
(2,4,'2026-03-31','13:00:00','14:45:00','SCHEDULED'),
(2,4,'2026-03-31','15:30:00','17:15:00','SCHEDULED'),
(2,4,'2026-03-31','18:00:00','19:45:00','SCHEDULED'),
(2,5,'2026-03-31','08:30:00','10:15:00','SCHEDULED'),
(2,5,'2026-03-31','11:00:00','12:45:00','SCHEDULED'),
(2,5,'2026-03-31','13:30:00','15:15:00','SCHEDULED'),
(2,5,'2026-03-31','16:00:00','17:45:00','SCHEDULED'),
(2,5,'2026-03-31','18:30:00','20:15:00','SCHEDULED'),
(2,6,'2026-03-31','09:00:00','10:45:00','SCHEDULED'),
(2,6,'2026-03-31','11:30:00','13:15:00','SCHEDULED'),
(2,6,'2026-03-31','14:00:00','15:45:00','SCHEDULED'),
(2,6,'2026-03-31','16:30:00','18:15:00','SCHEDULED'),
(2,6,'2026-03-31','19:00:00','20:45:00','SCHEDULED'),
(2,9,'2026-03-31','08:00:00','09:45:00','SCHEDULED'),
(2,9,'2026-03-31','10:30:00','12:15:00','SCHEDULED'),
(2,9,'2026-03-31','13:00:00','14:45:00','SCHEDULED'),
(2,9,'2026-03-31','15:30:00','17:15:00','SCHEDULED'),
(2,10,'2026-03-31','09:00:00','10:45:00','SCHEDULED'),
(2,10,'2026-03-31','11:30:00','13:15:00','SCHEDULED'),
(2,10,'2026-03-31','14:00:00','15:45:00','SCHEDULED'),
(2,10,'2026-03-31','16:30:00','18:15:00','SCHEDULED'),
(2,11,'2026-03-31','08:30:00','10:15:00','SCHEDULED'),
(2,11,'2026-03-31','11:00:00','12:45:00','SCHEDULED'),
(2,11,'2026-03-31','13:30:00','15:15:00','SCHEDULED'),
(2,11,'2026-03-31','16:00:00','17:45:00','SCHEDULED'),
(2,11,'2026-03-31','18:30:00','20:15:00','SCHEDULED'),

-- movie 3 (111 phút) - another-world - rate 9.2
(3,16,'2026-03-31','08:00:00','09:51:00','SCHEDULED'),
(3,16,'2026-03-31','10:30:00','12:21:00','SCHEDULED'),
(3,16,'2026-03-31','13:00:00','14:51:00','SCHEDULED'),
(3,16,'2026-03-31','15:30:00','17:21:00','SCHEDULED'),
(3,16,'2026-03-31','18:00:00','19:51:00','SCHEDULED'),
(3,17,'2026-03-31','08:30:00','10:21:00','SCHEDULED'),
(3,17,'2026-03-31','11:00:00','12:51:00','SCHEDULED'),
(3,17,'2026-03-31','13:30:00','15:21:00','SCHEDULED'),
(3,17,'2026-03-31','16:00:00','17:51:00','SCHEDULED'),
(3,17,'2026-03-31','18:30:00','20:21:00','SCHEDULED'),
(3,18,'2026-03-31','09:00:00','10:51:00','SCHEDULED'),
(3,18,'2026-03-31','11:30:00','13:21:00','SCHEDULED'),
(3,18,'2026-03-31','14:00:00','15:51:00','SCHEDULED'),
(3,18,'2026-03-31','16:30:00','18:21:00','SCHEDULED'),
(3,19,'2026-03-31','08:00:00','09:51:00','SCHEDULED'),
(3,19,'2026-03-31','10:30:00','12:21:00','SCHEDULED'),
(3,19,'2026-03-31','13:00:00','14:51:00','SCHEDULED'),
(3,19,'2026-03-31','15:30:00','17:21:00','SCHEDULED'),
(3,19,'2026-03-31','18:00:00','19:51:00','SCHEDULED'),
(3,20,'2026-03-31','09:00:00','10:51:00','SCHEDULED'),
(3,20,'2026-03-31','11:30:00','13:21:00','SCHEDULED'),
(3,20,'2026-03-31','14:00:00','15:51:00','SCHEDULED'),
(3,20,'2026-03-31','16:30:00','18:21:00','SCHEDULED'),
(3,21,'2026-03-31','08:30:00','10:21:00','SCHEDULED'),
(3,21,'2026-03-31','11:00:00','12:51:00','SCHEDULED'),
(3,21,'2026-03-31','13:30:00','15:21:00','SCHEDULED'),
(3,21,'2026-03-31','16:00:00','17:51:00','SCHEDULED'),
(3,21,'2026-03-31','18:30:00','20:21:00','SCHEDULED'),

-- movie 4 (101 phút) - coraline - rate 9.2
(4,22,'2026-03-31','08:00:00','09:41:00','SCHEDULED'),
(4,22,'2026-03-31','10:30:00','12:11:00','SCHEDULED'),
(4,22,'2026-03-31','13:00:00','14:41:00','SCHEDULED'),
(4,22,'2026-03-31','15:30:00','17:11:00','SCHEDULED'),
(4,22,'2026-03-31','18:00:00','19:41:00','SCHEDULED'),
(4,23,'2026-03-31','09:00:00','10:41:00','SCHEDULED'),
(4,23,'2026-03-31','11:30:00','13:11:00','SCHEDULED'),
(4,23,'2026-03-31','14:00:00','15:41:00','SCHEDULED'),
(4,23,'2026-03-31','16:30:00','18:11:00','SCHEDULED'),
(4,23,'2026-03-31','19:00:00','20:41:00','SCHEDULED'),
(4,24,'2026-03-31','08:30:00','10:11:00','SCHEDULED'),
(4,24,'2026-03-31','11:00:00','12:41:00','SCHEDULED'),
(4,24,'2026-03-31','13:30:00','15:11:00','SCHEDULED'),
(4,24,'2026-03-31','16:00:00','17:41:00','SCHEDULED'),
(4,24,'2026-03-31','18:30:00','20:11:00','SCHEDULED'),
(4,25,'2026-03-31','08:00:00','09:41:00','SCHEDULED'),
(4,25,'2026-03-31','10:30:00','12:11:00','SCHEDULED'),
(4,25,'2026-03-31','13:00:00','14:41:00','SCHEDULED'),
(4,25,'2026-03-31','15:30:00','17:11:00','SCHEDULED'),
(4,26,'2026-03-31','09:00:00','10:41:00','SCHEDULED'),
(4,26,'2026-03-31','11:30:00','13:11:00','SCHEDULED'),
(4,26,'2026-03-31','14:00:00','15:41:00','SCHEDULED'),
(4,26,'2026-03-31','16:30:00','18:11:00','SCHEDULED'),

-- movie 5 (157 phút) - project-hail-mary - rate 8.7
(5,12,'2026-03-31','08:00:00','10:37:00','SCHEDULED'),
(5,12,'2026-03-31','11:30:00','14:07:00','SCHEDULED'),
(5,12,'2026-03-31','15:00:00','17:37:00','SCHEDULED'),
(5,12,'2026-03-31','18:30:00','21:07:00','SCHEDULED'),
(5,13,'2026-03-31','08:30:00','11:07:00','SCHEDULED'),
(5,13,'2026-03-31','12:00:00','14:37:00','SCHEDULED'),
(5,13,'2026-03-31','15:30:00','18:07:00','SCHEDULED'),
(5,14,'2026-03-31','09:00:00','11:37:00','SCHEDULED'),
(5,14,'2026-03-31','13:00:00','15:37:00','SCHEDULED'),
(5,14,'2026-03-31','16:30:00','19:07:00','SCHEDULED'),
(5,15,'2026-03-31','08:00:00','10:37:00','SCHEDULED'),
(5,15,'2026-03-31','11:30:00','14:07:00','SCHEDULED'),
(5,15,'2026-03-31','15:00:00','17:37:00','SCHEDULED'),
(5,15,'2026-03-31','18:30:00','21:07:00','SCHEDULED'),

-- movie 6 (86 phút) - danyang-wingit - rate 7.5
(6,1,'2026-03-31','19:00:00','20:26:00','SCHEDULED'),
(6,1,'2026-03-31','21:00:00','22:26:00','SCHEDULED'),
(6,2,'2026-03-31','18:30:00','19:56:00','SCHEDULED'),
(6,2,'2026-03-31','20:30:00','21:56:00','SCHEDULED'),
(6,7,'2026-03-31','19:00:00','20:26:00','SCHEDULED'),
(6,7,'2026-03-31','21:00:00','22:26:00','SCHEDULED'),

-- movie 7 (126 phút) - quy-nhap-trang-2 - rate 7.5
(7,3,'2026-03-31','08:00:00','10:06:00','SCHEDULED'),
(7,3,'2026-03-31','11:00:00','13:06:00','SCHEDULED'),
(7,3,'2026-03-31','14:00:00','16:06:00','SCHEDULED'),
(7,8,'2026-03-31','08:30:00','10:36:00','SCHEDULED'),
(7,8,'2026-03-31','11:30:00','13:36:00','SCHEDULED'),
(7,8,'2026-03-31','14:30:00','16:36:00','SCHEDULED'),
(7,9,'2026-03-31','09:00:00','11:06:00','SCHEDULED'),
(7,9,'2026-03-31','12:00:00','14:06:00','SCHEDULED'),
(7,9,'2026-03-31','15:00:00','17:06:00','SCHEDULED'),

-- movie 8 (127 phút) - 4-tigers - rate 7.7 (duration=0 dùng 127)
(8,4,'2026-03-31','19:00:00','21:07:00','SCHEDULED'),
(8,4,'2026-03-31','21:30:00','23:37:00','SCHEDULED'),
(8,5,'2026-03-31','19:30:00','21:37:00','SCHEDULED'),
(8,10,'2026-03-31','19:00:00','21:07:00','SCHEDULED'),
(8,10,'2026-03-31','21:30:00','23:37:00','SCHEDULED'),

-- movie 9 (127 phút) - kung-fu - rate 7.0
(9,2,'2026-03-31','19:00:00','21:07:00','SCHEDULED'),
(9,2,'2026-03-31','21:30:00','23:37:00','SCHEDULED'),
(9,11,'2026-03-31','19:30:00','21:37:00','SCHEDULED'),
(9,11,'2026-03-31','22:00:00','00:07:00','SCHEDULED'),

-- movie 10 (133 phút) - sentimental-value - rate 8.4
(10,6,'2026-03-31','08:00:00','10:13:00','SCHEDULED'),
(10,6,'2026-03-31','11:00:00','13:13:00','SCHEDULED'),
(10,6,'2026-03-31','14:00:00','16:13:00','SCHEDULED'),
(10,6,'2026-03-31','17:00:00','19:13:00','SCHEDULED'),
(10,11,'2026-03-31','08:30:00','10:43:00','SCHEDULED'),
(10,11,'2026-03-31','11:30:00','13:43:00','SCHEDULED'),
(10,11,'2026-03-31','14:30:00','16:43:00','SCHEDULED'),
(10,21,'2026-03-31','09:00:00','11:13:00','SCHEDULED'),
(10,21,'2026-03-31','12:00:00','14:13:00','SCHEDULED'),
(10,21,'2026-03-31','15:00:00','17:13:00','SCHEDULED'),

-- movie 11 (109 phút) - number-one - rate 8.5
(11,13,'2026-03-31','08:00:00','09:49:00','SCHEDULED'),
(11,13,'2026-03-31','10:30:00','12:19:00','SCHEDULED'),
(11,13,'2026-03-31','13:00:00','14:49:00','SCHEDULED'),
(11,13,'2026-03-31','15:30:00','17:19:00','SCHEDULED'),
(11,13,'2026-03-31','18:00:00','19:49:00','SCHEDULED'),
(11,14,'2026-03-31','09:00:00','10:49:00','SCHEDULED'),
(11,14,'2026-03-31','11:30:00','13:19:00','SCHEDULED'),
(11,14,'2026-03-31','14:00:00','15:49:00','SCHEDULED'),
(11,14,'2026-03-31','16:30:00','18:19:00','SCHEDULED'),
(11,15,'2026-03-31','08:30:00','10:19:00','SCHEDULED'),
(11,15,'2026-03-31','11:00:00','12:49:00','SCHEDULED'),
(11,15,'2026-03-31','13:30:00','15:19:00','SCHEDULED'),
(11,15,'2026-03-31','16:00:00','17:49:00','SCHEDULED'),

-- movie 12 (127 phút) - tho-oi - rate 9.3
(12,16,'2026-03-31','20:00:00','22:07:00','SCHEDULED'),
(12,17,'2026-03-31','20:30:00','22:37:00','SCHEDULED'),
(12,18,'2026-03-31','19:30:00','21:37:00','SCHEDULED'),
(12,19,'2026-03-31','20:00:00','22:07:00','SCHEDULED'),
(12,20,'2026-03-31','19:00:00','21:07:00','SCHEDULED'),
(12,22,'2026-03-31','20:30:00','22:37:00','SCHEDULED'),
(12,23,'2026-03-31','19:30:00','21:37:00','SCHEDULED'),
(12,24,'2026-03-31','20:00:00','22:07:00','SCHEDULED'),
(12,25,'2026-03-31','19:00:00','21:07:00','SCHEDULED'),
(12,26,'2026-03-31','20:30:00','22:37:00','SCHEDULED'),

-- movie 13 (101 phút) - tai - rate 8.6
(13,20,'2026-03-31','08:00:00','09:41:00','SCHEDULED'),
(13,20,'2026-03-31','10:30:00','12:11:00','SCHEDULED'),
(13,20,'2026-03-31','13:00:00','14:41:00','SCHEDULED'),
(13,20,'2026-03-31','15:30:00','17:11:00','SCHEDULED'),
(13,20,'2026-03-31','18:30:00','20:11:00','SCHEDULED'),
(13,22,'2026-03-31','08:30:00','10:11:00','SCHEDULED'),
(13,22,'2026-03-31','11:00:00','12:41:00','SCHEDULED'),
(13,22,'2026-03-31','13:30:00','15:11:00','SCHEDULED'),
(13,22,'2026-03-31','16:00:00','17:41:00','SCHEDULED'),
(13,23,'2026-03-31','09:00:00','10:41:00','SCHEDULED'),
(13,23,'2026-03-31','11:30:00','13:11:00','SCHEDULED'),
(13,23,'2026-03-31','14:00:00','15:41:00','SCHEDULED'),
(13,25,'2026-03-31','08:00:00','09:41:00','SCHEDULED'),
(13,25,'2026-03-31','10:30:00','12:11:00','SCHEDULED'),
(13,25,'2026-03-31','13:00:00','14:41:00','SCHEDULED'),
(13,25,'2026-03-31','16:00:00','17:41:00','SCHEDULED'),

-- movie 14 (109 phút) - project-y - rate 7.6
(14,24,'2026-03-31','08:00:00','09:49:00','SCHEDULED'),
(14,24,'2026-03-31','10:30:00','12:19:00','SCHEDULED'),
(14,24,'2026-03-31','13:30:00','15:19:00','SCHEDULED'),
(14,26,'2026-03-31','09:00:00','10:49:00','SCHEDULED'),
(14,26,'2026-03-31','12:00:00','13:49:00','SCHEDULED'),
(14,26,'2026-03-31','15:00:00','16:49:00','SCHEDULED'),

-- ==================== NGÀY 01/04/2026 ====================

(1,1,'2026-04-01','08:00:00','09:58:00','SCHEDULED'),
(1,1,'2026-04-01','10:30:00','12:28:00','SCHEDULED'),
(1,1,'2026-04-01','13:30:00','15:28:00','SCHEDULED'),
(1,1,'2026-04-01','16:30:00','18:28:00','SCHEDULED'),
(1,2,'2026-04-01','08:30:00','10:28:00','SCHEDULED'),
(1,2,'2026-04-01','11:00:00','12:58:00','SCHEDULED'),
(1,2,'2026-04-01','14:00:00','15:58:00','SCHEDULED'),
(1,3,'2026-04-01','09:00:00','10:58:00','SCHEDULED'),
(1,3,'2026-04-01','12:00:00','13:58:00','SCHEDULED'),
(1,3,'2026-04-01','15:00:00','16:58:00','SCHEDULED'),
(1,7,'2026-04-01','08:00:00','09:58:00','SCHEDULED'),
(1,7,'2026-04-01','11:00:00','12:58:00','SCHEDULED'),
(1,7,'2026-04-01','14:30:00','16:28:00','SCHEDULED'),
(1,8,'2026-04-01','09:30:00','11:28:00','SCHEDULED'),
(1,8,'2026-04-01','13:00:00','14:58:00','SCHEDULED'),
(2,4,'2026-04-01','08:00:00','09:45:00','SCHEDULED'),
(2,4,'2026-04-01','10:30:00','12:15:00','SCHEDULED'),
(2,4,'2026-04-01','13:00:00','14:45:00','SCHEDULED'),
(2,4,'2026-04-01','15:30:00','17:15:00','SCHEDULED'),
(2,4,'2026-04-01','18:00:00','19:45:00','SCHEDULED'),
(2,5,'2026-04-01','08:30:00','10:15:00','SCHEDULED'),
(2,5,'2026-04-01','11:00:00','12:45:00','SCHEDULED'),
(2,5,'2026-04-01','13:30:00','15:15:00','SCHEDULED'),
(2,5,'2026-04-01','16:00:00','17:45:00','SCHEDULED'),
(2,6,'2026-04-01','09:00:00','10:45:00','SCHEDULED'),
(2,6,'2026-04-01','11:30:00','13:15:00','SCHEDULED'),
(2,6,'2026-04-01','14:00:00','15:45:00','SCHEDULED'),
(2,6,'2026-04-01','16:30:00','18:15:00','SCHEDULED'),
(2,6,'2026-04-01','19:00:00','20:45:00','SCHEDULED'),
(2,9,'2026-04-01','08:00:00','09:45:00','SCHEDULED'),
(2,9,'2026-04-01','10:30:00','12:15:00','SCHEDULED'),
(2,9,'2026-04-01','13:00:00','14:45:00','SCHEDULED'),
(2,10,'2026-04-01','09:00:00','10:45:00','SCHEDULED'),
(2,10,'2026-04-01','11:30:00','13:15:00','SCHEDULED'),
(2,10,'2026-04-01','14:00:00','15:45:00','SCHEDULED'),
(2,11,'2026-04-01','08:30:00','10:15:00','SCHEDULED'),
(2,11,'2026-04-01','11:00:00','12:45:00','SCHEDULED'),
(2,11,'2026-04-01','13:30:00','15:15:00','SCHEDULED'),
(2,11,'2026-04-01','16:00:00','17:45:00','SCHEDULED'),
(3,16,'2026-04-01','08:00:00','09:51:00','SCHEDULED'),
(3,16,'2026-04-01','10:30:00','12:21:00','SCHEDULED'),
(3,16,'2026-04-01','13:00:00','14:51:00','SCHEDULED'),
(3,16,'2026-04-01','15:30:00','17:21:00','SCHEDULED'),
(3,16,'2026-04-01','18:00:00','19:51:00','SCHEDULED'),
(3,17,'2026-04-01','08:30:00','10:21:00','SCHEDULED'),
(3,17,'2026-04-01','11:00:00','12:51:00','SCHEDULED'),
(3,17,'2026-04-01','13:30:00','15:21:00','SCHEDULED'),
(3,17,'2026-04-01','16:00:00','17:51:00','SCHEDULED'),
(3,19,'2026-04-01','08:00:00','09:51:00','SCHEDULED'),
(3,19,'2026-04-01','10:30:00','12:21:00','SCHEDULED'),
(3,19,'2026-04-01','13:00:00','14:51:00','SCHEDULED'),
(3,19,'2026-04-01','15:30:00','17:21:00','SCHEDULED'),
(3,20,'2026-04-01','09:00:00','10:51:00','SCHEDULED'),
(3,20,'2026-04-01','11:30:00','13:21:00','SCHEDULED'),
(3,20,'2026-04-01','14:00:00','15:51:00','SCHEDULED'),
(3,21,'2026-04-01','08:30:00','10:21:00','SCHEDULED'),
(3,21,'2026-04-01','11:00:00','12:51:00','SCHEDULED'),
(3,21,'2026-04-01','13:30:00','15:21:00','SCHEDULED'),
(3,21,'2026-04-01','16:00:00','17:51:00','SCHEDULED'),
(4,22,'2026-04-01','08:00:00','09:41:00','SCHEDULED'),
(4,22,'2026-04-01','10:30:00','12:11:00','SCHEDULED'),
(4,22,'2026-04-01','13:00:00','14:41:00','SCHEDULED'),
(4,22,'2026-04-01','15:30:00','17:11:00','SCHEDULED'),
(4,22,'2026-04-01','18:00:00','19:41:00','SCHEDULED'),
(4,23,'2026-04-01','09:00:00','10:41:00','SCHEDULED'),
(4,23,'2026-04-01','11:30:00','13:11:00','SCHEDULED'),
(4,23,'2026-04-01','14:00:00','15:41:00','SCHEDULED'),
(4,23,'2026-04-01','16:30:00','18:11:00','SCHEDULED'),
(4,25,'2026-04-01','08:30:00','10:11:00','SCHEDULED'),
(4,25,'2026-04-01','11:00:00','12:41:00','SCHEDULED'),
(4,25,'2026-04-01','13:30:00','15:11:00','SCHEDULED'),
(4,26,'2026-04-01','09:00:00','10:41:00','SCHEDULED'),
(4,26,'2026-04-01','11:30:00','13:11:00','SCHEDULED'),
(4,26,'2026-04-01','14:00:00','15:41:00','SCHEDULED'),
(5,12,'2026-04-01','08:00:00','10:37:00','SCHEDULED'),
(5,12,'2026-04-01','11:30:00','14:07:00','SCHEDULED'),
(5,12,'2026-04-01','15:00:00','17:37:00','SCHEDULED'),
(5,13,'2026-04-01','08:30:00','11:07:00','SCHEDULED'),
(5,13,'2026-04-01','12:00:00','14:37:00','SCHEDULED'),
(5,13,'2026-04-01','15:30:00','18:07:00','SCHEDULED'),
(5,14,'2026-04-01','09:00:00','11:37:00','SCHEDULED'),
(5,14,'2026-04-01','13:00:00','15:37:00','SCHEDULED'),
(5,15,'2026-04-01','08:00:00','10:37:00','SCHEDULED'),
(5,15,'2026-04-01','11:30:00','14:07:00','SCHEDULED'),
(5,15,'2026-04-01','15:00:00','17:37:00','SCHEDULED'),
(6,1,'2026-04-01','19:00:00','20:26:00','SCHEDULED'),
(6,1,'2026-04-01','21:00:00','22:26:00','SCHEDULED'),
(6,2,'2026-04-01','18:30:00','19:56:00','SCHEDULED'),
(6,2,'2026-04-01','20:30:00','21:56:00','SCHEDULED'),
(7,3,'2026-04-01','08:00:00','10:06:00','SCHEDULED'),
(7,3,'2026-04-01','11:00:00','13:06:00','SCHEDULED'),
(7,3,'2026-04-01','14:00:00','16:06:00','SCHEDULED'),
(7,8,'2026-04-01','08:30:00','10:36:00','SCHEDULED'),
(7,8,'2026-04-01','11:30:00','13:36:00','SCHEDULED'),
(7,9,'2026-04-01','09:00:00','11:06:00','SCHEDULED'),
(7,9,'2026-04-01','12:00:00','14:06:00','SCHEDULED'),
(8,4,'2026-04-01','19:00:00','21:07:00','SCHEDULED'),
(8,5,'2026-04-01','19:30:00','21:37:00','SCHEDULED'),
(8,10,'2026-04-01','19:00:00','21:07:00','SCHEDULED'),
(9,2,'2026-04-01','19:00:00','21:07:00','SCHEDULED'),
(9,11,'2026-04-01','19:30:00','21:37:00','SCHEDULED'),
(10,6,'2026-04-01','08:00:00','10:13:00','SCHEDULED'),
(10,6,'2026-04-01','11:00:00','13:13:00','SCHEDULED'),
(10,6,'2026-04-01','14:00:00','16:13:00','SCHEDULED'),
(10,6,'2026-04-01','17:00:00','19:13:00','SCHEDULED'),
(10,11,'2026-04-01','08:30:00','10:43:00','SCHEDULED'),
(10,11,'2026-04-01','11:30:00','13:43:00','SCHEDULED'),
(10,21,'2026-04-01','09:00:00','11:13:00','SCHEDULED'),
(10,21,'2026-04-01','12:00:00','14:13:00','SCHEDULED'),
(11,13,'2026-04-01','08:00:00','09:49:00','SCHEDULED'),
(11,13,'2026-04-01','10:30:00','12:19:00','SCHEDULED'),
(11,13,'2026-04-01','13:00:00','14:49:00','SCHEDULED'),
(11,14,'2026-04-01','09:00:00','10:49:00','SCHEDULED'),
(11,14,'2026-04-01','11:30:00','13:19:00','SCHEDULED'),
(11,15,'2026-04-01','08:30:00','10:19:00','SCHEDULED'),
(11,15,'2026-04-01','11:00:00','12:49:00','SCHEDULED'),
(11,15,'2026-04-01','13:30:00','15:19:00','SCHEDULED'),
(12,16,'2026-04-01','08:00:00','10:07:00','SCHEDULED'),
(12,16,'2026-04-01','11:00:00','13:07:00','SCHEDULED'),
(12,16,'2026-04-01','14:00:00','16:07:00','SCHEDULED'),
(12,16,'2026-04-01','17:00:00','19:07:00','SCHEDULED'),
(12,16,'2026-04-01','20:00:00','22:07:00','SCHEDULED'),
(12,17,'2026-04-01','08:30:00','10:37:00','SCHEDULED'),
(12,17,'2026-04-01','11:30:00','13:37:00','SCHEDULED'),
(12,17,'2026-04-01','14:30:00','16:37:00','SCHEDULED'),
(12,17,'2026-04-01','17:30:00','19:37:00','SCHEDULED'),
(12,17,'2026-04-01','20:30:00','22:37:00','SCHEDULED'),
(12,18,'2026-04-01','09:00:00','11:07:00','SCHEDULED'),
(12,18,'2026-04-01','12:00:00','14:07:00','SCHEDULED'),
(12,18,'2026-04-01','15:00:00','17:07:00','SCHEDULED'),
(12,18,'2026-04-01','19:30:00','21:37:00','SCHEDULED'),
(12,19,'2026-04-01','08:00:00','10:07:00','SCHEDULED'),
(12,19,'2026-04-01','11:00:00','13:07:00','SCHEDULED'),
(12,19,'2026-04-01','14:00:00','16:07:00','SCHEDULED'),
(12,19,'2026-04-01','20:00:00','22:07:00','SCHEDULED'),
(12,22,'2026-04-01','08:30:00','10:37:00','SCHEDULED'),
(12,22,'2026-04-01','11:30:00','13:37:00','SCHEDULED'),
(12,22,'2026-04-01','14:30:00','16:37:00','SCHEDULED'),
(12,22,'2026-04-01','20:30:00','22:37:00','SCHEDULED'),
(12,24,'2026-04-01','09:00:00','11:07:00','SCHEDULED'),
(12,24,'2026-04-01','12:00:00','14:07:00','SCHEDULED'),
(12,24,'2026-04-01','20:00:00','22:07:00','SCHEDULED'),
(12,25,'2026-04-01','08:00:00','10:07:00','SCHEDULED'),
(12,25,'2026-04-01','11:00:00','13:07:00','SCHEDULED'),
(12,25,'2026-04-01','19:00:00','21:07:00','SCHEDULED'),
(13,20,'2026-04-01','08:00:00','09:41:00','SCHEDULED'),
(13,20,'2026-04-01','10:30:00','12:11:00','SCHEDULED'),
(13,20,'2026-04-01','13:00:00','14:41:00','SCHEDULED'),
(13,20,'2026-04-01','15:30:00','17:11:00','SCHEDULED'),
(13,22,'2026-04-01','08:30:00','10:11:00','SCHEDULED'),
(13,22,'2026-04-01','11:00:00','12:41:00','SCHEDULED'),
(13,22,'2026-04-01','13:30:00','15:11:00','SCHEDULED'),
(13,23,'2026-04-01','09:00:00','10:41:00','SCHEDULED'),
(13,23,'2026-04-01','11:30:00','13:11:00','SCHEDULED'),
(13,25,'2026-04-01','08:00:00','09:41:00','SCHEDULED'),
(13,25,'2026-04-01','10:30:00','12:11:00','SCHEDULED'),
(14,24,'2026-04-01','08:00:00','09:49:00','SCHEDULED'),
(14,24,'2026-04-01','10:30:00','12:19:00','SCHEDULED'),
(14,24,'2026-04-01','13:30:00','15:19:00','SCHEDULED'),
(14,26,'2026-04-01','09:00:00','10:49:00','SCHEDULED'),
(14,26,'2026-04-01','12:00:00','13:49:00','SCHEDULED'),

-- ==================== NGÀY 02/04/2026 ====================

(1,1,'2026-04-02','08:00:00','09:58:00','SCHEDULED'),
(1,1,'2026-04-02','10:30:00','12:28:00','SCHEDULED'),
(1,1,'2026-04-02','13:30:00','15:28:00','SCHEDULED'),
(1,2,'2026-04-02','08:30:00','10:28:00','SCHEDULED'),
(1,2,'2026-04-02','11:00:00','12:58:00','SCHEDULED'),
(1,7,'2026-04-02','09:00:00','10:58:00','SCHEDULED'),
(1,7,'2026-04-02','12:00:00','13:58:00','SCHEDULED'),
(2,4,'2026-04-02','08:00:00','09:45:00','SCHEDULED'),
(2,4,'2026-04-02','10:30:00','12:15:00','SCHEDULED'),
(2,4,'2026-04-02','13:00:00','14:45:00','SCHEDULED'),
(2,4,'2026-04-02','15:30:00','17:15:00','SCHEDULED'),
(2,5,'2026-04-02','08:30:00','10:15:00','SCHEDULED'),
(2,5,'2026-04-02','11:00:00','12:45:00','SCHEDULED'),
(2,5,'2026-04-02','13:30:00','15:15:00','SCHEDULED'),
(2,6,'2026-04-02','09:00:00','10:45:00','SCHEDULED'),
(2,6,'2026-04-02','11:30:00','13:15:00','SCHEDULED'),
(2,6,'2026-04-02','14:00:00','15:45:00','SCHEDULED'),
(2,6,'2026-04-02','16:30:00','18:15:00','SCHEDULED'),
(2,9,'2026-04-02','08:00:00','09:45:00','SCHEDULED'),
(2,9,'2026-04-02','10:30:00','12:15:00','SCHEDULED'),
(2,9,'2026-04-02','13:00:00','14:45:00','SCHEDULED'),
(2,10,'2026-04-02','09:00:00','10:45:00','SCHEDULED'),
(2,10,'2026-04-02','11:30:00','13:15:00','SCHEDULED'),
(2,11,'2026-04-02','08:30:00','10:15:00','SCHEDULED'),
(2,11,'2026-04-02','11:00:00','12:45:00','SCHEDULED'),
(2,11,'2026-04-02','13:30:00','15:15:00','SCHEDULED'),
(3,16,'2026-04-02','08:00:00','09:51:00','SCHEDULED'),
(3,16,'2026-04-02','10:30:00','12:21:00','SCHEDULED'),
(3,16,'2026-04-02','13:00:00','14:51:00','SCHEDULED'),
(3,16,'2026-04-02','15:30:00','17:21:00','SCHEDULED'),
(3,17,'2026-04-02','08:30:00','10:21:00','SCHEDULED'),
(3,17,'2026-04-02','11:00:00','12:51:00','SCHEDULED'),
(3,17,'2026-04-02','13:30:00','15:21:00','SCHEDULED'),
(3,19,'2026-04-02','08:00:00','09:51:00','SCHEDULED'),
(3,19,'2026-04-02','10:30:00','12:21:00','SCHEDULED'),
(3,19,'2026-04-02','13:00:00','14:51:00','SCHEDULED'),
(3,21,'2026-04-02','09:00:00','10:51:00','SCHEDULED'),
(3,21,'2026-04-02','11:30:00','13:21:00','SCHEDULED'),
(3,21,'2026-04-02','14:00:00','15:51:00','SCHEDULED'),
(4,22,'2026-04-02','08:00:00','09:41:00','SCHEDULED'),
(4,22,'2026-04-02','10:30:00','12:11:00','SCHEDULED'),
(4,22,'2026-04-02','13:00:00','14:41:00','SCHEDULED'),
(4,22,'2026-04-02','15:30:00','17:11:00','SCHEDULED'),
(4,23,'2026-04-02','09:00:00','10:41:00','SCHEDULED'),
(4,23,'2026-04-02','11:30:00','13:11:00','SCHEDULED'),
(4,25,'2026-04-02','08:30:00','10:11:00','SCHEDULED'),
(4,25,'2026-04-02','11:00:00','12:41:00','SCHEDULED'),
(5,12,'2026-04-02','08:00:00','10:37:00','SCHEDULED'),
(5,12,'2026-04-02','11:30:00','14:07:00','SCHEDULED'),
(5,13,'2026-04-02','09:00:00','11:37:00','SCHEDULED'),
(5,13,'2026-04-02','13:00:00','15:37:00','SCHEDULED'),
(5,14,'2026-04-02','08:30:00','11:07:00','SCHEDULED'),
(5,14,'2026-04-02','12:00:00','14:37:00','SCHEDULED'),
(7,3,'2026-04-02','08:00:00','10:06:00','SCHEDULED'),
(7,3,'2026-04-02','11:00:00','13:06:00','SCHEDULED'),
(7,8,'2026-04-02','09:00:00','11:06:00','SCHEDULED'),
(7,8,'2026-04-02','12:00:00','14:06:00','SCHEDULED'),
(10,6,'2026-04-02','08:00:00','10:13:00','SCHEDULED'),
(10,6,'2026-04-02','11:00:00','13:13:00','SCHEDULED'),
(10,6,'2026-04-02','14:00:00','16:13:00','SCHEDULED'),
(10,21,'2026-04-02','09:00:00','11:13:00','SCHEDULED'),
(10,21,'2026-04-02','12:00:00','14:13:00','SCHEDULED'),
(11,13,'2026-04-02','08:00:00','09:49:00','SCHEDULED'),
(11,13,'2026-04-02','10:30:00','12:19:00','SCHEDULED'),
(11,13,'2026-04-02','13:00:00','14:49:00','SCHEDULED'),
(11,14,'2026-04-02','09:00:00','10:49:00','SCHEDULED'),
(11,14,'2026-04-02','11:30:00','13:19:00','SCHEDULED'),
(11,15,'2026-04-02','08:30:00','10:19:00','SCHEDULED'),
(11,15,'2026-04-02','13:30:00','15:19:00','SCHEDULED'),
(12,16,'2026-04-02','08:00:00','10:07:00','SCHEDULED'),
(12,16,'2026-04-02','11:00:00','13:07:00','SCHEDULED'),
(12,16,'2026-04-02','14:00:00','16:07:00','SCHEDULED'),
(12,16,'2026-04-02','17:00:00','19:07:00','SCHEDULED'),
(12,16,'2026-04-02','20:00:00','22:07:00','SCHEDULED'),
(12,17,'2026-04-02','08:30:00','10:37:00','SCHEDULED'),
(12,17,'2026-04-02','11:30:00','13:37:00','SCHEDULED'),
(12,17,'2026-04-02','14:30:00','16:37:00','SCHEDULED'),
(12,17,'2026-04-02','20:30:00','22:37:00','SCHEDULED'),
(12,18,'2026-04-02','09:00:00','11:07:00','SCHEDULED'),
(12,18,'2026-04-02','12:00:00','14:07:00','SCHEDULED'),
(12,18,'2026-04-02','19:30:00','21:37:00','SCHEDULED'),
(12,19,'2026-04-02','08:00:00','10:07:00','SCHEDULED'),
(12,19,'2026-04-02','11:00:00','13:07:00','SCHEDULED'),
(12,19,'2026-04-02','20:00:00','22:07:00','SCHEDULED'),
(12,22,'2026-04-02','08:30:00','10:37:00','SCHEDULED'),
(12,22,'2026-04-02','14:30:00','16:37:00','SCHEDULED'),
(12,22,'2026-04-02','20:30:00','22:37:00','SCHEDULED'),
(12,25,'2026-04-02','08:00:00','10:07:00','SCHEDULED'),
(12,25,'2026-04-02','19:00:00','21:07:00','SCHEDULED'),
(13,20,'2026-04-02','08:00:00','09:41:00','SCHEDULED'),
(13,20,'2026-04-02','10:30:00','12:11:00','SCHEDULED'),
(13,20,'2026-04-02','13:00:00','14:41:00','SCHEDULED'),
(13,22,'2026-04-02','08:30:00','10:11:00','SCHEDULED'),
(13,22,'2026-04-02','11:00:00','12:41:00','SCHEDULED'),
(13,25,'2026-04-02','09:00:00','10:41:00','SCHEDULED'),
(13,25,'2026-04-02','11:30:00','13:11:00','SCHEDULED'),
(14,24,'2026-04-02','08:00:00','09:49:00','SCHEDULED'),
(14,24,'2026-04-02','10:30:00','12:19:00','SCHEDULED'),
(14,26,'2026-04-02','09:00:00','10:49:00','SCHEDULED'),

-- ==================== NGÀY 03/04/2026 ====================

(2,4,'2026-04-03','08:00:00','09:45:00','SCHEDULED'),
(2,4,'2026-04-03','10:30:00','12:15:00','SCHEDULED'),
(2,4,'2026-04-03','13:00:00','14:45:00','SCHEDULED'),
(2,4,'2026-04-03','15:30:00','17:15:00','SCHEDULED'),
(2,4,'2026-04-03','18:00:00','19:45:00','SCHEDULED'),
(2,5,'2026-04-03','08:30:00','10:15:00','SCHEDULED'),
(2,5,'2026-04-03','11:00:00','12:45:00','SCHEDULED'),
(2,5,'2026-04-03','13:30:00','15:15:00','SCHEDULED'),
(2,6,'2026-04-03','09:00:00','10:45:00','SCHEDULED'),
(2,6,'2026-04-03','11:30:00','13:15:00','SCHEDULED'),
(2,6,'2026-04-03','14:00:00','15:45:00','SCHEDULED'),
(2,9,'2026-04-03','08:00:00','09:45:00','SCHEDULED'),
(2,9,'2026-04-03','10:30:00','12:15:00','SCHEDULED'),
(2,10,'2026-04-03','09:00:00','10:45:00','SCHEDULED'),
(2,10,'2026-04-03','11:30:00','13:15:00','SCHEDULED'),
(2,11,'2026-04-03','08:30:00','10:15:00','SCHEDULED'),
(2,11,'2026-04-03','11:00:00','12:45:00','SCHEDULED'),
(3,16,'2026-04-03','08:00:00','09:51:00','SCHEDULED'),
(3,16,'2026-04-03','10:30:00','12:21:00','SCHEDULED'),
(3,16,'2026-04-03','13:00:00','14:51:00','SCHEDULED'),
(3,16,'2026-04-03','15:30:00','17:21:00','SCHEDULED'),
(3,17,'2026-04-03','08:30:00','10:21:00','SCHEDULED'),
(3,17,'2026-04-03','11:00:00','12:51:00','SCHEDULED'),
(3,19,'2026-04-03','08:00:00','09:51:00','SCHEDULED'),
(3,19,'2026-04-03','10:30:00','12:21:00','SCHEDULED'),
(3,21,'2026-04-03','09:00:00','10:51:00','SCHEDULED'),
(3,21,'2026-04-03','11:30:00','13:21:00','SCHEDULED'),
(4,22,'2026-04-03','08:00:00','09:41:00','SCHEDULED'),
(4,22,'2026-04-03','10:30:00','12:11:00','SCHEDULED'),
(4,22,'2026-04-03','13:00:00','14:41:00','SCHEDULED'),
(4,22,'2026-04-03','15:30:00','17:11:00','SCHEDULED'),
(4,23,'2026-04-03','09:00:00','10:41:00','SCHEDULED'),
(4,23,'2026-04-03','11:30:00','13:11:00','SCHEDULED'),
(4,25,'2026-04-03','08:30:00','10:11:00','SCHEDULED'),
(4,25,'2026-04-03','11:00:00','12:41:00','SCHEDULED'),
(10,6,'2026-04-03','08:00:00','10:13:00','SCHEDULED'),
(10,6,'2026-04-03','11:00:00','13:13:00','SCHEDULED'),
(10,21,'2026-04-03','09:00:00','11:13:00','SCHEDULED'),
(11,13,'2026-04-03','08:00:00','09:49:00','SCHEDULED'),
(11,13,'2026-04-03','10:30:00','12:19:00','SCHEDULED'),
(11,14,'2026-04-03','09:00:00','10:49:00','SCHEDULED'),
(11,15,'2026-04-03','08:30:00','10:19:00','SCHEDULED'),
(12,16,'2026-04-03','08:00:00','10:07:00','SCHEDULED'),
(12,16,'2026-04-03','11:00:00','13:07:00','SCHEDULED'),
(12,16,'2026-04-03','14:00:00','16:07:00','SCHEDULED'),
(12,16,'2026-04-03','20:00:00','22:07:00','SCHEDULED'),
(12,17,'2026-04-03','08:30:00','10:37:00','SCHEDULED'),
(12,17,'2026-04-03','11:30:00','13:37:00','SCHEDULED'),
(12,17,'2026-04-03','20:30:00','22:37:00','SCHEDULED'),
(12,18,'2026-04-03','09:00:00','11:07:00','SCHEDULED'),
(12,18,'2026-04-03','19:30:00','21:37:00','SCHEDULED'),
(12,19,'2026-04-03','08:00:00','10:07:00','SCHEDULED'),
(12,19,'2026-04-03','20:00:00','22:07:00','SCHEDULED'),
(12,22,'2026-04-03','08:30:00','10:37:00','SCHEDULED'),
(12,22,'2026-04-03','20:30:00','22:37:00','SCHEDULED'),
(12,25,'2026-04-03','19:00:00','21:07:00','SCHEDULED'),
(13,20,'2026-04-03','08:00:00','09:41:00','SCHEDULED'),
(13,20,'2026-04-03','10:30:00','12:11:00','SCHEDULED'),
(13,22,'2026-04-03','08:30:00','10:11:00','SCHEDULED'),
(13,25,'2026-04-03','09:00:00','10:41:00','SCHEDULED'),

-- ==================== NGÀY 04/04/2026 ====================

(2,4,'2026-04-04','08:00:00','09:45:00','SCHEDULED'),
(2,4,'2026-04-04','10:30:00','12:15:00','SCHEDULED'),
(2,4,'2026-04-04','13:00:00','14:45:00','SCHEDULED'),
(2,4,'2026-04-04','15:30:00','17:15:00','SCHEDULED'),
(2,5,'2026-04-04','08:30:00','10:15:00','SCHEDULED'),
(2,5,'2026-04-04','11:00:00','12:45:00','SCHEDULED'),
(2,6,'2026-04-04','09:00:00','10:45:00','SCHEDULED'),
(2,6,'2026-04-04','11:30:00','13:15:00','SCHEDULED'),
(2,9,'2026-04-04','08:00:00','09:45:00','SCHEDULED'),
(2,9,'2026-04-04','10:30:00','12:15:00','SCHEDULED'),
(2,11,'2026-04-04','08:30:00','10:15:00','SCHEDULED'),
(2,11,'2026-04-04','11:00:00','12:45:00','SCHEDULED'),
(3,16,'2026-04-04','08:00:00','09:51:00','SCHEDULED'),
(3,16,'2026-04-04','10:30:00','12:21:00','SCHEDULED'),
(3,16,'2026-04-04','13:00:00','14:51:00','SCHEDULED'),
(3,17,'2026-04-04','08:30:00','10:21:00','SCHEDULED'),
(3,17,'2026-04-04','11:00:00','12:51:00','SCHEDULED'),
(3,19,'2026-04-04','08:00:00','09:51:00','SCHEDULED'),
(3,19,'2026-04-04','10:30:00','12:21:00','SCHEDULED'),
(3,21,'2026-04-04','09:00:00','10:51:00','SCHEDULED'),
(4,22,'2026-04-04','08:00:00','09:41:00','SCHEDULED'),
(4,22,'2026-04-04','10:30:00','12:11:00','SCHEDULED'),
(4,22,'2026-04-04','13:00:00','14:41:00','SCHEDULED'),
(4,23,'2026-04-04','09:00:00','10:41:00','SCHEDULED'),
(4,23,'2026-04-04','11:30:00','13:11:00','SCHEDULED'),
(4,25,'2026-04-04','08:30:00','10:11:00','SCHEDULED'),
(12,16,'2026-04-04','08:00:00','10:07:00','SCHEDULED'),
(12,16,'2026-04-04','11:00:00','13:07:00','SCHEDULED'),
(12,16,'2026-04-04','14:00:00','16:07:00','SCHEDULED'),
(12,16,'2026-04-04','20:00:00','22:07:00','SCHEDULED'),
(12,17,'2026-04-04','08:30:00','10:37:00','SCHEDULED'),
(12,17,'2026-04-04','11:30:00','13:37:00','SCHEDULED'),
(12,17,'2026-04-04','20:30:00','22:37:00','SCHEDULED'),
(12,18,'2026-04-04','09:00:00','11:07:00','SCHEDULED'),
(12,18,'2026-04-04','19:30:00','21:37:00','SCHEDULED'),
(12,19,'2026-04-04','08:00:00','10:07:00','SCHEDULED'),
(12,19,'2026-04-04','20:00:00','22:07:00','SCHEDULED'),
(12,22,'2026-04-04','20:30:00','22:37:00','SCHEDULED'),
(12,25,'2026-04-04','19:00:00','21:07:00','SCHEDULED'),
(13,20,'2026-04-04','08:00:00','09:41:00','SCHEDULED'),
(13,20,'2026-04-04','10:30:00','12:11:00','SCHEDULED'),
(13,22,'2026-04-04','08:30:00','10:11:00','SCHEDULED'),
(11,13,'2026-04-04','08:00:00','09:49:00','SCHEDULED'),
(11,13,'2026-04-04','10:30:00','12:19:00','SCHEDULED'),
(11,14,'2026-04-04','09:00:00','10:49:00','SCHEDULED'),
(11,15,'2026-04-04','08:30:00','10:19:00','SCHEDULED');







-- show_time_seat: tạo tồn kho ghế theo từng suất chiếu
INSERT INTO show_time_seat (
    show_time_id,
    seat_id,
    status,
    hold_expires_at,
    order_id,
    created_at,
    updated_at
)
SELECT
    st.show_time_id,
    s.seat_id,
    CASE
        WHEN s.status = 'ACTIVE' THEN 'AVAILABLE'
        ELSE 'BLOCKED'
        END AS status,
    NULL,
    NULL,
    NOW(),
    NOW()
FROM show_time st
JOIN seat s ON s.room_id = st.room_id;
-- price_ticket
INSERT INTO price_ticket (room_type_id, seat_type_id, price, status) VALUES
-- 2D + Thường
(1, 1, 85000,  'ACTIVE'),
-- 2D + VIP
(1, 2, 110000, 'ACTIVE'),
-- 2D + Đôi
(1, 3, 200000, 'ACTIVE'),
-- 3D + Thường
(2, 1, 105000, 'ACTIVE'),
-- 3D + VIP
(2, 2, 130000, 'ACTIVE'),
-- 3D + Đôi
(2, 3, 240000, 'ACTIVE'),
-- IMAX + Thường
(3, 1, 150000, 'ACTIVE'),
-- IMAX + VIP
(3, 2, 200000, 'ACTIVE');
-- combo
INSERT INTO combo (combo_name, image, description, price, status) VALUES
('Combo 1',        '1.png', 'Bắp vừa + Pepsi lớn',                           125000, 'AVAILABLE'),
('Combo 2',        '2.png', 'Bắp lớn + 2 Pepsi lớn',                         200000, 'AVAILABLE'),
('Combo 3',        '3.png', 'Bắp caramel + 7UP + Nachos',                    175000, 'AVAILABLE'),
('Combo Đôi',      '4.png', '2 Bắp vừa + 2 Pepsi lớn',                       230000, 'AVAILABLE'),
('Combo Gia Đình', '5.jfif', '1 Bắp lớn + 2 Pepsi + Nachos + Gummy',          310000, 'AVAILABLE'),
('Combo Nhẹ',      '6.jfif', 'Bắp nhỏ + Nước suối',                            80000, 'AVAILABLE');


-- order
-- INSERT INTO orders (user_id, ticket_total, combo_total, discount_amount, total_amount, hold_expires_at, note, created_at, updated_at, status) VALUES
-- (3, 170000, 125000, 10000, 285000, NULL,                  'Voucher WELCOME10',              '2026-03-25 10:30:00', '2026-03-25 10:35:00', 'PAID'),
-- (4, 170000, 230000,     0, 400000, NULL,                  NULL,                             '2026-03-25 13:00:00', '2026-03-25 13:05:00', 'PAID'),
-- (5, 150000,      0,     0, 150000, NULL,                  NULL,                             '2026-03-25 16:45:00', '2026-03-25 16:50:00', 'PAID'),
-- (6,      0, 125000,     0, 125000, '2026-03-25 20:15:00', 'Đang giữ đơn chờ thanh toán',     '2026-03-25 20:00:00', '2026-03-25 20:00:00', 'AWAITING_PAYMENT'),
-- (7, 380000, 310000, 180000, 510000, NULL,                 'Khuyến mãi cuối tuần',           '2026-03-26 09:15:00', '2026-03-26 09:20:00', 'PAID'),
-- (1,  95000,      0,     0,  95000, NULL,                  'Đơn đã huỷ theo yêu cầu khách',  '2026-03-26 14:00:00', '2026-03-26 14:30:00', 'CANCELLED'),
-- (3, 190000, 175000, 25000, 340000, NULL,                  'Áp mã giảm 25k',                 '2026-03-27 10:00:00', '2026-03-27 10:05:00', 'PAID'),
-- (4, 255000,      0, 80000, 175000, '2026-03-28 15:45:00', 'Giữ ghế 15 phút',                '2026-03-28 15:30:00', '2026-03-28 15:30:00', 'HOLDING');

-- order
INSERT INTO orders (
    user_id,
    show_time_id,
    ticket_total,
    combo_total,
    discount_amount,
    total_amount,
    net_amount,
    expired_at,
    created_at,
    updated_at,
    status
) VALUES
      (3, 1, 170000, 125000, 10000, 285000, 285000, '2026-03-25 10:35:00', '2026-03-25 10:30:00', '2026-03-25 10:35:00', 'PAID'),
      (4, 1, 170000, 230000,     0, 400000, 400000, '2026-03-25 13:05:00', '2026-03-25 13:00:00', '2026-03-25 13:05:00', 'PAID'),
      (5, 2, 150000,      0,     0, 150000, 150000, '2026-03-25 16:50:00', '2026-03-25 16:45:00', '2026-03-25 16:50:00', 'PAID'),
      (6, 5,      0, 125000,     0, 125000, 125000, '2026-03-25 20:05:00', '2026-03-25 20:00:00', '2026-03-25 20:00:00', 'PAYING'),
      (7, 3, 380000, 310000, 180000, 510000, 510000, '2026-03-26 09:20:00', '2026-03-26 09:15:00', '2026-03-26 09:20:00', 'PAID'),
      (1, 5,  95000,      0,     0,  95000,  95000, '2026-03-26 14:05:00', '2026-03-26 14:00:00', '2026-03-26 14:30:00', 'CANCELLED'),
      (3, 6, 190000, 175000, 25000, 340000, 340000, '2026-03-27 10:05:00', '2026-03-27 10:00:00', '2026-03-27 10:05:00', 'PAID'),
      (4, 8, 255000,      0, 80000, 175000, 175000, '2026-03-28 15:35:00', '2026-03-28 15:30:00', '2026-03-28 15:30:00', 'CANCELLED'),
      (4, 9, 255000,      0, 80000, 175000, 175000, DATE_ADD(NOW(), INTERVAL 5 MINUTE), NOW(), NOW(), 'PAYING');

-- orderCombo
INSERT INTO order_combo (order_id, combo_id, quantity, unit_price, status) VALUES
(1, 1, 1, 125000, 'ACTIVE'),
(2, 4, 1, 230000, 'ACTIVE'),
(4, 1, 1, 125000, 'ACTIVE'),
(5, 5, 1, 310000, 'ACTIVE'),
(7, 3, 1, 175000, 'ACTIVE');

-- payment
-- INSERT INTO payment (order_id, amount, method, transaction_id, provider_response, paid_at, created_at, updated_at, status) VALUES
-- (1, 285000, 'E_WALLET',    'MOMO-20260325-001',  '{"provider":"MOMO","result":"SUCCESS"}',    '2026-03-25 10:35:00', '2026-03-25 10:33:00', '2026-03-25 10:35:00', 'SUCCESS'),
-- (2, 400000, 'QR_CODE',     'VNPAY-20260325-001', '{"provider":"VNPAY","result":"SUCCESS"}',   '2026-03-25 13:05:00', '2026-03-25 13:02:00', '2026-03-25 13:05:00', 'SUCCESS'),
-- (3, 150000, 'E_WALLET',    'ZALO-20260325-001',  '{"provider":"ZALOPAY","result":"SUCCESS"}', '2026-03-25 16:50:00', '2026-03-25 16:47:00', '2026-03-25 16:50:00', 'SUCCESS'),
-- (5, 510000, 'E_WALLET',    'MOMO-20260326-001',  '{"provider":"MOMO","result":"SUCCESS"}',    '2026-03-26 09:20:00', '2026-03-26 09:17:00', '2026-03-26 09:20:00', 'SUCCESS'),
-- (7, 340000, 'CREDIT_CARD', 'CARD-20260327-001',  '{"provider":"CARD","result":"SUCCESS"}',    '2026-03-27 10:05:00', '2026-03-27 10:02:00', '2026-03-27 10:05:00', 'SUCCESS');

-- payment
INSERT INTO payment (
    order_id,
    amount,
    method,
    bank_code,
    bank_transaction_no,
    transaction_id,
    info_transaction,
    paid_at,
    created_at,
    updated_at,
    status
) VALUES
-- MOMO
(1, 285000.00, 'E_WALLET', 'MOMO', 'MOMO-TXN-001', 'MOMO-20260325-001',
 'Thanh toán qua MOMO',
 '2026-03-25 10:35:00', '2026-03-25 10:33:00', '2026-03-25 10:35:00', 'SUCCESS'),

-- VNPAY (bank transfer)
(2, 400000.00, 'BANK_TRANSFER', 'VNPAY', 'VNPAY-TXN-001', 'VNPAY-20260325-001',
 'Thanh toán qua VNPAY',
 '2026-03-25 13:05:00', '2026-03-25 13:02:00', '2026-03-25 13:05:00', 'SUCCESS'),

-- ZALOPAY
(3, 150000.00, 'E_WALLET', 'ZALOPAY', 'ZALO-TXN-001', 'ZALO-20260325-001',
 'Thanh toán qua ZALOPAY',
 '2026-03-25 16:50:00', '2026-03-25 16:47:00', '2026-03-25 16:50:00', 'SUCCESS'),

-- MOMO lần 2
(5, 510000.00, 'E_WALLET', 'MOMO', 'MOMO-TXN-002', 'MOMO-20260326-001',
 'Thanh toán qua MOMO',
 '2026-03-26 09:20:00', '2026-03-26 09:17:00', '2026-03-26 09:20:00', 'SUCCESS'),

-- Thanh toán thẻ
(7, 340000.00, 'CARD', 'VISA', 'CARD-TXN-001', 'CARD-20260327-001',
 'Thanh toán bằng thẻ',
 '2026-03-27 10:05:00', '2026-03-27 10:02:00', '2026-03-27 10:05:00', 'SUCCESS');

-- ticket
INSERT INTO ticket (
    order_id,
    show_id,
    seat_id,
    price_ticket_id,
    unit_price,
    qr_code,
    checked_in_at,
    status,
    created_at,
    updated_at
) 
SELECT
    src.order_id,
    src.show_id,
    src.seat_id,
    pt.price_ticket_id,
    pt.price AS unit_price,
    src.qr_code,
    src.checked_in_at,
    'ACTIVE' AS status,
    src.created_at,
    src.updated_at
FROM (
    SELECT 1 AS order_id, 1 AS show_id, 73 AS seat_id, 'QR-20260325-001' AS qr_code, NULL AS checked_in_at, '2026-03-25 10:31:00' AS created_at, '2026-03-25 10:31:00' AS updated_at
    UNION ALL SELECT 1, 1, 74, 'QR-20260325-002', NULL, '2026-03-25 10:31:00', '2026-03-25 10:31:00'
    UNION ALL SELECT 2, 1, 1, 'QR-20260325-003', NULL, '2026-03-25 13:01:00', '2026-03-25 13:01:00'
    UNION ALL SELECT 2, 1, 2, 'QR-20260325-004', NULL, '2026-03-25 13:01:00', '2026-03-25 13:01:00'
    UNION ALL SELECT 3, 2, 25, 'QR-20260325-005', NULL, '2026-03-25 16:46:00', '2026-03-25 16:46:00'
    UNION ALL SELECT 3, 2, 26, 'QR-20260325-006', NULL, '2026-03-25 16:46:00', '2026-03-25 16:46:00'
    UNION ALL SELECT 5, 3, 85, 'QR-20260325-007', NULL, '2026-03-26 09:16:00', '2026-03-26 09:16:00'
    UNION ALL SELECT 5, 3, 86, 'QR-20260325-008', NULL, '2026-03-26 09:16:00', '2026-03-26 09:16:00'
    UNION ALL SELECT 5, 4, 120, 'QR-20260325-009', NULL, '2026-03-26 09:17:00', '2026-03-26 09:17:00'
    UNION ALL SELECT 5, 4, 121, 'QR-20260325-010', NULL, '2026-03-26 09:17:00', '2026-03-26 09:17:00'
    UNION ALL SELECT 7, 6, 49, 'QR-20260325-012', NULL, '2026-03-27 10:01:00', '2026-03-27 10:01:00'
    UNION ALL SELECT 7, 7, 140, 'QR-20260325-013', NULL, '2026-03-27 10:01:00', '2026-03-27 10:01:00'
    UNION ALL SELECT 9, 9, 3, 'QR-20260328-014', NULL, '2026-03-28 15:31:00', '2026-03-28 15:31:00'
    UNION ALL SELECT 9, 9, 13, 'QR-20260328-015', NULL, '2026-03-28 15:31:00', '2026-03-28 15:31:00'
    UNION ALL SELECT 9, 9, 14, 'QR-20260328-016', NULL, '2026-03-28 15:31:00', '2026-03-28 15:31:00'
) src
JOIN show_time st ON st.show_time_id = src.show_id
JOIN room r ON r.room_id = st.room_id
JOIN seat s ON s.seat_id = src.seat_id AND s.room_id = st.room_id
JOIN price_ticket pt ON pt.room_type_id = r.room_type_id AND pt.seat_type_id = s.seat_type_id;
update show_time
set show_time.release_date = now(6),
    show_time.status = 'SELLING';

UPDATE show_time_seat sts
JOIN ticket t ON t.show_id = sts.show_time_id AND t.seat_id = sts.seat_id
JOIN orders o ON o.order_id = t.order_id
SET sts.status = 'SOLD',
    sts.order_id = t.order_id,
    sts.hold_expires_at = NULL,
    sts.updated_at = NOW()
WHERE o.status = 'PAID'
  AND t.status = 'ACTIVE';

UPDATE show_time_seat
SET status = 'HELD',
    order_id = 9,
    hold_expires_at = DATE_ADD(NOW(), INTERVAL 5 MINUTE),
    updated_at = NOW()
WHERE show_time_id = 9
  AND seat_id IN (3, 13, 14);



