// Ejemplo de lo que produce la herramienta de noticias con IA.
//
// En la versión real: un trabajo programado lee los RSS cada 15–30 minutos,
// junta las notas del mismo hecho, las clasifica y la API de Claude escribe el
// resumen y los guiones usando SOLO lo que dicen las fuentes.
//
// En esta demo todo es ficticio: los medios no existen y los enlaces van a
// example.com. Sirve para mostrar cómo se ve y cómo se usa el tablero.

export type Prioridad = "Yumbo" | "Cali y Valle" | "Nacional";

export interface FuenteHecho {
  medio: string;
  titulo: string;
  url: string;
  hora: string; // ISO
}

export interface Alerta {
  tipo: "fuente-unica" | "contradiccion" | "falta-detalle";
  detalle: string;
}

export interface Hecho {
  id: string;
  titular: string;
  tema: string;
  region: Prioridad;
  zona: string;
  actualizado: string;
  resumen: string;
  fuentes: FuenteHecho[];
  alertas: Alerta[];
  guiones: { 30: string; 60: string; 90: string };
}

export const TEMAS_IA = [
  "Movilidad",
  "Economía",
  "Medio ambiente",
  "Salud",
  "Comunidad",
  "Deportes",
] as const;

export const hechosEjemplo: Hecho[] = [
  {
    id: "h1",
    titular: "Cierres nocturnos en la vía Cali–Yumbo por repavimentación",
    tema: "Movilidad",
    region: "Yumbo",
    zona: "Yumbo",
    actualizado: "2026-11-27T07:40:00-05:00",
    resumen:
      "Desde el lunes habrá cierres de un carril entre las 9:00 p. m. y las 5:00 a. m. en la vía Cali–Yumbo durante tres semanas, por obras de repavimentación. Las tres fuentes coinciden en las fechas y el horario; dos de ellas recomiendan usar rutas alternas para el transporte de carga.",
    fuentes: [
      {
        medio: "Periódico Ejemplo del Valle",
        titulo: "Anuncian cierres nocturnos en la vía Cali–Yumbo",
        url: "https://example.com/valle/cierres-via-cali-yumbo",
        hora: "2026-11-27T06:55:00-05:00",
      },
      {
        medio: "Radio Ciudad (ficticia)",
        titulo: "Tres semanas de obras nocturnas entre Cali y Yumbo",
        url: "https://example.com/radio-ciudad/obras-nocturnas",
        hora: "2026-11-27T07:20:00-05:00",
      },
      {
        medio: "Agencia Demo de Noticias",
        titulo: "Repavimentación obliga a cerrar un carril de noche",
        url: "https://example.com/agencia/repavimentacion-yumbo",
        hora: "2026-11-27T07:40:00-05:00",
      },
    ],
    alertas: [],
    guiones: {
      30: "Atención, conductores: desde este lunes habrá cierres nocturnos en la vía Cali–Yumbo. Entre las nueve de la noche y las cinco de la mañana solo quedará habilitado un carril, por obras de repavimentación que van a durar tres semanas. Si usted transporta carga, la recomendación es usar rutas alternas en ese horario. En el día, la vía funciona normal. Siga en Yumbo Estéreo, ciento siete punto cero, para más información de movilidad.",
      60: "Información de movilidad para todos los que se mueven entre Yumbo y Cali. A partir de este lunes, y durante tres semanas, la vía Cali–Yumbo tendrá cierres nocturnos por obras de repavimentación. Los cierres serán de un solo carril, entre las nueve de la noche y las cinco de la mañana. Durante el día, la circulación será normal. Los medios que han informado sobre estas obras coinciden en las fechas y en el horario, y recomiendan que el transporte de carga use rutas alternas en la noche, para no congestionar el tramo de obra. Si usted trabaja en turno nocturno en la zona industrial, o se mueve en bus a esas horas, salga con unos minutos de anticipación. Y si ve alguna novedad en la vía, cuéntenos por el WhatsApp de participación. Le seguiremos contando cualquier cambio aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
      90: "Buenos días, Yumbo. Empezamos con información de movilidad que le interesa si viaja entre Yumbo y Cali. Desde este lunes, y durante tres semanas, la vía Cali–Yumbo tendrá cierres nocturnos por obras de repavimentación. ¿Cómo va a funcionar? Entre las nueve de la noche y las cinco de la mañana quedará habilitado un solo carril. Durante el día, la vía funcionará con normalidad, así que el impacto será para quienes se mueven de noche y en la madrugada. Los medios que han informado sobre estas obras coinciden en las fechas y en el horario. También recomiendan que los vehículos de carga usen rutas alternas durante la noche, para evitar trancones en el tramo donde se está trabajando. Si usted trabaja en turno nocturno en la zona industrial, o se mueve en transporte público a esas horas, calcule unos minutos más de viaje y salga con tiempo. Y a los conductores: respeten la señalización y al personal que esté en la vía, que están trabajando para que la carretera quede en mejores condiciones. Si ve alguna novedad, un accidente o un trancón fuera de lo normal, cuéntenos por el WhatsApp de participación de la emisora, que esa información le sirve a todos. Seguiremos atentos y le contaremos cualquier cambio aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
  {
    id: "h2",
    titular: "Empresas de la zona industrial abren convocatoria de empleo",
    tema: "Economía",
    region: "Yumbo",
    zona: "Yumbo",
    actualizado: "2026-11-27T08:15:00-05:00",
    resumen:
      "Varias empresas de la zona industrial de Yumbo abrieron una convocatoria de empleo para operarios y auxiliares, con inscripción hasta el 5 de diciembre. Las fuentes no coinciden en el número de vacantes: una habla de 300 y otra de 450.",
    fuentes: [
      {
        medio: "Portal Economía Demo",
        titulo: "Zona industrial de Yumbo ofrece 300 vacantes",
        url: "https://example.com/economia/vacantes-yumbo",
        hora: "2026-11-27T07:05:00-05:00",
      },
      {
        medio: "Periódico Ejemplo del Valle",
        titulo: "Convocatoria de empleo con 450 puestos en Yumbo",
        url: "https://example.com/valle/convocatoria-empleo",
        hora: "2026-11-27T08:15:00-05:00",
      },
    ],
    alertas: [
      {
        tipo: "contradiccion",
        detalle:
          "Número de vacantes: «Portal Economía Demo» dice 300 y «Periódico Ejemplo del Valle» dice 450. Confirmar antes de dar la cifra al aire.",
      },
    ],
    guiones: {
      30: "Buenas noticias para quienes buscan trabajo: varias empresas de la zona industrial de Yumbo abrieron una convocatoria para operarios y auxiliares. Las inscripciones van hasta el cinco de diciembre. Todavía no hay una cifra confirmada de vacantes, porque los medios dan números distintos; en cuanto la tengamos, se la contamos. Vaya preparando su hoja de vida. Siga en Yumbo Estéreo, ciento siete punto cero.",
      60: "Atención a quienes están buscando empleo en Yumbo. Varias empresas de la zona industrial del municipio abrieron una convocatoria para cargos de operarios y auxiliares. Las inscripciones estarán abiertas hasta el cinco de diciembre, así que hay unos días para prepararse. Sobre el número de puestos, la información todavía no es clara: los medios que han publicado la noticia dan cifras distintas. Por eso, en esta emisora preferimos no darle un número hasta confirmarlo con las empresas. Lo que sí le recomendamos es tener la hoja de vida actualizada, la copia del documento de identidad y los certificados de estudio y de trabajo que tenga. Si usted ya se inscribió, o sabe dónde se están recibiendo las hojas de vida, cuéntenos por el WhatsApp de participación para ayudar a otros oyentes. En cuanto tengamos la cifra oficial y el lugar de inscripción, se lo contamos aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
      90: "Hablemos de empleo, un tema que le importa a muchas familias de Yumbo. Varias empresas de la zona industrial del municipio abrieron una convocatoria para cargos de operarios y auxiliares. Las inscripciones estarán abiertas hasta el cinco de diciembre. Ahora, un detalle importante que queremos ser claros en decirle: los medios que han informado sobre la convocatoria no coinciden en el número de vacantes. Uno habla de una cifra y otro de una cifra mayor. Por eso, en esta emisora preferimos no darle un número hasta tenerlo confirmado directamente por las empresas, para no crear falsas expectativas. Mientras tanto, si está interesado, vaya preparando su hoja de vida actualizada, la copia de su documento de identidad y los certificados de estudio y de trabajo que tenga. Revise que su número de teléfono y su correo estén bien escritos, porque por ahí lo van a contactar. Y tenga cuidado: ninguna convocatoria seria le pide dinero por inscribirse; si alguien se lo pide, desconfíe. Si usted ya se inscribió, o sabe dónde se están recibiendo las hojas de vida, cuéntenos por el WhatsApp de participación, que así le ayudamos a otros oyentes. Le seguiremos informando sobre esta convocatoria aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
  {
    id: "h3",
    titular: "Alerta por lluvias fuertes en la cordillera Occidental",
    tema: "Medio ambiente",
    region: "Cali y Valle",
    zona: "Valle del Cauca",
    actualizado: "2026-11-27T06:30:00-05:00",
    resumen:
      "Se pronostican lluvias fuertes durante el fin de semana en la cordillera Occidental del Valle del Cauca, con riesgo de crecientes en quebradas y deslizamientos en vías rurales. Las dos fuentes piden evitar cruzar quebradas crecidas y reportar emergencias a los organismos de socorro.",
    fuentes: [
      {
        medio: "Agencia Demo de Noticias",
        titulo: "Pronóstico de lluvias fuertes para la cordillera Occidental",
        url: "https://example.com/agencia/lluvias-cordillera",
        hora: "2026-11-27T05:50:00-05:00",
      },
      {
        medio: "Radio Ciudad (ficticia)",
        titulo: "Piden precaución en zonas rurales del Valle por lluvias",
        url: "https://example.com/radio-ciudad/precaucion-lluvias",
        hora: "2026-11-27T06:30:00-05:00",
      },
    ],
    alertas: [],
    guiones: {
      30: "Precaución en la zona rural: para este fin de semana se esperan lluvias fuertes en la cordillera Occidental del Valle del Cauca. Puede haber crecientes en las quebradas y deslizamientos en las vías rurales. No cruce quebradas crecidas, ni a pie ni en vehículo, y si se presenta una emergencia, avise de inmediato a los organismos de socorro. Yumbo Estéreo, ciento siete punto cero, informando a la comunidad.",
      60: "Un llamado a la prevención para los corregimientos de la zona alta de Yumbo. Para este fin de semana se pronostican lluvias fuertes en la cordillera Occidental del Valle del Cauca. Con esas lluvias aumenta el riesgo de crecientes súbitas en las quebradas y de deslizamientos en las vías rurales. La recomendación es clara: no intente cruzar una quebrada crecida, ni a pie, ni en moto, ni en carro, porque el agua puede subir en minutos. Esté atento también a grietas en el terreno o a movimientos de tierra cerca de su casa, y si nota algo extraño, aléjese y avise. Si se presenta una emergencia, comuníquese de inmediato con los organismos de socorro. Y si quiere reportar cómo está la vía o el clima en su vereda, escríbanos al WhatsApp de participación, que esa información le sirve a todos sus vecinos. Seguiremos atentos aquí, en Yumbo Estéreo, ciento siete punto cero.",
      90: "Le hablamos a la gente de los corregimientos de la parte alta de Yumbo. Para este fin de semana se pronostican lluvias fuertes en la cordillera Occidental del Valle del Cauca, la misma zona donde están muchas de nuestras veredas. Cuando llueve así, aumenta el riesgo de dos cosas: crecientes súbitas en las quebradas y deslizamientos en las vías rurales. Por eso, estas son las recomendaciones. Primero: no cruce una quebrada crecida, ni a pie, ni en moto, ni en carro; el agua puede subir en minutos y arrastrar a una persona o a un vehículo. Segundo: si nota grietas en el terreno, árboles inclinados, postes torcidos o ruidos extraños en la montaña cerca de su casa, aléjese y avise. Tercero: tenga a mano una linterna, agua, los documentos importantes y los teléfonos de los organismos de socorro. Y si tiene que viajar por vías rurales, hágalo de día y con precaución. Si se presenta una emergencia, llame de inmediato a los organismos de socorro. Y si quiere contarnos cómo está la vía o el clima en su vereda, escríbanos al WhatsApp de participación, que esa información les sirve a todos sus vecinos y nos ayuda a informar mejor. Seguiremos atentos durante todo el fin de semana aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
  {
    id: "h4",
    titular: "Jornada de vacunación contra la influenza en Cali y municipios vecinos",
    tema: "Salud",
    region: "Cali y Valle",
    zona: "Cali",
    actualizado: "2026-11-26T17:10:00-05:00",
    resumen:
      "Habrá una jornada de vacunación gratuita contra la influenza el sábado, dirigida a adultos mayores, niños menores de cinco años y gestantes, en puntos de Cali y municipios vecinos. Solo un medio lo ha publicado y no da la lista de puntos de vacunación.",
    fuentes: [
      {
        medio: "Noticiero Nacional (ficticio)",
        titulo: "Sábado de vacunación contra la influenza en el Valle",
        url: "https://example.com/noticiero/vacunacion-influenza",
        hora: "2026-11-26T17:10:00-05:00",
      },
    ],
    alertas: [
      {
        tipo: "fuente-unica",
        detalle:
          "Solo una fuente. Confirmar con la secretaría de salud los puntos de vacunación en Yumbo antes de emitir.",
      },
    ],
    guiones: {
      30: "Este sábado habrá una jornada de vacunación gratuita contra la influenza en Cali y algunos municipios vecinos. Está dirigida a adultos mayores, niños menores de cinco años y mujeres gestantes. Todavía no se conoce la lista de puntos de vacunación, así que estamos confirmando si habrá alguno en Yumbo; se lo contamos apenas lo sepamos. Yumbo Estéreo, ciento siete punto cero.",
      60: "Información de salud para las familias de Yumbo. Este sábado se realizará una jornada de vacunación gratuita contra la influenza en Cali y en algunos municipios vecinos. La jornada está dirigida a los grupos con más riesgo: adultos mayores, niños menores de cinco años y mujeres gestantes. Por ahora no tenemos confirmados los puntos de vacunación, ni sabemos si habrá alguno en Yumbo o en los corregimientos. Solo un medio ha publicado esta información, y estamos consultando con las autoridades de salud para confirmarla antes de darle más detalles. Si usted, o alguien de su familia, pertenece a uno de estos grupos, vaya buscando el documento de identidad y el carné de vacunación, para tenerlos listos. En cuanto tengamos los puntos y los horarios confirmados, se los damos aquí. Siga con nosotros en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
      90: "Vamos con un tema de salud que le interesa a muchas familias. Este sábado habrá una jornada de vacunación gratuita contra la influenza en Cali y en algunos municipios vecinos. La vacuna está dirigida a quienes tienen más riesgo de complicarse con este virus: los adultos mayores, los niños menores de cinco años y las mujeres gestantes. Es importante decirle con claridad lo que todavía no sabemos. Hasta ahora no se ha publicado la lista de puntos de vacunación, así que no sabemos si habrá alguno en Yumbo o en los corregimientos. Además, por ahora solo un medio ha informado sobre esta jornada. Por eso, en la emisora estamos consultando con las autoridades de salud para confirmarla antes de darle más detalles. Mientras tanto, si usted o alguien de su familia está en alguno de estos grupos, tenga listo el documento de identidad y el carné de vacunación. Si tiene dudas sobre si le corresponde la vacuna, consulte en su centro de salud o con su médico. Y si en su casa hay un adulto mayor que vive solo, ayúdele a estar enterado. En cuanto tengamos los puntos y los horarios confirmados, se los damos aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
  {
    id: "h5",
    titular: "Abren convocatoria nacional para proyectos de medios comunitarios",
    tema: "Comunidad",
    region: "Nacional",
    zona: "Colombia",
    actualizado: "2026-11-26T11:00:00-05:00",
    resumen:
      "Una convocatoria nacional financiará proyectos de producción de contenidos de emisoras y medios comunitarios, con cierre el 20 de enero. Las dos fuentes coinciden en la fecha de cierre y en que los proyectos deben presentarse en línea.",
    fuentes: [
      {
        medio: "Agencia Demo de Noticias",
        titulo: "Medios comunitarios podrán presentar proyectos hasta enero",
        url: "https://example.com/agencia/convocatoria-medios",
        hora: "2026-11-26T10:20:00-05:00",
      },
      {
        medio: "Noticiero Nacional (ficticio)",
        titulo: "Convocatoria para emisoras comunitarias cierra el 20 de enero",
        url: "https://example.com/noticiero/convocatoria-emisoras",
        hora: "2026-11-26T11:00:00-05:00",
      },
    ],
    alertas: [],
    guiones: {
      30: "Una oportunidad para los medios comunitarios del país: está abierta una convocatoria nacional que financiará proyectos de producción de contenidos de emisoras y medios comunitarios. Los proyectos se presentan en línea y el plazo vence el veinte de enero. Si su organización produce contenidos para la comunidad, revise las bases a tiempo. Yumbo Estéreo, ciento siete punto cero.",
      60: "Una noticia que nos toca de cerca como emisora comunitaria. Está abierta una convocatoria nacional para financiar proyectos de producción de contenidos de emisoras y medios comunitarios de todo el país. Los proyectos deben presentarse en línea, y el plazo vence el veinte de enero. Las fuentes que han informado sobre la convocatoria coinciden en esa fecha de cierre. Si usted hace parte de un colectivo, una junta de acción comunal o una organización de Yumbo que produce contenidos para la comunidad, esta puede ser una oportunidad para fortalecer su trabajo. Le recomendamos revisar las bases con tiempo, porque estas convocatorias suelen pedir documentos que toman días en reunirse. Aquí en la emisora también estamos revisando las bases para participar. Si quiere contarnos su proyecto, escríbanos al WhatsApp de participación. Le seguiremos contando aquí, en Yumbo Estéreo, ciento siete punto cero.",
      90: "Le contamos una noticia que nos toca de cerca como emisora comunitaria. Está abierta una convocatoria nacional que va a financiar proyectos de producción de contenidos de emisoras y medios comunitarios de todo el país. ¿Qué hay que saber? Primero, los proyectos se presentan en línea. Segundo, el plazo vence el veinte de enero, así que hay tiempo, pero no tanto, sobre todo con las fiestas de fin de año de por medio. Los medios que han informado sobre la convocatoria coinciden en esa fecha. Esta puede ser una oportunidad no solo para las emisoras, sino también para colectivos, juntas de acción comunal y organizaciones que producen contenidos para su comunidad: un podcast, un programa de radio, una serie de videos sobre la historia del barrio. Nuestra recomendación es revisar las bases con tiempo, porque estas convocatorias suelen pedir documentos que toman días en reunirse. Aquí en Yumbo Estéreo ya estamos revisando las bases para presentar un proyecto. Y si usted hace parte de una organización de Yumbo que quiere participar, escríbanos al WhatsApp de participación: podemos contar su experiencia al aire y, por qué no, pensar en algo juntos. Seguiremos informando aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
  {
    id: "h6",
    titular: "Ciclista vallecaucana gana etapa en una vuelta nacional",
    tema: "Deportes",
    region: "Nacional",
    zona: "Colombia",
    actualizado: "2026-11-26T19:45:00-05:00",
    resumen:
      "La ciclista vallecaucana Laura Ospina (persona ficticia) ganó la cuarta etapa de una vuelta nacional femenina y quedó segunda en la clasificación general. Las fuentes coinciden en el resultado de la etapa.",
    fuentes: [
      {
        medio: "Noticiero Nacional (ficticio)",
        titulo: "Laura Ospina se impone en la cuarta etapa",
        url: "https://example.com/noticiero/ospina-etapa",
        hora: "2026-11-26T18:30:00-05:00",
      },
      {
        medio: "Periódico Ejemplo del Valle",
        titulo: "Triunfo vallecaucano en la vuelta femenina",
        url: "https://example.com/valle/triunfo-vuelta",
        hora: "2026-11-26T19:45:00-05:00",
      },
    ],
    alertas: [],
    guiones: {
      30: "En deportes, orgullo vallecaucano: la ciclista Laura Ospina ganó la cuarta etapa de la vuelta nacional femenina y ahora es segunda en la clasificación general. Con este triunfo llega a las próximas etapas con opciones de pelear el primer lugar. Desde Yumbo Estéreo le enviamos un saludo y le daremos los resultados de cada etapa aquí, en el ciento siete punto cero.",
      60: "Vamos con deportes y con una buena noticia para el Valle del Cauca. La ciclista vallecaucana Laura Ospina ganó la cuarta etapa de la vuelta nacional femenina. Con ese triunfo subió al segundo lugar de la clasificación general, así que entra a las próximas etapas con opciones reales de pelear el título. Los medios que cubren la competencia coinciden en el resultado de la etapa. Es una alegría para la región ver a una de nuestras deportistas en lo más alto, y un ejemplo para los jóvenes que se suben a una bicicleta en las montañas de Yumbo y de sus corregimientos. Desde Yumbo Estéreo le enviamos un saludo a Laura y a su equipo, y la seguiremos acompañando en lo que queda de la vuelta. Le daremos los resultados de cada etapa aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
      90: "Abrimos el bloque deportivo con orgullo vallecaucano. La ciclista Laura Ospina, del Valle del Cauca, ganó la cuarta etapa de la vuelta nacional femenina. No es un triunfo cualquiera: con este resultado subió al segundo lugar de la clasificación general, y quedan etapas por delante para pelear el primer puesto. Los medios que cubren la competencia coinciden en el resultado de la etapa, así que la celebración es completa. Este tipo de resultados muestran el talento que hay en la región y lo que logran nuestras deportistas cuando tienen apoyo, entrenamiento y constancia. Cada triunfo como este es un ejemplo para las niñas y jóvenes que sueñan con competir. Si en su familia o en su barrio hay jóvenes que montan en bicicleta y sueñan con competir, cuéntenos su historia por el WhatsApp de participación, que queremos conocerlos y llevarlos al aire. Y si usted también sale a rodar por las vías de Dapa, de Mulaló o de La Buitrera, hágalo con casco y con precaución. Desde Yumbo Estéreo le enviamos un saludo a Laura y a su equipo. Le daremos los resultados de cada etapa aquí, en Yumbo Estéreo, ciento siete punto cero, la emisora comunitaria de Yumbo.",
    },
  },
];
