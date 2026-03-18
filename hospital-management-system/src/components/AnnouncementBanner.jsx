import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepage } from '../context/HomepageContext';

const AnnouncementBanner = () => {
    const { state, update } = useHomepage();
    const navigate = useNavigate();
    if (!state.showBanner) return null;

    return (
        <div style={{
            background: state.bannerBg || '#1e40af',
            color: 'white', padding: '10px 48px 10px 20px',
            textAlign: 'center', fontSize: '14px', fontWeight: '600',
            position: 'relative', zIndex: 9998,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
            <span>{state.bannerText}</span>
            {state.bannerLink && (
                <span onClick={() => navigate(state.bannerLink)} style={{
                    color: 'white', textDecoration: 'underline',
                    fontSize: '13px', opacity: 0.9, cursor: 'pointer',
                }}>Learn More →</span>
            )}
            <button onClick={() => update('showBanner', false)} style={{
                position: 'absolute', right: '14px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'white',
                fontSize: '18px', cursor: 'pointer', opacity: 0.8, lineHeight: 1,
            }}>✕</button>
        </div>
    );
};

export default AnnouncementBanner;