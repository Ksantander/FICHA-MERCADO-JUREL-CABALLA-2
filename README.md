# Ficha de Mercado · Jurel y Caballa Congelados

Dashboard estático de inteligencia de mercado para el jurel (HS 030355) y la
caballa (HS 030354) congelados, exportados por Chile. Construido a partir del
informe **Proyecto PDT 25PDT-308340 · UCN Ciencias Empresariales**.

Incluye:
- Panorama mundial de ambos productos.
- Resumen agregado de 5 continentes (África, América, Asia, Europa, Oceanía).
- 70 fichas país, con datos de mercado mundial, relación comercial con Chile,
  acceso al mercado (aranceles y NTM), precios por calibre y la imagen
  original de cada ficha del informe.

Es un sitio 100% estático (HTML + CSS + JS vanilla, sin build step), listo
para publicarse en **GitHub Pages**.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado con
   GitHub Pro/Team/Enterprise para Pages).
2. Sube **todo el contenido de esta carpeta** (`index.html`, `assets/`,
   `.nojekyll`) a la raíz del repositorio (rama `main`, por ejemplo).
3. En el repositorio: **Settings → Pages → Build and deployment → Source**:
   elige "Deploy from a branch", rama `main`, carpeta `/ (root)`. Guarda.
4. Espera 1–2 minutos. GitHub mostrará la URL pública, con el formato
   `https://<tu-usuario>.github.io/<nombre-repo>/`.

No se requiere ningún paso de build, ni Node, ni dependencias: es HTML/CSS/JS
puro y un archivo JSON de datos.

## Estructura del proyecto

```
index.html                     página única (SPA con rutas por hash)
assets/css/main.css             estilos
assets/js/app.js                lógica de la aplicación (router + render)
assets/data/master_data.json    todos los datos estructurados extraídos del PDF
assets/img/page-XXX.webp        las 122 páginas del PDF original, rasterizadas
.nojekyll                       evita que GitHub Pages procese el sitio con Jekyll
```

## Actualizar los datos en el futuro

Si se genera un nuevo PDF de fichas de mercado con la misma estructura,
los scripts de extracción (`extract_v2.py` y `build_master.py`, no incluidos
en este paquete de salida) pueden volver a ejecutarse para regenerar
`master_data.json` y las imágenes. Pide ayuda para automatizarlo si se repite
este informe en el futuro.

## Navegación del sitio

- **Inicio**: panorama general y acceso a los 5 continentes.
- **Panorama mundial**: cifras agregadas de jurel y caballa a nivel global.
- **Continentes**: resumen agregado por continente + listado de países.
- **Países**: buscador y filtro de las 70 fichas país.
- **Competencia**: páginas de análisis comparativo entre exportadores.

Cada ficha país muestra los datos extraídos en paneles, más la imagen
original de la página del informe (ampliable con click) para máxima fidelidad
con el documento fuente.
