import footerLogo from "/src/assets/userImages/footerLogo.svg";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  
 
  const contactParts = [
    { type: 'street', text: t("footer.street") },
    { type: 'city', text: t("footer.city") },
    { type: 'phone', text: t("footer.phone") },
    { type: 'email', text: t("footer.email") },
    { type: 'cvr', text: t("footer.cvr") }
  ];

  return (
    <>
      <footer className="bg-[#01351f] text-white text-center p-4 pt-42">
        <div className="flex flex-col items-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-[199px] h-[45px] mx-auto">
                <img
                  src={footerLogo}
                  alt="Boligmatch Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Contact info with dot separators */}
          <div className="flex flex-wrap justify-center items-center">
            {contactParts.map((part, index) => (
              <div key={index} className="flex items-center">
                <span className="text-white text-sm figtree font-[400] text-[18px]">
                  {part.text}
                </span>
                {index < contactParts.length - 1 && (
                  <span className="mx-1 text-[12px]">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;