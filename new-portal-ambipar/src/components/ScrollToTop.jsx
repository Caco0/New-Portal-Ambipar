import { useEffect } from "react";
import { useLocation } from "react-router-dom";


// detecta quando uma nova rota é chamada e reseta o scrol para o topo
export default function ScrollToTop(){
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}