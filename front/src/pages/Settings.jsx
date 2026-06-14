import { useState } from 'react'
import AccountTab from './settings/AccountTab'
import IntegrationsTab from './settings/IntegrationsTab'
import './Settings.css'

const TABS = [
  { id: 'account',       label: 'Account' },
  { id: 'preferences',   label: 'Preferences' },
  { id: 'personalization', label: 'Personalization' },
  { id: 'privacy',       label: 'Privacy' },
  { id: 'appearance',    label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations',  label: 'Integrations' },
  { id: 'support',       label: 'Support' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account')

  return (
    <div className="settings-page">
      {/* Горизонтальные табы */}
      <div className="settings-tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="settings-content">
        {activeTab === 'account'          && <AccountTab />}
        {activeTab === 'preferences'      && <PreferencesTab />}
        {activeTab === 'personalization'  && <PersonalizationTab />}
        {activeTab === 'privacy'          && <PrivacyTab />}
        {activeTab === 'appearance'       && <AppearanceTab />}
        {activeTab === 'notifications'    && <NotificationsTab />}
        {activeTab === 'integrations'     && <IntegrationsTab />}
        {activeTab === 'support'          && <SupportTab />}
      </div>
    </div>
  )
}

function PreferencesTab() {
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Preferences</h3>
      <div className="settings-group">
        <label className="settings-label">Default view</label>
        <select className="settings-select">
          <option>Dashboard</option>
          <option>Courses</option>
          <option>Activities</option>
        </select>
      </div>
      <div className="settings-group">
        <label className="settings-label">AI Mode</label>
        <select className="settings-select">
          <option>Tutor Mode</option>
          <option>Study Buddy Mode</option>
        </select>
      </div>
      <div className="settings-group toggle-group">
        <div>
          <span className="settings-label">Show progress on Dashboard</span>
          <p className="settings-hint">Display course completion percentages</p>
        </div>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider" />
        </label>
      </div>
      <button className="btn-save">Save Preferences</button>
    </div>
  )
}

function PersonalizationTab() {
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Personalization</h3>
      <div className="settings-group toggle-group">
        <div>
          <span className="settings-label">Personalized recommendations</span>
          <p className="settings-hint">Show courses based on your activity</p>
        </div>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider" />
        </label>
      </div>
      <div className="settings-group toggle-group">
        <div>
          <span className="settings-label">Adaptive AI responses</span>
          <p className="settings-hint">AI adjusts complexity to your level</p>
        </div>
        <label className="toggle">
          <input type="checkbox" defaultChecked />
          <span className="toggle-slider" />
        </label>
      </div>
      <button className="btn-save">Save</button>
    </div>
  )
}

function PrivacyTab() {
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Privacy</h3>
      {[
        { label: 'Profile visibility', hint: 'Allow other students to see your profile', checked: true },
        { label: 'Activity history', hint: 'Let instructors see your activity log', checked: false },
        { label: 'Analytics sharing', hint: 'Help improve Inlithan Labs with usage data', checked: true },
      ].map(item => (
        <div key={item.label} className="settings-group toggle-group">
          <div>
            <span className="settings-label">{item.label}</span>
            <p className="settings-hint">{item.hint}</p>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked={item.checked} />
            <span className="toggle-slider" />
          </label>
        </div>
      ))}
      <div className="danger-zone">
        <h4 className="danger-title">Danger Zone</h4>
        <button className="btn-danger">Delete all my data</button>
      </div>
    </div>
  )
}

function AppearanceTab() {
  const [theme, setTheme] = useState('dark')
  const [lang, setLang] = useState('en')
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Appearance</h3>
      <div className="settings-group">
        <label className="settings-label">Theme</label>
        <div className="theme-options">
          {['dark', 'light'].map(t => (
            <button key={t} className={`theme-btn ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
              {t === 'dark' ? 'Dark' : 'Light'}
            </button>
          ))}
        </div>
      </div>
      <div className="settings-group">
        <label className="settings-label">Language</label>
        <select className="settings-select" value={lang} onChange={e => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="ru">Русский</option>
          <option value="kk">Қазақша</option>
        </select>
      </div>
      <button className="btn-save">Save Appearance</button>
    </div>
  )
}

function NotificationsTab() {
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Notifications</h3>
      {[
        { label: 'New course announcements', hint: 'When instructor posts an update' },
        { label: 'Activity reminders', hint: 'Reminders for upcoming quizzes' },
        { label: 'AI Lab responses', hint: 'When AI finishes a long response' },
        { label: 'Weekly progress report', hint: 'Summary of your week every Monday' },
      ].map(item => (
        <div key={item.label} className="settings-group toggle-group">
          <div>
            <span className="settings-label">{item.label}</span>
            <p className="settings-hint">{item.hint}</p>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider" />
          </label>
        </div>
      ))}
      <button className="btn-save">Save Notifications</button>
    </div>
  )
}

function SupportTab() {
  return (
    <div className="tab-section">
      <h3 className="tab-heading">Support</h3>
      <div className="support-links">
        {[
          { title: 'Documentation', desc: 'Guides and tutorials', href: '#' },
          { title: 'Report a bug', desc: 'Found something broken?', href: '#' },
          { title: 'Feature request', desc: 'Suggest an improvement', href: '#' },
          { title: 'Contact us', desc: 'inlithan@university.edu', href: '#' },
        ].map(item => (
          <a key={item.title} href={item.href} className="support-card">
            <div>
              <p className="support-title">{item.title}</p>
              <p className="settings-hint">{item.desc}</p>
            </div>
            <span className="support-arrow">›</span>
          </a>
        ))}
      </div>
      <p className="version-info">Inlithan Labs v1.0.0 — Diploma Project 2025</p>
    </div>
  )
}
