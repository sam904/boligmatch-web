import React from "react";
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
      <div className="flex items-start justify-center px-6 py-14">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-0">
            <p className="text-white text-[18px] leading-relaxed font-[300] plus-jakarta-sans tracking-tight">
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
            <p className="text-white text-[18px] leading-relaxed font-[300] plus-jakarta-sans mt-4 tracking-tight ">
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
      <div className="bg-[#053628] min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-4xl md:text-5xl font-bold text-center mb-16 plus-jakarta-sans">
            Hvilke fordele får du som Boligmatch+ partner?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-6 transition-colors duration-300"
                style={{
                  background:
                    "linear-gradient(155.76deg, #041412 2.48%, #013425 97.87%)",
                  width: "330px",
                  height: "428px",
                  borderRadius: "10px",
                  opacity: 1,
                }}
              >
                <div className="mb-4 flex justify-center">
                  <img
                    src={partnerCartImg}
                    alt=""
                    className="h-[82px] w-[98px]"
                  />
                </div>
                <h3 className="text-white text-xl font-bold mb-3 plus-jakarta-sans text-center plus-jakarta-sans">
                  {benefit.title}
                </h3>
                <p className="text-white text-sm leading-relaxed plus-jakarta-sans text-center plus-jakarta-sans">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#043428] flex flex-col justify-center items-center py-22 space-y-2">
        <div className="text-center">
          <div className="mb-4">
            <img src={sampleImg} alt="" />
          </div>
        </div>
        <p className="text-white text-sm">
          Teningve 7 2610 Rødovre Tlf 70228288 info@boligmatch.dk CVR 33160437
        </p>
      </div>
    </div>
  );
}

export default ParentSteperPara;
