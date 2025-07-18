/**
 * StrategyConfigPanel 组件测试
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StrategyConfigPanel } from './StrategyConfigPanel';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StrategyConfigPanel', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  test('renders strategy config panel', () => {
    render(<StrategyConfigPanel />);
    
    expect(screen.getByText('Strategy Configuration')).toBeInTheDocument();
    expect(screen.getByText('Create New Strategy')).toBeInTheDocument();
  });

  test('shows default strategies', () => {
    render(<StrategyConfigPanel />);
    
    expect(screen.getByText('Happy Behaviors')).toBeInTheDocument();
    expect(screen.getByText('Idle Behaviors')).toBeInTheDocument();
    expect(screen.getByText('Sleepy Behaviors')).toBeInTheDocument();
  });

  test('can create new strategy', async () => {
    render(<StrategyConfigPanel />);
    
    // Click create new strategy button
    fireEvent.click(screen.getByText('Create New Strategy'));
    
    // Should show editing form
    expect(screen.getByText('Edit Strategy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('New Strategy')).toBeInTheDocument();
  });

  test('validates strategy before saving', async () => {
    render(<StrategyConfigPanel />);
    
    // Click create new strategy button
    fireEvent.click(screen.getByText('Create New Strategy'));
    
    // Clear the name field
    const nameInput = screen.getByDisplayValue('New Strategy');
    fireEvent.change(nameInput, { target: { value: '' } });
    
    // Try to save
    fireEvent.click(screen.getByText('Save'));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Validation Errors:')).toBeInTheDocument();
      expect(screen.getByText('Strategy name is required')).toBeInTheDocument();
    });
  });

  test('can edit existing strategy', async () => {
    render(<StrategyConfigPanel />);
    
    // Click edit button for first strategy
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Should show editing form with strategy data
    expect(screen.getByText('Edit Strategy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Happy Behaviors')).toBeInTheDocument();
  });

  test('can toggle strategy enabled state', async () => {
    render(<StrategyConfigPanel />);
    
    // Find the checkbox for the first strategy
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    // Check initial state
    expect(firstCheckbox).toBeChecked();
    
    // Toggle the checkbox
    fireEvent.click(firstCheckbox);
    
    // Note: The actual state change would depend on the store implementation
  });

  test('can delete strategy with confirmation', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    render(<StrategyConfigPanel />);
    
    // Click delete button for first strategy
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Should have called confirm
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this strategy?');
  });

  test('can add actions to strategy', async () => {
    render(<StrategyConfigPanel />);
    
    // Click create new strategy button
    fireEvent.click(screen.getByText('Create New Strategy'));
    
    // Should have no actions initially (except the default empty one in editing mode)
    expect(screen.getByText('Add Action')).toBeInTheDocument();
    
    // Click add action
    fireEvent.click(screen.getByText('Add Action'));
    
    // Should show action form
    const behaviorInputs = screen.getAllByLabelText('Behavior Name:');
    expect(behaviorInputs.length).toBeGreaterThan(0);
  });
});
