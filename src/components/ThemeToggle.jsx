import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
    const [temaOscuro, setTemaOscuro] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            setTemaOscuro(false);
        } else {
            document.body.classList.remove('light-theme');
            setTemaOscuro(true);
        }
    }, []);

    const toggleTheme = () => {
        if (temaOscuro) {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            setTemaOscuro(false);
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            setTemaOscuro(true);
        }
    };

    return (
        <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={temaOscuro ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
        >
            {temaOscuro ? '☀️' : '🌙'}
        </button>
    );
};
