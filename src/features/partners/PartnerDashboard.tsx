import PartnerHeader from "./PartnerPages/PartnerHeader";
import partnerlandingImg from "/src/assets/userImages/partnerStepperImg.svg";
import PartnerSteper from "./PartnerPages/PartnerSteper";
import ParentSteperPara from "./PartnerPages/PartnerSteperPara";


export default function PartnerDashboard() {
  return (
    <>
      {/* <div
        className="h-[100vh]"
        style={{
          backgroundImage: `url(${partnerlandingImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      > */}
      <div
        className={`
              relative 
              h-[368px]      
              md:h-[97vh]       
              bg-no-repeat bg-cover bg-center
              bg-[url('/src/assets/userImages/partnerStaticResponsive.png')] 
              md:bg-none       
  `}
        style={{
          backgroundImage: `url(${partnerlandingImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <PartnerSteper />
        <PartnerHeader />
      </div>
      <ParentSteperPara />
    </>
  );
}
