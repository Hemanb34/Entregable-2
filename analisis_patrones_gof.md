# Plantilla de análisis y selección de patrones GoF

Instrumento de apoyo para justificar patrones GoF no repetidos dentro del alcance de un producto mínimo viable.

---

## 1. Datos generales del proyecto

- **Nombre del proyecto:** Sistema de Búsqueda y Estimación Inmobiliaria
- **Equipo de trabajo:** Heman Santiago Bermudez Espinosa
- **Asignatura:** Diseño de Sistemas de Información
- **Docente:** Alexandra Guerrero Bocanegra
- **Fecha:** 10 de octubre de 2026

---

## 2. Descripción general del proyecto

- **Problema que resuelve el proyecto:**  
  En la ciudad de Medellín, el mercado inmobiliario presenta una alta volatilidad e incertidumbre al momento de fijar o evaluar precios de arrendamiento. Los propietarios sufren de ceguera competitiva por carecer de herramientas objetivas para cotejar sus viviendas frente a la oferta real del sector, incurriendo frecuentemente en sobreprecio o especulación. Por su parte, los arrendatarios enfrentan desinformación y fragmentación de la oferta, debiendo navegar de forma dispersa por múltiples portales (Metrocuadrado, Finca Raíz, Cien Cuadras) sin saber si un precio es justo.

- **Objetivo general del sistema:**  
  Desarrollar una plataforma centralizada y eficiente que unifique la oferta inmobiliaria de Medellín, proporcione estimaciones objetivas de precios mediante Machine Learning, calcule márgenes sugeridos de publicación competitivos y provea una gestión administrativa robusta para la extracción automatizada de datos y el reentrenamiento de modelos sin degradar el servicio.

- **Descripción del producto propuesto:**  
  Una solución web construida sobre FastAPI y Python (`buscasa`) que integra crawlers asíncronos para extraer publicaciones en memoria desde múltiples portales preparándolas para su inserción directa en la base de datos relacional, un pipeline riguroso de preparación y entrenamiento de modelos predictivos supervisados, un motor de estimación y cálculo de márgenes comerciales para propietarios y buscadores, y un módulo de administración seguro para accionar los flujos clave del ecosistema de datos.

---

## 3. Alcance del MVP

### 3.1 Funcionalidades incluidas en el MVP

| ID | Funcionalidad del MVP | Prioridad | Justificación |
| :--- | :--- | :--- | :--- |
| **F1** | **Orquestar extracción de datos** | **Alta** | Constituye el insumo base del ecosistema (RF-08). Permite la ejecución manual o periódica (RNF-03) de crawlers asíncronos hacia portales externos configurados, garantizando la escalabilidad para incorporar nuevas fuentes sin rediseñar la arquitectura (RNF-07). Extrae los datos en memoria para alimentar la base de datos relacional y los modelos de reentrenamiento. |
| **F2** | **Preparar los datos** | **Alta** | Garantiza la calidad metodológica e integridad del dataset (RF-09). Aplica la regla de negocio **RN-06** (descarte estricto de inmuebles sin URL original) y ejecuta la codificación y escalado numérico calculados estrictamente sobre el conjunto de entrenamiento para prohibir la fuga de datos (**RN-02**). |
| **F3** | **Reentrenar el modelo** | **Alta** | Mantiene actualizado el motor predictivo frente a la dinámica del mercado (RF-10). Ejecuta el entrenamiento en segundo plano sin bloquear las consultas de los usuarios (**RNF-08**) y aplica la compuerta de aceptación obligatoria: el modelo solo se promueve a producción si su RMSE no supera el umbral del 12% - 15% (**RN-01**, **RNF-02**). |
| **F4** | **Obtener margen sugerido** | **Alta** | Entrega el valor analítico final procesable al propietario para la toma de decisiones comerciales (RF-06). Calcula el rango sugerido de publicación (-5% liquidez rápida / +5% máxima rentabilidad) sobre la estimación base (**RN-04**) y permite seleccionar dinámicamente estrategias de precios validadas frente a la competencia (RF-05). |
| **F5** | **Consolidar catálogo** | Media | Unifica la oferta de múltiples portales en una vista única y centralizada en base de datos (RF-01, RF-12). Depende directamente de que la extracción (F1) y la normalización/preparación (F2) hayan transformado los datos a una estructura estándar canónica. |
| **F6** | **Estimar precio de una vivienda** | Media | Permite a arrendatarios y propietarios ingresar características estructurales y geográficas para obtener una estimación objetiva de precio (RF-03) y consultar inmuebles competidores similares según los 4 criterios de **RN-03** (RF-04). Depende de que el modelo predictivo (F3) esté activo en producción. |
| **F7** | **Autenticarse** | Media | Protege y restringe el acceso al panel de control de administración mediante credenciales exclusivas con JWT (RF-07, RNF-01), implementando el bloqueo temporal por 30 minutos tras 3 intentos fallidos (**RN-05**). |

### 3.2 Restricciones del MVP
- El proyecto debe implementar exactamente **cinco (5) patrones GoF**.
- Los patrones **no se pueden repetir**.
- Cada patrón debe responder a una **necesidad real del sistema** dentro del alcance del MVP y estar asociado a las funcionalidades priorizadas.
- La selección debe **evitar sobreingeniería**; no se deben crear jerarquías abstractas artificiales en módulos donde las capacidades nativas de FastAPI y Python resuelvan el problema de forma óptima.
- Los patrones deben ser viables dentro del tiempo y alcance del MVP, integrándose naturalmente con la estructura del proyecto en `C:\Users\heman\inmobiliaria-fastapi`.

### 3.3 Funcionalidades fuera del MVP
- **Monitoreo avanzado con dashboard gráfico de métricas en tiempo real:** La visualización interactiva de curvas históricas de RMSE y volumetría gráfica de logs (RF-11) queda pospuesta para una fase posterior al MVP; en el MVP, la trazabilidad técnica se resuelve a nivel de base de datos relacional y logs de auditoría.
- **Pasarelas de pagos y transacciones en línea:** El sistema no procesará depósitos, comisiones ni cobros de publicación.
- **Mensajería y chat directo en tiempo real:** La comunicación entre arrendatario y anunciante se realiza fuera de la plataforma mediante la redirección al portal de origen ("Ir a la Oferta", RF-12).
- **Firma digital y gestión contractual de arrendamientos:** No se generan contratos de arrendamiento ni pólizas jurídicas.
- **Autenticación social multicanal:** No se implementará inicio de sesión con Google, Facebook o Apple; se mantiene autenticación segura y exclusiva de administrador con OAuth2/JWT.
- **Modelos de visión artificial (Computer Vision):** No se procesarán las fotografías de los inmuebles para calcular el precio.
- **Cobertura geográfica fuera del Valle de Aburrá:** El sistema opera exclusivamente para el mercado inmobiliario de Medellín y municipios aledaños.

---

## 4. Matriz global de análisis de patrones del proyecto

| Necesidad de diseño detectada | Módulo o funcionalidad afectada | Tipo de problema | Patrón candidato | ¿Aporta valor al MVP? | ¿Se solapa con otro patrón? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Instanciar crawlers dinámicamente según el portal configurado sin acoplar el orquestador | Orquestación de Crawlers (F1) | Creacional | **Factory Method** | **Sí** | **No** |
| Familias complejas de objetos de scraping (crawlers + parsers + downloaders) | Orquestación de Crawlers (F1) | Creacional | Abstract Factory | No (Sobreingeniería) | Sí (con Factory Method) |
| Normalizar respuestas crudas heterogéneas (JSON/HTML) de portales externos al esquema canónico de base de datos | Consolidación de Catálogo (F5) | Estructural | **Adapter** | **Sí** | **No** |
| Simplificar el consumo de los subsistemas (ML, búsqueda de similares y estadísticas) hacia la API | Estimación de Vivienda (F6) | Estructural | **Facade** | **Sí** | **No** |
| Envolver solicitudes HTTP con mecanismos de reintentos o rotación de proxies | Red / Scraping (F1) | Estructural | Decorator | No (Fuera de MVP) | No |
| Fijar el esqueleto algorítmico obligatorio del pipeline de datos y ML garantizando no fuga de datos (RN-02) y umbral RMSE (RN-01) | Preparar Datos y Reentrenar Modelo (F2, F3) | Comportamiento | **Template Method** | **Sí** | **No** |
| Intercambiar dinámicamente la familia de algoritmos de cálculo de margen según el objetivo comercial del propietario | Obtener Margen Sugerido (F4) | Comportamiento | **Strategy** | **Sí** | **No** |
| Encadenar filtros individuales de validación y limpieza de campos tabulares | Preparación de Datos (F2) | Comportamiento | Chain of Responsibility | No (Innecesario para DataFrames de Pandas) | No |

---

## 5. Fichas de análisis de los patrones seleccionados

---

### FICHA 1: Factory Method (Creacional)

#### 5.1 Identificación general
- **Nombre del patrón:** Factory Method
- **Categoría:** [X] Creacional &nbsp;&nbsp; [ ] Estructural &nbsp;&nbsp; [ ] De comportamiento
- **Módulo, componente o funcionalidad donde se aplicará:**  
  Módulo de Orquestación de Crawlers / Ingesta de Datos (`app/services/crawler_factory.py`, `app/services/crawler_service.py` y `buscasa/buscasa/crawlers/`).

#### 5.2 Problema de diseño que se quiere resolver
En `app/services/crawler_service.py`, la función `orquestar_extraccion(portal_nombre: str, db: Session)` necesita ejecutar la extracción para el portal solicitado (`fincaraiz`, `metrocuadrado`, `ciencuadras`, etc.). Si el orquestador instancia directamente las clases concretas mediante condicionales `if/elif` cableados en código, se acopla el servicio a las implementaciones de scraping. Esto viola el principio Open/Closed y choca directamente con el requisito no funcional **RNF-07**, el cual exige que el sistema permita incorporar nuevos portales de origen mediante configuración sin rediseñar la arquitectura de ingesta.

#### 5.3 Evidencias del problema en el proyecto
- [X] Alto acoplamiento
- [ ] Multiplicidad de algoritmos
- [ ] Cambio frecuente de comportamiento
- [X] Complejidad en la creación de objetos
- [ ] Necesidad de desacoplar emisor y receptor
- [X] Necesidad de ampliar funcionalidad sin modificar la clase base
- [ ] Interfaz incompatible
- **Explicación contextualizada en el proyecto:**  
  En el repositorio ya existen scrapers independientes (`buscasa/buscasa/crawlers/fincaraiz.py`, `metrocuadrado.py`, `ciencuadras.py`) que heredan de `AsyncCrawler` (`buscasa/buscasa/crawlers/base.py`). Sin una factoría, cada nuevo portal agregado obliga a modificar la lógica de los servicios y endpoints para importar e inicializar la clase concreta con sus configuraciones de concurrencia y delay.

#### 5.4 Relación con el MVP
- **¿Por qué este problema sí debe resolverse en el MVP y no en una versión futura?**  
  Porque la extracción de datos es la funcionalidad **F1 (Prioridad Alta)** del MVP. Si la creación de crawlers nace acoplada, habilitar o deshabilitar portales en las pruebas iniciales requerirá reescribir código de backend.
- **¿Qué riesgo habría si no se aplica este patrón en el MVP?**  
  Violación de **RNF-07**, fragilidad ante cambios y proliferación de sentencias `if/elif` que degradan la mantenibilidad de la ingesta.
- **¿La implementación del patrón es razonable para el tiempo y complejidad del MVP?** [X] Sí &nbsp;&nbsp; [ ] No  
  *Justificación:* Es sumamente ligera en Python. Se implementa como una clase creadora o registro de factoría que instancia subtipos de `AsyncCrawler` dinámicamente.

#### 5.5 Análisis de adecuación del patrón
- **¿Qué parte del sistema cambia o podría cambiar?**  
  El catálogo de portales inmobiliarios soportados (incorporación futura de portales como Properati o MercadoLibre Inmuebles).
- **¿Qué se desea desacoplar?**  
  El servicio orquestador (`crawler_service`) de las clases concretas de extracción (`FincaraizCrawler`, `MetrocuadradoCrawler`, etc.).
- **¿Qué ventaja concreta ofrece este patrón en este proyecto?**  
  Permite incorporar un nuevo crawler simplemente implementando la subclase y registrándola en la factoría, sin modificar una sola línea del orquestador.
- **¿Qué principio de diseño ayuda a cumplir?**  
  [X] Abierto/Cerrado &nbsp;&nbsp; [X] Inversión de Dependencias &nbsp;&nbsp; [ ] Responsabilidad Única  
  *Justificación técnica:* El cliente orquestador depende de la abstracción `AsyncCrawler` (DIP) y la factoría queda abierta a la extensión pero cerrada a la modificación (OCP).

#### 5.6 Alternativas consideradas
| Patrón alternativo | ¿Por qué podría confundirse? | ¿Por qué no es el mejor en este caso? |
| :--- | :--- | :--- |
| **Abstract Factory** | Ambos crean objetos abstrayendo su instanciación. | Sobreingeniería; Abstract Factory se enfoca en familias de productos compatibles, mientras que aquí solo se necesita crear una única abstracción: el crawler del portal. |
| **Simple Factory (Función if/elif plana)** | Produce el mismo resultado inmediato en pocas líneas. | Viola OCP; cada nuevo portal obliga a editar el condicional interno, dificultando el registro dinámico exigido por RNF-07. |

#### 5.7 No repetición ni solapamiento
- **¿Este patrón ya fue usado en otra parte del proyecto?** [ ] Sí &nbsp;&nbsp; [X] No
- **¿Su propósito funcional se solapa con otro patrón seleccionado?** [ ] Sí &nbsp;&nbsp; [X] No

#### 5.8 Aplicación concreta al diseño
| Rol del patrón | Clase/componente del proyecto |
| :--- | :--- |
| **Product** (Producto Abstracto) | `buscasa.buscasa.crawlers.base.AsyncCrawler` |
| **ConcreteProduct** (Productos Concretos) | `FincaraizCrawler`, `MetrocuadradoCrawler`, `CiencuadrasCrawler` |
| **Creator** (Creador) | `app.services.crawler_factory.CrawlerFactory` |
| **Client** (Cliente) | `app.services.crawler_service.orquestar_extraccion` |

**Descripción breve de cómo funcionará en el sistema:**  
El orquestador recibe el nombre del portal solicitado desde la base de datos o el endpoint administrativo y solicita la instancia correspondiente a `CrawlerFactory.create_crawler(portal_name)`. La factoría resuelve la clase registrada y retorna una instancia lista para ejecutar `await crawler.run()`.

```python
# app/services/crawler_factory.py
from typing import Type, Dict
from buscasa.buscasa.crawlers.base import AsyncCrawler
from buscasa.buscasa.crawlers.fincaraiz import FincaraizCrawler
from buscasa.buscasa.crawlers.metrocuadrado import MetrocuadradoCrawler
from buscasa.buscasa.crawlers.ciencuadras import CiencuadrasCrawler

class CrawlerFactory:
    _registry: Dict[str, Type[AsyncCrawler]] = {
        "fincaraiz": FincaraizCrawler,
        "metrocuadrado": MetrocuadradoCrawler,
        "ciencuadras": CiencuadrasCrawler,
    }

    @classmethod
    def register_crawler(cls, portal_name: str, crawler_cls: Type[AsyncCrawler]) -> None:
        cls._registry[portal_name.lower()] = crawler_cls

    @classmethod
    def create_crawler(cls, portal_name: str, **kwargs) -> AsyncCrawler:
        crawler_cls = cls._registry.get(portal_name.lower())
        if not crawler_cls:
            raise ValueError(f"Portal '{portal_name}' no soportado o no configurado.")
        return crawler_cls(**kwargs)
```

#### 5.9 Conclusión de decisión
- **Decisión final sobre este patrón:** [X] Se aprueba &nbsp;&nbsp; [ ] Se descarta  
- **Justificación final:** Es el patrón creacional idóneo para satisfacer RNF-07 y desacoplar la orquestación de la ingestión en la funcionalidad de alta prioridad F1.

---

### FICHA 2: Adapter (Estructural)

#### 5.1 Identificación general
- **Nombre del patrón:** Adapter
- **Categoría:** [ ] Creacional &nbsp;&nbsp; [X] Estructural &nbsp;&nbsp; [ ] De comportamiento
- **Módulo, componente o funcionalidad donde se aplicará:**  
  Módulo de Normalización de Catálogo / Ingesta Multi-Portal (`buscasa/buscasa/crawlers/adapters/` y `app/schemas/property.py`).

#### 5.2 Problema de diseño que se quiere resolver
Cada portal inmobiliario externo entrega sus publicaciones en estructuras de datos, tipos de variables y formatos totalmente heterogéneos e incompatibles entre sí:
- *Metrocuadrado* expone APIs con llaves como `m2Superficie`, `vlrVenta`, `barrioNombre`.
- *Finca Raíz* entrega un payload con estructuras anidadas como `attributes.area`, `price`, `locations`.
- *Cien Cuadras* extrae datos HTML o JSON con llaves como `superficie_construida` y cadenas de texto con caracteres de moneda y símbolos (`"$ 2.500.000"`).

El catálogo consolidado del MVP (RF-01) y la base de datos relacional requieren un modelo canónico uniforme (`PropertyCreate`). Además, la regla de negocio crítica **RN-06** exige descartar obligatoriamente cualquier publicación que carezca de la URL original de la publicación. Sin un adaptador, los scrapers o el orquestador mezclarían lógica de red con código complejo de parseo y saneamiento de datos.

#### 5.3 Evidencias del problema en el proyecto
- [X] Alto acoplamiento
- [ ] Multiplicidad de algoritmos
- [ ] Cambio frecuente de comportamiento
- [ ] Complejidad en la creación de objetos
- [ ] Necesidad de desacoplar emisor y receptor
- [ ] Necesidad de ampliar funcionalidad sin modificar la clase base
- [X] Interfaz incompatible
- **Explicación contextualizada en el proyecto:**  
  En el directorio `buscasa`, se observan diferentes archivos de muestra (`sample_fr.json`, `sample_mq.json`) cuyos diccionarios difieren en esquemas. Para poblar la tabla `properties` de SQLAlchemy (`app/models/property.py`) y alimentar el catálogo consolidado, se debe convertir cada estructura externa al esquema común `PropertyCreate` (`codigo`, `precio`, `area`, `estrato`, `comuna`, `habitaciones`, `banos`, `url_origen`).

#### 5.4 Relación con el MVP
- **¿Por qué este problema sí debe resolverse en el MVP y no en una versión futura?**  
  Porque "Consolidar catálogo" (RF-01, F5) y el filtro de calidad **RN-06** son indispensables para que los inmuebles puedan persistirse e incorporarse limpiamente en la base de datos para los modelos predictivos del MVP.
- **¿Qué riesgo habría si no se aplica este patrón en el MVP?**  
  Inconsistencia severa en la base de datos (valores nulos o tipos erróneos), violación inadvertida de RN-06 e imposibilidad de reutilizar el código de extracción con nuevos portales.
- **¿La implementación del patrón es razonable para el tiempo y complejidad del MVP?** [X] Sí &nbsp;&nbsp; [ ] No  
  *Justificación:* Es directa y rápida: una clase base abstracta `PropertyDataAdapter` con el método `adapt(raw_item: dict) -> Optional[PropertyCreate]` y tres implementaciones concretas para los tres portales.

#### 5.5 Análisis de adecuación del patrón
- **¿Qué parte del sistema cambia o podría cambiar?**  
  Los formatos de respuesta de los portales externos debido a cambios en sus APIs públicas o interfaces web.
- **¿Qué se desea desacoplar?**  
  El modelo de datos del dominio interno de la aplicación respecto a los contratos de datos de terceros.
- **¿Qué ventaja concreta ofrece este patrón en este proyecto?**  
  Si un portal altera el nombre de un campo (por ejemplo, cambia `vlrVenta` por `precioFinal`), el cambio se corrige únicamente en el adaptador correspondiente, sin tocar la base de datos, el servicio de propiedades ni los endpoints.
- **¿Qué principio de diseño ayuda a cumplir?**  
  [X] Responsabilidad Única &nbsp;&nbsp; [X] Segregación de Interfaces &nbsp;&nbsp; [ ] Inversión de Dependencias  
  *Justificación técnica:* Aísla la responsabilidad de transformación de esquemas (SRP), permitiendo que el dominio dependa de una interfaz limpia sin conocer los detalles de transporte de cada portal.

#### 5.6 Alternativas consideradas
| Patrón alternativo | ¿Por qué podría confundirse? | ¿Por qué no es el mejor en este caso? |
| :--- | :--- | :--- |
| **Decorator** | Ambos envuelven objetos existentes. | Decorator añade comportamientos manteniendo la misma interfaz; Adapter adapta interfaces dispares a un nuevo contrato canónico. |
| **Parseo directo dentro del scraper** | Parece más rápido codificarlo dentro del método `run()` de cada crawler. | Viola SRP; mezcla la conexión y concurrencia HTTP con la lógica de negocio y validación de reglas (RN-06). |

#### 5.7 No repetición ni solapamiento
- **¿Este patrón ya fue usado en otra parte del proyecto?** [ ] Sí &nbsp;&nbsp; [X] No
- **¿Su propósito funcional se solapa con otro patrón seleccionado?** [ ] Sí &nbsp;&nbsp; [X] No

#### 5.8 Aplicación concreta al diseño
| Rol del patrón | Clase/componente del proyecto |
| :--- | :--- |
| **Target** (Interfaz Objetivo) | `PropertyDataAdapter` (define `adapt(raw: dict) -> PropertyCreate`) |
| **Adaptee** (Objeto a adaptar) | Diccionarios crudos extraídos de Metrocuadrado, Finca Raíz, Cien Cuadras |
| **Adapter** (Adaptador Concreto) | `MetrocuadradoAdapter`, `FincaraizAdapter`, `CiencuadrasAdapter` |
| **Client** (Cliente) | `buscasa.buscasa.crawlers.base.AsyncCrawler` / `crawler_service` |

**Descripción breve de cómo funcionará en el sistema:**  
Al finalizar la recolección de un registro crudo en memoria, el crawler invoca `adapter.adapt(item_crudo)`. Si el registro carece de URL original, el adaptador retorna `None` (aplicando RN-06). En caso contrario, retorna una instancia tipada de `PropertyCreate` lista para ser insertada directamente en la base de datos relacional.

```python
# buscasa/buscasa/crawlers/adapters/property_adapter.py
from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.property import PropertyCreate

class PropertyDataAdapter(ABC):
    @abstractmethod
    def adapt(self, raw_data: dict) -> Optional[PropertyCreate]:
        """Convierte datos crudos de un portal en PropertyCreate cumpliendo RN-06."""
        pass

class MetrocuadradoAdapter(PropertyDataAdapter):
    def adapt(self, raw: dict) -> Optional[PropertyCreate]:
        url = raw.get("canonicalUrl") or raw.get("url")
        if not url:
            return None  # RN-06: Descartar publicaciones sin URL original
            
        return PropertyCreate(
            codigo=str(raw.get("id")),
            titulo=raw.get("title", "Sin título"),
            precio=float(raw.get("vlrVenta") or raw.get("price", 0)),
            area=float(raw.get("m2Superficie") or 0),
            habitaciones=int(raw.get("rooms", 0)),
            banos=int(raw.get("baths", 0)),
            estrato=int(raw.get("stratum", 0)),
            comuna=int(raw.get("comunaId", 0)),
            url_origen=url,
            portal="Metrocuadrado"
        )
```

#### 5.9 Conclusión de decisión
- **Decisión final sobre este patrón:** [X] Se aprueba &nbsp;&nbsp; [ ] Se descarta  
- **Justificación final:** Resuelve de forma limpia la heterogeneidad de los portales externos y blinda el cumplimiento forzoso de la regla de negocio RN-06 para poblar la base de datos.

---

### FICHA 3: Facade (Estructural)

#### 5.1 Identificación general
- **Nombre del patrón:** Facade
- **Categoría:** [ ] Creacional &nbsp;&nbsp; [X] Estructural &nbsp;&nbsp; [ ] De comportamiento
- **Módulo, componente o funcionalidad donde se aplicará:**  
  Módulo de Estimación y Análisis Comparativo de Viviendas (`app/services/valuation_facade.py` y `app/api/v1/endpoints/properties.py`).

#### 5.2 Problema de diseño que se quiere resolver
La funcionalidad de "Estimar precio de una vivienda" (RU-02, RF-03 a RF-05) exige coordinar múltiples subsistemas técnicos independientes para construir una respuesta integral de cara al usuario:
1. `ModelInferenceService`: Carga el modelo predictivo activo en producción y genera la estimación base de la vivienda según sus variables (RF-03).
2. `CompetitiveSearchService`: Consulta la base de datos relacional para filtrar propiedades competidoras que cumplan estrictamente los 4 criterios de similitud de **RN-03** (misma comuna, mismo estrato, mismo tipo de inmueble y variación de área $\le 15\%$) (RF-04).
3. `CompetitiveMetricsService`: Agrega los precios de los competidores obtenidos en base de datos para calcular precio mínimo, promedio y máximo (RF-05).

Si los controladores de FastAPI (`app/api/v1/endpoints/properties.py`) invocaran directamente a cada uno de estos subsistemas, la capa de endpoints quedaría fuertemente acoplada a la coreografía interna de los cálculos, generando código espagueti, duplicando lógica y dificultando el cumplimiento del tiempo de respuesta máximo de 3 segundos (**RNF-05**).

#### 5.3 Evidencias del problema en el proyecto
- [X] Alto acoplamiento
- [ ] Multiplicidad de algoritmos
- [ ] Cambio frecuente de comportamiento
- [ ] Complejidad en la creación de objetos
- [ ] Necesidad de desacoplar emisor y receptor
- [ ] Necesidad de ampliar funcionalidad sin modificar la clase base
- [ ] Interfaz incompatible
- **Explicación contextualizada en el proyecto:**  
  En `app/services/property_service.py` actualmente solo existe una función parcial para consultar métricas en base de datos (`calcular_metricas_competitivas`). Al integrar la inferencia del modelo predictivo (`app/models/predictive_model.py`) y las reglas RN-03, la API requeriría un controlador sobredimensionado si no se introduce una fachada unificadora.

#### 5.4 Relación con el MVP
- **¿Por qué este problema sí debe resolverse en el MVP y no en una versión futura?**  
  Porque la estimación integral es el caso de uso central del arrendatario y propietario (F6). La API de FastAPI debe exponer un endpoint conciso (`/properties/estimate`) de alta velocidad y mantenibilidad.
- **¿Qué riesgo habría si no se aplica este patrón en el MVP?**  
  Controladores HTTP sobrecargados ("Fat Controllers"), lógica de negocio dispersa en la capa web e imposibilidad de reutilizar el cálculo en lote para el motor de "Mejor Oferta" (RF-02).
- **¿La implementación del patrón es razonable para el tiempo y complejidad del MVP?** [X] Sí &nbsp;&nbsp; [ ] No  
  *Justificación:* Es sumamente viable: una clase `PropertyValuationFacade` que orquesta secuencialmente los servicios especializados y devuelve un DTO consolidado.

#### 5.5 Análisis de adecuación del patrón
- **¿Qué parte del sistema cambia o podría cambiar?**  
  La forma en que se consultan los competidores o los modelos matemáticos subyacentes, sin que el contrato del endpoint HTTP se vea afectado.
- **¿Qué se desea desacoplar?**  
  La capa de endpoints de FastAPI de la complejidad algorítmica y de consultas relacionales de los subsistemas de estimación.
- **¿Qué ventaja concreta ofrece este patrón en este proyecto?**  
  Proporciona una interfaz unificada: `facade.generar_analisis_integral(inmueble_data, db)` que centraliza la orquestación y garantiza que las reglas de negocio se apliquen en el orden estricto.
- **¿Qué principio de diseño ayuda a cumplir?**  
  [X] Responsabilidad Única &nbsp;&nbsp; [X] Segregación de Interfaces &nbsp;&nbsp; [ ] Abierto/Cerrado  
  *Justificación técnica:* Mantiene los routers de FastAPI enfocados exclusivamente en la gestión de peticiones y respuestas HTTP (SRP), protegiendo al cliente de la complejidad interna del subsistema.

#### 5.6 Alternativas consideradas
| Patrón alternativo | ¿Por qué podría confundirse? | ¿Por qué no es el mejor en este caso? |
| :--- | :--- | :--- |
| **Mediator** | Ambos coordinan la comunicación entre componentes. | Mediator gestiona comunicación bidireccional compleja entre objetos "colegas"; Facade ofrece una interfaz de entrada unidireccional y simplificada a un conjunto de subsistemas. |
| **Lógica embebida en el router de FastAPI** | Es habitual en scripts pequeños. | Provoca alto acoplamiento, viola SRP y dificulta las pruebas unitarias automatizadas del flujo de estimación. |

#### 5.7 No repetición ni solapamiento
- **¿Este patrón ya fue usado en otra parte del proyecto?** [ ] Sí &nbsp;&nbsp; [X] No
- **¿Su propósito funcional se solapa con otro patrón seleccionado?** [ ] Sí &nbsp;&nbsp; [X] No

#### 5.8 Aplicación concreta al diseño
| Rol del patrón | Clase/componente del proyecto |
| :--- | :--- |
| **Facade** (Fachada) | `app.services.valuation_facade.PropertyValuationFacade` |
| **Subsystem Classes** (Subsistemas) | `ModelInferenceService`, `PropertySearchService`, `CompetitiveMetricsService` |
| **Client** (Cliente) | Endpoint FastAPI (`app/api/v1/endpoints/properties.py`) |

**Descripción breve de cómo funcionará en el sistema:**  
El endpoint HTTP de FastAPI recibe los datos del inmueble y llama a `PropertyValuationFacade.generar_analisis_integral()`. La fachada delega en orden: (1) invoca la inferencia de ML para obtener el precio base, (2) ejecuta la búsqueda en base de datos de competidores bajo RN-03, y (3) extrae métricas de mercado (mínimo, promedio, máximo), retornando la respuesta en menos de 3 segundos (**RNF-05**).

```python
# app/services/valuation_facade.py
from sqlalchemy.orm import Session
from app.schemas.property import PropertyEstimateRequest, ValuationResponse

class PropertyValuationFacade:
    def __init__(self, ml_service, search_service, metrics_service):
        self.ml_service = ml_service
        self.search_service = search_service
        self.metrics_service = metrics_service

    def generar_analisis_integral(self, req: PropertyEstimateRequest, db: Session) -> ValuationResponse:
        # 1. Estimación Base con Modelo ML (RF-03)
        precio_estimado = self.ml_service.predecir_precio(req)
        
        # 2. Competidores Similares según los 4 criterios de RN-03 (RF-04)
        competidores = self.search_service.buscar_similares(
            db, comuna=req.comuna, estrato=req.estrato, 
            tipo=req.tipo_inmueble, area=req.area
        )
        
        # 3. Métricas Estadísticas del Mercado (RF-05)
        metricas_mercado = self.metrics_service.calcular(competidores)
        
        return ValuationResponse(
            precio_estimado=precio_estimado,
            metricas_competitivas=metricas_mercado
        )
```

#### 5.9 Conclusión de decisión
- **Decisión final sobre este patrón:** [X] Se aprueba &nbsp;&nbsp; [ ] Se descarta  
- **Justificación final:** Provee un punto de entrada limpio y estructurado a los subsistemas analíticos, reduciendo la complejidad del controlador web.

---

### FICHA 4: Template Method (De Comportamiento)

#### 5.1 Identificación general
- **Nombre del patrón:** Template Method
- **Categoría:** [ ] Creacional &nbsp;&nbsp; [ ] Estructural &nbsp;&nbsp; [X] De comportamiento
- **Módulo, componente o funcionalidad donde se aplicará:**  
  Módulo de Preparación de Datos y Reentrenamiento del Modelo (`app/services/training_pipeline.py`, RF-09 y RF-10).

#### 5.2 Problema de diseño que se quiere resolver
El ciclo de preprocesamiento de datos y reentrenamiento del modelo predictivo (Prioridades Altas F2 y F3) exige una secuencia algorítmica obligatoria e invariable impuesta por reglas de negocio críticas:
1. Cargar el dataset consolidado desde la base de datos relacional.
2. Limpiar y filtrar datos garantizando **RN-06** (descartar registros sin enlace original).
3. Particionar estrictamente los datos en entrenamiento (80%) y validación (20%).
4. **Cumplir RN-02**: Calcular y ajustar los parámetros de transformación (escalado numérico y codificación One-Hot) **estrictamente sobre el conjunto de entrenamiento** y luego aplicarlos a validación, prohibiendo cualquier cruce de información que genere fuga de datos (*data leakage*).
5. Entrenar el estimador predictivo de Machine Learning.
6. Evaluar el modelo calculando la métrica RMSE sobre el conjunto de validación.
7. **Cumplir RN-01 y RNF-02**: Evaluar la compuerta de aceptación. Si $\text{RMSE} \le 12\%$, actualizar el artefacto activo en producción (`PredictiveModel.en_produccion = True`). Si $\text{RMSE} > 12\%$, **abortar el despliegue** y notificar la anomalía.

Si cada algoritmo o experimentación implementa su propio script libremente, un desarrollador podría alterar el orden de los pasos, provocar fuga de datos calculando escaladores antes de la partición (violando **RN-02**) u omitir la validación de la métrica RMSE antes de desplegar (violando **RN-01**).

#### 5.3 Evidencias del problema en el proyecto
- [ ] Alto acoplamiento
- [X] Multiplicidad de algoritmos
- [ ] Cambio frecuente de comportamiento
- [ ] Complejidad en la creación de objetos
- [ ] Necesidad de desacoplar emisor y receptor
- [ ] Necesidad de ampliar funcionalidad sin modificar la clase base
- [ ] Interfaz incompatible
- **Explicación contextualizada en el proyecto:**  
  En `app/models/predictive_model.py` se cuenta con la entidad de base de datos que audita las versiones de modelos (`version`, `rmse`, `en_produccion`). El reentrenamiento debe correr en segundo plano (RNF-08). Sin una plantilla algorítmica estricta, la integridad metodológica de Machine Learning queda expuesta a errores humanos durante el ciclo de vida del modelo.

#### 5.4 Relación con el MVP
- **¿Por qué este problema sí debe resolverse en el MVP y no en una versión futura?**  
  Porque el reentrenamiento y la preparación de datos son de **Prioridad Alta (F2, F3)**. Un modelo que llegue a producción con sesgo por fuga de datos o con error inaceptable degrada por completo la confianza de los usuarios en la plataforma.
- **¿Qué riesgo habría si no se aplica este patrón en el MVP?**  
  Riesgo crítico de fuga de datos (**RN-02**) y despliegue accidental de modelos con RMSE superior al límite permitido (**RN-01**), arruinando las estimaciones de precios.
- **¿La implementación del patrón es razonable para el tiempo y complejidad del MVP?** [X] Sí &nbsp;&nbsp; [ ] No  
  *Justificación:* Es totalmente viable: una clase base abstracta (`BaseModelTrainingPipeline`) con un método concreto que define el esqueleto de ejecución y pasos primitivos abstractos para el algoritmo específico.

#### 5.5 Análisis de adecuación del patrón
- **¿Qué parte del sistema cambia o podría cambiar?**  
  El algoritmo matemático específico (Random Forest, Gradient Boosting, Ridge Regression) o sus hiperparámetros.
- **¿Qué se desea desacoplar?**  
  La estructura invariable del ciclo de vida del reentrenamiento respecto a los detalles particulares de ajuste de cada algoritmo.
- **¿Qué ventaja concreta ofrece este patrón en este proyecto?**  
  Garantiza por diseño que **ninguna subclase pueda omitir la partición 80/20, el cálculo de preprocesamiento aislado sobre train (RN-02) ni la validación del umbral RMSE (RN-01)** antes de actualizar producción.
- **¿Qué principio de diseño ayuda a cumplir?**  
  [X] Abierto/Cerrado &nbsp;&nbsp; [X] Responsabilidad Única &nbsp;&nbsp; [ ] Inversión de Dependencias  
  *Justificación técnica:* El flujo macro queda cerrado a modificaciones que comprometan la calidad, pero abierto a la extensión de nuevos estimadores mediante herencia ("Principio de Hollywood").

#### 5.6 Alternativas consideradas
| Patrón alternativo | ¿Por qué podría confundirse? | ¿Por qué no es el mejor en este caso? |
| :--- | :--- | :--- |
| **Strategy** | Ambos permiten variar algoritmos. | Strategy reemplaza el algoritmo completo por composición; aquí el esqueleto del pipeline de 7 pasos debe ser **fijo e inmutable** para garantizar las reglas del negocio. |
| **Chain of Responsibility** | Encadena pasos secuenciales. | CoR permite que un eslabón corte la cadena arbitrariamente; no modela adecuadamente un flujo determinista con control de calidad y persistencia de versiones. |

#### 5.7 No repetición ni solapamiento
- **¿Este patrón ya fue usado en otra parte del proyecto?** [ ] Sí &nbsp;&nbsp; [X] No
- **¿Su propósito funcional se solapa con otro patrón seleccionado?** [ ] Sí &nbsp;&nbsp; [X] No

#### 5.8 Aplicación concreta al diseño
| Rol del patrón | Clase/componente del proyecto |
| :--- | :--- |
| **AbstractClass** (Clase Abstracta) | `app.services.training_pipeline.BaseModelTrainingPipeline` |
| **ConcreteClass** (Clases Concretas) | `RandomForestTrainingPipeline`, `GradientBoostingTrainingPipeline` |
| **Template Method** (Método Plantilla) | `ejecutar_pipeline_completo()` |
| **Primitive Operations** (Operaciones Primitivas) | `_limpiar_datos()`, `_particionar_y_escalar_sin_fuga()`, `_entrenar_modelo()`, `_evaluar_rmse()` |

**Descripción breve de cómo funcionará en el sistema:**  
Al accionar el reentrenamiento manual o programado, se invoca `pipeline.ejecutar_pipeline_completo()`. La superclase ejecuta en orden riguroso la limpieza, partición y escalado exclusivo sobre el 80% (RN-02), delega en la subclase concreta el ajuste matemático, evalúa el RMSE y valida RN-01 antes de marcar `en_produccion = True` en la base de datos relacional.

```python
# app/services/training_pipeline.py
from abc import ABC, abstractmethod
from app.models.predictive_model import PredictiveModel

class BaseModelTrainingPipeline(ABC):
    def ejecutar_pipeline_completo(self, db_session) -> PredictiveModel:
        """Template Method: Define el esqueleto invariable del reentrenamiento."""
        datos_crudos = self._cargar_datos(db_session)
        datos_limpios = self._limpiar_y_filtrar_rn06(datos_crudos)
        
        # RN-02: Partición estricta 80/20 y escalado calculado SOLO en entrenamiento
        X_train, X_val, y_train, y_val = self._particionar_80_20(datos_limpios)
        X_train_proc, X_val_proc = self._ajustar_preprocesamiento_train(X_train, X_val)
        
        # Paso primitivo delegado al estimador concreto
        modelo_entrenado = self._entrenar_estimador(X_train_proc, y_train)
        
        # Evaluación obligatoria de RMSE
        rmse_calculado = self._evaluar_rmse(modelo_entrenado, X_val_proc, y_val)
        
        # RN-01 / RNF-02: Criterio de aceptación (umbral <= 12%)
        if rmse_calculado <= 0.12:
            return self._promover_a_produccion(db_session, modelo_entrenado, rmse_calculado)
        else:
            self._abortar_despliegue(rmse_calculado)
            raise ValueError(f"Modelo rechazado: RMSE {rmse_calculado:.2%} supera el límite permitido.")

    @abstractmethod
    def _entrenar_estimador(self, X_train, y_train):
        """Paso abstracto que implementa cada algoritmo concreto."""
        pass
```

#### 5.9 Conclusión de decisión
- **Decisión final sobre este patrón:** [X] Se aprueba &nbsp;&nbsp; [ ] Se descarta  
- **Justificación final:** Protege por diseño la rigurosidad científica del modelo de Machine Learning y garantiza el cumplimiento irrestricto de RN-01 y RN-02.

---

### FICHA 5: Strategy (De Comportamiento)

#### 5.1 Identificación general
- **Nombre del patrón:** Strategy
- **Categoría:** [ ] Creacional &nbsp;&nbsp; [ ] Estructural &nbsp;&nbsp; [X] De comportamiento
- **Módulo, componente o funcionalidad donde se aplicará:**  
  Módulo de Obtención de Margen Sugerido de Publicación (`app/services/pricing_strategies.py`, RF-06 y RN-04).

#### 5.2 Problema de diseño que se quiere resolver
En la funcionalidad de "Obtener margen sugerido" (**F4**, RF-06), el propietario requiere calcular un precio de publicación óptimo adaptado a diferentes objetivos comerciales y condiciones del mercado inmobiliario:
1. **Estrategia de Liquidez Rápida (*Fast Liquidity*):** Aplica un límite inferior de -5% sobre la estimación base (**RN-04**) para acelerar la colocación del inmueble en el mercado, contrastándolo con el precio mínimo de los competidores locales.
2. **Estrategia de Máxima Rentabilidad (*Max Profitability*):** Aplica un límite superior de +5% sobre la estimación base (**RN-04**) para capturar el mayor retorno posible, asegurando que no exceda el precio máximo de los competidores directos.
3. **Estrategia Balanceada de Mercado (*Market Balanced*):** Modula el margen combinando la estimación base de ML con el precio promedio ponderado de los inmuebles similares obtenidos según **RN-03**.

Si esta lógica se resuelve mediante sentencias condicionales `if/elif` dentro de `property_service.py`, el código se vuelve rígido ante nuevos esquemas comerciales (por ejemplo, estrategias con ajuste por inflación o estacionalidad), dificulta las pruebas unitarias independientes de cada fórmula financiera y viola el principio Open/Closed.

#### 5.3 Evidencias del problema en el proyecto
- [X] Alto acoplamiento
- [X] Multiplicidad de algoritmos
- [X] Cambio frecuente de comportamiento
- [ ] Complejidad en la creación de objetos
- [ ] Necesidad de desacoplar emisor y receptor
- [X] Necesidad de ampliar funcionalidad sin modificar la clase base
- [ ] Interfaz incompatible
- **Explicación contextualizada en el proyecto:**  
  El cálculo de márgenes comerciales y rangos sugeridos (RF-06, RN-04) requiere aplicar diferentes reglas matemáticas sobre la estimación base de ML (RF-03) y las métricas competitivas (RF-05). Sin Strategy, el cálculo queda atrapado en condicionales monolíticos dentro del servicio de propiedades.

#### 5.4 Relación con el MVP
- **¿Por qué este problema sí debe resolverse en el MVP y no en una versión futura?**  
  Porque "Obtener margen sugerido" es una funcionalidad de **Prioridad Alta (F4)**. Constituye la recomendación accionable que diferencia a la plataforma de un portal de anuncios tradicional.
- **¿Qué riesgo habría si no se aplica este patrón en el MVP?**  
  Fórmulas financieras acopladas y difíciles de calibrar, imposibilitando que el sistema ofrezca recomendaciones diferenciadas para el propietario según su perfil de necesidad (urgencia vs. rentabilidad).
- **¿La implementación del patrón es razonable para el tiempo y complejidad del MVP?** [X] Sí &nbsp;&nbsp; [ ] No  
  *Justificación:* Es sumamente limpia en Python: una interfaz abstracta `PricingStrategy` con su método `calcular_margen(precio_base, metricas_mercado)` y 3 estrategias concretas desacopladas.

#### 5.5 Análisis de adecuación del patrón
- **¿Qué parte del sistema cambia o podría cambiar?**  
  Las fórmulas matemáticas y políticas comerciales de cálculo de márgenes y rangos de publicación.
- **¿Qué se desea desacoplar?**  
  El servicio de tasación (`PricingMarginCalculator`) de los algoritmos financieros específicos de fijación de márgenes.
- **¿Qué ventaja concreta ofrece este patrón en este proyecto?**  
  Permite intercambiar dinámicamente en tiempo de ejecución la estrategia de publicación seleccionada por el usuario o sugerida por el sistema, facilitando la adición de nuevas políticas comerciales sin modificar el servicio central.
- **¿Qué principio de diseño ayuda a cumplir?**  
  [X] Abierto/Cerrado &nbsp;&nbsp; [X] Responsabilidad Única &nbsp;&nbsp; [X] Inversión de Dependencias  
  *Justificación técnica:* Cada algoritmo de pricing se encapsula en su propia clase (SRP), y el contexto depende exclusivamente de la abstracción `PricingStrategy` (OCP y DIP).

#### 5.6 Alternativas consideradas
| Patrón alternativo | ¿Por qué podría confundirse? | ¿Por qué no es el mejor en este caso? |
| :--- | :--- | :--- |
| **Template Method** | Ambos permiten variar comportamientos algorítmicos. | Template Method varía pasos internos mediante herencia dentro de un flujo fijo; Strategy intercambia algoritmos completos y autónomos mediante composición en tiempo de ejecución. |
| **Condicionales if/else en el servicio** | Es la solución trivial más común. | Provoca código espagueti, viola OCP y mezcla la gestión de base de datos con las fórmulas financieras de negocio. |

#### 5.7 No repetición ni solapamiento
- **¿Este patrón ya fue usado en otra parte del proyecto?** [ ] Sí &nbsp;&nbsp; [X] No
- **¿Su propósito funcional se solapa con otro patrón seleccionado?** [ ] Sí &nbsp;&nbsp; [X] No  
  *Explicación:* Template Method se aplica en el **pipeline de reentrenamiento del modelo de Machine Learning** (secuencia de pasos invariable), mientras que Strategy se aplica exclusivamente a las **fórmulas intercambiables de cálculo de margen comercial** de cara al propietario. Son responsabilidades y contextos totalmente ortogonales.

#### 5.8 Aplicación concreta al diseño
| Rol del patrón | Clase/componente del proyecto |
| :--- | :--- |
| **Strategy** (Estrategia Abstracta) | `app.services.pricing_strategies.PricingStrategy` |
| **ConcreteStrategy 1** | `LiquidityPricingStrategy` (calcula límite inferior -5% por RN-04) |
| **ConcreteStrategy 2** | `ProfitabilityPricingStrategy` (calcula límite superior +5% por RN-04) |
| **ConcreteStrategy 3** | `MarketBalancedPricingStrategy` (modula según promedio de competidores RF-05) |
| **Context** (Contexto) | `app.services.pricing_strategies.PricingMarginCalculator` |

**Descripción breve de cómo funcionará en el sistema:**  
El calculador de márgenes recibe la estimación base de ML y las métricas de mercado de los competidores. Dependiendo de la solicitud o del objetivo comercial seleccionado, configura la estrategia correspondiente (`set_strategy`) y ejecuta `calcular_rango()`, retornando los valores acotados según las reglas del negocio.

```python
# app/services/pricing_strategies.py
from abc import ABC, abstractmethod
from typing import Dict

class PricingStrategy(ABC):
    @abstractmethod
    def calcular_margen(self, precio_base: float, metricas_mercado: Dict[str, float]) -> Dict[str, float]:
        """Calcula el rango de publicación sugerido según la política de negocio."""
        pass

class LiquidityPricingStrategy(PricingStrategy):
    def calcular_margen(self, precio_base: float, metricas_mercado: Dict[str, float]) -> Dict[str, float]:
        # RN-04: Límite inferior (-5%) para liquidez rápida, respetando piso de mercado
        minimo_mercado = metricas_mercado.get("precio_minimo", 0.0)
        limite_inferior = max(precio_base * 0.95, minimo_mercado) if minimo_mercado > 0 else precio_base * 0.95
        return {
            "estrategia": "Liquidez Rápida",
            "precio_sugerido": limite_inferior,
            "limite_inferior": precio_base * 0.95,
            "limite_superior": precio_base
        }

class ProfitabilityPricingStrategy(PricingStrategy):
    def calcular_margen(self, precio_base: float, metricas_mercado: Dict[str, float]) -> Dict[str, float]:
        # RN-04: Límite superior (+5%) para máxima rentabilidad
        maximo_mercado = metricas_mercado.get("precio_maximo", float("inf"))
        limite_superior = min(precio_base * 1.05, maximo_mercado) if maximo_mercado > 0 else precio_base * 1.05
        return {
            "estrategia": "Máxima Rentabilidad",
            "precio_sugerido": limite_superior,
            "limite_inferior": precio_base,
            "limite_superior": precio_base * 1.05
        }

class MarketBalancedPricingStrategy(PricingStrategy):
    def calcular_margen(self, precio_base: float, metricas_mercado: Dict[str, float]) -> Dict[str, float]:
        # Ponderación equilibrada entre modelo ML y promedio de competidores (RF-05)
        promedio_mercado = metricas_mercado.get("precio_promedio", precio_base)
        precio_balanceado = (precio_base * 0.6) + (promedio_mercado * 0.4)
        return {
            "estrategia": "Balanceada de Mercado",
            "precio_sugerido": precio_balanceado,
            "limite_inferior": precio_base * 0.95,
            "limite_superior": precio_base * 1.05
        }

class PricingMarginCalculator:
    def __init__(self, strategy: PricingStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: PricingStrategy) -> None:
        self._strategy = strategy

    def calcular_rango(self, precio_base: float, metricas_mercado: Dict[str, float]) -> Dict[str, float]:
        return self._strategy.calcular_margen(precio_base, metricas_mercado)
```

#### 5.9 Conclusión de decisión
- **Decisión final sobre este patrón:** [X] Se aprueba &nbsp;&nbsp; [ ] Se descarta  
- **Justificación final:** Provee desacoplamiento total en el cálculo de márgenes comerciales para propietarios, permitiendo evolucionar las políticas de precios sin afectar el servicio central.

---

## 6. Consolidado final de los patrones seleccionados

| Nº | Patrón GoF | Categoría | Módulo / Funcionalidad | Problema que resuelve | Justificación en el MVP | ¿Se repite? |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| **1** | **Factory Method** | Creacional | Orquestación de Crawlers / Ingesta (`buscasa`, `crawler_service`) | Acoplamiento a scrapers específicos y dificultad para añadir nuevos portales sin tocar código existente. | Resuelve **RNF-07** permitiendo incorporar nuevos portales mediante configuración en la funcionalidad de alta prioridad F1. | **No** |
| **2** | **Adapter** | Estructural | Normalización de Catálogo (`adapters`, `app/schemas/property`) | Respuestas crudas incompatibles (JSON/HTML heterogéneos) entre Metrocuadrado, Finca Raíz y Cien Cuadras. | Garantiza la regla **RN-06** (URL original obligatoria) y transforma los datos externos al esquema canónico para la base de datos relacional. | **No** |
| **3** | **Facade** | Estructural | Estimación y Análisis de Vivienda (`valuation_facade`, `endpoints`) | Complejidad de coordinar los subsistemas (ML, búsqueda de similares y estadísticas) desde la API. | Evita controladores sobredimensionados en FastAPI, asegura la regla **RN-03**, y cumple con el tiempo de respuesta $\le 3\text{s}$ (**RNF-05**). | **No** |
| **4** | **Template Method** | Comportamiento | Preparación de Datos y Reentrenamiento (`training_pipeline`) | Riesgo de alterar el orden del flujo de ML, generar fuga de datos (*data leakage*) o saltarse el umbral de aceptación RMSE. | Garantiza el cumplimiento forzoso de **RN-01** (umbral RMSE) y **RN-02** (preprocesamiento aislado sobre train) en las funcionalidades de alta prioridad F2 y F3. | **No** |
| **5** | **Strategy** | Comportamiento | Obtención de Margen Sugerido (`pricing_strategies`) | Rigidez y acoplamiento en el cálculo de rangos de publicación y objetivos comerciales para propietarios. | Permite intercambiar dinámicamente las estrategias de liquidez vs rentabilidad (**RN-04**) en la funcionalidad de alta prioridad F4 sin violar OCP. | **No** |

---

## 7. Validación global de consistencia

| Criterio | Sí | No | Observación |
| :--- | :---: | :---: | :--- |
| **Cada patrón responde a un problema real del sistema** | **[X]** | [ ] | Cada patrón atiende directamente requerimientos funcionales (RF-01 a RF-10), no funcionales (RNF-03 a RNF-08) o reglas de negocio (RN-01 a RN-06) explícitos en el modelo verbal. |
| **Los 5 patrones son distintos entre sí** | **[X]** | [ ] | Se seleccionó una distribución equilibrada: **1 Creacional** (Factory Method), **2 Estructurales** (Adapter, Facade) y **2 de Comportamiento** (Template Method, Strategy). Ninguno se repite. |
| **Ningún patrón fue incluido solo para cumplir con el número** | **[X]** | [ ] | Todos resuelven dolores de diseño evidenciados en el código y en el flujo del sistema. Se descartaron alternativas con sobreingeniería (Abstract Factory, Chain of Responsibility, Decorator). |
| **Todos los patrones caben en el alcance del MVP** | **[X]** | [ ] | Su implementación en Python y FastAPI es directa, limpia y no añade dependencias externas pesadas, respetando los tiempos del proyecto. |
| **La selección evita sobreingeniería** | **[X]** | [ ] | No se inventaron patrones innecesarios en autenticación (que se resuelve con FastAPI y JWT) ni en persistencia CRUD básica, concentrando el diseño en los módulos analíticos y de ingesta. |
| **Existe coherencia entre problema, solución y diseño** | **[X]** | [ ] | Los roles de cada patrón mapean de forma exacta a los módulos y componentes del repositorio (`buscasa`, `crawler_factory`, `training_pipeline`, `valuation_facade`, `pricing_strategies`). |

---

## 8. Conclusión general del análisis

La selección de estos cinco patrones GoF conforma una **arquitectura en capas desacoplada, extensible y altamente mantenible**, diseñada a la medida de los desafíos de un sistema inmobiliario impulsado por datos y Machine Learning:

1. En la **capa de ingestión**, el binomio **Factory Method + Adapter** resuelve integralmente la heterogeneidad de fuentes externas: permite incorporar nuevos portales mediante configuración sin modificar el orquestador (**RNF-07**) y garantiza que cualquier payload de scraping sea normalizado y validado bajo la regla de negocio **RN-06** antes de ingresar al catálogo consolidado en la base de datos relacional.
2. En la **capa de procesamiento analítico y MLOps**, el patrón **Template Method** actúa como un blindaje de calidad algorítmica: estandariza el flujo de reentrenamiento, elimina cualquier riesgo de fuga de datos (**RN-02**) y fuerza la evaluación estricta del criterio de aceptación por RMSE (**RN-01**, **RNF-02**), permitiendo que el sistema evolucione a nuevos estimadores sin comprometer la confiabilidad en producción.
3. En la **capa de presentación y servicios de dominio**, el patrón **Facade** simplifica el consumo de múltiples subsistemas complejos (inferencia predictiva, filtrado estricto de competidores por **RN-03** y cálculo de métricas), ofreciendo a los controladores de FastAPI una interfaz limpia, cohesiva y de respuesta rápida (**RNF-05**).
4. En la **capa de políticas comerciales**, el patrón **Strategy** desacopla las fórmulas de cálculo del margen sugerido (**RN-04**), permitiendo que los propietarios evalúen de forma independiente escenarios de liquidez rápida, máxima rentabilidad o balance de mercado sin modificar el núcleo del servicio de tasación.

Esta arquitectura cumple estrictamente con el principio de **no sobreingeniería**, garantizando que cada línea de diseño aporte valor directo al negocio y sea viable en tiempo y complejidad técnica dentro del MVP.

---

## 9. Regla de decisión recomendada

Para la aprobación y futura incorporación de patrones en fases posteriores del proyecto, se establece la siguiente regla de decisión:

1. **Un patrón solo debe incluirse si resuelve un problema real del sistema:** Debe existir un requerimiento funcional (RF), no funcional (RNF) o regla de negocio (RN) verificable que justifique su adopción.
2. **Debe ser implementable dentro del alcance del MVP:** Si la solución nativa del framework (como las dependencias o middlewares de FastAPI) resuelve el problema de forma idiomática y limpia, se prefiere la solución nativa antes de inventar estructuras abstractas GoF.
3. **No debe repetir la función de otro patrón ya seleccionado:** Cada patrón en la arquitectura debe tener una responsabilidad ortogonal (creación de objetos, adaptación de esquemas, simplificación de interfaces, invariabilidad de pipelines o intercambiabilidad de políticas comerciales).
4. **Debe mejorar el diseño sin añadir complejidad innecesaria:** Si el costo cognitivo de mantener las clases abstractas e interfaces supera el beneficio en desacoplamiento y extensibilidad, el patrón debe descartarse.
