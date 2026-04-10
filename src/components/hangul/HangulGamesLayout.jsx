import React from 'react';
import { Outlet } from 'react-router-dom';
import HangulGameBgm from './HangulGameBgm.jsx';

export default function HangulGamesLayout() {
  return (
    <>
      <HangulGameBgm />
      <Outlet />
    </>
  );
}
