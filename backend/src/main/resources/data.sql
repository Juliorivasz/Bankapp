--------------------------------------------
-- 1. ROLES
--------------------------------------------
INSERT IGNORE INTO rol (id_rol, nombre_rol) VALUES (1, 'ADMIN');
INSERT IGNORE INTO rol (id_rol, nombre_rol) VALUES (2, 'CLIENTE');

--------------------------------------------
-- 2. TIPOS DE MONEDA
-- Usamos INSERT IGNORE para evitar errores si ya existen (por ID o por Nombre único)
--------------------------------------------
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (1, 'Dolar Estadounidense', 'USD');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (2, 'Peso Mexicano', 'MXN');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (3, 'Peso Argentino', 'ARS');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (4, 'Peso Chileno', 'CLP');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (5, 'Peso Colombiano', 'COP');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (6, 'Sol Peruano', 'PEN');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (7, 'Real Brasileño', 'BRL');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (8, 'Dolar Canadiense', 'CAD');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (9, 'Dolar Jamaiquino', 'JMD');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (10, 'Boliviano', 'BOB');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (11, 'Quetzal Guatemalteco', 'GTQ');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (12, 'Lempira Hondureña', 'HNL');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (13, 'Balboa Panameño', 'PAB');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (14, 'Dolar de Trinidad y Tobago', 'TTD');
INSERT IGNORE INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (15, 'Euro', 'EUR');

--------------------------------------------
-- 3. PAÍSES DE AMÉRICA
--------------------------------------------
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (1, 'Argentina', 'AR');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (2, 'Brasil', 'BR');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (3, 'Canada', 'CA');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (4, 'Chile', 'CL');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (5, 'Colombia', 'CO');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (6, 'Ecuador', 'EC');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (7, 'Estados Unidos', 'US');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (8, 'Mexico', 'MX');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (9, 'Peru', 'PE');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (10, 'Uruguay', 'UY');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (11, 'Venezuela', 'VE');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (12, 'Bolivia', 'BO');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (13, 'Paraguay', 'PY');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (14, 'Guatemala', 'GT');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (15, 'Honduras', 'HN');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (16, 'Nicaragua', 'NI');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (17, 'Panama', 'PA');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (18, 'El Salvador', 'SV');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (19, 'Costa Rica', 'CR');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (20, 'Cuba', 'CU');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (21, 'Jamaica', 'JM');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (22, 'Haiti', 'HT');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (23, 'Republica Dominicana', 'DO');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (24, 'Bahamas', 'BS');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (25, 'Barbados', 'BB');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (26, 'Belice', 'BZ');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (27, 'Guyana', 'GY');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (28, 'Surinam', 'SR');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (29, 'Trinidad y Tobago', 'TT');
INSERT IGNORE INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (30, 'Granada', 'GD');

--------------------------------------------
-- 4. RELACIÓN PAÍS-MONEDA
-- Usamos SELECT para buscar el ID dinámicamente según el Símbolo
--------------------------------------------

-- Argentina (ARS)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 1, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'ARS';
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 1, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Brasil (BRL)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 2, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'BRL';

-- Canada (CAD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 3, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'CAD';

-- Chile (CLP)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 4, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'CLP';

-- Colombia (COP)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 5, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'COP';

-- Ecuador (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 6, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Estados Unidos (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 7, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Mexico (MXN)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 8, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'MXN';

-- Peru (PEN)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 9, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'PEN';

-- Uruguay (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 10, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Venezuela (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 11, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Bolivia (BOB)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 12, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'BOB';

-- Paraguay (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 13, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Guatemala (GTQ)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 14, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'GTQ';

-- Honduras (HNL)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 15, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'HNL';

-- Nicaragua (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 16, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Panama (PAB, USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 17, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'PAB';
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 17, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- El Salvador (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 18, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Costa Rica (USD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 19, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'USD';

-- Jamaica (JMD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 21, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'JMD';

-- Trinidad y Tobago (TTD)
INSERT IGNORE INTO pais_moneda (id_pais, id_moneda, es_principal) SELECT 29, id_moneda, TRUE FROM tipomoneda WHERE simbolo_moneda = 'TTD';