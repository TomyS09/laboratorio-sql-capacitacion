# Guía de publicación en GitHub Pages

## Requisitos

- Una cuenta gratuita de GitHub.
- Permiso para crear un repositorio público.
- Acceso desde la red de la empresa a `github.io` y `cdn.jsdelivr.net`.

## Publicación

1. Ingrese a GitHub y cree un repositorio público, por ejemplo: `laboratorio-sql-capacitacion`.
2. Descomprima este paquete.
3. Suba **todo el contenido de esta carpeta a la raíz del repositorio**. `index.html` debe quedar en la raíz.
4. Abra **Settings** del repositorio.
5. En el menú lateral, seleccione **Pages**.
6. En **Build and deployment**, elija **Deploy from a branch**.
7. Seleccione la rama `main` y la carpeta `/(root)`.
8. Guarde la configuración.
9. Espere unos minutos. GitHub mostrará la dirección pública del laboratorio.

La dirección tendrá una estructura similar a:

```text
https://USUARIO.github.io/laboratorio-sql-capacitacion/
```

## Prueba obligatoria antes de la clase

1. Abra la dirección desde una computadora empresarial conectada a la red habitual.
2. Espere el mensaje **Base lista para consultar**.
3. Ejecute la consulta inicial.
4. Pruebe `SELECT COUNT(*)` sobre las tres tablas.
5. Descargue un resultado CSV.
6. Pruebe el enlace desde al menos dos equipos de forma simultánea.

## Si aparece “No se pudo cargar el motor SQL”

La red probablemente bloquea el CDN. Solicite habilitar acceso HTTPS a:

```text
cdn.jsdelivr.net
github.io
```

No se necesita instalar software, abrir puertos de base de datos ni almacenar credenciales.

## Actualizar la base

Reemplace los archivos de `data/` y conserve los mismos nombres:

- `productos.csv.gz`
- `sucursales.csv.gz`
- `movimientos.csv.gz`

Después suba los cambios al repositorio. Los participantes recibirán la nueva versión al volver a cargar la página.
