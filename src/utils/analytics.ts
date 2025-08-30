import mixpanel from 'mixpanel-browser';

mixpanel.init('aac1d0c262a6a83502187bc9cb31aaac', {
  track_pageview: false,
  debug: true,
  api_host: 'https://api-eu.mixpanel.com',
});

export const analytics = {
  trackLogin: () => {
    mixpanel.track('Login');
  },

  trackCharacterSelected: (characterName: string) => {
    mixpanel.track('Character Selected', {
      name: characterName
    });
  },

  trackCharacterAdvanced: (characterName: string) => {
    mixpanel.track('Character Advanced', {
      name: characterName
    });
  }
}; 
