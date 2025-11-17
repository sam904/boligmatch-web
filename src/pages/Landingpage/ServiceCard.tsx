import ImageWithFallback from "./ImageWithFallback";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  image: string;
}

export function ServiceCard({
  title,
  description,
  icon,
  image,
}: ServiceCardProps) {
  return (
    <div className="group relative h-[515px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[220px] z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(1,53,31,0) 0%, #01351F 100%)",
        }}
      />

      <div className="absolute inset-0 z-30 flex flex-col items-center justify-end px-8 pb-8">
        <div className="mb-2 transform transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
          <div className="w-[51px] h-[51px] flex items-center justify-centertransition-all duration-500 ">
            <img src={icon} alt="" />
          </div>
        </div>

        <h3 className="text-[#FFFFFF] text-center mb-2 font-[800] tracking-tight transition-all text-[24px] duration-300 group-hover:translate-y-1">
          {title}
        </h3>

        <p className="text-[#FFFFFF] text-center max-w-[280px] font-[400] text-[16px] transition-all duration-300 group-hover:text-gray-200">
          {description}
        </p>
      </div>
    </div>
  );
}
