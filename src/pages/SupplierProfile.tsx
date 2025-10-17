import { useEffect, useState } from "react";
// import userLogo from "/src/assets/userImages/userLogo.png";
import supplierProfile from "../assets/supplierProfile/suppliier-profile-hero.png";
// import userHeader from "/src/assets/userImages/userHeader.png";
// import userHeaderHamburger from "/src/assets/userImages/userHeaderHamburger.png";
import heartIcon from "/src/assets/userImages/Lag_1.svg";
import share from "../assets/supplierProfile/share.png";
import chat from "../assets/supplierProfile/chat.png";
import { Star, MapPin, Info, Users } from "lucide-react";
import UserHeader from "../features/users/UserPages/UserHeader";

const SupplierProfile = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  console.log("isScrolled-->", isScrolled);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <div className="flex gap-10 justify-center">
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg hover:bg-[#06351E] transition-colors flex items-center gap-2"
              style={{
                // fontFamily: "Figtree",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
            >
              <img src={heartIcon} alt="" />
              Gem som favorit
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg hover:bg-[#7BA832] transition-colors flex items-center gap-2"
              style={{
                // fontFamily: "Figtree",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
            >
              <img src={share} alt="" />
              Anbefal os til andre
            </button>
            <button
              className="bg-[#91C73D] text-white px-6 py-3 rounded-lg hover:bg-[#7BA832] transition-colors flex items-center gap-2  "
              style={{
                // fontFamily: "Figtree",
                fontSize: "20px",
                fontWeight: 600,
                lineHeight: "100%",
              }}
            >
              <img src={chat} alt="" />
              Samtaler
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

            <div className="bg-[#0E3E38] rounded-2xl p-6 flex flex-col items-center aspect-square">
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
            <div className="bg-[#0E3E38] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="text-green-400" />
                <h3 className="text-lg font-semibold">Fakta</h3>
              </div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Antal ansatte: 7</li>
                <li>• Etableringsår: 2002</li>
                <li>• Åbningstid: man-fre kl. 8–16</li>
              </ul>
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-6 text-center">
              <MapPin className="mx-auto text-green-400 mb-2" />
              <h3 className="text-lg font-semibold mb-2">Geografisk område</h3>
              <p className="text-sm text-gray-300">
                Storkøbenhavn, Nordjælland
              </p>
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Users className="text-green-400" /> Referencer
              </h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Den sorte diamant, Kbh</li>
                <li>• Toms Chokolade, Ballerup</li>
                <li>• Tivoli, Kbh</li>
              </ul>
            </div>

            <div className="bg-[#0E3E38] rounded-2xl p-4 flex justify-center items-center">
              <img
                src="/src/assets/kabel-work.jpg"
                alt="Work"
                className="rounded-xl w-full h-40 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
