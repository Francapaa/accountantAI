export type BlogTable = {
  headers: string[];
  rows: string[][];
};

export type BlogSection = {
  heading?: string;
  body: string[];
  table?: BlogTable;
};

export type BlogSource = {
  label: string;
  url: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  author: string;
  authorPosition: string;
  readingTime: string;
  sections: BlogSection[];
  sources?: BlogSource[];
  relatedSlugs?: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "que-es-rag-para-contadores",
    title:
      "¿Qué es RAG y cómo le ahorra horas a un contador con la normativa ARCA/AFIP?",
    excerpt:
      "RAG (retrieval-augmented generation) es la tecnología que le permite a un asistente de IA responder con la normativa oficial de ARCA/AFIP y mostrar la cita del documento que usó. Te explicamos cómo funciona y por qué importa para un estudio contable.",
    datePublished: "2026-08-05",
    dateModified: "2026-08-05",
    author: "Equipo AccountantAI",
    authorPosition: "AccountantAI",
    readingTime: "6 min",
    sources: [
      { label: "ARCA — Agencia de Recaudación y Control Aduanero", url: "https://www.argentina.gob.ar/arca" },
      { label: "AFIP — Administración Federal de Ingresos Públicos", url: "https://www.argentina.gob.ar/afip" },
    ],
    relatedSlugs: ["como-verificar-respuestas-con-citas-normativa", "asistente-ia-vs-excel-vs-consultora"],
    sections: [
      {
        body: [
          "RAG, o generación aumentada por recuperación, es un patrón de IA que primero busca la respuesta en la normativa oficial de ARCA/AFIP y recién después redacta el texto. Gracias a esto, un estudio contable obtiene una respuesta apoyada en el documento legal exacto y con la fuente visible, en lugar de una frase que el modelo podría inventar.",
        ],
      },
      {
        heading: "El problema: memorizar miles de páginas de normativa",
        body: [
          "La normativa de Argentina —leyes, resoluciones generales, manuales e instructivos— suma cientos de páginas al año y cambia con frecuencia. Ningún contador puede tenerla en la cabeza. La alternativa histórica fue buscar a mano entre documentos o derivar la consulta a un tercero. Es lento, y el cliente espera una respuesta en minutos.",
        ],
      },
      {
        heading: "Cómo funciona RAG en la práctica",
        body: [
          "El proceso tiene cuatro pasos. Primero, la normativa se descarga y se divide en fragmentos. Segundo, cada fragmento se convierte en un vector —una representación matemática de su significado— y se guarda en una base vectorial. Tercero, cuando hacés una consulta, se convierte en vector y se busca el fragmento más afín. Cuarto, esos fragmentos se pasan al modelo de IA para que redacte la respuesta citando qué documentos usó.",
          "Por eso se llama “generación aumentada por recuperación”: la IA no memoriza, recupera y redacta. El resultado es auditable, porque cada afirmación se puede rastrear al fragmento original.",
        ],
      },
      {
        heading: "Qué significa que la respuesta traiga cita",
        body: [
          "Cuando el sistema enlaza el fragmento y la fuente del documento, podés abrirla y verificar el texto legal antes de reenviarle al cliente. La cita cambia la respuesta de una sugerencia imprecisa a algo verificable: sabés cuál es la base legal de cada línea ofrecida.",
          "Así, la verificación sigue depender de vos. La IA estructura; el contador valida y decide. El rol profesional no desaparece, se apoya en una base auditable.",
        ],
      },
    ],
  },
  {
    slug: "como-verificar-respuestas-con-citas-normativa",
    title:
      "Cómo verificar una respuesta con cita a la normativa de ARCA/AFIP en segundos",
    excerpt:
      "Guía práctica para revisar la respuesta de un asistente de IA antes de reenviarla a tu cliente: abre la fuente, compará el fragmento y confirmá que la interpretación es correcta.",
    datePublished: "2026-08-05",
    dateModified: "2026-08-05",
    author: "Equipo AccountantAI",
    authorPosition: "AccountantAI",
    readingTime: "4 min",
    sources: [{ label: "ARCA — Agencia de Recaudación y Control Aduanero", url: "https://www.argentina.gob.ar/arca" }],
    relatedSlugs: ["que-es-rag-para-contadores"],
    sections: [
      {
        body: [
          "Una respuesta respaldada por IA es confiable solo si podés auditar su base legal en segundos. El flujo de verificación es simple: leer la respuesta, abrir la cita al documento de ARCA/AFIP, confirmar que el fragmento citado respalda la afirmación y decidir. Tres pasos que llevan menos de un minuto.",
        ],
      },
      {
        heading: "Paso 1: leé la cita, no solo la respuesta",
        body: [
          "La respuesta correcta de un buen asistente debería decir qué documento usó. Si una herramienta te da una respuesta sin fuente alguna, tomala como borrador, no como conclusión. La cita es la diferencia entre una opinión y un dato verificable.",
        ],
      },
      {
        heading: "Paso 2: abrí la fuente oficial",
        body: [
          "La normativa de ARCA/AFIP se publica en los canales oficiales del organismo: el sitio del Gobierno de la Argentina y los instructivos del organismo. Abrí el enlace, ubicá el extracto y compará el texto citado con el que te mostró la IA. Deben coincidir.",
        ],
      },
      {
        heading: "Paso 3: validá el alcance",
        body: [
          "Que un texto legal exista no significa que se aplique al caso de tu cliente. Revisá el régimen (monotributo o responsable inscripto), la jurisdicción y la vigencia. Esa validación profesional no la puede hacer el sistema por completo.",
          "Con esos tres pasos convertís una respuesta de IA en una respuesta defendible ante el cliente y ante la autoridad.",
        ],
      },
    ],
  },
  {
    slug: "asistente-ia-vs-excel-vs-consultora",
    title:
      "Asistente de IA con RAG vs. Excel, búsqueda manual y consultora: qué conviene",
    excerpt:
      "Comparación práctica de cuatro formas de resolver consultas tributarias en Argentina: asistente de IA con RAG, Excel, búsqueda manual en la web y tercerización a una consultora.",
    datePublished: "2026-08-05",
    dateModified: "2026-08-05",
    author: "Equipo AccountantAI",
    authorPosition: "AccountantAI",
    readingTime: "5 min",
    sources: [{ label: "ARCA — Agencia de Recaudación y Control Aduanero", url: "https://www.argentina.gob.ar/arca" }],
    relatedSlugs: ["que-es-rag-para-contadores", "proceso-normativo-arca-aire-cuestionarios"],
    sections: [
      {
        body: [
          "Resolver una consulta tributaria en Argentina hoy tiene cuatro caminos: un asistente de IA con RAG sobre la normativa oficial, un Excel con tus propias notas, la búsqueda manual en los sitios del organismo o tercerizar la respuesta. Cada uno difiere en velocidad, costo y control. Esta comparación te ayuda a decidir.",
        ],
      },
      {
        heading: "Búsqueda manual en la web oficial",
        body: [
          "Es gratis, pero lenta y depende de tu memoria de dónde mirar. Encontrar la resolución correcta puede tomar horas y no queda rastro de la búsqueda. En época de cambios normativos, el riesgo es perder una actualización reciente.",
        ],
      },
      {
        heading: "Excel y notas propias",
        body: [
          "Tu conocimiento y lo que escribiste hasta hoy es valioso y no depende de internet. El costo es el mantenimiento: hay que actualizarlos a mano cada cambio y buscan el conocimiento en tu cabeza, no en la normativa vigente. Cuando no lo sabés, seguís teniendo el problema original.",
        ],
      },
      {
        heading: "Consultora externa",
        body: [
          "Resuelve la duda con autoridad, pero con demora y costo por consulta, y no queda en el control del estudio. Es la mejor opción en casos complejos; no es práctica para verificar la pregunta de todos los días.",
        ],
      },
      {
        heading: "Asistente de IA con RAG",
        body: [
          "Devuelve en segundos una respuesta citada a la normativa indexada, actualizada automáticamente y con el contexto de cada cliente. La velocidad es su mayor ventaja; la verificación humana sigue siendo necesaria, igual que con el resto de las opciones. Se combina bien con una consultora para los casos límite.",
        ],
        table: {
          headers: [
            "Criterio",
            "Búsqueda manual",
            "Excel propio",
            "Consultora",
            "IA con RAG",
          ],
          rows: [
            [
              "Velocidad de respuesta",
              "Horas",
              "Depende de tus notas",
              "Días",
              "Segundos",
            ],
            [
              "Costo",
              "Gratis",
              "Gratis (mantenimiento manual)",
              "Por consulta",
              "Suscripción",
            ],
            [
              "Actualización normativa",
              "Manual",
              "Manual",
              "Depende de la consultora",
              "Automática",
            ],
            [
              "Control y verificación",
              "Total",
              "Total",
              "Limitado",
              "Cita a la fuente, validás vos",
            ],
            [
              "Mejor para",
              "Consultas puntuales",
              "Conocimiento propio",
              "Casos complejos",
              "Consultas diarias x cliente",
            ],
          ],
        },
      },
      {
        heading: "La combinación que funciona",
        body: [
          "Ninguna opción es excluyente. El flujo práctico en un estudio es usar el asistente de IA para la consulta repetitiva del día a día, mantener el Excel con el conocimiento propio del estudio y reservar la consultora para los casos límite que exceden la rutina.",
          "La diferencia de la IA con RAG no es reemplazar al contador: es sacar las horas de las consultas repetitivas para que el profesional las dedique a lo que agrega valor.",
        ],
      },
    ],
  },
  {
    slug: "proceso-normativo-arca-aire-cuestionarios",
    title:
      "AIRE y cuestionarios de incumplimiento: cómo funciona el proceso normativo de ARCA/AFIP",
    excerpt:
      "Guía para entender qué es AIRE (Acuse de Recibo e Intercambio Electrónico de ARCA, ex AFIP), qué notificaciones llegan por ese canal y qué hacer cuando el organismo inicia un cuestionario por un posible incumplimiento.",
    datePublished: "2026-08-11",
    dateModified: "2026-08-11",
    author: "Equipo AccountantAI",
    authorPosition: "AccountantAI",
    readingTime: "6 min",
    sources: [
      { label: "ARCA — Agencia de Recaudación y Control Aduanero", url: "https://www.argentina.gob.ar/arca" },
      { label: "AFIP — Trámites y servicios electrónicos", url: "https://www.argentina.gob.ar/afip" },
    ],
    relatedSlugs: ["que-es-rag-para-contadores", "como-verificar-respuestas-con-citas-normativa"],
    sections: [
      {
        body: [
          "Cuando ARCA (ex AFIP) detecta una inconsistencia vinculada a un contribuyente, suele iniciar el proceso por el servicio AIRE: Acuse de Recibo e Intercambio Electrónico. Es el canal digital oficial por el que el organismo notifica requerimientos, vencimientos y, en ciertos casos, un cuestionario de incumplimiento. El contador que entiende ese circuito sabe qué esperar, qué plazos corren y cómo armar el descargo.",
        ],
      },
      {
        heading: "Qué es AIRE y qué notificaciones llegan",
        body: [
          "AIRE es el servicio de acuse de recibo e intercambio electrónico de ARCA, el reemplazo natural del tradicional domicilio fiscal electrónico. Por ahí llegan comunicaciones formales: requerimientos de información, notificaciones de deuda, intimaciones de pago y también los cuestionarios por posibles inconsistencias entre la información declarada y la que el organismo cruza con terceros.",
          "Lo importante para el estudio es que esas notificaciones tienen plazos corretos desde su acuse de recibo. No leer a tiempo un requerimiento no lo anula: el proceso continúa igual y el contribuyente pierde oportunidades de descargo.",
        ],
      },
      {
        heading: "El cuestionario de incumplimiento, paso a paso",
        body: [
          "El proceso suele seguir un orden. Primero, el organismo envía el cuestionario por AIRE con las observaciones puntuales y el plazo para responder. Después, el contribuyente (con su contador) arma el descargo con la documentación que respalda la posición. Luego, ARCA evalúa la respuesta, puede pedir más información y emite una resolución. Si el descargo no convence, la resolución puede convertir la observación en determinación de oficio o en una multa permitida por la normativa.",
          "Cada etapa rara vez admite saltarse las anteriores. Por eso conviene responder con evidencia documental completa en la primera oportunidad y guardar constancia de la presentación.",
        ],
      },
      {
        heading: "Qué hacer cuando llega un cuestionario",
        body: [
          "Lo primero es no responder desde la urgencia: leer con calma qué observación concreta hace el organismo y con qué período se relaciona. Lo segundo, descartar las causas automatizadas que no aplican al contribuyente (por ejemplo, cruces con información mal cargada) y documentarlo. Lo tercero, responder dentro del plazo que indica la notificación, porque el silencio se interpreta como allanamiento.",
          "Un asistente que recupera la normativa vigente con cita al texto ayuda a preparar el descargo con base legal, pero la decisión y la firma siguen siendo del profesional.",
        ],
      },
    ],
  },
  {
    slug: "ia-generativa-en-contabilidad-casos-de-uso-y-limites",
    title: "IA generativa en contabilidad: casos de uso reales y sus límites",
    excerpt:
      "Qué puede hacer —y qué no— la IA generativa en un estudio contable: responder consultas repetitivas, armar borradores y buscar normativa. Y por qué la verificación humana es innegociable.",
    datePublished: "2026-08-12",
    dateModified: "2026-08-12",
    author: "Equipo AccountantAI",
    authorPosition: "AccountantAI",
    readingTime: "5 min",
    sources: [
      { label: "ARCA — Agencia de Recaudación y Control Aduanero", url: "https://www.argentina.gob.ar/arca" },
    ],
    relatedSlugs: ["que-es-rag-para-contadores", "proceso-normativo-arca-aire-cuestionarios", "asistente-ia-vs-excel-vs-consultora"],
    sections: [
      {
        body: [
          "La IA generativa le sirve a un estudio contable en tres frentes concretos: responder las consultas repetitivas de los clientes, redactar borradores de respuestas y encontrar la normativa aplicable sobre documentos oficiales. No le sirve para opinar sobre la norma ni para decidir por el contador: la responsabilidad profesional y la firma siguen siendo humanas.",
        ],
      },
      {
        heading: "Casos de uso que ya funcionan",
        body: [
          "El caso más rentable es la consulta repetitiva: preguntas que llegan por WhatsApp sobre vencimientos, categorías de monotributo o facturación. Esas respuestas se pueden preparar en segundos con una herramienta que recupere la normativa vigente y muestre la cita del documento. El contador revisa, ajusta y reenvía.",
          "Le siguen el borrador de descargos y presentaciones, la preparación de informes para el cliente y la actualización profesional: una herramienta conectada a la normativa de ARCA/AFIP recién publicada evita buscar a mano entre boletines.",
        ],
      },
      {
        heading: "Dónde están los límites",
        body: [
          "El límite número uno es la alucinación: un modelo sin acceso a documentos puede inventar artículos o números con total fluidez. El segundo es el contexto: que una norma exista no significa que aplique al régimen, la provincia o la actividad de un cliente en particular. El tercero son los datos sensibles: el estudio nunca debería exponer información de clientes a herramientas sin política de privacidad verificable.",
          "La solución práctica es unir la IA a una fuente confiable (la normativa oficial indexada), mostrar la cita de cada afirmación y dejar la decisión final en manos del profesional. Así, la herramienta acelera el trabajo y el estudio conserva el control.",
        ],
      },
      {
        heading: "El patrón que lo hace auditable",
        body: [
          "La fórmula que funciona en la práctica es la de recuperación aumentada (RAG): en lugar de que el modelo responda de memoria, primero se recupera el fragmento de la normativa relevante y después se redacta con la fuente a la vista. Cada respuesta se puede rastrear al texto legal original.",
          "Con eso, la IA se convierte en un primer borrador con base y no en una caja negra. El contador valida, decide y firma, igual que lo hace con cualquier documento que recibe.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return blogPosts;
}