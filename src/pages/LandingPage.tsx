import { Link } from "react-router-dom";
// import UserHeader from "../features/users/UserPages/UserHeader";
import ServiceCarousel from "./Landingpage/ServiceCarousel";
import { useState } from "react";
import Stepper from "./Landingpage/Stepper";
import sampleImg from "/src/assets/userImages/footerLogo.svg";
import landingImg from "/src/assets/userImages/landing_img.png";
import UserHeader from "../features/users/UserPages/UserHeader";

import landingPageIcons from "/src/assets/userImages/1.svg";
import landingPageIcons2 from "/src/assets/userImages/2.svg";
import landingPageIcons3 from "/src/assets/userImages/3.svg";
import landingPageIcons4 from "/src/assets/userImages/4.svg";

export default function LandingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <div
      className="relative h-[100vh]"
      style={{
        backgroundImage: `url(${landingImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      <div className="absolute top-22 left-36 flex max-w-6xl mx-auto px-12 justify-between mt-0 h-[calc(100vh-100vh)]">
        <div>
          <div className="w-[150px] flex justify-end">
            <img src={landingPageIcons} alt="" className="w-24 h-auto" />
          </div>
          <div className="">
            <img src={landingPageIcons2} alt="" className="w-24 h-auto" />
          </div>
          <div className="">
            <img src={landingPageIcons3} alt="" className="w-24 h-auto" />
          </div>
          <div className="w-[150px] flex justify-end">
            <img src={landingPageIcons4} alt="" className="w-24 h-auto" />
          </div>
        </div>
      </div>

      <div className="bg-[#043428] h-auto">
        <div className="flex justify-center">
          <button className="bg-[#91C73D] rounded-lg px-4 font-semibold py-2 text-white">
            Tilmeld dig her
          </button>
        </div>
        <h1 className=" text-[33px] text-white leading-[66px] text-center">
          Gratis livsstilsunivers for bolig og fritid
        </h1>
        <h2 className="text-white text-[60px] leading-[66px] tracking-[0%] text-center max-w-4xl mx-auto py-4 px-4 font-bold">
          Samlingssted for dygtige leverandører til boligen.
        </h2>
        <p className="text-white text-center text-[18px] mx-auto max-w-7xl py-8 px-4">
          Håndværkere, rådgivere, køkkenbrands, livsstilsprodukter og meget
          mere. Vi har samlet et bredt udvalg af boligens vigtigste leveran
          dører, og præsenterer dem alle gennem korte profilvideoer, Trustpilot
          anmeldelser og let fordøjelige beskrivelser. Som boliginte resseret
          kan du således på en intuitiv måde med ganske få klik finde produkter
          og services blandt vores partnere, og det er vores håb, at vi dermed
          gør den ofte lidt udfordrende øvelse med at finde god og troværdig
          hjælp helt enkel og tryg. Vi har nemlig selv udvalgt og gennemgået
          hver enkelt partner. Velkommen til Boligmatch+.
        </p>
      </div>
      <ServiceCarousel />
      <div className="bg-[#043428] h-auto">
        <h1 className=" text-[52px] text-white leading-[66px]  text-center">
          Gennemskuelig boligrejse <br /> på et helt nyt niveau.
        </h1>
        <p className="text-white text-center text-[18px] mx-auto max-w-8xl py-8 px-4">
          I fremtiden kommer du som kunde hos Boligmatch også til at kunne følge
          din købs- eller salgsproces step for step på en intuitiv måde på
          Boligmatch+ platformen. Her får du et klart overblik over alle trin,
          aktiviteter og opgaver, så du altid ved, hvor du er i processen. Herud
          over kommer vi med nogle fordele, som ikke før er set i branchen.
          Opret dig gratis som bruger på Boligmatch+ her – så kan du allerede i
          dag komme igang med at søge efter leverandører, og samtidig automatisk
          holde dig opdateret om de kommende fordele.
        </p>
      </div>
      <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
      <div className="bg-[#043428] flex flex-col justify-center items-center pt-10">
        <div className="text-center">
          <div className="mb-8">
            <img src={sampleImg} alt="" />
          </div>
        </div>
        <p className="text-white text-sm">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </div>
  );
}
