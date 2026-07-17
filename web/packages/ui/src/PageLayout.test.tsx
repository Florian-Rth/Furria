import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KkThemeProvider } from './KkThemeProvider';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
  it('renders header and content inside a single main landmark', () => {
    render(
      <KkThemeProvider>
        <PageLayout>
          <PageLayout.Header>
            <h1>Titel</h1>
          </PageLayout.Header>
          <PageLayout.Content>
            <p>Inhalt</p>
          </PageLayout.Content>
        </PageLayout>
      </KkThemeProvider>,
    );

    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByRole('heading', { level: 1, name: 'Titel' }));
    expect(main).toContainElement(screen.getByText('Inhalt'));
    expect(main.querySelector('header')).not.toBeNull();
  });
});
