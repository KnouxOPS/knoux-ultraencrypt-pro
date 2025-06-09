import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StyledButton from '../StyledButton';
import { AppProvider } from '../../../contexts/AppContext';

test('renders children and handles onClick', async () => {
  const handleClick = jest.fn();
  render(
    <AppProvider>
      <StyledButton onClick={handleClick}>Click me</StyledButton>
    </AppProvider>
  );

  const button = screen.getByRole('button', { name: /click me/i });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
