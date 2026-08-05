export type BlogSection = {
  heading?: string;
  body: string[];
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