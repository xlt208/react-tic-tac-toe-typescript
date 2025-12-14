import {
  CalciteBlock,
  CalciteBlockGroup,
  CalciteButton,
  CalciteList,
  CalciteListItem,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteNotice,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel,
} from "@esri/calcite-components-react";
import { useState } from "react";

type Player = "X" | "O" | null;

interface SquareProps {
  value: Player;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <div className="square-wrapper">
      <CalciteButton
        appearance="transparent"
        width="full"
        onClick={onSquareClick}
      >
        {value}
      </CalciteButton>
    </div>
  );
}

function calculateWinner(squares: Player[]): Player {
  const sideLength = Math.sqrt(squares.length);

  const lines: number[][] = [];

  for (let row = 0; row < sideLength; row++) {
    lines.push(
      Array.from({ length: sideLength }, (_, c) => row * sideLength + c)
    );
  }
  for (let col = 0; col < sideLength; col++) {
    lines.push(
      Array.from({ length: sideLength }, (_, r) => r * sideLength + col)
    );
  }
  lines.push(Array.from({ length: sideLength }, (_, i) => i * sideLength + i));
  lines.push(
    Array.from({ length: sideLength }, (_, i) => (i + 1) * sideLength - (i + 1))
  );
  for (const line of lines) {
    const [first, ...rest] = line;
    if (
      squares[first] &&
      rest.every((idx) => squares[idx] === squares[first])
    ) {
      return squares[first];
    }
  }

  return null;
}

interface BoardProps {
  sideLength: number;
  xIsNext: boolean;
  squares: Player[];
  onPlay: (nextSquares: Player[]) => void;
}

function Board({ sideLength, xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: number) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  const rows = [];
  for (let i = 0; i < sideLength; i++) {
    const row = [];
    for (let j = 0; j < sideLength; j++) {
      const squareIndex = i * sideLength + j;
      row.push(
        <Square
          key={squareIndex}
          value={squares[squareIndex]}
          onSquareClick={() => handleClick(squareIndex)}
        />
      );
    }
    rows.push(
      <div key={i} className="board-row">
        {row}
      </div>
    );
  }
  return (
    <CalciteBlockGroup>
      <CalciteBlock heading="Status" expanded>
        <CalciteNotice open kind={winner ? "success" : "info"} width="full">
          <div slot="message">{status}</div>
        </CalciteNotice>
      </CalciteBlock>
      <CalciteBlock heading="Board" expanded>
        {rows}
      </CalciteBlock>
    </CalciteBlockGroup>
  );
}

export default function Game({ sideLength = 4 }) {
  const [history, setHistory] = useState<Player[][]>([
    Array(sideLength * sideLength).fill(null),
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: Player[]) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move: number) {
    setCurrentMove(move);
  }

  const moves = history.map((_, move) => {
    const label = move ? `Move ${move}` : "Game start";
    const description = move
      ? move === currentMove
        ? "You are here"
        : `Go to move # ${move}`
      : "Go to game start";
    return (
      <CalciteListItem
        key={move}
        label={label}
        description={description}
        selected={move === currentMove}
        onClick={move === currentMove ? undefined : () => jumpTo(move)}
      />
    );
  });

  return (
    <CalciteShell>
      <CalciteNavigation slot="header">
        <CalciteNavigationLogo
          heading="Tic-Tac-Toe Game"
          heading-level="1"
          slot="logo"
        />
      </CalciteNavigation>

      <CalciteShellPanel
        width="l"
        slot="panel-start"
        position="start"
        resizable
      >
        <CalcitePanel heading="Game Board">
          <Board
            sideLength={sideLength}
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
          />
        </CalcitePanel>
      </CalciteShellPanel>
      <CalciteShellPanel width="l" slot="panel-start" position="end">
        <CalcitePanel heading="Game Info">
          <CalciteList>{moves}</CalciteList>
        </CalcitePanel>
      </CalciteShellPanel>
    </CalciteShell>
  );
}
