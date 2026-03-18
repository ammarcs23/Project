import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHomepage } from '../context/HomepageContext';

const AnnouncementPopup = () => {
    const { state } = useHomepage();
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (state.showPopup) {
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, [state.showPopup]);

    if (!visible || !state.showPopup) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.3s ease',
        }}
            onClick={() => setVisible(false)}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'white', borderRadius: 20, maxWidth: 460, width: '100%',
                    overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
                    animation: 'slideUp 0.4s ease',
                }}
            >
                {/* Header */}
                <div style={{
                    background: state.popupBg || '#0d4f4f',
                    padding: '28px 28px 20px',
                    position: 'relative',
                }}>
                    <button onClick={() => setVisible(false)} style={{
                        position: 'absolute', top: 14, right: 14,
                        background: 'rgba(255,255,255,0.2)', border: 'none',
                        color: 'white', borderRadius: '50%', width: 30, height: 30,
                        cursor: 'pointer', fontSize: 16, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>✕</button>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🏥</div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: 20, lineHeight: 1.3 }}>
                        {state.popupTitle}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '22px 28px 28px' }}>
                    <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                        {state.popupText}
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            onClick={() => { setVisible(false); navigate(state.bannerLink || '/book-appointment'); }}
                            style={{
                                flex: 1, padding: '12px', border: 'none', borderRadius: 12,
                                background: `linear-gradient(120deg, ${state.popupBg || '#0d4f4f'}, #14b8a6)`,
                                color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                            }}
                        >{state.popupBtn || 'Book Now'}</button>
                        <button
                            onClick={() => setVisible(false)}
                            style={{
                                padding: '12px 20px', border: '2px solid #e2e8f0',
                                borderRadius: 12, background: 'white', color: '#64748b',
                                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            }}
                        >Maybe Later</button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
                @keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
            `}</style>
        </div>
    );
};

export default AnnouncementPopup;