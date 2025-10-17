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
      <div className="bg-[#043428] min-h-screen p-8">
        <div className="w-full flex max-w-7xl mx-auto items-center justify-center space-x-20 mb-12">
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 border-dashed border-[#91C73D] flex flex-col items-center justify-center"
                  style={{
                    width: "188.51513671875px",
                    height: "188.18359375px",
                    backgroundImage: `url(${partnerRingImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                >
                  {/* Number */}
                  <div className="text-4xl font-bold text-white  mb-2">
                    {stat.number}
                  </div>
                  {/* Label */}
                  <div className="text-center px-2">
                    <p className="text-white text-sm  leading-tight">
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
          <div className="p-8">
            <p className="text-white text-lg leading-relaxed ">
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
          <div className="mb-4">
            <img src={sampleImg} alt="" />
          </div>
        </div>
        <p className="text-white text-sm">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </>
  );
}

export default PartnerStatDetails;
