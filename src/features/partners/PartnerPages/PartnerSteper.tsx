import { useEffect, useState } from "react";
import partnerModelImg from "/src/assets/userImages/partnerModelImg.svg";
import crossIcon from "/src/assets/userImages/close_icon.svg";
import { useTranslation } from "react-i18next";

function PartnerSteper() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldRenderModal, setShouldRenderModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const MODAL_TRANSITION_DURATION = 300;
  const { t } = useTranslation();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    let timeout: number | undefined;

    if (isModalOpen) {
      setShouldRenderModal(true);
      setIsModalVisible(false);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsModalVisible(true))
      );
    } else if (shouldRenderModal) {
      setIsModalVisible(false);
      timeout = window.setTimeout(() => setShouldRenderModal(false), MODAL_TRANSITION_DURATION);
    }

    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isModalOpen, shouldRenderModal]);

  useEffect(() => {
    if (!shouldRenderModal) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [shouldRenderModal]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center">
        {/* Main content container with adjusted positioning */}
        <div className="z-10 flex flex-col items-center justify-center min-h-[calc(100vh-20px)] px-4 sm:px-6 text-center">
          {/* Reduced spacer to push content down just a little */}
          <div className="h-[6vh] md:h-[70vh]"></div>
          
          {/* Button with reduced margin */}
          <button
            onClick={openModal}
            className="mt-0 mb-1 md:mt-4 px-6 sm:px-8 py-3 bg-[#91C73D] text-white rounded-xl font-[600] transition-colors text-[12px] md:text-[20px] hover:bg-[#7FB333] cursor-pointer"
          >
            {t("partnerStepper.cta")}
          </button>

         
        </div>

        {shouldRenderModal && (
          <div
            className={`fixed inset-0 flex items-center justify-center z-[999] p-4 cursor-pointer transition-opacity duration-300 ${
              isModalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeModal}
            style={{ pointerEvents: isModalVisible ? "auto" : "none" }}
          >
            <div
              className="absolute inset-0 bg-black/50 transition-opacity duration-300"
              style={{ opacity: isModalVisible ? 1 : 0.6 }}
            />
            <div
              className={`bg-[#ECECEC] rounded-[22px] sm:rounded-[26px] relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto md:overflow-hidden shadow-xl border border-gray-200 cursor-default transform transition-all duration-300 ease-out ${
                isModalVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 text-2xl font-bold hover:text-gray-500 transition-colors cursor-pointer z-10"
              >
                <img className="h-[42px] w-[42px]" src={crossIcon} alt="" />
              </button>

              <div className="text-center p-4 sm:p-6 md:p-8 pt-12 sm:pt-14">
                <h2 className="text-[20px] sm:text-[24px] md:text-[26px] text-[#111111] mb-4 sm:mb-6 font-[700] figtree">
                  {t("partnerStepper.modalTitle")}
                </h2>

                <div className="text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6 px-4 sm:px-6 md:px-8">
                  <p className="text-gray-700 leading-relaxed text-[15px] sm:text-[16px] md:text-[17px]">
                    {t("partnerStepper.p1")}
                  </p>

                  <p className="text-gray-700 text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed ">
                    {t("partnerStepper.p2_before", { name: "Klaus Rasmussen" })}{" "}
                    <a
                      href="tel:20297113"
                      className="text-[#91C73D] hover:underline"
                    >
                      20 297113
                    </a>
                    {t("partnerStepper.p2_after")}
                  </p>

                  <p className="text-gray-700 text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed ">
                    {t("partnerStepper.p3")}
                  </p>
                </div>

                {/* Contact person image and info */}
                <div className="flex items-center justify-center pb-8">
                  <img
                    src={partnerModelImg}
                    alt={t("partnerStepper.contactName", {
                      defaultValue: "Klaus Rasmussen",
                    })}
                    className="w-[120px] h-[150px] sm:w-[150px] sm:h-[180px] object-cover rounded-md"
                  />
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
