# Modelo C4: Sistema de Búsqueda y Estimación Inmobiliaria

El **Modelo C4** es un enfoque para visualizar la arquitectura de software a través de cuatro niveles de abstracción (Contexto, Contenedores, Componentes y Código). A continuación, se detalla la arquitectura para el sistema inmobiliario, vinculando los requisitos funcionales (RF) y reglas de negocio (RN) del proyecto.

---

## 1. Nivel 1: Contexto (Context)
**Objetivo:** Mostrar el panorama general. Documenta qué sistemas y qué actores interactúan con el software que estamos construyendo.

**Elementos:**
*   **Usuarios:** Arrendatario (busca/valida), Propietario (compara/pública) y Administrador (gestiona).
*   **Sistema Central:** Nuestra plataforma.
*   **Sistemas Externos:** Los portales de donde extraemos los datos.

```mermaid
C4Context
title Nivel 1: Diagrama de Contexto del Sistema

Person(arrendatario, "Arrendatario", "Busca inmuebles, usa filtros y estima si el precio ofertado es justo.")
Person(propietario, "Propietario", "Consulta competidores y obtiene rangos sugeridos de precio de publicación.")
Person(admin, "Administrador", "Acciona crawlers, reentrena modelos predictivos y supervisa métricas del sistema.")

System(sistema, "Plataforma de Búsqueda y Estimación Inmobiliaria", "Sistema centralizado para buscar ofertas unificadas, comparar precios mediante IA y analizar el mercado local.")

System_Ext(portales, "Portales Inmobiliarios Externos", "Sitios web de origen de la oferta inmobiliaria (Ej. Finca Raíz, Metrocuadrado).")

Rel(arrendatario, sistema, "Busca inmuebles y valida precios")
Rel(propietario, sistema, "Compara propiedades y obtiene sugerencias de precio")
Rel(admin, sistema, "Monitorea plataforma, acciona ingesta de datos y reentrenamiento de modelos")
Rel(sistema, portales, "Extrae datos de publicaciones originales", "Web Scraping / HTTPS")
```

---

## 2. Nivel 2: Contenedores (Containers)
**Objetivo:** Muestra la arquitectura de alto nivel. Desglosa el "Sistema Central" en aplicaciones, bases de datos, y microservicios desplegables separadamente.

**Elementos:**
*   **SPA Frontend:** La interfaz visual para todos los roles.
*   **API de Negocio:** Centraliza la lógica, los filtros rápidos (< 2s) y rutea el tráfico.
*   **Servicio ML:** Dedicado a la inferencia de precios y cálculo del pipeline de datos pesados para no bloquear el API.
*   **Worker Crawler:** Ejecuta la extracción (Web Scraping) en segundo plano (cada 24h).
*   **Bases de Datos & Caché:** PostgreSQL para persistencia y Redis para manejar sesiones bloqueadas y colas.

```mermaid
C4Container
title Nivel 2: Diagrama de Contenedores

Person(user, "Usuarios de Plataforma", "Arrendatarios, Propietarios y Admin")

System_Boundary(c1, "Sistema de Búsqueda y Estimación") {
    Container(spa, "Aplicación Web Frontend", "React / Vue.js", "Provee la interfaz unificada de búsqueda, estimación y el panel administrativo.")
    Container(api, "API de Negocio Backend", "Node.js / Java", "Gestión de negocio, auth, búsquedas rápidas (<2s), y cálculo de métricas agregadas.")
    Container(ml, "Servicio Machine Learning", "Python (FastAPI)", "Expone la predicción de precios (<3s) y ejecuta el pipeline de reentrenamiento seguro.")
    Container(crawler, "Worker de Extracción (Crawlers)", "Python (Scrapy)", "Orquestación y extracción periódica (24h) o manual de datos externos.")
    
    ContainerDb(db, "Base de Datos Principal", "PostgreSQL", "Almacena catálogo de inmuebles, auditoría de crawlers y métricas ML.")
    ContainerDb(cache, "Caché en Memoria", "Redis", "Gestiona temporalidad de bloqueos de admin (30 min) y encolamiento de tareas.")
}

System_Ext(portales, "Portales Externos", "Fuentes de datos")

Rel(user, spa, "Interactúa con la interfaz", "HTTPS")
Rel(spa, api, "Envía peticiones API REST", "JSON/HTTPS")
Rel(api, db, "Lee y escribe datos", "TCP")
Rel(api, cache, "Verifica/Guarda bloqueos (RN-05)", "TCP")
Rel(api, ml, "Solicita estimación de precio o inicia pipeline", "REST")
Rel(api, crawler, "Desencadena o lee estado de extracción", "Eventos/Colas")
Rel(crawler, portales, "Extrae HTML y datos estructurados", "HTTPS")
Rel(crawler, db, "Guarda registros crudos conservando URL original (RN-06)", "TCP")
Rel(ml, db, "Consulta datos crudos, guarda logs RMSE y modelos", "TCP")
```

---

## 3. Nivel 3: Componentes (Components)
**Objetivo:** Hacemos zoom dentro de un contenedor específico para visualizar cómo está estructurado su código a nivel modular (controladores, servicios, repositorios). 

A continuación, mostramos los componentes de los dos contenedores principales: la **API Backend** y el **Servicio ML**.

### 3.1 Componentes de la API Backend
Desglose de la lógica de negocio central (Búsqueda, Analytics, Autenticación).

```mermaid
C4Component
title Nivel 3: Componentes - API de Negocio Backend

Container_Boundary(api, "API de Negocio Backend") {
    Component(auth, "Módulo de Autenticación", "Controlador de Seguridad", "Valida credenciales y gestiona bloqueos por fallos consecutivos (RF-07, RN-05).")
    Component(search, "Módulo de Búsqueda Inmobiliaria", "Servicio Core", "Ejecuta consultas optimizadas en DB con filtros y ordena por 'mejor oferta' (RF-02).")
    Component(analytics, "Controlador de Analytics", "Servicio Lógico", "Calcula métricas agregadas (min, max, prom) y rangos sugeridos (RF-05, RF-06).")
    Component(admin_orch, "Orquestador de Admin", "Servicio de Integración", "Recibe órdenes manuales o cronificadas para enviar tareas a ML o Crawlers (RF-08).")
}

Container(spa, "Aplicación Web Frontend", "React/Vue", "Interfaz")
ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacenamiento")
ContainerDb(cache, "Caché", "Redis", "Gestión de sesiones")
Container(ml, "Servicio ML", "Python", "Inferencia")
Container(crawler, "Worker Crawler", "Python", "Scraping")

Rel(spa, auth, "Solicita token / Intenta Login")
Rel(spa, search, "Envía parámetros de búsqueda (Filtros Avanzados)")
Rel(spa, analytics, "Solicita comparativa de mercado y estimación")
Rel(spa, admin_orch, "Ejecuta acciones de administración del ecosistema")

Rel(auth, cache, "Verifica/Registra intentos fallidos de admin")
Rel(search, db, "Consulta catálogo unificado de inmuebles")
Rel(analytics, db, "Consulta propiedades similares del sector")
Rel(admin_orch, ml, "Desencadena pipeline de reentrenamiento")
Rel(admin_orch, crawler, "Acciona ejecución manual de crawlers")
Rel(search, ml, "Solicita estimaciones en lote para ordenar resultados")
```

### 3.2 Componentes del Servicio Machine Learning
Desglose del contenedor predictivo que valida los requisitos de confiabilidad de la Inteligencia Artificial (RMSE <= 12%).

```mermaid
C4Component
title Nivel 3: Componentes - Servicio Machine Learning

Container_Boundary(ml, "Servicio Machine Learning") {
    Component(api_ml, "Controlador API REST", "FastAPI / Flask Router", "Expone endpoints para predicción en tiempo real y recibe webhooks para iniciar entrenamiento.")
    Component(inference, "Motor de Inferencia", "Modelo ML en Memoria", "Recibe características (área, comuna) y devuelve el precio estimado en < 3s (RF-03).")
    Component(etl, "Pipeline de Preprocesamiento", "Script de Datos (Pandas)", "Limpia nulos, codifica y escala datos crudos asegurando cero fuga de datos (RN-02, RF-09).")
    Component(evaluator, "Evaluador de Modelos", "Módulo de Validación", "Entrena el modelo y evalúa RMSE. Reemplaza en producción solo si RMSE <= 12% (RF-10, RN-01).")
}

Container(api, "API de Negocio Backend", "Node.js/Java", "Orquestador principal")
ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacena logs y datos crudos")

Rel(api, api_ml, "Solicita estimación / Envía orden de reentrenamiento")
Rel(api_ml, inference, "Consulta precio con características")
Rel(api_ml, etl, "Inicia flujo de preprocesamiento de datos")
Rel(etl, db, "Extrae dataset crudo generado por crawlers")
Rel(etl, evaluator, "Envía datasets de entrenamiento y validación ya procesados")
Rel(evaluator, db, "Guarda métricas de entrenamiento (RMSE, status)")
Rel(evaluator, inference, "Actualiza el modelo serializado en producción (Si pasa umbral)")
```

---

## 4. Nivel 4: Código (Code)
**Objetivo:** Detallar el diseño interno (Diagramas de Clases UML, Diagramas Entidad-Relación o especificaciones de algoritmos) de un componente individual.

**Nota para diagramar:** 
En el modelo C4, este nivel suele omitirse ya que cambia con mucha frecuencia y puede generar mantenimiento excesivo. Generalmente, este nivel se auto-genera desde el código fuente mediante herramientas IDE. 
Sin embargo, para este proyecto en particular, el Nivel 4 sería ideal para documentar:
1.  **Diagrama Entidad-Relación (ERD):** Para mostrar la tabla `Inmuebles` y cómo se vincula obligatoriamente el campo `url_original` para cumplir la regla **RN-06**.
2.  **Algoritmo del Evaluador RMSE:** Un diagrama de flujo detallando el paso a paso de la división de datos, entrenamiento y la condición final `if RMSE <= 12% then deploy else abort` correspondiente a la regla **RN-01**.
