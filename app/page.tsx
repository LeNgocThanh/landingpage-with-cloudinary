import { prisma } from "@/lib/prisma";
import GalleryClient from "@/components/GalleryClient";

export default async function HomePage() {
  const items = await prisma.imageItem.findMany({
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });

  return <GalleryClient items={items} />;
}
