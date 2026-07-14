/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Providers } from './app/providers';
import { AppRoutes } from './app/routes';

export default function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
