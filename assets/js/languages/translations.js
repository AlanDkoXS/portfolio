const translations = {
  /* <-- Page metadata (used by scripts/build-i18n.mjs for <head>) --> */
  meta: {
    en: {
      title: 'Alan Quintana | Full Stack Designer & Developer',
      description:
        'Alan Quintana, graphic designer and full stack web developer in Chihuahua, Mexico. React, Astro, TypeScript, Node.js and UI/UX design. Founder of Aniwa.',
      ogDescription:
        'Graphic designer and full stack developer: websites and web apps with React, Astro, TypeScript and Node.js, designed with care.',
      url: 'https://alanquintana.pro/',
      locale: 'en_US',
      // Merged into the JSON-LD <script data-i18n-jsonld> block
      jsonLd: {
        jobTitle: 'Full Stack Designer & Developer',
        description: 'Graphic designer and full stack web developer from Chihuahua, Mexico, with 15+ years creating digital experiences. Founder of the digital agency Aniwa.',
        knowsAbout: ['Graphic Design', 'UI/UX Design', 'Branding', 'Web Development', 'Full Stack Development', 'React', 'Astro', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'SEO', 'Web Accessibility'],
      },
    },
    es: {
      title: 'Alan Quintana | Diseñador y Desarrollador Full Stack',
      description:
        'Alan Quintana, diseñador gráfico y desarrollador web full stack en Chihuahua, México. React, Astro, TypeScript, Node.js y diseño UI/UX. Fundador de Aniwa.',
      ogDescription:
        'Diseñador gráfico y desarrollador full stack: sitios y apps web con React, Astro, TypeScript y Node.js, diseñados con cuidado.',
      url: 'https://alanquintana.pro/es/',
      locale: 'es_MX',
      jsonLd: {
        jobTitle: 'Diseñador y Desarrollador Full Stack',
        description: 'Diseñador gráfico y desarrollador web full stack de Chihuahua, México, con más de 15 años creando experiencias digitales. Fundador de la agencia digital Aniwa.',
        knowsAbout: ['Diseño Gráfico', 'Diseño UI/UX', 'Branding', 'Desarrollo Web', 'Desarrollo Full Stack', 'React', 'Astro', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'SEO', 'Accesibilidad Web'],
      },
    },
  },
  /* <-- Nav Bar --> */
  navHome: {
    en: 'Home',
    es: 'Inicio',
  },
  navAbout: {
    en: 'About',
    es: 'Sobre mí',
  },
  navSkills: {
    en: 'Skills',
    es: 'Habilidades',
  },
  /*     navPortfolio: {
      en: 'Portfolio',
      es: 'Portafolio',
    }, */
  navProjects: {
    en: 'Projects',
    es: 'Proyectos',
  },
  navContact: {
    en: 'Contact',
    es: 'Contacto',
  },
  navMenu: {
    en: 'Menu',
    es: 'Menú',
  },
  /* <-- Home Section --> */
  homeTitle: {
    en: 'Hi there!',
    es: '¡Hola 👨🏻‍💻!',
  },
  homeDescription: {
    en: "I'm Alan: half designer, half developer, fully obsessed with the details.",
    es: 'Soy Alan: mitad diseñador, mitad programador, y completamente obsesionado con los detalles.',
  },
  /* <-- Home Buttons --> */
  aboutButton: {
    en: 'Meet me',
    es: 'Conóceme',
  },
  resumeButton: {
    en: 'See my resume',
    es: 'Mira mi CV',
  },
  skillsButton: {
    en: 'Explore my skills',
    es: 'Descubre mis habilidades',
  },
  projectButton: {
    en: 'Check out my projects',
    es: 'Explora mis proyectos',
  },
  /* <-- About Section --> */
  aboutTitle: {
    en: 'About me',
    es: 'Sobre mí',
  },
  aboutImageAlt: {
    en: 'Portrait of Alan Quintana',
    es: 'Retrato de Alan Quintana',
  },
  // Enlace de cada tarjeta de proyecto a su página de caso (scripts/data/projects.mjs)
  projectCase: {
    en: {
      label: 'Read the case study',
      1: '/projects/marvel-wiki/',
      2: '/projects/crud-users/',
      3: '/projects/rick-and-morty-wiki/',
      4: '/projects/weather-app/',
      5: '/projects/fortune-cookie/',
      6: '/projects/traktl/',
    },
    es: {
      label: 'Lee el caso',
      1: '/es/proyectos/marvel-wiki/',
      2: '/es/proyectos/crud-users/',
      3: '/es/proyectos/rick-and-morty-wiki/',
      4: '/es/proyectos/weather-app/',
      5: '/es/proyectos/fortune-cookie/',
      6: '/es/proyectos/traktl/',
    },
  },
  // Íconos de demo y código en las tarjetas de proyectos
  projectLinks: {
    en: { demo: 'See the live demo', code: 'Check out the code' },
    es: { demo: 'Mira la demo en vivo', code: 'Revisa el código' },
  },
  // Lámpara colgante (botón de tema en escritorio)
  lamp: {
    en: 'Light',
    es: 'Luz',
  },
  skillsMotion: {
    en: { pause: 'Pause the animation', play: 'Play the animation' },
    es: { pause: 'Pausa la animación', play: 'Reanuda la animación' },
  },
  // Hero en escritorio: después de la presentación (homeDescription),
  // 7 líneas de 7 palabras cada una
  heroLines: {
    en: [
      "I started drawing; now I build websites,",
      "so I design and code every detail",
      "to make your page look great, load",
      "fast and work well wherever you are,",
      "always thinking of everyone who uses it.",
      "Your idea becomes real, without the hassle.",
      "Keep exploring and discover all my work.",
    ],
    es: [
      "Empecé dibujando y hoy también construyo sitios,",
      "por eso diseño y programo cada detalle",
      "para que tu página luzca increíble, cargue",
      "rápido y funcione bien en cualquier lugar,",
      "pensando siempre en cada persona que entra.",
      "Tu idea se vuelve real, sin complicaciones.",
      "Sigue explorando y conoce todo mi trabajo.",
    ],
  },
  aboutDescription: {
    en: "I come from graphic design and now build from start to finish: I design in Figma, Photoshop and Illustrator and code with React, JavaScript and Node.js, so every project goes from idea to code without losing its visual care. I create modern, responsive and fast web applications tailored to your business, where appealing design goes hand in hand with an intuitive, easy-to-use experience. I care about the details: typography, color, accessibility and performance.",
    es: 'Vengo del diseño gráfico y hoy desarrollo de principio a fin: diseño en Figma, Photoshop e Illustrator y programo con React, JavaScript y Node.js, así que cada proyecto pasa de la idea al código sin perder el cuidado visual. Creo aplicaciones web modernas, responsivas y rápidas, adaptadas a las necesidades de tu negocio, donde el diseño atractivo va de la mano de una experiencia intuitiva y fácil de usar. Me importan los detalles: tipografía, color, accesibilidad y rendimiento.',
  },

  /* <-- Skills Section --> */
  skillsTitle: {
    en: 'Skills',
    es: 'Habilidades',
  },
  skillsDescription: {
    en: 'I build scalable and efficient solutions, from interactive interfaces to complete backend systems. My goal is to create digital tools that streamline processes, enhance user engagement, and add value to your business.',
    es: 'Creo soluciones escalables y eficientes, desde interfaces interactivas hasta sistemas backend completos. Mi objetivo es crear herramientas digitales que optimicen procesos, mejoren la interacción con los usuarios y aporten valor a tu negocio.',
  },
  skillsTagsTitle: {
    en: 'Soft Skills',
    es: 'Habilidades Blandas',
  },
  skillsTags: {
    en: ['Responsible', 'Teamwork', 'Creative', 'Sense of urgency', 'Proactive'],
    es: ['Responsable', 'Trabajo en Equipo', 'Creativo', 'Sentido de Urgencia', 'Proactivo'],
  },
  skillsToolsTitle: {
    en: 'Tools',
    es: 'Herramientas',
  },
  skillsDesignTools: {
    en: 'Design Tools',
    es: 'Herramientas de Diseño',
  },
  skillsFrontendTools: {
    en: 'Frontend Tools',
    es: 'Herramientas para Frontend',
  },
  skillsBackendTools: {
    en: 'Backend Tools',
    es: 'Herramientas para Backend',
  },
  skillsDevelopmentTools: {
    en: 'Development Tools',
    es: 'Herramientas para Desarrollo',
  },
  /* <-- Designs Section (Dribbble, scripts/build-dribbble.mjs) --> */
  designsTitle: {
    en: 'Designs',
    es: 'Diseños',
  },
  designsDescription: {
    en: 'Illustrations and interfaces I share on Dribbble.',
    es: 'Ilustraciones e interfaces que comparto en Dribbble.',
  },
  designsButton: {
    en: 'See more on Dribbble',
    es: 'Ver más en Dribbble',
  },
  /* <-- Projects Section --> */
  projectsTitle: {
    en: 'Projects',
    es: 'Proyectos',
  },
  projectSubtitle: {
    en: 'Tech Stack',
    es: 'Tecnologías',
  },
  projectTitle1: {
    en: 'Marvel Wiki',
    es: 'Wiki de Marvel',
  },
  projectDescription1: {
    en: 'An application that displays information about Marvel characters, using useReducer for state management and useRef for referencing DOM elements.',
    es: 'Una aplicación que muestra información de personajes de Marvel, utilizando useReducer para la gestión del estado y useRef para la referencia a elementos DOM.',
  },
  projectTitle2: {
    en: 'CRUD Users',
    es: 'CRUD de Usuarios',
  },
  projectDescription2: {
    en: 'An application for user registration, with create, read, update, and delete (CRUD) functions, allowing full user management.',
    es: 'Una aplicación para el registro de usuarios, con funciones de creación, lectura, actualización y eliminación (CRUD), permitiendo una gestión completa de usuarios.',
  },
  projectTitle3: {
    en: 'Rick and Morty Wiki',
    es: 'Wiki de Rick and Morty',
  },
  projectDescription3: {
    en: 'An application that fetches data from an API to display information from the Rick and Morty series, using useFetch for handling HTTP requests.',
    es: 'Una aplicación que consulta una API para mostrar información sobre la serie Rick and Morty, usando useFetch para manejar las solicitudes HTTP.',
  },
  projectTitle4: {
    en: 'Weather App',
    es: 'App de Clima',
  },
  projectDescription4: {
    en: 'An application that shows current weather information using an external API, with various hooks to manage state and application logic.',
    es: 'Una aplicación que muestra el clima actual utilizando una API externa, con varios hooks para gestionar el estado y la lógica de la aplicación.',
  },
  projectTitle5: {
    en: 'Fortune Cookie App',
    es: 'Aplicación de Frases',
  },
  projectDescription5: {
    en: 'An application that generates random quotes, displaying a list of phrases with basic interaction features.',
    es: 'Una aplicación que genera frases aleatorias, mostrando un listado de frases con funcionalidades básicas de interacción.',
  },
  projectTitle6: {
    en: 'Traktl',
    es: 'Traktl',
  },
  projectDescription6: {
    en: 'Time tracker with temporizer. Full stack project built with Node.js, Express and React, with MongoDB database for efficient time management.',
    es: 'Rastreador de tiempo con temporizador. Proyecto full stack construido con Node.js, Express y React, con base de datos MongoDB para una gestión eficiente del tiempo.',
  },
  /* <-- Contact Section --> */

  contactTitle: {
    en: 'Contact',
    es: 'Contacto',
  },
  contactInfoTitle: {
    en: 'Contact',
    es: 'Contacto',
  },
  contactInfoDescription: {
    en: 'Say hi 👨🏻‍💻',
    es: 'Salúdame 👨🏻‍💻',
  },
  contactFormTitle: {
    en: 'Send me a message',
    es: 'Envíame un mensaje',
  },
  contactForm: {
    en: {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send your message',
      formSuccess: 'Done! I got your message.',
      close: 'Got it',
    },
    es: {
      name: 'Nombre',
      email: 'Correo',
      subject: 'Asunto',
      message: 'Mensaje',
      send: 'Envía tu mensaje',
      formSuccess: '¡Listo! Recibí tu mensaje.',
      close: 'Entendido',
    },
  },
  validation: {
    en: {
      required: 'Fill in this field',
      invalidEmail: 'Type a valid email',
      invalidName: 'Type your name: 2 to 50 letters',
      invalidSubject: 'Write a subject of 5 to 100 characters',
      invalidMessage: 'Write a message of 10 to 500 characters',
    },
    es: {
      required: 'Llena este campo',
      invalidEmail: 'Escribe un correo válido',
      invalidName: 'Escribe tu nombre: de 2 a 50 letras',
      invalidSubject: 'Escribe un asunto de 5 a 100 caracteres',
      invalidMessage: 'Escribe un mensaje de 10 a 500 caracteres',
    },
  },

  footerDescription: {
    en: 'Made with ❤️ and ☕. Thanks to my tutor Alejandra Olazagasti',
    es: 'Hecho con ❤️ y ☕. Gracias a mi tutora Alejandra Olazagasti',
  },

  footerCopyright: {
    en: 'All rights reserved',
    es: 'Todos los derechos reservados',
  },

  // Resume Page
  resumePage: {
    en: {
      homeLink: 'Home',
      homeHref: '/',
      downloadButton: 'Download it',
      selectLanguage: 'Pick a language',
      english: 'English',
      spanish: 'Español',
      close: 'Close',
      footerDescription: 'Made with ❤️ and ☕. Thanks to my tutor Alejandra Olazagasti.',
      footerCopyright: 'All rights reserved',
    },
    es: {
      homeLink: 'Inicio',
      homeHref: '/es/',
      downloadButton: 'Descárgalo',
      selectLanguage: 'Elige el idioma',
      english: 'English',
      spanish: 'Español',
      close: 'Cierra',
      footerDescription: 'Hecho con ❤️ y ☕. Gracias a mi tutora Alejandra Olazagasti.',
      footerCopyright: 'Todos los derechos reservados',
    },
  },
};

export default translations;
