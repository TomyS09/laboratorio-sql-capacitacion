-- ============================================================
-- SEGUNDA BASE LÓGICA PARA CAPACITACIÓN
-- abastecimiento_sql
-- Referencia de estructura administrativa
-- ============================================================

CREATE SCHEMA IF NOT EXISTS abastecimiento_sql;

CREATE TABLE abastecimiento_sql.proveedores (
    codigo_proveedor STRING,
    nombre_proveedor STRING,
    ciudad STRING,
    provincia STRING,
    tipo_proveedor STRING,
    dias_credito INT,
    estado_proveedor STRING
);

CREATE TABLE abastecimiento_sql.productos_proveedor (
    codigo_producto STRING,
    codigo_proveedor STRING,
    costo_compra DECIMAL(12,2),
    plazo_entrega_dias INT,
    descuento_porcentaje DECIMAL(6,2),
    proveedor_principal STRING,
    estado_relacion STRING
);

CREATE TABLE abastecimiento_sql.ordenes_compra (
    id_orden BIGINT,
    fecha_orden TIMESTAMP,
    codigo_proveedor STRING,
    codigo_producto STRING,
    codigo_sucursal STRING,
    cantidad_solicitada INT,
    costo_unitario DECIMAL(12,2),
    valor_orden DECIMAL(16,2),
    estado_orden STRING,
    fecha_entrega TIMESTAMP
);
