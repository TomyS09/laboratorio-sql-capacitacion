-- ============================================================
-- BANCO PROGRESIVO DE EJERCICIOS JOIN
-- ============================================================

-- NIVEL 1: dos tablas dentro de abastecimiento_sql
SELECT
    pp.codigo_producto,
    pp.codigo_proveedor,
    pr.nombre_proveedor,
    pp.costo_compra
FROM abastecimiento_sql.productos_proveedor pp
INNER JOIN abastecimiento_sql.proveedores pr
    ON pp.codigo_proveedor = pr.codigo_proveedor
LIMIT 20;

-- NIVEL 2: JOIN entre dos bases
SELECT
    p.codigo_producto,
    p.descripcion_producto,
    pp.codigo_proveedor,
    pp.costo_compra
FROM capacitacion_sql.productos p
INNER JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto
LIMIT 20;

-- NIVEL 3: LEFT JOIN y faltantes
SELECT
    p.codigo_producto,
    p.descripcion_producto
FROM capacitacion_sql.productos p
LEFT JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto
WHERE pp.codigo_producto IS NULL;

-- NIVEL 4: tres tablas
SELECT
    p.codigo_producto,
    p.descripcion_producto,
    pr.nombre_proveedor,
    pp.costo_compra,
    pp.plazo_entrega_dias
FROM capacitacion_sql.productos p
INNER JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto
INNER JOIN abastecimiento_sql.proveedores pr
    ON pp.codigo_proveedor = pr.codigo_proveedor
LIMIT 20;

-- NIVEL 5: cuatro tablas y dos bases
SELECT
    oc.id_orden,
    oc.fecha_orden,
    p.descripcion_producto,
    pr.nombre_proveedor,
    s.nombre_sucursal,
    oc.cantidad_solicitada,
    oc.valor_orden
FROM abastecimiento_sql.ordenes_compra oc
INNER JOIN capacitacion_sql.productos p
    ON oc.codigo_producto = p.codigo_producto
INNER JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
INNER JOIN capacitacion_sql.sucursales s
    ON oc.codigo_sucursal = s.codigo_sucursal
LIMIT 20;

-- NIVEL 6: JOIN + filtros
SELECT
    pr.nombre_proveedor,
    p.categoria,
    oc.estado_orden,
    oc.valor_orden
FROM abastecimiento_sql.ordenes_compra oc
INNER JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
INNER JOIN capacitacion_sql.productos p
    ON oc.codigo_producto = p.codigo_producto
WHERE YEAR(oc.fecha_orden) = 2026
  AND oc.estado_orden = 'RECIBIDA'
  AND p.categoria IN ('MEDICAMENTOS', 'CUIDADO PERSONAL')
LIMIT 50;

-- NIVEL 7: JOIN + GROUP BY
SELECT
    pr.provincia,
    p.categoria,
    COUNT(*) AS numero_ordenes,
    SUM(oc.cantidad_solicitada) AS cantidad_solicitada,
    ROUND(SUM(oc.valor_orden), 2) AS valor_total
FROM abastecimiento_sql.ordenes_compra oc
INNER JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
INNER JOIN capacitacion_sql.productos p
    ON oc.codigo_producto = p.codigo_producto
WHERE oc.estado_orden = 'RECIBIDA'
GROUP BY pr.provincia, p.categoria
ORDER BY valor_total DESC;

-- NIVEL 8: GROUP BY + HAVING
SELECT
    pr.nombre_proveedor,
    COUNT(*) AS numero_ordenes,
    ROUND(AVG(oc.valor_orden), 2) AS valor_promedio
FROM abastecimiento_sql.ordenes_compra oc
INNER JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
GROUP BY pr.nombre_proveedor
HAVING COUNT(*) >= 100
ORDER BY numero_ordenes DESC;

-- NIVEL 9: validar multiplicación de filas en relación uno-a-muchos
SELECT COUNT(*) AS productos
FROM capacitacion_sql.productos;

SELECT COUNT(*) AS filas_despues_join
FROM capacitacion_sql.productos p
INNER JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto;

-- NIVEL 10: caso integrado
SELECT
    s.provincia AS provincia_sucursal,
    p.categoria,
    pr.nombre_proveedor,
    COUNT(*) AS numero_ordenes,
    SUM(oc.cantidad_solicitada) AS cantidad_total,
    ROUND(AVG(oc.costo_unitario), 2) AS costo_promedio,
    ROUND(SUM(oc.valor_orden), 2) AS valor_total
FROM abastecimiento_sql.ordenes_compra oc
INNER JOIN capacitacion_sql.productos p
    ON oc.codigo_producto = p.codigo_producto
INNER JOIN capacitacion_sql.sucursales s
    ON oc.codigo_sucursal = s.codigo_sucursal
INNER JOIN abastecimiento_sql.proveedores pr
    ON oc.codigo_proveedor = pr.codigo_proveedor
WHERE YEAR(oc.fecha_orden) = 2026
  AND oc.estado_orden = 'RECIBIDA'
GROUP BY
    s.provincia,
    p.categoria,
    pr.nombre_proveedor
HAVING COUNT(*) >= 5
ORDER BY valor_total DESC;
