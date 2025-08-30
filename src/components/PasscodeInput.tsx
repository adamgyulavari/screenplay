import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/appSlice';
import { decryptData } from '../utils/encryption';
import { processScreenplayData } from '../utils/screenplay';
import { translations } from '../utils/translations';
import encryptedScreenplayData from '../data/screenplay-encrypted.json';
import { analytics } from '../utils/analytics';

export function PasscodeInput() {
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Try to decrypt the encrypted screenplay data
      const decryptedData = await decryptData(
        encryptedScreenplayData,
        passcode
      );
      const decryptedApiKeyData = await decryptData(
        {
          encrypted:
            '0bb880260b2632dc8f3439e22b31b17d651532b88539d6164046ee6aa563530baade64d3a52cfe35bc64cf84b0e6eb27',
          salt: '4660ea7a3caaa04d62cb007b5f436b08',
          iv: 'ed44a6756eafd5fbcf86a1cbe553a040',
        },
        passcode
      );
      const screenplayData = JSON.parse(decryptedData);
      const decryptedApiKey = JSON.parse(decryptedApiKeyData);

      // Add index property to each dialogue item
      const indexedScreenplay = screenplayData.map(
        (item: any, index: number) => ({
          ...item,
          index,
        })
      );

      const processedData = processScreenplayData(indexedScreenplay);

      dispatch(
        login({
          apiKey: decryptedApiKey,
          characters: processedData,
          screenplay: indexedScreenplay,
        })
      );
      analytics.trackLogin();
    } catch (error) {
      setError(translations.passcodeInputError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {translations.title}
          </h2>
          <p className="text-gray-600">{translations.passcodeInputText}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="passcode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {translations.passcodeInput}
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={translations.passcodeInputPlaceholder}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? translations.passcodeInputLoading
              : translations.passcodeInputContinue}
          </button>
        </form>
      </div>
    </div>
  );
}
