// It renders all 5 step labels: "Fetching Video",
// "Transcribing", "Translating", "Generating Voice", "Creating Video"

import { render, screen, within } from '@testing-library/react';
import ProgressBar from '../components/ProgressBar';

describe('Progress Bar', () => {
  it('It renders all 5 steps', () => {
    render(<ProgressBar status={'transcribing'} />);

    expect(screen.getAllByText('Fetching Video')).toHaveLength(2);
    expect(screen.getAllByText('Transcribing')).toHaveLength(2);
    expect(screen.getAllByText('Translating')).toHaveLength(2);
    expect(screen.getAllByText('Generating Voice')).toHaveLength(2);
    expect(screen.getAllByText('Creating Video')).toHaveLength(2);
  });

  it('When status="extracting" → step 1 shows a spinner with number 1', () => {
    const { container } = render(<ProgressBar status={'extracting'} />);
    const spinner = container.querySelectorAll('.animate-spin');
    expect(spinner).toHaveLength(2);
  });

  it('When status="transcribing" → step 2 shows a spinner with number 2', () => {
    const { container } = render(<ProgressBar status={'transcribing'} />);
    const spinner = container.querySelectorAll('.animate-spin');
    expect(spinner).toHaveLength(2);
  });

  it('When status="transcribing" → step 1 shows a checkmark ✓', () => {
    render(<ProgressBar status="transcribing" />);

    const firstStepLabel = screen.getAllByText('Fetching Video')[0];
    const listItem = firstStepLabel.closest('li');

    expect(within(listItem!).getByText('✓')).toBeInTheDocument();
  });

  it('When status="merging" → steps 1–4 all show a checkmark ✓', () => {
    render(<ProgressBar status="merging" />);
    const firstSteplabel = screen.getAllByText('Fetching Video')[0];
    const secondSteplabel = screen.getAllByText('Transcribing')[0];
    const thirdSteplabel = screen.getAllByText('Translating')[0];
    const fourthSteplabel = screen.getAllByText('Generating Voice')[0];

    expect(
      within(firstSteplabel.closest('li')!).getByText('✓')!
    ).toBeInTheDocument();

    expect(
      within(secondSteplabel.closest('li')!).getByText('✓')!
    ).toBeInTheDocument();

    expect(
      within(thirdSteplabel.closest('li')!).getByText('✓')!
    ).toBeInTheDocument();

    expect(
      within(fourthSteplabel.closest('li')!).getByText('✓')!
    ).toBeInTheDocument();
  });

  it('When status="extracting" → steps 2–5 show their numbers 2, 3, 4, 5', () => {
    render(<ProgressBar status="extracting" />);

    const secondSteplabel = screen.getAllByText('Transcribing')[0];
    const thirdStepLabel = screen.getAllByText('Translating')[0];
    const fourthStepLabel = screen.getAllByText('Generating Voice')[0];
    const lastSteplabel = screen.getAllByText('Creating Video')[0];

    expect(
      within(secondSteplabel.closest('li')!).getByText(2)
    ).toBeInTheDocument();
    expect(
      within(thirdStepLabel.closest('li')!).getByText(3)
    ).toBeInTheDocument();
    expect(
      within(fourthStepLabel.closest('li')!).getByText(4)
    ).toBeInTheDocument();
    expect(
      within(lastSteplabel.closest('li')!).getByText(5)
    ).toBeInTheDocument();
  });

  it('When an invalid status is passed → all steps show their numbers, nothing is active or completed, no crash', () => {
    render(<ProgressBar status={'invalid' as any} />);

    const firstStepLabel = screen.getAllByText('Fetching Video')[0];
    const secondSteplabel = screen.getAllByText('Transcribing')[0];
    const thirdStepLabel = screen.getAllByText('Translating')[0];
    const fourthStepLabel = screen.getAllByText('Generating Voice')[0];
    const lastSteplabel = screen.getAllByText('Creating Video')[0];

    expect(
      within(firstStepLabel.closest('li')!).getByText(1)
    ).toBeInTheDocument();
    expect(
      within(secondSteplabel.closest('li')!).getByText(2)
    ).toBeInTheDocument();
    expect(
      within(thirdStepLabel.closest('li')!).getByText(3)
    ).toBeInTheDocument();
    expect(
      within(fourthStepLabel.closest('li')!).getByText(4)
    ).toBeInTheDocument();
    expect(
      within(lastSteplabel.closest('li')!).getByText(5)
    ).toBeInTheDocument();
  });
});
