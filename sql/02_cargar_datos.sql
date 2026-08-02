-- ============================================================
-- SCRIPT ADMINISTRATIVO: CARGA DE DATOS
-- En el portal, los archivos ya fueron registrados por JavaScript.
-- ============================================================

INSERT INTO capacitacion_sql.productos
SELECT
    CAST(codigo_producto AS STRING),
    CAST(descripcion_producto AS STRING),
    CAST(categoria AS STRING),
    CAST(laboratorio AS STRING),
    TRY_CAST(precio_unitario AS DECIMAL(12, 2)),
    TRY_CAST(stock_actual AS INT),
    CAST(estado_producto AS STRING)
FROM read_csv_auto(
    'productos.csv.gz',
    header = true,
    all_varchar = true,
    nullstr = '__NULL__'
);

INSERT INTO capacitacion_sql.sucursales
SELECT
    CAST(codigo_sucursal AS STRING),
    CAST(nombre_sucursal AS STRING),
    CAST(ciudad AS STRING),
    CAST(provincia AS STRING),
    CAST(tipo_sucursal AS STRING),
    CAST(estado_sucursal AS STRING)
FROM read_csv_auto(
    'sucursales.csv.gz',
    header = true,
    all_varchar = true,
    nullstr = '__NULL__'
);

INSERT INTO capacitacion_sql.movimientos
SELECT
    TRY_CAST(id_movimiento AS BIGINT),
    TRY_CAST(fecha_movimiento AS TIMESTAMP),
    CAST(codigo_producto AS STRING),
    CAST(codigo_sucursal AS STRING),
    CAST(tipo_movimiento AS STRING),
    TRY_CAST(cantidad AS INT),
    TRY_CAST(valor AS DECIMAL(16, 2)),
    CAST(estado_movimiento AS STRING),
    CAST(observacion AS STRING)
FROM read_csv_auto(
    'movimientos.csv.gz',
    header = true,
    all_varchar = true,
    nullstr = '__NULL__'
);
