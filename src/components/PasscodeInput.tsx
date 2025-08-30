import { useState, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { logout, setAuthenticated, setCharacters, setScreenplay } from '../store/appSlice';
import { decryptData, storeAccessData, loadAccessData } from '../utils/encryption';
import { processScreenplayData } from '../utils/screenplay';
import { translations } from '../utils/translations';
import encryptedScreenplayData from '../data/screenplay-encrypted.json';

interface PasscodeInputProps {
  onSuccess: () => void;
}

export function PasscodeInput({ onSuccess }: PasscodeInputProps) {
  const dispatch = useAppDispatch();
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    try {
      const decryptedData = loadAccessData();
      
      if (decryptedData) {
        // We have decrypted data, load it directly
        const screenplayData = JSON.parse(decryptedData);
        const indexedScreenplay = screenplayData.map((item: any, index: number) => ({
          ...item,
          index
        }));
        
        const processedData = processScreenplayData(indexedScreenplay);
        dispatch(setScreenplay(indexedScreenplay));
        dispatch(setCharacters(processedData));
        dispatch(setAuthenticated(true));
        onSuccess();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      dispatch(logout());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Try to decrypt the encrypted screenplay data
      const decryptedData = await decryptData(encryptedScreenplayData, passcode);
      const screenplayData = JSON.parse(decryptedData);
      
      // Add index property to each dialogue item
      const indexedScreenplay = screenplayData.map((item: any, index: number) => ({
        ...item,
        index
      }));
      
      const processedData = processScreenplayData(indexedScreenplay);
      dispatch(setScreenplay(indexedScreenplay));
      dispatch(setCharacters(processedData));
      storeAccessData(decryptedData);
      
      dispatch(setAuthenticated(true));
      setPasscode(passcode);
      
      onSuccess();
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
          <p className="text-gray-600">
            {translations.passcodeInputText}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
              {translations.passcodeInput}
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={translations.passcodeInputPlaceholder}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? translations.passcodeInputLoading : translations.passcodeInputContinue}
          </button>
        </form>
      </div>
    </div>
  );
} 
