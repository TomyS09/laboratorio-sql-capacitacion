-- ============================================================
-- PRÁCTICAS DE SESIÓN 2 SOBRE abastecimiento_sql
-- Limpieza, NULL, CASE, funciones de texto, números y fechas
-- ============================================================

-- 1. Espacios externos
SELECT
    codigo_proveedor,
    nombre_proveedor,
    TRIM(nombre_proveedor) AS nombre_limpio
FROM abastecimiento_sql.proveedores
WHERE nombre_proveedor <> TRIM(nombre_proveedor);

-- 2. NULL y vacío
SELECT
    codigo_proveedor,
    tipo_proveedor
FROM abastecimiento_sql.proveedores
WHERE tipo_proveedor IS NULL
   OR TRIM(tipo_proveedor) = '';

-- 3. Normalización de texto
SELECT
    codigo_proveedor,
    tipo_proveedor,
    UPPER(TRIM(tipo_proveedor)) AS tipo_normalizado
FROM abastecimiento_sql.proveedores
LIMIT 30;

-- 4. CASE con crédito
SELECT
    codigo_proveedor,
    nombre_proveedor,
    dias_credito,
    CASE
        WHEN dias_credito = 0 THEN 'CONTADO'
        WHEN dias_credito <= 30 THEN 'CREDITO CORTO'
        ELSE 'CREDITO EXTENDIDO'
    END AS clasificacion_credito
FROM abastecimiento_sql.proveedores;

-- 5. DECIMAL y ROUND
SELECT
    codigo_producto,
    codigo_proveedor,
    costo_compra,
    descuento_porcentaje,
    ROUND(costo_compra * (1 - descuento_porcentaje / 100), 2) AS costo_neto
FROM abastecimiento_sql.productos_proveedor
LIMIT 30;

-- 6. Fechas
SELECT
    id_orden,
    fecha_orden,
    YEAR(fecha_orden) AS anio,
    MONTH(fecha_orden) AS mes,
    DAY(fecha_orden) AS dia,
    fecha_entrega
FROM abastecimiento_sql.ordenes_compra
LIMIT 30;

-- 7. NULL de fecha
SELECT
    id_orden,
    fecha_orden,
    fecha_entrega,
    CASE
        WHEN fecha_entrega IS NULL THEN 'SIN ENTREGA'
        ELSE 'CON ENTREGA'
    END AS estado_fecha_entrega
FROM abastecimiento_sql.ordenes_compra
LIMIT 50;
