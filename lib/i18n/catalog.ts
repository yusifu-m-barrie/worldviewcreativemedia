import type { LocaleContentFields, LocalizedLocale } from "@/lib/i18n/types";

/** Bundled FR/ES copy for demo slugs and common labels (used when CMS has no translation yet). */
const articleCatalog: Record<string, Partial<Record<LocalizedLocale, LocaleContentFields>>> = {
  "sierra-leone-digital-media-infrastructure": {
    fr: {
      title: "La Sierra Leone modernise son infrastructure médias numériques",
      excerpt:
        "Le gouvernement et le secteur privé dévoilent un plan ambitieux pour étendre la couverture haut débit et la production média dans tout le pays.",
      content:
        "<p>Des partenariats public-privé accélèrent le déploiement du numérique à l'échelle nationale, ouvrant de nouvelles perspectives pour la presse et la diffusion en ligne.</p><p>WorldView Creative Media suit de près ces développements pour nos lecteurs en Sierra Leone et en Afrique de l'Ouest.</p>",
    },
    es: {
      title: "Sierra Leona avanza en infraestructura de medios digitales",
      excerpt:
        "El gobierno y el sector privado presentan planes para ampliar la banda ancha y las capacidades de producción mediática en todo el país.",
      content:
        "<p>Las alianzas público-privadas aceleran el despliegue digital a nivel nacional, con nuevas oportunidades para la prensa y la transmisión en línea.</p><p>WorldView Creative Media sigue de cerca estos avances para nuestra audiencia en Sierra Leona y África Occidental.</p>",
    },
  },
  "ecowas-summit-regional-security": {
    fr: {
      title: "Sommet de la CEDEAO : les dirigeants ouest-africains sur la sécurité régionale",
      excerpt:
        "Les chefs d'État se réunissent à Abuja pour coordonner la réponse aux défis économiques et aux menaces transfrontalières.",
      content:
        "<p>Les discussions portent sur la coopération militaire, les échanges commerciaux et la stabilité politique dans la sous-région.</p>",
    },
    es: {
      title: "Cumbre de la CEDEAO: líderes abordan la seguridad regional",
      excerpt:
        "Los jefes de Estado se reúnen en Abuja para debatir respuestas coordinadas a retos económicos y amenazas transfronterizas.",
      content:
        "<p>Los debates incluyen cooperación militar, comercio y estabilidad política en la subregión.</p>",
    },
  },
  "freetown-tech-hub-journalism-training": {
    fr: {
      title: "Freetown : un hub tech lance une formation au journalisme pour les jeunes",
      excerpt:
        "Une initiative vise à doter les jeunes Sierra-Léonais de compétences en narration numérique et production audiovisuelle.",
      content:
        "<p>Le programme combine ateliers pratiques, mentorat et accès à des équipements de diffusion modernes.</p>",
    },
    es: {
      title: "Freetown: hub tecnológico lanza formación en periodismo juvenil",
      excerpt:
        "Una iniciativa busca equipar a jóvenes sierraleoneses con narrativa digital y producción audiovisual.",
      content:
        "<p>El programa combina talleres prácticos, mentoría y acceso a equipos de transmisión modernos.</p>",
    },
  },
  "premier-league-african-stars": {
    fr: {
      title: "Premier League : les stars africaines brillent ce week-end",
      excerpt:
        "Les performances des joueurs d'Afrique de l'Ouest dominent l'actualité sportive européenne.",
      content:
        "<p>Les clubs se battent pour les places européennes tandis que les supporters suivent chaque match de près.</p>",
    },
    es: {
      title: "Premier League: estrellas africanas brillan en la jornada",
      excerpt:
        "Las actuaciones de jugadores de África Occidental dominan los titulares deportivos europeos.",
      content:
        "<p>Los clubes luchan por plazas europeas mientras los aficionados siguen cada partido de cerca.</p>",
    },
  },
  "climate-resilience-coastal-flood-defenses": {
    fr: {
      title: "Résilience climatique : nouvelles défenses contre les inondations côtières",
      excerpt:
        "Ingénieurs et ONG collaborent sur des infrastructures durables pour protéger les zones littorales vulnérables.",
      content:
        "<p>Les communautés côtières testent des digues et des systèmes d'alerte précoce adaptés au changement climatique.</p>",
    },
    es: {
      title: "Resiliencia climática: nuevas defensas contra inundaciones costeras",
      excerpt:
        "Ingenieros y grupos ambientalistas colaboran en infraestructura sostenible para zonas costeras vulnerables.",
      content:
        "<p>Las comunidades costeras prueban diques y sistemas de alerta temprana adaptados al cambio climático.</p>",
    },
  },
  "worldview-expands-live-coverage": {
    fr: {
      title: "WorldView Creative Media étend sa couverture en direct",
      excerpt:
        "La chaîne annonce du streaming 24h/24 et des partenariats avec des correspondants en Afrique de l'Ouest.",
      content:
        "<p>Les téléspectateurs pourront suivre les bulletins, les débats et les événements spéciaux sur le web et les réseaux sociaux.</p>",
    },
    es: {
      title: "WorldView Creative Media amplía cobertura en vivo",
      excerpt:
        "La red anuncia streaming 24/7 y alianzas con corresponsales en África Occidental.",
      content:
        "<p>Los televidentes podrán seguir noticieros, debates y eventos especiales en la web y redes sociales.</p>",
    },
  },
};

const videoCatalog: Record<string, Partial<Record<LocalizedLocale, LocaleContentFields>>> = {
  "inside-freetown": {
    fr: {
      title: "À l'intérieur de Freetown : une journée dans la capitale",
      description: "Reportage vidéo sur la vie quotidienne et l'économie à Freetown.",
    },
    es: {
      title: "Por dentro de Freetown: un día en la capital",
      description: "Reportaje sobre la vida diaria y la economía en Freetown.",
    },
  },
  "west-africa-economic-outlook": {
    fr: {
      title: "Perspectives économiques de l'Afrique de l'Ouest 2026",
      description: "Analyse des tendances régionales et des marchés.",
    },
    es: {
      title: "Perspectiva económica de África Occidental 2026",
      description: "Análisis de tendencias regionales y mercados.",
    },
  },
  "sl-premier-league-highlights": {
    fr: {
      title: "Sports : temps forts de la Premier League SL",
      description: "Résumé des matchs et performances de la semaine.",
    },
    es: {
      title: "Deportes: resumen de la Premier League de SL",
      description: "Resumen de partidos y actuaciones de la semana.",
    },
  },
};

const categoryCatalog: Record<string, Partial<Record<LocalizedLocale, LocaleContentFields>>> = {
  national: { fr: { name: "National" }, es: { name: "Nacional" } },
  africa: { fr: { name: "Afrique" }, es: { name: "África" } },
  world: { fr: { name: "Monde" }, es: { name: "Mundo" } },
  business: { fr: { name: "Économie" }, es: { name: "Negocios" } },
  sports: { fr: { name: "Sports" }, es: { name: "Deportes" } },
  entertainment: { fr: { name: "Divertissement" }, es: { name: "Entretenimiento" } },
  technology: { fr: { name: "Technologie" }, es: { name: "Tecnología" } },
  opinion: { fr: { name: "Opinion" }, es: { name: "Opinión" } },
  education: { fr: { name: "Éducation" }, es: { name: "Educación" } },
  environment: { fr: { name: "Environnement" }, es: { name: "Medio ambiente" } },
  media: { fr: { name: "Médias" }, es: { name: "Medios" } },
};

const liveCatalog: Record<string, Partial<Record<LocalizedLocale, LocaleContentFields>>> = {
  "evening-news-bulletin": {
    fr: {
      title: "WorldView en direct — Bulletin du soir",
      description: "Suivez l'actualité en direct avec WorldView Creative Media.",
    },
    es: {
      title: "WorldView en vivo — Boletín nocturno",
      description: "Siga las noticias en vivo con WorldView Creative Media.",
    },
  },
};

const aboutCatalog: Partial<Record<LocalizedLocale, LocaleContentFields>> = {
  fr: {
    headline: "À propos de WorldView Creative Media",
    mission:
      "Informer, inspirer et connecter notre public grâce à un journalisme fiable, des récits captivants et des médias innovants.",
    description:
      "WorldView Creative Media est une plateforme numérique de presse et de médias qui diffuse des informations de confiance, des diffusions en direct et des histoires qui comptent en Sierra Leone, en Afrique et dans le monde.",
  },
  es: {
    headline: "Acerca de WorldView Creative Media",
    mission:
      "Informar, inspirar y conectar a nuestra audiencia con reportajes precisos, narrativas convincentes y medios innovadores.",
    description:
      "WorldView Creative Media es una plataforma digital de noticias y medios que ofrece periodismo confiable, transmisiones en vivo e historias relevantes en Sierra Leona, África y el mundo.",
  },
};

export function getCatalogArticle(
  slug: string,
  locale: LocalizedLocale
): LocaleContentFields | undefined {
  return articleCatalog[slug]?.[locale];
}

export function getCatalogVideo(
  slug: string,
  locale: LocalizedLocale
): LocaleContentFields | undefined {
  return videoCatalog[slug]?.[locale];
}

export function getCatalogCategory(
  slug: string,
  locale: LocalizedLocale
): LocaleContentFields | undefined {
  return categoryCatalog[slug]?.[locale];
}

export function getCatalogLive(
  slug: string,
  locale: LocalizedLocale
): LocaleContentFields | undefined {
  return liveCatalog[slug]?.[locale];
}

export function getCatalogAbout(locale: LocalizedLocale): LocaleContentFields | undefined {
  return aboutCatalog[locale];
}
