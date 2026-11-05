

## CONTEXT ENGINEERING
- Diseñar todo lo que el modelo ve antes de responder. Prompt y mas
- Pueden ser: Prompts (Instrucciones), Docs y datos externos (RAG), Estados y herramientas, Memoria de otras conversaciones, Formato de salida estructurada (md, js)terminal, 
- Necesariamente mas conexto es mejor (X la degradacion del contexto). Usar lo necesario y suficiente

## SDD (Spec Driver Development)
- Una unica fuente de verdd sobre que construir y como hacerlo. Ya no se basa en el codigo. 
- Creado porque el software funciona pero no cumple con la intencion original

## NIVELES DE SDD:
1 Spec-first: La Spec guia la tarea
2 Spec-anchored: La Spec se mantiene para evolucionar el feature. Se mantiene para futuros cambios
3 Spec-as-source: El humano ya no edita codigo solo el spec.

## SPEC VS CONTEXTO
- El Contexto vive en cada sesion, y
- La Spec vive hasta completar la tarea
- El Contexto de una tarea incluye la spec

##  QUÉ ES UNA SPEC (ESPECIFICACION)
- Una Especificacion es una que trae a traves de PLANEACION, IMPLEMENTACION Y CONVERGENCIA HACIA EL PROYECTO

## Cómo FUNCIONA EL SDD?
- Tiene 2 componentes:
- 1 Conocimiento persistente (Banco de Informacion): Constitución y steering, aplica a todo en el modelo
- 2 Espec por Tarea: Problema, Diseño de la solucion y cuales son losCriterios de Validación. Va mas alla del prompting
* ver: GitHub-Spec-Kit-Workflow.webp
EL product mangaer define:. Constitution — Define principles, standards, and guardrails.
2. Specify — Capture requirements, scenarios, and acceptance criteria.
3. Clarify - Resolve ambiguity, dependencies, and edge cases.
4. Plan - Translate intent into architecture, flows, and constraints.
5. Tasks — Break the work into implementation-ready units.
6. Implement — Use Al to generate and refine code and tests.
7. Validate — Verify that the output matches the spec.

* En este camino no entra la IA. Se ve el conocimiento. Das el plan y no adivinas.

## QUE HACE UNA BUENA SPEC
- Establece la Intencion no la implementacion
- No es vaga ni muy sobredetallada
- Tiene criterios de aceptacion verificables para el agente
- Se escribe para un modulo, no para todo el sistema

## QUE TAN TECNICA DEBE SER?
- Depende de la profesion y gustos, ¿importante el codigo, clases, etc?, o el requerimiento funcional?
- El ahorro de tokens se da cuando especificas el requerimiento tecnico o 

*SIN UN PLAN SOLO ESTAS ADIVINANDO EL CODIGO*

## CUANDO NO FUNCIONA
- Cuando nadie lo lee y revisa
- Cuando no se actualiza. Se debe actualizar la especificacion, ya que con avances del proyecto, la especificacion obsoleta seguira siendo un contexto
- Muy pesado para tareas sencillas o pequeñas. No toda tarea requiere SDD
- La adopcion debe ser a la medida (Microsoft)

# 5 HERRAMIENTAS
- Cualquier IA o Agente: Claude Code, Antigravity, Kiro, Open Code, etc.
- KIRO (AWS): EL AGENTE HECHO PARA SDD
-- Genera la spec a partir de codigo
-- Req-Design-task
-- Steering 
- SDD Github COn comandos manejas tu proyecto desde perspectiva de SDD

# 6 El Stack 
Importante por costos y eficiencia. 
6.1 - Costo Computacional: Digital Ocen: $6, VercelPro: $20 + base de datos+ancho d bda, Render Pro:$20 + base de datos+ancho de bda

6.2 - Costo por token: Eficientes; J, Clojure, Ruby, Python (Pero es mejora marginal)

6.3 - Context Awareness (MAS IMPACTO): El agente busca el contexto del codigo sino se le da. Go (Solo tiene una manera de manejarlo, solo una estructura), Rails (Todo en uno con la misma estructura): son mas rapidos y eficientes para los Agentes. 

6.4 - Tu equipo Revisara el Codigo?. Tu equipo conoce el stack? conoce Rails? Typescript?. Depende de si eliges la revision de codigo

STACK FAVORITO DE CODIGO  FACILITO:
* Rails + Docker
* Las IAS se van a ir por TyppeScript y Next.js (Tienen mucho entrenamiento, Herramientas, Hosting amplio, Base de Datos para ese Stack)

DOCKER: 
- Importante en era agentica. Elegir entre Host (mi PC) vs Container. 
- Los Agentes hacen y desasen
- Espacio aislado, 
- Misma configuracion a produccion
- 




 

 
