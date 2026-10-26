export const PROFILE_MODES = ['private', 'unlisted', 'public'];
export const FIELD_AUDIENCES = ['private', 'link', 'public'];
export const PROFILE_TYPES = ['personal', 'professional', 'business'];
export const PROFILE_FIELDS = [
  'displayName', 'photoUrl', 'headline', 'category', 'city', 'phone',
  'whatsapp', 'email', 'website', 'socialLinks', 'bio', 'address',
  'mapLink', 'services', 'serviceArea', 'hours',
];

const modeRank = { private: 0, unlisted: 1, public: 2 };
const audienceRank = { private: 0, link: 1, public: 2 };
const MAX_FIELD_LENGTH = 1200;

export function cleanText(value, fieldName, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== 'string') throw new TypeError(`${fieldName} must be text`);
  const result = value.trim();
  if (result.length > maxLength) throw new RangeError(`${fieldName} is too long`);
  return result;
}

export function normalizeProfileInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Invalid profile');
  const type = input.type;
  const visibility = input.visibility ?? 'private';
  if (!PROFILE_TYPES.includes(type)) throw new TypeError('Invalid profile type');
  if (!PROFILE_MODES.includes(visibility)) throw new TypeError('Invalid profile visibility');

  const rawFields = input.fields ?? {};
  if (!rawFields || typeof rawFields !== 'object' || Array.isArray(rawFields)) throw new TypeError('Invalid profile fields');
  for (const key of Object.keys(rawFields)) {
    if (!PROFILE_FIELDS.includes(key)) throw new TypeError(`Unsupported profile field: ${key}`);
  }

  const fields = {};
  for (const key of PROFILE_FIELDS) {
    const candidate = rawFields[key];
    if (candidate === undefined) {
      fields[key] = { value: '', audience: 'private' };
      continue;
    }
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new TypeError(`Invalid ${key} field`);
    const audience = candidate.audience ?? 'private';
    if (!FIELD_AUDIENCES.includes(audience)) throw new TypeError(`Invalid ${key} audience`);
    const value = cleanText(candidate.value, key);
    if (['website', 'mapLink', 'photoUrl'].includes(key) && value) {
      let parsed;
      try { parsed = new URL(value); } catch { throw new TypeError(`${key} must be a valid HTTPS URL`); }
      if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new TypeError(`${key} must be a valid HTTPS URL`);
    }
    if (['phone', 'whatsapp'].includes(key) && value) {
      const digits = value.replace(/\D/g, '');
      if (!/^[+0-9 ()-]+$/.test(value) || digits.length < 7 || digits.length > 15) throw new TypeError(`${key} must be a valid phone number`);
    }
    if (key === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new TypeError('Email must be valid');
    fields[key] = { value, audience };
  }

  if (!fields.displayName.value) throw new TypeError('Display name is required');
  const discoverable = input.discoverable === true;
  if (discoverable && (type !== 'business' || visibility !== 'public')) {
    throw new TypeError('Only a Public business profile can be listed in Discover');
  }
  const hasPublicLocation = ['city', 'serviceArea'].some((field) => fields[field].audience === 'public' && fields[field].value);
  if (discoverable && (['displayName', 'category'].some((field) => fields[field].audience !== 'public' || !fields[field].value) || !hasPublicLocation)) {
    throw new TypeError('A discoverable business needs public name, category, and city or service area');
  }
  if (!['phone', 'whatsapp', 'email', 'website'].some((field) => fields[field].value)) {
    throw new TypeError('At least one valid contact method is required');
  }
  if (type === 'business' && (!fields.category.value || (!fields.city.value && !fields.serviceArea.value))) {
    throw new TypeError('Business name, category, and city or service area are required');
  }

  return { type, visibility, discoverable, fields };
}

export function isMoreRestrictive(previous, next) {
  if (!previous) return false;
  if (modeRank[next.visibility] < modeRank[previous.visibility]) return true;
  for (const field of PROFILE_FIELDS) {
    const oldAudience = previous.fields?.[field]?.audience ?? 'private';
    const newAudience = next.fields?.[field]?.audience ?? 'private';
    if (audienceRank[newAudience] < audienceRank[oldAudience]) return true;
  }
  return previous.discoverable === true && next.discoverable !== true;
}

export function projectProfile(profile, audience) {
  const projected = {};
  for (const field of PROFILE_FIELDS) {
    const entry = profile.fields?.[field];
    if (!entry) continue;
    const permitted = audience === 'owner'
      || entry.audience === 'public'
      || (audience === 'link' && entry.audience === 'link');
    if (permitted && entry.value) projected[field] = entry.value;
  }
  return {
    id: profile.id,
    type: profile.type,
    visibility: profile.visibility,
    ...(audience === 'owner' ? {
      discoverable: profile.discoverable === true,
      fieldAudiences: Object.fromEntries(PROFILE_FIELDS.map((field) => [field, profile.fields?.[field]?.audience ?? 'private'])),
    } : {}),
    fields: projected,
    verificationStatus: profile.type !== 'business' ? undefined : audience === 'owner'
      ? (profile.verificationStatus ?? 'unverified')
      : (profile.verificationStatus === 'verified' ? 'verified' : undefined),
  };
}

export function directoryProjection(profile) {
  if (profile.type !== 'business' || profile.visibility !== 'public' || profile.status !== 'active' || !profile.discoverable) return null;
  const fields = projectProfile(profile, 'public').fields;
  const city = fields.city || fields.serviceArea;
  if (!fields.displayName || !fields.category || !city) return null;
  return {
    profileId: profile.id,
    name: fields.displayName,
    category: fields.category,
    city,
    cityId: city.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    categoryId: fields.category.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    ...(fields.bio ? { bio: fields.bio } : {}),
    ...(fields.phone ? { phone: fields.phone } : {}),
    ...(fields.whatsapp ? { whatsapp: fields.whatsapp } : {}),
    ...(fields.website ? { website: fields.website } : {}),
    verified: profile.verificationStatus === 'verified',
    updatedAt: profile.updatedAt,
  };
}

export function rankDirectoryResults(items, query = {}) {
  const normalize = (value) => String(value ?? '').trim().toLocaleLowerCase();
  const term = normalize(query.term);
  const requestedCity = normalize(query.city);
  const requestedCategory = normalize(query.category);
  return items
    .filter((item) => !requestedCity || normalize(item.city) === requestedCity)
    .filter((item) => !requestedCategory || normalize(item.category) === requestedCategory)
    .filter((item) => !term || `${item.name} ${item.category} ${item.city} ${item.bio}`.toLocaleLowerCase().includes(term))
    .sort((a, b) => {
      const aPilot = ['gohana', 'sonipat'].includes(normalize(a.city).replace(/[^a-z]/g, '')) ? 0 : 1;
      const bPilot = ['gohana', 'sonipat'].includes(normalize(b.city).replace(/[^a-z]/g, '')) ? 0 : 1;
      return aPilot - bPilot || a.name.localeCompare(b.name);
    });
}
