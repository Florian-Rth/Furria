import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAtRoute } from '@/test/render';

describe('SiteFooter', () => {
  it('links the legal pages at their English URLs with German labels', async () => {
    renderAtRoute('/imprint');
    const footer = await screen.findByRole('contentinfo');

    expect(within(footer).getByRole('link', { name: 'Impressum' })).toHaveAttribute(
      'href',
      '/imprint',
    );
    expect(within(footer).getByRole('link', { name: 'Datenschutz' })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  it('renders the brand lockup and the social links', async () => {
    renderAtRoute('/imprint');
    const footer = await screen.findByRole('contentinfo');

    expect(within(footer).getByText('FURRIA')).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'FURRIA auf Facebook' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'FURRIA auf Instagram' })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'FURRIA auf YouTube' })).toBeInTheDocument();
  });
});
