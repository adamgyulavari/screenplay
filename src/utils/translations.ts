export const translations = {
  // Character Selector
  title: 'Szövegkönyv Memorizáló',
  subtitle: 'Válaszd ki a szereplőd, hogy elkezdhesd memorizálni a szövegeidet kontextuális párbeszéddel',
  lines: 'sor',
  
  // Header
  backToCharacters: 'Karakterek',
  reset: 'Újrakezdés',
  
  // Navigation Instructions
  previous: 'Előző',
  next: 'Következő',
  or: 'vagy',
  longLinesNote: 'A hosszú sorok szegmensekre vannak bontva a könnyebb memorizálás érdekében',
  
  // Progress Bar
  lineOf: 'sor',
  of: 'a',
  complete: 'kész',
  jumpToLine: 'Ugrás a',
  sorhoz: 'sorhoz',
  
  // Current Line Section
  yourLine: 'A te sorod',
  segment: 'szegmens',
  pressToReveal: 'Nyomd meg a',
  space: 'Szóköz',
  toRevealLine: 'gombot a sor megjelenítéséhez',
  
  // Memorizer View
  noMoreDialogue: 'Nincs több párbeszéd',
  backToCharacterSelection: 'Vissza a karakterválasztáshoz',

  // Passcode Input
  passcodeInputText: 'Add meg a jelszót a hozzáféréshez',
  passcodeInput: 'Jelszó',
  passcodeInputPlaceholder: 'Add meg a jelszót',
  passcodeInputError: 'A jelszó nem megfelelő',
  passcodeInputLoading: 'A jelszó ellenőrzése...',
  passcodeInputContinue: 'Folytatás',
  
  // Logout
  logout: 'Kilépés',
} as const;

export type TranslationKey = keyof typeof translations; 
