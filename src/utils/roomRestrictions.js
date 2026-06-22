export const RESTRICTED_ROOM = 'Computer Laboratory';
export const RESTRICTED_DAY = 'Saturday';
export const RESTRICTED_KEYWORDS = ['mark', 'sena'];

export const isRestrictedInstructor = (instructor) => {
    const first = (instructor?.first_name || '').toLowerCase();
    const last = (instructor?.last_name || '').toLowerCase();
    return RESTRICTED_KEYWORDS.every(k => first.includes(k) || last.includes(k));
};
