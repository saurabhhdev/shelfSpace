const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shelfspace';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const db = mongoose.connection.db;

  // 1. Create or find Demo User
  const usersCol = db.collection('users');
  const demoEmail = 'demo@shelfspace.dev';
  let demoUser = await usersCol.findOne({ email: demoEmail });

  if (!demoUser) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    const result = await usersCol.insertOne({
      name: 'Alex Rivera',
      email: demoEmail,
      passwordHash,
      emailVerifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    demoUser = { _id: result.insertedId, name: 'Alex Rivera', email: demoEmail };
    console.log('Created Demo User:', demoEmail, 'Password: Password123!');
  } else {
    console.log('Using existing Demo User:', demoEmail);
  }

  const userId = demoUser._id;

  // 2. Collections
  const collectionsCol = db.collection('collections');
  await collectionsCol.deleteMany({ userId });

  const insertedCollections = await collectionsCol.insertMany([
    {
      userId,
      name: 'Design Systems & UI',
      description: 'Handpicked component directories, icons, and UI primitives for production apps.',
      color: '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Palettes & Visuals',
      description: 'Color themes, contrast tokens, and dark mode inspiration.',
      color: '#8b5cf6',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Developer Tooling',
      description: 'High-performance libraries, repos, and utility crates.',
      color: '#10b981',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Public APIs & Datasets',
      description: 'Reliable data backends and dummy testing endpoints.',
      color: '#f59e0b',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const colMap = {};
  for (const doc of Object.values(insertedCollections.insertedIds)) {
    const found = await collectionsCol.findOne({ _id: doc });
    colMap[found.name] = found._id;
  }

  // 3. Projects
  const projectsCol = db.collection('projects');
  await projectsCol.deleteMany({ userId });

  const insertedProjects = await projectsCol.insertMany([
    {
      userId,
      name: 'Shelfspace Workspace',
      description: 'Building the fastest developer resource manager for modern engineering teams.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'NextGen SaaS Dashboard',
      description: 'High-density admin console with dark mode, real-time metrics, and tactile controls.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const projMap = {};
  for (const doc of Object.values(insertedProjects.insertedIds)) {
    const found = await projectsCol.findOne({ _id: doc });
    projMap[found.name] = found._id;
  }

  // 4. Resources
  const resourcesCol = db.collection('resources');
  await resourcesCol.deleteMany({ userId });

  const sampleResources = [
    {
      userId,
      type: 'ui',
      title: 'Lineicons — Handcrafted 8,400+ Vector Icons',
      url: 'https://lineicons.com/',
      normalizedUrl: 'https://lineicons.com',
      description: 'Comprehensive icon library featuring modern line, fill, and duotone icons with SVG, React, and Web Component support.',
      tags: ['icons', 'ui', 'vector', 'svg', 'design-system'],
      projectIds: [projMap['Shelfspace Workspace'], projMap['NextGen SaaS Dashboard']],
      collectionIds: [colMap['Design Systems & UI']],
      notes: '### Lineicons Integration Note\n- Perfect for developer tools and minimal dashboards.\n- Supports 1px stroke weight and dark mode contrast.',
      metadata: {
        framework: 'React / SVG / WebFont',
        author: 'Lineicons Team',
        styles: ['Regular', 'Bold', 'Duotone', 'Light'],
      },
      previewImage: 'https://lineicons.com/images/og-image.jpg',
      favicon: 'https://lineicons.com/favicon.ico',
      status: 'active',
      isFavourite: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'ui',
      title: '21st.dev — Curated Component Inspiration & Registry',
      url: 'https://21st.dev/',
      normalizedUrl: 'https://21st.dev',
      description: 'The open-source registry of beautifully crafted React and Tailwind components, micro-interactions, and shaders.',
      tags: ['components', '21st.dev', 'react', 'tailwind', 'shadcn'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [colMap['Design Systems & UI']],
      notes: 'Check 21st.dev for command palette designs, tactile buttons, and clean side drawers.',
      metadata: {
        framework: 'React / Tailwind CSS',
        curatedBy: 'Design Engineers',
      },
      previewImage: 'https://21st.dev/og.png',
      favicon: 'https://21st.dev/favicon.ico',
      status: 'active',
      isFavourite: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'design',
      title: 'Dribbble — Developer Dashboard UI/UX Design Direction',
      url: 'https://dribbble.com/tags/developer-dashboard',
      normalizedUrl: 'https://dribbble.com/tags/developer-dashboard',
      description: 'Top curated developer dashboard concepts, dark mode elevation guides, and minimalist workspace aesthetics.',
      tags: ['dribbble', 'inspiration', 'dark-mode', 'dashboard', 'minimalism'],
      projectIds: [projMap['NextGen SaaS Dashboard']],
      collectionIds: [colMap['Palettes & Visuals']],
      notes: 'Observed trends:\n- Slate/Zinc high contrast borders\n- Subtle glow on interactive badges\n- No bloated gradients',
      metadata: {
        colors: ['#09090b', '#18181b', '#27272a', '#3b82f6', '#10b981'],
        paletteName: 'Obsidian Zinc & Accent Blue',
      },
      previewImage: 'https://cdn.dribbble.com/assets/dribbble-ball-icon-e3170e6a4b.svg',
      favicon: 'https://dribbble.com/favicon.ico',
      status: 'active',
      isFavourite: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'development',
      title: 'facebook/react',
      url: 'https://github.com/facebook/react',
      normalizedUrl: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces.',
      tags: ['react', 'javascript', 'frontend', 'ui-library'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [colMap['Developer Tooling']],
      notes: 'Using React 19 concurrent features and Server Components.',
      metadata: {
        repository: 'facebook/react',
        stars: 228000,
        forks: 46200,
        language: 'JavaScript',
        license: 'MIT',
        openIssues: 1200,
      },
      previewImage: 'https://opengraph.githubassets.com/1/facebook/react',
      favicon: 'https://github.githubassets.com/favicons/favicon.png',
      status: 'active',
      isFavourite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'design',
      title: 'Nordic Dark & Electric Emerald Palette',
      url: '',
      normalizedUrl: '',
      description: 'Tactile high-contrast palette tailored for code editors, logs, and terminals.',
      tags: ['palette', 'dark-mode', 'emerald', 'zinc'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [colMap['Palettes & Visuals']],
      notes: 'Base: #09090b\nSurface: #121215\nBorder: #27272a\nAccent: #10b981\nText: #f4f4f5',
      metadata: {
        colors: ['#09090b', '#121215', '#27272a', '#10b981', '#f4f4f5'],
        paletteName: 'Nordic Slate',
      },
      status: 'active',
      isFavourite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'data',
      title: 'GitHub REST API v3',
      url: 'https://docs.github.com/en/rest',
      normalizedUrl: 'https://docs.github.com/en/rest',
      description: 'Comprehensive public API to query repositories, stars, commit activity, and user metadata.',
      tags: ['api', 'github', 'rest', 'json'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [colMap['Public APIs & Datasets']],
      notes: 'Rate limit: 60 req/hour unauthenticated, 5000 req/hour with token.',
      metadata: {
        format: 'JSON / REST',
        authRequired: false,
        endpoint: 'https://api.github.com',
      },
      previewImage: 'https://github.githubassets.com/favicons/favicon.png',
      favicon: 'https://github.githubassets.com/favicons/favicon.png',
      status: 'active',
      isFavourite: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'learning',
      title: 'Building Modern Developer Workspaces with TanStack & Tailwind',
      url: 'https://tanstack.com/query/latest',
      normalizedUrl: 'https://tanstack.com/query/latest',
      description: 'Powerful asynchronous state management, server-state caching, optimistic updates, and background refetching.',
      tags: ['tanstack-query', 'learning', 'react', 'state-management'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [colMap['Developer Tooling']],
      notes: 'Key pattern: Invalidate queries on mutation for seamless UI updates.',
      metadata: {
        platform: 'TanStack Docs',
        estimatedTime: '20 min read',
      },
      favicon: 'https://tanstack.com/favicons/favicon.ico',
      status: 'active',
      isFavourite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      type: 'personal',
      title: 'Quick Snippet: MongoDB Compound Index for Per-User Uniqueness',
      url: '',
      normalizedUrl: '',
      description: 'How to enforce per-user unique URLs while allowing multiple users to save the same link.',
      tags: ['snippet', 'mongodb', 'mongoose', 'indexing'],
      projectIds: [projMap['Shelfspace Workspace']],
      collectionIds: [],
      notes: '```typescript\nResourceSchema.index({ userId: 1, normalizedUrl: 1 });\n// Enforced in service layer across non-trashed statuses\n```',
      metadata: {
        snippetLanguage: 'typescript',
      },
      status: 'active',
      isFavourite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await resourcesCol.insertMany(sampleResources);
  console.log(`Seeded ${sampleResources.length} rich developer resources successfully!`);

  await mongoose.disconnect();
  console.log('Seeding complete! You can log in with:');
  console.log('Email: demo@shelfspace.dev');
  console.log('Password: Password123!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
