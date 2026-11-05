<!--
Sync Impact Report:
- Version change: [INITIAL TEMPLATE] -> 1.0.0
- Modified principles: Initialized principles from template placeholders based on project SDD requirements.
- Added sections:
  * Core Principles:
    - I. Spec-Driven Intent (Spec-First & Spec-Anchored)
    - II. Context Optimization & Minimality
    - III. Verifiable Acceptance Criteria & Test-First
    - IV. Modular & Self-Contained Scope
    - V. Reproducibility & Environment Isolation
  * Technology Standards & Constraints
  * Development Workflow & Quality Gates
  * Governance
- Removed sections: None
- Follow-up TODOs: None
-->

# Product Engineering SDD Constitution

## Core Principles

### I. Spec-Driven Intent (Spec-First & Spec-Anchored)
Toda funcionalidad o cambio en el proyecto DEBE originarse a partir de una especificación clara y aprobada antes de escribir cualquier línea de código. La intención de producto y el "qué/por qué" prevalecen sobre asunciones técnicas apresuradas. Sin un plan y una especificación previa, no se adivina código.

### II. Context Optimization & Minimality
El contexto suministrado a los agentes de IA debe ser necesario y suficiente para la tarea en curso. Se debe evitar la degradación del contexto causada por ruido innecesario o saturación de tokens. La información persistente debe estructurarse en documentos modulares y versionados.

### III. Verifiable Acceptance Criteria & Test-First
Toda especificación DEBE contener criterios de aceptación explícitos y verificables. El desarrollo debe validar las pruebas y condiciones de salida antes de dar por concluida cualquier tarea. La evidencia objetiva y la verificación preceden siempre a cualquier afirmación de éxito.

### IV. Modular & Self-Contained Scope
Las especificaciones y las tareas se definen para módulos específicos y bien delimitados, evitando abordar el sistema completo en un único salto. Cada unidad de trabajo debe ser autocontenida, testeable de forma independiente y de alcance medible.

### V. Reproducibility & Environment Isolation
El entorno de desarrollo y ejecución debe ser reproducible y aislado. Se prioriza el uso de contenedores (Docker) frente a configuraciones directas en el host. Las dependencias deben declararse de forma determinista mediante herramientas de gestión específicas.

## Technology Standards & Constraints

- **Stack de Referencia:** Node/TypeScript (Next.js) o Ruby on Rails con soporte para ejecución contenerizada en Docker.
- **Gestión de Dependencias:** Uso de herramientas con lockfile estricto (e.g. `uv` para entornos Python, `npm`/`pnpm` para ecosistema JavaScript/TypeScript).
- **Seguridad y Secretos:** Prohibido almacenar claves API, tokens o credenciales en el repositorio. Todo secreto debe inyectarse vía variables de entorno (`.env`) excluidas en `.gitignore`.
- **Estructura SDD:** Todo requerimiento nuevo debe residir bajo el flujo de trabajo gestionado en `.specify/`.

## Development Workflow & Quality Gates

- **Flujo Obligatorio de Desarrollo:**
  1. **Constitución:** Lineamientos y límites no negociables (`/speckit-constitution`).
  2. **Especificación:** Definición de requerimientos y criterios de aceptación (`/speckit-specify`).
  3. **Aclaración:** Eliminación de ambigüedades y casos borde (`/speckit-clarify`).
  4. **Plan Técnico:** Arquitectura, componentes y flujo de datos (`/speckit-plan`).
  5. **Tareas:** Desglose atómico y dependencias (`/speckit-tasks`).
  6. **Implementación:** Construcción iterativa guiada por tareas (`/speckit-implement`).
  7. **Convergencia:** Verificación contra la especificación y resolución de pendientes (`/speckit-converge`).
- **Puertas de Calidad:**
  - No se aprueban cambios que contradigan los principios de esta constitución.
  - Si los requerimientos cambian durante la implementación, la especificación debe actualizarse para evitar obsolescencia del contexto.

## Governance

Esta constitución es la máxima autoridad de gobernanza técnica y operativa del proyecto. Prevalece sobre prácticas ad-hoc y convenciones informales.
Cualquier enmienda a este documento requiere:
1. Justificación documentada del cambio o necesidad.
2. Incremento semántico de versión (`MAJOR` para redefinición/eliminación de principios, `MINOR` para adición de principios o secciones, `PATCH` para aclaraciones de redacción).
3. Registro de impacto en el informe de sincronización (Sync Impact Report).

Todos los colaboradores y agentes de IA deben consultar [.specify/memory/constitution.md](file:///d:/0000%20Curso%20Product%20Engineers/Clase%202/.specify/memory/constitution.md) como directriz vinculante antes de diseñar o implementar.

**Version**: 1.0.0 | **Ratified**: 2026-11-04 | **Last Amended**: 2026-11-04
