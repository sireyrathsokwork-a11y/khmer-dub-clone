import { render, screen, waitFor } from '@testing-library/react';
import DownloadButton from '../components/DownloadButton';
import userEvent from '@testing-library/user-event';

describe('DownloadButton', () => {
  it('Test if button is visible on Dom', () => {
    render(<DownloadButton videoUrl="https://video.com" />);

    expect(
      screen.getByRole('button', { name: /download dubbed video/i })
    ).toBeInTheDocument();
  });

  it('Test if button is enabled', () => {
    render(<DownloadButton videoUrl="https://video.com" />);

    expect(
      screen.getByRole('button', { name: /download dubbed video/i })
    ).toBeEnabled();
  });

  it('button is disabled after user clicked', async () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<DownloadButton videoUrl="https://video.com" />);
    const user = userEvent.setup();
    const downloadButton = screen.getByRole('button', {
      name: /download dubbed video/i,
    });
    await user.click(downloadButton);
    await waitFor(() => expect(downloadButton).toBeDisabled());
  });

  it('shows download progress while downloading', async () => {
    const user = userEvent.setup();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      statusText: 'OK',
      headers: new Headers({ 'Content-Length': '100' }),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(50));
          controller.close();
        },
      }),
    } as any);

    render(<DownloadButton videoUrl="https://video.com" />);
    const button = screen.getByRole('button', {
      name: /download dubbed video/i,
    });
    await user.click(button);

    await waitFor(() =>
      expect(button).toHaveTextContent(/download dubbed video/i)
    );
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('display error message', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
    render(<DownloadButton videoUrl="https//vidio.com" />);

    const button = screen.getByRole('button', {
      name: /download dubbed video/i,
    });
    await user.click(button);

    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    );
  });
});
