import { baseURL } from "@/services/API";

async function getDynamicRoutes() {
  // products seo
  const productsRes = await fetch(`${baseURL}/shop/product/view-all-seo`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!productsRes.ok)
    throw new Error(`Failed to fetch products: ${productsRes.status}`);
  const products = await productsRes.json();

  // blog seo
  const blogRes = await fetch(`${baseURL}/blog/post/get-all-seo`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!blogRes.ok)
    throw new Error(`Failed to fetch blog posts: ${blogRes.status}`);
  const blogPosts = await blogRes.json();

  return {
    products,
    blogPosts,
  };
}

export async function GET() {
  const siteUrl = "https://yarijoo.ir";

  // static routes
  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // dynamic routes
  const { products, blogPosts } = await getDynamicRoutes();

  const productRoutes = products.map((product) => ({
    url: `${siteUrl}/shop/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const allRoutes = [...staticRoutes, ...productRoutes, ...blogRoutes];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes
    .map(
      (route) => `
    <url>
      <loc>${route.url}</loc>
      <lastmod>${route.lastModified.toISOString()}</lastmod>
      <changefreq>${route.changeFrequency}</changefreq>
      <priority>${route.priority}</priority>
    </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
