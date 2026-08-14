# Fase 3 - Dos bases lógicas

## Qué cambia

El laboratorio ahora carga dos esquemas:

- `capacitacion_sql`: productos, sucursales y movimientos.
- `abastecimiento_sql`: proveedores, productos_proveedor y ordenes_compra.

La primera base no fue modificada.

## Nuevos volúmenes

- proveedores: 150
- productos_proveedor: 5,000
- ordenes_compra: 80,000

## Casos controlados para JOIN

- productos sin proveedor: 120
- productos con más de un proveedor: 1539
- proveedores sin órdenes: 15
- órdenes con producto inexistente: 300
- órdenes con proveedor inexistente: 150
- costos NULL en productos_proveedor: 100
- órdenes con costo/valor NULL: 120

## Cómo publicar

1. Haz una copia de seguridad del repositorio actual o descarga su ZIP.
2. Descomprime este paquete.
3. Sube TODO el contenido a la raíz de `laboratorio-sql-capacitacion`.
4. GitHub debe reemplazar `app.js`, `index.html` y `styles.css`, y añadir los tres archivos nuevos en `data/`.
5. Confirma el commit en `main`.
6. Espera a que `Actions -> pages build and deployment` termine en verde.
7. Abre el sitio en incógnito o usa Ctrl+F5.

## Prueba mínima

```sql
SELECT *
FROM abastecimiento_sql.proveedores
LIMIT 10;
```

```sql
SELECT
    p.codigo_producto,
    p.descripcion_producto,
    pr.nombre_proveedor
FROM capacitacion_sql.productos p
INNER JOIN abastecimiento_sql.productos_proveedor pp
    ON p.codigo_producto = pp.codigo_producto
INNER JOIN abastecimiento_sql.proveedores pr
    ON pp.codigo_proveedor = pr.codigo_proveedor
LIMIT 20;
```

## Nota

El portal sigue siendo de solo lectura para participantes.


## Casos adicionales para reutilizar la Sesión 2

La tabla `abastecimiento_sql.proveedores` incluye ahora casos controlados de limpieza de texto:

- 12 nombres de proveedor con espacios externos.
- 10 tipos de proveedor escritos en minúsculas.
- 8 tipos de proveedor con espacios externos.
- 5 tipos de proveedor `NULL`.
- 5 tipos de proveedor vacíos.
- 4 estados de proveedor `NULL`.
- 4 estados de proveedor vacíos.

Las llaves (`codigo_proveedor`, `codigo_producto`, `codigo_sucursal`) no se ensuciaron, para que los ejercicios de JOIN sigan siendo predecibles.

Pruebas sugeridas:

```sql
SELECT
    codigo_proveedor,
    nombre_proveedor,
    TRIM(nombre_proveedor) AS nombre_limpio
FROM abastecimiento_sql.proveedores
WHERE nombre_proveedor <> TRIM(nombre_proveedor);
```

```sql
SELECT
    codigo_proveedor,
    tipo_proveedor
FROM abastecimiento_sql.proveedores
WHERE tipo_proveedor IS NULL
   OR TRIM(tipo_proveedor) = '';
```

```sql
SELECT
    codigo_proveedor,
    tipo_proveedor,
    UPPER(TRIM(tipo_proveedor)) AS tipo_normalizado
FROM abastecimiento_sql.proveedores
LIMIT 30;
```
