import PartnerHeader from "./PartnerPages/PartnerHeader";
import partnerlandingImg from "/src/assets/userImages/becomePartner.png";
import PartnerSteper from "./PartnerPages/PartnerSteper";
import ParentSteperPara from "./PartnerPages/PartnerSteperPara";


export default function PartnerDashboard() {
  return (
    <>
      <div
        className="h-[366px] md:h-[100vh] bg-no-repeat bg-cover bg-center 
             bg-[url('/src/assets/userImages/partnerStaticResponsive.png')] 
             md:bg-none"
        style={{
          backgroundImage: `url(${partnerlandingImg})`,
        }}
      >
        <PartnerSteper />

        <PartnerHeader />
      </div>
      <ParentSteperPara />
    </>
  );
}
