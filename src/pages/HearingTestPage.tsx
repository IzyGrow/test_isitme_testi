import { HearingTest } from "@/components/HearingTest";
import { Footer } from "@/components/Footer";

const HearingTestPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <HearingTest onBackToIntro={() => (window.location.href = "/")} />
      </div>
      <Footer />
    </div>
  );
};

export default HearingTestPage;