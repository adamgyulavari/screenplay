export const translations = {
  // Character Selector
  title: 'Szövegkönyv Memorizáló',
  subtitle:
    'Válaszd ki a szereped, hogy elkezdhesd memorizálni a szövegeidet kontextuális párbeszéddel',
  lines: 'sor',

  // Header
  backToCharacters: 'Szereplők',
  reset: 'Újrakezdés',

  // TTS
  ttsOn: 'Hang',
  ttsOff: 'Hang',
  ttsTooltip: 'Szöveg felolvasása be/kikapcsolása',

  // Navigation Instructions
  previous: 'Előző',
  next: 'Következő',
  or: 'vagy',
  longLinesNote:
    'A hosszú sorok részekre vannak bontva a könnyebb memorizálás érdekében',

  // Progress Bar
  lineOf: 'sor',
  of: 'a',
  complete: 'kész',
  jumpToLine: 'Ugrás a',
  sorhoz: 'sorhoz',

  // Current Line Section
  yourLine: 'A te sorod',
  segment: 'rész',
  segments: 'rész',
  pressToReveal: 'Nyomd meg a',
  space: 'Szóköz',
  toRevealLine: 'gombot a sor megjelenítéséhez',
  advance: 'Tovább',

  // Memorizer View
  noMoreDialogue: 'Nincs több párbeszéd',
  backToCharacterSelection: 'Vissza a karakterválasztáshoz',

  // Passcode Input (legacy)
  passcodeInputText: 'Jelentkezz be a hozzáféréshez',
  passcodeInput: 'Jelszó',
  passcodeInputPlaceholder: 'Add meg a jelszót',
  passcodeInputError: 'A jelszó nem megfelelő',
  passcodeInputLoading: 'A jelszó ellenőrzése...',
  passcodeInputContinue: 'Folytatás',

  // Login (Supabase / Google)
  signInWithGoogle: 'Bejelentkezés Google-lal',
  signInError: 'Bejelentkezés sikertelen',
  loadingAuth: 'Betöltés...',

  // Logout
  logout: 'Kilépés',

  // Manage users
  manageUsers: 'Hozzáférés kezelése',
  manageUsersTitle: 'Hozzáférés kezelése',
  addUserPlaceholder: 'E-mail cím',
  addUser: 'Hozzáadás',
  removeUser: 'Eltávolítás',
  noUsers: 'Nincs hozzáadott felhasználó.',
  addUserError: 'Nem sikerült hozzáadni',
  removeUserError: 'Nem sikerült eltávolítani',
  userNotFound: 'Nincs ilyen e-mail címmel regisztrált felhasználó.',
  invitationSaved: 'Hozzáférés elmentve. A felhasználó a regisztráció után automatikusan megkapja.',
  pendingInvitations: 'Függőben lévő meghívók',
  removeInvitation: 'Meghívó visszavonása',
  removeInvitationError: 'Nem sikerült visszavonni a meghívót',
  pending: 'Függőben',

  // Screenplay selector
  screenplaySelector: 'Szövegkönyvek',
  noScreenplays:
    'Még nincs hozzáférésed egyetlen szövegkönyvhöz sem. Kérj Ádámtól!',
  backToScreenplays: 'Szövegkönyvek',
  screenplayAuthor: 'Szerző',
  screenplayRole: 'Szereped',
  loadingScreenplay: 'Betöltés…',

  // Notes view
  notes: 'Jegyzetek',
  notesViewTitle: 'Jegyzetek',
  notesBackToCharacters: 'Vissza a szereplőkhöz',
  addNote: 'Jegyzet hozzáadása',
  notePlaceholder: 'Írd be a jegyzetet...',
  noNotes:
    'Nincs jegyzet. Jelölj ki szöveget a bal oldalon, majd kattints a „Jegyzet hozzáadása” gombra.',
  cancel: 'Mégse',
  save: 'Mentés',
  saving: 'Mentés…',
  editNote: 'Jegyzet szerkesztése',
  deleteNote: 'Törlés',
  deleteNoteConfirm: 'Biztosan törlöd ezt a jegyzetet?',
  notesOnThisLine: 'Jegyzetek ezen a soron',
} as const;

export type TranslationKey = keyof typeof translations;
