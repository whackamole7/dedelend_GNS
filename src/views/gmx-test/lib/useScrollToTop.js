import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useScrollToTop() {
  const history = useNavigate();
  useEffect(() => {
    const unlisten = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unlisten();
    };
  }, [history]);
}
