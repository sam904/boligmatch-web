import partnerCartImg from "/src/assets/userImages/partnerCardImg.svg";
import sampleImg from "/src/assets/userImages/footerLogo.svg";

function ParentSteperPara() {
  const benefits = [
    {
      title: "Adgang til vores platform",
      description:
        "Boligmatch+ giver dig eksklusiv adgang til en platform fyldt med købsparate kunder med et behov for produkter og services relateret til bolig og fritid.",
    },
    {
      title: "Synlighed og markedsføring",
      description:
        "På Boligmatch+ får jeres virksomhed synlighed døgnet rundt, hele året. I får egen mini-hjemmeside med en professionelt produceret profilfilm, en beskrivelse af virksomheden og dens kompetencer samt visning af Trustpilot-anmeldelser. Aktiviteterne kan følges på jeres eget dashboard.",
    },
    {
      title: "Fokus ved fremvisninger",
      description:
        "Vi bringer partnerne i spil ved åbne huse og fremvisninger ved at fokusere på udviklingsmulighederne i den enkelte bolig, og fremhæve hvilke partnere der kan hjælpe køberne. Dette giver jer et væsentlig forspring ifht. konkurrenterne.",
    },
    {
      title: "Gratis deltagelse i vores netværksgruppe",
      description:
        "Som partner bliver du også en del af vores B2B-netværk. Her kan du bygge stærke relationer, dele viden og skabe nye forretningsmuligheder i et dynamisk og inspirerende miljø, og få adgang til spændende fordele og events.",
    },
    {
      title: "Rabat hos Boligmatch til jeres ansatte",
      description:
        "Alle de af jeres ansatte, som melder sig ind i Boligmatch+ får 20% i rabat hos Boligmatch.",
    },
    {
      title: "Kick-back ved henvisning af kunder",
      description:
        "Skaffer du en ny boligkunde til Boligmatch kvitterer vi med 10% af salæret, som overføres til din konto i Boligmatch+ fordelsprogrammet.",
    },
  ];
  return (
    <div className="bg-[#053628]">
      <div className="flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12 md:py-14">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-0">
            <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  tracking-tight">
              Velkommen til Boligmatch+ partnerskaber. Vi er godt i gang med at
              skabe et netværk af dygtige og troværdige leverandører til
              hjemmet, så boliginteresserede nemt og trygt kan søge efter
              produkter og services ét samlet sted. Platformen kalder vi
              Boligmatch+, og det bliver i fremtiden også stedet, hvor vores
              boligkunder kan følge deres købs- eller salgsproces. Ved at samle
              disse aktiviteter under samme tag gør vi det nemt for de besøgende
              at opfylde deres behov, og øger samtidig chancen for at de vælger
              én eller flere af vores partnere fremfor konkurrerende
              virksomheder.
            </p>
            <p className="text-white text-[16px] sm:text-[17px] md:text-[18px] leading-relaxed font-[300]  mt-4 tracking-tight">
              Vi tror på, at et stærkt samarbejde skal gå begge veje, hvor vi
              fungerer som hinandens ambassadører og støtter hinanden i at skabe
              værdi. Som partner hos Boligmatch får I adgang til en række
              eksklusive fordele, der styrker jeres forretning og åbner nye
              muligheder. Vi inviterer jer til at tage del i denne spændende
              rejse og blive en del af et visionært fællesskab.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#053628] min-h-screen px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 md:mb-16 ">
            Hvilke fordele får du som Boligmatch+ partner?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-4 sm:p-5 md:p-6 transition-colors duration-300 w-full h-full flex flex-col"
                style={{
                  background:
                    "linear-gradient(155.76deg, #041412 2.48%, #013425 97.87%)",
                  borderRadius: "10px",
                  opacity: 1,
                  minHeight: "350px",
                }}
              >
                <div className="mb-3 sm:mb-4 flex justify-center flex-shrink-0">
                  <img
                    src={partnerCartImg}
                    alt=""
                    className="h-[60px] w-[72px] sm:h-[70px] sm:w-[84px] md:h-[82px] md:w-[98px]"
                  />
                </div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3  text-center flex-shrink-0">
                  {benefit.title}
                </h3>
                <p className="text-white text-xs sm:text-sm leading-relaxed  text-center flex-grow">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#043428] flex flex-col justify-center items-center py-8 sm:py-12 md:py-16 lg:py-22 space-y-2 px-4">
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
    </div>
  );
}

export default ParentSteperPara;
