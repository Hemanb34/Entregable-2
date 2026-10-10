# Arquitectura del Sistema de Búsqueda y Estimación Inmobiliaria (Modelo C4)

Este documento detalla la arquitectura del sistema estructurada a través de las cuatro capas del Modelo C4. En lugar de ser un diagrama puramente técnico, ilustra cómo las reglas de negocio y los requisitos funcionales moldean el ecosistema, asegurando alta disponibilidad, calidad de datos y predicciones confiables.

---

## 1. Nivel 1: Contexto (El Ecosistema)

**Funcionamiento y Relaciones:**
En este nivel observamos el sistema como una "caja negra" que conecta tres perfiles de usuario con el mundo exterior. Los **Arrendatarios** y **Propietarios** acceden para consumir valor (búsquedas inteligentes, comparación y estimación de precios). El **Administrador** interactúa para orquestar la salud de la plataforma. A su vez, nuestro sistema se conecta hacia afuera consumiendo datos de los **Portales Inmobiliarios Externos**.

**El Porqué del Diseño (Decisiones de Negocio):**
Nuestra plataforma no es dueña del inventario inmobiliario; su núcleo de negocio es actuar como un **agregador inteligente** que combate la desinformación. Al separar los "Portales Externos" en el diseño, evidenciamos nuestra dependencia de fuentes de terceros, lo cual justifica estructuralmente por qué es vital contar con motores robustos de extracción de datos (Crawlers).

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

## 2. Nivel 2: Contenedores (Arquitectura Técnica de Alto Nivel)

**Funcionamiento y Relaciones:**
Abrimos la "caja negra" y separamos el sistema en unidades desplegables. El **Frontend** provee una única interfaz de usuario. El **Backend (API de Negocio)** centraliza la gestión de usuarios, el Analytics y las búsquedas, apoyándose en una **Base de Datos** y una **Caché (Redis)**. En paralelo, operan dos motores pesados: el **Servicio de Machine Learning (ML)** y el **Worker de Crawlers**, los cuales se comunican de forma asíncrona o bajo demanda con el Backend.

**El Porqué del Diseño (Desacoplamiento):**
*   **Aislamiento del Servicio ML y Crawlers:** El entrenamiento de IA y el Web Scraping consumen excesiva CPU y son propensos a caídas por bloqueos de red. Si compartieran el mismo servidor del Backend principal, cualquier reentrenamiento o fallo en el crawler tumbaría las búsquedas de los arrendatarios. Separarlos garantiza el requisito de responder consultas en menos de 2 segundos de forma ininterrumpida (*RNF-04* y *RNF-08*).
*   **Inclusión de Caché:** Los requisitos dictan inhabilitar temporalmente a un admin por 30 minutos tras tres intentos fallidos (*RN-05*). Redis maneja contadores con tiempo de expiración nativo de forma ultrarrápida, evitando sobrecargar la base de datos transaccional con bloqueos efímeros.

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

## 3. Nivel 3: Componentes (Los Engranajes Internos)

En este nivel observamos cómo se estructura internamente el código de los dos contenedores que sostienen la lógica central del negocio: el **Backend** y el **Servicio ML**.

### 3.1 Componentes de la API Backend

**Funcionamiento y Relaciones:**
Internamente, el Backend se divide en módulos especializados: Seguridad, Búsqueda, Analytics y Orquestación Admin. La búsqueda delega en ML la evaluación en lote para ordenar las "mejores ofertas", mientras que Analytics cruza datos de la BD para calcular los promedios del mercado.

**El Porqué del Diseño (Responsabilidad Única):**
Garantiza que la modificación de una regla de negocio no rompa otra. Si el día de mañana se cambia la fórmula para calcular el margen sugerido (+/- 5%) en el Controlador de Analytics, esto no afectará en absoluto el mecanismo de login de usuarios o la ejecución del orquestador de crawlers.

```mermaid
C4Component
title Nivel 3: Componentes - API de Negocio Backend

Container_Boundary(api, "API de Negocio Backend") {
    Component(auth, "Módulo de Autenticación", "Controlador", "Valida credenciales y gestiona bloqueos por fallos consecutivos (RF-07, RN-05).")
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

**Funcionamiento y Relaciones:**
Se descompone en un Pipeline de Preprocesamiento (ETL), un Evaluador de Modelos y el Motor de Inferencia (el modelo en producción que devuelve los precios). 

**El Porqué del Diseño (Control de Calidad de IA):**
El **Evaluador de Modelos** funciona como un estricto guardia de seguridad. Toma los datos del ETL y reentrena un modelo candidato; sin embargo, no lo pasa a producción (Inferencia) a menos que su margen de error (RMSE) sea inferior o igual al 12% (*RN-01*). Esta separación arquitectónica protege la plataforma impidiendo despliegues automatizados que puedan sugerir precios irracionales a los propietarios.

```mermaid
C4Component
title Nivel 3: Componentes - Servicio Machine Learning

Container_Boundary(ml, "Servicio Machine Learning") {
    Component(api_ml, "Controlador API REST", "FastAPI / Flask", "Expone endpoints para predicción en tiempo real y recibe webhooks de reentrenamiento.")
    Component(inference, "Motor de Inferencia", "Modelo Serializado", "Recibe características (área, comuna) y devuelve el precio estimado en < 3s (RF-03).")
    Component(etl, "Pipeline de Preprocesamiento", "Script de Pandas", "Limpia nulos, codifica y escala datos crudos asegurando cero fuga de datos (RN-02).")
    Component(evaluator, "Evaluador de Modelos", "Validador", "Entrena el modelo y evalúa RMSE. Reemplaza en producción solo si RMSE <= 12% (RF-10, RN-01).")
}

Container(api, "API de Negocio Backend", "Node.js/Java", "Orquestador principal")
ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacena logs y datos crudos")

Rel(api, api_ml, "Solicita estimación / Envía orden de reentrenamiento")
Rel(api_ml, inference, "Consulta precio con características")
Rel(api_ml, etl, "Inicia flujo de preprocesamiento de datos")
Rel(etl, db, "Extrae dataset crudo generado por crawlers")
Rel(etl, evaluator, "Envía datasets de entrenamiento y validación ya procesados")
Rel(evaluator, db, "Guarda métricas de entrenamiento (RMSE, status)")
Rel(evaluator, inference, "Actualiza el modelo en producción (Si pasa umbral de seguridad)")
```

---

## 4. Nivel 4: Código (Detalle de Reglas Estrictas)

**Funcionamiento y Relaciones:**
Es el nivel más profundo donde residen los esquemas de bases de datos y algoritmos específicos. En lugar de diagramarlo, se estructura en políticas duras a nivel de código fuente.

**El Porqué del Diseño (Integridad de Datos):**
*   **Restricciones de Tabla:** A nivel de esquema relacional, la tabla de `Inmuebles` rechaza cualquier registro insertado por el Crawler que no contenga el atributo `url_original` (*RN-06*). Esto traduce un requerimiento de Experiencia de Usuario (dar acceso al post original) en una validación estricta de base de datos.
*   **Aislamiento Estadístico:** En el código del componente ETL, la estandarización numérica y codificación se computan estrictamente sobre el dataset de entrenamiento y solo se *aplican* (transform) sobre validación y nuevas entradas (*RN-02*). Esto asegura matemáticamente que no exista fuga de información que adultere los resultados.
