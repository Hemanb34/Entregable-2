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

Person(arrendatario, "Arrendatario", "Busca inmuebles y valida si el precio es justo.")
Person(propietario, "Propietario", "Consulta competidores y obtiene márgenes de publicación.")
Person(admin, "Administrador", "Acciona crawlers, reentrena IA y supervisa métricas.")

System(sistema, "Plataforma Inmobiliaria", "Sistema central de búsqueda y estimación con IA.")
System_Ext(portales, "Portales Externos", "Fuentes de la oferta (Finca Raíz, etc).")

Rel_D(arrendatario, sistema, "Busca inmuebles y valida precios")
Rel_D(propietario, sistema, "Compara propiedades y obtiene sugerencias")
Rel_D(admin, sistema, "Monitorea plataforma y orquesta IA")
Rel_D(sistema, portales, "Extrae publicaciones", "Web Scraping / HTTPS")

UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
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
    Container(spa, "Web Frontend", "React/Vue.js", "Interfaz unificada de usuario.")
    Container(api, "API Backend", "Node.js/Java", "Lógica de negocio y búsquedas (<2s).")
    Container(ml, "Servicio ML", "Python", "Predicción IA (<3s) y reentrenamiento.")
    Container(crawler, "Crawlers", "Python/Scrapy", "Extracción periódica y manual.")
    
    ContainerDb(db, "Base de Datos", "PostgreSQL", "Catálogo, métricas e historial.")
    ContainerDb(cache, "Caché", "Redis", "Bloqueos (30min) y colas.")
}

System_Ext(portales, "Portales Externos", "Fuentes de datos")

Rel_D(user, spa, "Interactúa", "HTTPS")
Rel_D(spa, api, "Llama API REST", "JSON")

Rel_D(api, ml, "Solicita IA", "REST")
Rel_D(api, crawler, "Desencadena", "Colas")
Rel_R(api, cache, "Verifica bloqueos", "TCP")
Rel_D(api, db, "Lee/Escribe", "TCP")

Rel_D(crawler, portales, "Scrapea HTML", "HTTPS")
Rel_D(crawler, db, "Guarda crudos", "TCP")
Rel_D(ml, db, "Lee crudos / Guarda RMSE", "TCP")

UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
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
title Nivel 3: Componentes - API Backend

Container(spa, "Web Frontend", "React/Vue", "Interfaz de usuario")

Container_Boundary(api, "API de Negocio Backend") {
    Component(auth, "Autenticación", "Controlador", "Valida credenciales y bloqueos.")
    Component(search, "Búsqueda", "Servicio Core", "Ejecuta consultas con filtros.")
    Component(analytics, "Analytics", "Servicio Lógico", "Calcula métricas y rangos.")
    Component(admin_orch, "Orquestador Admin", "Integración", "Envía tareas a ML/Crawlers.")
}

ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacenamiento")
ContainerDb(cache, "Caché", "Redis", "Gestión de sesiones")
Container(ml, "Servicio ML", "Python", "Inferencia IA")
Container(crawler, "Worker Crawler", "Python", "Scraping")

Rel_D(spa, auth, "Login")
Rel_D(spa, search, "Busca")
Rel_D(spa, analytics, "Analiza")
Rel_D(spa, admin_orch, "Administra")

Rel_D(auth, cache, "Registra fallos")
Rel_D(search, db, "Consulta catálogo")
Rel_D(analytics, db, "Consulta propiedades")
Rel_D(admin_orch, ml, "Reentrena")
Rel_D(admin_orch, crawler, "Ejecuta manual")
Rel_R(search, ml, "Lote IA")
```

### 3.2 Componentes del Servicio Machine Learning

**Funcionamiento y Relaciones:**
Se descompone en un Pipeline de Preprocesamiento (ETL), un Evaluador de Modelos y el Motor de Inferencia (el modelo en producción que devuelve los precios). 

**El Porqué del Diseño (Control de Calidad de IA):**
El **Evaluador de Modelos** funciona como un estricto guardia de seguridad. Toma los datos del ETL y reentrena un modelo candidato; sin embargo, no lo pasa a producción (Inferencia) a menos que su margen de error (RMSE) sea inferior o igual al 12% (*RN-01*). Esta separación arquitectónica protege la plataforma impidiendo despliegues automatizados que puedan sugerir precios irracionales a los propietarios.

```mermaid
C4Component
title Nivel 3: Componentes - Servicio ML

Container(api, "API Backend", "Node/Java", "Orquestador")

Container_Boundary(ml, "Servicio Machine Learning") {
    Component(api_ml, "API REST", "FastAPI / Flask", "Endpoints de predicción.")
    Component(inference, "Motor Inferencia", "Modelo ML", "Devuelve precio estimado.")
    Component(etl, "Pipeline ETL", "Script Pandas", "Preprocesamiento seguro (RN-02).")
    Component(evaluator, "Evaluador Modelos", "Validador", "Entrena y evalúa RMSE <= 12%.")
}

ContainerDb(db, "Base de Datos", "PostgreSQL", "Datos crudos y logs")

Rel_D(api, api_ml, "Solicita IA / Reentrena")
Rel_D(api_ml, inference, "Consulta precio")
Rel_D(api_ml, etl, "Inicia preprocesamiento")

Rel_D(etl, db, "Extrae crudos")
Rel_D(etl, evaluator, "Envía procesados")
Rel_D(evaluator, db, "Guarda métricas")
Rel_U(evaluator, inference, "Actualiza modelo")
```

---

## 4. Nivel 4: Código (Detalle de Clases y Reglas Estrictas)

**Funcionamiento y Relaciones:**
Este es el nivel más profundo (estructurado habitualmente mediante diagramas de clases UML o flujos de código). Aquí ilustramos la estructura interna de las clases responsables de la integridad del sistema: la entidad física del `Inmueble` y el ciclo de vida seguro del `EvaluadorModelo`.

**El Porqué del Diseño (Integridad de Datos en Código):**
*   **Restricciones de Entidad:** La clase `Inmueble` requiere obligatoriamente el atributo `url_original`. El método `validarURLOriginal()` previene que el sistema procese propiedades inalcanzables (*RN-06*).
*   **Control de Despliegue en Código:** La clase `EvaluadorModelo` encapsula de forma privada el límite estricto de error (`UMBRAL_RMSE_MAX = 0.12`). Su método `promoverAProduccion()` evalúa esta condición matemáticamente antes de instanciar un nuevo `ModeloPredictivo`, lo que bloquea despliegues deficientes desde la propia lógica orientada a objetos (*RN-01*).

```mermaid
classDiagram
    direction TD

    class Inmueble {
      +String id
      +Float precio_publicado
      +Float area_m2
      +Int estrato
      +String comuna
      +String url_original
      +validarURLOriginal() bool
    }

    class PipelineETL {
      +separarDataset(datos)
      +aplicarEscaladores(datos_entrenamiento)
      +transformar(datos_validacion)
    }

    class EvaluadorModelo {
      -Float UMBRAL_RMSE_MAX = 0.12
      +entrenar(Dataset datos_procesados)
      +calcularRMSE() Float
      +promoverAProduccion() bool
    }

    class ModeloPredictivo {
      +String version
      +Float rmse_validacion
      +predecir(Inmueble i) Float
    }

    PipelineETL ..> EvaluadorModelo : Inyecta datos procesados
    EvaluadorModelo --> ModeloPredictivo : Instancia si RMSE <= 12%
    ModeloPredictivo ..> Inmueble : Estima precio
```
