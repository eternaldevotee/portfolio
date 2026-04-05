/**
 * Portfolio content — edit THIS file to change copy, links, sections, and certifications.
 * Structure matches what render.js expects; keep shapes consistent when adding items.
 */
(function (global) {
  global.PORTFOLIO = {
    meta: {
      title: "Subham Ghosh · Software Engineer",
      description: "Subham Ghosh — Software Engineer. Portfolio, experience, and projects.",
      themeColor: "#f8fafc",
    },

    branding: {
      logo: "SG",
    },

    /** Primary nav (header) */
    nav: [
      { label: "About", href: "#about" },
      { label: "Experience", href: "#experience" },
      { label: "Projects", href: "#projects" },
      { label: "Blogs", href: "#blogs" },
      { label: "Certificates", href: "#certifications" },
      { label: "Contact", href: "#contact", cta: true },
    ],

    /** Mobile drawer — can list every section */
    mobileNav: [
      { label: "About", href: "#about" },
      { label: "Experience", href: "#experience" },
      { label: "Education", href: "#education" },
      { label: "Skills", href: "#skills" },
      { label: "Projects", href: "#projects" },
      { label: "Blogs", href: "#blogs" },
      { label: "Certifications", href: "#certifications" },
      { label: "Contact", href: "#contact" },
    ],

    hero: {
      eyebrow: "Software Engineer · Cognizant · Kolkata",
      titleLines: [
        { text: "Building", accent: false },
        { text: "scalable", accent: true },
        { text: "systems & APIs", accent: false },
      ],
      lead: "I create production-ready Spring Boot APIs, efficient Angular frontends, and clean solutions that help teams move faster.",
      primaryCta: { label: "View work", href: "#projects" },
      secondaryCta: { label: "Email me", href: "mailto:shubhamofficial0910@gmail.com" },
      card: {
        initials: "SG",
        name: "Subham Ghosh",
        role: "Software Engineer Trainee · Cognizant",
        meta: [
          { label: "Email", value: "shubhamofficial0910@gmail.com" },
          { label: "Phone", value: "+91 8670451757" },
          { label: "Location", value: "Kolkata" },
        ],
        links: [
          { label: "LinkedIn", href: "https://www.linkedin.com/" },
          { label: "GitHub", href: "https://github.com/" },
        ],
      },
    },

    about: {
      id: "about",
      sectionClass: "section",
      tag: "01",
      title: { line1: "About", line2: "me" },
      desc: "Engineer focused on backend services, Angular frontends, and clean architecture.",
      gridClass: "about-grid",
      tiles: [
        {
          kind: "rich",
          cardClass: "about-card",
          heading: "Profile",
          body:
            "Computer Science graduate from Chandigarh University with hands-on experience in full-stack delivery: Spring Boot APIs, Angular clients, JWT auth, and agile delivery. Previously trained in C/C++ and OOP at KPIT; now shipping production integrations at Cognizant.",
        },
        { kind: "stat", cardClass: "stat-card", value: "2025", label: "Graduation" },
        {
          kind: "rich",
          cardClass: "highlight-card",
          heading: "Highlight",
          body: "Currently contributing to enterprise backend services at Cognizant.",
        },
      ],
    },

    experience: {
      id: "experience",
      sectionClass: "section section-alt",
      tag: "02",
      title: { line1: "Work", line2: "experience" },
      desc: "Roles where code meets delivery.",
      stackClass: "cards-stack",
      tiles: [
        {
          kind: "job",
          tilt: true,
          company: "Cognizant",
          role: "Software Engineer Trainee",
          badge: "Current",
          meta: "Feb 2026 – Present · Kolkata · ~2 months",
          bullets: [
            "Built RESTful APIs with Spring Boot and integrated Angular frontend services.",
            "Modular backend services following REST for scalable web apps.",
          ],
        },
        {
          kind: "job",
          tilt: true,
          company: "Cognizant",
          role: "Programmer Analyst Trainee",
          meta: "Jul 2025 – Feb 2026 · Coimbatore · 8 months",
          bullets: ["Continued full-stack and integration work across client projects."],
        },
        {
          kind: "job",
          tilt: true,
          company: "KPIT",
          role: "Trainee",
          meta: "Jan 2025 – Jun 2025 · India · 6 months",
          bullets: [
            "NOVA program: C, C++, Object-Oriented Programming.",
            "Hands-on projects and collaborative coding exercises.",
            "Developed modular C++ with OOP; class-based, reusable components.",
          ],
        },
      ],
    },

    education: {
      id: "education",
      sectionClass: "section",
      tag: "03",
      title: { line1: "Academic", line2: "journey" },
      desc: null,
      gridClass: "edu-grid",
      tiles: [
        {
          kind: "edu-featured",
          icon: "◆",
          school: "Chandigarh University",
          degree: "Bachelor of Engineering, Computer Science",
          meta: "2021 – 2025",
          coursework:
            "Coursework: Data Structures, Algorithms, AI, DBMS, OS, Computer Organization, Machine Learning",
        },
        {
          kind: "edu",
          school: "Bharati Bhawan School",
          degree: "Higher Secondary Examination",
          meta: "2018 – 2020",
        },
        {
          kind: "edu",
          school: "St Joseph's English Medium School",
          degree: "Matriculation",
          meta: "2017 – 2018",
        },
      ],
    },

    skills: {
      id: "skills",
      sectionClass: "section section-alt",
      tag: "04",
      title: { line1: "Tech", line2: "stack" },
      desc: null,
      gridClass: "skills-bento",
      tiles: [
        { kind: "skills", title: "Languages", chips: ["C / C++", "Java", "Python"] },
        { kind: "skills", title: "Frameworks & stack", chips: ["Angular", "Spring Boot", "REST APIs"] },
        { kind: "skills", title: "Data", chips: ["MySQL", "MongoDB", "SQLite"] },
        {
          kind: "skills",
          title: "Engineering",
          wide: true,
          chips: [
            "MVC",
            "Microservices",
            "JWT",
            "Git",
            "GitHub",
            "GitLab",
            "Windows",
            "Linux",
            "Agile",
            "Scrum",
            "SDLC",
          ],
        },
      ],
    },

    projects: {
      id: "projects",
      sectionClass: "section",
      tag: "05",
      title: { line1: "Built", line2: "projects" },
      desc: "Selected builds with measurable impact.",
      gridClass: "project-grid",
      tiles: [
        {
          kind: "project",
          tilt: true,
          num: "01",
          linkLabel: "Repo ↗",
          linkHref: "https://bit.ly/RFID-git",
          title: "Travel Package Booking System",
          body:
            "Full-stack booking engine: Angular + Spring Boot, JWT for Customer/Agent/Admin, dynamic search cutting discovery time ~40%.",
          chips: ["Angular", "Spring Boot", "MySQL"],
        },
        {
          kind: "project",
          tilt: true,
          num: "02",
          linkLabel: "Demo ↗",
          linkHref: "https://bit.ly/voyagerFS",
          title: "Smart Parking (RFID + dynamic pricing)",
          body:
            "IoT parking with Arduino & MFRC522; dual dashboard for users and admins; ~65% faster ingress/egress.",
          chips: ["Arduino", "C++", "SQLite"],
        },
      ],
    },

    blogs: {
      id: "blogs",
      sectionClass: "section section-alt",
      tag: "06",
      title: { line1: "Latest", line2: "blogs" },
      desc: "Thoughts on software engineering and technology.",
      gridClass: "blog-grid",
      tiles: [] // Will be populated from BLOGS
    },

    certifications: {
      id: "certifications",
      sectionClass: "section section-alt cert-section",
      tag: "07",
      title: { line1: "Licenses", line2: "certifications" },
      desc: "Filter by focus area.",
      filters: [
        { id: "all", label: "All" },
        { id: "cloud", label: "Cloud & API" },
        { id: "security", label: "Security" },
        { id: "data", label: "Data & ML" },
        { id: "dev", label: "Dev & languages" },
      ],
      items: [
        { title: "EF SET English Certificate 72/100 (C2 Proficient)", issuer: "EF Standard English Test (EF SET)", date: "Aug 2024", id: "", link: "https://www.efset.org/", cats: ["all", "dev"] },
        { title: "Postman API Fundamentals Student Expert", issuer: "Postman", date: "Mar 2024", id: "HK9hTk3NS6CFOR2B40W4FA", link: "https://badgr.com/", cats: ["all", "cloud"] },
        { title: "Ethical Hacking Essentials (EHE)", issuer: "Coursera", date: "Jul 2023", id: "GEMXUZFCX55L", link: "https://www.coursera.org/", cats: ["all", "security"] },
        { title: "Foundation of Business and Entrepreneurship", issuer: "SkillFront", date: "Jul 2023", id: "", link: "https://www.skillfront.com/", cats: ["all", "dev"] },
        { title: "Hacking and Patching", issuer: "Coursera", date: "Jul 2023", id: "E2T4ZL4Q22NJ", link: "https://www.coursera.org/", cats: ["all", "security"] },
        { title: "Introduction to Cybersecurity Tools & Cyber Attacks", issuer: "Coursera", date: "Jul 2023", id: "aa3591f5-fd4f-427b-b495-aee9303da0b5", link: "https://www.coursera.org/", cats: ["all", "security"] },
        { title: "Encryption And Decryption Using C++", issuer: "Coursera", date: "Jun 2023", id: "XM43LHT7MBK7", link: "https://www.coursera.org/", cats: ["all", "security"] },
        { title: "Full-Stack Web Development with React Specialization", issuer: "Coursera", date: "Jan 2023", id: "F2QWD2REAMYZ", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Introduction to Data Analytics", issuer: "Coursera", date: "Jan 2023", id: "XKEJFWJRC8EE", link: "https://www.coursera.org/", cats: ["all", "data"] },
        { title: "Introduction to R Programming for Data Science", issuer: "Coursera", date: "Jan 2023", id: "FPWWTY6LXPW4", link: "https://www.coursera.org/", cats: ["all", "data"] },
        { title: "Git and Github", issuer: "LinkedIn", date: "Sep 2022", id: "AWqDAMMXkmN_XBmoWRuK2hXIXJ2l", link: "https://www.linkedin.com/learning/", cats: ["all", "dev"] },
        { title: "Programming for Everybody (Getting Started with Python)", issuer: "Coursera", date: "Sep 2022", id: "P384M5CLPBAY", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "C++ Programming Foundation", issuer: "GeeksforGeeks", date: "Aug 2022", id: "421e6e6e2c57c694b14abe4d62c7a057", link: "https://www.geeksforgeeks.org/", cats: ["all", "dev"] },
        { title: "Data Science using R", issuer: "Chandigarh University", date: "Aug 2022", id: "", link: "https://www.cuchd.in/", cats: ["all", "data"] },
        { title: "Introduction to Programming", issuer: "Kaggle", date: "Aug 2022", id: "", link: "https://www.kaggle.com/", cats: ["all", "dev"] },
        { title: "Introduction to Python", issuer: "DataCamp", date: "Aug 2022", id: "", link: "https://www.datacamp.com/", cats: ["all", "dev"] },
        { title: "Learn the basics of web — Internet fundamentals", issuer: "codedamn", date: "Aug 2022", id: "", link: "https://codedamn.com/", cats: ["all", "dev"] },
        { title: "Front-End Web Development with React", issuer: "Coursera", date: "Jun 2022", id: "", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Introduction to Github and Visual Studio Code", issuer: "Coursera", date: "Jun 2022", id: "", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Introduction to git and GitHub", issuer: "Coursera", date: "Jun 2022", id: "", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Learning C++", issuer: "LinkedIn", date: "May 2022", id: "Ab9EPhSOIwb6uJrZekUBKamMjXTM", link: "https://www.linkedin.com/learning/", cats: ["all", "dev"] },
        { title: "Getting Started with Data Analytics on AWS", issuer: "Coursera", date: "Apr 2022", id: "", link: "https://www.coursera.org/", cats: ["all", "cloud", "data"] },
        { title: "Introduction to programming through C++", issuer: "NPTEL", date: "Apr 2022", id: "", link: "https://nptel.ac.in/", cats: ["all", "dev"] },
        { title: "C for Everyone: Structured Programming", issuer: "Coursera", date: "Jan 2022", id: "Z98UBQ5C2ZF4", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Introduction to Blockchain Technology", issuer: "Coursera", date: "Jan 2022", id: "72M2T2BGB34L", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Machine Learning Pipelines with Azure ML Studio", issuer: "Coursera", date: "Jan 2022", id: "YCTNYSW9QBKD", link: "https://www.coursera.org/", cats: ["all", "data", "cloud"] },
        { title: "Bitcoin for everybody", issuer: "Saylor Academy", date: "Nov 2021", id: "", link: "https://learn.saylor.org/", cats: ["all", "dev"] },
        { title: "Complete Python Bootcamp", issuer: "Udemy", date: "Nov 2021", id: "UC-70004b84-2a38-47c6-93ac-820f102c54d1", link: "https://www.udemy.com/", cats: ["all", "dev"] },
        { title: "MongoDB Basics", issuer: "MongoDB", date: "Nov 2021", id: "547e2ede-9a5c-4c3a-b6e6-2370cdd91bb6", link: "https://university.mongodb.com/", cats: ["all", "data"] },
        { title: "Oracle Cloud Infrastructure 2023 Certified Foundations Associate", issuer: "Oracle", date: "Sep 2023 · Expires Sep 2025", id: "", link: "https://education.oracle.com/", cats: ["all", "cloud"] },
        { title: "C for Everyone: Programming Fundamentals", issuer: "Coursera", date: "", id: "", link: "https://www.coursera.org/", cats: ["all", "dev"] },
        { title: "Introduction to Internet of Things", issuer: "NPTEL", date: "", id: "", link: "https://nptel.ac.in/", cats: ["all", "dev"] },
      ],
    },

    languages: {
      id: "languages",
      sectionClass: "section",
      tag: "08",
      title: { line1: "Speaking", line2: "fluently" },
      desc: null,
      gridClass: "lang-row",
      tiles: [
        { kind: "lang", name: "English", level: "Full professional proficiency" },
        { kind: "lang", name: "Hindi", level: "Full professional proficiency" },
        { kind: "lang", name: "Bengali", level: "Native or bilingual" },
      ],
    },

    contact: {
      id: "contact",
      sectionClass: "section section-cta",
      tag: "09",
      title: { line1: "Say", line2: "hello" },
      desc: null,
      cardHeading: "Let's build something sharp.",
      body: "Open to roles in backend and full-stack",
      email: { label: "shubhamofficial0910@gmail.com", href: "mailto:shubhamofficial0910@gmail.com" },
      phone: { label: "+91 8670451757", href: "tel:+918670451757" },
    },

    footer: {
      name: "Subham Ghosh",
      
    },
  };
})(typeof window !== "undefined" ? window : this);
