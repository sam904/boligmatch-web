import React from "react";
import PartnerHeader from "./PartnerPages/PartnerHeader";
import partnerlandingImg from "/src/assets/userImages/partnerDashboard.png";
import PartnerSteper from "./PartnerPages/PartnerSteper";
import ParentSteperPara from "./PartnerPages/PartnerSteperPara";

export default function PartnerDashboard() {
  return (
    <>
      <div
        className="h-[100vh]"
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
