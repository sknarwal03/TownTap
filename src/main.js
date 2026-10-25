import './style.css';
import './app.css';
import QRCode from 'qrcode';
import { onAuthStateChanged } from 'firebase/auth';
import { getBytes, ref, uploadBytes } from 'firebase/storage';
import { auth, firebaseIsEmulated, firebaseLiveDevBlocked, firebaseReadyForApp, storage } from './firebase.js';
import { confirmPhoneCode, requestPhoneCode, signOutTownTap } from './auth.js';
import { callTownTap } from './services.js';

const navigation = [
  { id: 'home', en: 'Home', hi: 'होम', icon: '⌂', route: 'home' },
  { id: 'saved', en: 'Saved', hi: 'सेव किए', icon: '♡', route: 'saved-contacts' },
  { id: 'discover', en: 'Discover', hi: 'खोजें', icon: '⌕', route: 'discover' },
  { id: 'cards', en: 'My Cards', hi: 'मेरे कार्ड', icon: '▤', route: 'my-cards' },
  { id: 'profile', en: 'Profile', hi: 'प्रोफ़ाइल', icon: '○', route: 'settings' },
];

const screens = [
  ['welcome', 'Welcome', 'स्वागत है'],
  ['home', 'Home', 'होम'],
  ['my-cards', 'My Cards', 'मेरे कार्ड'],
  ['card-editor', 'Card Editor', 'कार्ड एडिटर'],
  ['public-card', 'Public Card', 'पब्लिक कार्ड'],
  ['saved-contacts', 'Saved Contacts', 'सेव किए संपर्क'],
  ['saved-detail', 'Saved Detail', 'सेव किया संपर्क'],
  ['discover', 'Discover', 'खोजें'],
  ['business-detail', 'Business Detail', 'व्यवसाय विवरण'],
  ['business-studio', 'Business Studio', 'बिज़नेस स्टूडियो'],
  ['settings', 'Settings', 'सेटिंग्स'],
  ['admin', 'Admin', 'एडमिन'],
];

const fieldList = [
  ['displayName', 'Display name', 'नाम'], ['headline', 'Headline', 'परिचय'],
  ['category', 'Category', 'श्रेणी'], ['city', 'City', 'शहर'],
  ['phone', 'Phone', 'फ़ोन'], ['whatsapp', 'WhatsApp', 'व्हाट्सऐप'],
  ['email', 'Email', 'ईमेल'], ['website', 'Website', 'वेबसाइट'],
  ['bio', 'Short bio', 'छोटा परिचय'], ['address', 'Address', 'पता'],
  ['mapLink', 'Map link', 'मैप लिंक'], ['services', 'Services', 'सेवाएं'],
  ['serviceArea', 'Service area', 'सेवा क्षेत्र'], ['hours', 'Working hours', 'काम का समय'],
];

const copy = {
  en: {
    tagline: 'Your contacts, thoughtfully connected', welcome: 'A simpler way to share a card and keep the people you meet.',
    language: 'Language', loading: 'Loading…', error: 'Something went wrong. Please try again.',
    offline: 'You are offline. Live account and contact actions need a connection.',
    config: 'Firebase is not configured. Use the local emulator instructions to start the test services.',
    emulator: 'Local emulator mode. SMS is not sent; the test code appears in the Firebase emulator terminal.',
    productionOtp: 'A real SMS may be sent by the configured Firebase project.', phone: 'Phone number', sendCode: 'Send code', code: '6-digit code', verify: 'Verify and continue',
    signIn: 'Sign in with phone', signOut: 'Sign out', homeTitle: 'Your cards and contacts, in one place',
    quickCards: 'My Cards', quickSaved: 'Saved contacts', quickDiscover: 'Discover businesses',
    newCard: 'Create a card', newBusiness: 'Add a business', noCards: 'No cards yet. Create a private card to get started.',
    noSaved: 'No saved contacts yet.', noBusinesses: 'No matching public businesses found.',
    edit: 'Edit', view: 'View card', save: 'Save card', unsave: 'Remove saved card', share: 'Create share link + QR', revoke: 'Revoke all share links',
    copy: 'Copy link', saved: 'Saved', note: 'Private note', nickname: 'Nickname', tags: 'Tags (comma separated)', saveNote: 'Save private details',
    search: 'Search', city: 'City', category: 'Category', allPilot: 'Gohana + Sonipat', searchBusinesses: 'Search businesses',
    profileType: 'Card type', personal: 'Personal', professional: 'Professional', business: 'Business',
    visibility: 'Who can open this card?', private: 'Private', unlisted: 'Unlisted (link only)', public: 'Public',
    audience: 'Who can see this field?', linkOnly: 'Link-only', privateDefault: 'New profiles and fields start Private.',
    discoverable: 'Show this business in Discover', saveProfile: 'Save card', cancel: 'Cancel',
    unavailable: 'This feature is unavailable until you sign in and connect to Firebase.',
    restricted: 'This card is unavailable.', ownerPreview: 'Owner preview: you can see your private fields here.',
    verification: 'Business verification', verificationStatus: 'Status', requestVerification: 'Submit business evidence',
    evidence: 'Evidence file (PNG, JPEG, WebP or PDF; up to 10 MiB)', sendEvidence: 'Submit for review',
    report: 'Report this card', reason: 'Tell the review team what is wrong', sendReport: 'Send report',
    queue: 'Moderation queue', noReports: 'No open reports.', dismiss: 'Dismiss report', unpublish: 'Unpublish profile',
    review: 'Review verification', approve: 'Approve badge', reject: 'Reject', reviewNote: 'Review note',
    verified: 'Verified business', pending: 'Pending review', rejected: 'Not verified', unverified: 'Not verified',
    copied: 'Link copied.', linkRevoked: 'All earlier links have been revoked.', linkCreated: 'A new share link is ready.',
    cardSaved: 'Card saved.', profileSaved: 'Card saved.', reportSent: 'Report sent to the review queue.',
    verificationSent: 'Evidence sent for review.', languageSaved: 'Language preference saved.', prototype: 'Open UX prototype',
    privacy: 'Privacy first', privacyText: 'Private fields are returned only to their owner. Public and link views are projected by the server.',
    status: 'TownTap Alpha', confirmPublic: 'Make this card available to other people according to the selected privacy settings?',
    openAdmin: 'Open Admin', phoneInvalid: 'Use international format, for example +911234567890.',
  },
  hi: {
    tagline: 'आपके संपर्क, बेहतर तरीके से जुड़े', welcome: 'कार्ड साझा करने और नए परिचितों को संभालने का आसान तरीका।',
    language: 'भाषा', loading: 'लोड हो रहा है…', error: 'कुछ गड़बड़ हुई। फिर से कोशिश करें।',
    offline: 'आप ऑफ़लाइन हैं। खाते और संपर्क की सुविधाओं के लिए इंटरनेट चाहिए।',
    config: 'Firebase सेट नहीं है। स्थानीय टेस्ट सेवाएं शुरू करने के निर्देश देखें।',
    emulator: 'स्थानीय एमुलेटर मोड। SMS नहीं भेजा जाता; टेस्ट कोड Firebase एमुलेटर टर्मिनल में दिखेगा।',
    productionOtp: 'सेट किए गए Firebase प्रोजेक्ट से असली SMS भेजा जा सकता है।', phone: 'फ़ोन नंबर', sendCode: 'कोड भेजें', code: '6 अंकों का कोड', verify: 'सत्यापित करके आगे बढ़ें',
    signIn: 'फ़ोन से साइन इन', signOut: 'साइन आउट', homeTitle: 'आपके कार्ड और संपर्क, एक जगह',
    quickCards: 'मेरे कार्ड', quickSaved: 'सेव किए संपर्क', quickDiscover: 'व्यवसाय खोजें',
    newCard: 'कार्ड बनाएं', newBusiness: 'व्यवसाय जोड़ें', noCards: 'अभी कोई कार्ड नहीं है। शुरू करने के लिए निजी कार्ड बनाएं।',
    noSaved: 'अभी कोई संपर्क सेव नहीं है।', noBusinesses: 'इस खोज में कोई सार्वजनिक व्यवसाय नहीं मिला।',
    edit: 'बदलें', view: 'कार्ड देखें', save: 'कार्ड सेव करें', unsave: 'सेव किए कार्ड हटाएं', share: 'शेयर लिंक + QR बनाएं', revoke: 'सभी शेयर लिंक बंद करें',
    copy: 'लिंक कॉपी करें', saved: 'सेव किया', note: 'निजी नोट', nickname: 'अपना नाम', tags: 'टैग (कॉमा से अलग करें)', saveNote: 'निजी जानकारी सेव करें',
    search: 'खोजें', city: 'शहर', category: 'श्रेणी', allPilot: 'गोहाना + सोनीपत', searchBusinesses: 'व्यवसाय खोजें',
    profileType: 'कार्ड का प्रकार', personal: 'निजी', professional: 'पेशेवर', business: 'व्यवसाय',
    visibility: 'यह कार्ड कौन खोल सकता है?', private: 'निजी', unlisted: 'अनलिस्टेड (लिंक से)', public: 'सार्वजनिक',
    audience: 'यह जानकारी कौन देख सकता है?', linkOnly: 'सिर्फ लिंक से', privateDefault: 'नए प्रोफ़ाइल और जानकारी निजी रहते हैं।',
    discoverable: 'इस व्यवसाय को खोज में दिखाएं', saveProfile: 'कार्ड सेव करें', cancel: 'रद्द करें',
    unavailable: 'यह सुविधा साइन इन और Firebase से जुड़ने के बाद उपलब्ध होगी।',
    restricted: 'यह कार्ड उपलब्ध नहीं है।', ownerPreview: 'आपका कार्ड: यहां आपको अपनी निजी जानकारी दिखेगी।',
    verification: 'व्यवसाय सत्यापन', verificationStatus: 'स्थिति', requestVerification: 'व्यवसाय का प्रमाण भेजें',
    evidence: 'प्रमाण फ़ाइल (PNG, JPEG, WebP या PDF; अधिकतम 10 MiB)', sendEvidence: 'जांच के लिए भेजें',
    report: 'इस कार्ड की रिपोर्ट करें', reason: 'जांच टीम को बताएं कि समस्या क्या है', sendReport: 'रिपोर्ट भेजें',
    queue: 'मॉडरेशन कतार', noReports: 'कोई खुली रिपोर्ट नहीं है।', dismiss: 'रिपोर्ट बंद करें', unpublish: 'प्रोफ़ाइल हटाएं',
    review: 'सत्यापन जांचें', approve: 'बैज मंज़ूर करें', reject: 'नामंज़ूर करें', reviewNote: 'जांच नोट',
    verified: 'सत्यापित व्यवसाय', pending: 'जांच जारी', rejected: 'सत्यापित नहीं', unverified: 'सत्यापित नहीं',
    copied: 'लिंक कॉपी हो गया।', linkRevoked: 'पहले के सभी लिंक बंद कर दिए गए।', linkCreated: 'नया शेयर लिंक तैयार है।',
    cardSaved: 'कार्ड सेव हो गया।', profileSaved: 'कार्ड सेव हो गया।', reportSent: 'रिपोर्ट जांच कतार में भेज दी गई।',
    verificationSent: 'प्रमाण जांच के लिए भेज दिया गया।', languageSaved: 'भाषा की पसंद सेव हो गई।', prototype: 'UX प्रोटोटाइप खोलें',
    privacy: 'गोपनीयता पहले', privacyText: 'निजी जानकारी सिर्फ उसके मालिक को मिलती है। सर्वर सार्वजनिक और लिंक वाले कार्ड में सही जानकारी चुनता है।',
    status: 'TownTap अल्फ़ा', confirmPublic: 'क्या चुनी हुई गोपनीयता सेटिंग के अनुसार यह कार्ड दूसरों को दिखाना है?',
    openAdmin: 'एडमिन खोलें', phoneInvalid: 'अंतरराष्ट्रीय फ़ॉर्मैट लिखें, जैसे +911234567890।',
  },
};

const localeKey = 'towntap-language';
const state = {
  locale: localStorage.getItem(localeKey) || (navigator.language?.toLowerCase().startsWith('hi') ? 'hi' : 'en'),
  user: null,
  profiles: [],
  saved: [],
  businesses: [],
  reports: [],
  verifications: [],
  confirmation: null,
  codeSent: false,
  reportOpen: false,
  qr: null,
  shareUrl: '',
  currentCard: null,
  currentCardOwner: false,
  verificationTarget: null,
  reportTarget: null,
  loading: false,
  error: '',
  message: '',
  offline: !navigator.onLine,
  savedQuery: '',
};

const tr = (key) => copy[state.locale][key] ?? copy.en[key] ?? key;
const isHindi = () => state.locale === 'hi';
const labelOf = (field) => isHindi() ? field[2] : field[1];
const routeParts = () => {
  const hash = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = hash.split('?');
  return { route: path || 'welcome', params: new URLSearchParams(query) };
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function navigate(route, params = {}) {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  location.hash = `/${route}${query.size ? `?${query}` : ''}`;
}

function setLocale(value) {
  state.locale = value === 'hi' ? 'hi' : 'en';
  localStorage.setItem(localeKey, state.locale);
  render();
}

function statusMarkup() {
  if (state.offline) return `<div class="app-alert alert-warn" role="status">${tr('offline')}</div>`;
  if (state.error) return `<div class="app-alert alert-error" role="alert">${escapeHtml(state.error)} <button type="button" class="text-button" data-action="clear-error">×</button></div>`;
  if (state.message) return `<div class="app-alert alert-success" role="status">${escapeHtml(state.message)} <button type="button" class="text-button" data-action="clear-message">×</button></div>`;
  if (!firebaseReadyForApp) return `<div class="app-alert alert-warn" role="status">${firebaseLiveDevBlocked ? (isHindi() ? 'डेवलपमेंट में लाइव Firebase बंद है। Emulator mode शुरू करें।' : 'Live Firebase is blocked in development. Start emulator mode.') : tr('config')} <a href="/docs/MASTER-PROJECT-STATUS.md">Setup notes</a></div>`;
  if (state.loading) return `<div class="app-alert alert-info" role="status">${tr('loading')}</div>`;
  return '';
}

function navigationMarkup(route) {
  return navigation.map((item) => `<a class="nav-item ${route === item.route ? 'is-active' : ''}" href="#/${item.route}" aria-current="${route === item.route ? 'page' : 'false'}"><span aria-hidden="true">${item.icon}</span><span>${isHindi() ? item.hi : item.en}</span></a>`).join('');
}

function heading(route, description = '') {
  const screen = screens.find(([id]) => id === route) ?? screens[0];
  return `<section class="page-heading"><p class="eyebrow">TownTap</p><h1>${isHindi() ? screen[2] : screen[1]}</h1>${description ? `<p class="lead">${description}</p>` : ''}</section>`;
}

function signedOutPrompt() {
  return `<div class="notice"><span aria-hidden="true">ⓘ</span><div><strong>${tr('unavailable')}</strong><p>${tr('privacyText')}</p><a class="button button-primary" href="#/welcome">${tr('signIn')}</a></div></div>`;
}

function phoneSignIn() {
  if (!firebaseReadyForApp) return `<p class="lead">${firebaseLiveDevBlocked ? (isHindi() ? 'डेवलपमेंट में लाइव Firebase बंद है। Emulator mode शुरू करें।' : 'Live Firebase is blocked in development. Start emulator mode.') : tr('config')}</p><a class="text-link" href="/docs/MASTER-PROJECT-STATUS.md">Local setup and current status ↗</a>`;
  if (state.user) return `<div class="notice"><div><strong>${escapeHtml(state.user.phoneNumber ?? state.user.uid)}</strong><p>${firebaseIsEmulated ? tr('emulator') : tr('productionOtp')}</p><button type="button" class="secondary" data-action="sign-out">${tr('signOut')}</button></div></div>`;
  if (state.codeSent) return `<p class="lead">${firebaseIsEmulated ? tr('emulator') : tr('productionOtp')}</p><form id="codeForm" class="form-card"><label>${tr('code')}<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required></label><button class="button button-primary" type="submit">${tr('verify')}</button></form>`;
  return `<p class="lead">${firebaseIsEmulated ? tr('emulator') : tr('productionOtp')}</p><form id="phoneForm" class="form-card"><label>${tr('phone')}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+911234567890" required></label><div id="recaptcha-container"></div><button class="button button-primary" type="submit">${tr('sendCode')}</button></form>`;
}

function homePage() {
  return `${heading('home', tr('homeTitle'))}<div class="quick-grid"><a class="quick-card" href="#/my-cards"><span aria-hidden="true">▤</span><strong>${tr('quickCards')}</strong><small>${state.profiles.length}</small></a><a class="quick-card" href="#/saved-contacts"><span aria-hidden="true">♡</span><strong>${tr('quickSaved')}</strong><small>${state.saved.length}</small></a><a class="quick-card" href="#/discover"><span aria-hidden="true">⌕</span><strong>${tr('quickDiscover')}</strong><small>Gohana · Sonipat</small></a></div><section class="privacy-card"><div class="privacy-icon" aria-hidden="true">⌑</div><div><h2>${tr('privacy')}</h2><p>${tr('privacyText')}</p></div></section><div class="actions"><a class="button button-primary" href="#/card-editor">${tr('newCard')}</a><a class="button button-secondary" href="#/business-studio">${tr('newBusiness')}</a></div>`;
}

function profileCard(profile, owner = false) {
  const fields = profile.fields ?? {};
  const title = fields.displayName || '';
  const detail = [fields.headline, fields.category, fields.city].filter(Boolean).join(' · ');
  return `<article class="data-card"><div class="card-heading"><div class="avatar">${escapeHtml(title.slice(0, 1).toUpperCase() || 'T')}</div><div class="grow"><h2>${escapeHtml(title || tr('restricted'))}</h2><p>${escapeHtml(detail)}</p></div>${profile.verificationStatus === 'verified' ? `<span class="badge public">✓ ${tr('verified')}</span>` : ''}</div>${fields.bio ? `<p class="card-bio">${escapeHtml(fields.bio)}</p>` : ''}<div class="card-actions">${fields.phone ? `<a class="small-button" href="tel:${encodeURIComponent(fields.phone)}">${isHindi() ? 'कॉल' : 'Call'}</a>` : ''}${fields.whatsapp ? `<a class="small-button" href="https://wa.me/${fields.whatsapp.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ''}${fields.website ? `<a class="small-button" href="${safeExternal(fields.website)}" target="_blank" rel="noopener noreferrer">${isHindi() ? 'वेबसाइट' : 'Website'}</a>` : ''}<button class="small-button" data-action="report-open" data-id="${escapeHtml(profile.id)}" data-type="${profile.type === 'business' ? 'business' : 'profile'}">${tr('report')}</button></div>${owner ? `<p class="field-summary">${tr('visibility')}: ${tr(profile.visibility)}</p>` : ''}</article>`;
}

function safeExternal(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return escapeHtml(url.href);
  } catch {}
  return '#';
}

function profileList() {
  if (!state.user) return signedOutPrompt();
  const { params } = routeParts();
  const type = params.get('type');
  const items = state.profiles.filter((profile) => !type || profile.type === type);
  const cards = items.map((profile) => `<div class="data-card">${profileCard(profile, true)}<div class="card-actions"><button class="small-button" data-action="edit-profile" data-id="${profile.id}">${tr('edit')}</button><button class="small-button" data-action="view-profile" data-id="${profile.id}">${tr('view')}</button>${profile.visibility !== 'private' ? `<button class="small-button" data-action="share-profile" data-id="${profile.id}">${tr('share')}</button>` : ''}${profile.type === 'business' ? `<button class="small-button" data-action="verification-open" data-id="${profile.id}">${tr('verification')}</button>` : ''}</div></div>`).join('');
  return `${heading('my-cards')}<div class="actions"><a class="button button-primary" href="#/card-editor">${tr('newCard')}</a><a class="button button-secondary" href="#/business-studio">${tr('newBusiness')}</a></div>${cards || `<div class="empty-state">${tr('noCards')}</div>`}`;
}

function fieldControl(field, value = '', audience = 'private') {
  const id = `field-${field[0]}`;
  const safeValue = escapeHtml(value);
  const isLong = ['bio', 'services', 'serviceArea', 'hours', 'address'].includes(field[0]);
  const type = field[0] === 'email' ? 'email' : field[0] === 'website' || field[0] === 'mapLink' ? 'url' : field[0] === 'phone' || field[0] === 'whatsapp' ? 'tel' : 'text';
  return `<div class="field-row"><label for="${id}">${labelOf(field)}${isLong ? `<textarea id="${id}" name="${field[0]}" maxlength="1200">${safeValue}</textarea>` : `<input id="${id}" name="${field[0]}" type="${type}" maxlength="1200" value="${safeValue}" ${field[0] === 'displayName' ? 'required' : ''}>`}</label><label class="audience-label">${tr('audience')}<select name="audience-${field[0]}"><option value="private" ${audience === 'private' ? 'selected' : ''}>${tr('private')}</option><option value="link" ${audience === 'link' ? 'selected' : ''}>${tr('linkOnly')}</option><option value="public" ${audience === 'public' ? 'selected' : ''}>${tr('public')}</option></select></label></div>`;
}

function editorPage() {
  if (!state.user) return signedOutPrompt();
  const { params } = routeParts();
  const id = params.get('profileId');
  const existing = state.profiles.find((item) => item.id === id);
  const type = existing?.type ?? (params.get('type') === 'business' ? 'business' : 'personal');
  const fields = existing?.fields ?? {};
  const audiences = existing?.fieldAudiences ?? {};
  return `${heading('card-editor', tr('privateDefault'))}<form id="profileForm" class="form-card" data-profile-id="${existing?.id ?? ''}"><div class="form-grid"><label>${tr('profileType')}<select name="type"><option value="personal" ${type === 'personal' ? 'selected' : ''}>${tr('personal')}</option><option value="professional" ${type === 'professional' ? 'selected' : ''}>${tr('professional')}</option><option value="business" ${type === 'business' ? 'selected' : ''}>${tr('business')}</option></select></label><label>${tr('visibility')}<select name="visibility"><option value="private" ${existing?.visibility === 'private' || !existing ? 'selected' : ''}>${tr('private')}</option><option value="unlisted" ${existing?.visibility === 'unlisted' ? 'selected' : ''}>${tr('unlisted')}</option><option value="public" ${existing?.visibility === 'public' ? 'selected' : ''}>${tr('public')}</option></select></label></div>${fieldList.map((field) => fieldControl(field, fields[field[0]] ?? '', audiences[field[0]] ?? 'private')).join('')}<label class="check-row"><input name="discoverable" type="checkbox" ${existing?.discoverable ? 'checked' : ''} ${type !== 'business' ? 'disabled' : ''}>${tr('discoverable')}</label><p class="field-summary">${tr('privateDefault')}</p><div class="actions"><button class="button button-primary" type="submit">${tr('saveProfile')}</button><a class="button button-secondary" href="#/my-cards">${tr('cancel')}</a></div></form>`;
}

function cardViewPage() {
  const { params } = routeParts();
  const id = params.get('profileId');
  const profile = state.profiles.find((item) => item.id === id);
  if (!id) return `${heading('public-card')}<div class="empty-state">${tr('restricted')}</div>`;
  if (state.loading) return `${heading('public-card')}<div class="empty-state">${tr('loading')}</div>`;
  if (state.error) return `${heading('public-card')}<div class="empty-state">${escapeHtml(state.error)}</div>`;
  if (!state.currentCard) return `${heading('public-card')}<div class="empty-state">${tr('restricted')}</div>`;
  const card = state.currentCard;
  const isOwner = state.currentCardOwner || Boolean(state.user && profile?.id === card.id);
  return `${heading(card.type === 'business' ? 'business-detail' : 'public-card')} ${isOwner ? `<div class="notice">${tr('ownerPreview')}</div>` : ''}${profileCard(card, isOwner)}${isOwner ? `<div class="actions"><button class="button button-primary" data-action="share-profile" data-id="${card.id}">${tr('share')}</button><button class="button button-secondary" data-action="revoke-links" data-id="${card.id}">${tr('revoke')}</button><button class="button button-secondary" data-action="edit-profile" data-id="${card.id}">${tr('edit')}</button></div>` : state.user && card.visibility === 'public' ? `<button class="button button-primary" data-action="save-contact" data-id="${card.id}">${tr('save')}</button>` : ''}${state.qr ? `<section class="qr-panel"><h2>${tr('share')}</h2><img src="${state.qr}" alt="${isHindi() ? 'कार्ड का QR कोड' : 'QR code for this card'}"><label>${tr('copy')}<input id="shareUrl" readonly value="${escapeHtml(state.shareUrl)}"></label><button class="secondary" data-action="copy-link">${tr('copy')}</button></section>` : ''}${state.reportOpen ? reportForm(card.id, card.type === 'business' ? 'business' : 'profile') : ''}`;
}

function reportForm(targetId, targetType) {
  return `<form id="reportForm" class="form-card" data-target-id="${escapeHtml(targetId)}" data-target-type="${escapeHtml(targetType)}"><h2>${tr('report')}</h2><label>${tr('reason')}<textarea name="reason" minlength="5" maxlength="1000" required></textarea></label><div class="actions"><button class="button button-primary" type="submit">${tr('sendReport')}</button><button class="button button-secondary" type="button" data-action="report-close">${tr('cancel')}</button></div></form>`;
}

function savedPage() {
  if (!state.user) return signedOutPrompt();
  const query = state.savedQuery.trim().toLocaleLowerCase();
  const items = state.saved.filter((item) => `${item.nickname} ${item.profile?.fields?.displayName ?? ''} ${item.profile?.fields?.category ?? ''} ${item.profile?.fields?.city ?? ''} ${item.note} ${(item.tags ?? []).join(' ')}`.toLocaleLowerCase().includes(query));
  const rows = items.map((item) => `<article class="data-card"><div class="card-heading"><div class="grow"><h2>${escapeHtml(item.nickname || item.profile?.fields?.displayName || tr('restricted'))}</h2><p>${escapeHtml([item.profile?.fields?.category, item.profile?.fields?.city].filter(Boolean).join(' · '))}</p></div>${item.unavailable ? `<span class="badge warn">${tr('restricted')}</span>` : ''}</div>${item.note ? `<p>${escapeHtml(item.note)}</p>` : ''}<div class="tag-list">${(item.tags ?? []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><div class="card-actions"><button class="small-button" data-action="saved-detail" data-id="${item.profile?.id ?? ''}">${tr('view')}</button>${item.profile?.id ? `<button class="small-button" data-action="remove-saved" data-id="${item.profile.id}">${tr('unsave')}</button>` : ''}</div></article>`).join('');
  return `${heading('saved-contacts')}<label class="search-label">${tr('search')}<input type="search" id="savedSearch" value="${escapeHtml(state.savedQuery)}"></label>${rows || `<div class="empty-state">${tr('noSaved')}</div>`}`;
}

function savedDetailPage() {
  if (!state.user) return signedOutPrompt();
  const { params } = routeParts();
  const item = state.saved.find((saved) => saved.profile?.id === params.get('profileId'));
  if (!item) return `${heading('saved-detail')}<div class="empty-state">${tr('restricted')}</div>`;
  return `${heading('saved-detail')}${item.profile ? profileCard(item.profile) : `<div class="notice">${tr('restricted')}</div>`}<form id="savedForm" class="form-card" data-profile-id="${item.profile.id}"><label>${tr('nickname')}<input name="nickname" maxlength="80" value="${escapeHtml(item.nickname)}"></label><label>${tr('note')}<textarea name="note" maxlength="1000">${escapeHtml(item.note)}</textarea></label><label>${tr('tags')}<input name="tags" maxlength="800" value="${escapeHtml((item.tags ?? []).join(', '))}"></label><div class="actions"><button class="button button-primary" type="submit">${tr('saveNote')}</button><button class="button button-secondary" type="button" data-action="remove-saved" data-id="${item.profile.id}">${tr('unsave')}</button></div></form>`;
}

function discoverPage() {
  const { params } = routeParts();
  const term = params.get('term') ?? '';
  const city = params.get('city') ?? '';
  const category = params.get('category') ?? '';
  const cards = state.businesses.map((business) => `<article class="data-card"><div class="card-heading"><div class="avatar biz">⌂</div><div class="grow"><h2>${escapeHtml(business.name)}</h2><p>${escapeHtml([business.category, business.city].filter(Boolean).join(' · '))}</p></div>${business.verified ? `<span class="badge public">✓ ${tr('verified')}</span>` : ''}</div>${business.bio ? `<p>${escapeHtml(business.bio)}</p>` : ''}<div class="card-actions"><button class="small-button" data-action="view-profile" data-id="${escapeHtml(business.profileId)}">${tr('view')}</button>${business.phone ? `<a class="small-button" href="tel:${encodeURIComponent(business.phone)}">Call</a>` : ''}</div></article>`).join('');
  return `${heading('discover')}<form id="searchForm" class="search-panel"><label>${tr('search')}<input name="term" value="${escapeHtml(term)}"></label><div class="form-grid"><label>${tr('city')}<input name="city" value="${escapeHtml(city)}" placeholder="Gohana, Sonipat"></label><label>${tr('category')}<input name="category" value="${escapeHtml(category)}"></label></div><button class="button button-primary" type="submit">${tr('searchBusinesses')}</button></form>${cards || `<div class="empty-state">${tr('noBusinesses')}</div>`}`;
}

function businessStudioPage() {
  if (!state.user) return signedOutPrompt();
  const items = state.profiles.filter((profile) => profile.type === 'business');
  const rows = items.map((profile) => `<article class="data-card"><div class="card-heading"><div class="grow"><h2>${escapeHtml(profile.fields.displayName ?? '')}</h2><p>${escapeHtml([profile.fields.category, profile.fields.city].filter(Boolean).join(' · '))}</p></div><span class="badge ${profile.verificationStatus === 'verified' ? 'public' : 'warn'}">${tr(profile.verificationStatus ?? 'unverified')}</span></div><div class="card-actions"><button class="small-button" data-action="edit-profile" data-id="${profile.id}">${tr('edit')}</button><button class="small-button" data-action="verification-open" data-id="${profile.id}">${tr('verification')}</button></div></article>`).join('');
  return `${heading('business-studio')}<div class="actions"><a class="button button-primary" href="#/card-editor?type=business">${tr('newBusiness')}</a></div>${rows || `<div class="empty-state">${tr('noCards')}</div>`}${state.verificationTarget ? verificationForm(state.verificationTarget) : ''}<p class="field-summary">${tr('privateDefault')}</p>`;
}

function verificationForm(profileId) {
  return `<form id="verificationForm" class="form-card" data-profile-id="${escapeHtml(profileId)}"><h2>${tr('requestVerification')}</h2><label>${tr('evidence')}<input name="evidence" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" required></label><button class="button button-primary" type="submit">${tr('sendEvidence')}</button></form>`;
}

function settingsPage() {
  return `${heading('settings')}<section class="settings-card"><h2>${tr('language')}</h2><div class="language-switch" role="group" aria-label="${tr('language')}"><button type="button" data-locale="en" aria-pressed="${state.locale === 'en'}">English</button><button type="button" data-locale="hi" aria-pressed="${state.locale === 'hi'}">हिन्दी</button></div></section><section class="settings-card"><h2>${tr('privacy')}</h2><p>${tr('privacyText')}</p>${state.user ? `<p>${escapeHtml(state.user.phoneNumber ?? state.user.uid)}</p><button class="secondary" data-action="sign-out">${tr('signOut')}</button>` : `<a class="button button-primary" href="#/welcome">${tr('signIn')}</a>`}<p><a class="text-link" href="#/admin">${tr('openAdmin')}</a></p></section><a class="text-link" href="/prototypes/index.html">${tr('prototype')} ↗</a>`;
}

function adminPage() {
  if (!state.user) return signedOutPrompt();
  const reportRows = state.reports.map((report) => `<article class="data-card"><h2>${escapeHtml(report.targetType)} · ${escapeHtml(report.targetId)}</h2><p>${escapeHtml(report.reason)}</p><div class="card-actions"><button class="small-button" data-action="resolve-report" data-id="${report.id}" data-resolution="dismiss">${tr('dismiss')}</button><button class="small-button danger-button" data-action="resolve-report" data-id="${report.id}" data-resolution="unpublish">${tr('unpublish')}</button></div></article>`).join('');
  const verificationRows = state.verifications.map((item) => `<article class="data-card"><h2>${escapeHtml(item.profileId)}</h2><p>${escapeHtml(item.requesterUid)}</p><div class="card-actions"><button class="small-button" data-action="view-evidence" data-path="${escapeHtml(item.storagePath)}">${tr('evidence')}</button><button class="small-button" data-action="review-verification" data-id="${item.id}" data-decision="approve">${tr('approve')}</button><button class="small-button danger-button" data-action="review-verification" data-id="${item.id}" data-decision="reject">${tr('reject')}</button></div></article>`).join('');
  return `${heading('admin', tr('admin'))}<h2>${tr('queue')}</h2>${reportRows || `<div class="empty-state">${tr('noReports')}</div>`}<h2>${tr('verification')}</h2>${verificationRows || `<div class="empty-state">${tr('noReports')}</div>`}<div id="evidencePreview"></div>`;
}

function pageMarkup(route) {
  switch (route) {
    case 'welcome': return `${heading('welcome', tr('welcome'))}${phoneSignIn()}<div class="screen-grid"><a class="screen-link" href="#/home">${tr('quickCards')} →</a><a class="screen-link" href="#/discover">${tr('quickDiscover')} →</a></div>`;
    case 'home': return state.user ? homePage() : `${heading('home', tr('homeTitle'))}${phoneSignIn()}`;
    case 'my-cards': return profileList();
    case 'card-editor': return editorPage();
    case 'public-card': case 'business-detail': return cardViewPage();
    case 'saved-contacts': return savedPage();
    case 'saved-detail': return savedDetailPage();
    case 'discover': return discoverPage();
    case 'business-studio': return businessStudioPage();
    case 'settings': return settingsPage();
    case 'admin': return adminPage();
    default: return `${heading('welcome', tr('welcome'))}${phoneSignIn()}`;
  }
}

function render() {
  const { route } = routeParts();
  const screen = screens.find(([id]) => id === route) ?? screens[0];
  document.documentElement.lang = state.locale;
  document.title = `${isHindi() ? screen[2] : screen[1]} · TownTap`;
  document.querySelector('#app').innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#/home" aria-label="TownTap"><span class="brand-mark">t</span><span>TownTap<small>${tr('tagline')}</small></span></a><nav aria-label="${isHindi() ? 'मुख्य नेविगेशन' : 'Main navigation'}">${navigationMarkup(route)}</nav><div class="sidebar-note">${tr('privacy')}</div></aside><main class="main-content"><header class="topbar"><a class="brand brand-mobile" href="#/home"><span class="brand-mark">t</span><span>TownTap</span></a><button class="language-button" type="button" data-toggle-locale aria-label="${tr('language')}">${state.locale === 'en' ? 'हिन्दी' : 'English'}</button></header><div class="content">${statusMarkup()}${pageMarkup(route)}</div><footer>TownTap · ${tr('status')}${firebaseIsEmulated ? ' · Emulator' : ''}</footer></main><nav class="bottom-nav" aria-label="${isHindi() ? 'मुख्य नेविगेशन' : 'Main navigation'}">${navigationMarkup(route)}</nav><div class="sr-only" aria-live="polite" id="liveRegion"></div></div>`;
  document.querySelector('[data-toggle-locale]')?.addEventListener('click', () => setLocale(state.locale === 'en' ? 'hi' : 'en'));
  document.querySelectorAll('[data-locale]').forEach((button) => button.addEventListener('click', () => setLocale(button.dataset.locale)));
}

async function withLoading(operation) {
  state.error = '';
  state.message = '';
  state.loading = true;
  render();
  try { return await operation(); }
  catch (error) {
    console.error(error);
    state.error = error?.message || tr('error');
    return null;
  } finally { state.loading = false; render(); }
}

async function loadProfileList() {
  if (!firebaseReadyForApp || !state.user) return;
  const response = await callTownTap('listMyProfiles');
  state.profiles = response.profiles ?? [];
}

async function loadRouteData() {
  if (!firebaseReadyForApp) { render(); return; }
  const { route, params } = routeParts();
  state.error = '';
  if (!['public-card', 'business-detail'].includes(route)) { state.qr = null; state.shareUrl = ''; }
  if (state.user && ['my-cards', 'card-editor', 'business-studio', 'settings', 'home'].includes(route)) {
    state.loading = true; render();
    try { await loadProfileList(); } catch (error) { state.error = error.message; }
    state.loading = false; render();
  }
  if (state.user && ['saved-contacts', 'saved-detail'].includes(route)) {
    state.loading = true; render();
    try { state.saved = (await callTownTap('listSavedContacts')).contacts ?? []; } catch (error) { state.error = error.message; }
    state.loading = false; render();
  }
  if (route === 'discover') {
    state.loading = true; render();
    try { state.businesses = (await callTownTap('searchBusinesses', { term: params.get('term') ?? '', city: params.get('city') ?? '', category: params.get('category') ?? '' })).businesses ?? []; }
    catch (error) { state.error = error.message; }
    state.loading = false; render();
  }
  if (['public-card', 'business-detail'].includes(route) && params.get('profileId')) {
    state.currentCard = null; state.currentCardOwner = false; state.loading = true; render();
    try {
      const response = await callTownTap('resolveCard', { profileId: params.get('profileId'), shareToken: params.get('shareToken') ?? '' });
      state.currentCard = response.profile;
      state.currentCardOwner = response.owner === true;
    } catch (error) { state.error = error.message; }
    state.loading = false; render();
  }
  if (route === 'admin' && state.user) {
    state.loading = true; render();
    try {
      const [reports, verifications] = await Promise.all([callTownTap('listModerationQueue'), callTownTap('listVerificationQueue')]);
      state.reports = reports.reports ?? [];
      state.verifications = verifications.requests ?? [];
    } catch (error) { state.error = error.message; }
    state.loading = false; render();
  }
  render();
}

function readProfileForm(form) {
  const data = new FormData(form);
  const fields = {};
  for (const [key] of fieldList) fields[key] = { value: String(data.get(key) ?? '').trim(), audience: String(data.get(`audience-${key}`) ?? 'private') };
  return {
    type: data.get('type'),
    visibility: data.get('visibility'),
    discoverable: data.get('discoverable') === 'on',
    fields,
  };
}

function shareUrl(profileId, token) {
  return `${location.origin}${location.pathname}#/public-card?${new URLSearchParams({ profileId, shareToken: token })}`;
}

async function createShare(profileId) {
  const response = await callTownTap('createShareLink', { profileId });
  state.shareUrl = shareUrl(profileId, response.token);
  state.qr = await QRCode.toDataURL(state.shareUrl, { width: 260, margin: 2, errorCorrectionLevel: 'M' });
  state.message = tr('linkCreated');
  navigate('public-card', { profileId, shareToken: response.token });
  render();
}

async function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'clear-error') { state.error = ''; render(); return; }
  if (action === 'clear-message') { state.message = ''; render(); return; }
  if (action === 'sign-out') { await withLoading(signOutTownTap); return; }
  if (action === 'edit-profile') { navigate('card-editor', { profileId: id }); return; }
  if (action === 'view-profile') {
    const profile = state.profiles.find((item) => item.id === id) ?? state.businesses.find((item) => item.profileId === id);
    navigate(profile?.type === 'business' || profile?.profileId ? 'business-detail' : 'public-card', { profileId: id }); return;
  }
  if (action === 'saved-detail') { navigate('saved-detail', { profileId: id }); return; }
  if (action === 'share-profile') { await withLoading(() => createShare(id)); return; }
  if (action === 'revoke-links') {
    await withLoading(async () => { await callTownTap('revokeShareLinks', { profileId: id }); state.qr = null; state.shareUrl = ''; state.message = tr('linkRevoked'); }); return;
  }
  if (action === 'copy-link') {
    try { await navigator.clipboard.writeText(state.shareUrl); state.message = tr('copied'); } catch { state.error = 'Clipboard unavailable.'; }
    render(); return;
  }
  if (action === 'save-contact') { await withLoading(async () => { await callTownTap('saveContact', { profileId: id }); state.message = tr('cardSaved'); }); return; }
  if (action === 'remove-saved') {
    await withLoading(async () => { await callTownTap('removeSavedContact', { profileId: id }); state.saved = state.saved.filter((item) => item.profile?.id !== id); state.message = tr('unsave'); }); return;
  }
  if (action === 'report-open') { state.reportOpen = true; state.reportTarget = { id, type: button.dataset.type }; render(); return; }
  if (action === 'report-close') { state.reportOpen = false; render(); return; }
  if (action === 'verification-open') { state.verificationTarget = id; render(); document.getElementById('verificationForm')?.scrollIntoView({ behavior: 'smooth' }); return; }
  if (action === 'resolve-report') {
    await withLoading(async () => { await callTownTap('resolveReport', { reportId: id, action: button.dataset.resolution }); state.reports = state.reports.filter((report) => report.id !== id); }); return;
  }
  if (action === 'review-verification') {
    const note = window.prompt(tr('reviewNote'), '') ?? '';
    await withLoading(async () => { await callTownTap('reviewBusinessVerification', { requestId: id, decision: button.dataset.decision, reviewNote: note }); state.verifications = state.verifications.filter((item) => item.id !== id); }); return;
  }
  if (action === 'view-evidence') {
    await withLoading(async () => {
      const blob = new Blob([await getBytes(ref(storage, button.dataset.path))]);
      const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.target = '_blank'; link.rel = 'noopener'; link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 60_000);
    }); return;
  }
}

async function handleSubmit(event) {
  const form = event.target;
  event.preventDefault();
  if (form.id === 'phoneForm') {
    const phone = new FormData(form).get('phone').trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) { state.error = tr('phoneInvalid'); render(); return; }
    await withLoading(async () => { const result = await requestPhoneCode(phone); state.confirmation = result.confirmation; state.codeSent = true; state.message = result.emulated ? tr('emulator') : tr('productionOtp'); });
    return;
  }
  if (form.id === 'codeForm') {
    const code = new FormData(form).get('code').trim();
    await withLoading(async () => { await confirmPhoneCode(state.confirmation, code); state.codeSent = false; state.confirmation = null; state.message = tr('signIn'); });
    return;
  }
  if (form.id === 'profileForm') {
    const profile = readProfileForm(form);
    if (profile.visibility !== 'private' && !window.confirm(tr('confirmPublic'))) return;
    const existingId = form.dataset.profileId;
    await withLoading(async () => {
      const result = await callTownTap('upsertProfile', { profileId: existingId || undefined, profile });
      state.message = tr('profileSaved');
      await loadProfileList();
      navigate('my-cards');
      return result;
    });
    return;
  }
  if (form.id === 'savedForm') {
    const data = new FormData(form);
    const tags = String(data.get('tags')).split(',').map((item) => item.trim()).filter(Boolean);
    await withLoading(async () => {
      await callTownTap('updateSavedContact', { profileId: form.dataset.profileId, note: data.get('note'), nickname: data.get('nickname'), tags });
      state.saved = (await callTownTap('listSavedContacts')).contacts ?? [];
      state.message = tr('saveNote');
    });
    return;
  }
  if (form.id === 'searchForm') {
    const data = new FormData(form);
    navigate('discover', { term: data.get('term'), city: data.get('city'), category: data.get('category') });
    return;
  }
  if (form.id === 'reportForm') {
    const reason = new FormData(form).get('reason').trim();
    await withLoading(async () => {
      await callTownTap('submitReport', { targetId: form.dataset.targetId, targetType: form.dataset.targetType, reason });
      state.reportOpen = false; state.message = tr('reportSent');
    });
    return;
  }
  if (form.id === 'verificationForm') {
    const file = new FormData(form).get('evidence');
    if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024) { state.error = tr('evidence'); render(); return; }
    await withLoading(async () => {
      const result = await callTownTap('requestBusinessVerification', { profileId: form.dataset.profileId });
      await uploadBytes(ref(storage, result.storagePath), file, { contentType: file.type, customMetadata: { ownerUid: state.user.uid } });
      state.message = tr('verificationSent');
      await loadProfileList();
    });
  }
}

document.addEventListener('click', handleClick);
document.addEventListener('submit', handleSubmit);
document.addEventListener('input', (event) => {
  if (event.target.id === 'savedSearch') { state.savedQuery = event.target.value; render(); const input = document.getElementById('savedSearch'); input?.focus(); input?.setSelectionRange(state.savedQuery.length, state.savedQuery.length); }
});
window.addEventListener('hashchange', loadRouteData);
window.addEventListener('online', () => { state.offline = false; render(); });
window.addEventListener('offline', () => { state.offline = true; render(); });

if (firebaseReadyForApp) {
  onAuthStateChanged(auth, async (user) => {
    state.user = user;
    state.profiles = [];
    state.saved = [];
    state.error = '';
    state.codeSent = false;
    render();
    if (user) {
      try { await loadProfileList(); } catch (error) { state.error = error.message; }
    }
    await loadRouteData();
  });
} else {
  render();
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(() => {}));
}
