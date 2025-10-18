--------------------------------------------
-- 1. ROLES
--------------------------------------------
INSERT INTO rol (id_rol, nombre_rol) VALUES (1, 'ADMIN') ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol);
INSERT INTO rol (id_rol, nombre_rol) VALUES (2, 'CLIENTE') ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol);

--------------------------------------------
-- 2. TIPOS DE MONEDA (Una sentencia por moneda)
--------------------------------------------
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (1, 'Dólar Estadounidense', 'USD') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (2, 'Bitcoin', 'BTC') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (3, 'Peso Argentino', 'ARS') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (4, 'Peso Mexicano', 'MXN') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (5, 'Peso Chileno', 'CLP') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (6, 'Peso Colombiano', 'COP') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_monEDA=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (7, 'Sol Peruano', 'PEN') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (8, 'Real Brasileño', 'BRL') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (9, 'Dólar Canadiense', 'CAD') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (10, 'Dólar Jamaiquino', 'JMD') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (11, 'Boliviano', 'BOB') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (12, 'Quetzal Guatemalteco', 'GTQ') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (13, 'Lempira Hondureña', 'HNL') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (14, 'Balboa Panameño', 'PAB') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (15, 'Dólar de Trinidad y Tobago', 'TTD') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);
INSERT INTO tipomoneda (id_moneda, nombre_moneda, simbolo_moneda) VALUES (16, 'Euro', 'EUR') ON DUPLICATE KEY UPDATE nombre_moneda=VALUES(nombre_moneda), simbolo_moneda=VALUES(simbolo_moneda);

--------------------------------------------
-- 3. PAÍSES DE AMÉRICA (Una sentencia por país)
--------------------------------------------
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (1, 'Argentina', 'AR') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (2, 'Brasil', 'BR') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (3, 'Canadá', 'CA') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (4, 'Chile', 'CL') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (5, 'Colombia', 'CO') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (6, 'Ecuador', 'EC') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (7, 'Estados Unidos', 'US') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (8, 'México', 'MX') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (9, 'Perú', 'PE') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (10, 'Uruguay', 'UY') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (11, 'Venezuela', 'VE') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (12, 'Bolivia', 'BO') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (13, 'Paraguay', 'PY') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (14, 'Guatemala', 'GT') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (15, 'Honduras', 'HN') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (16, 'Nicaragua', 'NI') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (17, 'Panamá', 'PA') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (18, 'El Salvador', 'SV') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (19, 'Costa Rica', 'CR') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (20, 'Cuba', 'CU') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (21, 'Jamaica', 'JM') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (22, 'Haití', 'HT') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (23, 'República Dominicana', 'DO') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (24, 'Bahamas', 'BS') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (25, 'Barbados', 'BB') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (26, 'Belice', 'BZ') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (27, 'Guyana', 'GY') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (28, 'Surinam', 'SR') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (29, 'Trinidad y Tobago', 'TT') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);
INSERT INTO pais (id_pais, nombre_pais, codigo_iso) VALUES (30, 'Granada', 'GD') ON DUPLICATE KEY UPDATE nombre_pais=VALUES(nombre_pais);

--------------------------------------------
-- 4. RELACIÓN PAÍS-MONEDA (Una sentencia por relación)
--------------------------------------------
-- Argentina (id_pais=1)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (1, 3, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- ARS
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (1, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Por ser común)

-- Brasil (id_pais=2)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (2, 8, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- BRL

-- Canadá (id_pais=3)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (3, 9, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- CAD

-- Chile (id_pais=4)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (4, 5, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- CLP

-- Colombia (id_pais=5)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (5, 6, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- COP

-- Ecuador (id_pais=6)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (6, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD

-- Estados Unidos (id_pais=7)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (7, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD

-- México (id_pais=8)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (8, 4, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- MXN

-- Perú (id_pais=9)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (9, 7, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- PEN

-- Uruguay (id_pais=10)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (10, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Común)

-- Venezuela (id_pais=11)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (11, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Común)

-- Bolivia (id_pais=12)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (12, 11, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- BOB

-- Paraguay (id_pais=13)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (13, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Común)

-- Guatemala (id_pais=14)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (14, 12, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- GTQ

-- Honduras (id_pais=15)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (15, 13, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- HNL

-- Nicaragua (id_pais=16)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (16, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Común)

-- Panamá (id_pais=17)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (17, 14, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- PAB
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (17, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD

-- El Salvador (id_pais=18)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (18, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD

-- Costa Rica (id_pais=19)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (19, 1, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- USD (Común)

-- Jamaica (id_pais=21)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (21, 10, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- JMD

-- Trinidad y Tobago (id_pais=29)
INSERT INTO pais_moneda (id_pais, id_moneda, es_principal) VALUES (29, 15, TRUE) ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal); -- TTD