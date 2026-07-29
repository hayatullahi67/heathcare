import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReferral } from '../../context/ReferralContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ClipboardList,
  UserPlus,
  PlusCircle,
  History,
  Building2,
  Search,
  HelpCircle,
  LayoutDashboard,
  BriefcaseMedical
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children
}) => {
  const { currentUser, logout } = useAuth();
  const { getNotificationsForUser, markNotificationAsRead, clearNotifications, logActivity } = useReferral();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (currentUser) {
      logActivity('USER_LOGOUT', `Logged out of CareLink secure session.`);
    }
    logout();
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!currentUser) return null;

  const notifications = getNotificationsForUser();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearNotifications();
  };

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  // Determine Sidebar navigation items based on User Role
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        return [
          { id: 'overview', label: 'Overview', path: '/admin/overview', icon: <LayoutDashboard size={18} /> },
          { id: 'manage-users', label: 'Manage Users', path: '/admin/manage-users', icon: <UserPlus size={18} /> },
          { id: 'referrals', label: 'Referral Queue', path: '/admin/referrals', icon: <ClipboardList size={18} /> }
        ];
      case 'RETIRED_STAFF':
        return [
          { id: 'overview', label: 'Overview', path: '/staff/overview', icon: <LayoutDashboard size={18} /> },
          { id: 'new-request', label: 'Requests', path: '/staff/new-request', icon: <ClipboardList size={18} /> },
          { id: 'history', label: 'History', path: '/staff/history', icon: <History size={18} /> }
        ];
      case 'HOSPITAL':
        return [
          { id: 'incoming', label: 'Incoming Referrals', path: '/hospital/incoming', icon: <Building2 size={18} /> },
          { id: 'patient-care', label: 'Patient Care', path: '/hospital/patient-care', icon: <ClipboardList size={18} /> }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="dashboard-container">
      {/* Sidebar - Desktop */}
      <aside className="sidebar-desktop">
        <div className="sidebar-logo">
          <BriefcaseMedical className="sidebar-logo-icon" size={24} style={{ color: '#0ea5e9' }} />
          <div>
            <h1 className="sidebar-logo-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 800 }}>CareLink</h1>
            <p className="sidebar-logo-subtitle" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Precision Care</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.id}
              to={item.path!}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {currentUser.role === 'RETIRED_STAFF' && (
          <div className="sidebar-action-btn-container" style={{ padding: '0 1rem 1rem 1rem' }}>
            <Link
              to="/staff/new-request"
              className="btn btn-primary w-full flex align-center justify-center gap-2"
              style={{ display: 'flex', textDecoration: 'none', backgroundColor: '#005f73', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: 700 }}
            >
              <PlusCircle size={16} />
              <span>New Request</span>
            </Link>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="user-details">
              <p className="user-name">{currentUser.name}</p>
              <p className="user-role">
                {currentUser.role === 'SUPER_ADMIN'
                  ? 'Administrator'
                  : currentUser.role === 'RETIRED_STAFF'
                    ? 'Retired Staff'
                    : 'Hospital Partner'}
              </p>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div className={`sidebar-mobile-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)}>
        <aside className={`sidebar-mobile ${mobileMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-mobile-header">
            <div className="sidebar-logo">
              <BriefcaseMedical className="sidebar-logo-icon" size={24} style={{ color: '#0ea5e9' }} />
              <div>
                <h1 className="sidebar-logo-title" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 800 }}>CareLink</h1>
                <p className="sidebar-logo-subtitle" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>Precision Care</p>
              </div>
            </div>
            <button className="close-menu-btn" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path!}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {currentUser.role === 'RETIRED_STAFF' && (
            <div className="sidebar-action-btn-container" style={{ padding: '0 1rem 1rem 1rem' }}>
              <Link
                to="/staff/new-request"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary w-full flex align-center justify-center gap-2"
                style={{ display: 'flex', textDecoration: 'none', backgroundColor: '#005f73', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: 700 }}
              >
                <PlusCircle size={16} />
                <span>New Request</span>
              </Link>
            </div>
          )}

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="avatar">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="user-details">
                <p className="user-name">{currentUser.name}</p>
                <p className="user-role">
                  {currentUser.role === 'SUPER_ADMIN'
                    ? 'Administrator'
                    : currentUser.role === 'RETIRED_STAFF'
                      ? 'Retired Staff'
                      : 'Hospital Partner'}
                </p>
              </div>
            </div>

            <button onClick={handleLogout} className="logout-btn w-full">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="header-search-bar-wrapper" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.4rem 0.8rem', gap: '0.5rem', width: '280px' }}>
              <Search size={16} className="text-muted" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search patients or requests..."
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="header-right">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <div className="notification-wrapper">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <>
                  <div className="notification-dropdown-backdrop" onClick={() => setNotificationsOpen(false)} />
                  <div className="notification-dropdown glass-panel">
                    <div className="notif-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="mark-all-read">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="notif-body">
                      {notifications.length === 0 ? (
                        <p className="notif-empty">No notifications yet</p>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif.id)}
                          >
                            <div className="notif-bullet" />
                            <div className="notif-content">
                              <h4 className="notif-title">{notif.title}</h4>
                              <p className="notif-msg">{notif.message}</p>
                              <span className="notif-time">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Help Question Icon */}
            <button className="theme-toggle" aria-label="Help Resources" style={{ color: 'var(--text-secondary)' }}>
              <HelpCircle size={20} />
            </button>

            {/* User Profile display info */}
            <div className="header-user-tag" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-text-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className="header-user-name" style={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: '1.2' }}>
                  {currentUser.name}
                </span>
                <span className="header-user-role" style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {currentUser.role === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : currentUser.role === 'RETIRED_STAFF'
                      ? currentUser.department || 'Retired Staff'
                      : 'Clinic Specialist'}
                </span>
              </div>
              <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          <div className="fade-in">{children}</div>
        </main>
      </div>

      {/* Styled inline components styles specifically for layout dashboard */}
      <style>{`
        .sidebar-desktop {
          width: 280px;
          background-color: var(--bg-sidebar);
          color: var(--text-on-sidebar);
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 100;
        }

        .sidebar-logo {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-logo-icon {
          color: var(--primary);
        }

        .sidebar-logo-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-on-sidebar);
          margin: 0;
          letter-spacing: -0.025em;
        }

        .sidebar-logo-subtitle {
          font-size: 0.75rem;
          color: var(--text-on-sidebar-muted);
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-on-sidebar-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: left;
          transition: var(--transition);
        }

        .sidebar-nav-item:hover {
          color: var(--text-on-sidebar);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .sidebar-nav-item.active {
          color: white;
          background-color: var(--primary);
        }

        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: var(--primary);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          text-transform: uppercase;
        }

        .user-details {
          overflow: hidden;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-on-sidebar);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--text-on-sidebar-muted);
          margin: 0;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: transparent;
          color: var(--text-on-sidebar);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
        }

        /* Mobile layout drawer components */
        .sidebar-mobile-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .sidebar-mobile-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .sidebar-mobile {
          width: 280px;
          height: 100%;
          background-color: var(--bg-sidebar);
          color: var(--text-on-sidebar);
          display: flex;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .sidebar-mobile-overlay.open .sidebar-mobile {
          transform: translateX(0);
        }

        .sidebar-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .close-menu-btn {
          background: transparent;
          border: none;
          color: var(--text-on-sidebar-muted);
          padding: 1.5rem;
          cursor: pointer;
        }

        .sidebar-desktop {
          display: flex;
        }
        .mobile-toggle-btn {
          display: none;
        }
        .sidebar-mobile-overlay {
          display: none;
        }

        /* Main structure */
        .main-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          margin-left: 280px;
          overflow-y: auto;
        }

        .header {
          height: 72px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: none;
        }

        /* Media query overrides moved to bottom */

        .header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .theme-toggle {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle:hover {
          background-color: var(--bg-primary);
          color: var(--primary);
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-bell {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--radius-full);
          transition: var(--transition);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-bell:hover {
          background-color: var(--bg-primary);
          color: var(--primary);
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background-color: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-secondary);
        }

        .notification-dropdown-backdrop {
          position: fixed;
          inset: 0;
          z-index: 150;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          margin-top: 0.75rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          z-index: 200;
          display: flex;
          flex-direction: column;
        }

        .notif-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notif-header h3 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0;
        }

        .mark-all-read {
          font-size: 0.75rem;
          color: var(--primary);
          background: transparent;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .mark-all-read:hover {
          text-decoration: underline;
        }

        .notif-body {
          overflow-y: auto;
          max-height: 320px;
        }

        .notif-empty {
          padding: 2rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .notif-item {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          gap: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-item:hover {
          background-color: var(--bg-primary);
        }

        .notif-item.unread {
          background-color: var(--primary-lightest);
        }

        .notif-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--primary);
          margin-top: 4px;
          flex-shrink: 0;
          opacity: 0;
        }

        .notif-item.unread .notif-bullet {
          opacity: 1;
        }

        .notif-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .notif-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .notif-msg {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .notif-time {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .header-user-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border-color);
        }

        .header-user-tag .avatar {
          width: 32px;
          height: 32px;
          font-size: 0.8rem;
        }

        .header-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .header-search-bar-wrapper {
            display: none !important;
          }
          .user-text-info {
            display: none !important;
          }
          .header-user-tag {
            border-left: none;
            padding-left: 0;
          }
        }

        @media (max-width: 640px) {
          .header {
            padding: 0 1rem;
          }
        }

        .content-body {
          flex: 1;
          padding: 2rem;
          background-color: var(--bg-primary);
        }

        @media (max-width: 640px) {
          .content-body {
            padding: 1rem;
          }
        }

        /* Combined media query at bottom to guarantee correct cascade override */
        @media (max-width: 1024px) {
          .sidebar-desktop {
            display: none !important;
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
          }
          .sidebar-mobile-overlay {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
