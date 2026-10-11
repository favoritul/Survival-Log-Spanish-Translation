# 🇪🇸 Traducción al Español (España / Castellano) para Survival Log

Mod de traducción integral al español de España para el videojuego **Survival Log** (PC / Steam / Unity 6 IL2CPP 64-bit).

---

## 🌟 Características

- **Traducción completa de la interfaz (WebUI):** Menú principal, selección de supervivientes, árbol de talentos, interfaz de crafteo, inventario, tiendas, refugio, radio y bitácoras de supervivencia traducidos mediante Vue/WebView hook.
- **Traducción de textos del motor Unity:** Textos de juego, carteles, descripciones de estado, avisos y cuadros de diálogo procesados en tiempo real mediante BepInEx 6 + XUnity.AutoTranslator.
- **Más de 30.000 términos y frases traducidas:** Glosario adaptado al español peninsular (Castellano), preservando variables, colores y códigos internos de formato.
- **Sin conexión requerida:** Todas las traducciones funcionan de forma 100% local y offline, sin ralentizaciones ni consumo de red.

---

## 📥 Instalación Rápida (3 Pasos)

### Paso 1: Descargar el Mod
Descarga la última versión de la traducción desde la sección de **Releases** de este repositorio (archivo `SurvivalLog_Traduccion_Espanol_v1.0.zip`).

### Paso 2: Abrir la carpeta de instalación de Survival Log
- **En Steam:**
  1. Abre tu Biblioteca de Steam.
  2. Haz clic derecho sobre **Survival Log** → Selecciona **Administrar** → **Explorar archivos locales**.
  3. Se abrirá la carpeta raíz del juego (donde se encuentra `SurvivalLog.exe`).

### Paso 3: Copiar y Reemplazar
1. Abre el archivo `.zip` descargado.
2. Extrae o arrastra todo el contenido directamente dentro de la carpeta del juego (junto a `SurvivalLog.exe`).
3. Si Windows te pregunta si deseas **reemplazar los archivos existentes**, pulsa **Sí / Reemplazar**.

¡Y listo! Inicia el juego normalmente.

> [!NOTE]
> **En el primer arranque:** El juego tardará entre 10 y 25 segundos adicionales en iniciarse. Esto es normal, ya que el motor BepInEx genera automáticamente las librerías `interop` compatibles con tu versión del juego. Los arranques posteriores serán instantáneos.

---

## 📂 Contenido del Mod

| Carpeta / Archivo | Función |
| :--- | :--- |
| `BepInEx/` | Framework de modding para Unity 6 IL2CPP con XUnity.AutoTranslator. |
| `BepInEx/Translation/es/Text/SurvivalLog_ES.txt` | Diccionario completo de textos en español (más de 30.000 entradas). |
| `dotnet/` | Runtime CoreCLR x64 necesario para la ejecución de BepInEx en IL2CPP. |
| `SurvivalLog_Data/StreamingAssets/WebUI/` | Scripts de traducción reactiva (`es-translation.js`, `Root.html`, `webui-core.js`) para la interfaz web del juego. |
| `winhttp.dll` | Biblioteca Doorstop que engancha BepInEx al iniciar el ejecutable. |
| `doorstop_config.ini` | Archivo de configuración de carga de Doorstop. |

---

## 🛠️ Desinstalación

Si en algún momento deseas volver a jugar en inglés o retirar el mod:

1. Ve a la carpeta raíz de tu juego.
2. Elimina las siguientes carpetas y archivos:
   - Carpeta `BepInEx`
   - Carpeta `dotnet`
   - Archivo `winhttp.dll`
   - Archivo `doorstop_config.ini`
   - Archivo `.doorstop_version`
3. En Steam, haz clic derecho en el juego → **Propiedades** → **Archivos instalados** → **Verificar la integridad de los archivos del juego** (para restaurar los dos archivos HTML/JS originales de la interfaz).

---

## ❓ Preguntas Frecuentes y Solución de Problemas

#### ¿El juego tarda en abrir la primera vez?
Es el comportamiento previsto de BepInEx 6 IL2CPP mientras construye la caché de tipos en `BepInEx/interop/`. Una vez creada, las siguientes veces arrancará a velocidad normal.

#### ¿Los logros de Steam siguen funcionando?
Sí, BepInEx se ejecuta como cargador local y no interfiere con la API de Steam ni desactiva los logros.

#### ¿Puedo actualizar o añadir más textos?
¡Por supuesto!
- Para textos de Unity: edita `BepInEx/Translation/es/Text/SurvivalLog_ES.txt`. Formato: `Original=Traduccion`.
- Para textos de la interfaz WebUI: edita `SurvivalLog_Data/StreamingAssets/WebUI/es-translation.js`.

---

## 🤝 Créditos y Agradecimientos

- **BepInEx Team** por el soporte de modding para Unity e IL2CPP.
- **XUnity.AutoTranslator** por el framework de traducción de texto en Unity.
- Traducción y adaptación al español realizada para la comunidad de Survival Log.
