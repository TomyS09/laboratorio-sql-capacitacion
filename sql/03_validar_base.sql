-- ============================================================
-- VALIDACIÓN DEL ENTORNO
-- ============================================================

SELECT 'productos' AS tabla, COUNT(*) AS registros
FROM capacitacion_sql.productos
UNION ALL
SELECT 'sucursales', COUNT(*)
FROM capacitacion_sql.sucursales
UNION ALL
SELECT 'movimientos', COUNT(*)
FROM capacitacion_sql.movimientos;

SELECT codigo_producto, COUNT(*) AS repeticiones
FROM capacitacion_sql.productos
GROUP BY codigo_producto
HAVING COUNT(*) > 1;

SELECT codigo_sucursal, COUNT(*) AS repeticiones
FROM capacitacion_sql.sucursales
GROUP BY codigo_sucursal
HAVING COUNT(*) > 1;

SELECT id_movimiento, COUNT(*) AS repeticiones
FROM capacitacion_sql.movimientos
GROUP BY id_movimiento
HAVING COUNT(*) > 1;

SELECT
    COUNT(*) AS productos,
    SUM(CASE WHEN laboratorio IS NULL THEN 1 ELSE 0 END) AS laboratorio_nulo,
    SUM(CASE WHEN laboratorio IS NOT NULL AND TRIM(laboratorio) = '' THEN 1 ELSE 0 END) AS laboratorio_vacio,
    SUM(CASE WHEN precio_unitario IS NULL THEN 1 ELSE 0 END) AS precio_nulo,
    SUM(CASE WHEN stock_actual IS NULL THEN 1 ELSE 0 END) AS stock_nulo,
    SUM(CASE WHEN stock_actual = 0 THEN 1 ELSE 0 END) AS stock_cero
FROM capacitacion_sql.productos;

SELECT
    COUNT(*) AS movimientos_sin_producto,
    COUNT(DISTINCT m.codigo_producto) AS codigos_sin_producto
FROM capacitacion_sql.movimientos m
LEFT JOIN capacitacion_sql.productos p
    ON m.codigo_producto = p.codigo_producto
WHERE p.codigo_producto IS NULL;

SELECT
    COUNT(*) AS movimientos_sin_sucursal,
    COUNT(DISTINCT m.codigo_sucursal) AS codigos_sin_sucursal
FROM capacitacion_sql.movimientos m
LEFT JOIN capacitacion_sql.sucursales s
    ON m.codigo_sucursal = s.codigo_sucursal
WHERE s.codigo_sucursal IS NULL;

SELECT COUNT(*) AS productos_sin_movimientos
FROM capacitacion_sql.productos p
LEFT JOIN capacitacion_sql.movimientos m
    ON p.codigo_producto = m.codigo_producto
WHERE m.id_movimiento IS NULL;

SELECT COUNT(*) AS sucursales_sin_movimientos
FROM capacitacion_sql.sucursales s
LEFT JOIN capacitacion_sql.movimientos m
    ON s.codigo_sucursal = m.codigo_sucursal
WHERE m.id_movimiento IS NULL;

SELECT
    fecha_movimiento,
    codigo_producto,
    codigo_sucursal,
    tipo_movimiento,
    cantidad,
    valor,
    estado_movimiento,
    observacion,
    COUNT(*) AS repeticiones
FROM capacitacion_sql.movimientos
GROUP BY
    fecha_movimiento,
    codigo_producto,
    codigo_sucursal,
    tipo_movimiento,
    cantidad,
    valor,
    estado_movimiento,
    observacion
HAVING COUNT(*) > 1
ORDER BY repeticiones DESC;
