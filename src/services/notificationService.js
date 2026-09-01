/**
 * Service de notifications push Web & Rappels d'arrière-plan
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Le navigateur ne supporte pas les notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendLocalNotification = (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options
    });
  }
};

/**
 * Simule les déclencheurs (Triggers) automatiques de notifications :
 * - Tous les jours à 20:00 (Rappel de saisie)
 * - Dimanche (Récapitulatif hebdomadaire)
 */
export const initScheduledNotificationTriggers = () => {
  const isEnabled = localStorage.getItem('notifications_enabled') !== 'false';
  if (!isEnabled) return;

  // Vérifier la permission
  requestNotificationPermission();

  // Planifier la vérification périodique (toutes les minutes)
  if (!window._notificationInterval) {
    window._notificationInterval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const day = now.getDay(); // 0 = Dimanche

      const lastDailyNotif = localStorage.getItem('last_daily_notif');
      const todayStr = now.toDateString();

      // Trigger 1: Rappel quotidien à 20h
      if (hours === 20 && minutes === 0 && lastDailyNotif !== todayStr) {
        sendLocalNotification('💰 Rappel Dépenses Du Soir', {
          body: 'N\'oubliez pas de saisir vos dépenses du jour dans l\'application !',
          tag: 'daily-reminder'
        });
        localStorage.setItem('last_daily_notif', todayStr);
      }

      // Trigger 2: Récapitulatif du Dimanche
      const lastSundayNotif = localStorage.getItem('last_sunday_notif');
      if (day === 0 && hours === 20 && minutes === 0 && lastSundayNotif !== todayStr) {
        sendLocalNotification('📊 Récapitulatif Hebdomadaire', {
          body: 'Votre bilan de la semaine est prêt ! Cliquez pour consulter vos statistiques.',
          tag: 'weekly-recap'
        });
        localStorage.setItem('last_sunday_notif', todayStr);
      }
    }, 60000);
  }
};
