export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Blog Post: {params.slug}</h1>
      <p className="text-muted-foreground mt-4">Bu sayfa henüz hazırlanıyor...</p>
    </div>
  );
}
