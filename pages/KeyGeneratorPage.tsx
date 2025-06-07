import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaKey, FaCopy, FaSync, FaCheckCircle, FaExclamationTriangle, FaTextHeight, FaTextWidth, FaHashtag, FaCreativeCommonsPdAlt, FaBrain, FaDesktop } from 'react-icons/fa';
import { useAppContext } from '../contexts/AppContext';
import StyledButton from '../components/shared/StyledButton';
import { PasswordGenerationOptions, AIPasswordStrengthResult } from '../types';

const KeyStrengthBar: React.FC<{ score: number; textLabel: string; colorClass: string; isRTL: boolean }> = ({ score, textLabel, colorClass, isRTL }) => {
  const { theme, translate } = useAppContext();
  const segments = 5;
  const activeSegments = Math.max(1, Math.min(segments, Math.ceil(score))); 

  const strengthColors = [
    'bg-red-500',          // Too Short / Very Weak (score 0)
    'bg-orange-500',       // Weak (score 1)
    'bg-yellow-500',       // Moderate (score 2)
    'bg-lime-500',         // Strong (score 3)
    'bg-green-500',        // Very Strong (score 4)
  ];

  return (
    <div className={`mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-semibold ${colorClass}`}>{translate('keyStrength')}: {textLabel}</span>
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activeSegments}/{segments}</span>
      </div>
      <div className={`flex h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-knoux-dark-bg' : 'bg-gray-300'}`}>
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`w-1/${segments} transition-all duration-300 ease-in-out
                        ${index < activeSegments ? strengthColors[score] : (theme === 'dark' ? 'bg-knoux-dark-bg' : 'bg-gray-300')}
                        ${isRTL ? (index === segments -1 ? 'rounded-r-full' : '') : (index === 0 ? 'rounded-l-full' : '')}
                        ${isRTL ? (index === 0 ? 'rounded-l-full' : '') : (index === segments -1 ? 'rounded-r-full' : '')}
                        `}
            style={{ boxShadow: index < activeSegments ? `0 0 8px ${strengthColors[score]}` : 'none' }}
          ></div>
        ))}
      </div>
    </div>
  );
};


const KeyGeneratorPage: React.FC = () => {
  const { theme, translate, generatePassword: generatePasswordViaContext, addLogEntry, language } = useAppContext();
  
  const [passwordOptions, setPasswordOptions] = useState<PasswordGenerationOptions>({
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });
  const [generatedKey, setGeneratedKey] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [keyStrengthDetails, setKeyStrengthDetails] = useState<{ score: number; labelKey: string; colorClass: string } | null>(null);
  const [usedAISuggestion, setUsedAISuggestion] = useState<string | null>(null);
  const [aiStrengthCheckStatus, setAiStrengthCheckStatus] = useState<'idle' | 'used' | 'fallback' | 'unavailable'>('idle');


  const isRTL = language === 'ar';

  const mapAIScoreToLocal = (aiResult: AIPasswordStrengthResult): { score: number; labelKey: string; colorClass: string; feedback?: string } => {
    let labelKey = 'keyStrengthWeak';
    let colorClass = 'text-orange-400 dark:text-orange-300';
    let feedback = aiResult.feedback?.warning || aiResult.feedback?.suggestions?.join(' ') || '';

    switch (aiResult.score) {
      case 0: labelKey = 'keyStrengthTooShort'; colorClass = 'text-red-400 dark:text-red-300'; break;
      case 1: labelKey = 'keyStrengthWeak'; colorClass = 'text-orange-400 dark:text-orange-300'; break;
      case 2: labelKey = 'keyStrengthModerate'; colorClass = 'text-yellow-400 dark:text-yellow-300'; break;
      case 3: labelKey = 'keyStrengthStrong'; colorClass = 'text-lime-400 dark:text-lime-300'; break;
      case 4: labelKey = 'keyStrengthVeryStrong'; colorClass = 'text-green-400 dark:text-green-300'; break;
    }
    return { score: aiResult.score, labelKey, colorClass, feedback };
  };

  const calculateLocalKeyStrength = useCallback((key: string, options: PasswordGenerationOptions) => {
    if (!key) {
      setKeyStrengthDetails(null);
      return;
    }
    let variety = 0;
    if (options.includeLowercase && /[a-z]/.test(key)) variety++;
    if (options.includeUppercase && /[A-Z]/.test(key)) variety++;
    if (options.includeNumbers && /[0-9]/.test(key)) variety++;
    if (options.includeSymbols && /[^a-zA-Z0-9]/.test(key)) variety++;

    const length = key.length;
    let score = 0;

    if (length < 8) score = 0;
    else if (length < 12) score = 1;
    else if (length < 16) score = 2;
    else score = 3;

    if (variety >= 3) score +=1;
    if (variety === 4 && length >=16) score +=1;
    
    score = Math.min(4, Math.max(0,score)); 

    if (score === 0) setKeyStrengthDetails({ score, labelKey: 'keyStrengthTooShort', colorClass: 'text-red-400 dark:text-red-300'});
    else if (score === 1) setKeyStrengthDetails({ score, labelKey: 'keyStrengthWeak', colorClass: 'text-orange-400 dark:text-orange-300'});
    else if (score === 2) setKeyStrengthDetails({ score, labelKey: 'keyStrengthModerate', colorClass: 'text-yellow-400 dark:text-yellow-300'});
    else if (score === 3) setKeyStrengthDetails({ score, labelKey: 'keyStrengthStrong', colorClass: 'text-lime-400 dark:text-lime-300'});
    else setKeyStrengthDetails({ score, labelKey: 'keyStrengthVeryStrong', colorClass: 'text-green-400 dark:text-green-300'});
  }, []);

  const updateKeyStrength = useCallback(async (key: string, options: PasswordGenerationOptions) => {
    if (!key) {
      setKeyStrengthDetails(null);
      setAiStrengthCheckStatus('idle');
      setUsedAISuggestion(null);
      return;
    }

    if (window.electronAPI?.checkPasswordStrengthAI) {
      try {
        const aiResult = await window.electronAPI.checkPasswordStrengthAI(key);
        if (aiResult && typeof aiResult.score === 'number') { // Basic check for a valid AI result structure
          const mappedStrength = mapAIScoreToLocal(aiResult);
          setKeyStrengthDetails(mappedStrength);
          setUsedAISuggestion(mappedStrength.feedback || null);
          setAiStrengthCheckStatus('used');
          return;
        } else {
           console.warn("AI strength check returned invalid data, falling back to local.", aiResult);
           setAiStrengthCheckStatus('fallback');
        }
      } catch (error) {
        console.warn("AI strength check API call failed, falling back to local:", error);
        setAiStrengthCheckStatus('fallback');
      }
    } else {
      setAiStrengthCheckStatus('unavailable');
    }
    // Fallback to local calculation
    calculateLocalKeyStrength(key, options);
  }, [calculateLocalKeyStrength]);


  const handleGenerateKey = useCallback(async () => {
    if (!passwordOptions.includeLowercase && !passwordOptions.includeUppercase && !passwordOptions.includeNumbers && !passwordOptions.includeSymbols) {
        alert(translate('selectAtLeastOneCharType'));
        return;
    }
    const newKey = await generatePasswordViaContext(passwordOptions);
    setGeneratedKey(newKey);
    setIsCopied(false);
    updateKeyStrength(newKey, passwordOptions); // This will handle AI or local
    addLogEntry({
        operation: 'key_generate',
        details: `Generated a ${passwordOptions.length}-character key.`,
        status: 'success'
    });
  }, [generatePasswordViaContext, passwordOptions, addLogEntry, translate, updateKeyStrength]);

  useEffect(() => {
    handleGenerateKey();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

   useEffect(() => {
    updateKeyStrength(generatedKey, passwordOptions);
  }, [generatedKey, passwordOptions, updateKeyStrength]);


  const handleCopyToClipboard = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2500);
        })
        .catch(err => console.error('Failed to copy key: ', err));
    }
  };

  const handleOptionChange = (option: keyof PasswordGenerationOptions, value: boolean | number) => {
    setPasswordOptions(prev => ({ ...prev, [option]: value }));
  };

  const charSetOptions = [
    { labelKey: 'includeUppercaseWithIcon', key: 'includeUppercase' as keyof PasswordGenerationOptions, icon: <FaTextHeight /> },
    { labelKey: 'includeLowercaseWithIcon', key: 'includeLowercase' as keyof PasswordGenerationOptions, icon: <FaTextWidth /> },
    { labelKey: 'includeNumbersWithIcon', key: 'includeNumbers' as keyof PasswordGenerationOptions, icon: <FaHashtag /> },
    { labelKey: 'includeSymbolsWithIcon', key: 'includeSymbols' as keyof PasswordGenerationOptions, icon: <FaCreativeCommonsPdAlt /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto"
    >
      <div className={`p-6 md:p-8 rounded-xl 
                       ${theme === 'dark' ? 'bg-knoux-dark-surface/80 backdrop-blur-sm border border-knoux-dark-primary/40 shadow-[var(--knoux-glow-secondary-deep)]' 
                                        : 'bg-knoux-light-surface/90 backdrop-blur-sm border border-knoux-light-primary/40 shadow-2xl'}
                        ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <h1 className={`text-3xl md:text-4xl font-bold mb-8 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
          <FaKey className={`text-knoux-dark-primary dark:text-knoux-light-primary text-4xl ${isRTL ? 'ml-4' : 'mr-4'}`} />
          {translate('keyGenerator')}
        </h1>

        <div className={`mb-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-knoux-dark-bg/50' : 'bg-gray-100/70'} border ${theme === 'dark' ? 'border-knoux-dark-primary/30' : 'border-knoux-light-primary/30'} shadow-inner`}>
          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('generatedPassword')}</label>
          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={generatedKey}
              className={`w-full p-4 rounded-lg border font-mono text-xl md:text-2xl tracking-wider truncate neon-focus-ring-primary
                          ${theme === 'dark' ? 'bg-knoux-dark-surface text-gray-100 border-knoux-dark-primary/50' : 'bg-white text-gray-800 border-gray-300'}
                          ${isRTL ? 'rtl:pr-16 ltr:pl-4' : 'ltr:pr-16 rtl:pl-4'}`}
              aria-label={translate('generatedPassword')}
            />
            <StyledButton 
              onClick={handleCopyToClipboard} 
              variant="ghost" 
              size="md" 
              className={`absolute top-1/2 transform -translate-y-1/2 p-3 ${isRTL ? 'left-2' : 'right-2'}`}
              iconLeft={isCopied ? <FaCheckCircle className="text-green-400 dark:text-green-300 text-xl" /> : <FaCopy className="text-lg" />}
              title={isCopied ? translate('copied') : translate('copyPassword')}
            >{''}</StyledButton>
          </div>
          {keyStrengthDetails && (
            <KeyStrengthBar 
                score={keyStrengthDetails.score} 
                textLabel={translate(keyStrengthDetails.labelKey)} 
                colorClass={keyStrengthDetails.colorClass}
                isRTL={isRTL}
            />
          )}
          {usedAISuggestion && (
             <p className={`text-xs mt-1 italic ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Suggestion: {usedAISuggestion}</p>
          )}
          <div className={`text-xs mt-1 flex items-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-700'} ${isRTL ? 'justify-end' : 'justify-start'}`}>
            {aiStrengthCheckStatus === 'used' && <><FaBrain className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{translate('aiStrengthCheckUsed')}</>}
            {aiStrengthCheckStatus === 'fallback' && <><FaDesktop className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{translate('localStrengthCheckUsed')}</>}
            {aiStrengthCheckStatus === 'unavailable' && <><FaDesktop className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{translate('aiStrengthCheckUnavailable')}</>}
          </div>
        </div>

        <div className={`space-y-6 mb-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-knoux-dark-bg/30' : 'bg-gray-50/50'} border ${theme === 'dark' ? 'border-knoux-dark-primary/20' : 'border-knoux-light-primary/20'}`}>
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <label htmlFor="passwordLengthRange" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('passwordLength')}: <span className={`font-semibold ${theme === 'dark' ? 'text-knoux-dark-primary' : 'text-knoux-light-primary'}`}>{passwordOptions.length}</span></label>
            <input
              id="passwordLengthRange"
              type="range"
              min="8"
              max="128"
              step="1"
              value={passwordOptions.length}
              onChange={(e) => handleOptionChange('length', parseInt(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer knoux-slider"
              aria-label={translate('passwordLength')}
            />
          </div>

          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{translate('characterSets')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {charSetOptions.map(opt => (
                <label key={opt.key} className={`flex items-center space-x-3 rtl:space-x-reverse cursor-pointer p-2.5 rounded-md transition-colors 
                                                  ${theme === 'dark' ? 'hover:bg-knoux-dark-bg/70' : 'hover:bg-gray-200/70'}
                                                  ${isRTL ? 'justify-end flex-row-reverse' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!passwordOptions[opt.key]}
                    onChange={(e) => handleOptionChange(opt.key, e.target.checked)}
                    className={`form-checkbox h-5 w-5 rounded transition-colors duration-200
                                  ${theme === 'dark' ? 'text-knoux-dark-primary bg-knoux-dark-surface border-knoux-dark-primary/70 focus:ring-knoux-dark-primary focus:ring-offset-knoux-dark-bg' 
                                                    : 'text-knoux-light-primary bg-gray-100 border-gray-400 focus:ring-knoux-light-primary focus:ring-offset-knoux-light-surface'}`}
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} flex items-center`}>
                    {React.cloneElement(opt.icon, {className: `w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} ${theme === 'dark' ? 'text-knoux-dark-secondary' : 'text-knoux-light-secondary'}`})}
                    {translate(opt.labelKey)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <StyledButton 
            onClick={handleGenerateKey} 
            size="lg" 
            className="w-full py-3.5 text-base"
            iconLeft={<FaSync />}
            variant="primary"
        >
          {translate('generateNewKey')}
        </StyledButton>
      </div>

      <div className={`mt-6 p-4 rounded-lg text-sm flex items-start
                       ${theme === 'dark' ? 'bg-knoux-dark-bg/60 text-gray-400 border border-[var(--knoux-neon-warning)]/30 shadow-[0_0_10px_var(--knoux-neon-warning)]' 
                                        : 'bg-yellow-50/80 text-gray-700 border border-yellow-400/40 shadow-lg'}
                        ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
        <FaExclamationTriangle className={`w-6 h-6 flex-shrink-0 text-yellow-400 dark:text-yellow-300 ${isRTL ? 'ml-3' : 'mr-3'} mt-0.5`} />
        <p>{translate('keyGeneratorDisclaimer')}</p>
      </div>
    </motion.div>
  );
};

export default KeyGeneratorPage;