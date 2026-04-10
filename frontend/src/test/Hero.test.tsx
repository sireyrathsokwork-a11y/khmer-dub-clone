import { render, screen } from '@testing-library/react';
import Hero from '../components/Hero';
import { userEvent } from '@testing-library/user-event';

describe('Hero', () => {
  it('render the heading', () => {
    render(<Hero onSubmit={() => {}} isProcessing={false} />);
    expect(screen.getByText('Khmer')).toBeInTheDocument();
  });

  it('button is disabled when input is empty', () => {
    render(<Hero onSubmit={() => {}} isProcessing={false} />);
    expect(screen.getByRole('button', { name: /dub now/i })).toBeDisabled();
  });

  it('enables button when url is typed', async () => {
    const user = userEvent.setup();
    render(<Hero onSubmit={() => {}} isProcessing={false} />);

    await user.type(
      screen.getByRole('textbox'),
      'https://youtube.com/watch?v=123'
    );

    expect(screen.getByRole('button', { name: /dub now/i })).toBeEnabled();
  });

  it('When hser clicks Dub Now , onSubmit should be called with the URL', async () => {
    const user = userEvent.setup();
    const onDub = vi.fn(() => {});
    render(<Hero onSubmit={onDub} isProcessing={false} />);

    await user.type(
      screen.getByRole('textbox'),
      'https://youtube.com/watch?v=123'
    );

    await user.click(screen.getByRole('button', { name: /dub now/i }));

    expect(onDub).toHaveBeenCalledWith('https://youtube.com/watch?v=123');
  });

  it('when isProccession is true, the input and button should be both be disabled', () => {
    render(<Hero onSubmit={() => {}} isProcessing={true} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled();
  });
});
