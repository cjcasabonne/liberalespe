Necesito agregar un banner compacto de "Sin Complejos" en la landing pública.

Contexto:
- Ya existe una landing pública.
- La app interna/login ya está separada o en proceso de quedar separada.
- NO quiero rehacer la landing.
- NO quiero tocar auth/login/intranet.
- NO quiero tocar App.tsx salvo que sea absolutamente necesario.
- NO instalar dependencias.
- NO modificar package.json.
- NO cambiar la estructura general.

Objetivo:
Agregar una sección/banner pequeño para "Sin Complejos" al costado o cerca de las cards/botones de "Súmate" y "Participa".

Imagen:
- La imagen ya existe en el proyecto.
- Se llama: sin_complejos
- Busca el archivo real en el proyecto, puede estar como:
  - sin_complejos.png
  - sin_complejos.jpg
  - sin_complejos.webp
  - public/sin_complejos.*
  - src/assets/sin_complejos.*
- Usa la ruta correcta según dónde esté.
- No descargues imágenes nuevas.
- No crees assets nuevos.

Ubicación:
- Insertar el banner junto a la sección donde están "Súmate" y "Participa".
- Debe sentirse parte de esa misma zona de participación.
- En desktop puede ir como una tercera card o un banner lateral.
- En móvil debe apilarse correctamente.
- Debe ocupar poco espacio vertical.
- Reducirlo lo más posible sin que se vea mal.
- No debe romper el diseño ni competir demasiado con los CTAs principales.

Contenido del banner:
Título:
Sin Complejos

Texto de apoyo:
Análisis directo sobre la coyuntura política nacional.
Artículos de opinión política escritos por J.
Ideas y propuestas para una agenda liberal en el Perú.

CTA:
Leer newsletter

Link:
https://www.linkedin.com/newsletters/sin-complejos-7386187440685891584/

Comportamiento:
- Todo el banner o al menos el botón debe llevar al link de LinkedIn.
- Debe abrir en una pestaña nueva.
- Usar target="_blank".
- Usar rel="noopener noreferrer".
- Debe ser accesible, con alt correcto para la imagen.

Estilo:
- Reutilizar las clases/variables existentes de la landing.
- Debe acoplarse visualmente a la página actual.
- No hacerlo gigante.
- Debe verse como un bloque editorial/newsletter.
- Usar estilo sobrio, compacto y moderno.
- La imagen debe ajustarse bien:
  - object-fit: contain o cover según convenga
  - sin deformarse
  - con tamaño máximo controlado
- En desktop:
  - si hay cards de "Súmate" y "Participa", puede quedar como tercera card compacta
  - o como banner horizontal debajo de ambas
- En mobile:
  - ancho completo
  - imagen arriba o debajo del texto
  - sin overflow horizontal

Archivos esperados:
- Probablemente modificar solo:
  - src/LandingPreview.tsx
  - src/landing-preview.css
- Si el proyecto ya cambió la landing a Home, modifica el archivo real de la landing.
- No tocar App.tsx si no es necesario.

Reglas estrictas:
- No tocar login.
- No tocar intranet.
- No tocar auth.
- No tocar middleware.
- No cambiar rutas.
- No refactorizar toda la landing.
- No borrar contenido existente.
- No eliminar las cards de "Súmate" y "Participa".
- No instalar dependencias.

Entrega:
Al final dime:
1. Dónde encontraste la imagen sin_complejos.
2. Qué archivos modificaste.
3. En qué sección agregaste el banner.
4. Cómo probarlo en navegador.
5. Confirmación de que no tocaste login/auth/intranet.