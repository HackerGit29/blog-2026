import React, { useRef, useState } from 'react';
import { Box, Stack, Button as MuiButton, IconButton, Avatar } from '@mui/material';
import { Mail, Bell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { usePortfolioStore } from '../../store/portfolio';
import { useInboxStore } from '../../store/inbox';
import { optimizedAvatar } from '../../lib/optimizedUrl';
import { UserSettings } from './UserSettings';
import { NotificationCenter } from '../inbox/NotificationCenter';
import { MessageCenter } from '../inbox/MessageCenter';
import { UnreadBadge } from '../inbox/UnreadBadge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styled from 'styled-components';

const StyledLoginButton = styled.button`
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
  padding: 10px 20px;
  border-radius: 100px;
  background: #FFE213;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #000;
  text-transform: none;

  &:hover {
    background: #e6cc00;
  }

  svg {
    width: 34px;
    margin-left: 10px;
    transition: transform 0.3s ease-in-out;
  }

  &:hover svg {
    transform: translateX(5px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useProfile();
  const profile = usePortfolioStore((s) => s.profile);
  const notifUnread = useInboxStore((s) => s.notifUnread);
  const msgUnread = useInboxStore((s) => s.msgUnread);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(headerRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });

    const linkChildren = linksRef.current?.children;
    if (linkChildren?.length) {
      tl.from(linkChildren, {
        y: -10,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, "-=0.3");
    }

    const actionChildren = actionsRef.current?.children;
    if (actionChildren?.length) {
      tl.from(actionChildren, {
        x: 20,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, "-=0.4");
    }
  }, { scope: headerRef, dependencies: [] });

  return (
    <>
      <Box 
        component="header"
        ref={headerRef}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 4,
          mb: 3
        }}
      >
        <Stack ref={linksRef} direction="row" sx={{ gap: 5, alignItems: 'center', justifyContent: 'center', display: { xs: 'none', md: 'flex' }, flex: 2 }}>
        </Stack>

        <Stack ref={actionsRef} direction="row" sx={{ gap: 2, alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          {user && (
            <>
              <Magnetic magneticPull={0.3}>
                <IconButton
                  size="small"
                  aria-label="Messages"
                  sx={{ color: 'text.primary', display: { xs: 'none', sm: 'inline-flex' }, position: 'relative' }}
                  onClick={() => setMsgOpen(true)}
                >
                  <Mail size={22} />
                  <UnreadBadge count={msgUnread} />
                </IconButton>
              </Magnetic>
              <Magnetic magneticPull={0.3}>
                <IconButton
                  size="small"
                  aria-label="Notifications"
                  sx={{ color: 'text.primary', position: 'relative' }}
                  onClick={() => setNotifOpen(true)}
                >
                  <Bell size={22} />
                  <UnreadBadge count={notifUnread} />
                </IconButton>
              </Magnetic>
            </>
          )}

            {user && !loading ? (
             <Magnetic magneticPull={0.1}>
                <Avatar
                  src={optimizedAvatar(profile.avatarUrl, 80)}
                  alt={profile.name}
                  onClick={() => setSettingsOpen(true)}
                  slotProps={{ img: { loading: 'lazy' } }}
                  sx={{
                    width: 40, height: 40, cursor: 'pointer',
                    border: '2px solid', borderColor: 'primary.main',
                    '&:hover': { opacity: 0.8 }
                  }}
                />
             </Magnetic>
            ) : (
              <Magnetic magneticPull={0.3}>
                <StyledLoginButton onClick={() => navigate('/login')}>
                  Se connecter
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 74 74" height={34} width={34}>
                    <circle strokeWidth={3} stroke="black" r="35.5" cy={37} cx={37} />
                    <path fill="black" d="M25 35.5C24.1716 35.5 23.5 36.1716 23.5 37C23.5 37.8284 24.1716 38.5 25 38.5V35.5ZM49.0607 38.0607C49.6464 37.4749 49.6464 36.5251 49.0607 35.9393L39.5147 26.3934C38.9289 25.8076 37.9792 25.8076 37.3934 26.3934C36.8076 26.9792 36.8076 27.9289 37.3934 28.5147L45.8787 37L37.3934 45.4853C36.8076 46.0711 36.8076 47.0208 37.3934 47.6066C37.9792 48.1924 38.9289 48.1924 39.5147 47.6066L49.0607 38.0607Z" />
                  </svg>
                </StyledLoginButton>
              </Magnetic>
            )}


        </Stack>
      </Box>

      <UserSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <MessageCenter open={msgOpen} onClose={() => setMsgOpen(false)} />
    </>
  );
}
