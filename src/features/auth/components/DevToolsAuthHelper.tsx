'use client';

import { useEffect } from 'react';

/**
 * Хук/компонент для разработчиков и администраторов.
 * Регистрирует в глобальном объекте window функции admin() и login() для входа в админку через консоль DevTools (F12).
 */
export function DevToolsAuthHelper() {
  useEffect(() => {
    // 1. Команда перехода на страницу авторизации администратора
    const openAdminLogin = () => {
      console.log(
        '%c[Label System] 🚀 Переход на страницу авторизации администратора...',
        'color: #2563eb; font-weight: bold; font-size: 12px;'
      );
      window.location.href = '/login?admin=1';
      return 'Переход на /login?admin=1...';
    };

    // 2. Команда прямого быстрого входа в админку
    const quickAdminLogin = async (password = 'admin123') => {
      console.log(
        '%c[Label System] 🔑 Выполняется вход под администратором...',
        'color: #059669; font-weight: bold; font-size: 12px;'
      );
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: 'admin', password }),
        });
        const data = await res.json();
        if (data.success) {
          console.log(
            '%c[Label System] ✅ Успешно! Переход в панель администратора...',
            'color: #059669; font-weight: bold; font-size: 12px;'
          );
          window.location.href = '/admin/templates';
        } else {
          console.error('[Label System] ❌ Ошибка входа:', data.error);
        }
      } catch (err) {
        console.error('[Label System] ❌ Сбой сетевого запроса:', err);
      }
      return 'Вход выполняется...';
    };

    // Регистрируем глобальные функции в window
    const win = window as any;
    win.admin = openAdminLogin;
    win.login = openAdminLogin;
    win.adminLogin = openAdminLogin;
    win.quickAdmin = quickAdminLogin;

    // Выводим сервисную подсказку в консоль разработчика
    console.log(
      '%c🏷️ Label Print System %c• Панель разработчика\n' +
      '%cДля перехода к авторизации администратора введите команду:\n' +
      '%c  admin()  %cили  %clogin()\n' +
      '%c(быстрый вход в админку: %cquickAdmin()%c)',
      'color: #2563eb; font-weight: 800; font-size: 13px;',
      'color: #64748b; font-size: 11px;',
      'color: #334155; font-size: 12px; font-weight: 500;',
      'color: #e11d48; font-weight: 700; background: #ffe4e6; padding: 2px 6px; border-radius: 4px; font-family: monospace;',
      'color: #64748b; font-size: 11px;',
      'color: #e11d48; font-weight: 700; background: #ffe4e6; padding: 2px 6px; border-radius: 4px; font-family: monospace;',
      'color: #94a3b8; font-size: 10px;',
      'color: #059669; font-weight: 700; font-family: monospace;',
      'color: #94a3b8; font-size: 10px;'
    );

    return () => {
      delete win.admin;
      delete win.login;
      delete win.adminLogin;
      delete win.quickAdmin;
    };
  }, []);

  return null;
}
