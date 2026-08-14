# Diccionario de datos

## capacitacion_sql.productos

| Campo | Tipo | Descripción |
|---|---|---|
| codigo_producto | STRING | Código ficticio de 10 dígitos con ceros iniciales. |
| descripcion_producto | STRING | Descripción; contiene diferencias controladas de mayúsculas y espacios. |
| categoria | STRING | Categoría analítica. |
| laboratorio | STRING | Laboratorio ficticio; algunos valores son NULL, vacíos o espacios. |
| precio_unitario | DECIMAL(12,2) | Precio unitario; contiene algunos NULL. |
| stock_actual | INT | Stock; contiene ceros, NULL y valores extremos. |
| estado_producto | STRING | ACTIVO, INACTIVO o DESCONTINUADO. |

## capacitacion_sql.sucursales

| Campo | Tipo | Descripción |
|---|---|---|
| codigo_sucursal | STRING | Código ficticio de 4 dígitos con ceros iniciales. |
| nombre_sucursal | STRING | Nombre ficticio. |
| ciudad | STRING | Ciudad real de Ecuador. |
| provincia | STRING | Provincia real de Ecuador. |
| tipo_sucursal | STRING | FARMACIA, AUTOSERVICIO, CENTRO COMERCIAL o BARRIO. |
| estado_sucursal | STRING | ACTIVA o INACTIVA. |

## capacitacion_sql.movimientos

| Campo | Tipo | Descripción |
|---|---|---|
| id_movimiento | BIGINT | Identificador único. |
| fecha_movimiento | TIMESTAMP | Fecha entre enero de 2025 y julio de 2026. |
| codigo_producto | STRING | Código de producto; algunos son huérfanos intencionales. |
| codigo_sucursal | STRING | Código de sucursal; algunos son huérfanos intencionales. |
| tipo_movimiento | STRING | VENTA, COMPRA, TRANSFERENCIA, DEVOLUCION o AJUSTE. |
| cantidad | INT | Devoluciones y algunos ajustes pueden ser negativos. |
| valor | DECIMAL(16,2) | Valor monetario con signo consistente con la cantidad. |
| estado_movimiento | STRING | VALIDO, PENDIENTE o ANULADO. |
| observacion | STRING | Texto opcional; contiene NULL, vacíos y espacios. |

## Reglas controladas

- Los códigos principales son únicos.
- Existen movimientos sin producto y sin sucursal para practicar `LEFT JOIN`.
- Existen productos y sucursales sin movimientos.
- Existen 500 movimientos duplicados en campos de negocio, con `id_movimiento` diferente.
- Los datos son ficticios y reproducibles con la semilla `20260802`.



# Ampliación Fase 3: abastecimiento_sql

## Tabla: proveedores

| Columna | Tipo | Descripción |
|---|---|---|
| codigo_proveedor | STRING | Código único ficticio del proveedor. |
| nombre_proveedor | STRING | Nombre ficticio del proveedor. Incluye algunos casos con espacios externos para prácticas de TRIM. |
| ciudad | STRING | Ciudad ecuatoriana. |
| provincia | STRING | Provincia ecuatoriana. |
| tipo_proveedor | STRING | FABRICANTE, DISTRIBUIDOR, IMPORTADOR o MAYORISTA. Incluye casos controlados en minúsculas, con espacios, NULL y vacío. |
| dias_credito | INT | Días de crédito acordados. |
| estado_proveedor | STRING | ACTIVO o INACTIVO. Incluye algunos NULL y vacíos para prácticas de limpieza. |

## Tabla: productos_proveedor

| Columna | Tipo | Descripción |
|---|---|---|
| codigo_producto | STRING | Código que se relaciona con `capacitacion_sql.productos`. |
| codigo_proveedor | STRING | Código que se relaciona con `abastecimiento_sql.proveedores`. |
| costo_compra | DECIMAL(12,2) | Costo de compra. Incluye NULL controlados. |
| plazo_entrega_dias | INT | Plazo estimado de entrega en días. |
| descuento_porcentaje | DECIMAL(6,2) | Descuento comercial. Puede ser cero. |
| proveedor_principal | STRING | SI / NO. |
| estado_relacion | STRING | ACTIVA / INACTIVA. |

## Tabla: ordenes_compra

| Columna | Tipo | Descripción |
|---|---|---|
| id_orden | BIGINT | Identificador de la orden. |
| fecha_orden | TIMESTAMP | Fecha y hora de creación de la orden. |
| codigo_proveedor | STRING | Código del proveedor. Incluye algunos códigos sin correspondencia para LEFT JOIN. |
| codigo_producto | STRING | Código del producto. Incluye algunos códigos sin correspondencia para LEFT JOIN. |
| codigo_sucursal | STRING | Código relacionado con `capacitacion_sql.sucursales`. |
| cantidad_solicitada | INT | Cantidad solicitada. |
| costo_unitario | DECIMAL(12,2) | Costo unitario. Incluye NULL controlados. |
| valor_orden | DECIMAL(16,2) | Valor total de la orden. Incluye NULL controlados. |
| estado_orden | STRING | RECIBIDA, EN_TRANSITO, PENDIENTE o ANULADA. |
| fecha_entrega | TIMESTAMP | Fecha de entrega; puede ser NULL. |
