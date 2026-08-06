
import Image from "next/image";
import Link from "next/link";
import Spline from '@splinetool/react-spline/next';
// import Navbar from "./components/navbar";
import Cards from "./components/cards";
import Mainpageanimation from "./components/mainpageanimation";
import CardDemo from "../components/cards-demo-3";
import MyNavbar from "./components/navbar";
import AboutPage from "./components/about";
import CursorGrid from "../components/ui/CursorGrid";

export default function Home() {

  return (
    <>
      <div className="fixed inset-0 z-0">
        <CursorGrid
          cellSize={56}
          color="#ff6600"
          radius={160}
          falloff="smooth"
          holdTime={400}
          fadeDuration={800}
          lineWidth={1}
          maxOpacity={0.5}
          fillOpacity={0.05}
          gridOpacity={0.08}
          cellRadius={6}
          clickPulse
          pulseSpeed={600}
        />
      </div>

      <div className="relative z-10">
     <MyNavbar/>
      <section id="home">
      <div className="home justify-center items-center flex   h-[44vh] md:h-[80vh] w-full  mt-[30px] ">

        <Mainpageanimation/>

        {/* <div className="w-[50%] mr-[60px] h-[100vh] mt-[50px] hidden md:block"> <Spline
          scene="https://prod.spline.design/zVzvHoCYoxizr9X1/scene.splinecode"
        /> */}
        {/* </div> */}
      </div>
      </section>
      <div className="h-[50px] w-[146px] bg-black translate-x-[1300px] mt-[30px] translate-y-10 relative"></div>

      <section id="features">
      <Cards
        tittle="Annotate your documents w. ease"
        description="Highlight text or areas, listen with text-to-speech, and stay focused while reading."
        image="/gif/annotation.gif"
      />

      <Cards
        tittle="Take notes with a Notion-like editor"
        description="Write and edit notes easily with AI text completion and Markdown export."
        image="/gif/editor.gif"
      />

      <Cards
        tittle="Ask the chatbot anything PDF-related"
        description="Ask questions, get insights, and understand PDFs deeply through AI-powered conversation."
        image="/gif/chatbot.gif"
      />

      <Cards
        tittle="Generate flashcards effortlessly"
        description="Create smart flashcards, review key concepts, and get instant feedback while studying."
        image="/gif/flashcard.gif"
      />

      <Cards
        tittle="Collaborate with your team in real-time"
        description="Share updates instantly, comment on highlights, and work together seamlessly on documents."
        image="/gif/collab.gif"
      />
      </section>
      {/* <div className="mb-[50px]"></div>

       <CardDemo className="mt-[50px] z-50"/> */}
       <div className="mb-[100px]"></div>

       <AboutPage/>
      </div>
    </>
  );
}
