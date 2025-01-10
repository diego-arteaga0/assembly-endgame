import { useState } from "react";
import "./App.css";
import { languages } from "./languages.js";
import { clsx } from "clsx";
import { getFarewellText, getRandomWord } from "./util.js";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import ReactRain from "react-rain-animation";
import "react-rain-animation/lib/style.css";

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());

  const [guessedLetters, setGuessedLetters] = useState([]);

  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  const numGuessesLeft = languages.length - 1;

  const { width, height } = useWindowSize();

  const wrongGuessCount = guessedLetters.filter(
    (letter) => !currentWord.includes(letter)
  ).length;

  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetters.includes(letter));

  const isGameLost = wrongGuessCount >= numGuessesLeft;

  const isGameOver = isGameWon || isGameLost;

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1];

  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  function addGuessedLetter(letter) {
    setGuessedLetters((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  const langElements = languages.map((lang, index) => (
    <span
      key={lang.name}
      className={index < wrongGuessCount ? "chip lost" : "chip"}
      style={{
        backgroundColor: lang.backgroundColor,
        color: lang.color,
      }}
    >
      {lang.name}
    </span>
  ));

  const wordElements = [...currentWord].map((char, index) => {
    const isGuessed = guessedLetters.includes(char);
    const letterClassName = clsx(
      isGameLost && !guessedLetters.includes(char) && "missed-letter"
    );
    return (
      <span className={letterClassName} key={index}>
        {isGuessed || isGameLost ? char.toUpperCase() : ""}
      </span>
    );
  });

  const keyboardElements = alphabet.split("").map((letter) => {
    const isGuessed = guessedLetters.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });
    return (
      <button
        key={letter}
        disabled={isGameOver}
        aria-disabled={guessedLetters.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => addGuessedLetter(letter)}
        className={className}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: isLastGuessIncorrect && !isGameOver,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }

    if (isGameWon) {
      return (
        <>
          <h2>You Win!</h2>
          <p>Well done! 🎉</p>
        </>
      );
    }
    if (isGameLost) {
      return (
        <>
          <h2>Game over!</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      );
    }
    return null;
  }

  function resetGame() {
    setCurrentWord(getRandomWord);
    setGuessedLetters([]);
  }

  //main return
  return (
    <main>
      {isGameWon && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={1000}
        />
      )}
      {isGameLost && <ReactRain numDrops="250" />}
      <header className="header">
        <h1>Assembly: Endgame</h1>
        <p>
          Guess the word in under 8 attempts to keep the programming world safe
          from Assembly!
        </p>
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="language-chips">{langElements}</section>

      <section className="word">{wordElements}</section>

      <section aria-live="polite" role="status" className="sr-only">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not in the word.`}
          You have {numGuessesLeft} attempts left.
        </p>

        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetters.includes(letter) ? letter + "." : "blank."
            )
            .join(" ")}
        </p>
      </section>

      <section className="keyboard">{keyboardElements}</section>
      {isGameOver && (
        <button className="new-game" onClick={resetGame}>
          New Game
        </button>
      )}
    </main>
  );
}
