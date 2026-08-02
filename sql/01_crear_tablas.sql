-- ============================================================
-- SCRIPT ADMINISTRATIVO: CREACIÓN DE TABLAS
-- Motor del laboratorio: DuckDB-Wasm
-- Nombres y consultas de clase: compatibles con Apache Impala
-- ============================================================

CREATE SCHEMA IF NOT EXISTS capacitacion_sql;

DROP TABLE IF EXISTS capacitacion_sql.movimientos;
DROP TABLE IF EXISTS capacitacion_sql.productos;
DROP TABLE IF EXISTS capacitacion_sql.sucursales;

CREATE TABLE capacitacion_sql.productos (
    codigo_producto       STRING,
    descripcion_producto  STRING,
    categoria             STRING,
    laboratorio           STRING,
    precio_unitario       DECIMAL(12, 2),
    stock_actual          INT,
    estado_producto       STRING
);

CREATE TABLE capacitacion_sql.sucursales (
    codigo_sucursal     STRING,
    nombre_sucursal     STRING,
    ciudad              STRING,
    provincia           STRING,
    tipo_sucursal       STRING,
    estado_sucursal     STRING
);

CREATE TABLE capacitacion_sql.movimientos (
    id_movimiento       BIGINT,
    fecha_movimiento    TIMESTAMP,
    codigo_producto     STRING,
    codigo_sucursal     STRING,
    tipo_movimiento     STRING,
    cantidad            INT,
    valor               DECIMAL(16, 2),
    estado_movimiento   STRING,
    observacion         STRING
);

-- Equivalencia para la función complementaria de Impala.
CREATE OR REPLACE MACRO APPX_MEDIAN(x) AS approx_quantile(x, 0.5);
