# Revisión del flujo Classroom

final result: blocked

El bloqueo se limita a certificar una copia visual exacta: las cinco referencias llegaron como imágenes en la conversación y no tienen una ruta local accesible para montar la comparación conjunta fuente/implementación que exige la habilidad. No se afirma una comparación pixel a pixel aprobada. El flujo implementado es una adaptación de Classroom que conserva las herramientas y el transporte del proyecto.

## Evidencia de implementación

- `.preservation/classroom-start-final.png`: Iniciar, 1600 × 900, densidad 1. Se observan las tres imágenes originales, números rojos, títulos y navegación con iconos originales.
- `.preservation/classroom-units-final.png`: Unidades, 1600 × 900, densidad 1. Se agrupan sesiones educativas y modelos por robot/kit.
- `.preservation/classroom-editor-build-final.png`: Movimientos y giros, paso 02/06, 1600 × 900, densidad 1. Se observan la base motriz, instrucciones, flechas, Construir, paleta contextual y lienzo vacío.
- La imagen de referencia 1 mide 1600 × 840; la referencia 4 fue reducida a 2048 × 1047; la referencia 5 es un recorte del panel. Sus marcos y densidades no son equivalentes a estas capturas de navegador.

## Iteraciones y correcciones

1. Las primeras capturas mostraron bloques de categorías anteriores después de reducir la paleta. Se corrigió el refresco del flyout de Scratch y se conservaron los bloques sugeridos entre pasos. En la captura final el paso de construcción muestra Eventos, Motores y Control.
2. La imagen de construcción podía encogerse hasta desaparecer en el panel flexible. Se fijaron su altura y la ausencia de encogimiento; la captura final muestra la imagen completa.
3. El editor sobrepasaba la altura del navegador. Se ajustó su altura; la medición final confirma 900 px de documento en un viewport de 900 px, con 1600 px de ancho.
4. Los ejemplos aparecían también en pasos informativos y de construcción. Ahora se ofrecen en pasos de programación y se cargan con confirmación. Las sesiones comienzan con el lienzo vacío; un proyecto nuevo independiente conserva su ejemplo editable.

## Límites de esta revisión

La barra de herramientas, CodeMirror, consola, simulación y controles de conexión son propios del proyecto y difieren de las capturas originales. Las pruebas verifican el recorrido, la paleta, guardado, ejemplos con comentarios, manuales y reproducción; no certifican fidelidad visual exacta ni ejecución de todos los bloques originales de LEGO. La operación con un EV3 físico sigue sin verificarse.

## Modal de conexión

La nueva referencia es la captura de conexión Bluetooth del usuario, de 1615 × 1251. Se capturó la implementación en ese mismo viewport y en 390 × 844 (`.preservation/connection-modal-desktop.png` y `connection-modal-mobile.png`). Se reutilizan las animaciones y los iconos originales de Classroom; el estado resaltado corresponde al video en reproducción. Se ajustaron marco, título, columnas y escala del ladrillo. La web añade Seleccionar EV3 porque el selector de puertos requiere interacción del usuario; no representa una búsqueda automática inexistente. El transporte USB permanece informado como no disponible. Las pruebas verifican animación local, cambio de paso, espera real del selector, cancelación, cierre y respuesta EV3 simulada.
## Capturas de código moderno — 8 de octubre de 2026

Las capturas de código se generan con `renderBlocksPreview`, el mismo renderer Scratch del editor. El XML usado para cada captura se carga también como ejemplo editable. Se verificó visualmente la captura de Movimiento en línea recta: B+C, velocidad 50, 2 rotaciones; espera de 1 segundo; velocidad -50, 720 grados; espera; movimiento de 1 segundo. La captura completa de TRACK3R incluye imagen Pinch left, los tres movimientos originales y sonido Fanfare. Las fotos de robots y manuales no se reemplazan.

La prueba de navegador guarda `.preservation/modern-track3r-editor.png` y verifica carga, persistencia, compilación y ejecución en simulador del programa completo. El panel ampliado permite ver la captura a mayor tamaño. Esto valida las capturas generadas de los programas convertidos; no certifica las conversiones todavía pendientes ni la ejecución en un EV3 físico.
