import React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

test('renders learn react link', () => {
  render(<App {...{MYAPP_API_ENDPOINT:"test"}}/>);
  const linkElement = screen.getByText(/You have configured test/i);
  expect(linkElement).toBeInTheDocument();
});
