# Laboratorio SQL en línea — Fase 2

Sitio estático diseñado para GitHub Pages. Ejecuta DuckDB-Wasm dentro del navegador y carga tres tablas ficticias:

- `capacitacion_sql.productos`: 3.000 registros.
- `capacitacion_sql.sucursales`: 400 registros.
- `capacitacion_sql.movimientos`: 250.000 registros.

## Funciones del portal

- Editor SQL sin instalación.
- Consultas de lectura compatibles con el contenido del curso de Apache Impala.
- Explorador de tablas y columnas.
- Ejemplos de las cuatro sesiones.
- Resultados tabulares con límite visual configurable.
- Exportación a CSV.
- Descarga del script SQL.
- Restablecimiento del laboratorio.
- Bloqueo de instrucciones que modifican datos.

## Archivos principales

- `index.html`: interfaz.
- `styles.css`: diseño.
- `app.js`: motor, carga, editor y resultados.
- `data/*.csv.gz`: datos comprimidos.
- `GUIA_PUBLICACION_GITHUB_PAGES.md`: publicación.
- `GUIA_PRUEBA_LOCAL.md`: prueba del instructor.
- `sql/`: scripts administrativos y validaciones.

## Dependencias externas

El navegador descarga DuckDB-Wasm desde jsDelivr. Antes de la clase se debe verificar que la red empresarial permita acceso a `cdn.jsdelivr.net` y al dominio de GitHub Pages.
