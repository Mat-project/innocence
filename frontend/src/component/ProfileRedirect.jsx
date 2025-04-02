import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * This component handles smart profile routing:
 * 1. If accessing /profile directly → redirect to /{username}
 * 2. If username in URL matches current user → show personal profile view
 * 3. If username is different → show public profile view
 */
export default function ProfileRedirect({ children }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (isLoading || redirected) return;
    if (user?.username) {
      // If no username param or it equals "profile", redirect to "/currentUser"
      if (!username || username === 'profile') {
        if (location.pathname !== `/${user.username}`) {
          setRedirected(true);
          navigate(`/${user.username}`, { replace: true });
        }
      }
      // Otherwise, if a username exists and does not match current user, do nothing.
    }
  }, [username, user, isLoading, navigate, location.pathname, redirected]);

  return children;
}
