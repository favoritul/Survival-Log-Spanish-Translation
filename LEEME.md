# 🇪🇸 Traducción al Español (España / Castellano) para Survival Log

Mod de traducción integral y definitiva al **Español de España (Castellano)** para el videojuego **Survival Log** (PC / Steam / Unity 6 IL2CPP 64-bit).

---

## 🌟 Características Principales

- **Traducción nativa de toda la interfaz y HUD:**
  - **Mochila e Inventario:** Capacidad, límites de carga, descripciones de objetos, botones de acción (*Ordenar*, *Tirar todo*, *Soltar*, atajos de teclado).
  - **HUD de Estado:** Estadísticas de supervivencia traducidas de forma natural (*Saciedad*, *Moral*, *Energía*, *Salud*, *Infección grave*, etc.).
  - **Controles y Guías:** Avisos en pantalla (*Ver obstáculos*, *Despejar obstáculos*, *Mover personaje*, *Mover cámara*, *Seguir personaje*, *Resaltar objetos interactivos*).
  - **Ciclo y Tiempo:** Marcadores de día y bucles temporales (*DÍA 1*, *Bucle: 1*, etc.).
- **Traducción completa de la interfaz WebUI (Vue 3 / Chromium):**
  - Menú principal, selección de personajes, bitácoras de supervivencia, eventos de historia, mensajes SMS, radio, radioaficionado, tiendas, banco de trabajo y cocina.
- **Traducción cuidada en Castellano (España):**
  - Sin traducciones literales de Google Translate (se corrigieron errores como "Obstáculos claros" por "Despejar obstáculos", "Fitness" por "Salud", "borrar ahorro" por "borrar partida guardada").
  - Glosario contextual de supervivencia con más de **52.000 claves de juego** y **30.000 textos de interfaz**.
- **Plugin Nativo de Alto Rendimiento (`SurvivalLog.TraduccionES.dll`):**
  - Se conecta directamente a la arquitectura de configuración del juego (`ConfigManager.GetLocalTxt`) para una traducción instantánea con 0 milisegundos de retraso y sin caída de FPS.
  - Incluye bypass automático del diálogo de verificación de integridad de archivos (`UI_StartupCheck`), permitiendo jugar sin ningún mensaje de advertencia.
- **100% Offline y Todo en Uno:**
  - No requiere descargar BepInEx ni el runtime .NET por separado; el paquete ZIP incluye absolutamente todo listo para copiar y jugar.

---

## 📥 Instalación Rápida (3 Pasos)

### Paso 1: Descargar el Mod
Descarga la última versión de la traducción desde la sección de **Releases** de este repositorio:
👉 **[SurvivalLog_Traduccion_Espanol_v1.0.zip](../../releases)**

### Paso 2: Abrir la carpeta del juego
- **En Steam:**
  1. Abre tu Biblioteca de Steam.
  2. Haz clic derecho sobre **Survival Log** → Selecciona **Administrar** → **Explorar archivos locales**.
  3. Se abrirá la carpeta del juego (donde se encuentra `SurvivalLog.exe`).

### Paso 3: Copiar y Reemplazar
1. Abre el archivo `SurvivalLog_Traduccion_Espanol_v1.0.zip` que descargaste.
2. Copia o extrae todo el contenido dentro de la carpeta del juego (al lado de `SurvivalLog.exe`).
3. Cuando Windows pregunte si deseas **reemplazar los archivos existentes**, pulsa **Sí / Reemplazar**.

¡Y listo! Inicia el juego normalmente desde Steam o su ejecutable.

---

## 📂 Contenido del Paquete

| Archivo / Carpeta | Descripción |
| :--- | :--- |
| `BepInEx/plugins/TraduccionES/` | Plugin C# de traducción (`SurvivalLog.TraduccionES.dll`) y diccionarios de claves (`SurvivalLog_Keys_ES.json` y `SurvivalLog_Text_ES.json`). |
| `BepInEx/core/` | Motor de interop y Harmony para Unity 6 IL2CPP. |
| `dotnet/` | Runtime CoreCLR x64 integrado para ejecutar BepInEx sin requisitos previos. |
| `SurvivalLog_Data/StreamingAssets/WebUI/` | Archivos de interfaz web adaptados (`es-translation.js`, `Root.html`, `webui-core.js` y vistas `UI`). |
| `winhttp.dll` / `doorstop_config.ini` | Cargador de inicio automático Doorstop. |

---

## 🛠️ Desinstalación

Para restaurar el juego a su estado original en inglés:
1. Elimina las carpetas `BepInEx` y `dotnet` de la carpeta del juego.
2. Elimina los archivos `winhttp.dll`, `doorstop_config.ini` y `.doorstop_version`.
3. En Steam, ve a *Survival Log* → *Propiedades* → *Archivos instalados* → **Verificar la integridad de los archivos del juego**.
