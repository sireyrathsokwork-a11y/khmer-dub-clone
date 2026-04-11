import { render, screen } from '@testing-library/react';
import TranscriptEditor from '../components/TranscriptEditor';
import type { Transcript } from '../types';
import userEvent from '@testing-library/user-event';

const transcript: Transcript = {
  english: 'Hello',
  khmer: 'សួស្ដី',
};

describe('TranscriptEditor', () => {
  describe('default rendering', () => {
    beforeEach(() => {
      render(
        <TranscriptEditor
          transcript={transcript}
          onKhmerChange={() => {}}
          onRegenerate={() => {}}
          isRegenerating={false}
        />
      );
    });

    it('renders the "Original (English)" and "Khmer Translation" labels', () => {
      expect(screen.getByText('Original (English)')).toBeInTheDocument();
      expect(screen.getByText('Khmer Translation')).toBeInTheDocument();
    });

    it('the English textarea displays the value passed in and is read-only', () => {
      const englishTextarea = screen.getByRole('textbox', {
        name: /Original \(English\)/i,
      });

      expect(englishTextarea).toBeInTheDocument();
      expect(englishTextarea).toHaveValue(transcript.english);
      expect(englishTextarea).toHaveAttribute('readonly');
    });

    it('the Khmer textarea displays the value passed in and is editable', () => {
      const khmerTextarea = screen.getByRole('textbox', {
        name: /Khmer Translation/i,
      });

      expect(khmerTextarea).toBeInTheDocument();
      expect(khmerTextarea).toHaveValue(transcript.khmer);
      expect(khmerTextarea).not.toHaveAttribute('readonly');
    });
  });

  it('typing in the Khmer textarea calls onKhmerChange with the new value', async () => {
    const user = userEvent.setup();
    const onKhmerChange = vi.fn();
    const newText = 'hello';

    render(
      <TranscriptEditor
        transcript={transcript}
        onKhmerChange={onKhmerChange}
        onRegenerate={() => {}}
        isRegenerating={false}
      />
    );

    await user.type(
      screen.getByRole('textbox', { name: /Khmer Translation/i }),
      newText
    );

    expect(onKhmerChange).toHaveBeenCalled();
  });

  it('clicking the button calls onRegenerate', async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();

    render(
      <TranscriptEditor
        transcript={transcript}
        onKhmerChange={() => {}}
        onRegenerate={onRegenerate}
        isRegenerating={false}
      />
    );

    await user.click(screen.getByRole('button', { name: /Regenerate Audio/i }));

    expect(onRegenerate).toHaveBeenCalledOnce();
  });

  it('when isRegenerating={true}, button is disabled and says "Regenerating..."', () => {
    render(
      <TranscriptEditor
        transcript={transcript}
        onKhmerChange={() => {}}
        onRegenerate={() => {}}
        isRegenerating={true}
      />
    );

    const button = screen.getByRole('button', { name: /Regenerating\.\.\./i });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Regenerating...');
  });

  it('when isRegenerating={false}, button is enabled and says "Regenerate Audio"', () => {
    render(
      <TranscriptEditor
        transcript={transcript}
        onKhmerChange={() => {}}
        onRegenerate={() => {}}
        isRegenerating={false}
      />
    );

    const button = screen.getByRole('button', { name: /Regenerate Audio/i });

    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Regenerate Audio');
  });
});
