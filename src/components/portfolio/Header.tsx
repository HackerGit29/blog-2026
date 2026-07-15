import React, { useRef, useState } from 'react';
import { Box, Stack, Button, IconButton, Avatar } from '@mui/material';
import { Mail, Bell, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Magnetic } from './Magnetic';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { usePortfolioStore } from '../../store/portfolio';
import { useInboxStore } from '../../store/inbox';
import { UserSettings } from './UserSettings';
import { NotificationCenter } from '../inbox/NotificationCenter';
import { MessageCenter } from '../inbox/MessageCenter';
import { UnreadBadge } from '../inbox/UnreadBadge';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        ease: 'power2.out'
      }, "-=0.4");
    }
  }, { scope: headerRef });

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
                src={profile.avatarUrl}
                alt={profile.name}
                onClick={() => setSettingsOpen(true)}
                sx={{
                  width: 40, height: 40, cursor: 'pointer',
                  border: '2px solid', borderColor: 'primary.main',
                  '&:hover': { opacity: 0.8 }
                }}
              />
            </Magnetic>
          ) : (
            <Magnetic magneticPull={0.1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<LogIn size={18} />}
                onClick={() => navigate('/login')}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  px: 3, py: 1, ml: 1
                }}
              >
                Se connecter
              </Button>
            </Magnetic>
          )}
        </Stack>
      </Box>

      {settingsOpen && <UserSettings onClose={() => setSettingsOpen(false)} />}
      <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
      <MessageCenter open={msgOpen} onClose={() => setMsgOpen(false)} />
    </>
  );
}
