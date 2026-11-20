// Contenido del CV (EN/ES). `node scripts/build-cv.mjs` genera:
//   assets/docs/[ENG] Alan Quintana.pdf
//   assets/docs/[ESP] Alan Quintana.pdf
//   assets/docs/resume.pdf  (página 1 = EN, página 2 = ES; la usa /resume)
// Cada CV debe caber en UNA página carta: pdf_loader.js muestra la página 1
// para inglés y la 2 para español. El script falla si alguno se desborda.

export const contact = {
  web: 'www.alanquintana.pro',
  phone: '+52 614 110 5668',
  email: 'contact@alanquintana.pro',
};

export default {
  en: {
    role: 'Full Stack Designer',
    labels: {
      education: 'Education',
      stack: 'Tech stack',
      languages: 'Languages',
      profile: 'Profile',
      experience: 'Experience',
      projects: 'Main projects',
      expertise: 'Expertise',
      tools: 'Tools',
    },
    education: { title: 'Web Developer', school: 'Academlo School of Technology and Computer Science', years: '2024 – 2025' },
    stack: [
      ['Design', ['Photoshop', 'Illustrator', 'After Effects', 'Figma', 'SVG']],
      ['Frontend', ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Astro', 'Tailwind CSS']],
      ['Backend', ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Supabase']],
    ],
    languages: ['English B2', 'Spanish Native'],
    profile:
      'Designer and full stack developer with 15+ years creating digital experiences. I combine UI/UX design with modern development (React, Astro, TypeScript and Node.js) to build fast, accessible websites and web apps that look good and are easy to use. Founder of Aniwa, a digital agency in Chihuahua.',
    experience: {
      title: 'Aniwa · beaniwa.com',
      role: 'Founder · Developer & Digital Designer',
      dates: '2010 – Present',
      summary: 'Digital agency: web development, branding, SEO and social media for local and international businesses.',
      items: [
        ['Automercado', 'automercado.com.mx', '2026', 'Car marketplace for private buyers and sellers in Mexico. Astro + React, Supabase, Mercado Pago, Upstash Redis.'],
        ['Cal’s Auto Credit', 'calsautocreditinc.com', '2026', 'Bilingual used-car catalog for a dealership in Dallas, Texas. Astro SSR, Supabase, Tailwind.'],
        ['Mercado Regional', 'mercadoregional.com.mx', '2025', 'Website and blog for a regional products store in Cd. Cuauhtémoc. Astro, MDX, Tailwind.'],
        ['Forja Norte', 'forjanorte.com.mx', '2025', 'Web presence for a metalwork and welding company in Chihuahua. Astro, React, TypeScript.'],
      ],
    },
    projects: [
      ['Traktl', '2025', 'Full stack time tracker with projects, reports and real-time sync.', ['React + TypeScript frontend; Node.js, Express and MongoDB backend with Socket.IO.', 'JWT and Google OAuth authentication; available in English, Spanish and Turkish.']],
      ['CRUD User App', '2024', 'User management with Material 3 Expressive design.', ['Forms with React Hook Form + Yup; serverless API on Netlify Functions and Blobs.']],
      ['Marvel Universe Characters', '2024', 'App to search and explore Marvel characters.', ['useContext, useReducer and React Router for state and routes; accent-insensitive search.']],
    ],
    expertise: ['Project management with Agile methodology', 'Digital marketing and SEO', 'Branding', 'Negotiation and communication'],
    tools: 'VS Code, Git, Vite, Bash, npm, Postman, Docker, Netlify, Material UI, Adobe Creative Cloud.',
  },
  es: {
    role: 'Diseñador Full Stack',
    labels: {
      education: 'Educación',
      stack: 'Tecnologías',
      languages: 'Idiomas',
      profile: 'Perfil',
      experience: 'Experiencia',
      projects: 'Proyectos principales',
      expertise: 'Habilidades',
      tools: 'Herramientas',
    },
    education: { title: 'Desarrollador Web', school: 'Academlo School of Technology and Computer Science', years: '2024 – 2025' },
    stack: [
      ['Diseño', ['Photoshop', 'Illustrator', 'After Effects', 'Figma', 'SVG']],
      ['Frontend', ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Astro', 'Tailwind CSS']],
      ['Backend', ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Supabase']],
    ],
    languages: ['Inglés B2', 'Español nativo'],
    profile:
      'Diseñador y desarrollador full stack con más de 15 años creando experiencias digitales. Combino diseño UI/UX con desarrollo moderno (React, Astro, TypeScript y Node.js) para crear sitios y aplicaciones web rápidos, accesibles, atractivos y fáciles de usar. Fundador de Aniwa, agencia digital en Chihuahua.',
    experience: {
      title: 'Aniwa · beaniwa.com',
      role: 'Fundador · Desarrollador y Diseñador Digital',
      dates: '2010 – Actual',
      summary: 'Agencia digital: desarrollo web, branding, SEO y redes sociales para negocios locales e internacionales.',
      items: [
        ['Automercado', 'automercado.com.mx', '2026', 'Marketplace de autos entre particulares en México. Astro + React, Supabase, Mercado Pago, Upstash Redis.'],
        ['Cal’s Auto Credit', 'calsautocreditinc.com', '2026', 'Catálogo bilingüe de autos usados para una agencia en Dallas, Texas. Astro SSR, Supabase, Tailwind.'],
        ['Mercado Regional', 'mercadoregional.com.mx', '2025', 'Sitio web y blog para una tienda de productos regionales en Cd. Cuauhtémoc. Astro, MDX, Tailwind.'],
        ['Forja Norte', 'forjanorte.com.mx', '2025', 'Presencia web para una empresa de herrería y soldadura en Chihuahua. Astro, React, TypeScript.'],
      ],
    },
    projects: [
      ['Traktl', '2025', 'Registro de tiempo full stack con proyectos, reportes y sincronización en tiempo real.', ['Frontend en React + TypeScript; backend en Node.js, Express y MongoDB con Socket.IO.', 'Autenticación con JWT y Google OAuth; disponible en inglés, español y turco.']],
      ['CRUD de usuarios', '2024', 'Gestión de usuarios con diseño Material 3 Expressive.', ['Formularios con React Hook Form + Yup; API serverless en Netlify Functions y Blobs.']],
      ['Personajes de Marvel', '2024', 'App para buscar y explorar personajes de Marvel.', ['useContext, useReducer y React Router para estado y rutas; búsqueda sin importar acentos.']],
    ],
    expertise: ['Gestión de proyectos con metodología ágil', 'Marketing digital y SEO', 'Branding', 'Negociación y comunicación'],
    tools: 'VS Code, Git, Vite, Bash, npm, Postman, Docker, Netlify, Material UI, Adobe Creative Cloud.',
  },
};
