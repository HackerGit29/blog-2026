import React from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useFollowUser, useIsFollowing } from '../../hooks/useFollowers';
import { useNavigate } from 'react-router-dom';

interface FollowButtonProps {
  targetUsername: string;
  isOwnProfile: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined';
}

export function FollowButton({
  targetUsername,
  isOwnProfile,
  size = 'large',
  variant = 'contained',
}: FollowButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isFollowing } = useIsFollowing(
    !isOwnProfile && user ? targetUsername : undefined
  );
  const { follow, unfollow } = useFollowUser();

  if (isOwnProfile) {
    return null;
  }

  if (!user) {
    return (
      <Button
        variant={variant}
        color="primary"
        size={size}
        onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
        sx={{ px: 5, py: 1.2 }}
      >
        Suivre
      </Button>
    );
  }

  const handleClick = () => {
    if (isFollowing) {
      unfollow.mutate(targetUsername);
    } else {
      follow.mutate(targetUsername);
    }
  };

  return (
    <Button
      variant={isFollowing ? 'outlined' : variant}
      color="primary"
      size={size}
      onClick={handleClick}
      sx={{ px: 5, py: 1.2 }}
    >
      {isFollowing ? 'Suivi' : 'Suivre'}
    </Button>
  );
}
