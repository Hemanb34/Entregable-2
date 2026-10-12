# 5. Diagramas de Actividades del MVP (UML 2.5)

**Proyecto:** Sistema de Búsqueda y Estimación Inmobiliaria (Medellín)  
**Estudiante:** Heman Santiago Bermudez Espinosa  
**Docente:** Alexandra Guerrero Bocanegra  
**Asignatura:** Diseño de Sistemas de Información — Instituto Tecnológico Metropolitano (ITM)  

---

## Tabla de Contenido de Funcionalidades del MVP

| ID | Funcionalidad del MVP | Prioridad | Momentos Concurrentes / Paralelos | Historia de Usuario |
| :-: | :--- | :--- | :--- | :--- |
| **F1** | [Orquestar extracción de datos](#f1-orquestar-extracción-de-datos) | **Alta** | **Fork/Join:** Scraping asíncrono concurrente multi-portal | HU-03 (RU-03) |
| **F2** | [Preparar los datos](#f2-preparar-los-datos) | **Alta** | **Fork/Join:** Pipeline paralelo de variables numéricas y categóricas | HU-04 (RU-03) |
| **F3** | [Reentrenar el modelo](#f3-reentrenar-el-modelo) | **Alta** | **Fork:** Tarea pesada en segundo plano vs servicio web activo (**RNF-08**) | HU-05 (RU-03) |
| **F4** | [Obtener margen sugerido](#f4-obtener-margen-sugerido) | **Alta** | **Fork/Join:** Evaluación simultánea de banda de liquidez y rentabilidad | HU-08 (RU-02) |
| **F5** | [Consolidar catálogo](#f5-consolidar-catálogo) | Media | Interacción asíncrona SPA sin recarga (**RNF-06**) y redirección | HU-01 (RU-01) |
| **F6** | [Estimar precio de una vivienda](#f6-estimar-precio-de-una-vivienda) | Media | **Fork/Join:** Inferencia ML concurrente con consulta SQL de competidores | HU-02 (RU-02) |
| **F7** | [Autenticarse](#f7-autenticarse) | Media | Validación secuencial de intentos y bloqueo temporal (**RN-05**) | HU-06 (RU-03) |

---

## F1: Orquestar extracción de datos

- **Historia de Usuario:** **HU-03** — *Como administrador, quiero accionar los crawlers manual o automáticamente, con visibilidad del estado en tiempo real, para mantener actualizada la oferta inmobiliaria.*
- **Requisitos vinculados:** RF-08, RNF-03, RNF-07, RNF-09.
- **Tipo de concurrencia:** **Paralelismo de Red (Fork/Join)** en la extracción concurrente hacia múltiples portales externos configurados.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F1: Orquestar extracción de datos](<diagramas/Orquestar extracción de datos.svg>)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Administrador / Scheduler** | Interacción & Disparador Temporal | Inicia la extracción de forma manual o programada cada 24 horas (RNF-03). | `#E1F5FE` (Azul hielo) |
| **⚙️ FastAPI / CrawlerService** | Control de Aplicación | Registra la auditoría del job, coordina la factoría y consolida en memoria. | `#FFF9C4` (Ámbar suave) |
| **🏭 CrawlerFactory (RNF-07)** | Patrón Creacional GoF | Instancia dinámicamente los scrapers configurados sin acoplamiento. | `#EDE7F6` (Lavanda) |
| **🕷️ Worker Metrocuadrado** | Worker Asíncrono de Extracción | Ejecuta peticiones HTTP asíncronas con limitador semafórico en Metrocuadrado. | `#E8F5E9` (Menta claro) |
| **🕷️ Worker Finca Raíz** | Worker Asíncrono de Extracción | Ejecuta peticiones HTTP asíncronas con limitador semafórico en Finca Raíz. | `#C8E6C9` (Verde claro) |
| **🕷️ Worker Cien Cuadras** | Worker Asíncrono de Extracción | Ejecuta peticiones HTTP asíncronas con limitador semafórico en Cien Cuadras. | `#A5D6A7` (Verde medio) |
| **💾 Base de Datos / Auditoría (RNF-09)** | Capa de Persistencia | Almacena y actualiza el estado, total de registros y marcas temporales del job. | `#ECEFF1` (Gris platino) |

### Explicación breve del flujo
El orquestador recibe la orden de extracción diaria (**RNF-03**). Resuelve dinámicamente las clases mediante `CrawlerFactory` cumpliendo **RNF-07**. Al iniciar el scraping, una **barra Fork** abre tres flujos paralelos concurrentes hacia Metrocuadrado, Finca Raíz y Cien Cuadras con control de concurrencia no invasivo. Una vez finalizadas las peticiones, una **barra Join** sincroniza los flujos, totaliza los registros en memoria y actualiza la auditoría del job (**RNF-09**).

---

## F2: Preparar los datos

- **Historia de Usuario:** **HU-04** — *Como administrador, quiero que el sistema limpie, codifique y escale los datos automáticamente antes del reentrenamiento, para asegurar la calidad del dataset sin fuga de datos.*
- **Requisitos vinculados:** RF-09, RN-02, RN-06.
- **Tipo de concurrencia:** **Paralelismo de Procesamiento (Fork/Join)** en la transformación independiente de variables numéricas y categóricas.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F2: Preparar los datos](<diagramas/Preparar los datos.svg>)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **📥 Ingesta de Datos** | Memoria / Buffer de Entrada | Recibe las publicaciones crudas extraídas por los crawlers. | `#E1F5FE` (Azul hielo) |
| **🧹 Filtro de Calidad (RN-06)** | Regla de Negocio & Limpieza | Valida que cada inmueble posea URL canónica; descarta registros incompletos. | `#FFF9C4` (Ámbar suave) |
| **📐 Aislamiento Metodológico (RN-02)** | Metodología de ML | Realiza el split 80% Train / 20% Val aislando parámetros estadísticos. | `#EDE7F6` (Lavanda) |
| **⚡ Pipeline Numérico (Train)** | Rama Concurrente Numérica | Calcula media y desviación estándar para ajustar y transformar con *StandardScaler*. | `#E8F5E9` (Menta claro) |
| **⚡ Pipeline Categórico (Train)** | Rama Concurrente Categórica | Extrae categorías únicas de Train para ajustar y transformar con *OneHotEncoder*. | `#C8E6C9` (Verde claro) |
| **📦 Ensamblado de Matrices (RN-02)** | Validación & Serialización | Concatena $X_{train}$, aplica transformadores congelados sobre $X_{val}$ y guarda artefactos. | `#ECEFF1` (Gris platino) |

### Explicación breve del flujo
El pipeline depura los datos aplicando **RN-06** (descarte estricto de inmuebles sin enlace original). Tras dividir el conjunto 80/20, se abre una **barra Fork** que ejecuta en paralelo el preprocesamiento de columnas numéricas (escalado) y columnas categóricas (codificación One-Hot). Ambas ramas confluyen en un **Join** que concatena la matriz `X_train`. Siguiendo **RN-02**, los mismos transformadores se aplican a `X_val` sin recalcular estadísticas, impidiendo la fuga de datos (*data leakage*).

---

## F3: Reentrenar el modelo

- **Historia de Usuario:** **HU-05** — *Como administrador, quiero desencadenar el reentrenamiento y que el modelo solo se actualice en producción si supera el umbral de error, para no degradar el servicio.*
- **Requisitos vinculados:** RF-10, RN-01, RNF-02, RNF-08.
- **Tipo de concurrencia:** **Desacoplamiento Asincrónico (Fork)** entre el servicio web HTTP y la tarea en segundo plano (*Background Task*).

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F3: Reentrenar el modelo](<diagramas/Reentrenar el modelo.svg>)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Administrador / Panel** | Interfaz Administrativa | Solicita el reentrenamiento del modelo desde el panel de control. | `#E1F5FE` (Azul hielo) |
| **🌐 FastAPI Gateway (Servicio Web)** | Capa Web / API REST | Atiende la petición HTTP, retorna `202 Accepted` de inmediato y sigue respondiendo a usuarios (**RNF-08**). | `#FFF9C4` (Ámbar suave) |
| **⚙️ Worker de Machine Learning (Background)** | Tarea Asíncrona en Segundo Plano | Entrena el estimador de regresión, infiere sobre validación y calcula el RMSE. | `#E8F5E9` (Menta claro) |
| **🛡️ Compuerta de Calidad (RN-01 / RNF-02)** | Regla de Negocio de Aceptación | Evalúa la condición estricta $RMSE \le 12\%$. Promueve o rechaza el modelo. | `#FFECB3` (Dorado ámbar) |
| **💾 Base de Datos / Registro** | Capa de Persistencia | Actualiza el flag `en_produccion` del modelo previo y registra la versión nueva o fallida. | `#ECEFF1` (Gris platino) |

### Explicación breve del flujo
El reentrenamiento implementa una **barra Fork asíncrona** que da cumplimiento estricto a **RNF-08**: una rama libera al gateway HTTP devolviendo un código `202 Accepted`, permitiendo que las consultas de inmuebles sigan operando sin degradación ni tiempos de espera. La rama secundaria ejecuta el entrenamiento en un worker independiente. Una vez calculado el RMSE, se evalúa la compuerta de aceptación obligatoria (**RN-01**, **RNF-02**): si el error supera el 12%, se aborta la promoción y se alerta al administrador; si el error es aceptable, se serializa el artefacto y se promueve a producción en la base de datos relacional.

---

## F4: Obtener margen sugerido

- **Historia de Usuario:** **HU-08** — *Como propietario, quiero recibir un rango sugerido de publicación (-5%/+5% sobre la estimación base), para fijar un precio competitivo sin caer en especulación.*
- **Requisitos vinculados:** RF-06, RN-04, RF-05.
- **Tipo de concurrencia:** **Cálculo Paralelo (Fork/Join)** de límites de liquidez y rentabilidad con verificación cruzada contra el mercado.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F4: Obtener margen sugerido](diagramas/obtenerMargenSugerido.svg)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Propietario / UI** | Cliente / Interfaz de Usuario | Ingresa los datos de la vivienda, selecciona su estrategia comercial y visualiza el rango. | `#E1F5FE` (Azul hielo) |
| **⚙️ PricingService / Contexto** | Servicio de Aplicación | Recupera la estimación de ML, coordina la bifurcación paralela y empaqueta el DTO final. | `#FFF9C4` (Ámbar suave) |
| **📉 Lógica de Liquidez Rápida** | Rama Concurrente (Límite Inferior) | Calcula el límite inferior ($Base \times 0.95$) y valida contra el precio mínimo de mercado (**RN-04**). | `#E8F5E9` (Menta claro) |
| **📈 Lógica de Máxima Rentabilidad** | Rama Concurrente (Límite Superior) | Calcula el límite superior ($Base \times 1.05$) y valida contra el precio máximo de mercado (**RN-04**). | `#C8E6C9` (Verde claro) |
| **🎯 PricingStrategy (Strategy Pattern)** | Patrón de Comportamiento GoF | Selecciona dinámicamente la estrategia comercial (*Liquidity*, *Profitability* o *Balanced*). | `#EDE7F6` (Lavanda) |

### Explicación breve del flujo
El calculador de márgenes recupera la tasación base de ML y las estadísticas de la competencia. Una **barra Fork** calcula simultáneamente el límite inferior de liquidez (-5%) y el límite superior de rentabilidad (+5%) conforme a **RN-04**, validando que los extremos respeten el piso y techo de mercado (**RF-05**). La **barra Join** consolida la banda comercial, y el patrón **Strategy** fija el precio sugerido según el objetivo seleccionado, presentando una recomendación clara al usuario.

---

## F5: Consolidar catálogo

- **Historia de Usuario:** **HU-01** — *Como arrendatario, quiero ver un catálogo centralizado de inmuebles de varios portales, para no tener que revisar cada portal por separado.*
- **Requisitos vinculados:** RF-01, RF-12, RN-06, RNF-04, RNF-06.
- **Tipo de interacción:** **Flujo Asíncrono de Cliente SPA** con paginación optimizada y redirección externa desacoplada.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F5: Consolidar catálogo](<diagramas/Consolidar catálogo.svg>)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Arrendatario / Buscador** | Usuario Final | Consulta el catálogo, aplica filtros en tiempo real e inspecciona publicaciones. | `#E1F5FE` (Azul hielo) |
| **💻 Frontend SPA (RNF-06)** | Aplicación Web (React/Vite) | Ejecuta peticiones AJAX/Fetch asíncronas sin recargar la página completa (**RNF-06**). | `#E0F2F1` (Turquesa suave) |
| **⚙️ FastAPI Backend** | Capa de API y Base de Datos | Consulta índices de base de datos relacional garantizando respuesta en $\le 2\text{s}$ (**RNF-04**). | `#FFF9C4` (Ámbar suave) |
| **🌐 Navegador Web** | Cliente de Red | Gestiona la apertura de la URL canónica original en una nueva pestaña (**RF-12**, **RN-06**). | `#ECEFF1` (Gris platino) |

### Explicación breve del flujo
El arrendatario consulta el catálogo centralizado. La base de datos responde en menos de 2 segundos (**RNF-04**). Mediante arquitectura de aplicación de página única (SPA), los filtros se aplican de manera asíncrona sin recargar la pantalla (**RNF-06**). El usuario puede navegar las opciones consolidadas y, si desea contactar al anunciante, el botón "Ir a la Oferta" (**RF-12**) lo redirige directamente a la URL externa verificada (**RN-06**).

---

## F6: Estimar precio de una vivienda

- **Historia de Usuario:** **HU-02** — *Como arrendatario o propietario, quiero ingresar las características de una vivienda y obtener el precio estimado por el modelo junto con propiedades similares del sector, para validar el valor de mercado.*
- **Requisitos vinculados:** RF-03, RF-04, RF-05, RN-03, RNF-05.
- **Tipo de concurrencia:** **Paralelismo Sincrónico (Fork/Join)** entre la inferencia de Machine Learning y la búsqueda SQL de competidores.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F6: Estimar precio de una vivienda](<diagramas/Estimar precio de una vivienda.svg>)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Usuario (Arrendatario / Propietario)** | Cliente Web | Ingresa los atributos del inmueble y visualiza la tasación y los comparables. | `#E1F5FE` (Azul hielo) |
| **🏛️ FastAPI / PropertyValuationFacade** | Patrón Estructural Fachada | Orquesta la bifurcación sincrónica paralela, calcula métricas de mercado y garantiza $\le 3\text{s}$ (**RNF-05**). | `#FFF9C4` (Ámbar suave) |
| **🤖 Modelo de Machine Learning (RF-03)** | Rama Predictiva Concurrente | Vectoriza los datos de entrada y ejecuta la inferencia con el estimador activo en producción. | `#E8F5E9` (Menta claro) |
| **🗄️ Base de Datos / Filtro RN-03 (RF-04)** | Rama SQL Concurrente | Ejecuta consulta filtrando los 4 criterios de similitud de **RN-03** (comuna, estrato, tipo y área $\pm 15\%$). | `#EDE7F6` (Lavanda) |

### Explicación breve del flujo
Para garantizar un tiempo de respuesta $\le 3$ segundos (**RNF-05**), `PropertyValuationFacade` abre una **barra Fork sincrónica** que bifurca la tarea en dos ramas simultáneas: una ejecuta la inferencia del modelo predictivo activo (**RF-03**), mientras la otra consulta en base de datos los competidores que cumplan estrictamente los 4 criterios de similitud de **RN-03** (**RF-04**). Una **barra Join** reúne ambos resultados, calcula las métricas agregadas (**RF-05**) y retorna la tasación consolidada al usuario.

---

## F7: Autenticarse

- **Historia de Usuario:** **HU-06** — *Como administrador, quiero iniciar sesión con credenciales exclusivas, para proteger el acceso al panel y evitar accesos no autorizados.*
- **Requisitos vinculados:** RF-07, RNF-01, RN-05.
- **Tipo de interacción:** **Flujo Secuencial de Seguridad y Bloqueo Temporal** ante ataques de fuerza bruta.

### Diagrama de Actividades Renderizado (SVG)

![Diagrama de Actividades UML 2.5 - F7: Autenticarse](diagramas/Autenticarse.svg)

### Identificación de Piscinas (*Pools / Swimlanes*) en el Diagrama

| Piscina (*Pool*) | Rol / Capa Arquitectónica | Responsabilidad dentro del Flujo | Color Distintivo |
| :--- | :--- | :--- | :--- |
| **👤 Administrador / Login** | Interfaz de Autenticación | Ingresa usuario/contraseña y recibe el token de sesión o alertas de bloqueo. | `#E1F5FE` (Azul hielo) |
| **🛡️ FastAPI / AuthService** | Control de Seguridad & Criptografía | Valida sanciones activas, compara hash criptográfico (Bcrypt), computa intentos fallidos y emite JWT. | `#FFF9C4` (Ámbar suave) |
| **💾 Base de Datos / Auditoría** | Capa de Persistencia Segura | Consulta usuarios registrados y persiste bloqueos por fuerza bruta (**RN-05**, **RNF-01**). | `#ECEFF1` (Gris platino) |

### Explicación breve del flujo
El administrador envía sus credenciales (**RF-07**). El sistema consulta primero si existe una sanción temporal activa por fuerza bruta. Si no está inhabilitado, valida el hash de la contraseña. De ser exitoso, resetea el contador de fallos y genera un token JWT. Si las credenciales fallan, incrementa el contador de intentos; al registrar tres intentos consecutivos erróneos, la regla **RN-05** (**RNF-01**) bloquea automáticamente el acceso por 30 minutos, notificando al usuario y registrando el suceso en la auditoría.
