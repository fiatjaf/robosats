import React, { useContext, useEffect, useState } from 'react';
import { MemoryRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, Slide, Typography, styled } from '@mui/material';
import { type UseAppStoreType, AppContext, closeAll } from '../contexts/AppContext';

import { RobotPage, MakerPage, BookPage, OrderPage, SettingsPage, NavBar, MainDialogs } from './';
import RobotAvatar from '../components/RobotAvatar';
import Notifications from '../components/Notifications';

import { useTranslation } from 'react-i18next';
import { FederationContext, type UseFederationStoreType } from '../contexts/FederationContext';
import { GarageContext, type UseGarageStoreType } from '../contexts/GarageContext';

const Router = window.NativeRobosats === undefined ? BrowserRouter : MemoryRouter;

const TestnetTypography = styled(Typography)({
  height: 0,
});

interface MainBoxProps {
  navbarHeight: number;
}

const MainBox = styled(Box)<MainBoxProps>((props) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%) translate(0,  -${props.navbarHeight / 2}em)`,
}));

const Main: React.FC = () => {
  const { t } = useTranslation();
  const { settings, page, slideDirection, setOpen, windowSize, navbarHeight, hostUrl } =
    useContext<UseAppStoreType>(AppContext);
  const { federation, sortedCoordinators } = useContext<UseFederationStoreType>(FederationContext);
  const { garage } = useContext<UseGarageStoreType>(GarageContext);
  const [avatarBaseUrl, setAvatarBaseUrl] = useState<string>(hostUrl);

  useEffect(() => {
    setAvatarBaseUrl(federation.getCoordinator(sortedCoordinators[0]).getBaseUrl());
  }, [settings.network, settings.selfhostedClient, federation, sortedCoordinators]);

  const onLoad = (): void => {
    garage.updateSlot({ avatarLoaded: true });
  };

  return (
    <Router>
      <RobotAvatar
        style={{ display: 'none' }}
        nickname={garage.getSlot()?.getRobot()?.nickname}
        baseUrl={federation.getCoordinator(sortedCoordinators[0]).getBaseUrl()}
        onLoad={onLoad}
      />
      <Notifications
        page={page}
        openProfile={() => {
          setOpen({ ...closeAll, profile: true });
        }}
        rewards={garage.getSlot()?.getRobot()?.earnedRewards}
        windowWidth={windowSize?.width}
      />
      {settings.network === 'testnet' ? (
        <TestnetTypography color='secondary' align='center'>
          <i>{t('Using Testnet Bitcoin')}</i>
        </TestnetTypography>
      ) : (
        <></>
      )}

      <MainBox navbarHeight={navbarHeight}>
        <Routes>
          {['/robot/:token?', '/', ''].map((path, index) => {
            return (
              <Route
                path={path}
                element={
                  <Slide
                    direction={page === 'robot' ? slideDirection.in : slideDirection.out}
                    in={page === 'robot'}
                    appear={slideDirection.in !== undefined}
                  >
                    <div>
                      <RobotPage avatarBaseUrl={avatarBaseUrl} />
                    </div>
                  </Slide>
                }
                key={index}
              />
            );
          })}

          <Route
            path={'/offers'}
            element={
              <Slide
                direction={page === 'offers' ? slideDirection.in : slideDirection.out}
                in={page === 'offers'}
                appear={slideDirection.in !== undefined}
              >
                <div>
                  <BookPage />
                </div>
              </Slide>
            }
          />

          <Route
            path='/create'
            element={
              <Slide
                direction={page === 'create' ? slideDirection.in : slideDirection.out}
                in={page === 'create'}
                appear={slideDirection.in !== undefined}
              >
                <div>
                  <MakerPage />
                </div>
              </Slide>
            }
          />

          <Route
            path='/order/:shortAlias/:orderId'
            element={
              <Slide
                direction={page === 'order' ? slideDirection.in : slideDirection.out}
                in={page === 'order'}
                appear={slideDirection.in !== undefined}
              >
                <div>
                  <OrderPage />
                </div>
              </Slide>
            }
          />

          <Route
            path='/settings'
            element={
              <Slide
                direction={page === 'settings' ? slideDirection.in : slideDirection.out}
                in={page === 'settings'}
                appear={slideDirection.in !== undefined}
              >
                <div>
                  <SettingsPage />
                </div>
              </Slide>
            }
          />
        </Routes>
      </MainBox>
      <NavBar />
      <MainDialogs />
    </Router>
  );
};

export default Main;
