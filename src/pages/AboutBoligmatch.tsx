import { useNavigate } from "react-router-dom";
import aboutLogo from "/src/assets/userImages/about.png";
import Footer from "./Footer";

export default function AboutBoligmatch() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#01351f] text-white">
      <header className="px-4 py-4 sm:px-6 sm:py-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </header>

      <main className="px-6 pb-10 flex flex-col items-center">
        <div className="flex flex-col items-center text-center w-full max-w-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mb-4 flex items-center justify-center">
            <img src={aboutLogo} alt="" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold mb-4">
            Om Boligmatch
          </h1>

          <div className="space-y-5 text-sm sm:text-base leading-relaxed text-white/90">
            <p>
              Mentia sam re, quaspe maiosedo to tempor aut fuga. Ed essum erro
              esedi ommoloritis et eum quibasupid que dolupta sintiati rehentur,
              qui cum quo eum culliciamet fuget, con erchici qui ullametur
              archil eosam que dempeles et dolorerupti pare.
            </p>
            <p>
              Nequis a quea volupta volupem, volorepatsi officiminci doluptatem
              atibusito in natur sam quas modistissi sum fugit, nobit aliqua
              volorro blaborita incim doluptate ni conemodi tantis, volupidunt
              landae.
            </p>
            <p>
              Ratur rero beaaspaperd ent aspisqui soluptate. Uciunt unt mollum
              que nis etas quae errorr molecest facime nosus eisent ditibusa sed
              es sin sitis repeleacb ipideni hitatquatur sinendi aut rem ipiciet
              exeperene nat.
            </p>
            <p>
              Nequaturia quare res mo qui dolest, siminitior aut landestius,
              aliquae ra deribus, veliquo samendi endam venim etibusam labore
              natieo dolo moluptatur?
            </p>
            <p>
              Volendia sequi, sin nobiscid que eture aut nim comniendit, sum ien
              rem erum ex cisae iur magnis ut at faceaqam rerum nis con sem
              commi rem fuga. Gentendem quis quid et, antiates to volupicti cum
              cieti cubsidus dolorrovit utea voluptatet repe liti beet et faccu
              lent ius apid endeni nimeni llatus moluptae.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
