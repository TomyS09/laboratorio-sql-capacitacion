-- ============================================================
-- VALIDACIONES DE LA SEGUNDA BASE Y CRUCES ENTRE BASES
-- ============================================================

-- Conteos base
SELECT COUNT(*) AS proveedores
FROM abastecimiento_sql.proveedores;

SELECT COUNT(*) AS relaciones_producto_proveedor
FROM abastecimiento_sql.productos_proveedor;

SELECT COUNT(*) AS ordenes_compra
FROM abastecimiento_sql.ordenes_compra;

-- Productos sin proveedor
SELECT COUNT(*) AS productos_sin_proveedor
FROM capacitacion_sql.productos p
LEFT JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto
WHERE pp.codigo_producto IS NULL;

-- Productos con más de un proveedor
SELECT
    codigo_producto,
    COUNT(*) AS numero_proveedores
FROM abastecimiento_sql.productos_proveedor
GROUP BY codigo_producto
HAVING COUNT(*) > 1
ORDER BY numero_proveedores DESC;

-- Proveedores sin órdenes
SELECT
    pr.codigo_proveedor,
    pr.nombre_proveedor
FROM abastecimiento_sql.proveedores pr
LEFT JOIN abastecimiento_sql.ordenes_compra oc
    ON pr.codigo_proveedor = oc.codigo_proveedor
WHERE oc.id_orden IS NULL;

-- Órdenes con producto inexistente
SELECT COUNT(*) AS ordenes_sin_producto
FROM abastecimiento_sql.ordenes_compra oc
LEFT JOIN capacitacion_sql.productos p
    ON oc.codigo_producto = p.codigo_producto
WHERE p.codigo_producto IS NULL;

-- Órdenes con proveedor inexistente
SELECT COUNT(*) AS ordenes_sin_proveedor
FROM abastecimiento_sql.ordenes_compra oc
LEFT JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
WHERE pr.codigo_proveedor IS NULL;
