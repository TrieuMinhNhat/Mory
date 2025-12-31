import emojiRegex from 'emoji-regex';

export function isOnlyEmoji(str: string): boolean {
    if (!str) return false;

    const regex = emojiRegex();
    const matched = str.match(regex);

    return matched !== null && matched.join('') === str;
}
