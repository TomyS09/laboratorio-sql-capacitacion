-- ============================================================
-- PRUEBAS RÁPIDAS DE LAS CUATRO SESIONES
-- ============================================================

-- SESIÓN 1
SELECT
    codigo_producto,
    descripcion_producto,
    categoria,
    precio_unitario
FROM capacitacion_sql.productos
WHERE estado_producto = 'ACTIVO'
ORDER BY precio_unitario DESC
LIMIT 10;

-- SESIÓN 2
SELECT
    codigo_producto,
    UPPER(TRIM(descripcion_producto)) AS producto,
    categoria,
    precio_unitario,
    stock_actual,
    precio_unitario * stock_actual AS valor_inventario,
    CASE
        WHEN stock_actual IS NULL THEN 'SIN INFORMACIÓN'
        WHEN stock_actual = 0 THEN 'SIN STOCK'
        WHEN stock_actual < 20 THEN 'STOCK BAJO'
        WHEN stock_actual < 100 THEN 'STOCK MEDIO'
        ELSE 'STOCK ALTO'
    END AS clasificacion_stock
FROM capacitacion_sql.productos
WHERE estado_producto = 'ACTIVO'
  AND categoria IN ('MEDICAMENTOS', 'CUIDADO PERSONAL')
  AND precio_unitario BETWEEN 5 AND 50
ORDER BY valor_inventario DESC
LIMIT 20;

-- SESIÓN 3
SELECT
    categoria,
    COUNT(*) AS numero_registros,
    COUNT(DISTINCT codigo_producto) AS productos_distintos,
    SUM(stock_actual) AS stock_total,
    ROUND(AVG(stock_actual), 2) AS stock_promedio,
    MIN(stock_actual) AS stock_minimo,
    MAX(stock_actual) AS stock_maximo,
    MAX(stock_actual) - MIN(stock_actual) AS rango_stock,
    ROUND(STDDEV_POP(stock_actual), 2) AS desviacion_stock
FROM capacitacion_sql.productos
WHERE estado_producto = 'ACTIVO'
GROUP BY categoria
HAVING COUNT(*) >= 5
ORDER BY stock_total DESC;

-- SESIÓN 4
SELECT
    s.provincia,
    p.categoria,
    COUNT(*) AS numero_movimientos,
    COUNT(DISTINCT m.codigo_producto) AS productos_distintos,
    SUM(m.cantidad) AS cantidad_total,
    ROUND(AVG(m.cantidad), 2) AS cantidad_promedio
FROM capacitacion_sql.movimientos m
INNER JOIN capacitacion_sql.productos p
    ON m.codigo_producto = p.codigo_producto
INNER JOIN capacitacion_sql.sucursales s
    ON m.codigo_sucursal = s.codigo_sucursal
WHERE YEAR(m.fecha_movimiento) = 2026
  AND m.estado_movimiento = 'VALIDO'
GROUP BY s.provincia, p.categoria
HAVING COUNT(*) >= 5
ORDER BY cantidad_total DESC;
