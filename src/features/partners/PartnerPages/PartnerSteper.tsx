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
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10px)] px-6 text-center mt-48">
          <button
            onClick={openModal}
            className="mb-8 px-8 py-3 bg-[#91C73D] text-white rounded-xl font-[600] transition-colors text-[20px] plus-jakarta-sans hover:bg-[#7FB333]"
          >
            Bliv Boligmatch+ partner
          </button>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] text-white max-w-4xl plus-jakarta-sans tracking-tight leading-14">
            Vil du være en del af et innovativt koncept, hvor vi har hinandens
            ryg?
          </h1>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[999]">
            <div
              className="bg-gray-100 rounded-4xl relative"
              style={{
                width: "620px",
                height: "634px",
              }}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-black text-2xl font-bold hover:text-gray-600 transition-colors cursor-pointer"
              >
                <img className="h-[42px] w-[42px]" src={crossIcon} alt="" />
              </button>

              <div className="text-center p-8 pt-16">
                <h2 className="text-[32px]  text-[#000000] mb-6 plus-jakarta-sans font-[700]">
                  Forespørg om partnerskab
                </h2>

                <div className="text-left space-y-4 mb-6 px-6">
                  <p className="text-[#000000] leading-tight plus-jakarta-sans plus-jakarta-sans text-[18px]">
                    Vi har brug for stærke og dygtige partnere. Vi har allerede
                    indgået partnerskab med en række forskellige virksomheder,
                    og inviterer jer til at tage del i denne spændende rejse og
                    blive en del af et visionært fællesskab.
                  </p>

                  <p className="text-[#000000] text-[18px] leading-tight plus-jakarta-sans plus-jakarta-sans">
                    Er du interesseret i at høre mere om mulighederne, så tøv
                    ikke med at kontakte vores partneransvarlige Klaus Rasmussen
                    på tlf. 20 297113.
                  </p>

                  <p className="text-[#000000] text-[18px] leading-tight plus-jakarta-sans">
                    Vi glæder os til at høre fra dig!
                  </p>
                </div>

                {/* Contact person image and info */}
                <div className="flex items-center justify-center space-x-4">
                  <div
                    className="bg-gray-300 rounded-full flex items-center justify-center"
                    style={{
                      width: "177px",
                      height: "220px",
                      top: "424px",
                      left: "227px",
                    }}
                  >
                    <div className="flex items-center justify-center">
                      <img
                        src={partnerModelImg}
                        alt="Klaus Rasmussen"
                        style={{
                          width: "177px",
                          height: "220px",
                        }}
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
