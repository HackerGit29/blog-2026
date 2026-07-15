/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Providers } from './app/providers';
import { AppRoutes } from './app/routes';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <Providers>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Providers>
  );
}
