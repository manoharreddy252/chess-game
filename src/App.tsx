import React, { useState } from 'react';

type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | null;
type PieceColor = 'white' | 'black';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type Board = (Piece | null)[][];

const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' }, { type: 'bishop', color: 'black' }, { type: 'knight', color: 'black' }, { type: 'rook', color: 'black' }
  ],
  Array(8).fill({ type: 'pawn', color: 'black' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'pawn', color: 'white' }),
  [
    { type: 'rook', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' }, { type: 'bishop', color: 'white' }, { type: 'knight', color: 'white' }, { type: 'rook', color: 'white' }
  ]
];

const pieceSymbols: { [key: string]: string } = {
  'white-king': '♔', 'white-queen': '♕', 'white-rook': '♖', 'white-bishop': '♗', 'white-knight': '♘', 'white-pawn': '♙',
  'black-king': '♚', 'black-queen': '♛', 'black-rook': '♜', 'black-bishop': '♝', 'black-knight': '♞', 'black-pawn': '♟'
};

function App() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>('white');
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        if (fromCol === toCol) {
          if (toRow === fromRow + direction && !board[toRow][toCol]) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[toRow][toCol]) return true;
        } else if (colDiff === 1 && toRow === fromRow + direction) {
          return !!board[toRow][toCol] && board[toRow][toCol]!.color !== piece.color;
        }
        return false;

      case 'rook':
        return (rowDiff === 0 || colDiff === 0) && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'bishop':
        return rowDiff === colDiff && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'queen':
        return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff) && isPathClear(fromRow, fromCol, toRow, toCol);

      case 'knight':
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

      case 'king':
        return rowDiff <= 1 && colDiff <= 1;

      default:
        return false;
    }
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    return true;
  };

  const getPossibleMoves = (row: number, col: number): [number, number][] => {
    const moves: [number, number][] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(row, col, r, c) && (!board[r][c] || board[r][c]!.color !== board[row][col]!.color)) {
          moves.push([r, c]);
        }
      }
    }
    return moves;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      
      if (row === selectedRow && col === selectedCol) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      if (possibleMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = newBoard[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }
    }

    const piece = board[row][col];
    if (piece && piece.color === currentPlayer) {
      setSelectedSquare([row, col]);
      setPossibleMoves(getPossibleMoves(row, col));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col];
    const isSelected = selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col;
    const isPossibleMove = possibleMoves.some(([r, c]) => r === row && c === col);
    const isWhiteSquare = (row + col) % 2 === 0;

    let className = `square ${isWhiteSquare ? 'white' : 'black'}`;
    if (isSelected) className += ' selected';
    if (isPossibleMove) className += ' possible-move';

    const getPieceClassName = (piece: Piece) => {
      let pieceClass = `piece ${piece.color}-piece ${piece.type}`;
      if (piece.type === 'pawn') {
        pieceClass += ` ${piece.color}-pawn`;
      }
      return pieceClass;
    };

    return (
      <div
        key={`${row}-${col}`}
        className={className}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && (
          <span className={getPieceClassName(piece)}>
            {pieceSymbols[`${piece.color}-${piece.type}`]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="chess-game">
      <h1>♔ Royal Chess ♛</h1>
      
      <div className="chess-board">
        {board.map((row, rowIndex) =>
          row.map((_, colIndex) => renderSquare(rowIndex, colIndex))
        )}
      </div>
      
      <div className="game-info">
        <div className="turn">
          Current Player: {currentPlayer === 'white' ? '♔ White Royalty' : '♛ Black Majesty'}
        </div>
        
        <div className="game-subtitle">
          Click a piece to see possible moves • Beautiful chess with royal pieces
        </div>
      </div>
      
      {/* Decorative floating pieces */}
      <div className="floating-piece top-left">♔</div>
      <div className="floating-piece top-right">♛</div>
      <div className="floating-piece bottom-left">♜</div>
      <div className="floating-piece bottom-right">♞</div>
    </div>
  );
}

export default App;