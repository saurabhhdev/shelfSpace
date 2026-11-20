import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, closeDB } from '../db';
import {
  users,
  collections,
  projects,
  resources,
  resourceTags,
  projectResources,
  collectionResources,
} from '../db/schema';

async function seed() {
  console.log('[Seed] Seeding Neon PostgreSQL database...');

  const demoEmail = 'demo@shelfspace.dev';

  // 1. Find or create demo user
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, demoEmail));

  let userId: string;
  if (!existingUser) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('Password123!', salt);
    const [created] = await db
      .insert(users)
      .values({
        name: 'Alex Rivera',
        email: demoEmail,
        passwordHash,
        emailVerifiedAt: new Date(),
      })
      .returning();
    userId = created.id;
    console.log('[Seed] Created Demo User:', demoEmail, 'Password: Password123!');
  } else {
    userId = existingUser.id;
    console.log('[Seed] Using existing Demo User:', demoEmail);
  }

  // 2. Clear old demo data for clean repeatable seeds
  await db.delete(collections).where(eq(collections.userId, userId));
  await db.delete(projects).where(eq(projects.userId, userId));
  await db.delete(resources).where(eq(resources.userId, userId));

  // 3. Seed Collections
  const insertedCollections = await db
    .insert(collections)
    .values([
      {
        userId,
        name: 'Design Systems & UI',
        description: 'Handpicked component directories, icons, and UI primitives for production apps.',
        color: '#3b82f6',
        type: 'collection',
      },
      {
        userId,
        name: 'Palettes & Visuals',
        description: 'Color themes, contrast tokens, and dark mode inspiration.',
        color: '#8b5cf6',
        type: 'collection',
      },
      {
        userId,
        name: 'Developer Tooling',
        description: 'High-performance libraries, repos, and utility crates.',
        color: '#10b981',
        type: 'collection',
      },
      {
        userId,
        name: 'Public APIs & Datasets',
        description: 'Reliable data backends and dummy testing endpoints.',
        color: '#f59e0b',
        type: 'collection',
      },
    ])
    .returning();

  const colMap = new Map<string, string>();
  for (const c of insertedCollections) {
    colMap.set(c.name, c.id);
  }

  // 4. Seed Projects
  const insertedProjects = await db
    .insert(projects)
    .values([
      {
        userId,
        name: 'Shelfspace Workspace',
        description: 'Building the fastest developer resource manager for modern engineering teams.',
        isArchived: false,
      },
      {
        userId,
        name: 'NextGen SaaS Dashboard',
        description: 'High-density admin console with dark mode, real-time metrics, and tactile controls.',
        isArchived: false,
      },
    ])
    .returning();

  const projMap = new Map<string, string>();
  for (const p of insertedProjects) {
    projMap.set(p.name, p.id);
  }

  // 5. Seed Resources
  const sampleResources = [
    {
      type: 'ui',
      title: 'Lineicons — Handcrafted 8,400+ Vector Icons',
      url: 'https://lineicons.com/',
      normalizedUrl: 'https://lineicons.com',
      description: 'Comprehensive icon library featuring modern line, fill, and duotone icons with SVG, React, and Web Component support.',
      tags: ['icons', 'ui', 'vector', 'svg', 'design-system'],
      projectNames: ['Shelfspace Workspace', 'NextGen SaaS Dashboard'],
      collectionNames: ['Design Systems & UI'],
      notes: '### Lineicons Integration Note\n- Perfect for developer tools and minimal dashboards.\n- Supports 1px stroke weight and dark mode contrast.',
      metadata: {
        framework: 'React / SVG / WebFont',
        author: 'Lineicons Team',
        styles: ['Regular', 'Bold', 'Duotone', 'Light'],
      },
      previewImage: 'https://lineicons.com/images/og-image.jpg',
      favicon: 'https://lineicons.com/favicon.ico',
      isFavourite: true,
    },
    {
      type: 'ui',
      title: '21st.dev — Curated Component Inspiration & Registry',
      url: 'https://21st.dev/',
      normalizedUrl: 'https://21st.dev',
      description: 'The open-source registry of beautifully crafted React and Tailwind components, micro-interactions, and shaders.',
      tags: ['components', '21st.dev', 'react', 'tailwind', 'shadcn'],
      projectNames: ['Shelfspace Workspace'],
      collectionNames: ['Design Systems & UI'],
      notes: 'Check 21st.dev for command palette designs, tactile buttons, and clean side drawers.',
      metadata: {
        framework: 'React / Tailwind CSS',
        curatedBy: 'Design Engineers',
      },
      previewImage: 'https://21st.dev/og.png',
      favicon: 'https://21st.dev/favicon.ico',
      isFavourite: true,
    },
    {
      type: 'design',
      title: 'Dribbble — Developer Dashboard UI/UX Design Direction',
      url: 'https://dribbble.com/tags/developer-dashboard',
      normalizedUrl: 'https://dribbble.com/tags/developer-dashboard',
      description: 'Top curated developer dashboard concepts, dark mode elevation guides, and minimalist workspace aesthetics.',
      tags: ['dribbble', 'inspiration', 'dark-mode', 'dashboard', 'minimalism'],
      projectNames: ['NextGen SaaS Dashboard'],
      collectionNames: ['Palettes & Visuals'],
      notes: 'Observed trends:\n- Slate/Zinc high contrast borders\n- Subtle glow on interactive badges\n- No bloated gradients',
      metadata: {
        colors: ['#09090b', '#18181b', '#27272a', '#3b82f6', '#10b981'],
        paletteName: 'Obsidian Zinc & Accent Blue',
      },
      previewImage: 'https://cdn.dribbble.com/assets/dribbble-ball-icon-e3170e6a4b.svg',
      favicon: 'https://dribbble.com/favicon.ico',
      isFavourite: true,
    },
    {
      type: 'development',
      title: 'facebook/react',
      url: 'https://github.com/facebook/react',
      normalizedUrl: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces.',
      tags: ['react', 'javascript', 'frontend', 'ui-library'],
      projectNames: ['Shelfspace Workspace'],
      collectionNames: ['Developer Tooling'],
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
      isFavourite: false,
    },
    {
      type: 'design',
      title: 'Nordic Dark & Electric Emerald Palette',
      url: '',
      normalizedUrl: '',
      description: 'Tactile high-contrast palette tailored for code editors, logs, and terminals.',
      tags: ['palette', 'dark-mode', 'emerald', 'zinc'],
      projectNames: ['Shelfspace Workspace'],
      collectionNames: ['Palettes & Visuals'],
      notes: 'Base: #09090b\nSurface: #121215\nBorder: #27272a\nAccent: #10b981\nText: #f4f4f5',
      metadata: {
        colors: ['#09090b', '#121215', '#27272a', '#10b981', '#f4f4f5'],
        paletteName: 'Nordic Slate',
      },
      isFavourite: false,
    },
    {
      type: 'data',
      title: 'GitHub REST API v3',
      url: 'https://docs.github.com/en/rest',
      normalizedUrl: 'https://docs.github.com/en/rest',
      description: 'Comprehensive public API to query repositories, stars, commit activity, and user metadata.',
      tags: ['api', 'github', 'rest', 'json'],
      projectNames: ['Shelfspace Workspace'],
      collectionNames: ['Public APIs & Datasets'],
      notes: 'Rate limit: 60 req/hour unauthenticated, 5000 req/hour with token.',
      metadata: {
        format: 'JSON / REST',
        authRequired: false,
        endpoint: 'https://api.github.com',
      },
      previewImage: 'https://github.githubassets.com/favicons/favicon.png',
      favicon: 'https://github.githubassets.com/favicons/favicon.png',
      isFavourite: true,
    },
    {
      type: 'learning',
      title: 'Building Modern Developer Workspaces with TanStack & Tailwind',
      url: 'https://tanstack.com/query/latest',
      normalizedUrl: 'https://tanstack.com/query/latest',
      description: 'Powerful asynchronous state management, server-state caching, optimistic updates, and background refetching.',
      tags: ['tanstack-query', 'learning', 'react', 'state-management'],
      projectNames: ['Shelfspace Workspace'],
      collectionNames: ['Developer Tooling'],
      notes: 'Key pattern: Invalidate queries on mutation for seamless UI updates.',
      metadata: {
        platform: 'TanStack Docs',
        estimatedTime: '20 min read',
      },
      favicon: 'https://tanstack.com/favicons/favicon.ico',
      isFavourite: false,
    },
  ];

  for (const s of sampleResources) {
    const [created] = await db
      .insert(resources)
      .values({
        userId,
        type: s.type,
        title: s.title,
        url: s.url,
        normalizedUrl: s.normalizedUrl,
        description: s.description,
        notes: s.notes || '',
        metadata: s.metadata || {},
        previewImage: s.previewImage || '',
        favicon: s.favicon || '',
        isFavourite: s.isFavourite,
        status: 'active',
      })
      .returning();

    // Tags
    if (s.tags.length > 0) {
      await db
        .insert(resourceTags)
        .values(s.tags.map((tag) => ({ resourceId: created.id, tag })))
        .onConflictDoNothing();
    }

    // Projects
    for (const pName of s.projectNames) {
      const pId = projMap.get(pName);
      if (pId) {
        await db
          .insert(projectResources)
          .values({ projectId: pId, resourceId: created.id })
          .onConflictDoNothing();
      }
    }

    // Collections
    for (const cName of s.collectionNames) {
      const cId = colMap.get(cName);
      if (cId) {
        await db
          .insert(collectionResources)
          .values({ collectionId: cId, resourceId: created.id })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`[Seed] Seeded ${sampleResources.length} rich developer resources successfully!`);
  await closeDB();
  console.log('[Seed] Seeding complete! You can log in with:');
  console.log('[Seed] Email: demo@shelfspace.dev');
  console.log('[Seed] Password: Password123!');
}

seed().catch((err) => {
  console.error('[Seed] Seeding failed:', err);
  process.exit(1);
});
