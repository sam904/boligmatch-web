import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import userDashboard from "/src/assets/userImages/user-supplier.png";
// import userHeader from "/src/assets/userImages/userHeader.png";
// import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";

// Category images
import Elektriker from "../assets/userSupplier/Elektriker.png";
import Fugemand from "../assets/userSupplier/Fugemand.png";
import Glarmester from "../assets/userSupplier/Glarmester.png";
import Handyman from "../assets/userSupplier/Handyman.png";
import Maler from "../assets/userSupplier/Maler.png";
import Tomrer from "../assets/userSupplier/Tømrer.png";
import Murer from "../assets/userSupplier/Murer.png";
import VVS from "../assets/userSupplier/VVS.png";
import JimmysELservice from "../assets/userSupplier/Jimmys EL-service.png";
import ElektrikerJohn from "../assets/userSupplier/ElektrikerJohn.png";
import ELVagn from "../assets/userSupplier/EL-Vagn.png";
import Denelektriskeduo from "../assets/userSupplier/Den elektriske duo.png";
import Kabespecialisten from "../assets/userSupplier/Kabel-specialisten.png";
import UserHeader from "../features/users/UserPages/UserHeader";

interface Category {
  name: string;
  icon: string;
}

interface Service {
  icon: string;
  title: string;
  description: string;
}

// --- Card component ---
const ServiceCard: React.FC<Service> = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 w-[380px] h-[430px] flex flex-col items-center justify-between p-8 text-center">
    <img src={icon} alt={title} className="w-23 h-20 mt-4" />

    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 ">{title}</h3>
      <p className="text-gray-600  leading-relaxed">{description}</p>
    </div>

    <button className="font-bold text-black mt-6 mb-4 hover:underline">
      More info
    </button>
  </div>
);

const UserSupplier = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  console.log("isScrolled", isScrolled);
  const [active, setActive] = useState("Elektriker");

  const categories: Category[] = [
    { name: "Tømrer", icon: Tomrer },
    { name: "Murer", icon: Murer },
    { name: "Elektriker", icon: Elektriker },
    { name: "Maler", icon: Maler },
    { name: "VVS", icon: VVS },
    { name: "Glarmester", icon: Glarmester },
    { name: "Handyman", icon: Handyman },
    { name: "Fugemand", icon: Fugemand },
  ];

  const services: Service[] = [
    {
      icon: JimmysELservice,
      title: "Jimmys EL–service",
      description:
        "Omnimus voluptate quatem nisquas acipsum sinicta epudae la aliquodi repella des et etur, occus dolorem spelene cturiandaeXim repudae et aped ma ationsequ...",
    },
    {
      icon: ElektrikerJohn,
      title: "ElektrikerJohn",
      description:
        "Omnimus voluptate quatem nisquas acipsum sinicta epudae la aliquodi repella des et etur, occus dolorem spelene cturiandaeXim repudae et aped ma ationsequ...",
    },
    {
      icon: ELVagn,
      title: "EL–Vagn",
      description:
        "Omnimus voluptate quatem nisquas acipsum sinicta epudae la aliquodi repella des et etur, occus dolorem spelene cturiandaeXim repudae et aped ma ationsequ...",
    },
    {
      icon: Denelektriskeduo,
      title: "Den elektriske duo",
      description:
        "Omnimus voluptate quatem nisquas acipsum sinicta epudae la aliquodi repella des et etur, occus dolorem spelene cturiandaeXim repudae et aped ma ationsequ...",
    },
    {
      icon: Kabespecialisten,
      title: "Kabel–specialisten",
      description:
        "Omnimus voluptate quatem nisquas acipsum sinicta epudae la aliquodi repella des et etur, occus dolorem spelene cturiandaeXim repudae et aped ma ationsequ...",
    },
  ];

  // Sticky navbar effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="h-[100vh]"
      style={{
        backgroundImage: `url(${userDashboard})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      <section className="bg-[#043428] py-12 px-8 flex flex-wrap justify-center gap-6">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActive(cat.name)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 text-white
              ${
                active === cat.name
                  ? "bg-[#b6e924] text-black shadow-lg scale-105"
                  : "hover:text-[#b6e924] hover:bg-white/10"
              }`}
          >
            <img src={cat.icon} alt={cat.name} className="w-7 h-7" />
            <span className="text-lg font-semibold">{cat.name}</span>
          </button>
        ))}
      </section>

      <section className="bg-[#0b3b35] w-full flex justify-center ">
        <div className="flex flex-wrap justify-start gap-10 max-w-7xl">
          {services.map((service, idx) => (
            <ServiceCard key={idx} {...service} />
          ))}
        </div>
      </section>

      <footer className="bg-[#0b3b35] text-white text-center p-4">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <div className="mb-8">
              <img
                src="/src/assets/userImages/footerLogo.svg"
                alt="Boligmatch Logo"
              />
            </div>
          </div>
          <p className="text-white text-sm">
            Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserSupplier;
