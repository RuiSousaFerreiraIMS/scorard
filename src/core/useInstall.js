// Deteta o estado de instalação da PWA e expõe uma ação de instalar.
//
// Realidade das plataformas:
// - Android / Chrome desktop: o browser dispara 'beforeinstallprompt'; guardamos
//   o evento e chamamos .prompt() a partir de um botão nosso → instalação real.
// - iPhone / Safari: a Apple NÃO permite instalar por código nem botão. Só há
//   "Partilhar → Adicionar ao ecrã inicial" à mão. Mostramos instruções.
// - Já instalada: corre em display-mode standalone → não mostramos nada.

import { useEffect, useState } from 'react';

export function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function isIOS() {
  const ua = navigator.userAgent || '';
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS recente identifica-se como Mac com toque
  const iPadOS = /Macintosh/i.test(ua) && 'ontouchend' in document;
  return iOSDevice || iPadOS;
}

export function useInstall() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault(); // impede o mini-infobar do Chrome; usamos o nosso botão
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferred) return null;
    deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice?.outcome ?? null; // 'accepted' | 'dismissed'
  };

  return {
    installed,
    canInstall: !!deferred, // botão real (Android / Chrome desktop)
    needsManual: isIOS() && !installed, // iPhone → instruções
    promptInstall,
  };
}
