CREATE TABLE IF NOT EXISTS rol (
    id_rol BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre_usuario VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_rol BIGINT,
    estado_cuenta VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_baja TIMESTAMP NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE IF NOT EXISTS perfil_usuario (
    id_perfil BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_usuario BIGINT UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    numero_telefono VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS documento (
    id_documento BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_perfil BIGINT NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    numero_documento VARCHAR(100) NOT NULL,
    fecha_expiracion DATE,
    estado_verificacion VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha_subida TIMESTAMP NOT NULL,
    FOREIGN KEY (id_perfil) REFERENCES perfil_usuario(id_perfil)
);

CREATE TABLE IF NOT EXISTS direccion (
    id_direccion BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_perfil BIGINT NOT NULL,
    calle VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255) NOT NULL,
    codigo_postal VARCHAR(20) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    es_principal BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_perfil) REFERENCES perfil_usuario(id_perfil)
);

CREATE TABLE IF NOT EXISTS tipomoneda (
    id_moneda BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre_moneda VARCHAR(255) UNIQUE NOT NULL,
    simbolo VARCHAR(10) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS wallet (
    id_wallet BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_usuario BIGINT NOT NULL,
    id_moneda BIGINT NOT NULL,
    balance DECIMAL(18, 8) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_moneda) REFERENCES tipomoneda(id_moneda)
);

CREATE TABLE IF NOT EXISTS transaccion (
    id_transaccion BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_wallet BIGINT,
    monto DECIMAL(18, 8) NOT NULL,
    estado_transaccion VARCHAR(50) NOT NULL,
    fecha_transaccion TIMESTAMP NOT NULL,
    descripcion VARCHAR(255),
    FOREIGN KEY (id_wallet) REFERENCES wallet(id_wallet)
);

CREATE TABLE IF NOT EXISTS soporte (
    id_solicitud BIGINT PRIMARY KEY AUTO_INCREMENT,
    id_usuario BIGINT NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);