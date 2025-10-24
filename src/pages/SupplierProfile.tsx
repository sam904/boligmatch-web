import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import supplierProfile from "../assets/supplierProfile/suppliier-profile-hero.png";
// import userHeader from "/src/assets/userImages/userHeader.png";
// import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import heartIcon from "/src/assets/userImages/Lag_1.svg";
import share from "../assets/supplierProfile/share.png";
import chat from "../assets/supplierProfile/chat.png";
import { Star } from "lucide-react";
import UserHeader from "../features/users/UserPages/UserHeader";
import { useTranslation } from "react-i18next";
import shareModel from "/src/assets/userImages/shareModelImg.png";
import chatModel from "/src/assets/userImages/chatModelImg.svg";
import { favouritesService } from "../services/favourites.service";
import kabelLogoImg from "/src/assets/userImages/kabelLogoImg.png";
import { toast } from "react-toastify";

const SupplierProfile = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  console.log("isScrolled-->", isScrolled);
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<
    null | "recommend" | "contact"
  >(null);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  console.log('isAddingToFavorites', isAddingToFavorites)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToFavorites = async () => {
    try {
      setIsAddingToFavorites(true);

      // Get user data from localStorage
      const userStr = localStorage.getItem("bm_user");
      if (!userStr) {
        alert("User not found. Please log in again.");
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.userId;
      const partnerId = 2; // Static partnerId as requested

      const payload = {
        userId: userId,
        partnerId: partnerId,
        isActive: true,
      };

      console.log("Adding to favorites with payload:", payload);
      await favouritesService.add(payload);
      toast.success("Added to favorites");
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert("Failed to add to favorites. Please try again.");
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  return (
    <div
      className="h-[100vh]"
      style={{
        backgroundImage: `url(${supplierProfile})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <UserHeader />
      <div className="bg-[#043428] pt-12">
        <div className=" w-full mx-auto px-12 flex justify-center">
          <div className="flex gap-10 justify-center absolute bottom-10">
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={handleAddToFavorites}
            >
              <img src={heartIcon} alt="" />
              {t("supplierProfile.saveFavoriteButton")}
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={() => setActiveModal("recommend")}
            >
              <img src={share} alt="" />
              {t("supplierProfile.recommendation")}
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
              style={{
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
              onClick={() => setActiveModal("contact")}
            >
              <img src={chat} alt="" />
              {t("supplierProfile.conversation")}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-[#043428] pt-20">
        <h1 className="font-extrabold text-6xl text-center text-white py-20">
          Kabel-specialisten
        </h1>
        <p className="px-22 text-white text-center">
          Arumet latem. Cus, omnim dolorio nsequiasit dolestibusa nimperum
          laboria autem hilique peria quamus, in cum quuntia nectibea
          corestiost, consed ex et eum idio que consequia dolupiet fuga. Eperfer
          feristrum, suntis mod enihic tectotate voluptist mi, ipsus quatum idi
          autatusam quat fugit, conseque qui rerfere henihil laborum, quis
          maximil latempori dus eaquaspidis entio optate que es eum harum, tet,
          sapicia se velendaesed magnisci optatust remqui aut faccatibea venis
          dolo berum niscius Icatis atum asi voluptatem acit verum vellor mi,
          quam, occae in comnimi, quae et quam, te nemolupta eium venimpeles
          esenetus re mosam, quodis eos as am a comnis eario. Cia voluptas
          doluptatem raectior aut que con nullitasinum vent, as aut hit et, quid
          quatemquae consend icatus.
        </p>
      </div>
      <div className="bg-[#012F2B] min-h-screen flex justify-center items-center p-8">
        <div className="grid grid-cols-3 gap-6 max-w-6xl bg-[#012F2B]">
          {/* Trustpilot Section */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 flex flex-col">
              <h3 className="text-3xl font-semibold mb-5 text-center">
                Trustpilot
              </h3>
              <div className="flex justify-center items-center gap-1 mb-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="text-[#95C11F] fill-[#95C11F] w-13 h-13"
                    />
                  ))}
                <Star className="text-gray-500 fill-gray-500 w-13 h-13" />
              </div>
              <p className="text-md font-semibold text-black mb-4 text-center">
                Fremragende / 273 anmeldelser
              </p>
              <p className="text-7xl font-bold text-center mb-6">4.0</p>

              <div className="space-y-2 mb-4">
                {[5, 4, 3, 2, 1].map((num) => (
                  <div key={num} className="flex items-center gap-3 py-1">
                    <span className="text-sm w-20 whitespace-nowrap">{`${num} stjerner`}</span>
                    <div className="w-[300px] bg-[#D9D9D9] h-3 rounded-full overflow-hidden">
                      <div className="bg-[#95C11F] h-3 rounded-full w-2/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl p-3 mt-auto">
                <p className="text-xl font-bold text-center pb-7">
                  Anmeldelser
                </p>
                <div className="flex  items-center space-x-3">
                  {/* Initials Circle */}
                  <div className="bg-[#9ACD32] text-white font-bold rounded-full w-15 h-15 flex items-center justify-center text-sm">
                    NR
                  </div>

                  {/* Name and Date */}
                  <div className="flex flex-col">
                    <span className="font-semibold text-black leading-tight">
                      Niels Rasmussen
                    </span>
                    <span className="text-sm text-gray-600">
                      April 21, 2025
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex  items-center gap-1 mb-2">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="text-[#95C11F] fill-[#95C11F] w-7 h-7"
                    />
                  ))}
                <Star className="text-gray-500 fill-gray-500 w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-black mt-3">
                Hil idundae pelibus. Ulluptas vollace stibus eaquam quam
                dernatus am accatur, sam dolo essint aut utatur? Qui dit
                aboribusam, comniam quo dendi conse sapiet quame provitem iunt.
                Ulpa nia pra nobitis maionsed quos aborupta sam, voluptaerum
                sequi conem fugitibus, volum fugiatibus exceseres a sam, accae
                vitat
              </p>
              <div className="flex justify-center">
                <button className="mt-4 w-[170px] bg-[#91C73D] flex items-center gap-2 text-white rounded-lg px-4 py-1 text-sm font-semibold hover:bg-[#91C73D]/80">
                  <Star className="text-gray-100 w-12 h-12 " />
                  Anmeld os på Trustpilot
                </button>
              </div>
            </div>
            <div className="bg-[#0E3E38] rounded-2xl w-full flex justify-center items-center">
              <img
                src="/src/assets/supplierProfile/supplier-prof.png"
                alt="Team"
                className="rounded-xl w-full object-cover "
              />
            </div>
          </div>

          {/* Middle Section - Images + Services */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square">
              <img
                src="/src/assets/supplierProfile/supplier-self.png"
                alt="Kabel-specialisten"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-12 h-[465px] flex flex-col items-center aspect-square">
              <img
                src="/src/assets/supplierProfile/services.png"
                alt="Kabel-specialisten"
                className="w-30"
              />
              <h2 className="text-white text-3xl font-semibold py-4">
                Services
              </h2>
              <div className="text-white">
                <ul className="list-none space-y-2">
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Løsning af fejl og fejlfinding
                  </li>
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Intelligente hjemsystemer
                  </li>
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Alarm- og overvågningsinstallationer
                  </li>
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Installation af ladestandere til elbiler
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-6 aspect-square">
              <div className="flex flex-col items-center gap-2 mb-2">
                <img src="/src/assets/supplierProfile/gallery.png" alt="" />
                <h3 className="text-3xl font-semibold text-white py-4">
                  Referencer
                </h3>
              </div>
              <p className="text-white">Den sorte diamant, Kbh </p>
              <ul className="space-y-1 text-white pl-3">
                <li className="relative pl-5">• Toms Chokolade, Ballerup </li>
                <li className="relative pl-5">• Tivoli, Kbh</li>
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#FFFFFF] rounded-2xl p-20 justify-center flex items-center">
              <div>
                <img
                  src={kabelLogoImg}
                  alt=""
                  className="w-[177px] h-[164px]"
                />
                <h2 className="p-6 text-[#000000] font-[800] txt-[30px]">
                  Kabel-specialisten
                </h2>
              </div>
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-12 h-[465px] flex flex-col items-center aspect-square">
              <img
                src="/src/assets/userImages/faktaLogo.svg"
                alt="Kabel-specialisten"
                className="w-30"
              />
              <h2 className="text-white text-3xl font-semibold py-4">Fakta</h2>
              <div className="text-white">
                <ul className="list-none space-y-2">
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Antal ansatte: 7
                  </li>
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Etableringsår: 2002
                  </li>
                  <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Åbningstid: man-fre kl. 8-16
                  </li>
                  {/* <li className="relative pl-5">
                    <span className="absolute left-0 top-1.5 w-1.5 h-1.5 bg-white rounded-full"></span>
                    Installation af ladestandere til elbiler
                  </li> */}
                </ul>
              </div>
            </div>
            <div className="rounded-2xl flex justify-center items-center">
              <img
                src="/src/assets/userImages/subcategoryDetailImg.png"
                alt="Work"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlays for modals */}
      {activeModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActiveModal(null)}
          />

          {/* Panel */}
          <div className="relative z-50 w-[320px] sm:w-[360px] md:w-[420px] bg-[#E5E7EB] rounded-[18px] shadow-xl p-6 border border-[#1F7A58]/10">
            <button
              className="absolute right-4 top-3 text-black text-xl cursor-pointer"
              aria-label="Close"
              onClick={() => setActiveModal(null)}
            >
              ×
            </button>

            {activeModal === "recommend" && (
              <div className="flex flex-col items-stretch">
                <div className="flex justify-center mb-4">
                  <img
                    src={shareModel}
                    alt="share"
                    className="w-[83px] h-[96px]"
                  />
                </div>
                <h3 className="text-center font-extrabold text-lg mb-1">
                  {t("supplierProfile.recommendModal.title")}
                </h3>
                <p className="text-center text-[13px] text-[#27323F] leading-snug mb-4">
                  {t("supplierProfile.recommendModal.description")}
                </p>

                <label className="text-sm font-semibold mb-1">
                  {t("supplierProfile.recommendModal.email")}
                </label>
                <input
                  type="email"
                  placeholder=""
                  className="mb-3 w-full rounded-[10px] bg-white h-9 px-3 outline-none"
                />

                <label className="text-sm font-semibold mb-1">
                  {t("supplierProfile.recommendModal.comment")}
                </label>
                <textarea
                  placeholder=""
                  className="w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none"
                />

                <div className="flex justify-center mt-4">
                  <button className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg">
                    {t("supplierProfile.recommendModal.send")}
                  </button>
                </div>
              </div>
            )}

            {activeModal === "contact" && (
              <div className="flex flex-col items-stretch">
                <div className="flex justify-center mb-4">
                  <img
                    src={chatModel}
                    alt="chat"
                    className="w-[112px] h-[89px]"
                  />
                </div>
                <h3 className="text-center font-extrabold text-lg mb-1">
                  {t("supplierProfile.contactModal.title")}
                </h3>
                <p className="text-center text-[13px] text-[#27323F] leading-snug mb-4">
                  {t("supplierProfile.contactModal.description")}
                </p>

                <label className="text-sm font-semibold mb-1">
                  {t("supplierProfile.contactModal.subject")}
                </label>
                <input
                  type="text"
                  className="mb-3 w-full rounded-[10px] bg-white h-9 px-3 outline-none"
                />

                <label className="text-sm font-semibold mb-1">
                  {t("supplierProfile.contactModal.body")}
                </label>
                <textarea className="w-full rounded-[10px] bg-white h-28 px-3 py-2 outline-none resize-none" />

                <div className="flex justify-center mt-4 mb-6">
                  <button className="min-w-[120px] h-10 bg-[#91C73D] text-white font-semibold rounded-lg">
                    {t("supplierProfile.contactModal.send")}
                  </button>
                </div>

                <div className="text-center text-[12px] text-[#27323F]">
                  <p className="mb-1 font-semibold">
                    {t("supplierProfile.contactModal.contactInfo")}
                  </p>
                  <p className="font-extrabold">Kabel–specialisten</p>
                  <p>Hejvangnen 214, 6000 Kolding</p>
                  {/* <p></p> */}
                  <p>Tlf. 56 34 12 67 , CVR 45237856</p>
                  {/* <p></p> */}
                  <p>info@kabel-specialisten.dk</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProfile;
