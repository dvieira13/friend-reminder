import { useState } from "react";
import right_arrow from "./assets/right_arrow.svg";
import "./App.css";

function App() {

  const [powerBall, setPowerBall] = useState("");
  const [lotteryNumbers, setLotteryNumbers] = useState<(number | "")[]>(["", "", "", "", ""]);

  const generateSlip = async () => {
    try {
      const res = await fetch(
        `/api/generate-powerball-slip`
      );
      const data = await res.json();

      data.lottery_numbers.forEach((num: number, index: number) => {
        console.log(`Index ${index}: ${num}`);
      });


      setLotteryNumbers(data.lottery_numbers);
      setPowerBall(data.power_ball);
      console.log(data);
    } catch (err) {
      console.error("Error generating slip");
    }
  }

  return (
    <>
      <h1>Powerball</h1>

      <div className="powerball-container">
        <div className="powerball-row">
          {/* idx is arrayindex, could also use num */}
          {lotteryNumbers.slice(0, 3).map((num, idx) => (
            <div key={idx} className="ball">
              <p className="body-copy">{num}</p>
            </div>
          ))}
        </div>
        <div className="powerball-row">
          {lotteryNumbers.slice(3, 5).map((num, idx) => (
            <div key={idx} className="ball">
              <p className="body-copy">{num}</p>
            </div>
          ))}
        </div>
        <div className="powerball-row">
          <div className="powerball">
            <p className="body-copy">{powerBall}</p>
          </div>
        </div>
      </div>

      <button onClick={generateSlip} className="generate-button">
        Generate
      </button>
    </>
  );
}

export default App;
