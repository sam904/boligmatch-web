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
      <div className="bg-[#043428] min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full flex flex-col sm:flex-row flex-wrap justify-center items-center max-w-7xl mx-auto gap-6 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-12 2xl:gap-16 mb-8 sm:mb-10 md:mb-12">
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full border-2 border-dashed border-[#91C73D] flex flex-col items-center justify-center w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] md:w-[180px] md:h-[180px] lg:w-[188px] lg:h-[188px]"
                  style={{
                    backgroundImage: `url(${partnerRingImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 1,
                  }}
                >
                  {/* Number */}
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white plus-jakarta-sans mb-2">
                    {stat.number}
                  </div>
                  {/* Label */}
                  <div className="text-center px-2">
                    <p className="text-white text-sm sm:text-base plus-jakarta-sans leading-tight">
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
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed plus-jakarta-sans">
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
      <div className="bg-[#043428] flex flex-col justify-center items-center py-4 sm:py-6 md:py-8 space-y-2 px-4">
        <div className="text-center">
          <div className="mb-3 sm:mb-4">
            <img src={sampleImg} alt="Boligmatch Logo" className="h-auto w-auto max-w-[120px] sm:max-w-[150px] md:max-w-none" />
          </div>
        </div>
        <p className="text-white text-xs sm:text-sm text-center leading-relaxed">
          Teningve 7 2610 Rødovre<br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>Tlf <a href="tel:70228288" className="text-[#91C73D] hover:underline">70228288</a><br className="sm:hidden" />
          <span className="hidden sm:inline"> </span><a href="mailto:info@boligmatch.dk" className="text-[#91C73D] hover:underline">info@boligmatch.dk</a><br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>CVR 33160437
        </p>
      </div>
    </>
  );
}

export default PartnerStatDetails;
