import Image from "next/image";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

export function PackageImageGallery({
	images,
	packageName,
}: {
	images: string[];
	packageName: string;
}) {
	const safeImages = images?.length
		? images
		: ["/placeholder-destination.jpg"];

	return (
		<section className="relative overflow-hidden rounded-xl border bg-card">
			<Carousel className="w-full">
				<CarouselContent>
					{safeImages.map((img, idx) => (
						<CarouselItem key={`${img}-${idx}`}>
							<div className="relative aspect-[16/10]">
								<Image
									src={img}
									alt={`${packageName} image ${idx + 1}`}
									fill
									className="object-cover"
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<div className="absolute bottom-4 right-4 flex gap-2">
					<CarouselPrevious className="static h-10 w-10 translate-y-0 rounded-full border bg-background/90 text-foreground" />
					<CarouselNext className="static h-10 w-10 translate-y-0 rounded-full border bg-background/90 text-foreground" />
				</div>
			</Carousel>
		</section>
	);
}
