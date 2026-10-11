# Plantilla de Análisis Principios SOLID

Instrumento de apoyo para justificar los principios SOLID dentro del alcance de un producto mínimo viable.

---

## 1. Información general

- **Lenguaje / Framework:** Python 3.14 / FastAPI / SQLAlchemy / HTTPX / Scrapy (`buscasa`)
- **Tipo de análisis:** Análisis de diseño arquitectónico y evolución de código hacia el MVP
- **Contexto:** Sistema de Búsqueda y Estimación Inmobiliaria (Medellín). Evaluación de la evolución técnica entre la **Primera Entrega** (Modelo Verbal y prototipo exploratorio inicial en `C:\Users\heman\inmobiliaria-fastapi`) y la **Segunda Entrega** (Diseño formal de arquitectura de software para el MVP en `C:\Users\heman\entregable_2`, integrando patrones GoF y principios SOLID en las funcionalidades priorizadas).

---

## 2. Objetivo del análisis

Evaluar el estado del diseño y código del componente central de servicios del sistema, determinando su grado de cumplimiento de los cinco principios SOLID. El alcance abarca la evolución del componente entre el modelo verbal inicial y la arquitectura requerida por el Producto Mínimo Viable (MVP), identificando deudas técnicas de acoplamiento, rigidez y falta de cohesión, y estableciendo las pautas de refactorización arquitectónica para garantizar un software extensible, mantenible y testeable dentro de los límites del MVP (F1 a F7), donde la información extraída por los crawlers se procesa en memoria y se prepara para su inserción directa en la base de datos relacional.

---

## 3. Descripción breve del componente

- **Componente evaluado:** Módulo de Ingesta y Orquestación de Crawlers (`app/services/crawler_service.py` y `buscasa/buscasa/crawlers/`), integrado con el Módulo de Estimación y Margen Inmobiliario (`app/services/property_service.py`).
- **Función principal:**  
  Orquestar la recolección asíncrona de inmuebles desde portales externos configurados (**F1 / RF-08**), normalizar las publicaciones para consolidar el catálogo (**F5 / RF-01**), filtrar registros según reglas de calidad (**RN-06**), y articular el cálculo de métricas competitivas (**RF-05**) y margen sugerido de publicación (**F4 / RF-06, RN-04**) para propietarios, canalizando los datos procesados para su futura persistencia directa en la base de datos relacional del sistema (`app/models/property.py`).
- **Responsabilidades actuales (Código inicial - Entrega 1):**  
  1. `crawler_service.py`: Iniciar el job en BD, simular la extracción con retardos fijos, capturar excepciones genéricas con prints en consola y finalizar el job actualizando contadores.
  2. `buscasa/buscasa/crawlers/base.py` (`AsyncCrawler`): Configurar contexto SSL y cliente HTTP, gestionar semáforos de concurrencia, realizar peticiones GET/POST, ejecutar el scraping abstracto y gestionar directamente la serialización de datos de salida.
  3. `property_service.py`: Insertar inmuebles en base de datos y calcular límites de área ($\pm 15\%$) para invocar consultas SQL agregadas de competidores.
- **Clases / interfaces involucradas:**  
  `AsyncCrawler`, `FincaraizCrawler`, `MetrocuadradoCrawler`, `CiencuadrasCrawler`, funciones `orquestar_extraccion`, `crear_nuevo_inmueble`, `calcular_metricas_competitivas`, y modelos `CrawlerJob`, `Property`.
- **Dependencias principales:**  
  `httpx`, `truststore`, `asyncio`, `sqlalchemy.orm.Session`, módulos `crud_crawlerjob` y `crud_property`.
- **Relación con otros módulos:**  
  Es el proveedor de datos crudos para el pipeline de preprocesamiento y entrenamiento (**F2, F3**), la fuente de datos del catálogo consolidado (**F5**) y el motor de cálculo para los endpoints de la API REST en `app/api/v1/endpoints/`.

---

## 4. Resumen ejecutivo

| Principio | Nivel de cumplimiento | Observación general |
| :--- | :---: | :--- |
| **S - Single Responsibility Principle** | **Bajo** | En la primera entrega, `AsyncCrawler` mezcla transporte HTTP, concurrencia de red y formateo de persistencia de salida. Asimismo, `crawler_service.py` mezcla control de flujo con logs de consola y persistencia acoplada. |
| **O - Open/Closed Principle** | **Bajo** | Agregar un nuevo portal inmobiliario (requerido por **RNF-07**) obligaba a modificar el código interno de `crawler_service.py` mediante condicionales `if/elif`, sin un mecanismo de extensión polimórfico. |
| **L - Liskov Substitution Principle** | **Medio** | Las subclases de crawler (`FincaraizCrawler`, etc.) implementan `run()`, pero la heterogeneidad de los diccionarios retornados rompe la sustitución uniforme cuando el orquestador espera entidades canónicas listas para base de datos. |
| **I - Interface Segregation Principle** | **Bajo** | `AsyncCrawler` acopla métodos de transporte de red, extracción y formateo de almacenamiento en una sola interfaz rígida, obligando a los consumidores a depender de métodos de persistencia que no corresponden a su responsabilidad. |
| **D - Dependency Inversion Principle** | **Bajo** | `crawler_service.py` y `property_service.py` dependen directamente de funciones y módulos CRUD concretos (`crud_crawlerjob`, `crud_property`) y clases concretas de red, en lugar de abstracciones inyectables. |

- **Conclusión global del componente:**  
  El código de la primera entrega resolvió la viabilidad operativa inicial mediante scripts funcionales, pero presenta un diseño monolítico y acoplado. Para cumplir con las exigencias del MVP (especialmente **RNF-07** sobre extensibilidad de portales, **RN-06** sobre filtrado obligatorio y **RN-04** sobre estrategias de margen), el componente requiere refactorización hacia una arquitectura orientada a interfaces y desacoplada mediante patrones GoF (Factory Method, Adapter, Strategy), preparando la capa para la inserción directa de las propiedades en la base de datos relacional.
- **Nivel general de calidad del diseño:** **Bajo a Medio** (deuda técnica concentrada en la capa de servicios).
- **Prioridad de intervención:** **Alta** (componente nuclear de las funcionalidades F1, F4 y F5).

---

## 5. Análisis de Principios SOLID

---

### 5.1 S - Single Responsibility Principle (SRP)

> **Definición:** Una clase o módulo debe tener una sola razón para cambiar.

| Elemento evaluado | Evaluación |
| :--- | :--- |
| `buscasa.buscasa.crawlers.base.AsyncCrawler` y `app.services.crawler_service` | **No cumple** |

#### Evidencia observada:
- En `buscasa/buscasa/crawlers/base.py`, la clase `AsyncCrawler` acumula múltiples responsabilidades:
  1. Configuración de bajo nivel de transporte de red y certificados TLS del sistema operativo (`_build_client` con `truststore` y `httpx.Limits`).
  2. Control de concurrencia y tasa de transferencia mediante semáforos y pausas (`_get`, `_post`).
  3. Definición del contrato de recolección de datos (`run`).
  4. Lógica de formateo y almacenamiento directo de datos de salida acoplada en la misma clase base.
- En `app/services/crawler_service.py`, la función `orquestar_extraccion` mezcla la coordinación del ciclo de vida del job, la gestión de excepciones de negocio, la simulación de tiempo (`time.sleep(10)`) y salidas a la consola del sistema con `print()`.

#### Preguntas guía:
1. *¿La clase tiene una única responsabilidad claramente definida?*  
   **No.** `AsyncCrawler` actúa como cliente HTTP, gestor de concurrencia, scraper y formateador de persistencia simultáneamente.
2. *¿Mezcla lógica de negocio, acceso a datos, validación, presentación o infraestructura?*  
   **Sí.** Mezcla infraestructura de red (`httpx`, `ssl`), manipulación de almacenamiento de salida y lógica de extracción de datos.
3. *¿Existen múltiples razones de cambio en el mismo artefacto?*  
   **Sí.** Si cambia la política de certificados SSL de Windows, si cambia el destino o formato de los datos de salida, o si cambia el mecanismo de extracción web, la clase `AsyncCrawler` debe ser modificada.
4. *¿El nombre de la clase refleja una sola intención?*  
   El nombre sugiere ser únicamente un crawler asíncrono, pero su implementación asume tareas de persistencia e infraestructura de red.

#### Hallazgos:
- Falta de alta cohesión en la clase base de scraping.
- Imposibilidad de reutilizar el cliente HTTP o el rate limiter en otros módulos sin arrastrar código de almacenamiento de datos.
- Mezcla de la extracción de datos en memoria con la lógica de persistencia.

#### Impacto técnico potencial:
- Al implementar más adelante la inserción directa de las propiedades en la base de datos relacional de PostgreSQL/SQLite para el catálogo consolidado (**F5**), se tendría que alterar directamente la clase base de los extractores si no se desacoplan las responsabilidades desde el diseño del MVP.
- Dificultad para realizar pruebas unitarias aisladas sin lidiar con los efectos secundarios de almacenamiento.

#### Recomendaciones:
- Separar la responsabilidad de extracción de la de almacenamiento: el crawler debe concentrarse exclusivamente en extraer los registros en memoria (`async def extract() -> List[dict]`).
- Delegar la persistencia directa en la base de datos relacional (`app/models/property.py`) a un servicio o repositorio de persistencia dedicado (`PropertyRepository`).
- Mantener en `AsyncCrawler` exclusivamente la coordinación de la recolección asíncrona de datos.

---

### 5.2 O - Open/Closed Principle (OCP)

> **Definición:** Las entidades de software deben estar abiertas para extensión, pero cerradas para modificación.

| Elemento evaluado | Evaluación |
| :--- | :--- |
| Orquestación de Crawlers (`crawler_service.py`) y Cálculo de Margen (`property_service.py`) | **No cumple** |

#### Evidencia observada:
- En `app/services/crawler_service.py`, la función `orquestar_extraccion` recibe `portal_nombre: str`. Al querer soportar portales adicionales en la evolución del MVP, la implementación procedimental obliga a incorporar bifurcaciones de código:
  ```python
  # Estructura inicial rígida:
  if portal_nombre == "fincaraiz":
      crawler = FincaraizCrawler()
  elif portal_nombre == "metrocuadrado":
      crawler = MetrocuadradoCrawler()
  # Modificar este archivo ante cada nuevo portal viola OCP
  ```
- En `app/services/property_service.py`, el cálculo de márgenes comerciales para el propietario (**RF-06, RN-04**) se encontraba planteado de forma estática sobre la consulta SQL, sin permitir alternar entre políticas de liquidez rápida (-5%) o máxima rentabilidad (+5%) sin alterar el método existente.

#### Preguntas guía:
1. *¿Agregar funcionalidad obliga a modificar código estable?*  
   **Sí.** Incorporar un cuarto portal inmobiliario (ej. Properati o LaHaus) exige editar directamente el servicio de orquestación, violando la regla **RNF-07** (*"permitir incorporar nuevos portales mediante configuración sin rediseñar la arquitectura"*).
2. *¿Se usan abstracciones, polimorfismo o estrategias de extensión?*  
   En la primera entrega no se utilizaban; el código dependía de llamadas directas y nombres cableados en texto.
3. *¿Existen estructuras if/switch crecientes basadas en tipos o casos?*  
   **Sí.** La selección de la rutina de scraping y la fijación de márgenes estaban sujetas a condicionales crecientes.
4. *¿El diseño favorece agregar comportamientos sin romper lo ya construido?*  
   **No.** Modificar el orquestador introduce el riesgo de romper la ejecución de los crawlers ya estabilizados.

#### Hallazgos:
- Incumplimiento explícito del requisito no funcional **RNF-07**.
- Acoplamiento directo entre el invocador de tareas y las clases concretas de extracción.

#### Impacto técnico potencial:
- Resistencia al cambio: cada nuevo portal exige desplegar cambios en la capa de servicios del core de la aplicación.
- Riesgo de regresión en los portales existentes ante cualquier ajuste en el flujo de orquestación.

#### Recomendaciones:
- Implementar el patrón creacional **Factory Method** (`CrawlerFactory`) con un registro dinámico (`register_crawler`) para que nuevos portales se incorporen por configuración o extensión sin editar `crawler_service.py`.
- Implementar el patrón de comportamiento **Strategy** (`PricingStrategy`) para la funcionalidad **F4 (RF-06)**, permitiendo agregar nuevas fórmulas de márgenes comerciales sin modificar el servicio de propiedades.

---

### 5.3 L - Liskov Substitution Principle (LSP)

> **Definición:** Los objetos de una subclase deben poder sustituir a los de su clase base sin alterar el comportamiento esperado del sistema.

| Elemento evaluado | Evaluación |
| :--- | :--- |
| Jerarquía de extractores `AsyncCrawler` (`FincaraizCrawler`, `MetrocuadradoCrawler`, `CiencuadrasCrawler`) | **Cumple parcialmente** |

#### Evidencia observada:
- La clase base `AsyncCrawler` declara:
  ```python
  @abstractmethod
  async def run(self) -> list[dict]:
      """Cada dict debe retornar la información homogénea del inmueble..."""
  ```
- En la práctica, al revisar los scrapers (`buscasa/buscasa/crawlers/`), cada portal extrae las propiedades con diferentes tipos y nomenclaturas (ej. Finca Raíz entrega precios como cadenas con símbolos de moneda en algunos endpoints o estructuras GraphQL anidadas, mientras que Metrocuadrado devuelve JSON plano con campos como `m2Superficie`).
- Si un scraper falla en el mapeo interno y retorna diccionarios con claves faltantes o nulas en campos críticos (como `url`), los consumidores de la base de datos relacional fallan con excepciones de validación o generan registros corruptos que violan **RN-06** (obligatoriedad de URL original).

#### Preguntas guía:
1. *¿Las subclases respetan el contrato de la superclase?*  
   Sintácticamente sí (retornan listas de diccionarios), pero semánticamente no garantizan la invariante del contrato en cuanto a la homogeneidad y validez de las claves requeridas para base de datos.
2. *¿Alguna subclase lanza excepciones inesperadas o deshabilita comportamientos heredados?*  
   No deshabilitan métodos, pero pueden propagar excepciones de red o parseo no homogeneizadas.
3. *¿Se redefinen precondiciones o postcondiciones de manera incompatible?*  
   La postcondición de entregar datos compatibles con la entidad `PropertyCreate` queda desprotegida si el portal cambia su schema externo.
4. *¿El cliente necesita conocer el subtipo concreto para funcionar correctamente?*  
   Si el orquestador tiene que tratar casos especiales de parseo dependiendo de si es `Ciencuadras` o `Metrocuadrado`, se viola LSP.

#### Hallazgos:
- Falta de tipado fuerte y validación de invariantes en el valor de retorno de las subclases.
- La ausencia de una capa de adaptación entre los datos crudos y el contrato del dominio arriesga la intercambiabilidad de los crawlers.

#### Impacto técnico potencial:
- Errores en tiempo de ejecución en procesos por lotes asíncronos cuando un nuevo crawler no normalice los campos exactamente igual que los anteriores.
- Violación de la regla de negocio **RN-06** al almacenar registros que carecen de URL original.

#### Recomendaciones:
- Introducir el patrón estructural **Adapter** (`PropertyDataAdapter`) de modo que cada crawler concreto delegue la normalización de su respuesta a un adaptador específico.
- Definir un contrato de datos estricto basado en esquemas de Pydantic (`PropertyCreate`) como valor de retorno de la abstracción, garantizando que cualquier subclase sea 100% sustituible sin sorpresas de tipos o campos ausentes al persistir en base de datos.

---

### 5.4 I - Interface Segregation Principle (ISP)

> **Definición:** Los clientes no deben depender de interfaces que no utilizan.

| Elemento evaluado | Evaluación |
| :--- | :--- |
| Interfaz de `AsyncCrawler` y contratos de extracción | **No cumple** |

#### Evidencia observada:
- `AsyncCrawler` combina en una sola interfaz pública abstracta la extracción y el formateo de persistencia de salida.
- En la arquitectura del MVP, el consumidor principal de los crawlers es el servicio de backend de FastAPI (`crawler_service.py`), el cual necesita obtener los datos en memoria para transformarlos y prepararlos para su posterior inserción directa en la base de datos relacional (`app/models/property.py`).
- Incluir métodos rígidos de almacenamiento o exportación en la clase base de scraping obliga a cualquier cliente o mock de testing a heredar dependencias y métodos de serialización física que no utilizará.

#### Preguntas guía:
1. *¿Las interfaces obligan a implementar métodos irrelevantes?*  
   **Sí.** Un crawler concebido para entregar datos en memoria a la base de datos no tiene por qué estar forzado a exponer métodos de formateo de archivos.
2. *¿Existen interfaces demasiado amplias o genéricas?*  
   Sí; `AsyncCrawler` es una interfaz "gorda" (*fat interface*) que mezcla extracción, transporte de red y persistencia.
3. *¿Los clientes consumen solo una parte mínima de la interfaz?*  
   El orquestador del backend FastAPI solo necesita invocar la extracción en memoria; cualquier método de serialización auxiliar es consumido únicamente por scripts exploratorios.
4. *¿Se podrían dividir los contratos en interfaces más cohesionadas?*  
   **Sí.** Claramente se debe separar el contrato de extracción pura del contrato de persistencia en base de datos.

#### Hallazgos:
- Acoplamiento forzado de clientes con mecanismos de almacenamiento físico no utilizados por la arquitectura objetivo.
- Dificultad para crear implementaciones ligeras (como extractores de prueba o crawlers simulados).

#### Impacto técnico potencial:
- Complejidad innecesaria en tests unitarios, que se ven obligados a simular operaciones accesorias de almacenamiento cuando solo desean verificar la lógica de recolección de datos.

#### Recomendaciones:
- Segregar la interfaz:
  - `ICrawler`: Define exclusivamente `async def extract() -> List[PropertyCreate]`.
  - `IPropertyRepository`: Interfaz separada para la persistencia directa en la base de datos relacional.
- De esta manera, `crawler_service` solo depende de `ICrawler` para la ingesta y de `IPropertyRepository` para la inserción, aplicando segregación limpia de interfaces.

---

### 5.5 D - Dependency Inversion Principle (DIP)

> **Definición:** Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones.

| Elemento evaluado | Evaluación |
| :--- | :--- |
| Módulos de orquestación y tasación (`crawler_service.py`, `property_service.py`) | **No cumple** |

#### Evidencia observada:
- En `app/services/crawler_service.py`:
  - El módulo de alto nivel (`orquestar_extraccion`) depende directamente del módulo de bajo nivel `crud_crawlerjob` (import estático: `from app.crud import crud_crawlerjob`).
  - No existe ninguna interfaz o abstracción intermedia que represente al repositorio de jobs de crawling.
- En `app/services/property_service.py`:
  - Dependencia directa de `crud_property` (`from app.crud import crud_property`).
  - Las funciones invocan directamente implementaciones estáticas de base de datos sin recibir dependencias abstractas inyectadas.
- En los crawlers (`buscasa/buscasa/crawlers/base.py`):
  - Dependencia directa de la librería concreta `httpx.AsyncClient` y de `truststore.SSLContext` acoplados rígidamente dentro de `_build_client()`.

#### Preguntas guía:
1. *¿La lógica de negocio depende directamente de implementaciones concretas?*  
   **Sí.** Depende directamente de funciones de SQLAlchemy y módulos CRUD específicos de bajo nivel.
2. *¿Se inyectan dependencias o se crean con new/instanciación directa dentro del componente?*  
   Se invocan directamente funciones de módulo o se instancian clases sin inyección de dependencias en el constructor.
3. *¿Existen interfaces o abstracciones desacopladoras?*  
   No existen en la entrega inicial; la comunicación ocurre estrictamente entre módulos concretos.
4. *¿El componente puede probarse fácilmente con mocks, stubs o fakes?*  
   **No.** Para probar `crawler_service.py` o `property_service.py` es obligatorio tener una base de datos activa o utilizar técnicas invasivas de monkey-patching sobre los imports.

#### Hallazgos:
- Fuerte acoplamiento entre la capa de servicios y la capa de infraestructura/acceso a datos (CRUD).
- Imposibilidad de sustituir el motor de persistencia relacional sin alterar las reglas de negocio de los servicios.

#### Impacto técnico potencial:
- Fragilidad en el pipeline de pruebas: los tests unitarios se convierten en pruebas de integración pesadas dependientes de la base de datos relacional.
- Rigidez arquitectónica ante cambios en el mecanismo de persistencia directa o en el cliente de scraping.

#### Recomendaciones:
- Invertir las dependencias utilizando el sistema de Inyección de Dependencias nativo de FastAPI (`Depends`).
- Definir interfaces de repositorio (`ICrawlerJobRepository`, `IPropertyRepository`) de las cuales dependan los servicios de negocio, recibiendo las implementaciones concretas de SQLAlchemy en tiempo de ejecución.
- Inyectar la factoría de crawlers (`CrawlerFactory`) y las estrategias de margen (`PricingStrategy`) en lugar de invocarlas de forma cableada.

---

## 6. Hallazgos transversales

### Problemas recurrentes identificados:
1. **Acoplamiento bidireccional entre capas de software:** La capa de orquestación y servicios (`app/services`) conoce los detalles de bajo nivel de acceso a datos (`app/crud`), violando simultáneamente SRP y DIP.
2. **Ausencia de abstracciones polimórficas para variaciones del negocio:** Las decisiones sobre qué portal extraer o qué margen de precio calcular se resolvían de manera procedimental mediante cadenas de texto o lógica fija, bloqueando el cumplimiento de OCP y los requerimientos **RNF-07** y **RN-04**.
3. **Contratos de datos frágiles y basados en primitivos heterogéneos:** El intercambio de información entre los scrapers externos y el sistema de catálogo utilizaba diccionarios no tipados con esquemas dispares, lo que comprometía el principio LSP y amenazaba la regla de negocio **RN-06**.
4. **Interfaces monolíticas que imponen responsabilidades innecesarias:** Las clases base combinan infraestructura de red, procesamiento de datos y almacenamiento en un solo contrato, afectando negativamente ISP y dificultando el testing automatizado.

---

## 7. Priorización de mejoras

| Hallazgo | Principio | Severidad | Esfuerzo | Prioridad | Acción sugerida |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Imposibilidad de incorporar nuevos portales sin editar código** (Incumple RNF-07) | **OCP / DIP** | **Alta** | Bajo | **Alta** | Implementar `CrawlerFactory` para registrar e instanciar dinámicamente subtipos de `AsyncCrawler` según configuración. |
| **Mezcla de HTTP, semáforos, scraping y persistencia en `AsyncCrawler`** | **SRP / ISP** | **Alta** | Medio | **Alta** | Segregar `AsyncCrawler`: enfocar el crawler exclusivamente en extraer datos en memoria listos para la capa de base de datos. |
| **Respuestas heterogéneas de portales que rompen la sustitución y arriesgan RN-06** | **LSP / SRP** | **Alta** | Medio | **Alta** | Implementar el patrón `Adapter` (`PropertyDataAdapter`) con esquemas Pydantic `PropertyCreate` para garantizar sustitución uniforme y filtrado estricto de URLs hacia la base de datos. |
| **Cálculo rígido de márgenes comerciales acoplado en el servicio** | **OCP / SRP** | **Media** | Bajo | **Alta** | Aplicar el patrón `Strategy` (`PricingStrategy`) para aislar las fórmulas de liquidez rápida (-5%) y rentabilidad (+5%) de **RN-04**. |
| **Dependencia directa de la capa de servicios hacia módulos CRUD concretos** | **DIP** | **Media** | Medio | **Media** | Inyectar dependencias y sesiones de base de datos a través de `Depends` de FastAPI, desacoplando los servicios de las implementaciones estáticas de SQLAlchemy. |

---

## 9. Conclusión

- **Síntesis del estado del diseño:**  
  El diseño evaluado en la primera entrega refleja un prototipo funcional enfocado en validar la factibilidad técnica de scraping básico. Sin embargo, no contaba con la estructura arquitectónica requerida para sostener un producto mínimo viable escalable donde la información recolectada se canalice de forma limpia hacia la base de datos. La aplicación estricta de los principios SOLID es el habilitador directo que permite transformar estos scripts aislados en un sistema modular, robusto y alineado con los requerimientos de ingeniería de software.

- **Principios más comprometidos:**  
  **SRP (Single Responsibility Principle)**, **OCP (Open/Closed Principle)** y **DIP (Dependency Inversion Principle)**. El acoplamiento entre capas y la ausencia de abstracciones impedían extender portales (RNF-07) o variar estrategias de precios (RN-04) sin modificar código existente.

- **Principios mejor implementados:**  
  **LSP (Liskov Substitution Principle)** en su vertiente sintáctica (todas las clases heredan de `AsyncCrawler` e implementan el método asíncrono `run()`), requiriendo únicamente robustecer el tipado y normalización de datos mediante adaptadores orientados al esquema relacional de la base de datos.

- **Nivel de deuda técnica asociada al diseño:**  
  **Medio**. La deuda técnica identificada es remediable en el corto plazo dentro del alcance del MVP, ya que no exige reescribir el motor de scraping, sino desacoplarlo y reestructurarlo mediante los cinco patrones GoF seleccionados (Factory Method, Adapter, Facade, Template Method, Strategy).

- **Recomendación final:**  
  Aprobar y ejecutar de inmediato el plan de refactorización estructurado en la sección 7. La introducción de `CrawlerFactory` (OCP/DIP), `PropertyDataAdapter` (SRP/LSP), `PropertyValuationFacade` (SRP/ISP) y `PricingStrategy` (OCP/SRP) resolverá las violaciones identificadas, elevando la calidad del código a un nivel óptimo para la entrega final del MVP sin incurrir en sobreingeniería, preparando la base para la inserción directa y definitiva en la base de datos relacional.

---

## Versión corta para revisión rápida

| Principio | ¿Se cumple? | Evidencia | Problema detectado | Recomendación |
| :---: | :---: | :--- | :--- | :--- |
| **SRP** | **No** | `AsyncCrawler` maneja HTTP, semáforos de red, scraping y almacenamiento. `crawler_service` mezcla flujo, prints y BD. | Múltiples razones de cambio en una sola clase; mezcla infraestructura y dominio. | Desacoplar la persistencia a base de datos en un repositorio independiente y limpiar el orquestador de efectos colaterales. |
| **OCP** | **No** | `crawler_service.py` requiere editar sentencias `if/elif` para dar soporte a un nuevo portal de scraping. | Modificar código estable para agregar funcionalidades; viola el requisito **RNF-07**. | Implementar `CrawlerFactory` con registro dinámico para extender portales sin modificar el servicio. |
| **LSP** | **Parcial** | Los crawlers devuelven diccionarios heterogéneos; campos faltantes causan errores o registros sin URL (**RN-06**). | Subclases no sustituibles de forma segura debido a contratos de datos débiles. | Introducir adaptadores (`PropertyDataAdapter`) que entreguen esquemas canónicos tipados `PropertyCreate` listos para base de datos. |
| **ISP** | **No** | `AsyncCrawler` acopla métodos de persistencia en su interfaz abstracta cuando el backend solo consume datos en memoria. | Interfaz "gorda" que impone métodos y dependencias no requeridos por la API. | Segregar la interfaz de extracción (`ICrawler`) de la de persistencia en base de datos (`IPropertyRepository`). |
| **DIP** | **No** | Los servicios importan e invocan directamente funciones CRUD estáticas (`crud_crawlerjob`, `crud_property`). | Módulos de alto nivel dependen de implementaciones concretas de bajo nivel. | Invertir dependencias mediante abstracciones e inyección de dependencias con `Depends` de FastAPI. |
