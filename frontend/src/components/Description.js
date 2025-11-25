import image from "../../public/images/des1.jpeg";
import image2 from "../../public/images/des2.jpg";

const content = [
  {
    title: "Remove Background from Image Effortlessly",
    description:
      "Removing background from an image has never been easier with our AI background eraser. You can make background transparent and create stunning visuals in no time. It’s the best bg remover and png maker.",
    image: "/images/des2.jpg",
    layout: "text-first",
  },
  {
    title: "Change Background to Unleash Your Creativity",
    description:
      "Our free background remover is a powerful tool designed to help you change the background of your images effortlessly. With its advanced algorithms, you can quickly remove the background of any image and replace it with a new one.",
    image: "/images/des1.jpeg",
    layout: "image-first",
  },
];

export default function Description() {
  return (
    <section className="mx-auto w-full  bg-gray-400 px-4 py-16 font-[Poppins] sm:px-6 lg:px-8">
      <div className="flex flex-col gap-16">
        {content.map((item, index) => (
          <div
            key={item.title}
            className={`flex flex-col items-center gap-10 lg:flex-row ${
              item.layout === "image-first" ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="w-full lg:w-1/2">
              <h2 className="text-[32px] font-black leading-tight text-[#0b0b0b]">
                {item.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#3f3f3f]">
                {item.description}
              </p>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="overflow-hidden rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
