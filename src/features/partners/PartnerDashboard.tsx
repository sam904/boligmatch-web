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
          bg-cover
              bg-[url('/src/assets/userImages/partnerStaticResponsive.png')] 
                 
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
