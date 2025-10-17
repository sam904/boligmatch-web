import { useState } from "react";
import partnerModelImg from "/src/assets/userImages/partnerModelImg.svg";
import crossIcon from "/src/assets/userImages/close_icon.svg";

function PartnerSteper() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10px)] px-4 sm:px-6 text-center mt-24 sm:mt-32 md:mt-48">
          <button
            onClick={openModal}
            className="mb-6 sm:mb-8 px-6 sm:px-8 py-3 bg-[#91C73D] text-white rounded-xl font-[600] transition-colors text-[16px] sm:text-[18px] md:text-[20px] plus-jakarta-sans hover:bg-[#7FB333]"
          >
            Bliv Boligmatch+ partner
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-[800] text-white max-w-4xl plus-jakarta-sans tracking-tight leading-tight sm:leading-14 px-2">
            Vil du være en del af et innovativt koncept, hvor vi har hinandens
            ryg?
          </h1>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999] p-4">
            <div className="bg-gray-100 rounded-2xl sm:rounded-4xl relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-black text-2xl font-bold hover:text-gray-600 transition-colors cursor-pointer z-10"
              >
                <img className="h-[32px] w-[32px] sm:h-[42px] sm:w-[42px]" src={crossIcon} alt="" />
              </button>

              <div className="text-center p-4 sm:p-6 md:p-8 pt-12 sm:pt-16">
                <h2 className="text-[24px] sm:text-[28px] md:text-[32px] text-[#000000] mb-4 sm:mb-6 plus-jakarta-sans font-[700]">
                  Forespørg om partnerskab
                </h2>

                <div className="text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6 px-2 sm:px-4 md:px-6">
                  <p className="text-[#000000] leading-tight plus-jakarta-sans text-[16px] sm:text-[17px] md:text-[18px]">
                    Vi har brug for stærke og dygtige partnere. Vi har allerede
                    indgået partnerskab med en række forskellige virksomheder,
                    og inviterer jer til at tage del i denne spændende rejse og
                    blive en del af et visionært fællesskab.
                  </p>

                  <p className="text-[#000000] text-[16px] sm:text-[17px] md:text-[18px] leading-tight plus-jakarta-sans">
                    Er du interesseret i at høre mere om mulighederne, så tøv
                    ikke med at kontakte vores partneransvarlige Klaus Rasmussen
                    på tlf. <a href="tel:20297113" className="text-[#91C73D] hover:underline">20 297113</a>.
                  </p>

                  <p className="text-[#000000] text-[16px] sm:text-[17px] md:text-[18px] leading-tight plus-jakarta-sans">
                    Vi glæder os til at høre fra dig!
                  </p>
                </div>

                {/* Contact person image and info */}
                <div className="flex items-center justify-center">
                  <div className="bg-gray-300 rounded-full flex items-center justify-center w-[120px] h-[150px] sm:w-[150px] sm:h-[180px] md:w-[177px] md:h-[220px]">
                    <div className="flex items-center justify-center">
                      <img
                        src={partnerModelImg}
                        alt="Klaus Rasmussen"
                        className="w-[120px] h-[150px] sm:w-[150px] sm:h-[180px] md:w-[177px] md:h-[220px] object-cover rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PartnerSteper;
