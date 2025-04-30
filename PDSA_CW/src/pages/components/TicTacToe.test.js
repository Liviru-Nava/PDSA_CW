// components/GameBoard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameBoard from './GameBoard';

describe('GameBoard Component', () => {
  test('renders all cells in the board', () => {
    // Create a mock board (5x5)
    const mockBoard = Array(25).fill(null);
    const mockOnCellClick = jest.fn();
    
    render(<GameBoard board={mockBoard} onCellClick={mockOnCellClick} />);
    
    // Check if all cells are rendered
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(25);
  });
  
  test('clicking a cell calls onCellClick with the correct index', () => {
    const mockBoard = Array(25).fill(null);
    const mockOnCellClick = jest.fn();
    
    render(<GameBoard board={mockBoard} onCellClick={mockOnCellClick} />);
    
    // Click the first cell
    const cells = screen.getAllByRole('button');
    fireEvent.click(cells[0]);
    
    // Check if onCellClick was called with index 0
    expect(mockOnCellClick).toHaveBeenCalledWith(0);
  });
  
  test('renders X and O correctly', () => {
    // Create a board with some moves
    const mockBoard = Array(25).fill(null);
    mockBoard[0] = 'X';
    mockBoard[1] = 'O';
    
    render(<GameBoard board={mockBoard} onCellClick={jest.fn()} />);
    
    // Check if X and O are rendered
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });
});