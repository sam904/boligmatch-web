import { useNavigate } from "react-router-dom";
import termsandCondition from "/src/assets/userImages/termaCondition.png";

export default function TermsAndConditions() {
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
            <img src={termsandCondition} alt="" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold mb-4">
            Vilkår og betingelser
          </h1>

          <div className="space-y-5 text-sm sm:text-base leading-relaxed text-white/90 text-left">
            <p>
              Coria elici ut delis ditinudae odi consequiata et res rem quatue
              officie eum sin pra quis et quae pores sin con poria nulparum qui
              culloquidu sit autate simi, oditis dolorem rerseribus modis dus
              del idiorib usaniti endam, cullit ut velit veniali igenem denim
              aut facis is aut rem que nectori bussamusam, sandi corserpum hit
              voluti est, aceupidipsum rerupti mi, ut eos ad ut omniissi dolupta
              tione tur? Qui simped qui temporioriam aut laborum umquiment expel
              magnis qui bla volo blat plantur, esequo elicis adicen tissendit
              omnis num fugiat emaqui etor nonem veles doluptatis quissimenti
              laborporem qui reapelicis quatemoporum faccuo quiae preius
              quodisquam, sequi doluptate omnis et asri ennedi et demoluptatem
              ipient prae sesqui to te sitaquatur arciga sequi tatust qui a lat
              volptata tecatquae voluptaturia eos quiaspe rumqui vellupt
              atempeqd quam, odi is accuptatae et exerorero et ic tota nonsae
              nobitia volore doloruptat as es exeritatem earrem fuga sed quibos
              intiore pelitio.
            </p>
            <p>
              Mustiis quo explessim esaequaspero delesequmo omnime tatur? Cienim
              plaquime conseqi idissimus asperrum etur aut aped exeritatias
              maximus candit aut mi, ullamquorun saepe verestique nisi quae
              nonestib iustamndi consent quassum es quid quae neces explicae sed
              et uisi ad min perhitincti doluptate molum, qui omnis doluptatem
              quias aut molores.
            </p>
            <p>
              Nequaturia quare res mo qui dolest, siminitior aut landestius,
              aliquae ra deribus, veliquo samendi endam venim etibusam labore
              natieo dolo moluptatur? Volendia sequi, sin nobiscid que eture aut
              nim conniendit, sum ien rem ex cisae iur magnis ut at faceaqam
              rerum nis con sem commi rem fuga.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
