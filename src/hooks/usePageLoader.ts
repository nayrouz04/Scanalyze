//useEffects : declenche du code quand une valeur change
//useState: gere l'etat local loading
import { useEffect, useState } from "react";
//Hook qui retourne la localisation actuelle , permet de detecter les changements de page 
import { useLocation } from "react-router-dom";

//hook personnalisé (duration=500)
export function usePageLoader(duration = 500) {
  //recupere la localisation courante 
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  //quand la page change , active immediatement le loader 
  useEffect(() => {
    setLoading(true);
    //apres duration (500 ms par defaut) , desactive le loader automatiquement 
    const timer = setTimeout(() => setLoading(false), duration);
    //si l'utilisateur navigue vers une page avant la fin du timer , annule l'ancien timr pour eviter des conflits
    return () => clearTimeout(timer);
  }, [location.pathname]);

  //retourne l'etat loading utilisé dans DashboardLayout.tsx
  return loading;
}
