import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_DURATION = 3 * 60 * 1000; // 3 menit dalam milliseconds

export const useAutoLogout = () => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    window.location.reload();
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const token = localStorage.getItem('token');
    if (token) {
      timerRef.current = setTimeout(() => {
        handleLogout();
      }, TIMEOUT_DURATION);
    }
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Events yang akan mereset timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'keypress'];

    // Reset timer saat ada user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start timer awal
    resetTimer();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return null;
};
