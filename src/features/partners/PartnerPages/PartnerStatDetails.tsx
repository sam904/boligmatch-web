import partnerRingImg from "/src/assets/userImages/partnerringImg.png";
import sampleImg from "/src/assets/userImages/footerLogo.svg";

function PartnerStatDetails() {
  const statistics = [
    {
      number: "34",
      label: "Besøg på min profil",
    },
    {
      number: "21",
      label: "Visninger af kontaktinfo",
    },
    {
      number: "7",
      label: "Afsendte forespørgsler",
    },
    {
      number: "14",
      label: "Gemt som favorit",
    },
  ];

  return (
    <>
      <div className="bg-[#043428]  p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12 place-items-center">
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 border-dashed border-[#91C73D] flex flex-col items-center justify-center w-[188.515px] h-[188.184px]"
                  style={{
                    backgroundImage: `url(${partnerRingImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                >
                  <div className="text-[64px] font-bold text-white">
                    {stat.number}
                  </div>
                  <div className="text-center px-2">
                    {/* <p className="text-white text-[15px] leading-tight">
                      {stat.label}
                    </p> */}
                    <p className="text-white text-[15px] leading-tight text-center max-w-[95px]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Text Block Section */}
        <div className="max-w-7xl mx-auto">
          <div className="p-4 md:p-8">
            <p className="text-white text-[10px] sm:text-[20px] leading-relaxed text-center">
              Sa dolut magnis ea sitas sed es ea verum rererum, et molorer
              itatecerovit venite cum qui nis nonecab orporuptam et ut ut endae
              pa dolorectem nus magnatium et quae magniste laborem imus et mi,
              inihiliamus ut poriam sendusam, conem ellor sitatem voluptatiae
              verat asperiate vendite volupta consectur maionseque ea quate
              volore doluptas aboreria isintotatem as nis que verum
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#043428] flex flex-col justify-center items-center py-2 space-y-2">
        <div className="text-center">
          <div className="">
            <img src={sampleImg} alt="" />
          </div>
        </div>
        <p className="text-white text-sm text-center">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </>
  );
}

export default PartnerStatDetails;
