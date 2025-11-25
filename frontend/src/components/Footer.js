const columns = [
  {
    heading: "AI Removal Tools",
    links: [
      "Remove Unwanted Objects",
      "Remove Background from Video",
      "Remove Background from Photo",
      "Face Cutout",
    ],
  },
  {
    heading: "AI Restore Tools",
    links: [
      "Photo Enhancer",
      "Anime Enhancer",
      "Video Enhancer",
      "Photo Colorizer",
      "Photo Animer",
      "Photo Color Correction",
      "Blur Background",
    ],
  },
  {
    heading: "AI Video Tools",
    links: [
      "Video Cutout",
      "Photo to Video",
      "Screen Recorder",
      "Webcam Virtual Background",
    ],
  },
  {
    heading: "Solution",
    links: [
      "Interior Design",
      "Image Design",
      "E-commerce",
      "Developer",
      "Customized Printing",
      "ID Photo Maker",
      "Video XR",
      "Old Photo Restoration",
      "Image to Video",
      "Interior Remodel",
    ],
  },
  {
    heading: "Support",
    links: [
      "Help & FAQs",
      "Photo Pricing",
      "Video Pricing",
      "API Documents",
      "About Us",
      "Privacy Policy",
      "Term of Use",
      "Sitemap",
      "Blog",
    ],
  },
  {
    heading: "App&Plugin",
    links: ["Cutout Desktop APP", "Mobile APP", "Shopify Plugin"],
  },
  {
    heading: "Visual Models",
    links: ["Flux Krea", "Imagen 4.0"],
  },
  {
    heading: "Make Money with Us",
    links: ["Become an Affiliate", "Build APP with API"],
  },
  {
    heading: "Edit Models",
    links: [
      "Ai Image Editing Art",
      "Ai Image Editing Design",
      "Ai Image Editing Photographer",
    ],
  },
];

const socialIcons = [
  { label: "LinkedIn", icon: "in" },
  { label: "Facebook", icon: "f" },
  { label: "YouTube", icon: "▶" },
  { label: "Twitter", icon: "🐦" },
  { label: "Instagram", icon: "📸" },
];

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-[#0f0f10] text-white font-[Poppins]">
      <div className="absolute inset-x-0 -top-8">
        <svg
          viewBox="0 0 1440 120"
          className="h-16 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C240,20 480,20 720,80 C960,140 1200,140 1440,80 L1440,0 L0,0 Z"
            fill="#0f0f10"
          />
        </svg>
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-20 text-[#f8f8f8] sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">About Cutout.Pro</h3>
            <p className="text-[15px] leading-relaxed text-[#d9d9d9]">
              Founded in 2018, with a group of technomaniacs, cutout.pro
              leverages the power of artificial intelligence and computer vision
              to deliver a wide range of products that make your life much
              easier and your work more productive.
            </p>
            <div className="space-y-4 text-sm text-[#dedede]">
              <p>
                Technical support:{" "}
                <a
                  href="mailto:tech@cutout.pro"
                  className="font-semibold text-white underline"
                >
                  tech@cutout.pro
                </a>
              </p>
              <p>
                Business collaboration:{" "}
                <a
                  href="mailto:business@picup.ai"
                  className="font-semibold text-white underline"
                >
                  business@picup.ai
                </a>
              </p>
              <div>
                <p className="uppercase text-xs tracking-wider text-[#bbbbbb]">
                  HongKong Office:
                </p>
                <p className="font-semibold">6/F MANULIFE PLACE,</p>
                <p className="font-semibold">348 KWUN TONG ROAD, KOWLOON, HK</p>
              </div>
            </div>

            <div>
              <p className="mb-3 font-semibold">Follow us</p>
              <div className="flex gap-3">
                {socialIcons.map((item) => (
                  <button
                    key={item.label}
                    aria-label={item.label}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-transparent text-lg font-semibold text-white transition hover:bg-white/10"
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-[#b3b3b3]">
              by Team LibAI <span className="mx-1">🌙</span> LibAI Lab
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => (
              <div key={column.heading} className="space-y-3">
                <h4 className="text-lg font-semibold">{column.heading}</h4>
                <ul className="space-y-1 text-sm text-[#cbcbcb]">
                  {column.links.map((link) => (
                    <li key={link} className="transition hover:text-white">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
