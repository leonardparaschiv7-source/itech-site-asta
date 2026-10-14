/* ============================================================================
   iTECH — CENTRAL CONFIGURATION
   Every business variable lives here. Edit values, not components.
   Items marked  // PLACEHOLDER  need your real information before launch.
   ========================================================================== */
window.ITECH_CONFIG = {

  /* ── SEO ───────────────────────────────────────────────────────────────── */
  seoConfig: {
    siteTitle: "iTECH — Premium Website Design & Development",
    metaDescription: "iTECH designs and develops premium websites for businesses, brands and entrepreneurs. Strategy, design, development and launch.",
    ogTitle: "iTECH — Websites that sell",
    ogDescription: "Custom-designed, fast, responsive websites for businesses that want to look as good online as they are.",
    ogImage: "https://itechdigitalstudio.com/img/og-image.jpg",   // absolute URL, 1200×630
    favicon: "",            // PLACEHOLDER: URL of your favicon
    themeColor: "#08090C"
  },

  /* ── BRAND ─────────────────────────────────────────────────────────────── */
  brandConfig: {
    name: "iTECH",
    logoPrefix: "_",        // the blinking mark before the wordmark; "" to remove
    logoImage: "",          // optional image URL; replaces the text wordmark when set
    tagline: "Your vision. Our creation.",
    descriptor: "Premium websites for businesses, brands and entrepreneurs."
  },

  /* Owner-only "Edit site" button (inline text editing). false = hidden. */
  siteEditor: { enabled: false },

  /* Adaptive quality. "auto": each visitor's device is measured for a few seconds;
     if it cannot keep the animations smooth, the site switches itself to a lighter
     mode (same design, calmer motion). "full": always full effects. "lite": always light. */
  performanceConfig: { mode: "auto", slowFrameMs: 24, slowWindows: 2 },

  /* ── THEME TOKENS (applied as CSS variables) ───────────────────────────── */
  themeConfig: {
    backgroundPrimary: "#08090C",
    backgroundSecondary: "#111318",
    cardBackground: "#15171D",
    textPrimary: "#F7F8FA",
    textSecondary: "#A5A9B2",
    accentPrimary: "#76B6FF",
    accentSecondary: "#9787FF",
    accentHighlight: "#7AE7E7",
    borderColor: "rgba(247,248,250,0.09)",
    gradientPrimary: "linear-gradient(100deg, #76B6FF 0%, #9787FF 100%)",
    fontHeading: "'Geist', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontBody: "'Geist', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontAccent: "'Instrument Serif', Georgia, 'Times New Roman', serif",
    borderRadius: "14px",
    containerWidth: "1320px",
    sectionSpacing: "clamp(96px, 14vh, 176px)",
    cardSpacing: "clamp(16px, 1.6vw, 24px)"
  },

  /* ── MOTION ────────────────────────────────────────────────────────────── */
  motionConfig: {
    motionEnabled: true,
    motionIntensity: 1,         // 0–1.5
    parallaxEnabled: true,
    parallaxIntensity: 1,       // 0–1.5
    threeDEnabled: true,
    threeDIntensity: 1,         // 0–1.5
    threeDOnMobile: true,       // lighter 3D scene on phones; false = flat hero on phones
    cursorEffectsEnabled: true, // desktop only, disabled automatically on touch
    scrollAnimationsEnabled: true,
    grainEnabled: true
  },

  /* ── SECTIONS: order + on/off ──────────────────────────────────────────── */
  sections: {
    order: ["hero", "experience", "trust", "work", "builder", "services", "why", "websiteTypes", "packages", "addons",
            "estimator", "process", "comparison", "about", "testimonials", "faq",
            "projectBrief", "contact", "finalCTA"],
    hero: { enabled: true },
    experience: { enabled: false },   // removed: its video now plays in the hero   // Digital Experience scene (experience.js); settings in digitalExperienceConfig
    trust: { enabled: false },
    work: { enabled: true, hideNumber: true },   // hideNumber: hides the "01" label but keeps the line and the numbering of other sections
    builder: { enabled: true },   // "What do you want to build?" (builder.js); settings in projectSelectorConfig
    services: { enabled: false },   // merged into Why iTECH; nav "Services" now points to #why
    why: { enabled: false, hideNumber: true },   // removed at the owner's request (content kept in whyConfig / whyITechFeatures); nav "Services" + footer link hide automatically
    websiteTypes: { enabled: false },   // removed; content kept in websiteTypesConfig
    packages: { enabled: true, hideNumber: true },
    addons: { enabled: true, altSpan: 2, hideNumber: true },   // altSpan 2: keeps the background rhythm below unchanged after removing the estimator
    estimator: { enabled: false },   // removed; settings kept in estimatorConfig
    process: { enabled: true, hideNumber: true },
    comparison: { enabled: true, altSpan: 2, hideNumber: true },   // altSpan 2: keeps the background rhythm below unchanged after removing About
    about: { enabled: false },   // removed; content kept in aboutConfig (nav/footer links hide automatically)
    testimonials: { enabled: true, hideNumber: true },   // real approved reviews only; empty state + review form until then
    faq: { enabled: true, altSpan: 2, hideNumber: true },   // altSpan 2: keeps the background rhythm below unchanged after removing the brief
    projectBrief: { enabled: false },   // removed; "Start a project" buttons now lead to Contact
    contact: { enabled: false },   // removed; "Start a project" buttons now lead to Packages (WhatsApp)
    finalCTA: { enabled: true }
  },

  /* ── EXTRAS ────────────────────────────────────────────────────────────── */
  announcementConfig: {
    enabled: false,
    message: "Now accepting new projects.",
    linkLabel: "Start a project",
    link: "#brief",
    dismissible: true
  },
  loaderConfig: { enabled: false, durationMs: 700 },
  mobileStickyCta: { enabled: true, label: "Start a project" },

  /* ── NAVIGATION ────────────────────────────────────────────────────────── */
  navigationConfig: {
    items: [   // shown in the order of the sections on the page; hidden sections drop out
      { label: "Work", target: "work" },
      { label: "Services", target: "why" },
      { label: "Packages", target: "packages" },
      { label: "Process", target: "process" },
      { label: "About", target: "about" },
      { label: "FAQ", target: "faq" }
    ],
    cta: { label: "Start a project", target: "brief" }
  },

  /* ── HERO ──────────────────────────────────────────────────────────────── */
  hero: {
    // background video of the first screen: loops muted; poster = still frame shown while it loads,
    // on reduced motion and when the visitor saves data. hideScene: hides the 3D mock-ups on the right
    video: { enabled: true, src: "img/experience-video-lite.mp4", poster: "img/experience-poster.jpg", hideScene: true },   // previous: img/hero-video.mp4 + img/hero-poster.jpg
    eyebrow: "Web design & development studio",
    headline: "We build\nwebsites\nthat sell.",
    accentWord: "sell.",
    subheadline: "iTECH designs and develops premium websites for businesses, brands and entrepreneurs. Custom-made, fast, and built to turn visitors into clients.",
    primaryCta: { label: "Start a project", target: "brief" },
    secondaryCta: { label: "View our work", target: "work" },
    credibility: ["Strategy", "Design", "Development", "Launch"],
    mockupUrl: "yourbrand.com",
    // website shown in the hero browser; art: "laptop" draws a code-editor laptop on the right
    mock: { layout: "split", art: "laptop", bg: "#0E1015", fg: "#F4F6FA", accent: "#76B6FF", muted: "#8B90A0", font: "sans", brand: "NORTHLINE", kicker: "Architecture studio", headline: "Designed\nto be seen.", cta: "Start a project", nav: ["Work", "Studio", "Journal", "Contact"] },
    // iTECH client interface shown on the hero phone
    phone: { kicker: "Your vision. Our creation.", headline: "We build\nwebsites\nthat sell.", projectLabel: "Your project", projectName: "Brand website", progress: 68,
             stages: [ { label: "Strategy", state: "done" }, { label: "Design", state: "done" }, { label: "Development", state: "now" }, { label: "Launch", state: "next" } ],
             cta: "Start a project" }
  },

  /* ── DIGITAL EXPERIENCE (scene between Hero and Selected Work) ────────────
     Rendered by experience.js. Light trails, particles and atmosphere use
     WebGL (Three.js, loaded on demand); websites are real HTML.             */
  digitalExperienceConfig: {
    motionEnabled: true,
    scrollAnimation: false,     // false = static composition, no scroll transition (current)
    mouseParallax: true,
    particlesEnabled: true,
    lightTrailsEnabled: false,  // the moving light threads (removed)
    atmosphereEnabled: true,
    cursorLightEnabled: true,
    motionIntensity: 1,         // floating / idle movement
    parallaxIntensity: 1,       // cursor depth
    trailSpeed: 1,              // speed of light along the trails
    lightIntensity: 1,          // brightness of trails and glow
    scrollLength: 2.2,          // section height in screens (desktop) — lower = faster scroll story
    colors: { primary: "#76B6FF", secondary: "#8A9CFF", accent: "#9787FF", white: "#E8F0FF" },
    text: {
      eyebrow: "The iTECH experience",
      headline: "One idea.\nEvery screen.",
      accent: "Every screen.",
      body: "Design, development and interaction, built as one complete digital experience."
    },
    // photo.enabled: true shows this image as the scene's centrepiece instead of the HTML devices below
    photo: {
      // video: shown in place of the photo (the hotspots and hint then hide); remove it to bring the photo back
      video: { src: "img/experience-video-lite.mp4", poster: "img/experience-poster.jpg" },
      enabled: true, src: "img/studio.webp", alt: "iTECH websites shown on a desktop screen, a laptop, a design display and a phone in a dark studio",
      cursorLight: true,          // the cursor lights up the part of the image it passes over
      clickBurst: false,          // a click sends a pulse of light along the beams (off: no beams)
      hint: "Hover the screens",
      // interactive points; x / y are % of the image. side: "left" opens the card to the left
      hotspots: [
        { x: 50, y: 33, title: "Desktop experience", text: "A custom homepage, designed around the brand and built to turn visitors into clients." },
        { x: 24, y: 47, title: "Brand identity", text: "Each business gets its own visual language, never a template." },
        { x: 73, y: 36, title: "Design system", text: "Typography, colors and components defined before a line of code.", side: "left" },
        { x: 83, y: 43, title: "Mobile first", text: "Every layout is composed for the phone, not just shrunk.", side: "left" }
      ]
    },
    centerWebsite: {
      enabled: true, focusLabel: "Desktop experience", url: "yourbrand.com",
      nav: ["Work", "Services", "About", "Contact"], navCta: "Start a project",
      eyebrow: "Digital studio", headline: "Digital experiences\nbuilt around\nyour business.", accentLine: "your business.",
      text: "Custom websites for modern brands.", cta: "View project",
      tiles: ["Strategy", "Design", "Development"]
    },
    leftWebsite: {
      enabled: true, focusLabel: "Brand experience", url: "dharmabeauty.com",
      // any project with a template ("dharma" | "forge" | "aurea") or a desktopPreview image
      project: { name: "Dharma Beauty", template: "dharma", accentColor: "#B97A6E", backgroundColor: "#F6F0EA", textColor: "#3B2C28",
        site: { brand: "DHARMA", brandSub: "BEAUTY", nav: ["Treatments", "Academy", "About", "Contact"], eyebrow: "Lash & beauty studio", headline: "The quiet art\nof beauty.", text: "Lash, brow and skin rituals by appointment, in a calm studio.", cta: "Book an appointment", secondary: "View treatments",
          card: { title: "Classic lash set", meta: "90 min · Signature" },
          items: [ { name: "Lash lift", meta: "60 min · €65" }, { name: "Classic set", meta: "90 min · €85" }, { name: "Academy course", meta: "2 days · Beginner" } ] } }
    },
    designSystem: {
      enabled: true, focusLabel: "Design system", title: "Design system",
      steps: ["Strategy", "Design", "Development", "Launch"], activeStep: 1,
      swatches: ["#08090C", "#76B6FF", "#9787FF", "#F7F8FA"],
      fonts: ["Geist", "Instrument Serif"], components: ["Book now", "Learn more"]
    },
    mobileWebsite: { enabled: true, focusLabel: "Mobile experience" },
    labels: ["Responsive", "UI / UX", "Custom development", "Performance", "SEO ready"]
  },

  trustConfig: {
    items: ["Custom design", "Mobile first", "Fast performance", "SEO ready", "Responsive", "Scalable"]
  },

  /* ── SELECTED WORK: 3D SHOWCASE ────────────────────────────────────────────
     The Selected Work section renders ONLY from portfolioProjects below.
     Add, remove, reorder or disable projects here.
     desktopPreview / mobilePreview: an image of the website (file in img/ or URL).
     Without an image, template "dharma" | "forge" | "aurea" draws a built-in
     mini website; any other value falls back to a simple branded preview.   */
  portfolioShowcase: {
    header: { label: "Selected projects", title: "Different brands.\nDifferent worlds.", accent: "Different worlds.", intro: "Built around your business.\nDesigned to feel unmistakably yours." },
    viewLabel: "View project",
    closeLabel: "Close project"
  },
  portfolio3D: {
    enabled: true,
    perspective: 1800,        // px — higher = flatter
    sideRotation: 7,          // deg, Y rotation of the side panels
    sideOffset: 0.52,         // horizontal distance of side panels, × panel width
    sideScale: 0.84,
    depth: 180,               // px the side panels sit behind the centre
    hoverScale: 1.03,
    parallaxIntensity: 1,     // cursor-reactive tilt of the whole composition
    reflectionEnabled: true,
    mouseTrackingEnabled: true,
    scrollSeparation: true,   // panels start close together and separate on entry
    mobileEnabled: false      // false = swipe gallery on phones (recommended)
  },
  portfolioProjects: [
    /* desktopPreview: the project image (file in img/). scene: true shows it
       as a full photo card (no browser bar); previewCrop: the part shown.
       mobilePhotoCrop: the part used as the photo of the phone version.
       mobileStyle: "serif" | "bold" for the phone preview. */
    {
      id: "restaurant", name: "Savore Restaurant", slug: "savore", category: "Restaurant", industry: "Restaurant · Fine dining", type: "Restaurant & reservations website", year: "2026",
      label: "Concept project", featured: true, enabled: true, template: "photo", scene: true, mobileStyle: "serif",
      description: "A candlelit website for a fine-dining restaurant: signature dishes, the wine list and a table booked in a few taps.",
      direction: "Deep black, warm gold and glowing food photography. An elegant serif, generous spacing and one clear reservation path.",
      services: ["Brand direction", "UI/UX design", "Web development", "Reservations"],
      thumbnail: "", desktopPreview: "img/work-savore.webp", mobilePreview: "",
      previewCrop: { x: 0, y: 0, w: 1671, h: 941, sourceWidth: 1671 }, mobilePhotoCrop: { x: 780, y: 300, w: 600, h: 330, sourceWidth: 1671 },
      accentColor: "#D9B98A", backgroundColor: "#0E0B09", textColor: "#F3EBDD",
      site: { brand: "SAVORE", eyebrow: "Restaurant", headline: "Exceptional food.\nMemorable moments.", cta: "Book a table", meta: ["Signature dishes", "Fine selection", "Cozy atmosphere"] }
    },
    {
      id: "gym", name: "IronFit Gym", slug: "ironfit", category: "Fitness", industry: "Fitness · Personal training", type: "Gym & coaching website", year: "2026",
      label: "Concept project", featured: true, enabled: true, template: "photo", scene: true, mobileStyle: "bold",
      description: "A high-energy training brand: programs, personal coaching and a direct path to a first session.",
      direction: "Black, steel grey and a warm amber accent. Heavy uppercase type and dramatic, low-key gym photography.",
      services: ["Brand direction", "UI/UX design", "Web development", "Booking"],
      thumbnail: "", desktopPreview: "img/work-ironfit.webp", mobilePreview: "",
      previewCrop: { x: 0, y: 0, w: 1672, h: 941, sourceWidth: 1672 }, mobilePhotoCrop: { x: 800, y: 260, w: 520, h: 420, sourceWidth: 1672 },
      accentColor: "#E8B865", backgroundColor: "#0B0B0C", textColor: "#F2F2EE",
      site: { brand: "IRONFIT", eyebrow: "Stronger · Healthier · Happier", headline: "Build a\nstronger you.", cta: "Start your plan", meta: ["Personalized plans", "Expert trainers", "Supportive community"] }
    },
    {
      id: "dental", name: "Lumident Dental Clinic", slug: "lumident", category: "Healthcare", industry: "Healthcare · Dental clinic", type: "Clinic & online booking website", year: "2026",
      label: "Concept project", featured: true, enabled: true, template: "photo", scene: true, mobileStyle: "serif",
      description: "A bright, reassuring site for a modern dental clinic. Treatments are explained clearly and an appointment is one tap away.",
      direction: "Soft white, marble grey and deep navy. Light-filled photography and a refined serif that feels trustworthy, not clinical.",
      services: ["Brand direction", "UI/UX design", "Web development", "Online booking"],
      thumbnail: "", desktopPreview: "img/work-lumident.webp", mobilePreview: "",
      previewCrop: { x: 0, y: 0, w: 1672, h: 941, sourceWidth: 1672 }, mobilePhotoCrop: { x: 780, y: 250, w: 520, h: 390, sourceWidth: 1672 },
      accentColor: "#14202B", backgroundColor: "#F4F2EE", textColor: "#14202B",
      site: { brand: "LUMIDENT", eyebrow: "Dental clinic", headline: "A healthier,\nbrighter smile.", cta: "Book an appointment", meta: ["Modern technology", "Aesthetic treatments", "Experienced team"] }
    },
    {
      id: "barber", name: "Noble Barbershop", slug: "noblebarber", category: "Grooming", industry: "Grooming · Barbershop", type: "Barbershop & booking website", year: "2026",
      label: "Concept project", featured: true, enabled: true, template: "photo", scene: true, mobileStyle: "serif",
      description: "A premium grooming brand site: haircuts, beard work and products, with booking always one tap away.",
      direction: "Warm black, brass gold and moody tungsten light. Classic serif capitals with a confident, timeless tone.",
      services: ["Brand direction", "UI/UX design", "Web development", "Booking"],
      thumbnail: "", desktopPreview: "img/work-noble.webp", mobilePreview: "",
      previewCrop: { x: 0, y: 0, w: 1672, h: 941, sourceWidth: 1672 }, mobilePhotoCrop: { x: 740, y: 220, w: 580, h: 450, sourceWidth: 1672 },
      accentColor: "#D2AE6D", backgroundColor: "#0C0A08", textColor: "#F3EBDD",
      site: { brand: "NOBLE", eyebrow: "Haircut · Beard · Style", headline: "More than\na haircut.", cta: "Book now", meta: ["Premium haircuts", "Beard grooming", "Premium products"] }
    },
    {
      id: "carwash", name: "CleanRide Detailing", slug: "cleanride", category: "Automotive", industry: "Automotive · Car care", type: "Car wash & detailing website", year: "2026",
      label: "Concept project", featured: true, enabled: true, template: "photo", scene: true, mobileStyle: "bold",
      description: "A sleek website for a premium car wash and detailing studio: packages, results and online booking.",
      direction: "Gloss black, cool reflections and a soft champagne accent. Clean sans-serif type and high-contrast, wet-look photography.",
      services: ["Brand direction", "UI/UX design", "Web development", "Online booking"],
      thumbnail: "", desktopPreview: "img/work-cleanride-v2.webp", mobilePreview: "",
      previewCrop: { x: 0, y: 0, w: 1670, h: 942, sourceWidth: 1670 }, mobilePhotoCrop: { x: 850, y: 270, w: 480, h: 380, sourceWidth: 1670 },
      accentColor: "#D9B98A", backgroundColor: "#0A0B0D", textColor: "#F2F2EE",
      site: { brand: "CLEANRIDE", eyebrow: "Premium car wash & detailing", headline: "More than\na car wash.", cta: "Book an appointment", meta: ["Premium products", "Professional team", "Longer protection"] }
    }
  ],

  /* ── WHAT DO YOU WANT TO BUILD? (builder.js) ──────────────────────────────
     The selector renders only from buildTypes. preview: built-in HTML mockup
     ("business" | "ecommerce" | "booking" | "landing" | "portfolio" | "custom").
     briefType: the Project type preselected in the project brief.
     image: shows this part of an image instead of the HTML mockup
     (crop in pixels of the source image); remove it to use the mockup.  */
  projectSelectorConfig: {
    eyebrow: "Start your project",
    headline: "What do you\nwant to build?",
    accent: "want to build?",
    intro: "Choose the type of digital experience you need. We'll shape the strategy, design and development around your business.",
    defaultProject: "business",
    hoverPreview: false,        // false: the preview changes on click only (hover just highlights the row)
    mouseParallax: true,
    animationEnabled: true,
    animationDuration: 520,     // ms
    threeDIntensity: 1,
    showNumbers: false,
    showFeatures: true,
    showSecondaryCTA: true,
    ctaLabel: "Start this project",
    secondaryLabel: "View packages",
    techLabels: ["Design", "Development", "Launch"]
  },
  buildTypes: [
    { id: "business", image: { src: "img/build-business.webp", sourceWidth: 1536, crop: { x: 0, y: 56, w: 1536, h: 864 } }, title: "Business website", preview: "business", briefType: "business", headline: "Built for\nbusiness.",
      description: "A polished digital presence designed to build trust, explain your services and turn visitors into enquiries.",
      features: ["Custom design", "Responsive", "Contact forms", "SEO foundations"], floaters: ["Enquiry received", "SEO ready"] },
    { id: "ecommerce", image: { src: "img/build-ecommerce.webp" }, title: "E-commerce", preview: "ecommerce", briefType: "ecommerce", headline: "Designed\nto sell.",
      description: "A high-converting online store built around your products, brand and customer journey.",
      features: ["Product catalogue", "Payments", "Cart & checkout", "Mobile commerce"], floaters: ["Added to cart", "Secure checkout"] },
    { id: "booking", image: { src: "img/build-booking.webp" }, title: "Booking website", preview: "booking", briefType: "booking", headline: "Make booking\neffortless.",
      description: "A service website that turns visitors into booked appointments.",
      features: ["Online booking", "Services", "Staff profiles", "Automated enquiries"], floaters: ["Booked · Tue 10:30", "Reminder sent"] },
    { id: "landing", image: { src: "img/build-landing.webp" }, title: "Landing page", preview: "landing", briefType: "landing", headline: "One page.\nOne goal.",
      description: "A focused landing experience designed around one clear action.",
      features: ["Campaign design", "Lead generation", "Clear CTA", "Performance focus"], floaters: ["New lead", "1 clear action"] },
    { id: "portfolio", image: { src: "img/build-portfolio.webp" }, title: "Portfolio", preview: "portfolio", briefType: "portfolio", headline: "Make your\nwork the story.",
      description: "A visual-first portfolio designed to make your work impossible to ignore.",
      features: ["Project showcase", "Case studies", "Editorial design", "Responsive gallery"], floaters: ["Case study", "Gallery"] },
    { id: "custom", image: { src: "img/build-custom.webp" }, title: "Custom project", preview: "custom", briefType: "custom", headline: "Built\nwithout limits.",
      description: "For projects that need more than a standard website.",
      features: ["Custom functionality", "Advanced motion", "3D experiences", "Integrations"], floaters: ["3D layer", "API connected"] }
  ],

  /* ── SAMPLE MOCKUPS ────────────────────────────────────────────────────────
     Used as preview images by the Website Types explorer and the Before/After
     comparison (referenced by id). Not shown in Selected Work.              */
  portfolioConfig: {
    header: { label: "Selected work", title: "Selected\nwork.", accent: "work.", intro: "Concept projects that show the range of websites we design and build. Real client work will be added here." },
    showFilters: true,
    projects: [
      {
        id: "p1", slug: "maison-aurel", name: "Maison Aurel", category: "Real Estate", industry: "Real estate agency", type: "Business website", year: "2026", concept: true, featured: true,
        thumbnail: "", heroImage: "", gallery: [],
        description: "A calm, confident site for a boutique agency, built around a handful of exceptional listings.",
        challenge: "Present a small, curated portfolio of homes without the clutter of a typical property portal.",
        solution: "Editorial listing pages, generous photography and a viewing request flow on every property.",
        services: ["Strategy", "Web design", "Development"], technologies: ["Next.js", "Headless CMS"], websiteURL: "",
        mock: { layout: "grid", bg: "#F2EFE9", fg: "#1D1C1A", accent: "#8C7A5B", muted: "#7B756B", font: "serif", brand: "MAISON AUREL", kicker: "Selected homes · Autumn", headline: "Homes with a\npoint of view.", cta: "Book a viewing", nav: ["Homes", "Sell", "Journal", "Contact"] }
      },
      {
        id: "p2", slug: "dharma-beauty", name: "Dharma Beauty", category: "Beauty", industry: "Lash & brow studio", type: "Booking website", year: "2026", concept: true, featured: true,
        thumbnail: "", heroImage: "", gallery: [],
        description: "A soft, editorial booking site for a luxury lash studio, with treatments and prices one tap away.",
        challenge: "Most bookings came through messages. The studio needed a site that answers questions before they are asked.",
        solution: "Clear treatment pages, transparent prices and an appointment button on every screen.",
        services: ["Web design", "Development", "Booking setup"], technologies: ["Next.js", "Booking integration"], websiteURL: "",
        mock: { layout: "split", bg: "#F4E9E4", fg: "#3A2A27", accent: "#C27D72", muted: "#8A6F69", font: "serif", brand: "DHARMA", kicker: "Lash & brow atelier", headline: "The quiet art\nof the lash.", cta: "Book an appointment", nav: ["Treatments", "Artists", "Prices", "Book"] }
      },
      {
        id: "p3", slug: "osteria-luma", name: "Osteria Luma", category: "Hospitality", industry: "Restaurant", type: "Landing page", year: "2026", concept: true, featured: false,
        thumbnail: "", heroImage: "", gallery: [],
        description: "An evening-first landing page: tonight's menu, opening hours and a table booked in two taps.",
        challenge: "Guests searched on their phones minutes before arriving and could not find the menu.",
        solution: "A single fast page with the menu, hours, location and reservations above everything else.",
        services: ["Web design", "Development"], technologies: ["Static site", "Reservation widget"], websiteURL: "",
        mock: { layout: "center", bg: "#1C1714", fg: "#EFE4D6", accent: "#C8A27C", muted: "#A8988A", font: "serif", brand: "Osteria Luma", kicker: "Open tonight from 18:00", headline: "Fire, bread &\nslow evenings.", cta: "Reserve a table", nav: ["Menu", "Wine", "Visit"] }
      },
      {
        id: "p4", slug: "elena-voss", name: "Elena Voss", category: "Personal Brand", industry: "Architectural photographer", type: "Portfolio website", year: "2026", concept: true, featured: false,
        thumbnail: "", heroImage: "", gallery: [],
        description: "A quiet portfolio that lets large-format photography lead, with enquiries built into every project.",
        challenge: "Show hundreds of images without slowing the site down or burying the best work.",
        solution: "Curated series, fast-loading image galleries and a short enquiry form on every page.",
        services: ["Art direction", "Web design", "Development"], technologies: ["Next.js", "Image CDN"], websiteURL: "",
        mock: { layout: "portfolio", bg: "#EDEBE6", fg: "#141414", accent: "#141414", muted: "#77746E", font: "sans", brand: "ELENA VOSS", kicker: "Architecture · Interiors", headline: "Light, line\nand space.", cta: "View series", nav: ["Work", "About", "Contact"] }
      },
      {
        id: "p5", slug: "northfield-legal", name: "Northfield Legal", category: "Services", industry: "Law firm", type: "Business website", year: "2026", concept: true, featured: false,
        thumbnail: "", heroImage: "", gallery: [],
        description: "A reassuring site for a small law firm, with practice areas explained in plain language.",
        challenge: "Legal language kept visitors from understanding which service they needed.",
        solution: "Plain-language practice pages, a simple enquiry path and consultation booking.",
        services: ["Strategy", "Copy structure", "Web design", "Development"], technologies: ["Next.js", "Headless CMS"], websiteURL: "",
        mock: { layout: "split", bg: "#17211C", fg: "#EEF0EA", accent: "#B7C9A8", muted: "#9DA89C", font: "serif", brand: "NORTHFIELD", kicker: "Family & property law", headline: "Clear advice.\nCalm process.", cta: "Book a consultation", nav: ["Practice", "Team", "Fees", "Contact"] }
      },
      {
        id: "p6", slug: "atelier-sable", name: "Atelier Sable", category: "E-commerce", industry: "Ceramics brand", type: "Online store", year: "2026", concept: true, featured: false,
        thumbnail: "", heroImage: "", gallery: [],
        description: "A small-batch ceramics store where product photography and craft stories sell the work.",
        challenge: "Marketplace listings made handmade pieces look like mass-produced products.",
        solution: "A branded store with collection pages, maker stories and a simple checkout.",
        services: ["Web design", "E-commerce", "Development"], technologies: ["Shopify", "Custom theme"], websiteURL: "",
        mock: { layout: "shop", bg: "#EFE6DA", fg: "#2B241E", accent: "#A5673F", muted: "#8C7F72", font: "sans", brand: "atelier sable", kicker: "Autumn collection", headline: "Made slowly,\nby hand.", cta: "Shop the collection", nav: ["Shop", "Makers", "Journal", "Cart (0)"] }
      }
    ]
  },

  /* ── SERVICES ──────────────────────────────────────────────────────────────
     priceFrom: number shows "From €X"; null shows priceNote.                  */
  servicesConfig: {
    header: { label: "Services", title: "What we\ncreate.", accent: "create.", intro: "Every website is designed from a blank page for one business. Choose a starting point; we shape the rest around you." },
    currency: "€",
    priceNote: "Quote on request",
    items: [
      { id: "business", name: "Business websites", summary: "A complete online presence that explains what you do and makes it easy to get in touch.", useCase: "Clinics, agencies, consultants and local businesses.", features: ["Home, services, about and contact pages", "Clear structure for every service", "Contact forms and maps", "Content you can update"], priceFrom: 1200, estimatorType: "business" },
      { id: "landing", name: "Landing pages", summary: "One focused page built around one offer, launch or campaign.", useCase: "Product launches, promotions, events and ad campaigns.", features: ["One clear call to action", "Fast loading on mobile", "Built for ads and social links", "Analytics-ready"], priceFrom: 700, estimatorType: "landing" },
      { id: "ecommerce", name: "E-commerce", summary: "A branded online store that presents products the way they deserve.", useCase: "Independent brands, makers and boutiques.", features: ["Product and collection pages", "Secure checkout and payments", "Stock and order management", "Shipping and tax setup"], priceFrom: 2400, estimatorType: "store" },
      { id: "portfolio", name: "Portfolio websites", summary: "A presentation website for professionals whose work needs to be seen.", useCase: "Photographers, architects, designers and personal brands.", features: ["Project galleries and case studies", "Fast image loading", "About and testimonials", "Enquiry forms"], priceFrom: 1000, estimatorType: "portfolio" },
      { id: "booking", name: "Booking websites", summary: "Service websites where customers can see prices and book in a few taps.", useCase: "Salons, barbers, studios, clinics and restaurants.", features: ["Online booking or requests", "Transparent service lists and prices", "Click-to-call and WhatsApp", "Opening hours and location"], priceFrom: 1600, estimatorType: "booking" },
      { id: "custom", name: "Custom web experiences", summary: "Interactive, animated or 3D websites for brands that want to be remembered.", useCase: "Launches, flagship brand sites and campaigns.", features: ["Custom interactions and motion", "3D and immersive sections", "Bespoke integrations", "Performance-tuned builds"], priceFrom: null, estimatorType: "custom" }
    ]
  },

  /* ── WHY iTECH: interactive editorial section (why.js) ─────────────────────
     Header text comes from whyConfig.header; features from whyITechFeatures.
     visual.spots: highlight areas on the image (% of the visual), grouped by
     feature group. Remove the image to fall back to the simple layout.     */
  whyITechConfig: {
    stickyVisual: true,
    mouseParallax: true,
    activeFeatureTracking: true,
    floatingLabels: true,
    visualIntensity: 1,
    intro: "Every successful website is built from multiple layers working together.",
    endTitle: "Every detail has a purpose.",
    endText: "Design, performance and technology working as one system.",
    endCta: { label: "Start a project", target: "brief" },
    // background photo of the section (remove to use the plain background)
    background: { src: "img/why-bg.webp", opacity: 1, far: "img/why-bg-far.webp", band: "img/why-bg-band.webp" },   // far/band: the same photo with its blur / sharpen / colour pre-applied (faster than live CSS filters); remove them if you change src
    // the website shown on BOTH the laptop and the phone (one brand, every screen)
    site: {
      brand: "NORTHGATE", url: "northgate.com",
      nav: ["Home", "Services", "Projects", "About", "Contact"], navCta: "Get in touch",
      headline: "Built around\nyour business.", accent: "your business.",
      text: "Premium websites designed to elevate your brand and deliver real results.",
      cta: "Get started",
      // architectural photo: a region of an image file (pixels)
      photo: { src: "img/studio.webp", sourceWidth: 1672, sourceHeight: 941, crop: { x: 835, y: 262, w: 330, h: 250 } },
      cards: [
        { title: "Strategy", text: "We plan around your goals.", crop: { x: 880, y: 290, w: 130, h: 95 } },
        { title: "Design", text: "Modern and tailored to your brand.", crop: { x: 1010, y: 280, w: 130, h: 95 } },
        { title: "Development", text: "Fast, secure and built to grow.", crop: { x: 930, y: 420, w: 130, h: 95 } }
      ]
    }
  },
  /* Why iTECH visual behaviour (why.js) */
  whyITechVisualConfig: {
    parallaxEnabled: true,
    connectorLinesEnabled: true,
    ambientMotionEnabled: true,
    cardHoverEnabled: true,
    monitorTiltEnabled: true,
    phoneTiltEnabled: true,
    lightingIntensity: 1,
    motionIntensity: 1
  },
  /* The ten reasons, rendered as floating panels around the monitor and phone.
     tag: the small label next to the number.
     position: top-left of the panel in % of the visual (desktop).
     tablet: position on tablet (panels without it are listed below the visual there).
     depth: 0 (far) to 3 (close).
     link: where its connector line ends: "monitor" or "phone", x/y in % of that device. */
  whyITechFeatures: [   // 6 shown (3 left, 3 right); enabled: false hides a reason without deleting it
    { id: "01", tag: "Brand", title: "Custom visual identity", description: "Designed around your brand, never adapted from a generic template.", icon: "grid", position: { x: 2, y: 4 }, tablet: { x: 1, y: 2 }, depth: 2, link: { to: "monitor", x: 0, y: 12 }, enabled: true },
    { id: "02", tag: "UX", title: "Strategic UX", description: "Structure and content planned around what your visitors need to understand and decide.", icon: "layers", position: { x: 2, y: 68 }, tablet: { x: 1, y: 70 }, depth: 2, link: { to: "monitor", x: 0, y: 82 }, enabled: true },
    { id: "03", tag: "Responsive", title: "Responsive design", description: "Every experience is intentionally designed for desktop, tablet and mobile.", icon: "devices", position: { x: 80, y: 36 }, tablet: { x: 78, y: 36 }, depth: 2, link: { to: "phone", x: 100, y: 30 }, enabled: true },
    { id: "04", tag: "Speed", title: "Performance optimization", description: "Lean code, optimized assets and thoughtful architecture for fast loading.", icon: "bolt", position: { x: 1, y: 36 }, tablet: { x: 1, y: 36 }, depth: 1, link: { to: "monitor", x: 0, y: 46 }, enabled: true },
    { id: "05", tag: "Journeys", title: "Clear user journeys", description: "Every page leads somewhere meaningful — a call, booking, enquiry or purchase.", icon: "target", position: { x: 57, y: 1 }, depth: 1, link: { to: "monitor", x: 80, y: 0 }, enabled: false },
    { id: "06", tag: "Conversion", title: "Conversion-focused layouts", description: "Calls to action and information are positioned around real business goals.", icon: "chart", position: { x: 80, y: 4 }, tablet: { x: 78, y: 2 }, depth: 2, link: { to: "monitor", x: 100, y: 14 }, enabled: true },
    { id: "07", tag: "SEO", title: "SEO foundations", description: "Clean structure, metadata and performance foundations designed for search visibility.", icon: "search", position: { x: 80, y: 68 }, tablet: { x: 78, y: 70 }, depth: 2, link: { to: "phone", x: 100, y: 86 }, enabled: true },
    { id: "08", tag: "Architecture", title: "Scalable architecture", description: "Built so pages, languages, integrations and functionality can be added later.", icon: "cube", position: { x: 55, y: 80 }, tablet: { x: 38, y: 79 }, depth: 2, link: { to: "monitor", x: 62, y: 100 }, enabled: false },
    { id: "09", tag: "Launch", title: "Professional deployment", description: "Domain, hosting, SSL and launch configuration handled properly.", icon: "cloud", position: { x: 28, y: 82 }, depth: 3, link: { to: "monitor", x: 25, y: 100 }, enabled: false },
    { id: "10", tag: "Support", title: "Ongoing support", description: "Optional maintenance, improvements and future development after launch.", icon: "support", position: { x: 2, y: 59 }, tablet: { x: 1, y: 54 }, depth: 2, link: { to: "monitor", x: 0, y: 78 }, enabled: false }
  ],

  /* ── WHY iTECH (header text; the old grid items below are no longer shown) ─ */
  whyConfig: {
    header: { label: "Why iTECH", title: "Not just a website.", accentLine: "A digital experience built for your business.", intro: "" },
    items: [
      { title: "Custom visual identity", text: "Designed for your brand, never adapted from a template." },
      { title: "Strategic UX", text: "Pages planned around what your visitors need to decide." },
      { title: "Responsive design", text: "Composed separately for phone, tablet and desktop." },
      { title: "Performance optimization", text: "Lean code and optimized images so pages load quickly." },
      { title: "Clear user journeys", text: "Every page leads somewhere: a call, a booking, an enquiry." },
      { title: "Conversion-focused layouts", text: "Calls to action placed where decisions are made." },
      { title: "SEO foundations", text: "Clean structure, metadata and speed search engines reward." },
      { title: "Scalable architecture", text: "Built to add pages, languages and features later." },
      { title: "Professional deployment", text: "Domain, hosting and launch handled properly." },
      { title: "Ongoing support options", text: "Maintenance and improvements after launch, if you want them." }
    ]
  },

  /* ── WEBSITE TYPES EXPLORER ────────────────────────────────────────────── */
  websiteTypesConfig: {
    header: { label: "Website types", title: "Find your\nstarting point.", accent: "starting point.", intro: "Explore the kinds of websites we build and what each one usually includes." },
    types: [
      { id: "business", label: "Business", title: "Business website", description: "A multi-page website that presents your company, your services and the people behind them.", features: ["Service pages", "About and team", "Contact and map", "Editable content"], scope: { pages: "5–10 pages", timeline: "4–6 weeks", bestFor: "Service companies" }, mockRef: "p5" },
      { id: "ecommerce", label: "E-commerce", title: "Online store", description: "A branded store with collections, product pages and a checkout customers trust.", features: ["Product catalogue", "Secure payments", "Order management", "Shipping setup"], scope: { pages: "Shop + 4–8 pages", timeline: "6–10 weeks", bestFor: "Product brands" }, mockRef: "p6" },
      { id: "landing", label: "Landing page", title: "Landing page", description: "One page, one goal. Built to explain an offer quickly and collect enquiries or sales.", features: ["Single call to action", "Offer sections", "Lead form", "Tracking-ready"], scope: { pages: "1 page", timeline: "1–3 weeks", bestFor: "Campaigns and launches" }, mockRef: "p3" },
      { id: "portfolio", label: "Portfolio", title: "Portfolio website", description: "A showcase for your work, with galleries that load fast and an easy way to hire you.", features: ["Project galleries", "Case studies", "About page", "Enquiry form"], scope: { pages: "3–8 pages", timeline: "3–5 weeks", bestFor: "Creatives and professionals" }, mockRef: "p4" },
      { id: "booking", label: "Booking", title: "Booking website", description: "Services, prices and availability in one place, so customers can book without calling.", features: ["Service menu with prices", "Online booking", "Reminders", "Location and hours"], scope: { pages: "3–6 pages", timeline: "3–5 weeks", bestFor: "Salons, studios, clinics" }, mockRef: "p2" },
      { id: "custom", label: "Custom", title: "Custom web experience", description: "Motion, 3D and bespoke interactions for brands that want a website people talk about.", features: ["Custom motion design", "3D sections", "Bespoke features", "Integrations"], scope: { pages: "Defined together", timeline: "8+ weeks", bestFor: "Flagship brand sites" }, mockRef: "p1" }
    ],
    note: "Timelines are typical ranges and depend on the brief and on how quickly content is ready."
  },

  /* ── PACKAGES ──────────────────────────────────────────────────────────────
     price.type: "from" | "range" | "fixed" | "quote" | "hidden"
     Each CTA opens WhatsApp (whatsappNumber) with its whatsappMessage.      */
  packagesConfig: {
    whatsappNumber: "40724972017",            // international format, digits only
    whatsappDisplay: "+40 724 972 017",
    brandLine: "Websites built around your business",
    contactStrip: { title: "Not sure which package fits?", text: "Let's talk about your project." },
    header: { label: "Packages", title: "Clear starting\npoints.", accent: "points.", intro: "Every project is quoted from its brief. These packages show where most projects begin." },
    currency: "€",
    note: "Prices are starting points in EUR and exclude VAT where applicable. Your final quote follows the project brief.",
    /* PRICING PER LANGUAGE — the packages section reads pricing[active language] (en / ro / de).
       Romanian uses lei, English and German use EUR: fixed market prices, no conversion.
       Each package: title, subtitle, oldPrice, launchPrice, savings, features, excluded
       (+ excludedLabel), cta, badge, whatsappMessage. Custom: priceLabel + priceNote instead
       of prices. A feature can be ["text", "small note"] for a clarifying line.            */
    pricing: {
      en: {
        offer: { label: "Founding client offer", text: "Special launch pricing for the first 3 iTECH projects.", bonus: "+ 30 days of basic maintenance included" },
        priceLabel: "Launch price", quoteLabel: "Pricing", notIncluded: "Not included",
        note: "Prices are in EUR and exclude VAT where applicable. Your final quote follows the project brief.",
        packages: {
          start: { title: "Start", subtitle: "For entrepreneurs, freelancers and small businesses that need a professional online presence.",
            oldPrice: "€399", launchPrice: "€319", savings: "Save €80",
            features: ["Custom design tailored to your brand", "Up to 4 pages", "Responsive on desktop, tablet and mobile", "Functional contact form", "Basic technical SEO", "Image and performance optimization", "Domain and SSL setup", "Launch and final verification", "14 days post-launch support"],
            excluded: ["Complex animations", "Booking system", "Online store", "Advanced custom functionality"],
            cta: "Start your project", whatsappMessage: "Hello! I'm interested in the iTECH Start package at the founding client price (€319). I'd like to discuss my project." },
          grow: { title: "Grow", badge: "Most popular", subtitle: "For growing businesses that need more than a simple presentation website.",
            oldPrice: "€799", launchPrice: "€699", savings: "Save €100",
            features: ["Everything included in Start", "Up to 10 pages", "CMS for blog or news", "Advanced quote request form", "Standard booking integration", "Analytics setup", "Modern scroll animations", "Extended on-page SEO", "Conversion-focused UX structure", "Advanced mobile optimization", "30 days post-launch support"],
            excluded: ["Complex 3D", "Full online store", "Custom API integrations", "Advanced backend functionality"],
            cta: "Choose Grow", whatsappMessage: "Hello! I'm interested in the iTECH Grow package at the founding client price (€699). I'd like to discuss my project." },
          premium: { title: "Premium", subtitle: "For brands that want a premium digital experience with advanced design, animations and custom interactions.",
            oldPrice: "€1,399", launchPrice: "€1,099", savings: "Save €300",
            features: ["Everything included in Grow", "Advanced custom UI/UX", "Premium visual direction", "Custom interactions", "Premium animations", "Scroll storytelling", "Custom structures for complex pages", "Dedicated interactive components",
              ["Standard integrations with external services", "Common tools only: Google Analytics, Google Maps, WhatsApp, newsletter platforms, Calendly or similar, standard forms and embeds, and a standard CRM connection where technically supported."],
              "Advanced performance optimization", "Extended device and browser testing", "60 days post-launch support"],
            excludedLabel: "Quoted separately",
            excluded: ["Complex 3D / WebGL", "Complex e-commerce", "Custom APIs", "User accounts / authentication", "Custom dashboards", "Complex automations", "Advanced databases", "Marketplaces", "Membership systems", "SaaS functionality", "Custom checkout", "Complex booking engines", "Complex CRM / ERP", "Custom portals", "Multi-role user systems", "Advanced Three.js experiences", "Complex configurators", "Backend-heavy functionality"],
            cta: "Build Premium", whatsappMessage: "Hello! I'm interested in the iTECH Premium package at the founding client price (€1,099). I'd like to discuss my project." },
          custom: { title: "Custom", subtitle: "For platforms, systems and digital experiences that do not fit into a standard package.",
            priceLabel: "Let's talk", priceNote: "Pricing tailored to your project.",
            features: ["Strategy and project discovery", "Custom technical architecture", "UX designed from scratch", "Custom-developed functionality", "API and external service integrations", "Automation", "Authentication and user accounts", "Dashboards", "Database-driven functionality", "Advanced e-commerce", "Marketplaces", "Custom configurators and flows", "3D / WebGL experiences", "Platforms and portals", "Dedicated project roadmap", "Controlled testing and launch"],
            cta: "Let's talk", whatsappMessage: "Hello! I have a custom project (platform / system) and I'd like to discuss it with iTECH." }
        }
      },
      ro: {
        offer: { label: "Ofertă de lansare", text: "Prețuri speciale pentru primele 3 proiecte iTECH.", bonus: "+ 30 zile de mentenanță de bază incluse" },
        priceLabel: "Preț de lansare", quoteLabel: "Preț", notIncluded: "Nu este inclus",
        note: "Prețurile sunt în lei și nu includ TVA acolo unde se aplică. Oferta finală se face pe baza briefului proiectului.",
        packages: {
          start: { title: "Start", subtitle: "Pentru antreprenori, freelanceri și afaceri mici care au nevoie de o prezență online profesionistă.",
            oldPrice: "2.000 lei", launchPrice: "1.590 lei", savings: "Economisești 410 lei",
            features: ["Design personalizat pentru brandul tău", "Până la 4 pagini", "Responsive pe telefon, tabletă și desktop", "Formular de contact funcțional", "SEO tehnic de bază", "Optimizare imagini și performanță", "Configurare domeniu și SSL", "Publicare și verificare la lansare", "14 zile suport după lansare"],
            excluded: ["Animații complexe", "Sistem de rezervări", "Magazin online", "Funcționalități custom avansate"],
            cta: "Începe proiectul", whatsappMessage: "Bună! Sunt interesat de pachetul iTECH Start la prețul de lansare (1.590 lei). Aș vrea să discutăm despre proiectul meu." },
          grow: { title: "Grow", badge: "Cel mai ales", subtitle: "Pentru afaceri care vor să crească online și au nevoie de mai mult decât un simplu site de prezentare.",
            oldPrice: "4.000 lei", launchPrice: "3.499 lei", savings: "Economisești 501 lei",
            features: ["Tot ce include Start", "Până la 10 pagini", "CMS pentru blog sau noutăți", "Formular avansat de cerere ofertă", "Integrare booking / programări standard", "Configurare Analytics", "Animații moderne la scroll", "SEO on-page extins", "Structură UX orientată spre conversie", "Optimizare avansată pentru mobil", "30 zile suport după lansare"],
            excludedLabel: "Nu este inclus / se estimează separat",
            excluded: ["Elemente 3D complexe", "Magazin online complet", "Integrări API custom", "Funcționalități backend avansate"],
            cta: "Alege Grow", whatsappMessage: "Bună! Sunt interesat de pachetul iTECH Grow la prețul de lansare (3.499 lei). Aș vrea să discutăm despre proiectul meu." },
          premium: { title: "Premium", subtitle: "Pentru branduri care vor o experiență digitală premium, cu design avansat, animații și interacțiuni personalizate.",
            oldPrice: "7.000 lei", launchPrice: "5.499 lei", savings: "Economisești 1.501 lei",
            features: ["Tot ce include Grow", "UI/UX custom avansat", "Direcție vizuală premium", "Interacțiuni personalizate", "Animații premium", "Scroll storytelling", "Structuri custom pentru pagini complexe", "Componente interactive dedicate",
              ["Integrări standard cu servicii externe", "Doar instrumente uzuale: Google Analytics, Google Maps, WhatsApp, platforme de newsletter, Calendly sau similar, formulare și embed-uri standard, conectare CRM standard acolo unde e posibil tehnic."],
              "Optimizare avansată de performanță", "Testare extinsă pe dispozitive și browsere", "60 zile suport după lansare"],
            excludedLabel: "Se estimează separat",
            excluded: ["3D complex / WebGL", "E-commerce complex", "API custom", "Conturi utilizator / autentificare", "Dashboard-uri custom", "Automatizări complexe", "Baze de date avansate", "Marketplace", "Sisteme de membership", "Funcționalități SaaS", "Checkout personalizat", "Sisteme complexe de rezervări", "CRM / ERP complex", "Portaluri custom", "Sisteme cu mai multe roluri de utilizator", "Experiențe Three.js avansate", "Configuratoare complexe", "Funcționalități backend-heavy"],
            cta: "Construiește Premium", whatsappMessage: "Bună! Sunt interesat de pachetul iTECH Premium la prețul de lansare (5.499 lei). Aș vrea să discutăm despre proiectul meu." },
          custom: { title: "Custom", subtitle: "Pentru platforme, sisteme și experiențe digitale care nu se încadrează într-un pachet standard.",
            priceLabel: "Hai să vorbim", priceNote: "Preț adaptat proiectului tău.",
            features: ["Sesiune de strategie și definire proiect", "Arhitectură personalizată", "UX construit de la zero", "Funcționalități dezvoltate la comandă", "Integrări API și servicii externe", "Automatizări", "Sisteme de autentificare / cont utilizator", "Dashboard-uri", "Funcționalități bazate pe baze de date", "E-commerce complex", "Marketplace", "Configuratoare și fluxuri custom", "Elemente 3D / WebGL", "Platforme și portaluri", "Plan de proiect dedicat", "Testare și lansare controlată"],
            cta: "Discută proiectul", whatsappMessage: "Bună! Am un proiect personalizat (platformă / sistem) și aș vrea să-l discut cu iTECH." }
        }
      },
      de: {
        offer: { label: "Founding Client Angebot", text: "Spezielle Einführungspreise für die ersten 3 iTECH-Projekte.", bonus: "+ 30 Tage Basis-Wartung inklusive" },
        priceLabel: "Einführungspreis", quoteLabel: "Preis", notIncluded: "Nicht enthalten",
        note: "Preise in EUR, ggf. zzgl. MwSt. Dein finales Angebot richtet sich nach dem Projektbriefing.",
        packages: {
          start: { title: "Start", subtitle: "Für Selbstständige, Freelancer und kleine Unternehmen, die einen professionellen Online-Auftritt benötigen.",
            oldPrice: "€399", launchPrice: "€319", savings: "Du sparst €80",
            features: ["Individuelles Design für deine Marke", "Bis zu 4 Seiten", "Responsive auf Desktop, Tablet und Smartphone", "Funktionierendes Kontaktformular", "Technisches Basis-SEO", "Bild- und Performance-Optimierung", "Domain- und SSL-Einrichtung", "Veröffentlichung und Launch-Check", "14 Tage Support nach dem Launch"],
            excluded: ["Komplexe Animationen", "Buchungssystem", "Online-Shop", "Erweiterte individuelle Funktionen"],
            cta: "Projekt starten", whatsappMessage: "Hallo! Ich interessiere mich für das iTECH-Paket Start zum Einführungspreis (€319). Ich würde gern über mein Projekt sprechen." },
          grow: { title: "Grow", badge: "Am beliebtesten", subtitle: "Für wachsende Unternehmen, die mehr als eine einfache Unternehmenswebsite benötigen.",
            oldPrice: "€799", launchPrice: "€699", savings: "Du sparst €100",
            features: ["Alles aus Start", "Bis zu 10 Seiten", "CMS für Blog oder News", "Erweitertes Anfrageformular", "Standard-Buchungsintegration", "Analytics-Einrichtung", "Moderne Scroll-Animationen", "Erweitertes On-Page-SEO", "Conversion-orientierte UX-Struktur", "Erweiterte Mobile-Optimierung", "30 Tage Support nach dem Launch"],
            excluded: ["Komplexes 3D", "Vollständiger Online-Shop", "Individuelle API-Integrationen", "Erweiterte Backend-Funktionen"],
            cta: "Grow wählen", whatsappMessage: "Hallo! Ich interessiere mich für das iTECH-Paket Grow zum Einführungspreis (€699). Ich würde gern über mein Projekt sprechen." },
          premium: { title: "Premium", subtitle: "Für Marken, die ein hochwertiges digitales Erlebnis mit fortschrittlichem Design, Animationen und individuellen Interaktionen wünschen.",
            oldPrice: "€1,399", launchPrice: "€1,099", savings: "Du sparst €300",
            features: ["Alles aus Grow", "Fortgeschrittenes individuelles UI/UX", "Premium-Designrichtung", "Individuelle Interaktionen", "Premium-Animationen", "Scroll-Storytelling", "Individuelle Strukturen für komplexe Seiten", "Eigene interaktive Komponenten",
              ["Standard-Integrationen externer Dienste", "Nur gängige Tools: Google Analytics, Google Maps, WhatsApp, Newsletter-Plattformen, Calendly o. Ä., Standardformulare und -Embeds sowie eine Standard-CRM-Anbindung, sofern technisch möglich."],
              "Erweiterte Performance-Optimierung", "Erweitertes Testing auf Geräten und Browsern", "60 Tage Support nach dem Launch"],
            excludedLabel: "Separat kalkuliert",
            excluded: ["Komplexes 3D / WebGL", "Komplexer E-Commerce", "Individuelle APIs", "Benutzerkonten / Authentifizierung", "Individuelle Dashboards", "Komplexe Automatisierungen", "Erweiterte Datenbanken", "Marktplätze", "Mitgliedschaftssysteme", "SaaS-Funktionen", "Individueller Checkout", "Komplexe Buchungssysteme", "Komplexes CRM / ERP", "Individuelle Portale", "Mehrrollen-Benutzersysteme", "Fortgeschrittene Three.js-Erlebnisse", "Komplexe Konfiguratoren", "Backend-intensive Funktionen"],
            cta: "Premium starten", whatsappMessage: "Hallo! Ich interessiere mich für das iTECH-Paket Premium zum Einführungspreis (€1,099). Ich würde gern über mein Projekt sprechen." },
          custom: { title: "Custom", subtitle: "Für Plattformen, Systeme und digitale Projekte, die nicht in ein Standardpaket passen.",
            priceLabel: "Lass uns sprechen", priceNote: "Preis individuell auf dein Projekt abgestimmt.",
            features: ["Strategie- und Discovery-Session", "Individuelle technische Architektur", "UX von Grund auf entwickelt", "Individuelle Funktionen", "API- und externe Service-Integrationen", "Automatisierungen", "Authentifizierung und Benutzerkonten", "Dashboards", "Datenbankbasierte Funktionen", "Komplexer E-Commerce", "Marketplaces", "Individuelle Konfiguratoren und Abläufe", "3D / WebGL-Erlebnisse", "Plattformen und Portale", "Dedizierter Projektplan", "Kontrolliertes Testing und Launch"],
            cta: "Lass uns sprechen", whatsappMessage: "Hallo! Ich habe ein individuelles Projekt (Plattform / System) und würde es gern mit iTECH besprechen." }
        }
      }
    },
    // Founding client offer: set enabled: false to hide the old prices and savings (launch prices then show alone)
    launchOffer: {
      enabled: true,
      label: "Founding client offer",
      text: "Special launch pricing for our first projects.",
      availability: "Limited availability",
      bonus: "+ 30 days basic maintenance included",
      note: "Available for the first 3 projects.",
      priceLabel: "Launch price"
    },
    items: [
      { id: "start", enabled: true, name: "Start", subtitle: "For entrepreneurs and small businesses.", description: "A focused, professional website to get you online properly.",
        price: { type: "from", amount: 390 }, launchPrice: 349, pricePrefix: "From", billingLabel: "one-time",
        features: ["Custom homepage design", "Up to 4 pages", "Responsive on every device", "Contact form", "Basic SEO setup", "Deployment support"],
        excludedFeatures: ["Custom animations", "E-commerce"], featured: false, badge: "", ctaLabel: "Request project",
        whatsappMessage: "Hello! I'm interested in the iTECH Start website package at the founding client price (€349). I'd like to discuss my project." },
      { id: "grow", enabled: true, name: "Grow", subtitle: "For established businesses that need a stronger presence.", description: "More pages, more features and a design system that grows with you.",
        price: { type: "from", amount: 790 }, launchPrice: 699, pricePrefix: "From", billingLabel: "one-time",
        features: ["Everything in Start", "Up to 10 pages", "Blog or news section (CMS)", "Booking or enquiry flows", "Analytics setup", "Scroll animations"],
        excludedFeatures: ["3D elements"], featured: true, badge: "Most popular", ctaLabel: "Request project",
        whatsappMessage: "Hello! I'm interested in the iTECH Grow website package at the founding client price (€699). I'd like to discuss my project." },
      { id: "premium", enabled: true, name: "Premium", subtitle: "For brands that need a high-end custom experience.", description: "Art-directed design, custom interactions and advanced functionality.",
        price: { type: "from", amount: 1490 }, launchPrice: 1290, pricePrefix: "From", billingLabel: "one-time",
        features: ["Everything in Grow", "Advanced custom UI", "Custom interactions", "Premium animations", "Advanced page templates", "Third-party integrations"],
        excludedFeatures: [], featured: false, badge: "", ctaLabel: "Request project",
        whatsappMessage: "Hello! I'm interested in the iTECH Premium website package at the founding client price (€1,290). I'd like to discuss my project." },
      { id: "custom", enabled: true, name: "Custom", subtitle: "For custom architecture or functionality.", description: "Platforms, complex stores, multilingual sites and bespoke builds.",
        price: { type: "quote", label: "Let's talk" }, pricePrefix: "Pricing", billingLabel: "",
        features: ["Discovery workshop", "Custom architecture", "Complex integrations", "Dedicated project plan"],
        excludedFeatures: [], featured: false, badge: "", ctaLabel: "Let's talk",
        whatsappMessage: "Hello! I have a custom website project and I'd like to discuss it with iTECH." }
    ]
  },

  /* ── ADD-ONS: iTECH Expansion Core (addons.js) ────────────────────────────
     Every module renders from addonsConfig.items. icon: document | globe | editor | mail |
     calendar | card | chart | search | shield | server | motion | cube | cart | nodes. priceType: "fixed" | "from"
     | "monthly" | "on_request" (price: null). category: one of addonsConfig.categories;
     plateCategory's items are the gold plates; that category and the last regular one sit
     right of the core, the others left.
     The selection is shared with the project brief.                        */
  addonsExperienceConfig: {
    enabled: true,
    coreEnabled: true,
    connectorLines: true,         // desktop: hovered and added modules are wired to the core
    selectionPulse: true,
    cartEnabled: true,            // tablet/phone build bar + drawer (desktop shows the summary beside the core)
    whatsappCheckout: true,       // uses packagesConfig.whatsappNumber
    motionIntensity: 1
  },
  addonsConfig: {
    header: { label: "Expand your website", title: "Build more.\nWhen you need more.", accent: "When you need more.", intro: "Choose the capabilities your business needs and build your project around them." },
    currency: "€",
    core: { title: "Expansion core", image: "img/expansion-core-960.webp", showGlobe: false },   // showGlobe: false = no globe image/rings, only the module counter (the video shows the Earth)
    // background video of the section (replaces `background` while enabled); stays in view while the section scrolls
    video: { enabled: true, src: "img/addons-video-lite.mp4", poster: "img/addons-poster.jpg" },   // 960px copy of expansion-core.webp (shown at ~330px; lighter to load)
    // static background image of the section (any image file; remove to use the plain background)
    background: { src: "img/addons-bg.webp", opacity: 1, soft: "img/addons-bg-soft.webp", band: "img/addons-bg-band.webp" },   // soft/band: pre-applied blur & colour (faster than live CSS filters); remove them if you change src
    cart: {
      title: "Your build",
      barLabel: "Review build",
      totalLabel: "Estimated extras",
      emptyText: "Choose the features you need. Your estimate updates as you go.",
      disclaimer: "Final pricing depends on project scope and technical requirements.",
      ctaLabel: "Request this setup"
    },
    // add-ons already part of a base package: shown as "Included in package", never charged twice
    // (the visitor picks the base package above the add-ons; ids from packagesConfig.items)
    includedIn: {
      start: ["launch"],
      grow: ["launch", "cms", "booking", "analytics", "animations"],
      premium: ["launch", "cms", "booking", "analytics", "animations", "newsletter"]
    },
    /* PER-LANGUAGE ADD-ONS — read as written (not through i18n.js). ro: prices in lei (fixed market
       prices, no conversion); en / de keep the EUR prices of `items` below and only add notes.
       Per item: name, description, price, priceType, note (small line on the card),
       details { title, items, excludedTitle, excluded, note } (an expandable "what's included"). */
    locales: {
      ro: {
        money: "lei",
        items: {
          page: { name: "Pagină suplimentară", description: "Încă o pagină, construită și adaptată designului existent.", price: 150, priceType: "fixed" },
          multilingual: { name: "Site multilingv", description: "Versiuni suplimentare de limbă pentru site, de ex. RO / EN / DE.", price: 500, priceType: "from", note: "Traducerea profesională nu este inclusă, decât dacă e ofertată separat." },
          cms: { name: "Blog / CMS", description: "Secțiune de blog / noutăți pe care o poți administra ușor.", price: 450, priceType: "from" },
          newsletter: { name: "Integrare newsletter", description: "Conectare formular de abonare cu platforma de email marketing.", price: 250, priceType: "fixed" },
          booking: { name: "Sistem de programări", description: "Programări online cu integrare calendar și confirmări standard.", price: 500, priceType: "from", note: "Sistemele de rezervare complexe, la comandă, se estimează separat." },
          payments: { name: "Plăți online", description: "Integrare plăți online pentru servicii, avansuri sau produse digitale.", price: 500, priceType: "from", note: "Checkout-ul personalizat și fluxurile de plată complexe se estimează separat." },
          analytics: { name: "Configurare Analytics", description: "Configurare Analytics și tracking de bază pentru trafic și conversii.", price: 200, priceType: "fixed" },
          seo: { name: "SEO avansat", description: "Optimizări SEO tehnice, structură, metadata, redirects și configurări avansate de bază.", price: 600, priceType: "from" },
          maintenance: { name: "Mentenanță", description: "Întreținere de bază pentru website.", price: 99, priceType: "monthly",
            details: { title: "Ce include mentenanța", items: ["Verificări periodice", "Backup, unde este disponibil", "Actualizări minore", "Mici modificări de text / imagini", "Verificarea funcționării formularelor", "Suport de bază"],
              excludedTitle: "Nu include", excluded: ["Redesign", "Pagini noi", "Funcționalități noi", "Dezvoltare majoră", "Integrări avansate", "Modificări nelimitate"],
              note: "Modificările mai mari se ofertează separat." } },
          launch: { name: "Lansare și configurare hosting", description: "Configurare domeniu, DNS, hosting, SSL și setări de bază pentru lansare.", price: 300, priceType: "from", note: "Abonamentul de hosting și înregistrarea domeniului se plătesc separat de client, dacă nu sunt incluse explicit." },
          animations: { name: "Animații avansate", description: "Animații custom, scroll effects și tranziții premium.", price: 700, priceType: "from", note: "Animațiile cinematice complexe se estimează separat." },
          "3d": { name: "Elemente 3D", description: "Elemente 3D interactive, prezentări de produs sau scene digitale.", price: 1500, priceType: "from", note: "WebGL / Three.js avansat și mediile 3D complexe se estimează separat." },
          ecommerce: { name: "Magazin online", description: "Produse, coș, checkout și funcționalități e-commerce standard.", price: 2500, priceType: "from",
            details: { title: "Prețul final depinde de", items: ["Numărul de produse", "Sistemul de plată", "Livrare", "Gestiunea stocurilor", "Integrări cu curieri", "Facturare", "Checkout personalizat", "Integrări externe"],
              note: "Magazinele online complexe se estimează separat." } },
          integration: { name: "Integrare personalizată", description: "Conectare cu CRM, ERP, API, sisteme de programări, stocuri sau alte servicii externe.", price: null, priceType: "on_request" }
        }
      },
      en: {
        items: {
          multilingual: { note: "Professional translation is not included unless quoted." },
          booking: { note: "Complex custom booking engines are quoted separately." },
          payments: { note: "Custom checkout and complex payment flows are quoted separately." },
          maintenance: { details: { title: "What maintenance includes", items: ["Regular checks", "Backups where available", "Minor updates", "Small text / image changes", "Form checks", "Basic support"],
            excludedTitle: "Not included", excluded: ["Redesign", "New pages", "New functionality", "Major development", "Advanced integrations", "Unlimited changes"], note: "Larger changes are quoted separately." } },
          launch: { note: "Hosting and domain costs are paid by the client unless explicitly included." },
          animations: { note: "Complex cinematic animations are quoted separately." },
          "3d": { note: "Advanced WebGL / Three.js and complex 3D environments are quoted separately." },
          ecommerce: { details: { title: "The final price depends on", items: ["Number of products", "Payment system", "Shipping", "Stock management", "Courier integrations", "Invoicing", "Custom checkout", "External integrations"],
            note: "Complex e-commerce is quoted separately." } }
        }
      },
      de: {
        items: {
          multilingual: { note: "Professionelle Übersetzung ist nicht enthalten, außer sie wird angeboten." },
          booking: { note: "Komplexe individuelle Buchungssysteme werden separat kalkuliert." },
          payments: { note: "Individueller Checkout und komplexe Zahlungsabläufe werden separat kalkuliert." },
          maintenance: { details: { title: "Was die Wartung umfasst", items: ["Regelmäßige Checks", "Backups, wo verfügbar", "Kleinere Updates", "Kleine Text- / Bildänderungen", "Prüfung der Formulare", "Basis-Support"],
            excludedTitle: "Nicht enthalten", excluded: ["Redesign", "Neue Seiten", "Neue Funktionen", "Größere Entwicklung", "Erweiterte Integrationen", "Unbegrenzte Änderungen"], note: "Größere Änderungen werden separat angeboten." } },
          launch: { note: "Hosting und Domain zahlt der Kunde, sofern nicht ausdrücklich enthalten." },
          animations: { note: "Komplexe cineastische Animationen werden separat kalkuliert." },
          "3d": { note: "Fortgeschrittenes WebGL / Three.js und komplexe 3D-Welten werden separat kalkuliert." },
          ecommerce: { details: { title: "Der Endpreis hängt ab von", items: ["Anzahl der Produkte", "Zahlungssystem", "Versand", "Lagerverwaltung", "Versanddienstleister-Anbindung", "Rechnungsstellung", "Individueller Checkout", "Externe Integrationen"],
            note: "Komplexer E-Commerce wird separat kalkuliert." } }
        }
      }
    },
    // gentle suggestions: when "when" is selected, suggest the first of "suggest" not yet selected
    recommendations: [
      { when: "ecommerce", suggest: ["payments"] },
      { when: "booking", suggest: ["analytics", "newsletter"] },
      { when: "3d", suggest: ["animations"] },
      { when: "cms", suggest: ["seo"] },
      { when: "launch", suggest: ["maintenance"] }
    ],
    // plateCategory: shown with the warm gold accent (Advanced)
    plateCategory: "advanced",
    categories: [
      { id: "essentials", label: "Essentials" },
      { id: "business", label: "Business tools" },
      { id: "care", label: "Care & launch" },
      { id: "advanced", label: "Advanced" }
    ],
    items: [
      { id: "page", icon: "document", category: "essentials", name: "Additional page", description: "One more designed and built page.", price: 150, priceType: "fixed", enabled: true },
      { id: "multilingual", icon: "globe", category: "essentials", name: "Multilingual website", description: "Your site in more languages, e.g. RO / EN / DE.", price: 450, priceType: "from", enabled: true },
      { id: "cms", icon: "editor", category: "essentials", name: "Blog / CMS", description: "Publish and edit your content yourself.", price: 350, priceType: "from", enabled: true },
      { id: "newsletter", icon: "mail", category: "essentials", name: "Newsletter integration", description: "Sign-up forms connected to your email tool.", price: 120, priceType: "fixed", enabled: true },
      { id: "booking", icon: "calendar", category: "business", name: "Booking system", description: "Online appointments with confirmations.", price: 350, priceType: "from", enabled: true },
      { id: "payments", icon: "card", category: "business", name: "Online payments", description: "Deposits, appointments, services and digital products.", price: 300, priceType: "from", enabled: true },
      { id: "analytics", icon: "chart", category: "business", name: "Analytics setup", description: "Privacy-friendly visitor statistics.", price: 120, priceType: "fixed", enabled: true },
      { id: "seo", icon: "search", category: "business", name: "Advanced SEO setup", description: "Structured data, redirects and technical SEO.", price: 300, priceType: "from", enabled: true },
      { id: "maintenance", icon: "shield", category: "care", name: "Maintenance", description: "Updates, backups and small changes.", price: 60, priceType: "monthly", enabled: true },
      { id: "launch", icon: "server", category: "care", name: "Launch & hosting setup", description: "Domain, DNS, hosting, SSL and email configured for you.", price: null, priceType: "on_request", enabled: true },
      { id: "animations", icon: "motion", category: "advanced", name: "Advanced animations", description: "Scroll-driven motion and custom transitions.", price: 400, priceType: "from", enabled: true },
      { id: "3d", icon: "cube", category: "advanced", name: "3D elements", description: "Interactive 3D scenes or product views.", price: 900, priceType: "from", enabled: true },
      { id: "ecommerce", icon: "cart", category: "advanced", name: "E-commerce", description: "Products, cart and checkout.", price: 1200, priceType: "from", enabled: true },
      { id: "integration", icon: "nodes", category: "advanced", name: "Custom integration", description: "Connect your CRM, booking or stock system.", price: null, priceType: "on_request", enabled: true }
    ]
  },

  /* ── PROJECT ESTIMATOR — all calculation inputs ────────────────────────────
     estimate = (base + pages + features) × design × timeline, at least the
     minimum; the range is ± rangeVariance.  ALL NUMBERS ARE PLACEHOLDERS.   */
  estimatorConfig: {
    header: { label: "Estimator", title: "Estimate your\nproject.", accent: "project.", intro: "Five quick questions for an approximate range. It takes about a minute." },
    currency: "€",
    minimumProjectPrice: 600,
    rangeVariance: 0.15,
    roundTo: 50,
    baseWebsitePrices: { business: 1200, landing: 700, store: 2400, portfolio: 1000, booking: 1600, custom: 3500 },
    pagePricing: { "1": 0, "2-5": 400, "6-10": 1100, "10+": 2200 },
    featurePricing: { booking: 450, payments: 400, ecommerce: 1200, blog: 350, multilingual: 500, animations: 600, threeD: 1200, forms: 250, other: 300 },
    designLevelMultipliers: { essential: 1, premium: 1.35, signature: 1.8 },
    timelineMultipliers: { flexible: 0.95, standard: 1, priority: 1.25 },
    options: {
      types: [
        { id: "business", label: "Business website" }, { id: "landing", label: "Landing page" }, { id: "store", label: "Online store" },
        { id: "portfolio", label: "Portfolio" }, { id: "booking", label: "Booking website" }, { id: "custom", label: "Custom" }
      ],
      pages: [ { id: "1", label: "1 page" }, { id: "2-5", label: "2–5 pages" }, { id: "6-10", label: "6–10 pages" }, { id: "10+", label: "10+ pages" } ],
      features: [
        { id: "booking", label: "Booking" }, { id: "payments", label: "Payments" }, { id: "ecommerce", label: "E-commerce" },
        { id: "blog", label: "Blog" }, { id: "multilingual", label: "Multilingual" }, { id: "animations", label: "Animations" },
        { id: "threeD", label: "3D" }, { id: "forms", label: "Custom forms" }, { id: "other", label: "Other" }
      ],
      designLevels: [
        { id: "essential", label: "Essential", text: "Clean, custom and professional." },
        { id: "premium", label: "Premium", text: "Art-directed with refined motion." },
        { id: "signature", label: "Signature", text: "Fully bespoke, immersive, memorable." }
      ],
      timelines: [
        { id: "flexible", label: "Flexible", text: "No fixed deadline." },
        { id: "standard", label: "Standard", text: "A normal project schedule." },
        { id: "priority", label: "Priority", text: "A firm, near deadline." }
      ]
    },
    disclaimer: "This is an approximate range. Final pricing depends on the complete project brief.",
    ctaLabel: "Continue with this project",
    // how estimator answers map onto the project brief
    typeToBrief: { business: "business", landing: "landing", store: "ecommerce", portfolio: "portfolio", booking: "booking", custom: "custom" },
    timelineToBrief: { flexible: "flexible", standard: "1-2m", priority: "asap" }
  },

  /* ── PROCESS ───────────────────────────────────────────────────────────── */
  processConfig: {
    header: { label: "Process", title: "From idea\nto launch.", accent: "launch.", intro: "Every stage has a purpose.\nEvery detail moves the project forward." },
    /* "The anatomy of digital" (process.js): a scroll-controlled film on a pinned canvas, followed by the step list.
       Source: the 3 Flow clips of _intro-video/process-package (laptop disassembly, digital evolution, website assembly),
       joined into one continuous take (_intro-video/process-package/process-film-joined.mp4), as WebP frames at 15 fps:
       desktop 1920x1080 one frame per file, mobile 1280x720 packed 2x2 per file.
       stages: from / to = share of the scroll (0 … 1) where each caption is shown.
       The steps further down are shown as a compact list right after the film. */
    cinematic: {
      scrollLength: 400,          // vh of scrolling for the whole film (desktop)
      scrollLengthMobile: 300,    // phones
      smoothMs: 150,              // how softly the film follows the scroll
      maxZoom: 1.1,               // desktop: zoom allowed past "contain" (never crops the laptop more than this)
      maxZoomMobile: 1.45,        // phones: larger picture, sides may crop slightly
      background: "#040508",      // matches the black of the frames
      kicker: "Process · from idea to launch",
      title: "The anatomy\nof digital.",
      subtitle: "Every detail. Engineered to perfection.",
      hint: "Scroll",
      frames: { count: 346, width: 1920, height: 1080, desktop: "img/process-seq/d/f{i}.webp", mobile: "img/process-seq/m/a{i}.webp", mobileGrid: [2, 2], mobileBreakpoint: 760 },
      stillFrames: [110, 215, 345],   // reduced motion: the three still pictures
      stages: [
        { label: "The machine", title: "Engineered\nto perfection.", from: 0, to: .34 },
        { label: "Digital evolution", title: "From technology\nto possibility.", from: .34, to: .66 },
        { label: "Digital creation", title: "We create\ndigital experiences.", from: .66, to: 1 }
      ]
    },
    showStepNumbers: false,      // true: 01 … 07 above each step title
    /* The build sequence (process.js). One visual stage on the left morphs
       through the steps as the visitor scrolls the timeline on the right.
       image: the stage picture; crop: the part shown, in pixels of the image
       (keeps baked-in titles out - the titles are live HTML).
       spots: live light pulses on the picture, in % of the crop.
       status: the live line at the bottom of the stage.                    */
    stickyVisual: true,
    scrollDriven: true,
    mouseParallax: true,
    continuousMotion: true,
    connectorAnimations: true,
    ambientLighting: true,
    showStageHud: true,
    showProgressLine: true,
    visualDepth: 1,
    motionIntensity: 1,
    transitionDuration: 700,      // ms - how quickly the stage catches up with the scroll
    steps: [
      { title: "Discovery", tagline: "Business · Audience · Goals", text: "Understanding the business, audience and goals.",
        image: { src: "img/process-01.webp", width: 1158, height: 1359, crop: { x: 0, y: 300, w: 1158, h: 820 } },
        spots: [[50, 39]], status: "Collecting insights · business · audience · goals", light: .7 },
      { title: "Strategy", tagline: "Structure · Journey · Direction", text: "Structure, user journey and visual direction.",
        image: { src: "img/process-02.webp", width: 1060, height: 1484, crop: { x: 0, y: 370, w: 1060, h: 830 } },
        spots: [[50, 14], [14, 82], [37, 82], [61, 82], [85, 82]], status: "Mapping structure → visitor journey", light: .8 },
      { title: "Design", tagline: "Interface · Identity · Responsive", text: "Custom interface and responsive experience.",
        image: { src: "img/process-03.webp", width: 1091, height: 1441, crop: { x: 0, y: 300, w: 1091, h: 915 } },
        spots: [[31, 59]], status: "Composing interface · type · color · grid", light: .9 },
      { title: "Development", tagline: "Code · Interaction · Performance", text: "Building the website and its interactions.",
        image: { src: "img/process-04.webp", width: 1093, height: 1438, crop: { x: 0, y: 290, w: 1093, h: 915 } },
        spots: [[79, 22], [79, 41], [79, 60], [79, 79]], caret: [24, 79], status: "Compiling components · <Hero /> · build passed", light: .9 },
      { title: "Testing", tagline: "Devices · QA · Optimization", text: "Responsive, functional and performance testing.",
        image: { src: "img/process-05.webp", width: 1536, height: 1024, crop: { x: 0, y: 228, w: 1536, h: 687 } },
        spots: [[15, 81], [33, 81], [51, 81], [69, 81], [87, 81]], score: 98, status: "QA passed · responsive · forms · navigation · SEO", light: 1 },
      { title: "Launch", tagline: "Domain · Deployment · Live", text: "Domain, hosting and final deployment.",
        image: { src: "img/process-06.webp", width: 1312, height: 1199, crop: { x: 0, y: 245, w: 1312, h: 775 } },
        spots: [[37, 87]], status: "Deployment 100% · SYSTEM ONLINE", online: true, light: 1.25 },
      { title: "Growth", tagline: "Support · Analytics · Evolution", text: "Improvement and support after launch.",
        image: { src: "img/process-07.webp", width: 1536, height: 1024, crop: { x: 0, y: 205, w: 1536, h: 670 } },
        spots: [[72, 46], [16, 33]], status: "Analytics +128% · your website keeps evolving", light: 1 }
    ]
  },

  /* ── BEFORE / AFTER ────────────────────────────────────────────────────── */
  comparisonConfig: {
    header: { label: "The difference", title: "Template or\ntailored.", accent: "tailored.", intro: "The same business, presented two ways. Drag to compare." },
    beforeLabel: "Generic website",
    afterLabel: "iTECH experience",
    afterMockRef: "p1",
    beforeImage: "img/compare-generic.webp",   // leave empty to use the built-in mockups
    afterImage: "img/compare-itech.webp"
  },

  /* ── ABOUT ─────────────────────────────────────────────────────────────── */
  aboutConfig: {
    header: { label: "About", title: "A small studio\nwith high standards.", accent: "high standards." },
    statement: "iTECH is an independent digital studio creating custom websites for businesses that care how they are seen.",
    story: [
      "We work with a small number of clients at a time, so every project gets full attention from strategy to launch.",
      "No templates and no page builders. Every website is designed for one business and built with modern, maintainable code."
    ],
    details: [
      { label: "Studio", value: "Independent web studio" },
      { label: "Focus", value: "Design & development" },
      { label: "Location", value: "" },       // PLACEHOLDER: e.g. "Bucharest, Romania" — hidden while empty
      { label: "Working with", value: "Clients remotely" }
    ]
  },

  /* ── TESTIMONIALS: CLIENT STORIES (reviews.js) ───────────────────────────
     Only REAL, APPROVED reviews are shown — no placeholders. With none, the
     section shows its empty state and the "Leave a review" form.
     New reviews arrive as status "pending" and appear only after approval
     (owner moderation panel on the page, or add them below / reviews.json).
     Review shape: { status: "approved", name, company, projectType, rating 1-5,
       review, createdAt "2026-09-15", verified true|false, featured, logo,
       projectUrl, showUrl }. Never put a client's email here.             */
  testimonialConfig: {
    showTestimonials: true,
    header: { label: "Testimonials", title: "In their\nwords.", accent: "words.", intro: "Real feedback from businesses we've built for." },
    carouselEnabled: true,
    autoplay: false,
    autoplayMs: 9000,             // min 8000; pauses on hover / focus, stops after manual use
    threeDDepth: true,
    mouseParallax: true,
    verifiedBadge: true,
    showProjectType: true,
    showDate: true,
    reviewSubmissionEnabled: true,
    moderationButton: true,       // owner only: "Moderation · N pending" appears only while reviews wait for approval; false hides it
    filtersMinReviews: 6,
    summaryLabel: "Client experience",
    // shown until the first approved review: pick a rating and the review form opens with it
    emptyKicker: "For our clients",
    emptyTitle: "Your project, in your words.",
    emptyNotes: ["Verified clients only", "Published after approval", "Your email stays private"],
    emptyText: "Tap a star to share how working with iTECH felt. It only takes a minute.",
    ctaLabel: "Leave a review",
    formTitle: "Share your experience",
    formIntro: "Tell us about your experience working with iTECH.",
    consentText: "I confirm this review reflects my genuine experience and I allow iTECH to display it publicly after approval.",
    projectTypes: ["Business Website", "E-Commerce", "Booking Website", "Landing Page", "Portfolio", "Custom Project", "Other"],
    ratingLabels: ["Poor", "Fair", "Good", "Very good", "Excellent"],
    reviewMin: 50,
    reviewMax: 600,
    cooldownSeconds: 120,
    publicFile: "reviews.json",
    reviews: []
  },

  /* ── FAQ ───────────────────────────────────────────────────────────────── */
  faqConfig: {
    header: { label: "FAQ", title: "Good\nto know.", accent: "know.", intro: "Anything else? Ask us in the project brief or send a quick message." },
    items: [
      { q: "How much does a website cost?", a: "It depends on the number of pages, the features and the level of design. Our packages show typical starting points, and the estimator gives you an approximate range in about a minute. You receive a fixed quote after we review your brief." },
      { q: "How long does a website take?", a: "A landing page usually takes a few weeks; a full business website or online store takes longer. You get a clear timeline before the project starts, and it depends partly on how quickly content is ready." },
      { q: "Do you create custom designs?", a: "Yes. Every website is designed from scratch for your business. We don't use templates or page builders." },
      { q: "Can you redesign my existing website?", a: "Yes. We review what works on your current site, keep what's worth keeping and rebuild the rest." },
      { q: "Can I update the website later?", a: "Yes. Where it makes sense we add a content management system so you can edit text and images yourself. We can also make changes for you." },
      { q: "Do you provide maintenance?", a: "Yes, as an optional monthly plan covering updates, backups, monitoring and small changes." }
    ]
  },

  /* ── PROJECT BRIEF ─────────────────────────────────────────────────────── */
  briefConfig: {
    header: { label: "Start a project", title: "Start a\nproject.", accent: "project.", intro: "Seven short steps. The more we know, the more precise your proposal will be." },
    projectTypes: [
      { id: "business", label: "Business website" }, { id: "landing", label: "Landing page" }, { id: "ecommerce", label: "E-commerce" },
      { id: "portfolio", label: "Portfolio" }, { id: "booking", label: "Booking website" }, { id: "redesign", label: "Redesign" }, { id: "custom", label: "Custom" }
    ],
    budgets: [                                                       // PLACEHOLDER ranges — edit freely
      { id: "u500", label: "Under €500" }, { id: "500-1000", label: "€500–€1,000" }, { id: "1000-2000", label: "€1,000–€2,000" },
      { id: "2000-5000", label: "€2,000–€5,000" }, { id: "5000+", label: "€5,000+" }, { id: "discuss", label: "Let's discuss" }
    ],
    timelines: [
      { id: "asap", label: "As soon as possible" }, { id: "2-4w", label: "2–4 weeks" }, { id: "1-2m", label: "1–2 months" }, { id: "flexible", label: "Flexible" }
    ],
    detailsPrompt: "Your business, the goal of the website, your audience, features you need and any sites you like.",
    submitLabel: "Send project request",
    successTitle: "Project received.",
    successText: "Thank you. We'll review your brief and reply within two working days.",   // PLACEHOLDER promise — adjust
    notConnectedTitle: "Your brief is ready.",
    notConnectedText: "Online sending isn't connected yet. Copy your brief below and send it to us directly."
  },

  /* ── CONTACT ──────────────────────────────────────────────────────────────
     endpoints: URLs that accept a JSON POST (your API, Formspree, a CRM
     webhook…). Leave empty until a backend exists — nothing is faked.       */
  contactConfig: {
    header: { label: "Contact", title: "Prefer a quick\nconversation?", accent: "conversation?", intro: "Send a short message and we'll get back to you." },
    email: "",              // PLACEHOLDER: e.g. "hello@yourdomain.com" — button hidden while empty
    whatsapp: "",           // PLACEHOLDER: international format without "+" or spaces, e.g. "40712345678"
    phone: "",              // PLACEHOLDER
    endpoints: { projectBrief: "", quickContact: "" },
    web3formsKey: "6787f312-80d9-4e2a-aa4f-cdc170e78dca",   // Web3Forms public access key: forms and reviews arrive by email (used when no endpoint is set)
    submitLabel: "Let's talk",
    successText: "Message received. We'll reply soon.",
    notConnectedText: "Online sending isn't connected yet. Please use the email or WhatsApp buttons, or copy your message."
  },

  socialConfig: [
    { label: "Instagram", url: "https://www.instagram.com/itechsibiuro/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" }        // PLACEHOLDER: your profile URL
  ],

  /* ── FINAL CTA ─────────────────────────────────────────────────────────── */
  finalCTAConfig: {
    label: "Contact",
    headlineTop: "Let's build",
    headlineMid: "what's",
    headlineAccent: "next.",          // elegant italic serif accent
    ghostWord: "NEXT",                // faint outline behind the headline ("" to hide)
    intro: "Have an idea, a business or a project in mind?\nLet's turn it into a digital experience built around you.",
    showAvailability: true,
    availabilityText: "Available for selected projects",
    location: "Romania · Available worldwide",
    cta: { label: "Start a project", text: "Tell us what you want to build.", micro: "Start here", target: "brief" },
    showNumbers: false                // true: 01 / 02 / 03 before each contact row
  },

  /* Final contact hub. Rendered from these rows; the addresses come from
     finalContact below. A row without a configured address shows as
     "Coming soon" and is not clickable — nothing is invented.             */
  finalContact: {
    whatsappNumber: "40724972017",
    whatsappDisplay: "+40 724 972 017",
    whatsappMessage: "Hello! I'd like to discuss a website project with iTECH.",
    instagram: "https://www.instagram.com/itechsibiuro/",
    instagramDisplay: "@itechsibiuro",
    email: "itechsibiu@gmail.com",
    facebook: "https://www.facebook.com/profile.php?id=61595098166731",
    phone: "+40724972017",            // footer "call" link
    phoneDisplay: "+40 724 972 017"
  },
  socialLinks: [
    { id: "whatsapp", label: "WhatsApp", micro: "Direct message", description: "Talk directly about your project." },
    { id: "instagram", label: "Instagram", micro: "Social", description: "Follow our work and latest projects." },
    { id: "email", label: "Email", micro: "Project brief", description: "Send your brief or project details." },
    { id: "facebook", label: "Facebook", micro: "Social", description: "News, new projects and studio updates." }
  ],

  /* ── FOOTER ────────────────────────────────────────────────────────────── */
  footerConfig: {
    /* Explore: links to the live sections (hidden automatically if a section is off).
       Contact: WhatsApp, email, Instagram + "Start a project" (from finalContact). */
    nav: [
      { label: "Work", target: "work" }, { label: "Why iTECH", target: "why" }, { label: "Packages", target: "packages" },
      { label: "Add-ons", target: "addons" }, { label: "Process", target: "process" }, { label: "Compare", target: "compare" }, { label: "Testimonials", target: "testimonials" },
      { label: "FAQ", target: "faq" }
    ],
    studio: ["Romania · Available worldwide", "Custom websites, built to order"],
    legal: [ { label: "Privacy", url: "" }, { label: "Terms", url: "" } ],   // PLACEHOLDER: add page URLs
    copyrightName: "iTECH"
  }
};
